from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    object_key: str
    file_url: str
    content_type: str
    size_bytes: int


class PresignedUploadRequest(BaseModel):
    file_name: str
    content_type: str = "application/octet-stream"
    folder: str | None = None
    expires_in: int | None = None


class PresignedUploadResponse(BaseModel):
    object_key: str
    upload_url: str
    file_url: str
    expires_in: int


class PresignedDownloadResponse(BaseModel):
    object_key: str
    download_url: str
    expires_in: int
