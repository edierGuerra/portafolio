# 📑 Índice de Documentación - Módulo de Configuración

## 🎯 Punto de Partida

**Nuevo en este módulo?** Empieza por aquí:

1. 👉 [README.md](./README.md) - Introdución y guía rápida (5 min)
2. 📖 [CONFIGURATION.md](./CONFIGURATION.md) - Documentación completa (20 min)
3. 🎨 [ARCHITECTURE.md](./ARCHITECTURE.md) - Diagramas internos (10 min)
4. 💡 [EXAMPLES.md](./EXAMPLES.md) - Casos de uso reales (15 min)

---

## 📚 Guía de Contenidos por Tema

### 🚀 Empezar Rápido
- [README.md - Inicio Rápido](./README.md#-inicio-rápido)
- [.env.example](../.env.example) - Copiar y llenar

### 💡 Entender el Sistema
- [CONFIGURATION.md - Visión General](./CONFIGURATION.md#-visión-general)
- [CONFIGURATION.md - Patrón de Configuración](./CONFIGURATION.md#-patrón-de-configuración)
- [ARCHITECTURE.md - Flujo de Inicialización](./ARCHITECTURE.md#-flujo-de-inicialización-de-la-aplicación)

### 🔧 Usar en Código
- [EXAMPLES.md - Inicializar la Aplicación](./EXAMPLES.md#1️⃣-ejemplo-inicializar-la-aplicación)
- [EXAMPLES.md - Usar en un Servicio](./EXAMPLES.md#2️⃣-ejemplo-usar-en-un-servicio)
- [EXAMPLES.md - Usar en un Endpoint](./EXAMPLES.md#3️⃣-ejemplo-usar-en-un-endpoint)
- [EXAMPLES.md - Usar en Dependencias](./EXAMPLES.md#4️⃣-ejemplo-usar-en-dependencias)

### 🔐 Seguridad
- [CONFIGURATION.md - Variables de Ambiente](./CONFIGURATION.md#-variables-de-ambiente)
- [README.md - Seguridad](./README.md#-seguridad)
- [ARCHITECTURE.md - Ocultar Secretos](./ARCHITECTURE.md#-cómo-se-ocultan-los-secretos)

### ➕ Extender el Sistema
- [CONFIGURATION.md - Extensión del Sistema](./CONFIGURATION.md#-extensión-del-sistema)
- [README.md - Agregar Nueva Configuración](./README.md#-agregar-nueva-configuración)

### 🐛 Resolver Problemas
- [CONFIGURATION.md - Troubleshooting](./CONFIGURATION.md#-troubleshooting)
- [README.md - Troubleshooting](./README.md#-troubleshooting)

### ✅ Testing
- [EXAMPLES.md - Tests](./EXAMPLES.md#6️⃣-ejemplo-tests)

### 📊 Arquitectura Interna
- [ARCHITECTURE.md - Ciclo de Vida](./ARCHITECTURE.md#-ciclo-de-vida-de-una-configuración-individual)
- [ARCHITECTURE.md - Integración con Endpoints](./ARCHITECTURE.md#-integración-con-endpoints)
- [ARCHITECTURE.md - Dependencias del Código](./ARCHITECTURE.md#-arquitectura-de-dependencias-del-código)
- [ARCHITECTURE.md - Escalabilidad](./ARCHITECTURE.md#-escalabilidad-agregar-nueva-configuración)

---

## 📄 Archivos de Código

### Módulo de Configuración
```
config/
├── __init__.py                  # Exportaciones públicas
├── base_settings.py             # Clase base reutilizable
├── app_config.py                # ← PUNTO DE ENTRADA
├── app_settings.py              # Configuración general
├── auth_config.py               # Autenticación JWT
├── database_config.py           # Base de datos
├── storage_config.py            # Almacenamiento S3
└── email_config.py              # Email SMTP
```

### Usar Configuración en Tu Código
```
# Ver EXAMPLES.md para:
backend/main.py                 # Como inicializar la app
backend/services/              # Como usar en servicios
backend/endpoints/             # Como usar en endpoints
```

---

## 🎓 Casos de Uso Comunes

### "Quiero usar la configuración en mi endpoint"
👉 [EXAMPLES.md #3 - Usar en Endpoint](./EXAMPLES.md#3️⃣-ejemplo-usar-en-un-endpoint)

### "Necesito validar configuración al iniciar"
👉 [CONFIGURATION.md - Validación](./CONFIGURATION.md#-validación)

### "Quiero agregar una nueva configuración"
👉 [CONFIGURATION.md - Extensión](./CONFIGURATION.md#-extensión-del-sistema)

### "Necesito enviar emails"
👉 [EXAMPLES.md #5 - Email Service](./EXAMPLES.md#5️⃣-ejemplo-email-service)

### "Cómo subir archivos a Spaces"
👉 [EXAMPLES.md #2 - Usar en Servicio](./EXAMPLES.md#2️⃣-ejemplo-usar-en-un-servicio)

### "Necesito debuggear la configuración"
👉 [README.md - Referencia Rápida](./README.md#-referencia-rápida)

### "Quiero escribir tests"
👉 [EXAMPLES.md #6 - Tests](./EXAMPLES.md#6️⃣-ejemplo-tests)

---

## 🔑 Configuraciones Disponibles

### AppSettings
Configuración general de la aplicación
- 📖 [README.md](./README.md#appsettings-aplicación-general)
- 📋 Variables en [.env.example](../.env.example#configuración-de-la-aplicación)

### AuthSettings
Autenticación JWT
- 📖 [README.md](./README.md#authsettings-autenticación-jwt)
- 📋 Variables en [.env.example](../.env.example#autenticación-jwt)
- 💡 [EXAMPLES.md #4](./EXAMPLES.md#4️⃣-ejemplo-usar-en-dependencias)

### DatabaseSettings
Conexión a base de datos
- 📖 [README.md](./README.md#databasesettings-base-de-datos)
- 📋 Variables en [.env.example](../.env.example#base-de-datos)
- 💡 [EXAMPLES.md #1](./EXAMPLES.md#1️⃣-ejemplo-inicializar-la-aplicación)

### StorageSettings
Almacenamiento DigitalOcean Spaces
- 📖 [README.md](./README.md#storagesettings-almacenamiento-digitalocean-spaces)
- 📋 Variables en [.env.example](../.env.example#almacenamiento-en-la-nube---digitalocean-spaces)
- 💡 [EXAMPLES.md #2](./EXAMPLES.md#2️⃣-ejemplo-usar-en-un-servicio)

### EmailSettings
Configuración SMTP para emails
- 📖 [README.md](./README.md#emailsettings-email-smtp)
- 📋 Variables en [.env.example](../.env.example#email---configuración-smtp)
- 💡 [EXAMPLES.md #5](./EXAMPLES.md#5️⃣-ejemplo-email-service)

---

## 📖 Referencia Rápida de APIs

### Punto de entrada principal
```python
from config import get_config
config = get_config()
```

### Configuraciones individuales
```python
from config import (
    get_app_settings,
    get_auth_settings,
    get_database_settings,
    get_storage_settings,
    get_email_settings,
)
```

### Base de datos
```python
from config import get_db  # Dependencia para AsyncSession
```

### Clases y tipos
```python
from config import (
    ApplicationConfig,
    AppSettings,
    AuthSettings,
    DatabaseSettings,
    StorageSettings,
    EmailSettings,
    BaseSettings,
    EnvironmentType,
)
```

---

## 🔄 Flujo de Carga de Configuración

```
1. Aplicación inicia
  ↓
2. Codigo import: from config import get_config
  ↓
3. Llamada: config = get_config()
  ↓
4. Carga .env + variables de sistema
  ↓
5. Crea todas las Settings
  ↓
6. Valida cada una
  ↓
7. Cachea resultado
  ↓
8. Aplicación lista
```

**Gráfico detallado**: [ARCHITECTURE.md - Flujo](./ARCHITECTURE.md#-flujo-de-inicialización-de-la-aplicación)

---

## 🏗️ Estructura de Carpetas Completa

```
backend/
├── config/                  ← Centro de configuración
│   ├── __init__.py
│   ├── README.md           ← Empieza aquí
│   ├── CONFIGURATION.md    ← Guía conceptual
│   ├── ARCHITECTURE.md     ← Diagramas
│   ├── EXAMPLES.md         ← Ejemplos
│   ├── INDEX.md            ← Este archivo
│   ├── base_settings.py
│   ├── app_config.py
│   ├── app_settings.py
│   ├── auth_config.py
│   ├── database_config.py
│   ├── storage_config.py
│   └── email_config.py
├── .env                     ← Tu configuración local (gitignored)
├── .env.example            ← Plantilla de configuración
├── main.py                 ← Punto de entrada app
└── ... otros archivos
```

---

## 💾 Versiones y Cambios

### v1.0.0 (Actual)
- ✅ Configuración centralizada con ApplicationConfig
- ✅ BaseSettings reutilizable
- ✅ Validación automática
- ✅ Caché con @lru_cache
- ✅ AppSettings, AuthSettings, DatabaseSettings, StorageSettings, EmailSettings
- ✅ Documentación completa (README, CONFIGURATION, ARCHITECTURE, EXAMPLES, INDEX)

---

## 🤝 Contribuir

Si necesitas agregar una nueva configuración:

1. Lee [CONFIGURATION.md - Extensión](./CONFIGURATION.md#-extensión-del-sistema)
2. Sigue el patrón en [EXAMPLES.md](./EXAMPLES.md)
3. Actualiza [.env.example](../.env.example)
4. Agrega documentación en [CONFIGURATION.md](./CONFIGURATION.md)

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde se definen las variables de ambiente?**  
R: En `backend/.env` (no versionado) o [`.env.example`](../.env.example)

**P: ¿Cuándo se valida la configuración?**  
R: Al llamar `get_config()` en el inicio de la app. Si falla → app.exit(1)

**P: ¿Se puede cambiar configuración en runtime?**  
R: No. Es inmutable (`frozen=True`). Para tests, usar `reset_config()`

**P: ¿Cómo expongo secretos en logs?**  
R: NO lo hagas. Usar `config.to_dict()` o `str(config)` que ocultan secretos

**P: ¿Cómo agrego nueva configuración?**  
R: Ver [CONFIGURATION.md - Extensión](./CONFIGURATION.md#-extensión-del-sistema)

**P: ¿Email es obligatorio?**  
R: No, es opcional. Si `EMAIL_NOTIFICATIONS_ENABLED=false`, se puede omitir

**P: ¿Storage es obligatorio?**  
R: No, es opcional. Si no está configurado, servicios que lo necesitan retornan error

---

## 📞 Soporte

Para más información, consulta:
- **README.md** - Vista rápida
- **CONFIGURATION.md** - Referencia completa
- **ARCHITECTURE.md** - Cómo funciona
- **EXAMPLES.md** - Cómo usarlo
- **.env.example** - Todas las variables

---

**Última actualización**: Marzo 2026
**Versión del módulo**: 1.0.0
