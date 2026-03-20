# 🎓 Ejemplos Prácticos: Cómo Usar el Módulo de Configuración

## 1️⃣ Ejemplo: Inicializar la Aplicación

### `backend/main.py`

```python
"""
Punto de entrada de la aplicación FastAPI.
Carga y valida la configuración centralizada.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_config
from config import Base, get_db, get_engine, get_session_maker
import models  # Esto importa todos los modelos para que se registren con Base
from endpoints import (
    projects_router,
    blog_router,
    auth_router,
    # ... otros routers
)


# ============================================================================
# LIFESPAN: Inicializar y cerrar recursos
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager para inicializar base de datos al iniciar
    y cerrar conexiones al detener.
    """
    # Startup
    print("🚀 Inicializando aplicación...")
    
    # Cargar y validar TODA la configuración
    config = get_config()
    
    # Mostrar configuración (útil para debugging)
    print(config.display_configuration())
    
    # Inicializar engine y sessionmaker
    engine = get_engine()
    
    # Crear todas las tablas (si no existen)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Base de datos inicializada")
    
    yield  # App ejecutándose
    
    # Shutdown
    print("🛑 Deteniendo aplicación...")
    await engine.dispose()
    print("✅ Recursos liberados")


# ============================================================================
# CREAR APP FASTAPI
# ============================================================================

config = get_config()

app = FastAPI(
    title=config.app.name,
    version=config.app.version,
    description="API del portafolio personal",
    debug=config.app.debug,
    # En producción, ocultar documentación
    docs_url="/api/docs" if not config.app.is_production else None,
    redoc_url="/api/redoc" if not config.app.is_production else None,
    openapi_url="/api/openapi.json" if not config.app.is_production else None,
    lifespan=lifespan,
)


# ============================================================================
# MIDDLEWARE: CORS
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.app.cors_origins,
    allow_credentials=config.app.cors_allow_credentials,
    allow_methods=config.app.cors_allow_methods,
    allow_headers=config.app.cors_allow_headers,
)


# ============================================================================
# INCLUIR ROUTERS
# ============================================================================

app.include_router(projects_router)
app.include_router(blog_router)
app.include_router(auth_router)
# ... incluir otros routers


# ============================================================================
# RUTAS BÁSICAS
# ============================================================================

@app.get("/health")
async def health_check():
    """Verificar que la app está viva."""
    return {
        "status": "healthy",
        "app": config.app.name,
        "version": config.app.version,
        "environment": config.app.environment.value,
    }


@app.get("/config/status")
async def config_status():
    """Mostrar estado de todas las configuraciones (sin exponer secretos)."""
    return config.get_status()


if __name__ == "__main__":
    import uvicorn
    
    # Ejecutar con configuración
    uvicorn.run(
        "main:app",
        host=config.app.host,
        port=config.app.port,
        workers=config.app.workers if config.app.is_production else 1,
        reload=not config.app.is_production,
        log_level=config.app.log_level.lower(),
    )
```

---

## 2️⃣ Ejemplo: Usar en un Servicio

### `backend/services/object_storage_service.py`

