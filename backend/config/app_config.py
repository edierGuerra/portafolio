"""
Módulo de configuración centralizado de la aplicación.

Este módulo exporta todas las configuraciones del sistema de forma centralizada.
Proporciona un único punto de entrada para acceder a las configuraciones
de la aplicación, autenticación, base de datos, email y almacenamiento.

Uso:
    from config.app_config import get_config
    
    config = get_config()
    
    # Acceder a configuraciones específicas
    app_settings = config.app
    auth_settings = config.auth
    db_settings = config.database
    storage_settings = config.storage
    email_settings = config.email

Ventajas:
    ✓ Punto de entrada único y centralizado
    ✓ Validación de todas las configuraciones al iniciar
    ✓ Control de caché y reinicialización
    ✓ Fácil de extender con nuevas configuraciones
    ✓ Separación de responsabilidades clara
"""
from dataclasses import dataclass
from functools import lru_cache

from config.app_settings import AppSettings, get_app_settings
from config.auth_config import AuthSettings, get_auth_settings
from config.database_config import DatabaseSettings, get_database_settings
from config.email_config import EmailSettings, get_email_settings
from config.storage_config import StorageSettings, get_storage_settings


@dataclass
class ApplicationConfig:
    """
    Contenedor centralizado de todas las configuraciones de la aplicación.
    
    Agrupa todas las configuraciones del sistema:
    - app: Configuración general de la aplicación
    - auth: Configuración de autenticación JWT
    - database: Configuración de base de datos
    - storage: Configuración de almacenamiento (S3/Spaces)
    - email: Configuración de email
    """
    app: AppSettings
    auth: AuthSettings
    database: DatabaseSettings
    storage: StorageSettings
    email: EmailSettings

    def validate_all(self) -> list[str]:
        """
        Valida todas las configuraciones y retorna una lista de errores.
        
        Returns:
            list[str]: Lista de mensajes de error encontrados. Vacía si todo es válido.
        """
        errors = []
        
        # Validar cada configuración
        settings = [
            ("app", self.app),
            ("auth", self.auth),
            ("database", self.database),
            ("storage", self.storage),
            ("email", self.email),
        ]
        
        for name, settings_obj in settings:
            try:
                settings_obj.validate()
            except ValueError as e:
                errors.append(f"{name}: {str(e)}")
        
        return errors

    def get_status(self) -> dict:
        """
        Obtiene un resumen del estado de las configuraciones.
        
        Returns:
            dict: Estado de cada componente configurado
        """
        return {
            "app": {
                "configured": self.app.is_fully_configured(),
                "environment": self.app.environment.value,
                "debug": self.app.debug,
            },
            "auth": {
                "configured": self.auth.is_fully_configured(),
            },
            "database": {
                "configured": self.database.is_fully_configured(),
                "url": "***" if self.database.database_url else None,
            },
            "storage": {
                "configured": self.storage.is_configured,
                "provider": "DigitalOcean Spaces" if self.storage.is_configured else None,
            },
            "email": {
                "configured": self.email.is_fully_configured(),
                "enabled": self.email.enabled,
            },
        }

    def display_configuration(self) -> str:
        """
        Retorna un string formateado con todas las configuraciones (sin exponer secretos).
        Útil para logging y debugging.
        """
        lines = [
            "=" * 60,
            "CONFIGURACIÓN DE LA APLICACIÓN",
            "=" * 60,
            "",
            f"  Aplicación: {self.app.name} v{self.app.version}",
            f"  Ambiente: {self.app.environment.value}",
            f"  Debug: {self.app.debug}",
            f"  URL Base: {self.app.base_url}",
            "",
            f"  Autenticación JWT: ✓ Habilitado",
            f"    - Algoritmo: {self.auth.algorithm}",
            f"    - Access Token TTL: {self.auth.access_token_ttl_minutes} min",
            f"    - Refresh Token TTL: {self.auth.refresh_token_ttl_days} días",
            "",
            f"  Base de Datos: {'✓ Configurada' if self.database.is_fully_configured() else '✗ No configurada'}",
            "",
            f"  Almacenamiento: {'✓ Configurado' if self.storage.is_configured else '✗ No configurado'}",
            f"    - Bucket: {self.storage.bucket_name}",
            f"    - Región: {self.storage.region}",
            "",
            f"  Email: {'✓ Habilitado' if self.email.enabled else '✗ Deshabilitado'}",
            f"    - Host: {self.email.host}",
            f"    - Puerto: {self.email.port}",
            "",
            "=" * 60,
        ]
        return "\n".join(lines)


@lru_cache(maxsize=1)
def get_config() -> ApplicationConfig:
    """
    Obtiene la configuración completa de la aplicación con caché.
    
    Esta función se ejecuta solo una vez y cachea el resultado.
    Todas las variables de ambiente se cargan desde el archivo .env
    y desde las variables del sistema.
    
    Returns:
        ApplicationConfig: Objeto con todas las configuraciones
        
    Raises:
        ValueError: Si hay errores de validación en alguna configuración
    """
    config = ApplicationConfig(
        app=get_app_settings(),
        auth=get_auth_settings(),
        database=get_database_settings(),
        storage=get_storage_settings(),
        email=get_email_settings(),
    )
    
    # Validar todas las configuraciones
    errors = config.validate_all()
    if errors:
        error_message = "Errores en la configuración:\n" + "\n".join(f"  - {e}" for e in errors)
        raise ValueError(error_message)
    
    return config


def reset_config() -> None:
    """
    Reinicia el caché de configuración.
    
    Útil para testing o cuando es necesario recargar la configuración
    sin reiniciar la aplicación.
    
    ⚠️ USE WITH CAUTION: Esto está marcado con lru_cache así que
    normalmente no debería llamarse en producción.
    """
    get_config.cache_clear()


# Exportar las configuraciones individuales para fácil acceso
__all__ = [
    "ApplicationConfig",
    "get_config",
    "reset_config",
    "get_app_settings",
    "get_auth_settings",
    "get_database_settings",
    "get_storage_settings",
    "get_email_settings",
]
