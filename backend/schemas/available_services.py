from typing import Optional

from pydantic import BaseModel, ConfigDict


class AvailableServiceBase(BaseModel):
    service: str
    service_en: Optional[str] = None


class AvailableServiceCreate(AvailableServiceBase):
    pass


class AvailableServiceUpdate(BaseModel):
    service: Optional[str] = None
    service_en: Optional[str] = None


class AvailableServiceRead(AvailableServiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
