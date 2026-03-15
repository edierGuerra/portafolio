from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.blog_repository import BlogRepository
from schemas.blog import BlogCreate, BlogRead, BlogReadWithCategory, BlogUpdate

router = APIRouter(
    prefix="/blog",
    tags=["blog"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, blog_id: int):
    repo = BlogRepository(db)
    obj = await repo.get_by_id(blog_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicacion no encontrada")
    return obj


@router.get(
    "",
    response_model=list[BlogReadWithCategory],
    summary="Listar publicaciones del blog",
    description="Devuelve todas las publicaciones ordenadas por fecha descendente, incluyendo la categoria.",
    response_description="Listado de publicaciones con categoria.",
)
async def list_blogs(db: AsyncSession = Depends(get_db)):
    return await BlogRepository(db).list_all(include_unpublished=False)


@router.get(
    "/cms",
    response_model=list[BlogReadWithCategory],
    summary="Listar publicaciones del blog para CMS",
    description="Devuelve todas las publicaciones (incluye borradores y archivadas). Requiere autenticacion.",
    response_description="Listado completo de publicaciones con categoria y tags.",
    responses={401: {"description": "No autenticado."}},
)
async def list_blogs_cms(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await BlogRepository(db).list_all(include_unpublished=True)


@router.get(
    "/{blog_id}",
    response_model=BlogReadWithCategory,
    summary="Obtener publicacion por ID",
    description="Devuelve el detalle de una publicacion incluyendo su categoria.",
    response_description="Publicacion con categoria.",
    responses={404: {"description": "Publicacion no encontrada."}},
)
async def get_blog(blog_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(db, blog_id)


@router.post(
    "",
    response_model=BlogReadWithCategory,
    status_code=status.HTTP_201_CREATED,
    summary="Crear publicacion",
    description="Crea una nueva publicacion del blog. Requiere autenticacion.",
    response_description="Publicacion creada con su categoria.",
    responses={201: {"description": "Publicacion creada."}, 401: {"description": "No autenticado."}},
)
async def create_blog(
    payload: BlogCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    try:
        return await BlogRepository(db).create(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch(
    "/{blog_id}",
    response_model=BlogReadWithCategory,
    summary="Actualizar publicacion",
    description="Actualiza parcialmente una publicacion del blog. Requiere autenticacion.",
    response_description="Publicacion actualizada con categoria.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Publicacion no encontrada."}},
)
async def update_blog(
    blog_id: int,
    payload: BlogUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, blog_id)
    try:
        return await BlogRepository(db).update(obj, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete(
    "/{blog_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar publicacion",
    description="Elimina una publicacion del blog por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Publicacion eliminada."}, 401: {"description": "No autenticado."}, 404: {"description": "Publicacion no encontrada."}},
)
async def delete_blog(
    blog_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, blog_id)
    await BlogRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
