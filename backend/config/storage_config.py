"""
Configuración de almacenamiento en la nube (DigitalOcean Spaces / S3).
"""
import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from config.base_settings import BaseSettings


@dataclass(frozen=True)
class StorageSettings(BaseSettings):
    """
    Configuración de almacenamiento en DigitalOcean Spaces (compatible con S3).
    
    Variables de ambiente:
    - DO_SPACES_ENDPOINT: URL del endpoint de Spaces (ej: https://nyc3.digitaloceanspaces.com)
    - DO_SPACES_BUCKET: Nombre del bucket
    - DO_SPACES_REGION: Región de Spaces (default: nyc3)
    - DO_SPACES_KEY: Access Key
    - DO_SPACES_SECRET: Secret Key
    - DO_SPACES_PUBLIC_URL_BASE: URL base pública para acceder a objetos
    - DO_SPACES_BASE_PATH: Ruta base para almacenar archivos (default: "")
    - DO_SPACES_DEFAULT_TTL: TTL para URLs firmadas en segundos (default: 900)
    - DO_SPACES_MAX_UPLOAD_BYTES: Tamaño máximo de carga (default: 10MB)
    - DO_SPACES_FORCE_PATH_STYLE: Usar path-style URLs (default: False)
    - DO_SPACES_OBJECT_ACL: ACL para objetos nuevos (default: public-read)
    """
    endpoint_url: str
    bucket_name: str
    region: str
    access_key: str
    secret_key: str
    public_url_base: str
    base_path: str
    default_signed_url_ttl: int
    max_upload_bytes: int
    force_path_style: bool
    object_acl: str

    @property
    def is_configured(self) -> bool:
        """Verifica que el almacenamiento esté completamente configurado."""
        return bool(
            self.endpoint_url
            and self.bucket_name
            and self.region
            and self.access_key
            and self.secret_key
        )

    def is_fully_configured(self) -> bool:
        """Alias de is_configured para compatibilidad con BaseSettings."""
        return self.is_configured

    def validate(self) -> None:
        """Valida la configuración de almacenamiento."""
        if self.endpoint_url and not self.endpoint_url.startswith("http"):
            raise ValueError(
                f"DO_SPACES_ENDPOINT inválido: debe ser una URL (ej: https://nyc3.digitaloceanspaces.com)"
            )
        if self.default_signed_url_ttl <= 0:
            raise ValueError("DO_SPACES_DEFAULT_TTL debe ser mayor a 0")
        if self.max_upload_bytes <= 0:
            raise ValueError("DO_SPACES_MAX_UPLOAD_BYTES debe ser mayor a 0")
        if self.object_acl not in ("public-read", "private", "public-read-write"):
            raise ValueError(
                f"DO_SPACES_OBJECT_ACL inválido: {self.object_acl}. "
                "Valores permitidos: public-read, private, public-read-write"
            )

    def get_object_url(self, object_key: str) -> str:
        """
        Construye la URL pública de un objeto.
        
        Args:
            object_key: Clave del objeto en el bucket
            
        Returns:
            URL pública del objeto
        """
        if not self.public_url_base:
            return None
        return f"{self.public_url_base.rstrip('/')}/{object_key.lstrip('/')}"


@lru_cache
def get_storage_settings() -> StorageSettings:
    """
    Obtiene la configuración de almacenamiento con caché.
    """
    return StorageSettings(
        endpoint_url=StorageSettings._load_from_env("DO_SPACES_ENDPOINT", "").strip(),
        bucket_name=StorageSettings._load_from_env("DO_SPACES_BUCKET", "").strip(),
        region=StorageSettings._load_from_env("DO_SPACES_REGION", "nyc3").strip(),
        access_key=StorageSettings._load_from_env("DO_SPACES_KEY", "").strip(),
        secret_key=StorageSettings._load_from_env("DO_SPACES_SECRET", "").strip(),
        public_url_base=StorageSettings._load_from_env("DO_SPACES_PUBLIC_URL_BASE", "").strip(),
        base_path=StorageSettings._load_from_env("DO_SPACES_BASE_PATH", "").strip("/"),
        default_signed_url_ttl=StorageSettings._load_env_int("DO_SPACES_DEFAULT_TTL", 900),
        max_upload_bytes=StorageSettings._load_env_int(
            "DO_SPACES_MAX_UPLOAD_BYTES",
            10 * 1024 * 1024  # 10MB por defecto
        ),
        force_path_style=StorageSettings._load_env_bool("DO_SPACES_FORCE_PATH_STYLE", False),
        object_acl=StorageSettings._load_from_env("DO_SPACES_OBJECT_ACL", "public-read").strip(),
    )
