from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Boolean
from config.database_config import Base

class User(Base):
    """Modelo que contiene las credenciales para ingresar al panel de administración(CMS) y mis datos."""
    __tablename__ = "user"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    email:Mapped[str] = mapped_column(String(50), nullable=False)
    password:Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    name_en: Mapped[str | None] = mapped_column(String(50), nullable=True)
    name_en_reviewed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    professional_profile: Mapped[str] = mapped_column(String(50),nullable=False)  # Campo para describir mi perfil profesional, por ejemplo: "Desarrollador Full Stack", "Ingeniero de Software", etc.
    professional_profile_en: Mapped[str | None] = mapped_column(String(50), nullable=True)
    professional_profile_en_reviewed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    about_me: Mapped[str] = mapped_column(Text, nullable=False)
    about_me_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    about_me_en_reviewed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    profile_image: Mapped[str] = mapped_column(String(250), nullable=False)
    location: Mapped[str] = mapped_column(String(50), nullable=False)
    location_en: Mapped[str | None] = mapped_column(String(50), nullable=True)
    location_en_reviewed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    cv_file: Mapped[str | None] = mapped_column(String(500), nullable=True)
    availability_status: Mapped[str] = mapped_column(String(30), nullable=False, default="available")