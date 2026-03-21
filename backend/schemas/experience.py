from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExperienceBase(BaseModel):
    position: str
    position_en: Optional[str] = None
    company: str
    company_en: Optional[str] = None
    position_en_reviewed: bool = False
    company_en_reviewed: bool = False
    start_date: date
    end_date: date


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    position: Optional[str] = None
    position_en: Optional[str] = None
    company: Optional[str] = None
    company_en: Optional[str] = None
    position_en_reviewed: Optional[bool] = None
    company_en_reviewed: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ExperienceRead(ExperienceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
