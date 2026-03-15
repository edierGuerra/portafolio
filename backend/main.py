from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database_config import Base, engine
from contextlib import asynccontextmanager
import models
from endpoints import (
    achievements_router,
    auth_router,
    available_services_router,
    blog_categories_router,
    blog_tags_router,
    blog_router,
    contact_info_router,
    experience_router,
    file_storage_router,
    faq_router,
    interests_router,
    my_philosophy_router,
    projects_router,
    social_networks_router,
    technologies_router,
)


TAGS_METADATA = [
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Código que se ejecuta al iniciar la app
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

    # Código que se ejecuta al cerrar la app
    await engine.dispose()
app = FastAPI(
    title="Portafolio API",
    description=(
        "API para administracion del portafolio profesional. "
        "Incluye autenticacion JWT y CRUDs para contenido del CMS."
    ),
    version="1.0.0",
    contact={
        "name": "Portafolio CMS",
    },
    openapi_tags=TAGS_METADATA,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(technologies_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(experience_router, prefix="/api")
app.include_router(achievements_router, prefix="/api")
app.include_router(available_services_router, prefix="/api")
app.include_router(blog_categories_router, prefix="/api")
app.include_router(blog_tags_router, prefix="/api")
app.include_router(blog_router, prefix="/api")
app.include_router(contact_info_router, prefix="/api")
app.include_router(faq_router, prefix="/api")
app.include_router(interests_router, prefix="/api")
app.include_router(my_philosophy_router, prefix="/api")
app.include_router(social_networks_router, prefix="/api")
app.include_router(file_storage_router, prefix="/api")

@app.get(
    "/",
    tags=["health"],
    summary="Health check basico",
    description="Endpoint minimo para validar que la API esta corriendo.",
    response_description="Estado simple de disponibilidad.",
)
async def root():
    return {"message": "Hello World"}