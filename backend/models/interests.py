from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Text, Integer, Boolean
from config.database_config import Base

class Interests(Base):
    """Modelo de intereses que contiene mis intereses profesionales."""
    __tablename__ = "interests"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    interest:Mapped[str] = mapped_column(Text, nullable=False)
    interest_en:Mapped[str | None] = mapped_column(Text, nullable=True)
    interest_en_reviewed:Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