```python
"""
Servicio para interactuar con DigitalOcean Spaces.
Usa la configuración centralizada.
"""
from typing import Optional
from config import get_storage_settings
import boto3
from botocore.exceptions import ClientError


class ObjectStorageService:
    """Servicio para subir/descargar/eliminar archivos en Spaces."""
    
    def __init__(self):
        """Inicializar con configuración cacheada."""
        self.config = get_storage_settings()
        self._client = None
    
    @property
    def client(self):
        """Cliente S3 lazily initialized."""
        if self._client is None:
            if not self.config.is_configured:
                raise ValueError(
                    "Almacenamiento no configurado. "
                    "Verificar variables de ambiente DO_SPACES_*"
                )
            
            self._client = boto3.client(
                "s3",
                endpoint_url=self.config.endpoint_url,
                region_name=self.config.region,
                aws_access_key_id=self.config.access_key,
                aws_secret_access_key=self.config.secret_key,
            )
        return self._client
    
    def upload_file(
        self,
        filename: str,
        data: bytes,
        folder: str = "uploads"
    ) -> str:
        """
        Subir un archivo a Spaces.
        
        Args:
            filename: Nombre del archivo
            data: Contenido del archivo
            folder: Carpeta dentro del bucket
        
        Returns:
            URL pública del archivo
        
        Raises:
            ValueError: Si almacenamiento no configurado
            ClientError: Si falla la subida
        """
        if not self.config.is_configured:
            raise ValueError("Almacenamiento no configurado")
        
        # Construir ruta del objeto
        base_path = self.config.base_path
        if base_path:
            object_key = f"{base_path}/{folder}/{filename}"
        else:
            object_key = f"{folder}/{filename}"
        
        try:
            # Subir archivo
            self.client.put_object(
                Bucket=self.config.bucket_name,
                Key=object_key,
                Body=data,
                ACL=self.config.object_acl,
            )
            
            # Retornar URL pública
            return self.config.get_object_url(object_key)
        
        except ClientError as e:
            raise Exception(f"Error subiendo archivo: {str(e)}")
    
    def delete_file(self, object_key: str) -> bool:
        """Eliminar un archivo de Spaces."""
        if not self.config.is_configured:
            raise ValueError("Almacenamiento no configurado")
        
        try:
            self.client.delete_object(
                Bucket=self.config.bucket_name,
                Key=object_key,
            )
            return True
        except ClientError as e:
            raise Exception(f"Error eliminando archivo: {str(e)}")
    
    def generate_signed_url(
        self,
        object_key: str,
        expiration: Optional[int] = None
    ) -> str:
        """
        Generar URL firmada (acceso temporal a archivo privado).
        
        Args:
            object_key: Clave del objeto
            expiration: Tiempo de expiración en segundos
                       (default: del config)
        
        Returns:
            URL firmada
        """
        if not self.config.is_configured:
            raise ValueError("Almacenamiento no configurado")
        
        if expiration is None:
            expiration = self.config.default_signed_url_ttl
        
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.config.bucket_name,
                    "Key": object_key,
                },
                ExpiresIn=expiration,
            )
            return url
        except ClientError as e:
            raise Exception(f"Error generando URL: {str(e)}")


# Instancia global (patrón singleton)
_storage_service = None

def get_storage_service() -> ObjectStorageService:
    """Obtener la instancia del servicio de almacenamiento."""
    global _storage_service
    if _storage_service is None:
        _storage_service = ObjectStorageService()
    return _storage_service
```

---

## 3️⃣ Ejemplo: Usar en un Endpoint

### `backend/endpoints/projects_endpoint.py`

```python
"""
Endpoints para CRUD de proyectos con subida de imágenes.
Usa configuración centralizada para almacenamiento.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from config import get_auth_settings
from repositories.project_repository import ProjectRepository
from schemas.projects import ProjectCreate, ProjectUpdate
from services.object_storage_service import get_storage_service
from endpoints.dependencies import require_authenticated_user


router = APIRouter(
    prefix="/projects",
    tags=["projects"],
)

# Obtener configuración una sola vez
auth_config = get_auth_settings()


@router.get("/")
async def list_projects(db: AsyncSession = Depends(get_db)):
    """Listar todos los proyectos."""
    repo = ProjectRepository(db)
    projects = await repo.get_all()
    return projects


@router.post("/")
async def create_project(
    project: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(require_authenticated_user),
):
    """Crear un nuevo proyecto (solo admin)."""
    repo = ProjectRepository(db)
    return await repo.create(project)


@router.post("/{project_id}/upload-image")
async def upload_project_image(
    project_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user = Depends(require_authenticated_user),
):
    """
    Subir imagen para un proyecto.
    Usa el servicio de almacenamiento con config centralizada.
    """
    # Validar proyecto existe
    repo = ProjectRepository(db)
    project = await repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Leer contenido del archivo
    content = await file.read()
    
    # Validar tamaño
    storage_config = get_storage_service().config
    if len(content) > storage_config.max_upload_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Archivo muy grande. Máximo: {storage_config.max_upload_bytes} bytes"
        )
    
    try:
        # Subir a Spaces
        storage = get_storage_service()
        image_url = storage.upload_file(
            filename=f"project_{project_id}_{file.filename}",
            data=content,
            folder="project-images"
        )
        
        # Actualizar proyecto con nueva imagen
        await repo.update(project_id, {"image": image_url})
        
        return {"image_url": image_url}
    
    except ValueError as e:
        # Almacenamiento no configurado
        raise HTTPException(
            status_code=503,
            detail=f"Servicio de almacenamiento no disponible: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error subiendo imagen: {str(e)}"
        )


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    user = Depends(require_authenticated_user),
):
    """Eliminar un proyecto."""
    repo = ProjectRepository(db)
    return await repo.delete(project_id)
```

