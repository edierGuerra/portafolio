from typing import Optional

from pydantic import BaseModel, ConfigDict


class AchievementBase(BaseModel):
    title: str
    title_en: Optional[str] = None
    title_en_reviewed: bool = False
    subtitle: str
    subtitle_en: Optional[str] = None
    subtitle_en_reviewed: bool = False


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    title_en: Optional[str] = None
    title_en_reviewed: Optional[bool] = None
    subtitle: Optional[str] = None
    subtitle_en: Optional[str] = None
    subtitle_en_reviewed: Optional[bool] = None


class AchievementRead(AchievementBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
