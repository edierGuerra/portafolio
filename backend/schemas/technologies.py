from typing import Optional

from pydantic import BaseModel, ConfigDict


class TechnologyBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    logo: str


class TechnologyCreate(TechnologyBase):
    pass


class TechnologyUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    logo: Optional[str] = None


class TechnologyRead(TechnologyBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
