"""
Configuración de notificaciones por email.
"""
from dataclasses import dataclass
from functools import lru_cache

from config.base_settings import BaseSettings


@dataclass(frozen=True)
class EmailSettings(BaseSettings):
    """
    Configuración de envío de emails.
    
    Variables de ambiente:
    - EMAIL_NOTIFICATIONS_ENABLED: Habilitar emails (default: False)
    - SMTP_HOST: Host del servidor SMTP
    - SMTP_PORT: Puerto del servidor SMTP (default: 587)
    - SMTP_USERNAME: Usuario del servidor SMTP
    - SMTP_PASSWORD: Contraseña del servidor SMTP
    - SMTP_FROM_EMAIL: Email remitente
    - ADMIN_NOTIFICATION_EMAIL: Email del administrador para notificaciones
    - SMTP_USE_TLS: Usar TLS (default: True)
    - SMTP_USE_SSL: Usar SSL (default: False)
    """
    enabled: bool
    host: str
    port: int
    username: str
    password: str
    from_email: str
    admin_notification_email: str
    use_tls: bool
    use_ssl: bool

    def is_fully_configured(self) -> bool:
        """Verifica que el email esté completamente configurado."""
        if not self.enabled:
            return False
        return bool(
            self.host
            and self.port > 0
            and self.username
            and self.password
            and self.from_email
        )

    def validate(self) -> None:
        """Valida la configuración de email."""
        if not self.enabled:
            return  # Si no está habilitado, no es necesario validar
        
        if not self.host or not self.host.strip():
            raise ValueError("SMTP_HOST es requerido cuando EMAIL_NOTIFICATIONS_ENABLED=True")
        if self.port <= 0 or self.port > 65535:
            raise ValueError(f"SMTP_PORT inválido: {self.port}")
        if not self.username or not self.username.strip():
            raise ValueError("SMTP_USERNAME es requerido cuando EMAIL_NOTIFICATIONS_ENABLED=True")
        if not self.password or not self.password.strip():
            raise ValueError("SMTP_PASSWORD es requerido cuando EMAIL_NOTIFICATIONS_ENABLED=True")
        if not self.from_email or not self.from_email.strip():
            raise ValueError("SMTP_FROM_EMAIL es requerido cuando EMAIL_NOTIFICATIONS_ENABLED=True")
        if self.use_tls and self.use_ssl:
            raise ValueError("No se puede usar TLS y SSL simultáneamente (SMTP_USE_TLS y SMTP_USE_SSL)")


@lru_cache
def get_email_settings() -> EmailSettings:
    """
    Obtiene la configuración de email con caché.
    """
    settings = EmailSettings(
        enabled=EmailSettings._load_env_bool("EMAIL_NOTIFICATIONS_ENABLED", default=False),
        host=EmailSettings._load_from_env("SMTP_HOST", "").strip(),
        port=EmailSettings._load_env_int("SMTP_PORT", default=587),
        username=EmailSettings._load_from_env("SMTP_USERNAME", "").strip(),
        password=EmailSettings._load_from_env("SMTP_PASSWORD", "").strip(),
        from_email=EmailSettings._load_from_env("SMTP_FROM_EMAIL", "").strip(),
        admin_notification_email=EmailSettings._load_from_env(
            "ADMIN_NOTIFICATION_EMAIL", ""
        ).strip(),
        use_tls=EmailSettings._load_env_bool("SMTP_USE_TLS", default=True),
        use_ssl=EmailSettings._load_env_bool("SMTP_USE_SSL", default=False),
    )
    settings.validate()
    return settings