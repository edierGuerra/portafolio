"""
Configuración de la base de datos.
"""
import ssl
from dataclasses import dataclass
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase

from config.base_settings import BaseSettings


@dataclass(frozen=True)
class DatabaseSettings(BaseSettings):
    """
    Configuración de la base de datos.
    
    Variables de ambiente:
    - DATABASE_URL: URL de conexión a la base de datos
      (default: mysql+aiomysql://Edier:admin@localhost/portafolio_db)
    - DATABASE_ECHO: Mostrar queries SQL en logs (default: True en desarrollo)
    - DATABASE_POOL_SIZE: Tamaño del connection pool (default: 20)
    - DATABASE_MAX_OVERFLOW: Conexiones adicionales permitidas (default: 10)
    - DATABASE_POOL_RECYCLE: Reciclar conexiones después de X segundos (default: 3600)
    """
    database_url: str
    echo: bool
    pool_size: int
    max_overflow: int
    pool_recycle: int
    use_ssl: bool

    def is_fully_configured(self) -> bool:
        """Verifica que la URL de base de datos esté configurada."""
        return bool(self.database_url and self.database_url.strip())

    def validate(self) -> None:
        """Valida la configuración de base de datos."""
        if not self.is_fully_configured():
            raise ValueError("DATABASE_URL es requerido")
        if not self.database_url.startswith(("mysql+", "postgresql+", "sqlite")):
            raise ValueError(
                f"DATABASE_URL inválido: {self.database_url}. "
                "Debe ser mysql+aiomysql://, postgresql+asyncpg://, o sqlite"
            )


@lru_cache
def get_database_settings() -> DatabaseSettings:
    """
    Obtiene la configuración de la base de datos con caché.
    """
    settings = DatabaseSettings(
        database_url=DatabaseSettings._load_from_env(
            "DATABASE_URL",
            "mysql+aiomysql://Edier:admin@localhost/portafolio_db"
        ),
        echo=DatabaseSettings._load_env_bool("DATABASE_ECHO", default=True),
        pool_size=DatabaseSettings._load_env_int("DATABASE_POOL_SIZE", default=20),
        max_overflow=DatabaseSettings._load_env_int("DATABASE_MAX_OVERFLOW", default=10),
        pool_recycle=DatabaseSettings._load_env_int("DATABASE_POOL_RECYCLE", default=3600),
        use_ssl=DatabaseSettings._load_env_bool("DATABASE_SSL", default=False),
    )
    settings.validate()
    return settings


# Instancia global que se inicializa al importar este módulo
class Base(DeclarativeBase):
    """Clase base para los modelos SQLAlchemy de la aplicación."""
    pass


# Se inicializa bajo demanda cuando se llama a get_engine()
_engine_instance = None


def get_engine():
    """
    Obtiene o crea el motor de SQLAlchemy.
    Usada internamente por las funciones de dependencias.
    """
    global _engine_instance
    if _engine_instance is None:
        settings = get_database_settings()
        connect_args = {}
        if settings.use_ssl:
            ssl_ctx = ssl.create_default_context()
            connect_args["ssl"] = ssl_ctx
        _engine_instance = create_async_engine(
            settings.database_url,
            echo=settings.echo,
            pool_size=settings.pool_size,
            max_overflow=settings.max_overflow,
            pool_recycle=settings.pool_recycle,
            connect_args=connect_args,
        )
    return _engine_instance


def get_session_maker():
    """Obtiene el sessionmaker configurado."""
    engine = get_engine()
    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )


# Inicializar engine y sessionmaker al importar este módulo
engine = get_engine()
AsyncSessionLocal = get_session_maker()


async def get_db():
    """
    Dependencia inyectable para obtener una sesión de base de datos.
    """
    async with AsyncSessionLocal() as db:
        yield db