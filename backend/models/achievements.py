from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from config.database_config import Base

class Achievement(Base):
    """Modelo de logros que contiene mis logros profesionales."""
    __tablename__ = "achievements"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    title:Mapped[str] = mapped_column(String(50), nullable=False)
    subtitle:Mapped[str] = mapped_column(String(50), nullable=False)