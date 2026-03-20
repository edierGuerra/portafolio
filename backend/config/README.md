# 📋 Módulo de Configuración del Sistema

> **Punto de entrada centralizado** para todas las configuraciones de la aplicación

## 🎯 ¿Qué es?

El módulo de configuración es el **corazón** de la aplicación. Gestiona todas las configuraciones del sistema (base de datos, autenticación, almacenamiento, email, etc.) desde un único punto, proporcionando:

- ✅ Validación automática al iniciar
- ✅ Caché para mejor rendimiento  
- ✅ Seguridad - oculta secretos
- ✅ Tipado completo
- ✅ Fácil de extender

## 🚀 Inicio Rápido

### 1. Preparar variables de ambiente

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con valores reales
# (Mira los comentarios en .env.example)
```

### 2. En tu código

```python
from config import get_config

# Cargar y validar TODA la configuración
config = get_config()

# Acceder a cualquier configuración
print(config.app.name)
print(config.app.environment)
print(config.database.database_url)
print(config.storage.bucket_name)
```

### 3. En la aplicación FastAPI

```python
# main.py
from config import get_config

config = get_config()

app = FastAPI(
    title=config.app.name,
    version=config.app.version,
    debug=config.app.debug
)
```

## 📁 Archivos del Módulo

| Archivo | Propósito |
|---------|-----------|
| `__init__.py` | Exporta todo lo público |
| `base_settings.py` | Clase base para todas las configuraciones |
| `app_config.py` | **Punto de entrada** - ApplicationConfig |
| `app_settings.py` | Configuración general de la app |
| `auth_config.py` | Autenticación JWT |
| `database_config.py` | Base de datos |
| `storage_config.py` | Almacenamiento (S3/Spaces) |
| `email_config.py` | Email SMTP |

## 📚 Documentación

### Para entender el sistema completo
👉 [**CONFIGURATION.md**](./CONFIGURATION.md) - Guía conceptual y referencia

### Para ver cómo funciona internamente
👉 [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Diagramas y flujos

### Para ver cómo usarlo
👉 [**EXAMPLES.md**](./EXAMPLES.md) - 7 ejemplos prácticos

## 🔑 Configuraciones Principales

### AppSettings - Aplicación general
```env
APP_NAME=Portfolio API
ENVIRONMENT=development  # development | staging | production
DEBUG=true
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
```

### AuthSettings - Autenticación JWT
```env
AUTH_SECRET_KEY=your-secret-key-change-in-production
AUTH_ALGORITHM=HS256
AUTH_ACCESS_TOKEN_TTL=30
AUTH_REFRESH_TOKEN_TTL=7
```

### DatabaseSettings - Base de datos
```env
DATABASE_URL=mysql+aiomysql://user:pass@localhost/portafolio_db
DATABASE_ECHO=true
DATABASE_POOL_SIZE=20
```

### StorageSettings - Almacenamiento (DigitalOcean Spaces)
```env
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=tu-bucket
DO_SPACES_KEY=tu-access-key
DO_SPACES_SECRET=tu-secret-key
DO_SPACES_PUBLIC_URL_BASE=https://tu-bucket.nyc3.digitaloceanspaces.com
```

### EmailSettings - Email SMTP
```env
EMAIL_NOTIFICATIONS_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-password
```

## 💡 Ejemplos de Uso

### En Servicios
```python
from config import get_storage_settings

class FileService:
    def __init__(self):
        config = get_storage_settings()
        if config.is_configured:
            # Usar S3
```

### En Endpoints
```python
from config import get_db

@router.post("/projects")
async def create_project(db: AsyncSession = Depends(get_db)):
    # Acceder a BD
```

### En Dependencias
```python
from config import get_auth_settings

auth_config = get_auth_settings()
```

Ver [**EXAMPLES.md**](./EXAMPLES.md) para 7 ejemplos completos.

## ⚙️ Patrón de Configuración

Cada configuración sigue el mismo patrón:

```python
from dataclasses import dataclass
from functools import lru_cache
from config.base_settings import BaseSettings

@dataclass(frozen=True)
class MySettings(BaseSettings):
    """Documentación clara"""
    field1: str
    field2: int
    
    def validate(self) -> None:
        """Validaciones personalizadas"""
        if not self.field1:
            raise ValueError("field1 es requerido")

@lru_cache
def get_my_settings() -> MySettings:
    return MySettings(
        field1=MySettings._load_from_env("MY_FIELD1", "default"),
        field2=MySettings._load_env_int("MY_FIELD2", 10),
    )
```

## 🔒 Seguridad

Los secretos nunca aparecen en logs/debug:

```python
config = get_config()

# Seguro - secreto oculto
print(config)  # ← secret_key="***"
print(config.to_dict())  # ← secret_key="***"
print(config.display_configuration())  # ← sin secretos

# NO SEGURO - evitar
print(config.auth.secret_key)  # ← expone el secreto
```

## 🆘 Troubleshooting

### "AUTH_SECRET_KEY es requerido"
```bash
# Generar clave segura
openssl rand -hex 32  # Linux/Mac
python -c "import secrets; print(secrets.token_hex(32))"  # Windows

# Agregar a .env
AUTH_SECRET_KEY=<valor-generado>
```

### "DATABASE_URL inválido"
```env
# Formatos válidos:
DATABASE_URL=mysql+aiomysql://user:pass@localhost/db
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
DATABASE_URL=sqlite+aiosqlite:///./test.db
```

### Variables no se cargan
Verificar:
1. Archivo `.env` existe en `backend/`
2. Variable está en el `.env`
3. Sin caracteres especiales sin escapar
4. Sin espacios alrededor del `=`

## 🔌 Agregar Nueva Configuración

1. Crear `backend/config/my_feature_config.py`
2. Agregar campo a `ApplicationConfig` en `app_config.py`
3. Exportar en `__init__.py`
4. Agregar variables a `.env.example`

Ver [**CONFIGURATION.md**](./CONFIGURATION.md) sección "Extensión del Sistema".

## 📖 Referencia Rápida

```python
from config import get_config, reset_config

# Cargar (una sola vez - cacheado)
config = get_config()

# Acceder
config.app.name                 # str
config.app.environment.value    # "development"
config.app.is_production        # bool
config.auth.secret_key          # str (*** en logs)
config.database.database_url    # str
config.storage.is_configured    # bool
config.email.is_fully_configured()  # bool

# Chequear status
config.get_status()  # dict con estado

# Display (no expone secretos)
print(config.display_configuration())

# Reset (solo para tests)
reset_config()
```

## 📚 Para Aprender Más

| Recurso | Contenido |
|---------|-----------|
| [CONFIGURATION.md](./CONFIGURATION.md) | Guía conceptual (10 secciones) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diagramas, flujos, arquitectura |
| [EXAMPLES.md](./EXAMPLES.md) | 7 ejemplos prácticos |
| [.env.example](./.env.example) | Lista completa de variables |
| `base_settings.py` | Implementación base |

---

**¿Duda?** Consulta [CONFIGURATION.md](./CONFIGURATION.md) - Tiene respuestas para todo.
