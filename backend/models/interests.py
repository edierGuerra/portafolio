from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from config.database_config import Base

class Interests(Base):
    """Modelo de intereses que contiene mis intereses profesionales."""
    __tablename__ = "interests"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    interest:Mapped[str] = mapped_column(String(50), nullable=False)

