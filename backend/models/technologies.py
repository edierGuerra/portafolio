from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer
from config.database_config import Base

class Technologies(Base):
    """Modelo de tecnologías que contiene las tecnologías que manejo."""
    __tablename__ = "technologies"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    name:Mapped[str] = mapped_column(String(50), nullable=False)
    logo:Mapped[str] = mapped_column(String(250), nullable=False)

    # Se relaciona con projects, ya que un proyecto puede tener varias tecnologías y una tecnología puede estar en varios proyectos.
    projects = relationship("Projects", secondary="projects_technologies", back_populates="technologies")
