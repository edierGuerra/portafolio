"""
Configuración de autenticación y autorización JWT.
"""
from dataclasses import dataclass
from functools import lru_cache

from config.base_settings import BaseSettings


@dataclass(frozen=True)
class AuthSettings(BaseSettings):
    """
    Configuración de autenticación JWT.
    
    Variables de ambiente requeridas:
    - AUTH_SECRET_KEY: Clave secreta para firmar tokens (requerida)
    - AUTH_ALGORITHM: Algoritmo de encriptación (default: HS256)
    - AUTH_ACCESS_TOKEN_TTL: TTL del access token en minutos (default: 30)
    - AUTH_REFRESH_TOKEN_TTL: TTL del refresh token en días (default: 7)
    - AUTH_HASH_ALGORITHM: Algoritmo para hashear passwords (default: bcrypt)
    """
    secret_key: str
    algorithm: str
    access_token_ttl_minutes: int
    refresh_token_ttl_days: int
    hash_algorithm: str

    def is_fully_configured(self) -> bool:
        """La autenticación requiere al menos la clave secreta."""
        return bool(self.secret_key and self.secret_key.strip())

    def validate(self) -> None:
        """Valida la configuración de autenticación."""
        if not self.is_fully_configured():
            raise ValueError(
                "AUTH_SECRET_KEY es requerido para la autenticación JWT"
            )
        if self.access_token_ttl_minutes <= 0:
            raise ValueError("AUTH_ACCESS_TOKEN_TTL debe ser mayor a 0")
        if self.refresh_token_ttl_days <= 0:
            raise ValueError("AUTH_REFRESH_TOKEN_TTL debe ser mayor a 0")


@lru_cache
def get_auth_settings() -> AuthSettings:
    """
    Obtiene la configuración de autenticación con caché.
    Se ejecuta solo una vez y cachea el resultado.
    """
    settings = AuthSettings(
        secret_key=AuthSettings._load_from_env("AUTH_SECRET_KEY", "change-me-in-production"),
        algorithm=AuthSettings._load_from_env("AUTH_ALGORITHM", "HS256"),
        access_token_ttl_minutes=AuthSettings._load_env_int(
            "AUTH_ACCESS_TOKEN_TTL", default=30
        ),
        refresh_token_ttl_days=AuthSettings._load_env_int(
            "AUTH_REFRESH_TOKEN_TTL", default=7
        ),
        hash_algorithm=AuthSettings._load_from_env("AUTH_HASH_ALGORITHM", "bcrypt"),
    )
    settings.validate()
    return settings
