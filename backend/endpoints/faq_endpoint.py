from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.faq_repository import FaqRepository
from schemas.frequently_asked_questions import (
    FrequentlyAskedQuestionCreate,
    FrequentlyAskedQuestionRead,
    FrequentlyAskedQuestionUpdate,
)

router = APIRouter(
    prefix="/faq",
    tags=["faq"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, faq_id: int):
    repo = FaqRepository(db)
    obj = await repo.get_by_id(faq_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta frecuente no encontrada")
    return obj


@router.get(
    "",
    response_model=list[FrequentlyAskedQuestionRead],
    summary="Listar preguntas frecuentes",
    description="Devuelve todas las preguntas frecuentes ordenadas por id.",
    response_description="Listado de preguntas frecuentes.",
)
async def list_faq(db: AsyncSession = Depends(get_db)):
    return await FaqRepository(db).list_all()


@router.get(
    "/{faq_id}",
    response_model=FrequentlyAskedQuestionRead,
    summary="Obtener pregunta frecuente por ID",
    description="Devuelve una pregunta frecuente por su identificador.",
    response_description="Pregunta frecuente encontrada.",
    responses={404: {"description": "Pregunta frecuente no encontrada."}},
)
async def get_faq(faq_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(db, faq_id)


@router.post(
    "",
    response_model=FrequentlyAskedQuestionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear pregunta frecuente",
    description="Crea una nueva pregunta frecuente. Requiere autenticacion.",
    response_description="Pregunta frecuente creada.",
    responses={201: {"description": "Pregunta frecuente creada."}, 401: {"description": "No autenticado."}},
)
async def create_faq(
    payload: FrequentlyAskedQuestionCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await FaqRepository(db).create(payload)


@router.patch(
    "/{faq_id}",
    response_model=FrequentlyAskedQuestionRead,
    summary="Actualizar pregunta frecuente",
    description="Actualiza parcialmente una pregunta frecuente. Requiere autenticacion.",
    response_description="Pregunta frecuente actualizada.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Pregunta frecuente no encontrada."}},
)
async def update_faq(
    faq_id: int,
    payload: FrequentlyAskedQuestionUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, faq_id)
    return await FaqRepository(db).update(obj, payload)


@router.delete(
    "/{faq_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pregunta frecuente",
    description="Elimina una pregunta frecuente por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Pregunta frecuente eliminada."}, 401: {"description": "No autenticado."}, 404: {"description": "Pregunta frecuente no encontrada."}},
)
async def delete_faq(
    faq_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, faq_id)
    await FaqRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
