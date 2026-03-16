from datetime import datetime

import sqlalchemy as sa
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from config.database_config import Base


class AnalyticsEvent(Base):
    """Registra eventos de visita al portafolio (solo visitantes, no el admin)."""

    __tablename__ = "analytics_event"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(30), nullable=False)
    section: Mapped[str | None] = mapped_column(String(60), nullable=True)
    referrer: Mapped[str] = mapped_column(
        String(500), nullable=False, server_default=""
    )
    session_id: Mapped[str] = mapped_column(
        String(36), nullable=False, server_default=""
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")
    )
