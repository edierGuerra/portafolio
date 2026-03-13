from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExperienceBase(BaseModel):
    position: str
    company: str
    start_date: date
    end_date: date


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    position: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ExperienceRead(ExperienceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
