from datetime import datetime as DateTimeType

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from config.database_config import Base


class ContactMessage(Base):
    """Mensajes enviados desde el formulario público de contacto."""

    __tablename__ = "contact_message"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    company: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    budget: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    subject: Mapped[str] = mapped_column(String(180), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    responded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    responded_at: Mapped[DateTimeType | None] = mapped_column(DateTime, nullable=True)
    response_subject: Mapped[str] = mapped_column(String(180), nullable=False, default="")
    response_message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[DateTimeType] = mapped_column(
        DateTime,
        nullable=False,
        default=DateTimeType.utcnow,
    )
