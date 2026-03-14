import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


def _load_env_file() -> None:
    """Carga un .env local del backend si existe (sin sobrescribir env ya definido)."""
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class StorageSettings:
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
        return bool(
            self.endpoint_url
            and self.bucket_name
            and self.region
            and self.access_key
            and self.secret_key
        )


@lru_cache
def get_storage_settings() -> StorageSettings:
    _load_env_file()
    return StorageSettings(
        endpoint_url=os.getenv("DO_SPACES_ENDPOINT", "").strip(),
        bucket_name=os.getenv("DO_SPACES_BUCKET", "").strip(),
        region=os.getenv("DO_SPACES_REGION", "nyc3").strip(),
        access_key=os.getenv("DO_SPACES_KEY", "").strip(),
        secret_key=os.getenv("DO_SPACES_SECRET", "").strip(),
        public_url_base=os.getenv("DO_SPACES_PUBLIC_URL_BASE", "").strip(),
        base_path=os.getenv("DO_SPACES_BASE_PATH", "").strip("/"),
        default_signed_url_ttl=int(os.getenv("DO_SPACES_DEFAULT_TTL", "900")),
        max_upload_bytes=int(os.getenv("DO_SPACES_MAX_UPLOAD_BYTES", str(10 * 1024 * 1024))),
        force_path_style=_parse_bool(os.getenv("DO_SPACES_FORCE_PATH_STYLE"), default=False),
        object_acl=os.getenv("DO_SPACES_OBJECT_ACL", "public-read").strip(),
    )
