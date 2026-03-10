from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer
from config.database_config import Base

class BlogCategory(Base):
    """Modelo de categoría de blog que contiene las categorías de mis publicaciones profesionales."""
    __tablename__ = "blog_category"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    name:Mapped[str] = mapped_column(String(50), nullable=False)

    # Relación con el modelo Blog
    blogs: Mapped[list["Blog"]] = relationship("Blog", back_populates="category")