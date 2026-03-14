from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from services.auth_service import AuthService


security = HTTPBearer(auto_error=False)
auth_service = AuthService()


def extract_bearer_token(credentials: Optional[HTTPAuthorizationCredentials]) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    return credentials.credentials


async def require_authenticated_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> None:
    token = extract_bearer_token(credentials)
    await auth_service.get_current_user(db=db, token=token)