"""
Módulo de configuración centralizado de la aplicación.

Exporta todos los componentes de configuración necesarios para 
que otros módulos accedan de forma fácil y consistente.
"""

# Configuración centralizada
from config.app_config import (
    ApplicationConfig,
    get_config,
    reset_config,
)

# Configuraciones individuales
from config.app_settings import (
    AppSettings,
    EnvironmentType,
    get_app_settings,
)
from config.auth_config import (
    AuthSettings,
    get_auth_settings,
)
from config.database_config import (
    DatabaseSettings,
    Base,
    get_db,
    get_database_settings,
    get_engine,
    get_session_maker,
)
from config.storage_config import (
    StorageSettings,
    get_storage_settings,
)
from config.email_config import (
    EmailSettings,
    get_email_settings,
)
from config.base_settings import BaseSettings

__all__ = [
    # Configuración centralizada
    "ApplicationConfig",
    "get_config",
    "reset_config",
    # Configuración de aplicación
    "AppSettings",
    "EnvironmentType",
    "get_app_settings",
    # Configuración de autenticación
    "AuthSettings",
    "get_auth_settings",
    # Configuración de base de datos
    "DatabaseSettings",
    "Base",
    "get_db",
    "get_database_settings",
    "get_engine",
    "get_session_maker",
    # Configuración de almacenamiento
    "StorageSettings",
    "get_storage_settings",
    # Configuración de email
    "EmailSettings",
    "get_email_settings",
    # Base
    "BaseSettings",
]
