"""Translation service using multiple providers for i18n content."""
import asyncio
import os
from typing import Optional
from urllib.parse import urlencode

import requests


class TranslationService:
    """Service for translating content using multiple providers with fallback."""

    _base_url = os.getenv("LIBRETRANSLATE_BASE_URL", "http://libretranslate:5000").rstrip("/")
    LIBRETRANSLATE_API_URL = os.getenv(
        "LIBRETRANSLATE_API_URL",
        f"{_base_url}/translate",
    )
    LIBRETRANSLATE_PUBLIC_API_URL = os.getenv(
        "LIBRETRANSLATE_PUBLIC_API_URL",
        "https://translate.argosopentech.com/translate",
    )
    LIBRETRANSLATE_API_KEY = os.getenv("LIBRETRANSLATE_API_KEY", "")
    REQUEST_HEADERS = {
        "User-Agent": "portfolio-cms-translation/1.0",
        "Accept": "application/json",
    }
    SOURCE_LANGUAGE = "es"
    TARGET_LANGUAGE = "en"

    @staticmethod
    def _post_google_translation(text: str) -> Optional[dict]:
        params = {
            "client": "gtx",
            "sl": TranslationService.SOURCE_LANGUAGE,
            "tl": TranslationService.TARGET_LANGUAGE,
            "dt": "t",
            "q": text,
        }
        url = "https://translate.googleapis.com/translate_a/single"
        response = requests.get(
            f"{url}?{urlencode(params)}",
            headers=TranslationService.REQUEST_HEADERS,
            timeout=10,
        )
        if response.status_code != 200:
            return None
        data = response.json()
        if not data or not isinstance(data, list) or not data[0]:
            return None
        translated_chunks = [chunk[0] for chunk in data[0] if chunk and chunk[0]]
        translated_text = "".join(translated_chunks).strip()
        if not translated_text:
            return None
        return {
            "translated_text": translated_text,
            "source_language": TranslationService.SOURCE_LANGUAGE,
            "target_language": TranslationService.TARGET_LANGUAGE,
            "confidence": 0.65,
            "is_draft": True,
        }

    @staticmethod
    def _post_libretranslate(url: str, payload: dict) -> Optional[dict]:
        request_payload = dict(payload)
        if TranslationService.LIBRETRANSLATE_API_KEY:
            request_payload["api_key"] = TranslationService.LIBRETRANSLATE_API_KEY

        response = requests.post(
            url,
            json=request_payload,
            headers=TranslationService.REQUEST_HEADERS,
            timeout=10,
        )
        if response.status_code != 200:
            return None
        data = response.json()
        translated_text = data.get("translatedText", "")
        if not translated_text:
            return None
        return {
            "translated_text": translated_text,
            "source_language": TranslationService.SOURCE_LANGUAGE,
            "target_language": TranslationService.TARGET_LANGUAGE,
            "confidence": 0.7,
            "is_draft": True,
        }

    @staticmethod
    async def _try_provider(provider_name: str, callback) -> Optional[dict]:
        try:
            return await asyncio.to_thread(callback)
        except Exception as error:
            print(f"Translation provider '{provider_name}' failed: {str(error)}")
            return None
    
    @staticmethod
    async def translate_text(text: str) -> Optional[dict]:
        """
        Translate text from Spanish to English using LibreTranslate API
        
        Args:
            text: Spanish text to translate
            
        Returns:
            dict with keys: {
                'translated_text': str,
                'source_language': str,
                'target_language': str,
                'confidence': float (estimated, 0.7 for auto-translation)
            }
            or None if translation fails
        """
        if not text or not text.strip():
            return None
        
        payload = {
            "q": text,
            "source": TranslationService.SOURCE_LANGUAGE,
            "target": TranslationService.TARGET_LANGUAGE,
        }
        
        providers = [
            (
                "libretranslate_internal",
                lambda: TranslationService._post_libretranslate(
                    TranslationService.LIBRETRANSLATE_API_URL,
                    payload,
                ),
            ),
            (
                "libretranslate_public",
                lambda: TranslationService._post_libretranslate(
                    TranslationService.LIBRETRANSLATE_PUBLIC_API_URL,
                    payload,
                ),
            ),
            (
                "google_public",
                lambda: TranslationService._post_google_translation(text),
            ),
        ]

        for provider_name, provider_callback in providers:
            result = await TranslationService._try_provider(
                provider_name,
                provider_callback,
            )
            if result:
                return result
        
        return None
    
    @staticmethod
    async def translate_batch(texts: list[str]) -> list[Optional[dict]]:
        """
        Translate multiple texts
        
        Args:
            texts: List of Spanish texts to translate
            
        Returns:
            List of translation results (same length as input)
        """
        results = []
        for text in texts:
            result = await TranslationService.translate_text(text)
            results.append(result)
        return results
