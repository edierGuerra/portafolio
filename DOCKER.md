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

```bash
docker compose up --build -d
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

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Docs API (dev): http://localhost:8000/api/docs

MySQL corre dentro de la red interna de Docker y no se publica al host.

## Variables importantes

`docker-compose.yml` ya define valores por defecto para entorno local.

- `DATABASE_URL` del backend apunta al servicio `db`.
- `VITE_API_URL` del frontend se puede sobreescribir al construir:

```bash
VITE_API_URL=http://localhost:8000 docker compose up --build -d
```

En PowerShell:

```powershell
$env:VITE_API_URL = "http://localhost:8000"
docker compose up --build -d
```

## Notas de producción

- Cambiar `AUTH_SECRET_KEY` por una clave segura.
- No exponer MySQL públicamente si no es necesario.
- Mover secretos a un gestor seguro o variables de entorno del entorno de despliegue.
