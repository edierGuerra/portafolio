# 🎨 Portafolio Profesional

Un portafolio moderno, full-stack y completamente desacoplado con **React + TypeScript** en el frontend, **FastAPI + SQLAlchemy** en el backend, y **Docker Compose** con soporte para múltiples entornos (desarrollo, staging, producción).

**Características principales:**
- ✨ Interfaz moderna y responsiva (mobile-first)
- 🚀 API RESTful con autenticación JWT
- 🗄️ Base de datos MySQL relacional
- 🐳 Completamente containerizado con Docker
- 🔄 CI/CD automático con GitHub Actions
- 🌿 Soporte para múltiples entornos (dev/staging/prod)
- 📱 CMS integrado para gestionar contenido del portafolio
- 🎯 Deployable en cualquier servidor Linux con Docker

---

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación Rápida](#instalación-rápida)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo Local](#desarrollo-local)
- [Despliegue](#despliegue)
- [Documentación](#documentación)
- [Flujo Git y CI/CD](#flujo-git-y-cicd)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## 🛠️ Requisitos

- **Docker Desktop** (Windows, Mac, Linux)
  - [Descargar Docker](https://www.docker.com/products/docker-desktop)
- **Git** para clonar el repositorio
- **GitHub CLI** (opcional, para configurar secretos)
  - [Descargar gh](https://cli.github.com/)

Para desarrollo sin Docker:
- **Python 3.11+**
- **Node.js 20+** y npm
- **MySQL 8.4+**

---

## 🚀 Instalación Rápida

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/portafolio.git
cd portafolio

# Configurar archivo de entorno
cp .env.development.example .env

# Levantar stack de desarrollo
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

**URLs (desarrollo):**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Docs API: http://localhost:8000/api/docs
- Swagger: http://localhost:8000/api/redoc

### Opción 2: Sin Docker (Local)

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar
source .venv/bin/activate  # Linux/Mac
# o
.\.venv\Scripts\activate  # Windows PowerShell

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables
cp .env.example .env
# Editar .env con tu configuración de BD

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo (con hot reload)
npm run dev

# Build producción
npm run build

# Preview de build
npm run preview
```

---

## 📁 Estructura del Proyecto

```
portafolio/
├── .github/
│   ├── workflows/
│   │   └── ci-cd.yml          # Pipeline de GitHub Actions
│   ├── CICD_SETUP.md          # Configuración detallada CI/CD
│   ├── CICD_QUICK_START.md    # Guía rápida
│   └── setup-ci-cd-secrets.sh # Script de configuración
│
├── backend/
│   ├── config/                # Configuración (settings, BD, auth)
│   ├── endpoints/             # Rutas API REST
│   ├── models/                # Modelos SQLAlchemy
│   ├── repositories/          # Capa de datos
│   ├── schemas/               # Validación de datos
│   ├── services/              # Lógica de negocio
│   ├── alembic/               # Migraciones de BD
│   ├── main.py                # Entrada app FastAPI
│   ├── requirements.txt        # Dependencias Python
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/               # Clientes HTTP
│   │   ├── components/        # Componentes React
│   │   ├── styles/            # CSS global
│   │   ├── App.tsx            # Componente raíz
│   │   └── main.tsx           # Entrada React
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml         # Servicios base (MySQL, DB)
├── docker-compose.dev.yml     # Override desarrollo
├── docker-compose.staging.yml # Override staging
├── docker-compose.prod.yml    # Override producción
│
├── DOCKER.md                  # Guía Docker y entornos
├── README.md                  # Este archivo
└── REQUIREMENTS.md            # Requerimientos funcionales
```

---

## 💻 Desarrollo Local

### Cambios en el código

Mientras con `docker compose up`, los cambios se recargan automáticamente:

**Backend:**
- FastAPI con `--reload` detecta cambios automáticamente
- Logs visibles en `docker compose logs backend`

**Frontend:**
- Vite hot-reload por defecto
- Accesso en http://localhost:3000

### Base de datos

```bash
# Crear nueva migración
docker compose exec backend alembic revision --autogenerate -m "Descripción"

# Aplicar migraciones
docker compose exec backend alembic upgrade head

# Ver estado
docker compose exec backend alembic current
```

### Testing (opcional)

```bash
# Backend tests
docker compose exec backend pytest

# Frontend tests
docker compose exec frontend npm test
```

---

## 🚀 Despliegue

### Entornos disponibles

| Entorno | Rama | Portes | Logs | Debug |
|---------|------|--------|------|-------|
| **Desarrollo** | `feature/*` | 3000, 8000 | DEBUG | ✅ |
| **Staging** | `develop` | 3000, 8000 | INFO | ❌ |
| **Producción** | `main` | 80, 8000 | WARNING | ❌ |

### Levantar por entorno

```bash
# Desarrollo
cp .env.development.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Staging
cp .env.staging.example .env
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Producción
cp .env.production.example .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Configurar CI/CD automático

Para despliegue automático en Staging y Producción:

1. **Lee la guía:** [.github/CICD_QUICK_START.md](.github/CICD_QUICK_START.md)
2. **Configura secretos:** `bash .github/setup-ci-cd-secrets.sh`
3. **Verifica configuración:** `bash .github/verify-ci-cd-setup.sh`

---

## 📚 Documentación

### Documentación por tema

| Tema | Archivo |
|------|---------|
| **Configuración de entornos** | [DOCKER.md](DOCKER.md) |
| **CI/CD rápido** | [.github/CICD_QUICK_START.md](.github/CICD_QUICK_START.md) |
| **CI/CD completo** | [.github/CICD_SETUP.md](.github/CICD_SETUP.md) |
| **Backend** | [backend/config/README.md](backend/config/README.md) |
| **Frontend** | [frontend/README.md](frontend/README.md) |
| **Requerimientos** | [REQUIREMENTS.md](REQUIREMENTS.md) |

---

## 🔄 Flujo Git y CI/CD

```
1. Crear rama de feature
   │
   └─→ git checkout -b feature/nueva-funcionalidad
       (GitHub Actions: Valida + Build + Test)

2. Abrir Pull Request a develop
   │
   └─→ Code review
       (GitHub Actions: Valida + Build + Test)

3. Merge a develop
   │
   └─→ git merge feature/...
       (GitHub Actions: Valida + Build + Test + 🚀 Deploy Staging)

4. Merge a main
   │
   └─→ git merge develop
       (GitHub Actions: Valida + Build + Test + 🚀 Deploy Producción)
```

**En cada etapa:**
- ✅ Linting (flake8, black, ESLint)
- ✅ Build Docker
- ✅ Tests (pytest, jest)
- ✅ Deploy automático (solo main/develop)

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea rama: `git checkout -b feature/mi-feature`
3. Commit cambios: `git commit -m "Agrega mi feature"`
4. Push a rama: `git push origin feature/mi-feature`
5. Abre Pull Request

**Requisitos para PR:**
- ✅ Tests pasan
- ✅ Código formateado (black, isort)
- ✅ Sin warnings de linting
- ✅ Documentación actualizada

---

## 📞 Soporte

¿Problemas con el setup?

- **Docker/Entornos:** Ver [DOCKER.md](DOCKER.md)
- **CI/CD:** Ver [.github/CICD_SETUP.md](.github/CICD_SETUP.md)
- **Backend:** Ver [backend/config/README.md](backend/config/README.md)
- **Frontend:** Ver [frontend/README.md](frontend/README.md)

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para detalles.

---

## 🎯 Roadmap

- [ ] Implementar tests unitarios reales
- [ ] Agregar autenticación Google/GitHub
- [ ] Internacionalización (i18n)
- [ ] Analytics avanzados
- [ ] CDN para imágenes
- [ ] API caching con Redis
- [ ] Webhooks de Discord

---

**Hecho con ❤️ por el equipo de desarrollo**
