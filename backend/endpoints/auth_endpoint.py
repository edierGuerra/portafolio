from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from schemas.admin import UserRead
from schemas.auth import AuthTokenResponse, LoginRequest, LogoutRequest, MeResponse, RefreshTokenRequest
from services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)
auth_service = AuthService()


def _extract_bearer_token(credentials: Optional[HTTPAuthorizationCredentials]) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    return credentials.credentials


@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    access_token, refresh_token, user, expires_in, refresh_expires_in = await auth_service.login(
        db=db,
        email=payload.email,
        password=payload.password,
    )
    return AuthTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        refresh_expires_in=refresh_expires_in,
        user=UserRead.model_validate(user),
    )


@router.post("/refresh", response_model=AuthTokenResponse)
async def refresh(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    access_token, refresh_token, user, expires_in, refresh_expires_in = await auth_service.refresh(
        db=db,
        refresh_token=payload.refresh_token,
    )
    return AuthTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        refresh_expires_in=refresh_expires_in,
        user=UserRead.model_validate(user),
    )


@router.get("/me", response_model=MeResponse)
async def me(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    token = _extract_bearer_token(credentials)
    user = await auth_service.get_current_user(db=db, token=token)
    return MeResponse(user=UserRead.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    payload: LogoutRequest | None = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    # Se mantiene el bearer opcional para no romper clientes existentes.
    _ = credentials
    refresh_token = payload.refresh_token if payload else None
    auth_service.logout(refresh_token=refresh_token)
    return None
