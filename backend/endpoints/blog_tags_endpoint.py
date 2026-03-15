from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.blog_tag_repository import BlogTagRepository
from schemas.blog_tag import BlogTagCreate, BlogTagRead, BlogTagUpdate

router = APIRouter(
    prefix="/blog-tags",
    tags=["blog-tags"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, tag_id: int):
    repo = BlogTagRepository(db)
    obj = await repo.get_by_id(tag_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag no encontrado")
    return obj


@router.get(
    "",
    response_model=list[BlogTagRead],
    summary="Listar tags de blog",
    description="Devuelve todos los tags de blog ordenados por nombre.",
    response_description="Listado de tags.",
)
async def list_blog_tags(db: AsyncSession = Depends(get_db)):
    return await BlogTagRepository(db).list_all()


@router.get(
    "/{tag_id}",
    response_model=BlogTagRead,
    summary="Obtener tag por ID",
    description="Devuelve un tag de blog por su identificador.",
    response_description="Tag encontrado.",
    responses={404: {"description": "Tag no encontrado."}},
)
async def get_blog_tag(tag_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(db, tag_id)


@router.post(
    "",
    response_model=BlogTagRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear tag de blog",
    description="Crea un nuevo tag de blog. Requiere autenticacion.",
    response_description="Tag creado.",
    responses={201: {"description": "Tag creado."}, 401: {"description": "No autenticado."}},
)
async def create_blog_tag(
    payload: BlogTagCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await BlogTagRepository(db).create(payload)


@router.patch(
    "/{tag_id}",
    response_model=BlogTagRead,
    summary="Actualizar tag de blog",
    description="Actualiza parcialmente un tag de blog. Requiere autenticacion.",
    response_description="Tag actualizado.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Tag no encontrado."}},
)
async def update_blog_tag(
    tag_id: int,
    payload: BlogTagUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, tag_id)
    return await BlogTagRepository(db).update(obj, payload)


@router.delete(
    "/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar tag de blog",
    description="Elimina un tag de blog por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Tag eliminado."}, 401: {"description": "No autenticado."}, 404: {"description": "Tag no encontrado."}},
)
async def delete_blog_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, tag_id)
    await BlogTagRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
