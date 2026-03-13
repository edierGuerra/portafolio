from typing import Optional

from pydantic import BaseModel, ConfigDict


class ContactInfoBase(BaseModel):
    email: str
    phone: str
    location: str
    availability: str


class ContactInfoCreate(ContactInfoBase):
    pass


class ContactInfoUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None


class ContactInfoRead(ContactInfoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
