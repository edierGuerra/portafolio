from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from config.database_config import Base

class FrequentlyAskedQuestion(Base):
    """Modelo de preguntas frecuentes que contiene las preguntas frecuentes sobre mis servicios profesionales."""
    __tablename__ = "frequently_asked_questions"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    question:Mapped[str] = mapped_column(String(250), nullable=False)
    question_en:Mapped[str | None] = mapped_column(String(250), nullable=True)
    answer:Mapped[str] = mapped_column(String(250), nullable=False)
    answer_en:Mapped[str | None] = mapped_column(String(250), nullable=True)