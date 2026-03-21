from datetime import date as DateType, datetime as DateTimeType
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .blog_category import BlogCategoryRead
from .blog_image import BlogImageRead
from .blog_tag import BlogTagRead


class BlogStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    SCHEDULED = "scheduled"
    ARCHIVED = "archived"


class BlogBase(BaseModel):
    title: str
    title_en: Optional[str] = None
    slug: str
    excerpt: str
    excerpt_en: Optional[str] = None
    image: str
    date: DateType
    category_id: int
    content: Optional[str] = None
    content_en: Optional[str] = None
    status: BlogStatus = BlogStatus.DRAFT
    is_featured: bool = False
    published_at: Optional[DateTimeType] = None
    read_time_minutes: int = 1
    seo_title: Optional[str] = None
    seo_title_en: Optional[str] = None
    seo_description: Optional[str] = None
    seo_description_en: Optional[str] = None
    title_en_reviewed: bool = False
    excerpt_en_reviewed: bool = False
    content_en_reviewed: bool = False
    seo_title_en_reviewed: bool = False
    seo_description_en_reviewed: bool = False


class BlogCreate(BlogBase):
    tag_ids: list[int] = Field(default_factory=list)


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    title_en: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    excerpt_en: Optional[str] = None
    content: Optional[str] = None
    content_en: Optional[str] = None
    image: Optional[str] = None
    date: Optional[DateType] = None
    category_id: Optional[int] = None
    status: Optional[BlogStatus] = None
    is_featured: Optional[bool] = None
    published_at: Optional[DateTimeType] = None
    read_time_minutes: Optional[int] = None
    seo_title: Optional[str] = None
    seo_title_en: Optional[str] = None
    seo_description: Optional[str] = None
    seo_description_en: Optional[str] = None
    title_en_reviewed: Optional[bool] = None
    excerpt_en_reviewed: Optional[bool] = None
    content_en_reviewed: Optional[bool] = None
    seo_title_en_reviewed: Optional[bool] = None
    seo_description_en_reviewed: Optional[bool] = None
    tag_ids: Optional[list[int]] = None

    @field_validator("date", "published_at", mode="before")
    @classmethod
    def empty_string_to_none_for_temporal_fields(cls, value):
        if value == "":
            return None
        return value

    @field_validator(
        "content",
        "content_en",
        "seo_title",
        "seo_title_en",
        "seo_description",
        "seo_description_en",
        mode="before",
    )
    @classmethod
    def normalize_optional_text_fields(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            trimmed = value.strip()
            return trimmed if trimmed else None
        return value


class BlogRead(BlogBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class BlogReadWithCategory(BlogRead):
    category: Optional[BlogCategoryRead] = None
    tags: list[BlogTagRead] = []
    content_images: list[BlogImageRead] = []
