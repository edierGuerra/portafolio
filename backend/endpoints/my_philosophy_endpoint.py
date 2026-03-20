from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from endpoints.i18n_utils import get_requested_language, localize_many, localize_object_fields
from repositories.my_philosophy_repository import MyPhilosophyRepository
from schemas.my_philosophy import MyPhilosophyCreate, MyPhilosophyRead, MyPhilosophyUpdate

router = APIRouter(
    prefix="/philosophy",
    tags=["philosophy"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, philosophy_id: int):
    repo = MyPhilosophyRepository(db)
    obj = await repo.get_by_id(philosophy_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filosofia no encontrada")
    return obj


@router.get(
    "",
    response_model=list[MyPhilosophyRead],
    summary="Listar filosofias",
    description="Devuelve todos los registros de filosofia personal/profesional.",
    response_description="Listado de filosofias.",
)
async def list_philosophy(request: Request, db: AsyncSession = Depends(get_db)):
    philosophies = await MyPhilosophyRepository(db).list_all()
    language = get_requested_language(request)
    return localize_many(philosophies, language, ["philosophy"])


@router.get(
    "/{philosophy_id}",
    response_model=MyPhilosophyRead,
    summary="Obtener filosofia por ID",
    description="Devuelve un registro de filosofia por su identificador.",
    response_description="Filosofia encontrada.",
    responses={404: {"description": "Filosofia no encontrada."}},
)
async def get_philosophy(philosophy_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    philosophy = await _get_or_404(db, philosophy_id)
    language = get_requested_language(request)
    return localize_object_fields(philosophy, language, ["philosophy"])


@router.post(
    "",
    response_model=MyPhilosophyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear filosofia",
    description="Crea un nuevo registro de filosofia. Requiere autenticacion.",
    response_description="Filosofia creada.",
    responses={201: {"description": "Filosofia creada."}, 401: {"description": "No autenticado."}},
)
async def create_philosophy(
    payload: MyPhilosophyCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await MyPhilosophyRepository(db).create(payload)


@router.patch(
    "/{philosophy_id}",
    response_model=MyPhilosophyRead,
    summary="Actualizar filosofia",
    description="Actualiza parcialmente un registro de filosofia. Requiere autenticacion.",
    response_description="Filosofia actualizada.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Filosofia no encontrada."}},
)
async def update_philosophy(
    philosophy_id: int,
    payload: MyPhilosophyUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, philosophy_id)
    return await MyPhilosophyRepository(db).update(obj, payload)


@router.delete(
    "/{philosophy_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar filosofia",
    description="Elimina un registro de filosofia por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Filosofia eliminada."}, 401: {"description": "No autenticado."}, 404: {"description": "Filosofia no encontrada."}},
)
async def delete_philosophy(
    philosophy_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, philosophy_id)
    await MyPhilosophyRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
