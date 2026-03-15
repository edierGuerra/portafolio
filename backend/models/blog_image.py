from datetime import datetime as DateTimeType

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from config.database_config import Base


class BlogImage(Base):
    """Imagenes de contenido asociadas a una publicacion del blog."""

    __tablename__ = "blog_image"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    blog_id: Mapped[int] = mapped_column(ForeignKey("blog.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(250), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[DateTimeType] = mapped_column(DateTime, nullable=False, default=DateTimeType.utcnow)

    blog: Mapped["Blog"] = relationship("Blog", back_populates="content_images")
