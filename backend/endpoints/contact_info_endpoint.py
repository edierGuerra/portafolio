from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from endpoints.i18n_utils import get_requested_language, localize_many, localize_object_fields
from repositories.contact_info_repository import ContactInfoRepository
from schemas.contact_info import ContactInfoCreate, ContactInfoRead, ContactInfoUpdate

router = APIRouter(
    prefix="/contact-info",
    tags=["contact-info"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, contact_id: int):
    repo = ContactInfoRepository(db)
    obj = await repo.get_by_id(contact_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Informacion de contacto no encontrada")
    return obj


@router.get(
    "",
    response_model=list[ContactInfoRead],
    summary="Listar informacion de contacto",
    description="Devuelve todos los registros de informacion de contacto.",
    response_description="Listado de informacion de contacto.",
)
async def list_contact_info(request: Request, db: AsyncSession = Depends(get_db)):
    contact_info = await ContactInfoRepository(db).list_all()
    language = get_requested_language(request)
    return localize_many(contact_info, language, ["email", "phone", "location", "availability"])


@router.get(
    "/{contact_id}",
    response_model=ContactInfoRead,
    summary="Obtener informacion de contacto por ID",
    description="Devuelve un registro de informacion de contacto por su identificador.",
    response_description="Informacion de contacto encontrada.",
    responses={404: {"description": "Informacion de contacto no encontrada."}},
)
async def get_contact_info(contact_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    contact_info = await _get_or_404(db, contact_id)
    language = get_requested_language(request)
    return localize_object_fields(contact_info, language, ["email", "phone", "location", "availability"])


@router.post(
    "",
    response_model=ContactInfoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear informacion de contacto",
    description="Crea un nuevo registro de informacion de contacto. Requiere autenticacion.",
    response_description="Informacion de contacto creada.",
    responses={201: {"description": "Informacion de contacto creada."}, 401: {"description": "No autenticado."}},
)
async def create_contact_info(
    payload: ContactInfoCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await ContactInfoRepository(db).create(payload)


@router.patch(
    "/{contact_id}",
    response_model=ContactInfoRead,
    summary="Actualizar informacion de contacto",
    description="Actualiza parcialmente un registro de informacion de contacto. Requiere autenticacion.",
    response_description="Informacion de contacto actualizada.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Informacion de contacto no encontrada."}},
)
async def update_contact_info(
    contact_id: int,
    payload: ContactInfoUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, contact_id)
    return await ContactInfoRepository(db).update(obj, payload)


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar informacion de contacto",
    description="Elimina un registro de informacion de contacto por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Informacion de contacto eliminada."}, 401: {"description": "No autenticado."}, 404: {"description": "Informacion de contacto no encontrada."}},
)
async def delete_contact_info(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, contact_id)
    await ContactInfoRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
