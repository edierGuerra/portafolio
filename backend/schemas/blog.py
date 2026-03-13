from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .blog_category import BlogCategoryRead


class BlogBase(BaseModel):
    title: str
    description: str
    image: str
    date: date
    category_id: int


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    date: Optional[date] = None
    category_id: Optional[int] = None


class BlogRead(BlogBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class BlogReadWithCategory(BlogRead):
    category: Optional[BlogCategoryRead] = None
