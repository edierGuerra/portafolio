from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status

from endpoints.dependencies import require_authenticated_user
from schemas.storage import (
    FileUploadResponse,
    PresignedDownloadResponse,
    PresignedUploadRequest,
    PresignedUploadResponse,
)
from services.object_storage_service import ObjectStorageService, StorageConfigurationError, StorageOperationError


router = APIRouter(
    prefix="/files",
    tags=["files"],
    responses={
        401: {"description": "No autenticado."},
    },
)

storage_service = ObjectStorageService()


def _raise_storage_error(exc: Exception):
    if isinstance(exc, StorageConfigurationError):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subir archivo",
    description="Sube un archivo al bucket de DigitalOcean Spaces y devuelve su URL publica.",
    response_description="Informacion del archivo subido.",
    responses={
        201: {"description": "Archivo subido correctamente."},
        400: {"description": "Archivo invalido."},
        413: {"description": "Archivo excede el tamano permitido."},
        503: {"description": "Almacenamiento no configurado."},
    },
)
async def upload_file(
    file: UploadFile = File(...),
    folder: str | None = Form(default=None),
    _: None = Depends(require_authenticated_user),
):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo debe tener nombre")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo esta vacio")

    if len(content) > storage_service.settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"El archivo supera el limite de {storage_service.settings.max_upload_bytes} bytes",
        )

    content_type = file.content_type or "application/octet-stream"

    try:
        object_key, file_url = await storage_service.upload_file(
            file_name=file.filename,
            content=content,
            content_type=content_type,
            folder=folder,
        )
    except (StorageConfigurationError, StorageOperationError) as exc:
        _raise_storage_error(exc)

    return FileUploadResponse(
        object_key=object_key,
        file_url=file_url,
        content_type=content_type,
        size_bytes=len(content),
    )


@router.post(
    "/presigned-upload",
    response_model=PresignedUploadResponse,
    summary="Generar URL firmada para upload",
    description="Genera una URL temporal para subir archivos directamente a Spaces desde el frontend.",
    response_description="URL firmada y metadata del archivo.",
    responses={
        503: {"description": "Almacenamiento no configurado."},
    },
)
async def generate_presigned_upload(
    payload: PresignedUploadRequest,
    _: None = Depends(require_authenticated_user),
):
    expires_in = payload.expires_in or storage_service.settings.default_signed_url_ttl

    try:
        object_key, upload_url, file_url = storage_service.create_presigned_put_url(
            file_name=payload.file_name,
            content_type=payload.content_type,
            folder=payload.folder,
            expires_in=expires_in,
        )
    except (StorageConfigurationError, StorageOperationError) as exc:
        _raise_storage_error(exc)

    return PresignedUploadResponse(
        object_key=object_key,
        upload_url=upload_url,
        file_url=file_url,
        expires_in=expires_in,
    )


@router.get(
    "/presigned-download",
    response_model=PresignedDownloadResponse,
    summary="Generar URL firmada para descarga",
    description="Genera una URL temporal para visualizar/descargar un objeto privado en Spaces.",
    response_description="URL firmada de lectura y metadata.",
    responses={
        400: {"description": "Object key invalida."},
        503: {"description": "Almacenamiento no configurado."},
    },
)
async def generate_presigned_download(
    object_key: str,
    expires_in: int | None = None,
    _: None = Depends(require_authenticated_user),
):
    if not object_key.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="object_key es requerida")

    ttl = expires_in or storage_service.settings.default_signed_url_ttl

    try:
        download_url = storage_service.create_presigned_get_url(
            object_key=object_key,
            expires_in=ttl,
        )
    except (StorageConfigurationError, StorageOperationError) as exc:
        _raise_storage_error(exc)

    return PresignedDownloadResponse(
        object_key=object_key,
        download_url=download_url,
        expires_in=ttl,
    )


@router.delete(
    "/{object_key:path}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar archivo",
    description="Elimina un archivo del bucket usando su object key.",
    response_description="Operacion exitosa sin contenido.",
    responses={
        204: {"description": "Archivo eliminado."},
        503: {"description": "Almacenamiento no configurado."},
    },
)
async def delete_file(object_key: str, _: None = Depends(require_authenticated_user)):
    try:
        storage_service.delete_file(object_key=object_key)
    except (StorageConfigurationError, StorageOperationError) as exc:
        _raise_storage_error(exc)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
