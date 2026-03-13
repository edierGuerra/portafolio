from typing import Optional

from pydantic import BaseModel, ConfigDict


class MyPhilosophyBase(BaseModel):
    philosophy: str
    image: str


class MyPhilosophyCreate(MyPhilosophyBase):
    pass


class MyPhilosophyUpdate(BaseModel):
    philosophy: Optional[str] = None
    image: Optional[str] = None


class MyPhilosophyRead(MyPhilosophyBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
