from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Boolean
from config.database_config import Base

class MyPhilosophy(Base):
    """Modelo de mi filosofía de trabajo que contiene mis valores y principios como desarrollador."""
    __tablename__ = "my_philosophy"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    philosophy:Mapped[str] = mapped_column(String(250), nullable=False)
    philosophy_en:Mapped[str | None] = mapped_column(String(250), nullable=True)
    image:Mapped[str] = mapped_column(String(250), nullable=False)
    philosophy_en_reviewed:Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)