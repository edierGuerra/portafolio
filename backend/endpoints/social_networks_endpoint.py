from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.social_network_repository import SocialNetworkRepository
from schemas.social_networks import SocialNetworkCreate, SocialNetworkRead, SocialNetworkUpdate

router = APIRouter(
    prefix="/social-networks",
    tags=["social-networks"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, network_id: int):
    repo = SocialNetworkRepository(db)
    obj = await repo.get_by_id(network_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Red social no encontrada")
    return obj


@router.get(
    "",
    response_model=list[SocialNetworkRead],
    summary="Listar redes sociales",
    description="Devuelve todas las redes sociales registradas ordenadas por id.",
    response_description="Listado de redes sociales.",
)
async def list_social_networks(db: AsyncSession = Depends(get_db)):
    return await SocialNetworkRepository(db).list_all()


@router.get(
    "/{network_id}",
    response_model=SocialNetworkRead,
    summary="Obtener red social por ID",
    description="Devuelve una red social por su identificador.",
    response_description="Red social encontrada.",
    responses={404: {"description": "Red social no encontrada."}},
)
async def get_social_network(network_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(db, network_id)


@router.post(
    "",
    response_model=SocialNetworkRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear red social",
    description="Crea una nueva red social. Requiere autenticacion.",
    response_description="Red social creada.",
    responses={201: {"description": "Red social creada."}, 401: {"description": "No autenticado."}},
)
async def create_social_network(
    payload: SocialNetworkCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await SocialNetworkRepository(db).create(payload)


@router.patch(
    "/{network_id}",
    response_model=SocialNetworkRead,
    summary="Actualizar red social",
    description="Actualiza parcialmente una red social. Requiere autenticacion.",
    response_description="Red social actualizada.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Red social no encontrada."}},
)
async def update_social_network(
    network_id: int,
    payload: SocialNetworkUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, network_id)
    return await SocialNetworkRepository(db).update(obj, payload)


@router.delete(
    "/{network_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar red social",
    description="Elimina una red social por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Red social eliminada."}, 401: {"description": "No autenticado."}, 404: {"description": "Red social no encontrada."}},
)
async def delete_social_network(
    network_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, network_id)
    await SocialNetworkRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
