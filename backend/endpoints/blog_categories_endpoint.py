from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from repositories.blog_category_repository import BlogCategoryRepository
from schemas.blog_category import BlogCategoryCreate, BlogCategoryRead, BlogCategoryUpdate

router = APIRouter(
    prefix="/blog-categories",
    tags=["blog-categories"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)


async def _get_or_404(db: AsyncSession, category_id: int):
    repo = BlogCategoryRepository(db)
    obj = await repo.get_by_id(category_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria no encontrada")
    return obj


@router.get(
    "",
    response_model=list[BlogCategoryRead],
    summary="Listar categorias de blog",
    description="Devuelve todas las categorias de blog ordenadas por id.",
    response_description="Listado de categorias.",
)
async def list_blog_categories(db: AsyncSession = Depends(get_db)):
    return await BlogCategoryRepository(db).list_all()


@router.get(
    "/{category_id}",
    response_model=BlogCategoryRead,
    summary="Obtener categoria de blog por ID",
    description="Devuelve una categoria de blog por su identificador.",
    response_description="Categoria encontrada.",
    responses={404: {"description": "Categoria no encontrada."}},
)
async def get_blog_category(category_id: int, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(db, category_id)


@router.post(
    "",
    response_model=BlogCategoryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear categoria de blog",
    description="Crea una nueva categoria de blog. Requiere autenticacion.",
    response_description="Categoria creada.",
    responses={201: {"description": "Categoria creada."}, 401: {"description": "No autenticado."}},
)
async def create_blog_category(
    payload: BlogCategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    return await BlogCategoryRepository(db).create(payload)


@router.patch(
    "/{category_id}",
    response_model=BlogCategoryRead,
    summary="Actualizar categoria de blog",
    description="Actualiza parcialmente una categoria de blog. Requiere autenticacion.",
    response_description="Categoria actualizada.",
    responses={401: {"description": "No autenticado."}, 404: {"description": "Categoria no encontrada."}},
)
async def update_blog_category(
    category_id: int,
    payload: BlogCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, category_id)
    return await BlogCategoryRepository(db).update(obj, payload)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar categoria de blog",
    description="Elimina una categoria de blog por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={204: {"description": "Categoria eliminada."}, 401: {"description": "No autenticado."}, 404: {"description": "Categoria no encontrada."}},
)
async def delete_blog_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    obj = await _get_or_404(db, category_id)
    await BlogCategoryRepository(db).delete(obj)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
