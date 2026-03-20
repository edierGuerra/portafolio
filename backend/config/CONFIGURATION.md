# 📋 Documentación del Módulo de Configuración

## 📚 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Componentes Principales](#componentes-principales)
4. [Patrón de Configuración](#patrón-de-configuración)
5. [Cómo Usar](#cómo-usar)
6. [Variables de Ambiente](#variables-de-ambiente)
7. [Validación](#validación)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [Extensión del Sistema](#extensión-del-sistema)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visión General

El módulo de configuración es el **corazón centralizado** de la aplicación. Gestiona todas las configuraciones del sistema desde un único punto, proporcionando:

✅ **Validación automática** de configuraciones al iniciar  
✅ **Caché de configuración** para mejor rendimiento  
✅ **Separación clara** de responsabilidades  
✅ **Seguridad** - oculta secretos en logs/debug  
✅ **Facilidad** para extender con nuevas configuraciones  
✅ **Tipado completo** con TypeScript/Python types  
✅ **Compatible** con desarrollo local y producción  

---

## 📁 Estructura de Carpetas

```
backend/config/
├── __init__.py                  # Exportaciones públicas
├── base_settings.py             # Clase base reutilizable
├── app_config.py                # Configuración centralizada (PUNTO DE ENTRADA)
├── app_settings.py              # Configuración de la aplicación
├── auth_config.py               # Configuración de autenticación JWT
├── database_config.py           # Configuración de base de datos
├── storage_config.py            # Configuración de almacenamiento (S3/Spaces)
└── email_config.py              # Configuración de email

.env                             # Variables locales (gitignored)
.env.example                     # Ejemplo de variables (versionado)
```

---

## 🔧 Componentes Principales

### 1. **BaseSettings** (`base_settings.py`)
Clase base para todas las configuraciones. Proporciona:
- Carga automática de `.env`
- Conversión de tipos (`_load_env_bool`, `_load_env_int`, etc.)
- Validación por defecto
- Método `to_dict()` que oculta secretos

```python
@dataclass(frozen=True)
class BaseSettings:
    """Base para todas las configuraciones del sistema"""
    
    @classmethod
    def _load_from_env(cls, env_var: str, default: Any = None) -> str:
        """Carga una variable de ambiente"""
        
    def validate(self) -> None:
        """Valida que la configuración sea válida"""
        
    def is_fully_configured(self) -> bool:
        """Verifica si está completamente configurada"""
```

### 2. **ApplicationConfig** (`app_config.py`)
**Punto de entrada centralizado** que agrupa todas las configuraciones:

```python
@dataclass
class ApplicationConfig:
    """Contenedor de todas las configuraciones"""
    app: AppSettings
    auth: AuthSettings
    database: DatabaseSettings
    storage: StorageSettings
    email: EmailSettings
```

### 3. **Configuraciones Específicas**

#### AppSettings (`app_settings.py`)
- Nombre, versión, ambiente de la aplicación
- Puertos, hosts, logging
- Configuración de CORS

#### AuthSettings (`auth_config.py`)
- Clave secreta JWT
- Algoritmos de encriptación
- TTL de tokens

#### DatabaseSettings (`database_config.py`)
- URL de conexión
- Pool size, configuración de conexiones
- Echo de queries

#### StorageSettings (`storage_config.py`)
- Configuración de DigitalOcean Spaces
- S3 compatible
- URLs públicas, ACLs

#### EmailSettings (`email_config.py`)
- Configuración SMTP
- Activación/desactivación
- Validación de TLS/SSL

---

## 🎨 Patrón de Configuración

Cada configuración sigue el mismo patrón coherente:

```python
from dataclasses import dataclass
from functools import lru_cache
from config.base_settings import BaseSettings

@dataclass(frozen=True)
class MySettings(BaseSettings):
    """Documentación clara de la configuración"""
    field1: str
    field2: int
    field3: bool
    
    def is_fully_configured(self) -> bool:
        """Lógica personalizada si es necesario"""
        return bool(self.field1 and self.field2 > 0)
    
    def validate(self) -> None:
        """Validación personalizada"""
        if not self.is_fully_configured():
            raise ValueError("Configuración incompleta")

@lru_cache
def get_my_settings() -> MySettings:
    """Se ejecuta UNA SOLA VEZ y cachea el resultado"""
    settings = MySettings(
        field1=MySettings._load_from_env("MY_FIELD1", "default"),
        field2=MySettings._load_env_int("MY_FIELD2", default=10),
        field3=MySettings._load_env_bool("MY_FIELD3", default=False),
    )
    settings.validate()
    return settings
```

### ¿Por qué este patrón?

✅ **Dataclass**: Tipado fuerte, serializable, `frozen` = inmutable  
✅ **lru_cache**: Se carga UNA SOLA VEZ, mejor rendimiento  
✅ **BaseSettings**: Reutilización, DRY principle  
✅ **validate()**: Fail-fast al iniciar la app  
✅ **Conversión automática**: `_load_env_bool`, `_load_env_int`  

---

## 📖 Cómo Usar

### En `main.py` - Inicializar la aplicación

```python
from fastapi import FastAPI
from config import get_config

# Cargar y validar TODA la configuración
config = get_config()

# Mostrar configuración (para debugging)
print(config.display_configuration())

# Crear la app FastAPI
app = FastAPI(
    title=config.app.name,
    version=config.app.version,
    debug=config.app.debug,
    docs_url="/api/docs" if not config.app.is_production else None,
)

# Aplicar configuración de CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.app.cors_origins,
    allow_credentials=config.app.cors_allow_credentials,
    allow_methods=config.app.cors_allow_methods,
    allow_headers=config.app.cors_allow_headers,
)
```

### En servicios - Acceder a configuraciones

```python
from config import get_storage_settings

class ObjectStorageService:
    def __init__(self):
        self.config = get_storage_settings()
    
    def upload_file(self, filename: str, data: bytes):
        if not self.config.is_configured:
            raise ValueError("Almacenamiento no configurado")
        
        # Usar self.config...
```

### En endpoints - Usar autenticación

```python
from config import get_auth_settings
from endpoints.dependencies import require_authenticated_user

auth_config = get_auth_settings()

router = APIRouter()

@router.post("/admin/data")
async def admin_only(
    user = Depends(require_authenticated_user)
):
    return {"message": "Solo para admins"}
```

---

## 🔐 Variables de Ambiente

### Carga de `.env`

1. **Copia el archivo de ejemplo**:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edita valores según tu entorno**:
   ```env
   ENVIRONMENT=development
   DATABASE_URL=mysql+aiomysql://user:pass@localhost/db
   AUTH_SECRET_KEY=your-secret-here
   ```

3. **Nunca commitees `.env` a Git**:
   ```
   .env es .gitignored
   .env.example SÍ está versionado
   ```

### Sistema de carga

```python
def _load_env_file() -> None:
    """
    1. Lee .env del backend/
    2. Carga solo variables NO definidas en el sistema
    3. Se ejecuta automáticamente en BaseSettings
    """
    env_path = Path(__file__).resolve().parents[1] / ".env"
    # ...carga...
```

**Prioridad**:
1. Variables del sistema (más alta prioridad)
2. Variables en `.env`
3. Valores por defecto en el código

---

## ✅ Validación

### Validación Automática

```python
# Al iniciar la app, TODAS las configuraciones se validan
config = get_config()  # ← Si hay error, falla aquí

# Si llega aquí, el 100% de la configuración es válida
```

### Validación Personalizada

Cada configuración puede implementar `validate()`:

```python
@dataclass(frozen=True)
class DatabaseSettings(BaseSettings):
    database_url: str
    
    def validate(self) -> None:
        if not self.database_url.startswith(("mysql+", "postgresql+")):
            raise ValueError("Database URL debe ser MySQL o PostgreSQL")
```

### Validación Parcial

```python
# Algunos servicios son opcionales (email)
if config.email.is_fully_configured():
    # Enviar email...
else:
    # Loguear y continuar
    logger.warning("Email no configurado, omitiendo notificación")
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Desarrollo Local

```env
# .env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=mysql+aiomysql://root:password@localhost/portafolio_db
AUTH_SECRET_KEY=dev-key-no-security
DO_SPACES_ENDPOINT=
EMAIL_NOTIFICATIONS_ENABLED=false
```

### Ejemplo 2: Producción

```env
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=mysql+aiomysql://user:$(openssl rand -hex 16)@prod-db.azure.com/portafolio
AUTH_SECRET_KEY=$(openssl rand -hex 32)
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=prod-key
DO_SPACES_SECRET=$(openssl rand -hex 32)
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
```

### Ejemplo 3: Testing

```python
from config import reset_config, get_config

def test_something():
    # Resetear configuración
    reset_config()
    
    # Las siguientes llamadas cargarán nuevos valores
    config = get_config()
    
    assert config.app.is_development == True
```

---

## 🔌 Extensión del Sistema

### Agregar una nueva configuración

1. **Crear el archivo** `backend/config/my_feature_config.py`:

```python
from dataclasses import dataclass
from functools import lru_cache
from config.base_settings import BaseSettings

@dataclass(frozen=True)
class MyFeatureSettings(BaseSettings):
    """Documentación clara"""
    enabled: bool
    option1: str
    option2: int
    
    def validate(self) -> None:
        if self.enabled and not self.option1:
            raise ValueError("option1 es requerido si enabled=true")

@lru_cache
def get_my_feature_settings() -> MyFeatureSettings:
    settings = MyFeatureSettings(
        enabled=MyFeatureSettings._load_env_bool("MY_FEATURE_ENABLED"),
        option1=MyFeatureSettings._load_from_env("MY_FEATURE_OPTION1", ""),
        option2=MyFeatureSettings._load_env_int("MY_FEATURE_OPTION2", 0),
    )
    settings.validate()
    return settings
```

2. **Agregar a `ApplicationConfig`** en `app_config.py`:

```python
@dataclass
class ApplicationConfig:
    app: AppSettings
    auth: AuthSettings
    # ...
    my_feature: MyFeatureSettings  # ← Agregar

@lru_cache(maxsize=1)
def get_config() -> ApplicationConfig:
    config = ApplicationConfig(
        # ...
        my_feature=get_my_feature_settings(),  # ← Agregar
    )
    # ...
```

3. **Exportar en `__init__.py`**:

```python
from config.my_feature_config import MyFeatureSettings, get_my_feature_settings

__all__ = [
    # ...
    "MyFeatureSettings",
    "get_my_feature_settings",
]
```

4. **Agregar variables al `.env.example`**:

```env
# ============================================================================
# MY FEATURE
# ============================================================================
MY_FEATURE_ENABLED=false
MY_FEATURE_OPTION1="default-value"
MY_FEATURE_OPTION2=100
```

---

## 🆘 Troubleshooting

### Problema: "AUTH_SECRET_KEY es requerido"

**Solución**: Agregar a `.env`:
```env
AUTH_SECRET_KEY=$(openssl rand -hex 32)
```

### Problema: "DATABASE_URL inválido"

**Solución**: Verificar formato. Ejemplos válidos:
```env
# MySQL
DATABASE_URL=mysql+aiomysql://user:pass@localhost/dbname

# PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/dbname

# SQLite
DATABASE_URL=sqlite+aiosqlite:///./test.db
```

### Problema: "CORS_ORIGINS vacío"

**Solución**: Configurar orígenes:
```env
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

### Problema: Variables no se cargan

**Verificar orden**:
1. ¿Archivo `.env` existe en `backend/`?
2. ¿La variable está en el `.env`?
3. ¿Se ejecutó `reset_config()` antes en tests?
4. ¿Hay variable del sistema sobrescribiendo?

---

## 🏗️ Arquitectura de Dependencias

```
┌─────────────────────────────┐
│    main.py - Punto Inicio   │
│  config = get_config()      │
└──────────────┬──────────────┘
               │
        ┌──────▼─────────┐
        │  ApplicationConfig
        │  (Contenedor)
        └──────────────────┘
               │
      ┌────────┼────────┬────────┬──────────┐
      │        │        │        │          │
      ▼        ▼        ▼        ▼          ▼
   AppSettings AuthSettings DatabaseSettings StorageSettings EmailSettings
      │        │        │        │          │
      └────────┴────────┴────────┴──────────┘
                   │
           ┌───────▼───────┐
           │  BaseSettings  │
           │  (utilidades)  │
           └────────────────┘
```

---

## 📝 Resumen

| Aspecto | Descripción |
|---------|-------------|
| **Punto de entrada** | `from config import get_config` |
| **Carga una sola vez** | Caché con `@lru_cache` |
| **Validación** | Automática al iniciar |
| **Seguridad** | Oculta secretos en logs |
| **Extensible** | Patrón claro para agregar nuevas configs |
| **Tipado** | 100% TypeScript/Python types |
| **Variables** | `.env` con `.env.example` |
| **Desarrollo** | Local con valores por defecto |
| **Producción** | Requiere configuración completa |

---

## 🔗 Ver También

- [`.env.example`](./.env.example) - Todas las variables disponibles
- [`base_settings.py`](./base_settings.py) - Clase base reutilizable
- [`app_config.py`](./app_config.py) - Configuración centralizada
- `backend/main.py` - Uso en la aplicación
