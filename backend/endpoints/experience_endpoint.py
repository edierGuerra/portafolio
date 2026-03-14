from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.experience_repository import ExperienceRepository
from schemas.experience import ExperienceCreate, ExperienceRead, ExperienceUpdate


router = APIRouter(
    prefix="/experience",
    tags=["experience"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_experience_or_404(db: AsyncSession, experience_id: int):
    repository = ExperienceRepository(db)
    experience = await repository.get_by_id(experience_id)
    if experience is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiencia no encontrada")
    return experience


@router.get(
    "",
    response_model=list[ExperienceRead],
    summary="Listar experiencias",
    description="Obtiene el listado de experiencias profesionales ordenadas por fecha.",
    response_description="Listado de experiencias.",
)
async def list_experience(db: AsyncSession = Depends(get_db)):
    repository = ExperienceRepository(db)
    return await repository.list_all()


@router.get(
    "/{experience_id}",
    response_model=ExperienceRead,
    summary="Obtener experiencia por ID",
    description="Devuelve una experiencia profesional segun su identificador.",
    response_description="Experiencia encontrada.",
    responses={
        404: {"description": "Experiencia no encontrada."},
    },
)
async def get_experience(experience_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_experience_or_404(db, experience_id)


@router.post(
    "",
    response_model=ExperienceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear experiencia",
    description="Crea una nueva experiencia profesional. Requiere autenticacion.",
    response_description="Experiencia creada correctamente.",
    responses={
        201: {"description": "Experiencia creada."},
        401: {"description": "No autenticado."},
    },
)
async def create_experience(
    payload: ExperienceCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = ExperienceRepository(db)
    return await repository.create(payload)


@router.patch(
    "/{experience_id}",
    response_model=ExperienceRead,
    summary="Actualizar experiencia",
    description="Actualiza parcialmente una experiencia profesional. Requiere autenticacion.",
    response_description="Experiencia actualizada.",
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Experiencia no encontrada."},
    },
)
async def update_experience(
    experience_id: int,
    payload: ExperienceUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = ExperienceRepository(db)
    experience = await _get_experience_or_404(db, experience_id)
    return await repository.update(experience, payload)


@router.delete(
    "/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar experiencia",
    description="Elimina una experiencia por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={
        204: {"description": "Experiencia eliminada."},
        401: {"description": "No autenticado."},
        404: {"description": "Experiencia no encontrada."},
    },
)
async def delete_experience(
    experience_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = ExperienceRepository(db)
    experience = await _get_experience_or_404(db, experience_id)
    await repository.delete(experience)
    return Response(status_code=status.HTTP_204_NO_CONTENT)