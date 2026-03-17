import asyncio
import re
from pathlib import PurePath
from urllib.parse import quote
from uuid import uuid4

import boto3
from botocore.client import BaseClient
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from config.storage_config import StorageSettings, get_storage_settings


class StorageConfigurationError(Exception):
    pass


class StorageOperationError(Exception):
    pass


class ObjectStorageService:
    def __init__(self, settings: StorageSettings | None = None):
        self.settings = settings or get_storage_settings()
        self._client: BaseClient | None = None

    @property
    def is_available(self) -> bool:
        return self.settings.is_configured

    def _sanitize_filename(self, filename: str) -> str:
        safe_name = PurePath(filename).name
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", safe_name)
        safe_name = safe_name.strip("._")
        return safe_name or "file"

    def _sanitize_folder(self, folder: str | None) -> str:
        if not folder:
            return ""
        normalized = folder.replace("\\", "/").strip("/")
        return re.sub(r"[^A-Za-z0-9/_-]", "_", normalized)

    def _build_key(self, filename: str, folder: str | None = None) -> str:
        parts: list[str] = []
        if self.settings.base_path:
            parts.append(self.settings.base_path)

        sanitized_folder = self._sanitize_folder(folder)
        if sanitized_folder:
            parts.append(sanitized_folder)

        unique_name = f"{uuid4().hex}_{self._sanitize_filename(filename)}"
        parts.append(unique_name)
        return "/".join(parts)

    def _get_client(self) -> BaseClient:
        if self._client is not None:
            return self._client

        if not self.settings.is_configured:
            raise StorageConfigurationError(
                "DigitalOcean Spaces no esta configurado. Define DO_SPACES_ENDPOINT, DO_SPACES_BUCKET, "
                "DO_SPACES_REGION, DO_SPACES_KEY y DO_SPACES_SECRET."
            )

        self._client = boto3.client(
            "s3",
            region_name=self.settings.region,
            endpoint_url=self.settings.endpoint_url,
            aws_access_key_id=self.settings.access_key,
            aws_secret_access_key=self.settings.secret_key,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path" if self.settings.force_path_style else "auto"}),
        )
        return self._client

    def get_public_url(self, object_key: str) -> str:
        encoded_key = quote(object_key, safe="/")
        if self.settings.public_url_base:
            base = self.settings.public_url_base.rstrip("/")
            return f"{base}/{encoded_key}"

        endpoint = self.settings.endpoint_url.rstrip("/")
        endpoint_without_protocol = endpoint.replace("https://", "").replace("http://", "")
        return f"https://{self.settings.bucket_name}.{endpoint_without_protocol}/{encoded_key}"

    async def upload_file(self, file_name: str, content: bytes, content_type: str, folder: str | None = None) -> tuple[str, str]:
        object_key = self._build_key(filename=file_name, folder=folder)
        client = self._get_client()

        try:
            put_object_kwargs = {
                "Bucket": self.settings.bucket_name,
                "Key": object_key,
                "Body": content,
                "ContentType": content_type or "application/octet-stream",
            }

            if self.settings.object_acl:
                put_object_kwargs["ACL"] = self.settings.object_acl

            # Ejecutar put_object en thread pool para no bloquear el event loop
            await asyncio.to_thread(client.put_object, **put_object_kwargs)
        except (BotoCoreError, ClientError) as exc:
            raise StorageOperationError("No se pudo subir el archivo a Spaces") from exc

        return object_key, self.get_public_url(object_key)

    async def create_presigned_put_url(
        self,
        *,
        file_name: str,
        content_type: str,
        folder: str | None = None,
        expires_in: int | None = None,
    ) -> tuple[str, str, str]:
        object_key = self._build_key(filename=file_name, folder=folder)
        client = self._get_client()
        expiration = expires_in or self.settings.default_signed_url_ttl

        try:
            upload_url = await asyncio.to_thread(
                client.generate_presigned_url,
                "put_object",
                Params={
                    "Bucket": self.settings.bucket_name,
                    "Key": object_key,
                    "ContentType": content_type or "application/octet-stream",
                },
                ExpiresIn=expiration,
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageOperationError("No se pudo generar URL firmada para upload") from exc

        return object_key, upload_url, self.get_public_url(object_key)

    async def create_presigned_get_url(self, *, object_key: str, expires_in: int | None = None) -> str:
        client = self._get_client()
        expiration = expires_in or self.settings.default_signed_url_ttl

        try:
            return await asyncio.to_thread(
                client.generate_presigned_url,
                "get_object",
                Params={
                    "Bucket": self.settings.bucket_name,
                    "Key": object_key,
                },
                ExpiresIn=expiration,
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageOperationError("No se pudo generar URL firmada para descarga") from exc

    async def delete_file(self, object_key: str) -> None:
        client = self._get_client()
        try:
            await asyncio.to_thread(
                client.delete_object,
                Bucket=self.settings.bucket_name,
                Key=object_key,
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageOperationError("No se pudo eliminar el archivo en Spaces") from exc
