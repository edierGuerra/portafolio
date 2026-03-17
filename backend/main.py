from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

# Importar la configuración centralizada
from config import get_config
from config.database_config import AsyncSessionLocal, Base, engine

import models
from models.admin import User
from endpoints import (
    achievements_router,
    analytics_router,
    auth_router,
    available_services_router,
    blog_categories_router,
    blog_tags_router,
    blog_router,
    contact_info_router,
    contact_messages_router,
    experience_router,
    file_storage_router,
    faq_router,
    interests_router,
    my_philosophy_router,
    projects_router,
    social_networks_router,
    technologies_router,
)
from repositories.admin_repository import AdminRepository
from services.security import hash_password

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def ensure_default_admin_user() -> None:
    """Crea un usuario admin por defecto si la tabla de usuarios está vacía."""
    async with AsyncSessionLocal() as db:
        repository = AdminRepository(db)
        existing_user = await repository.get_first()
        if existing_user is not None:
            return

        default_password = "ChangeMe123!"
        admin_email = os.getenv("CMS_ADMIN_EMAIL", "admin@edierguerra.com").strip()
        admin_password = os.getenv("CMS_ADMIN_PASSWORD", default_password).strip()

        if not admin_email or not admin_password:
            logger.warning(
                "⚠️ No se creó usuario inicial del CMS: CMS_ADMIN_EMAIL o CMS_ADMIN_PASSWORD vacío"
            )
            return

        user = User(
            email=admin_email,
            password=hash_password(admin_password),
            name=os.getenv("CMS_ADMIN_NAME", "Administrador"),
            professional_profile=os.getenv("CMS_ADMIN_PROFESSIONAL_PROFILE", "Administrador del CMS"),
            about_me=os.getenv("CMS_ADMIN_ABOUT_ME", "Perfil administrativo inicial del portafolio."),
            profile_image=os.getenv("CMS_ADMIN_PROFILE_IMAGE", ""),
            location=os.getenv("CMS_ADMIN_LOCATION", "N/A"),
            cv_file=os.getenv("CMS_ADMIN_CV_FILE") or None,
            availability_status=os.getenv("CMS_ADMIN_AVAILABILITY_STATUS", "available"),
        )

        db.add(user)
        await db.commit()

        logger.info("✅ Usuario inicial del CMS creado: %s", admin_email)
        if admin_password == default_password:
            logger.warning(
                "⚠️ CMS_ADMIN_PASSWORD está usando el valor por defecto. Cámbialo en producción."
            )


TAGS_METADATA = [
    {
        "name": "analytics",
        "description": "Registro y consulta de eventos de visita al portafolio (solo visitantes no-admin).",
    },
    {
        "name": "auth",
        "description": "Autenticacion y gestion de sesion con JWT (access y refresh token).",
    },
    {
        "name": "technologies",
        "description": "CRUD de tecnologias usadas en el portafolio.",
    },
    {
        "name": "projects",
        "description": "CRUD de proyectos del portafolio.",
    },
    {
        "name": "experience",
        "description": "CRUD de experiencia profesional.",
    },
    {
        "name": "achievements",
        "description": "CRUD de logros y reconocimientos.",
    },
    {
        "name": "services",
        "description": "CRUD de servicios disponibles en el portafolio.",
    },
    {
        "name": "blog-categories",
        "description": "CRUD de categorias para las publicaciones del blog.",
    },
    {
        "name": "blog",
        "description": "CRUD de publicaciones del blog.",
    },
    {
        "name": "blog-tags",
        "description": "CRUD de tags para publicaciones del blog.",
    },
    {
        "name": "contact-info",
        "description": "CRUD de informacion de contacto.",
    },
    {
        "name": "contact-messages",
        "description": "Recepcion de mensajes enviados desde el formulario de contacto.",
    },
    {
        "name": "faq",
        "description": "CRUD de preguntas frecuentes.",
    },
    {
        "name": "interests",
        "description": "CRUD de intereses personales y profesionales.",
    },
    {
        "name": "philosophy",
        "description": "CRUD de filosofia personal y profesional.",
    },
    {
        "name": "social-networks",
        "description": "CRUD de redes sociales.",
    },
    {
        "name": "files",
        "description": "Subida, URLs firmadas y eliminacion de archivos en DigitalOcean Spaces.",
    },
]

