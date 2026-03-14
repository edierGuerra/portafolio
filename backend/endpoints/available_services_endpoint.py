from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.available_service_repository import AvailableServiceRepository
from schemas.available_services import AvailableServiceCreate, AvailableServiceRead, AvailableServiceUpdate

router = APIRouter(
    prefix="/services",
    tags=["services"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, service_id: int):
    repo = AvailableServiceRepository(db)
    obj = await repo.get_by_id(service_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    return obj


@router.get(
    "",
    response_model=list[AvailableServiceRead],
    summary="Listar servicios disponibles",
    description="Devuelve todos los servicios disponibles ordenados por id.",
    response_description="Listado de servicios.",
)
async def list_services(db: AsyncSession = Depends(get_db)):
    return await AvailableServiceRepository(db).list_all()


@router.get(
    "/{service_id}",
    response_model=AvailableServiceRead,
    summary="Obtener servicio por ID",
    description="Devuelve un servicio disponible por su identificador.",
    response_description="Servicio encontrado.",
    responses={404: {"description": "Servicio no encontrado."}},
)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(db, service_id)


@router.post(
    "",
    response_model=AvailableServiceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear servicio",
    description="Crea un nuevo servicio disponible. Requiere autenticacion.",
    response_description="Servicio creado.",
    responses={201: {"description": "Servicio creado."}, 401: {"description": "No autenticado."}},
)
async def create_service(
    payload: AvailableServiceCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await AvailableServiceRepository(db).create(payload)


@router.patch(
    "/{service_id}",
    response_model=AvailableServiceRead,
    summary="Actualizar servicio",
    description="Actualiza parcialmente un servicio disponible. Requiere autenticacion.",
    response_description="Servicio actualizado.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Servicio no encontrado."}},
)
async def update_service(
    service_id: int,
    payload: AvailableServiceUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, service_id)
    return await AvailableServiceRepository(db).update(obj, payload)


@router.delete(
    "/{service_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar servicio",
    description="Elimina un servicio disponible por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Servicio eliminado."}, 401: {"description": "No autenticado."}, 404: {"description": "Servicio no encontrado."}},
)
async def delete_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, service_id)
    await AvailableServiceRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
