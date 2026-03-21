from typing import Optional

from pydantic import BaseModel, ConfigDict


class BlogCategoryBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    name_en_reviewed: bool = False


class BlogCategoryCreate(BlogCategoryBase):
    pass


class BlogCategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None


class BlogCategoryRead(BlogCategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
