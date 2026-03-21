from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from config.database_config import Base

class SocialNetworks(Base):
    """Modelo de redes sociales que contiene mis redes sociales profesionales."""
    __tablename__ = "social_networks"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    name:Mapped[str] = mapped_column(String(50), nullable=False)
    name_en:Mapped[str | None] = mapped_column(String(50), nullable=True)
    url:Mapped[str] = mapped_column(String(250), nullable=False)
    icon:Mapped[str] = mapped_column(String(250), nullable=False)