from typing import Optional

from pydantic import BaseModel, ConfigDict


class TechnologyBase(BaseModel):
    name: str
    logo: str


class TechnologyCreate(TechnologyBase):
    pass


class TechnologyUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None


class TechnologyRead(TechnologyBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
