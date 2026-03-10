from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from config.database_config import Base

class ContactInfo(Base):
    """Modelo de información de contacto que contiene mis datos de contacto profesionales."""
    __tablename__ = "contact_info"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    email:Mapped[str] = mapped_column(String(50), nullable=False)
    phone:Mapped[str] = mapped_column(String(50), nullable=False)
    location:Mapped[str] = mapped_column(String(50), nullable=False)
    availability:Mapped[str] = mapped_column(String(50), nullable=False)