from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Date, ForeignKey
from config.database_config import Base
from datetime import date

class Blog(Base):
    """Modelo de blog que contiene mis publicaciones profesionales."""
    __tablename__ = "blog"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    title:Mapped[str] = mapped_column(String(50), nullable=False)
    description:Mapped[str] = mapped_column(String(250), nullable=False)
    image:Mapped[str] = mapped_column(String(250), nullable=False)
    date:Mapped[date] = mapped_column(Date, nullable=False) # Fecha de la publicación del blog

    # Relación con la tabla de categorías de blog
    category_id: Mapped[int] = mapped_column(ForeignKey("blog_category.id"), nullable=False) # Clave foránea a la categoría del blog
    category: Mapped["BlogCategory"] = relationship("BlogCategory", back_populates="blogs")

