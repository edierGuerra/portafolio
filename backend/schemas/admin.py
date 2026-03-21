from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    email: str
    name: str
    professional_profile: str
    professional_profile_en: Optional[str] = None
    professional_profile_en_reviewed: bool = False
    about_me: str
    about_me_en: Optional[str] = None
    about_me_en_reviewed: bool = False
    profile_image: str
    location: str
    cv_file: Optional[str] = None
    availability_status: str = "available"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    professional_profile: Optional[str] = None
    professional_profile_en: Optional[str] = None
    professional_profile_en_reviewed: Optional[bool] = None
    about_me: Optional[str] = None
    about_me_en: Optional[str] = None
    about_me_en_reviewed: Optional[bool] = None
    profile_image: Optional[str] = None
    location: Optional[str] = None
    cv_file: Optional[str] = None
    availability_status: Optional[str] = None


class UserRead(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class UserReadWithPassword(UserRead):
    password: str


class PublicProfileRead(BaseModel):
    name: str
    professional_profile: str
    professional_profile_en: Optional[str] = None
    about_me: str
    about_me_en: Optional[str] = None
    profile_image: str
    location: str
    cv_file: Optional[str] = None
    availability_status: str = "available"
    model_config = ConfigDict(from_attributes=True)
