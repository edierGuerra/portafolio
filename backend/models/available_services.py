from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from config.database_config import Base

class AvailableService(Base):
    """Modelo de servicios disponibles que contiene los servicios profesionales que ofrezco."""
    __tablename__ = "available_services"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    service:Mapped[str] = mapped_column(String(50), nullable=False)
    service_en:Mapped[str | None] = mapped_column(String(50), nullable=True)