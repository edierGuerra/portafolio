from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    email: str
    name: str
    professional_profile: str
    about_me: str
    profile_image: str
    location: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    professional_profile: Optional[str] = None
    about_me: Optional[str] = None
    profile_image: Optional[str] = None
    location: Optional[str] = None


class UserRead(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class UserReadWithPassword(UserRead):
    password: str
