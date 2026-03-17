from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.auth_service import AuthService


security = HTTPBearer(auto_error=False)
auth_service = AuthService()


def extract_bearer_token(credentials: Optional[HTTPAuthorizationCredentials]) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    return credentials.credentials


async def require_authenticated_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> None:
    """Valida que el request tenga token JWT válido. No requiere sesión de BD."""
    token = extract_bearer_token(credentials)
    # Solo valida el token, no hace query a BD
    auth_service._decode_and_verify_token(token, expected_type="access")
