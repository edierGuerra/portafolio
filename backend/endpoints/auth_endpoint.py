from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from schemas.admin import UserRead
from schemas.auth import AuthTokenResponse, LoginRequest, LogoutRequest, MeResponse, RefreshTokenRequest
from services.auth_service import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={
        401: {"description": "No autenticado o token invalido."},
    },
)
security = HTTPBearer(auto_error=False)
auth_service = AuthService()


def _extract_bearer_token(credentials: Optional[HTTPAuthorizationCredentials]) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    return credentials.credentials


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    summary="Iniciar sesion",
    description="Valida credenciales y devuelve access token y refresh token.",
    response_description="Tokens JWT y perfil del usuario autenticado.",
    responses={
        401: {"description": "Credenciales invalidas."},
    },
)
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


@router.post(
    "/refresh",
    response_model=AuthTokenResponse,
    summary="Renovar tokens",
    description="Recibe un refresh token valido y devuelve un nuevo par de tokens.",
    response_description="Nuevo access token, refresh token y usuario.",
    responses={
        401: {"description": "Refresh token invalido, expirado o revocado."},
    },
)
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


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Obtener usuario autenticado",
    description="Devuelve la informacion del usuario asociada al access token enviado.",
    response_description="Perfil del usuario autenticado.",
    responses={
        401: {"description": "Access token invalido o ausente."},
    },
)
async def me(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    token = _extract_bearer_token(credentials)
    user = await auth_service.get_current_user(db=db, token=token)
    return MeResponse(user=UserRead.model_validate(user))


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cerrar sesion",
    description=(
        "Revoca el refresh token enviado en el body. "
        "El header Authorization es opcional para mantener compatibilidad."
    ),
    response_description="Sesion cerrada sin contenido de respuesta.",
    responses={
        204: {"description": "Logout realizado correctamente."},
        401: {"description": "Refresh token invalido cuando se envia en la peticion."},
    },
)
async def logout(
    payload: LogoutRequest | None = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    # Se mantiene el bearer opcional para no romper clientes existentes.
    _ = credentials
    refresh_token = payload.refresh_token if payload else None
    auth_service.logout(refresh_token=refresh_token)
    return None
