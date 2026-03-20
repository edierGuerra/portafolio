from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from endpoints.i18n_utils import get_requested_language, localize_many, localize_object_fields
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


def _localize_blog_item(blog: object, language: str) -> object:
    localize_object_fields(
        blog,
        language,
        ["title", "slug", "excerpt", "content", "seo_title", "seo_description"],
    )

    category = getattr(blog, "category", None)
    if category is not None:
        localize_object_fields(category, language, ["name", "slug"])

    tags = getattr(blog, "tags", None) or []
    for tag in tags:
        localize_object_fields(tag, language, ["name", "slug"])

    return blog


@router.get(
    "",
    response_model=list[BlogReadWithCategory],
    summary="Listar publicaciones del blog",
    description="Devuelve todas las publicaciones ordenadas por fecha descendente, incluyendo la categoria.",
    response_description="Listado de publicaciones con categoria.",
)
async def list_blogs(request: Request, db: AsyncSession = Depends(get_db)):
    blogs = await BlogRepository(db).list_all(include_unpublished=False)
    language = get_requested_language(request)
    blogs = localize_many(blogs, language, ["title", "slug", "excerpt", "content", "seo_title", "seo_description"])
    return [_localize_blog_item(blog, language) for blog in blogs]


@router.get(
    "/cms",
    response_model=list[BlogReadWithCategory],
    summary="Listar publicaciones del blog para CMS",
    description="Devuelve todas las publicaciones (incluye borradores y archivadas). Requiere autenticacion.",
    response_description="Listado completo de publicaciones con categoria y tags.",
    responses={401: {"description": "No autenticado."}},
)
async def list_blogs_cms(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    blogs = await BlogRepository(db).list_all(include_unpublished=True)
    language = get_requested_language(request)
    blogs = localize_many(blogs, language, ["title", "slug", "excerpt", "content", "seo_title", "seo_description"])
    return [_localize_blog_item(blog, language) for blog in blogs]


@router.get(
    "/{blog_id}",
    response_model=BlogReadWithCategory,
    summary="Obtener publicacion por ID",
    description="Devuelve el detalle de una publicacion incluyendo su categoria.",
    response_description="Publicacion con categoria.",
    responses={404: {"description": "Publicacion no encontrada."}},
)
async def get_blog(blog_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    blog = await _get_or_404(db, blog_id)
    language = get_requested_language(request)
    return _localize_blog_item(blog, language)


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
