import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


def _load_env_file() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if key and key not in os.environ:
            os.environ[key] = value


_load_env_file()


def _to_bool(raw: str | None, default: bool = False) -> bool:
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class EmailSettings:
    enabled: bool
    host: str
    port: int
    username: str
    password: str
    from_email: str
    admin_notification_email: str
    use_tls: bool
    use_ssl: bool


@lru_cache
def get_email_settings() -> EmailSettings:
    return EmailSettings(
        enabled=_to_bool(os.getenv("EMAIL_NOTIFICATIONS_ENABLED"), default=False),
        host=os.getenv("SMTP_HOST", "").strip(),
        port=int(os.getenv("SMTP_PORT", "587")),
        username=os.getenv("SMTP_USERNAME", "").strip(),
        password=os.getenv("SMTP_PASSWORD", "").strip(),
        from_email=os.getenv("SMTP_FROM_EMAIL", "").strip(),
        admin_notification_email=os.getenv("ADMIN_NOTIFICATION_EMAIL", "").strip(),
        use_tls=_to_bool(os.getenv("SMTP_USE_TLS"), default=True),
        use_ssl=_to_bool(os.getenv("SMTP_USE_SSL"), default=False),
    )