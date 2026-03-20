"""
Configuración general de la aplicación.
Incluye ambiente, puertos, URLs, CORS, y otros parámetros de aplicación.
"""
from dataclasses import dataclass
from enum import Enum
from functools import lru_cache

from config.base_settings import BaseSettings, _parse_bool


class EnvironmentType(str, Enum):
    """Tipos de ambiente soportados."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


@dataclass(frozen=True)
class AppSettings(BaseSettings):
    """
    Configuración general de la aplicación FastAPI.
    
    Variables de ambiente:
    - APP_NAME: Nombre de la aplicación (default: "Portfolio API")
    - APP_VERSION: Versión de la aplicación (default: "1.0.0")
    - APP_ENV: Ambiente principal (development|staging|production, default: development)
    - ENVIRONMENT: Alias compatible de APP_ENV
    - DEBUG: Modo debug (default: False en production, True en otros)
    - WORKERS: Número de workers (default: 4)
    - PORT: Puerto del servidor (default: 8000)
    - HOST: Host del servidor (default: 0.0.0.0)
    - CORS_ORIGINS: Orígenes permitidos para CORS (default: http://localhost:5173)
    - CORS_ALLOW_CREDENTIALS: Permitir credenciales en CORS (default: True)
    - CORS_ALLOW_METHODS: Métodos HTTP permitidos (default: GET,POST,PUT,DELETE,PATCH,OPTIONS)
    - CORS_ALLOW_HEADERS: Headers permitidos (default: *)
    - LOG_LEVEL: Nivel de logging (default: INFO)
    """
    name: str
    version: str
    environment: EnvironmentType
    debug: bool
    workers: int
    port: int
    host: str
    cors_origins: list[str]
    cors_allow_credentials: bool
    cors_allow_methods: list[str]
    cors_allow_headers: list[str]
    log_level: str

    @property
    def is_development(self) -> bool:
        """Verifica si está en desarrollo."""
        return self.environment == EnvironmentType.DEVELOPMENT

    @property
    def is_production(self) -> bool:
        """Verifica si está en producción."""
        return self.environment == EnvironmentType.PRODUCTION

    @property
    def base_url(self) -> str:
        """URL base de la aplicación."""
        protocol = "https" if self.is_production else "http"
        return f"{protocol}://{self.host}:{self.port}"

    def validate(self) -> None:
        """Valida la configuración de la aplicación."""
        if self.port <= 0 or self.port > 65535:
            raise ValueError(f"Puerto inválido: {self.port}")
        if not self.name or not self.name.strip():
            raise ValueError("APP_NAME es requerido")
        if self.workers <= 0:
            raise ValueError("WORKERS debe ser mayor a 0")


@lru_cache
def get_app_settings() -> AppSettings:
    """
    Obtiene la configuración de la aplicación con caché.
    Se ejecuta solo una vez y cachea el resultado.
    """
    # Determinar el ambiente
    env_str = (
        AppSettings._load_from_env("APP_ENV")
        or AppSettings._load_from_env("ENVIRONMENT", "development")
    ).lower()
    try:
        environment = EnvironmentType(env_str)
    except ValueError:
        raise ValueError(
            f"APP_ENV/ENVIRONMENT inválido: {env_str}. "
            f"Valores permitidos: {', '.join([e.value for e in EnvironmentType])}"
        )

    # Determinar si debug
    debug = AppSettings._load_env_bool(
        "DEBUG",
        default=environment != EnvironmentType.PRODUCTION
    )

    # Procesar CORS origins
    cors_origins_str = AppSettings._load_from_env(
        "CORS_ORIGINS",
        "http://localhost:5173"
    )
    cors_origins = [
        origin.strip()
        for origin in cors_origins_str.split(",")
        if origin.strip()
    ]

    # Procesar métodos CORS
    cors_methods_str = AppSettings._load_from_env(
        "CORS_ALLOW_METHODS",
        "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    )
    cors_methods = [
        method.strip()
        for method in cors_methods_str.split(",")
        if method.strip()
    ]

    # Procesar headers CORS
    cors_headers_str = AppSettings._load_from_env(
        "CORS_ALLOW_HEADERS",
        "*"
    )
    cors_headers = [
        header.strip()
        for header in cors_headers_str.split(",")
        if header.strip()
    ]

    settings = AppSettings(
        name=AppSettings._load_from_env("APP_NAME", "Portfolio API"),
        version=AppSettings._load_from_env("APP_VERSION", "1.0.0"),
        environment=environment,
        debug=debug,
        workers=AppSettings._load_env_int("WORKERS", default=4),
        port=AppSettings._load_env_int("PORT", default=8000),
        host=AppSettings._load_from_env("HOST", "0.0.0.0"),
        cors_origins=cors_origins,
        cors_allow_credentials=AppSettings._load_env_bool(
            "CORS_ALLOW_CREDENTIALS", default=True
        ),
        cors_allow_methods=cors_methods,
        cors_allow_headers=cors_headers,
        log_level=AppSettings._load_from_env("LOG_LEVEL", "INFO").upper(),
    )
    settings.validate()
    return settings
