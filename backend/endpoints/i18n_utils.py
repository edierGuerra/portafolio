from __future__ import annotations

from fastapi import Request


def get_requested_language(request: Request) -> str:
    """Devuelve 'en' o 'es' segun Accept-Language (fallback: es)."""
    raw = (request.headers.get("accept-language") or "").lower()
    if "en" in raw:
        return "en"
    return "es"


def localize_object_fields(obj: object, language: str, fields: list[str]) -> object:
    """
    Sobrescribe campos base con su variante *_en cuando idioma es en
    y exista valor no vacio.
    """
    if language != "en" or obj is None:
        return obj

    for field in fields:
        localized_field = f"{field}_en"
        if hasattr(obj, localized_field):
            localized_value = getattr(obj, localized_field)
            if isinstance(localized_value, str) and localized_value.strip():
                setattr(obj, field, localized_value)

    return obj


def localize_many(items: list[object], language: str, fields: list[str]) -> list[object]:
    if language != "en":
        return items
    for item in items:
        localize_object_fields(item, language, fields)
    return items
