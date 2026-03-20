from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import unquote, urlparse

from config.database_config import get_db
from endpoints.dependencies import require_authenticated_user
from endpoints.i18n_utils import get_requested_language, localize_many, localize_object_fields
from repositories.project_repository import ProjectRepository
from schemas.projects import ProjectCreate, ProjectReadWithTechnologies, ProjectUpdate
from services.object_storage_service import ObjectStorageService, StorageOperationError


router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Recurso no encontrado."},
    },
)

storage_service = ObjectStorageService()


def _extract_object_key_from_image(image: str) -> str | None:
    raw = (image or "").strip()
    if not raw:
        return None

    # Si viene como object key directa, la usamos tal cual.
    if "://" not in raw:
        return unquote(raw.lstrip("/"))

    try:
        parsed = urlparse(raw)
    except ValueError:
        return None

    host = (parsed.hostname or "").lower()
    path_parts = [part for part in parsed.path.split("/") if part]
    host_parts = host.split(".")

    if not path_parts:
        return None

    # bucket.region.digitaloceanspaces.com/<object_key>
    if (
        len(host_parts) >= 4
        and host_parts[-2] == "digitaloceanspaces"
        and host_parts[-1] == "com"
    ):
        return unquote("/".join(path_parts))

    # region.digitaloceanspaces.com/bucket/<object_key>
    if (
        len(host_parts) >= 3
        and host_parts[-2] == "digitaloceanspaces"
        and host_parts[-1] == "com"
        and len(path_parts) >= 2
    ):
        return unquote("/".join(path_parts[1:]))

    # Si coincide con la base publica configurada, extraemos la parte restante.
    public_base = storage_service.settings.public_url_base.strip()
    if public_base:
        try:
            parsed_base = urlparse(public_base)
            if (parsed_base.hostname or "").lower() == host:
                base_path = parsed_base.path.rstrip("/")
                current_path = parsed.path
                if base_path and current_path.startswith(f"{base_path}/"):
                    key = current_path[len(base_path) + 1 :]
                    return unquote(key)
                return unquote(current_path.lstrip("/"))
        except ValueError:
            return None

    return None


def _resolve_public_project_image(image: str) -> str:
    if not storage_service.is_available:
        return image

    object_key = _extract_object_key_from_image(image)
    if not object_key:
        return image

    try:
        return storage_service.create_presigned_get_url(
            object_key=object_key,
            expires_in=3600,
        )
    except StorageOperationError:
        return image


async def _get_project_or_404(db: AsyncSession, project_id: int):
    repository = ProjectRepository(db)
    project = await repository.get_by_id(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    return project


def _localize_project_item(project: object, language: str) -> object:
    localize_object_fields(project, language, ["title", "description", "state"])
    technologies = getattr(project, "technologies", None) or []
    for technology in technologies:
        localize_object_fields(technology, language, ["name"])
    return project


@router.get(
    "",
    response_model=list[ProjectReadWithTechnologies],
    summary="Listar proyectos",
    description="Obtiene todos los proyectos registrados ordenados por id ascendente.",
    response_description="Listado de proyectos.",
)
async def list_projects(
    request: Request,
    published: bool | None = Query(default=None, description="Filtra por estado de publicacion"),
    db: AsyncSession = Depends(get_db),
):
    repository = ProjectRepository(db)
    projects = await repository.list_all(published=published)
    language = get_requested_language(request)
    projects = localize_many(projects, language, ["title", "description", "state"])

    # Para la parte publica devolvemos enlaces firmados y evitamos 403 por objetos privados.
    if published is True:
        for project in projects:
            project.image = _resolve_public_project_image(project.image)

    return [_localize_project_item(project, language) for project in projects]


@router.get(
    "/{project_id}",
    response_model=ProjectReadWithTechnologies,
    summary="Obtener proyecto por ID",
    description="Devuelve el detalle de un proyecto por su identificador.",
    response_description="Proyecto encontrado.",
    responses={
        404: {"description": "Proyecto no encontrado."},
    },
)
async def get_project(project_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    project = await _get_project_or_404(db, project_id)
    language = get_requested_language(request)
    return _localize_project_item(project, language)


@router.post(
    "",
    response_model=ProjectReadWithTechnologies,
    status_code=status.HTTP_201_CREATED,
    summary="Crear proyecto",
    description="Crea un nuevo proyecto. Requiere usuario autenticado.",
    response_description="Proyecto creado correctamente.",
    responses={
        201: {"description": "Proyecto creado."},
        401: {"description": "No autenticado."},
    },
)
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = ProjectRepository(db)
    try:
        return await repository.create(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch(
    "/{project_id}",
    response_model=ProjectReadWithTechnologies,
    summary="Actualizar proyecto",
    description="Actualiza de forma parcial los campos de un proyecto. Requiere autenticacion.",
    response_description="Proyecto actualizado.",
    responses={
        401: {"description": "No autenticado."},
        404: {"description": "Proyecto no encontrado."},
    },
)
async def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = ProjectRepository(db)
    project = await _get_project_or_404(db, project_id)
    try:
        return await repository.update(project, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar proyecto",
    description="Elimina un proyecto por ID. Requiere autenticacion.",
    response_description="Operacion exitosa sin contenido.",
    responses={
        204: {"description": "Proyecto eliminado."},
        401: {"description": "No autenticado."},
        404: {"description": "Proyecto no encontrado."},
    },
)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_authenticated_user),
):
    repository = ProjectRepository(db)
    project = await _get_project_or_404(db, project_id)
    await repository.delete(project)
    return Response(status_code=status.HTTP_204_NO_CONTENT)