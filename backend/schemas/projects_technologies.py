from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectTechnologyBase(BaseModel):
    project_id: int
    technology_id: int


class ProjectTechnologyCreate(ProjectTechnologyBase):
    pass


class ProjectTechnologyUpdate(BaseModel):
    project_id: Optional[int] = None
    technology_id: Optional[int] = None


class ProjectTechnologyRead(ProjectTechnologyBase):
    model_config = ConfigDict(from_attributes=True)
