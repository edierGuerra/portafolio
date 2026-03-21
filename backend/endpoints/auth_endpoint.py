from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from schemas.admin import PublicProfileRead, UserRead, UserUpdate
from schemas.auth import AuthTokenResponse, LoginRequest, LogoutRequest, MeResponse, RefreshTokenRequest
from repositories.admin_repository import AdminRepository
from services.auth_service import AuthService
from services.security import hash_password
from endpoints.i18n_utils import get_requested_language, localize_object_fields


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


@router.patch(
    "/me",
    response_model=MeResponse,
    summary="Actualizar usuario autenticado",
    description="Actualiza los campos del perfil del usuario autenticado.",
    response_description="Perfil del usuario autenticado actualizado.",
    responses={
        401: {"description": "Access token invalido o ausente."},
    },
)
async def update_me(
    payload: UserUpdate,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    token = _extract_bearer_token(credentials)
    user = await auth_service.get_current_user(db=db, token=token)

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        return MeResponse(user=UserRead.model_validate(user))

    if "password" in updates:
        password = updates.get("password")
        if password is None or not str(password).strip():
            del updates["password"]
        else:
            updates["password"] = hash_password(str(password))

    # Reset reviewed flags when source language (ES) fields change
    if "name" in updates:
        updates["name_en_reviewed"] = False
    if "professional_profile" in updates:
        updates["professional_profile_en_reviewed"] = False
    if "about_me" in updates:
        updates["about_me_en_reviewed"] = False
    if "location" in updates:
        updates["location_en_reviewed"] = False

    repository = AdminRepository(db)
    updated_user = await repository.update_user(user, updates)
    return MeResponse(user=UserRead.model_validate(updated_user))


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


@router.get(
    "/profile",
    response_model=PublicProfileRead,
    summary="Perfil publico",
    description="Devuelve los datos publicos del perfil del portafolio sin requerir autenticacion.",
    response_description="Datos publicos del perfil.",
    responses={
        404: {"description": "Perfil no encontrado."},
    },
)
async def get_public_profile(request: Request, db: AsyncSession = Depends(get_db)):
    repository = AdminRepository(db)
    user = await repository.get_first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado")
    language = get_requested_language(request)
    localize_object_fields(
        user,
        language,
        ["name", "professional_profile", "about_me", "location"],
    )
    return PublicProfileRead.model_validate(user)
