from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, ForeignKey
from config.database_config import Base

class ProjectsTechnologies(Base):
    """Conecta los proyectos con las tecnologias y las tecnologias con los proyectos."""
    __tablename__ = "projects_technologies"
    project_id:Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), primary_key=True)
    technology_id:Mapped[int] = mapped_column(Integer, ForeignKey("technologies.id"), primary_key=True)