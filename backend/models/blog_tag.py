from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean

from config.database_config import Base


class BlogTag(Base):
    __tablename__ = "blog_tag"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    name_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name_en_reviewed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    posts: Mapped[list["Blog"]] = relationship(
        "Blog",
        secondary="blog_post_tags",
        back_populates="tags",
    )
