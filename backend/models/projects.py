import enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Enum, Boolean
from config.database_config import Base

class ProjectState(enum.Enum):
    """Clase de estado que contiene los estados de mis proyectos."""
    DEVELOPMENT = "En desarrollo"
    FILLED = "Completado"

class Projects(Base):
    """Modelo de proyectos que contiene mis proyectos profesionales."""
    __tablename__ = "projects"
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    title:Mapped[str] = mapped_column(String(50), nullable=False)
    description:Mapped[str] = mapped_column(String(2000), nullable=False)
    image:Mapped[str] = mapped_column(String(250), nullable=False)
    demo_url:Mapped[str | None] = mapped_column(String(250), nullable=True)
    repository_url:Mapped[str | None] = mapped_column(String(250), nullable=True)
    year:Mapped[int] = mapped_column(Integer, nullable=False)
    team:Mapped[int] = mapped_column(Integer, nullable=False) # Cantidad de personas que participaron en el proyecto
    state:Mapped[ProjectState] = mapped_column(Enum(ProjectState), nullable=False)
    main:Mapped[bool] = mapped_column(Boolean, nullable=False) # Si el proyecto es uno de mis proyectos principales o no, para mostrarlo en la sección de proyectos principales o en la sección de proyectos secundarios.
    published:Mapped[bool] = mapped_column(Boolean, nullable=False, default=True) # Indica si el proyecto está publicado y visible en el portafolio público.

    # Relaciones
    technologies = relationship("Technologies", secondary="projects_technologies", back_populates="projects") # Relación con technologies, ya que un proyecto puede tener varias tecnologías y una tecnología puede estar en varios proyectos.