from typing import Optional

from pydantic import BaseModel, ConfigDict


class AvailableServiceBase(BaseModel):
    service: str


class AvailableServiceCreate(AvailableServiceBase):
    pass


class AvailableServiceUpdate(BaseModel):
    service: Optional[str] = None


class AvailableServiceRead(AvailableServiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
