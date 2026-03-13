from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .technologies import TechnologyRead


class ProjectState(str, Enum):
    DEVELOPMENT = "En desarrollo"
    FILLED = "Completado"


class ProjectBase(BaseModel):
    title: str
    description: str
    image: str
    year: int
    team: int
    state: ProjectState
    main: bool


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    year: Optional[int] = None
    team: Optional[int] = None
    state: Optional[ProjectState] = None
    main: Optional[bool] = None


class ProjectRead(ProjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ProjectReadWithTechnologies(ProjectRead):
    technologies: list[TechnologyRead] = []
