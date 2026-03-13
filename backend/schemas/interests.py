from typing import Optional

from pydantic import BaseModel, ConfigDict


class InterestBase(BaseModel):
    interest: str


class InterestCreate(InterestBase):
    pass


class InterestUpdate(BaseModel):
    interest: Optional[str] = None


class InterestRead(InterestBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
