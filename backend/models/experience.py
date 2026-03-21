from datetime import date

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Date, Boolean
from config.database_config import Base

class Experience(Base):
    """Modelo de experiencia laboral que contiene mis experiencias laborales."""
    __tablename__ = "experience"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    position:Mapped[str] = mapped_column(String(50), nullable=False)
    position_en:Mapped[str | None] = mapped_column(String(50), nullable=True)
    company:Mapped[str] = mapped_column(String(50), nullable=False)
    company_en:Mapped[str | None] = mapped_column(String(50), nullable=True)
    start_date:Mapped[date] = mapped_column(Date, nullable=False)
    end_date:Mapped[date] = mapped_column(Date, nullable=False)
    position_en_reviewed:Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    company_en_reviewed:Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)