# 🏗️ Arquitectura y Flujo del Módulo de Configuración

## 📊 Flujo de Inicialización de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Aplicación inicia (main.py)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Import: from config import get_config                    │
│    ↓ Ejecuta __init__.py de config/                         │
│    ↓ Carga todos los módulos de configuración               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. get_config() es llamado                                  │
│    ↓ @lru_cache asegura que se ejecuta UNA SOLA VEZ        │
│    ↓ Carga ApplicationConfig con todas las configuraciones  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌─────────┐ ┌─────────┐ ┌──────────────┐
    │ .env    │ │ System  │ │ Env Vars     │
    │ file    │ │ Environ │ │ (defaults)   │
    └────┬────┘ └────┬────┘ └──────┬───────┘
         │           │             │
         └───────────┼─────────────┘
                     │ _load_from_env()
                     │ _load_env_bool()
                     │ _load_env_int()
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. BaseSettings carga y convierte variables                 │
│    - Parsea tipos automáticamente                           │
│    - Aplica valores por defecto                             │
│    - Oculta secretos                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────────────────────────────────┐
   │ 5. Cada Setting valida() su config  │
   │    - AppSettings.validate()         │
   │    - AuthSettings.validate()        │
   │    - DatabaseSettings.validate()   │
   │    - StorageSettings.validate()    │
   │    - EmailSettings.validate()      │
   └────────────────┬────────────────────┘
                    │
                    ├─ Si ALGUNO FALLA ──▶ ❌ app.exit(1)
                    │
                    └─ Si TODO OK ──▶ ✅ ApplicationConfig
                                        (configuración válida)
                                            │
                                            ▼
                            ┌──────────────────────────────┐
                            │ app = FastAPI(               │
                            │   config.app.name,           │
                            │   debug=config.app.debug     │
                            │ )                            │
                            │                              │
                            │ app.add_middleware(CORS,     │
                            │   origins=config.cors_...    │
                            │ )                            │
                            └──────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de una Configuración Individual

```
┌──────────────────────────────────────────────────┐
│ Configuración: StorageSettings                   │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ @dataclass(frozen=True)    │
    │ class StorageSettings(     │
    │     BaseSettings           │
    │ ):                         │
    └────────────┬───────────────┘
                 │
        ┌────────┼────────┬──────────┐
        │        │        │          │
        ▼        ▼        ▼          ▼
    ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
    │ ep   │ │ buck │ │ key  │ │ secret   │
    │ url  │ │ name │ │      │ │ (oculto) │
    └──────┘ └──────┘ └──────┘ └──────────┘
        │        │        │          │
        └────────┴────────┴──────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ get_storage_settings()      │
    │ @lru_cache                  │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ StorageSettings(...         │
    │   endpoint=_load_from_env() │
    │   bucket=_load_from_env()   │
    │   key=_load_from_env()      │
    │   secret=_load_from_env()   │
    │ )                           │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ settings.validate()         │
    │                             │
    │ - Check is_configured       │
    │ - Check ACL values          │
    │ - Check TTL > 0             │
    └────────────┬────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ❌ Error        ✅ Success
    app.exit(1)      │
                     ▼
            ┌──────────────────────┐
            │ Guardado en @lru_    │
            │ cache (memoria)      │
            │                      │
            │ Llamadas futuras de: │
            │ get_storage_settings()
            │ retornan valor cacheado
            └──────────────────────┘
```

---

## 🎯 Integración con Endpoints

```
┌──────────────────────────────────────┐
│ Endpoint: projects_endpoint.py       │
└─────────────┬──────────────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ @router.post("/upload")  │
    │ async def upload_file()  │
    │   storage = storage_svc  │
    └─────────┬────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ ObjectStorageService()   │
    │   config =               │
    │   get_storage_settings() │
    │ ← Lee del caché          │
    └─────────┬────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │ if config.is_configured: │
    │   upload(...) ✅         │
    │ else:                    │
    │   error ❌               │
    └──────────────────────────┘
```

---

## 🔐 Cómo se cargan las Variables de Ambiente

```
                    Variable: DATABASE_URL
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    
    Sistema       Archivo .env          Código (default)
    Environ       backend/.env          "mysql+aiomysql://..."
        │                  │                  │
        │ Prioridad:       │                  │
        │ 1️⃣ (más alta)   │                  │
        │                  2️⃣                │
        │                  │                  3️⃣ (más baja)
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    _load_from_env()
                           │
                           ▼
                    Valor final usado
                    (o raise error si requerido)
```

**Ejemplo con DATABASE_URL**:

```bash
# Caso 1: Variable de sistema tiene prioridad
export DATABASE_URL="prod-database"
python main.py
# ↓ Usa: "prod-database"

# Caso 2: Sin variable de sistema, pero .env existe
cat .env
# DATABASE_URL=mysql+aiomysql://localhost/db
python main.py
# ↓ Usa: "mysql+aiomysql://localhost/db"

# Caso 3: Ninguno de los anteriores
python main.py
# ↓ Usa: default del código
# ↓ O error si requerido
```

---

## 📦 Arquitectura de Dependencias del Código

