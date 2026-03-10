from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from config.database_config import Base

class MyPhilosophy(Base):
    """Modelo de mi filosofía de trabajo que contiene mis valores y principios como desarrollador."""
    __tablename__ = "my_philosophy"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    philosophy:Mapped[str] = mapped_column(String(250), nullable=False)
    image:Mapped[str] = mapped_column(String(250), nullable=False)