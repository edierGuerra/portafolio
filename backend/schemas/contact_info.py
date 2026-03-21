from typing import Optional

from pydantic import BaseModel, ConfigDict


class ContactInfoBase(BaseModel):
    email: str
    phone: str
    location: str
    location_en: Optional[str] = None
    availability: str
    availability_en: Optional[str] = None


class ContactInfoCreate(ContactInfoBase):
    pass


class ContactInfoUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    location_en: Optional[str] = None
    availability: Optional[str] = None
    availability_en: Optional[str] = None


class ContactInfoRead(ContactInfoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
