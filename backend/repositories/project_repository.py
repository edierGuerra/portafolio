from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.projects import ProjectState as ProjectStateModel
from models.projects import Projects
from models.technologies import Technologies
from schemas.projects import ProjectCreate, ProjectUpdate


class ProjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self, *, published: bool | None = None) -> Sequence[Projects]:
        stmt = select(Projects).options(selectinload(Projects.technologies))
        if published is not None:
            stmt = stmt.where(Projects.published == published)
        stmt = stmt.order_by(Projects.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, project_id: int) -> Projects | None:
        stmt = (
            select(Projects)
            .options(selectinload(Projects.technologies))
            .where(Projects.id == project_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def _resolve_technologies(self, technology_ids: list[int]) -> list[Technologies]:
        unique_ids = list(dict.fromkeys(technology_ids))
        if not unique_ids:
            return []

        stmt = select(Technologies).where(Technologies.id.in_(unique_ids))
        result = await self.db.execute(stmt)
        technologies = result.scalars().all()

        existing_ids = {technology.id for technology in technologies}
        missing_ids = [technology_id for technology_id in unique_ids if technology_id not in existing_ids]
        if missing_ids:
            raise ValueError(
                f"No existen tecnologias con los ids: {', '.join(str(missing_id) for missing_id in missing_ids)}"
            )

        technologies_by_id = {technology.id: technology for technology in technologies}
        return [technologies_by_id[technology_id] for technology_id in unique_ids]

    async def create(self, payload: ProjectCreate) -> Projects:
        technologies = await self._resolve_technologies(payload.technology_ids)

        project = Projects(
            title=payload.title,
            description=payload.description,
            image=payload.image,
            demo_url=payload.demo_url,
            repository_url=payload.repository_url,
            year=payload.year,
            team=payload.team,
            state=ProjectStateModel(payload.state.value),
            main=payload.main,
            published=payload.published,
        )
        project.technologies = technologies
        self.db.add(project)
        await self.db.commit()
        created = await self.get_by_id(project.id)
        return created or project

    async def update(self, project: Projects, payload: ProjectUpdate) -> Projects:
        update_data = payload.model_dump(exclude_unset=True)

        technology_ids = update_data.pop("technology_ids", None)
        if "state" in update_data and update_data["state"] is not None:
            update_data["state"] = ProjectStateModel(update_data["state"].value)

        for key, value in update_data.items():
            setattr(project, key, value)

        if technology_ids is not None:
            project.technologies = await self._resolve_technologies(technology_ids)

        await self.db.commit()
        updated = await self.get_by_id(project.id)
        return updated or project

    async def delete(self, project: Projects) -> None:
        await self.db.delete(project)
        await self.db.commit()