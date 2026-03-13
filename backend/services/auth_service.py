import base64
import binascii
import hashlib
import hmac
import json
import os
import time
import uuid
from typing import Any, NoReturn

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from models.admin import User
from repositories.admin_repository import AdminRepository
from services.security import verify_password


class AuthService:
    ACCESS_TOKEN_TTL_SECONDS = int(os.getenv("JWT_ACCESS_TOKEN_TTL_SECONDS", "900"))
    REFRESH_TOKEN_TTL_SECONDS = int(os.getenv("JWT_REFRESH_TOKEN_TTL_SECONDS", "604800"))

    def __init__(self):
        self._secret_key = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")
        self._algorithm = "HS256"
        self._revoked_refresh_tokens: dict[str, int] = {}

    async def login(self, db: AsyncSession, email: str, password: str) -> tuple[str, str, User, int, int]:
        repository = AdminRepository(db)
        user = await repository.get_by_email(email)

        if user is None or not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales invalidas",
            )

        access_token = self._create_token(user_id=user.id, token_type="access", ttl_seconds=self.ACCESS_TOKEN_TTL_SECONDS)
        refresh_token = self._create_token(
            user_id=user.id,
            token_type="refresh",
            ttl_seconds=self.REFRESH_TOKEN_TTL_SECONDS,
        )
        return (
            access_token,
            refresh_token,
            user,
            self.ACCESS_TOKEN_TTL_SECONDS,
            self.REFRESH_TOKEN_TTL_SECONDS,
        )

    async def refresh(self, db: AsyncSession, refresh_token: str) -> tuple[str, str, User, int, int]:
        payload = self._decode_and_verify_token(refresh_token, expected_type="refresh")
        self._cleanup_revoked_tokens()

        jti = str(payload.get("jti", ""))
        if not jti or jti in self._revoked_refresh_tokens:
            self._raise_unauthorized("Refresh token invalido o revocado")

        user_id = self._extract_user_id(payload)
        repository = AdminRepository(db)
        user = await repository.get_by_id(user_id)

        if user is None:
            self._raise_unauthorized("Usuario no encontrado")

        self._revoke_refresh_token(payload)

        new_access_token = self._create_token(
            user_id=user_id,
            token_type="access",
            ttl_seconds=self.ACCESS_TOKEN_TTL_SECONDS,
        )
        new_refresh_token = self._create_token(
            user_id=user_id,
            token_type="refresh",
            ttl_seconds=self.REFRESH_TOKEN_TTL_SECONDS,
        )
        return (
            new_access_token,
            new_refresh_token,
            user,
            self.ACCESS_TOKEN_TTL_SECONDS,
            self.REFRESH_TOKEN_TTL_SECONDS,
        )

    async def get_current_user(self, db: AsyncSession, token: str) -> User:
        payload = self._decode_and_verify_token(token, expected_type="access")
        user_id = self._extract_user_id(payload)

        repository = AdminRepository(db)
        user = await repository.get_by_id(user_id)

        if user is None:
            self._raise_unauthorized("Usuario no encontrado")

        return user

    def logout(self, refresh_token: str | None = None) -> None:
        if not refresh_token:
            return

        payload = self._decode_and_verify_token(refresh_token, expected_type="refresh")
        self._revoke_refresh_token(payload)

    def _create_token(self, user_id: int, token_type: str, ttl_seconds: int) -> str:
        now = int(time.time())
        payload = {
            "sub": str(user_id),
            "type": token_type,
            "iat": now,
            "exp": now + ttl_seconds,
            "jti": uuid.uuid4().hex,
        }
        return self._encode_jwt(payload)

    def _encode_jwt(self, payload: dict[str, Any]) -> str:
        header = {"alg": self._algorithm, "typ": "JWT"}
        header_part = self._base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
        payload_part = self._base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
        signing_input = f"{header_part}.{payload_part}"
        signature = hmac.new(self._secret_key.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
        signature_part = self._base64url_encode(signature)
        return f"{signing_input}.{signature_part}"

    def _decode_and_verify_token(self, token: str, expected_type: str) -> dict[str, Any]:
        try:
            header_part, payload_part, signature_part = token.split(".")
        except ValueError:
            self._raise_unauthorized("Token invalido")

        signing_input = f"{header_part}.{payload_part}"
        expected_signature = hmac.new(
            self._secret_key.encode("utf-8"),
            signing_input.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        token_signature = self._base64url_decode(signature_part)

        if not hmac.compare_digest(expected_signature, token_signature):
            self._raise_unauthorized("Token invalido")

        try:
            payload = json.loads(self._base64url_decode(payload_part).decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._raise_unauthorized("Token invalido")

        token_type = payload.get("type")
        if token_type != expected_type:
            self._raise_unauthorized("Tipo de token invalido")

        exp = payload.get("exp")
        if not isinstance(exp, int) or exp <= int(time.time()):
            self._raise_unauthorized("Token invalido o expirado")

        return payload

    def _extract_user_id(self, payload: dict[str, Any]) -> int:
        user_id_raw = payload.get("sub")
        if user_id_raw is None or not isinstance(user_id_raw, (str, int)):
            self._raise_unauthorized("Token invalido")

        try:
            return int(user_id_raw)
        except (TypeError, ValueError):
            self._raise_unauthorized("Token invalido")

    def _revoke_refresh_token(self, payload: dict[str, Any]) -> None:
        jti = str(payload.get("jti", ""))
        exp = payload.get("exp")
        if jti and isinstance(exp, int):
            self._revoked_refresh_tokens[jti] = exp

    def _cleanup_revoked_tokens(self) -> None:
        now = int(time.time())
        expired_jtis = [jti for jti, exp in self._revoked_refresh_tokens.items() if exp <= now]
        for jti in expired_jtis:
            del self._revoked_refresh_tokens[jti]

    @staticmethod
    def _base64url_encode(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

    @staticmethod
    def _base64url_decode(data: str) -> bytes:
        padding = "=" * (-len(data) % 4)
        try:
            return base64.urlsafe_b64decode(f"{data}{padding}".encode("utf-8"))
        except (ValueError, binascii.Error):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

    @staticmethod
    def _raise_unauthorized(detail: str) -> NoReturn:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
