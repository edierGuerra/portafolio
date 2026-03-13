from typing import Optional

from pydantic import BaseModel, ConfigDict


class AchievementBase(BaseModel):
    title: str
    subtitle: str


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None


class AchievementRead(AchievementBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
