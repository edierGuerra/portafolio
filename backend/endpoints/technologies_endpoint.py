from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.technology_repository import TechnologyRepository
from schemas.technologies import TechnologyCreate, TechnologyRead, TechnologyUpdate


router = APIRouter(
    prefix="/technologies",
    tags=["technologies"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_technology_or_404(db: AsyncSession, technology_id: int):
    repository = TechnologyRepository(db)
    technology = await repository.get_by_id(technology_id)
    if technology is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tecnologia no encontrada")
    return technology


@router.get(
    "",
    response_model=list[TechnologyRead],
    summary="Listar tecnologias",
    description="Obtiene todas las tecnologias registradas ordenadas por id ascendente.",
    response_description="Listado de tecnologias.",
)
async def list_technologies(db: AsyncSession = Depends(get_db)):
    repository = TechnologyRepository(db)
    return await repository.list_all()


@router.get(
    "/{technology_id}",
    response_model=TechnologyRead,
    summary="Obtener tecnologia por ID",
    description="Devuelve una tecnologia especifica por su identificador.",
    response_description="Tecnologia encontrada.",
    responses={
        404: {"description": "Tecnologia no encontrada."},
    },
)
async def get_technology(technology_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_technology_or_404(db, technology_id)


@router.post(
    "",
    response_model=TechnologyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear tecnologia",
    description="Crea una nueva tecnologia. Requiere usuario autenticado.",
    response_description="Tecnologia creada correctamente.",
    responses={
        201: {"description": "Tecnologia creada."},
        401: {"description": "No autenticado."},
    },
)
async def create_technology(
    payload: TechnologyCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = TechnologyRepository(db)
    return await repository.create(payload)


@router.patch(
    "/{technology_id}",
    response_model=TechnologyRead,
    summary="Actualizar tecnologia",
    description="Actualiza de forma parcial los datos de una tecnologia. Requiere autenticacion.",
    response_description="Tecnologia actualizada.",
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Tecnologia no encontrada."},
    },
)
async def update_technology(
    technology_id: int,
    payload: TechnologyUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = TechnologyRepository(db)
    technology = await _get_technology_or_404(db, technology_id)
    return await repository.update(technology, payload)


@router.delete(
    "/{technology_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar tecnologia",
    description="Elimina una tecnologia por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={
        204: {"description": "Tecnologia eliminada."},
        401: {"description": "No autenticado."},
        404: {"description": "Tecnologia no encontrada."},
    },
)
async def delete_technology(
    technology_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = TechnologyRepository(db)
    technology = await _get_technology_or_404(db, technology_id)
    await repository.delete(technology)
    return Response(status_code=status.HTTP_204_NO_CONTENT)