from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text
from config.database_config import Base

class User(Base):
    """Modelo que contiene las credenciales para ingresar al panel de administración(CMS) y mis datos."""
    __tablename__ = "user"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    email:Mapped[str] = mapped_column(String(50), nullable=False)
    password:Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    professional_profile: Mapped[str] = mapped_column(String(50),nullable=False)  # Campo para describir mi perfil profesional, por ejemplo: "Desarrollador Full Stack", "Ingeniero de Software", etc.
    about_me: Mapped[str] = mapped_column(Text, nullable=False)
    profile_image: Mapped[str] = mapped_column(String(250), nullable=False)
    location: Mapped[str] = mapped_column(String(50), nullable=False)
    availability_status: Mapped[str] = mapped_column(String(30), nullable=False, default="available")