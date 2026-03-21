from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from endpoints.i18n_utils import get_requested_language, localize_many, localize_object_fields
from repositories.interest_repository import InterestRepository
from schemas.interests import InterestCreate, InterestRead, InterestUpdate

router = APIRouter(
    prefix="/interests",
    tags=["interests"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, interest_id: int):
    repo = InterestRepository(db)
    obj = await repo.get_by_id(interest_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interes no encontrado")
    return obj


@router.get(
    "",
    response_model=list[InterestRead],
    summary="Listar intereses",
    description="Devuelve todos los intereses personales/profesionales ordenados por id.",
    response_description="Listado de intereses.",
)
async def list_interests(request: Request, db: AsyncSession = Depends(get_db)):
    interests = await InterestRepository(db).list_all()
    language = get_requested_language(request)
    return localize_many(interests, language, ["interest"])


@router.get(
    "/{interest_id}",
    response_model=InterestRead,
    summary="Obtener interes por ID",
    description="Devuelve un interes por su identificador.",
    response_description="Interes encontrado.",
    responses={404: {"description": "Interes no encontrado."}},
)
async def get_interest(interest_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    interest = await _get_or_404(db, interest_id)
    language = get_requested_language(request)
    return localize_object_fields(interest, language, ["interest"])


@router.post(
    "",
    response_model=InterestRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear interes",
    description="Crea un nuevo interes. Requiere autenticacion.",
    response_description="Interes creado.",
    responses={201: {"description": "Interes creado."}, 401: {"description": "No autenticado."}},
)
async def create_interest(
    payload: InterestCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await InterestRepository(db).create(payload)


@router.patch(
    "/{interest_id}",
    response_model=InterestRead,
    summary="Actualizar interes",
    description="Actualiza parcialmente un interes. Requiere autenticacion.",
    response_description="Interes actualizado.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Interes no encontrado."}},
)
async def update_interest(
    interest_id: int,
    payload: InterestUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, interest_id)
    if payload.interest is not None:
        payload.interest_en_reviewed = False
    return await InterestRepository(db).update(obj, payload)


@router.delete(
    "/{interest_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar interes",
    description="Elimina un interes por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Interes eliminado."}, 401: {"description": "No autenticado."}, 404: {"description": "Interes no encontrado."}},
)
async def delete_interest(
    interest_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, interest_id)
    await InterestRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
