from typing import Optional

from pydantic import BaseModel, ConfigDict


class InterestBase(BaseModel):
    interest: str
    interest_en: Optional[str] = None
    interest_en_reviewed: bool = False


class InterestCreate(InterestBase):
    pass


class InterestUpdate(BaseModel):
    interest: Optional[str] = None
    interest_en: Optional[str] = None
    interest_en_reviewed: Optional[bool] = None


class InterestRead(InterestBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
