from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .technologies import TechnologyRead


class ProjectState(str, Enum):
    DEVELOPMENT = "En desarrollo"
    FILLED = "Completado"


class ProjectBase(BaseModel):
    title: str
    title_en: Optional[str] = None
    description: str
    description_en: Optional[str] = None
    image: str
    demo_url: Optional[str] = None
    repository_url: Optional[str] = None
    year: int
    team: int
    state: ProjectState
    state_en: Optional[str] = None
    title_en_reviewed: bool = False
    description_en_reviewed: bool = False
    state_en_reviewed: bool = False
    main: bool
    published: bool = True


class ProjectCreate(ProjectBase):
    technology_ids: list[int] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    title_en: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    image: Optional[str] = None
    demo_url: Optional[str] = None
    repository_url: Optional[str] = None
    year: Optional[int] = None
    team: Optional[int] = None
    state: Optional[ProjectState] = None
    state_en: Optional[str] = None
    title_en_reviewed: Optional[bool] = None
    description_en_reviewed: Optional[bool] = None
    state_en_reviewed: Optional[bool] = None
    main: Optional[bool] = None
    published: Optional[bool] = None
    technology_ids: Optional[list[int]] = None


class ProjectRead(ProjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ProjectReadWithTechnologies(ProjectRead):
    technologies: list[TechnologyRead] = []
