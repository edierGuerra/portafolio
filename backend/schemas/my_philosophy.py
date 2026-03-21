from typing import Optional

from pydantic import BaseModel, ConfigDict


class MyPhilosophyBase(BaseModel):
    philosophy: str
    philosophy_en: Optional[str] = None
    philosophy_en_reviewed: bool = False
    image: str


class MyPhilosophyCreate(MyPhilosophyBase):
    pass


class MyPhilosophyUpdate(BaseModel):
    philosophy: Optional[str] = None
    philosophy_en: Optional[str] = None
    philosophy_en_reviewed: Optional[bool] = None
    image: Optional[str] = None


class MyPhilosophyRead(MyPhilosophyBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