```
main.py
  │
  ├─▶ from config import get_config
  │        │
  │        └─▶ config/__init__.py
  │               │
  │               ├─▶ app_config.py (ApplicationConfig)
  │               │      │
  │               │      ├─▶ app_settings.py (AppSettings)
  │               │      ├─▶ auth_config.py (AuthSettings)
  │               │      ├─▶ database_config.py (DatabaseSettings)
  │               │      ├─▶ storage_config.py (StorageSettings)
  │               │      └─▶ email_config.py (EmailSettings)
  │               │
  │               └─▶ Todas heredan de base_settings.py (BaseSettings)
  │
  ├─▶ app = FastAPI(config.app.name)
  │
  ├─▶ app.add_middleware(CORSMiddleware, origins=config.app.cors_origins)
  │
  ├─▶ from config import get_db
  │        └─▶ database_config.py (AsyncSession)
  │
  └─▶ app.include_router(projects_router)
         │
         └─▶ EndPoints usan:
                ├─▶ config.database via get_db()
                ├─▶ storage_service
                │     └─▶ get_storage_settings()
                ├─▶ email_service
                │     └─▶ get_email_settings()
                └─▶ auth_service
                      └─▶ get_auth_settings()
```

---

## 🔒 Seguridad: Ocultar Secretos

```python
# En BaseSettings.to_dict():

config = get_config()

# Esto NUNCA mostrará el secreto:
print(config.auth.to_dict())
# ↓ Salida:
# {
#     'secret_key': '***',      ← Oculto
#     'algorithm': 'HS256',
#     ...
# }

# Logging seguro:
logger.info(f"Config: {config}")
# ↓ Logs:
# Config: ApplicationConfig(auth=AuthSettings(
#     secret_key=***, algorithm=HS256, ...
# ))

# Debug view:
print(config.display_configuration())
# ✓ Seguro - oculta todos los secretos
```

---

## 🚀 Escalabilidad: Agregar Nueva Configuración

### Paso 1: Crear archivo

```python
# config/redis_config.py

@dataclass(frozen=True)
class RedisSettings(BaseSettings):
    host: str
    port: int
    password: str
    db: int
    
    def validate(self) -> None:
        if self.port <= 0:
            raise ValueError("Port inválido")

@lru_cache
def get_redis_settings() -> RedisSettings:
    return RedisSettings(...)
```

### Paso 2: Agregar a ApplicationConfig

```python
# app_config.py

@dataclass
class ApplicationConfig:
    # ... existentes ...
    redis: RedisSettings  # ← Agregar

@lru_cache(maxsize=1)
def get_config() -> ApplicationConfig:
    config = ApplicationConfig(
        # ... existentes ...
        redis=get_redis_settings(),  # ← Agregar
    )
```

### Paso 3: Exportar

```python
# __init__.py

__all__ = [
    # ... existentes ...
    "RedisSettings",
    "get_redis_settings",
]
```

### Paso 4: Usar

```python
# services/cache_service.py

from config import get_redis_settings

class CacheService:
    def __init__(self):
        self.config = get_redis_settings()
        # ... usar self.config ...
```

---

## ⚡ Optimización: Caché con @lru_cache

```python
# Primera llamada: se ejecuta la función
config1 = get_config()  # ← Carga todo, valida
# Tiempo: ~50ms

# Segunda llamada: retorna del caché
config2 = get_config()  # ← Retorna inmediatamente
# Tiempo: <1ms

# Son LO MISMO:
assert config1 is config2  # True ✓
```

### Ventajas:
- ⚡ Rendimiento: sin overhead después de carga inicial
- 🔒 Seguridad: la configuración no cambia en runtime
- 🐛 Debugging: siempre la misma instancia
- 💾 Memoria: solo se carga una vez

### Reset (solo para tests):

```python
from config import reset_config

reset_config()
# @lru_cache se limpia
# Próxima llamada a get_config() cargará de nuevo
```

---

## 🔗 Flujo Completo: Request → Response

```
Cliente HTTP
    │
    ▼
GET /api/projects
    │
    ▼
FastAPI Router (projects_endpoint.py)
    │
    ▼
ProjectRepository (get_db dependency)
    │
    ├─▶ config = get_database_settings()  [cached]
    │
    ├─▶ engine = get_engine()  [cached]
    │
    ├─▶ session = AsyncSessionLocal()  [fresh per request]
    │
    └─▶ query DB...
        │
        ▼ (Si imagen necesaria)
    ObjectStorageService
        │
        ├─▶ config = get_storage_settings()  [cached]
        │
        └─▶ generate signed URL...
            │
            ▼
Response JSON
    │
    ▼
Cliente HTTP
```

**Nota**: Las configuraciones se cargan UNA SOLA VEZ (caché), pero las sesiones de BD son frescas por request (dependencia).

---

## 📈 Rendimiento

| Operación | Primera vez | Siguiente |
|-----------|------------|-----------|
| `get_config()` | ~50ms | <1ms (caché) |
| `get_storage_settings()` | ~10ms | <1ms (caché) |
| `get_db()` | ~5ms | ~5ms (nueva conexión) |
| Validación | ~20ms | 0ms (no se ejecuta) |

**Total startup**: ~200ms (incluyendo FastAPI init)

---

## ✅ Validación en Stages

```
Stage 1: Cargar .env
Stage 2: Parsear tipos (str → int, bool, etc)
Stage 3: Validar cada Setting (AppSettings.validate, etc)
Stage 4: Validar ApplicationConfig general
Stage 5: Inicializar Motor de BD
Stage 6: App lista para servir requests
```

Si algo falla en cualquier stage → App no inicia
