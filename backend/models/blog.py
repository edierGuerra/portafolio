import enum
from datetime import date as DateType, datetime as DateTimeType

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, Enum, Boolean, Text
from config.database_config import Base


class BlogStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    SCHEDULED = "scheduled"
    ARCHIVED = "archived"

class Blog(Base):
    """Modelo de blog que contiene mis publicaciones profesionales."""
    __tablename__ = "blog"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    title:Mapped[str] = mapped_column(String(120), nullable=False)
    slug:Mapped[str] = mapped_column(String(140), nullable=False, unique=True)
    excerpt:Mapped[str] = mapped_column(String(500), nullable=False)
    content:Mapped[str | None] = mapped_column(Text, nullable=True)
    image:Mapped[str] = mapped_column(String(250), nullable=False)
    date:Mapped[DateType] = mapped_column(Date, nullable=False) # Fecha editorial definida por usuario
    status:Mapped[BlogStatus] = mapped_column(
        Enum(BlogStatus, values_callable=lambda enum_cls: [member.value for member in enum_cls]),
        nullable=False,
        default=BlogStatus.DRAFT,
    )
    is_featured:Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    published_at:Mapped[DateTimeType | None] = mapped_column(DateTime, nullable=True)
    created_at:Mapped[DateTimeType] = mapped_column(DateTime, nullable=False, default=DateTimeType.utcnow)
    updated_at:Mapped[DateTimeType] = mapped_column(DateTime, nullable=False, default=DateTimeType.utcnow, onupdate=DateTimeType.utcnow)
    read_time_minutes:Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    seo_title:Mapped[str | None] = mapped_column(String(160), nullable=True)
    seo_description:Mapped[str | None] = mapped_column(String(300), nullable=True)

    # Relación con la tabla de categorías de blog
    category_id: Mapped[int] = mapped_column(ForeignKey("blog_category.id"), nullable=False) # Clave foránea a la categoría del blog
    category: Mapped["BlogCategory"] = relationship("BlogCategory", back_populates="blogs")
    tags: Mapped[list["BlogTag"]] = relationship(
        "BlogTag",
        secondary="blog_post_tags",
        back_populates="posts",
    )
    content_images: Mapped[list["BlogImage"]] = relationship(
        "BlogImage",
        back_populates="blog",
        cascade="all, delete-orphan",
        order_by="BlogImage.position",
    )

