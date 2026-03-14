from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.achievement_repository import AchievementRepository
from schemas.achievements import AchievementCreate, AchievementRead, AchievementUpdate

router = APIRouter(
    prefix="/achievements",
    tags=["achievements"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, achievement_id: int):
    repo = AchievementRepository(db)
    obj = await repo.get_by_id(achievement_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Logro no encontrado")
    return obj


@router.get(
    "",
    response_model=list[AchievementRead],
    summary="Listar logros",
    description="Devuelve todos los logros registrados ordenados por id.",
    response_description="Listado de logros.",
)
async def list_achievements(db: AsyncSession = Depends(get_db)):
    return await AchievementRepository(db).list_all()


@router.get(
    "/{achievement_id}",
    response_model=AchievementRead,
    summary="Obtener logro por ID",
    description="Devuelve un logro especifico por su identificador.",
    response_description="Logro encontrado.",
    responses={404: {"description": "Logro no encontrado."}},
)
async def get_achievement(achievement_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(db, achievement_id)


@router.post(
    "",
    response_model=AchievementRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear logro",
    description="Crea un nuevo logro. Requiere autenticacion.",
    response_description="Logro creado.",
    responses={201: {"description": "Logro creado."}, 401: {"description": "No autenticado."}},
)
async def create_achievement(
    payload: AchievementCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await AchievementRepository(db).create(payload)


@router.patch(
    "/{achievement_id}",
    response_model=AchievementRead,
    summary="Actualizar logro",
    description="Actualiza parcialmente un logro. Requiere autenticacion.",
    response_description="Logro actualizado.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Logro no encontrado."}},
)
async def update_achievement(
    achievement_id: int,
    payload: AchievementUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, achievement_id)
    return await AchievementRepository(db).update(obj, payload)


@router.delete(
    "/{achievement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar logro",
    description="Elimina un logro por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Logro eliminado."}, 401: {"description": "No autenticado."}, 404: {"description": "Logro no encontrado."}},
)
async def delete_achievement(
    achievement_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, achievement_id)
    await AchievementRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
