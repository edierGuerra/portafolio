# Docker Setup

Este proyecto queda dockerizado con tres servicios:

- `db`: MySQL 8.4
- `backend`: FastAPI + SQLAlchemy async
- `frontend`: React/Vite servido con Nginx

## Requisitos

- Docker Desktop instalado y ejecutándose.
- Puerto `3000` libre para frontend.
- Puerto `8000` libre para backend.

## Levantar el stack

Desde la raíz del repositorio:

**Desarrollo:**

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

**Staging:**

```bash
docker compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d
```

**Producción:**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Ver logs:

```bash
docker compose logs -f
```

Detener:

```bash
docker compose down
```

Detener y borrar volumen de base de datos:

```bash
docker compose down -v
```

## URLs

- **Desarrollo**
	- Frontend: http://localhost:3000
	- Backend: http://localhost:8000
	- Docs API: http://localhost:8000/api/docs
- **Staging** (modo local)
	- Frontend: http://localhost:3000
	- Backend: http://localhost:8000
	- Docs API: http://localhost:8000/api/docs
- **Producción** (modo local)
	- Frontend: http://localhost
	- Backend: http://localhost:8000

MySQL corre dentro de la red interna de Docker y no se publica al host.

## **Desarrollo**

```bash
cp .env.development.example .env
```

2. **Staging**

```bash
cp .env.staging.example .env
```

3. **Producción**
cp .env.development.example .env
```

2. Producción

```bash
cp .env.production.example .env
```

Luego ejecutar el compose del entorno correspondiente.

**Bash/Zsh:**

```bash
VITE_API_URL=http://localhost:8000 docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

**PowerShell:**

```powershell
$env:VITE_API_URL = "http://localhost:8000"
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

## Entornos y sus características

| Aspecto | Desarrollo | Staging | Producción |
|--------|-----------|---------|-----------|
| DEBUG | `true` | `false` | `false` |
| LOG_LEVEL | `DEBUG` | `INFO` | `WARNING` |
| DATABASE_ECHO | `true` | `false` | `false` |
| CORS_ORIGINS | localhost | dominio staging | dominio real |
| VITE_API_URL | http://localhost:8000 | https://staging-api.tu-dominio.com | https://api.tu-dominio.com |
| Puerto Frontend | 3000 | 3000 | 80 |
| Puerto Backend | 8000 | 8000 | 8000 |
```bash
VITE_API_URL=http://localhost:8000 docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

En PowerShell:

```powershell
$env:VITE_API_URL = "http://localhost:8000"
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

## Notas de producción

- Cambiar `AUTH_SECRET_KEY` por una clave segura.
- No exponer MySQL públicamente si no es necesario.
- Mover secretos a un gestor seguro o variables de entorno del entorno de despliegue.
