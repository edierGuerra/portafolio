"""
Clase base para todas las configuraciones del sistema.
Proporciona utilidades comunes para cargar, validar y cachear configuraciones.
"""
import os
from dataclasses import Field, dataclass, fields
from functools import lru_cache
from pathlib import Path
from typing import Any, Type, TypeVar


T = TypeVar('T', bound='BaseSettings')


def _load_env_file() -> None:
    """
    Carga variables de un archivo .env local sin sobrescribir las ya definidas
    en el ambiente. Solo se ejecuta una vez.
    """
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        # Ignorar líneas vacías y comentarios
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue

        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        
        # Solo cargar si la variable no existe en el ambiente
        if key and key not in os.environ:
            os.environ[key] = value


def _parse_bool(value: str | None, default: bool = False) -> bool:
    """Convierte un string a booleano."""
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _parse_int(value: str | None, default: int = 0) -> int:
    """Convierte un string a entero."""
    if value is None:
        return default
    try:
        return int(value.strip())
    except (ValueError, AttributeError):
        return default


@dataclass(frozen=True)
class BaseSettings:
    """
    Clase base para todas las configuraciones del sistema.
    
    Proporciona:
    - Carga automática de .env
    - Conversión de tipos (bool, int, str)
    - Validación de campos requeridos
    - Caché de configuración
    - Método de validación extensible
    """

    @classmethod
    def _load_from_env(cls, env_var: str, default: Any = None) -> str:
        """Carga una variable de ambiente."""
        _load_env_file()
        return os.getenv(env_var, default or "").strip()

    @classmethod
    def _load_env_int(cls, env_var: str, default: int = 0) -> int:
        """Carga una variable de ambiente como entero."""
        value = cls._load_from_env(env_var)
        return _parse_int(value, default)

    @classmethod
    def _load_env_bool(cls, env_var: str, default: bool = False) -> bool:
        """Carga una variable de ambiente como booleano."""
        value = cls._load_from_env(env_var)
        return _parse_bool(value, default)

    def validate(self) -> None:
        """
        Valida que la configuración sea válida.
        Sobrescribir en subclases si se necesita validación personalizada.
        
        Raises:
            ValueError: Si la configuración no es válida
        """
        pass

    def is_fully_configured(self) -> bool:
        """
        Verifica si todos los campos requeridos están configurados.
        Por defecto asume que ningún campo es None.
        Sobrescribir en subclases para lógica personalizada.
        """
        for field in fields(self):
            value = getattr(self, field.name)
            if value is None or (isinstance(value, str) and not value.strip()):
                return False
        return True

    def to_dict(self) -> dict:
        """Convierte la configuración a diccionario."""
        result = {}
        for field in fields(self):
            value = getattr(self, field.name)
            # Ocultar valores sensibles
            if "password" in field.name.lower() or "secret" in field.name.lower() or "key" in field.name.lower():
                result[field.name] = "***" if value else None
            else:
                result[field.name] = value
        return result

    def __repr__(self) -> str:
        """Representación segura (sin exponer secretos)."""
        dict_repr = self.to_dict()
        items = ", ".join(f"{k}={v}" for k, v in dict_repr.items())
        return f"{self.__class__.__name__}({items})"