# Cargar configuración centralizada
try:
    config = get_config()
    logger.info(f"✅ Configuración cargada: {config.app.name} v{config.app.version}")
    logger.info(f"   Ambiente: {config.app.environment.value}")
    logger.info(f"   Base de datos: {config.database.database_url.split('@')[1] if '@' in config.database.database_url else 'local'}")
except Exception as e:
    logger.error(f"❌ Error cargando configuración: {str(e)}")
    raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager para inicializar y cerrar la aplicación.
    """
    # Startup
    logger.info("🚀 Inicializando aplicación...")
    try:
        # Crear todas las tablas en la base de datos
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await ensure_default_admin_user()
        logger.info("✅ Base de datos inicializada")
    except Exception as e:
        logger.error(f"❌ Error inicializando base de datos: {str(e)}")
        raise
    
    yield  # Aplicación en ejecución
    
    # Shutdown
    logger.info("🛑 Cerrando aplicación...")
    try:
        await engine.dispose()
        logger.info("✅ Conexiones cerradas")
    except Exception as e:
        logger.error(f"❌ Error cerrando conexiones: {str(e)}")


# Crear instancia de FastAPI
app = FastAPI(
    title=config.app.name,
    description=(
        "API para administracion del portafolio profesional. "
        "Incluye autenticacion JWT y CRUDs para contenido del CMS."
    ),
    version=config.app.version,
    contact={
        "name": "Portafolio CMS",
    },
    openapi_tags=TAGS_METADATA,
    lifespan=lifespan,
    debug=config.app.debug,
    docs_url="/api/docs" if config.app.is_development else None,
    redoc_url="/api/redoc" if config.app.is_development else None,
    openapi_url="/api/openapi.json" if config.app.is_development else None,
)

# Configurar CORS con la configuración centralizada
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.app.cors_origins,
    allow_credentials=config.app.cors_allow_credentials,
    allow_methods=config.app.cors_allow_methods,
    allow_headers=config.app.cors_allow_headers,
)

api_routers = [
    analytics_router,
    auth_router,
    technologies_router,
    projects_router,
    experience_router,
    achievements_router,
    available_services_router,
    blog_categories_router,
    blog_tags_router,
    blog_router,
    contact_info_router,
    contact_messages_router,
    faq_router,
    interests_router,
    my_philosophy_router,
    social_networks_router,
    file_storage_router,
]

for router in api_routers:
    app.include_router(router, prefix="/api")
    app.include_router(router)


# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.get(
    "/",
    tags=["health"],
    summary="Health check básico",
    description="Endpoint mínimo para validar que la API está corriendo.",
    response_description="Estado simple de disponibilidad.",
)
async def root():
    """Endpoint raíz - simple health check."""
    return {
        "status": "ok",
        "app": config.app.name,
        "version": config.app.version,
    }


@app.get(
    "/api/health",
    tags=["health"],
    summary="Health check detallado",
    description="Verifica el estado de la aplicación y sus dependencias.",
)
async def health_check():
    """
    Health check detallado que verifica:
    - Configuración de la aplicación
    - Conexión a base de datos
    - Servicios externos (email, almacenamiento)
    """
    from sqlalchemy import text
    
    health_status = {
        "status": "healthy",
        "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        "app": {
            "name": config.app.name,
            "version": config.app.version,
            "environment": config.app.environment.value,
            "debug": config.app.debug,
        },
        "database": {
            "configured": config.database.is_fully_configured(),
            "url": config.database.database_url.split("@")[1] if "@" in config.database.database_url else "unknown",
        },
        "storage": {
            "configured": config.storage.is_configured,
            "provider": "DigitalOcean Spaces" if config.storage.is_configured else "Not configured",
        },
        "email": {
            "configured": config.email.is_fully_configured(),
            "enabled": config.email.enabled,
        },
    }
    
    # Verificar conexión a BD
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.scalar()
        health_status["database"]["status"] = "✅ Connected"
    except Exception as e:
        health_status["database"]["status"] = f"❌ Error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    return health_status


@app.get(
    "/api/config",
    tags=["health"],
    summary="Ver configuración actual",
    description="Muestra la configuración actual (sin exponer secretos).",
)
async def show_config():
    """Muestra la configuración actual sin exponer datos sensibles."""
    return config.get_status()