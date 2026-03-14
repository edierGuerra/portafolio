from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.experience import Experience
from schemas.experience import ExperienceCreate, ExperienceUpdate


class ExperienceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[Experience]:
        stmt = select(Experience).order_by(Experience.start_date.desc(), Experience.id.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, experience_id: int) -> Experience | None:
        stmt = select(Experience).where(Experience.id == experience_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: ExperienceCreate) -> Experience:
        experience = Experience(
            position=payload.position,
            company=payload.company,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
        self.db.add(experience)
        await self.db.commit()
        await self.db.refresh(experience)
        return experience

    async def update(self, experience: Experience, payload: ExperienceUpdate) -> Experience:
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(experience, key, value)

        await self.db.commit()
        await self.db.refresh(experience)
        return experience

    async def delete(self, experience: Experience) -> None:
        await self.db.delete(experience)
        await self.db.commit()