---

## 4️⃣ Ejemplo: Usar en Dependencias

### `backend/endpoints/dependencies.py`

```python
"""
Dependencias inyectables para FastAPI.
Usan configuración centralizada.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db, get_auth_settings
from services.auth_service import AuthService


security = HTTPBearer(auto_error=False)
auth_config = get_auth_settings()  # Cache
auth_service = AuthService()


def extract_bearer_token(
    credentials: Optional[HTTPAuthorizationCredentials]
) -> str:
    """Extraer token JWT del header Authorization."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado - Token no proporcionado"
        )
    return credentials.credentials


async def require_authenticated_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """
    Dependencia para rutas que requieren autenticación.
    Usa la configuración cache de autenticación.
    """
    token = extract_bearer_token(credentials)
    
    try:
        # El servicio de auth usa get_auth_settings() internamente
        user = await auth_service.get_current_user(db=db, token=token)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


async def require_admin(
    user = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Dependencia para rutas que requieren permisos de admin."""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador"
        )
    return user
```

---

## 5️⃣ Ejemplo: Email Service

### `backend/services/email_service.py`

```python
"""
Servicio de envío de emails.
Usa configuración centralizada y es opcional.
"""
from typing import Optional, List
from config import get_email_settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class EmailService:
    """Servicio para enviar emails vía SMTP."""
    
    def __init__(self):
        """Inicializar con configuración emails."""
        self.config = get_email_settings()
    
    def is_available(self) -> bool:
        """Verificar si el servicio de email está disponible."""
        return self.config.is_fully_configured()
    
    def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """
        Enviar un email.
        
        Si email no está configurado, retorna False sin error.
        
        Args:
            to: Email destino
            subject: Asunto
            html_content: Contenido HTML
            text_content: Contenido texto (opcional)
        
        Returns:
            True si se envió, False si no disponible
        """
        # Verificar que email está habilitado
        if not self.config.enabled:
            print(f"Email de notificación: {subject} (EMAIL NO HABILITADO)")
            return False
        
        if not self.is_available():
            print(f"Email no configurado completamente. Omitiendo: {subject}")
            return False
        
        try:
            # Crear mensaje
            message = MIMEMultipart("alternative")
            message["From"] = self.config.from_email
            message["To"] = to
            message["Subject"] = subject
            
            # Agregar versión texto
            if text_content:
                message.attach(MIMEText(text_content, "plain"))
            
            # Agregar versión HTML
            message.attach(MIMEText(html_content, "html"))
            
            # Conectar y enviar
            if self.config.use_ssl:
                server = smtplib.SMTP_SSL(self.config.host, self.config.port)
            else:
                server = smtplib.SMTP(self.config.host, self.config.port)
            
            if self.config.use_tls:
                server.starttls()
            
            server.login(self.config.username, self.config.password)
            server.send_message(message)
            server.quit()
            
            print(f"✅ Email enviado a {to}: {subject}")
            return True
        
        except Exception as e:
            print(f"❌ Error enviando email: {str(e)}")
            return False
    
    def send_admin_notification(
        self,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Enviar email al administrador."""
        if not self.config.admin_notification_email:
            print(f"Admin email no configurado. Omitiendo: {subject}")
            return False
        
        return self.send_email(
            to=self.config.admin_notification_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )


# Instancia global
_email_service = None

def get_email_service() -> EmailService:
    """Obtener instancia del servicio de email."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
```

