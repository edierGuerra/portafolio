from typing import Optional

from pydantic import BaseModel, ConfigDict


class BlogTagBase(BaseModel):
    name: str
    slug: str


class BlogTagCreate(BlogTagBase):
    pass


class BlogTagUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None


class BlogTagRead(BlogTagBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
