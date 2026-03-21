from typing import Optional

from pydantic import BaseModel, ConfigDict


class SocialNetworkBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    url: str
    icon: str


class SocialNetworkCreate(SocialNetworkBase):
    pass


class SocialNetworkUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None


class SocialNetworkRead(SocialNetworkBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