---

## 6️⃣ Ejemplo: Tests

### `backend/tests/test_configuration.py`

```python
"""
Tests para verificar que la configuración es correcta.
"""
import pytest
from config import get_config, reset_config
from config import (
    get_app_settings,
    get_auth_settings,
    get_database_settings,
    get_storage_settings,
    get_email_settings,
)


@pytest.fixture(autouse=True)
def reset_config_after_test():
    """Reset configuración después de cada test."""
    yield
    reset_config()


def test_app_config_loads():
    """Verificar que la configuración app se carga correctamente."""
    config = get_config()
    assert config.app is not None
    assert config.app.name == "Portfolio API"
    assert config.app.is_development or config.app.is_production


def test_auth_config_required_fields():
    """Verificar que autenticación tiene campos requeridos."""
    auth = get_auth_settings()
    assert auth.secret_key  # No debería estar vacío
    assert auth.algorithm == "HS256"
    assert auth.access_token_ttl_minutes > 0


def test_database_config_url_valid():
    """Verificar que URL de BD es válida."""
    db = get_database_settings()
    assert db.database_url
    assert db.database_url.startswith(("mysql+", "postgresql+", "sqlite"))


def test_storage_optional_when_not_configured():
    """Verificar que almacenamiento es opcional."""
    storage = get_storage_settings()
    # Storage puede no estar configurado
    if storage.endpoint_url:
        assert storage.is_configured


def test_email_optional_when_disabled():
    """Verificar que email es opcional si está deshabilitado."""
    email = get_email_settings()
    # Email puede estar deshabilitado
    if email.enabled:
        assert email.is_fully_configured()


def test_config_cached():
    """Verificar que la configuración se cachea."""
    config1 = get_config()
    config2 = get_config()
    assert config1 is config2  # Misma instancia


def test_secrets_hidden_in_dict():
    """Verificar que los secretos se ocultan."""
    auth = get_auth_settings()
    auth_dict = auth.to_dict()
    
    # secret_key debe estar oculto
    assert auth_dict["secret_key"] == "***" or auth_dict["secret_key"] is None


def test_config_display_string():
    """Verificar que display_configuration no expone secretos."""
    config = get_config()
    display = config.display_configuration()
    
    # No debería contener la clave secreta real
    assert "***" in display or "Habilitado" in display
```

---

## 7️⃣ Ejemplo: Desarrollar Localmente

### Archivo `.env` para desarrollo

```env
# .env - NUNCA commitear este archivo

# Aplicación
ENVIRONMENT=development
DEBUG=true
PORT=8000

# Autenticación
AUTH_SECRET_KEY="dev-key-no-es-seguro"

# Base de datos local
DATABASE_URL="mysql+aiomysql://root:password@localhost/portafolio_db"
DATABASE_ECHO=true

# Spaces / S3 (opcional en desarrollo)
# DO_SPACES_ENDPOINT=""
# DO_SPACES_BUCKET=""

# Email (deshabilitado en desarrollo)
EMAIL_NOTIFICATIONS_ENABLED=false
```

### Ejecutar aplicación

```bash
cd backend

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# o
.venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
python main.py

# Logs esperados:
# 🚀 Inicializando aplicación...
# ============================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================================
#   Aplicación: Portfolio API v1.0.0
#   Ambiente: development
#   Debug: true
#   URL Base: http://0.0.0.0:8000
#   ...
# ✅ Base de datos inicializada
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Resumen de Buenas Prácticas

✅ **Siempre usar `get_config()`** para acceder a configuración  
✅ **Confiar en el caché** - No reinicializar la configuración  
✅ **Validar al iniciar** - `get_config()` lanza error si config inválida  
✅ **Servicios opcionales** - Email/Storage pueden no estar configurados  
✅ **Nunca commitear `.env`** - Solo `.env.example`  
✅ **Ocultar secretos en logs** - `config.to_dict()` y `str(config)`  
✅ **Extender fácilmente** - Seguir el patrón de BaseSettings  
✅ **Testear configuración** - Resetear entre tests  
