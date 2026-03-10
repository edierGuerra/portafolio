from datetime import date

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Date
from config.database_config import Base

class Experience(Base):
    """Modelo de experiencia laboral que contiene mis experiencias laborales."""
    __tablename__ = "experience"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    position:Mapped[str] = mapped_column(String(50), nullable=False)
    company:Mapped[str] = mapped_column(String(50), nullable=False)
    start_date:Mapped[date] = mapped_column(Date, nullable=False)
    end_date:Mapped[date] = mapped_column(Date, nullable=False)