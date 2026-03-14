from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.technologies import Technologies
from schemas.technologies import TechnologyCreate, TechnologyUpdate


class TechnologyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[Technologies]:
        stmt = select(Technologies).order_by(Technologies.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, technology_id: int) -> Technologies | None:
        stmt = select(Technologies).where(Technologies.id == technology_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: TechnologyCreate) -> Technologies:
        technology = Technologies(name=payload.name, logo=payload.logo)
        self.db.add(technology)
        await self.db.commit()
        await self.db.refresh(technology)
        return technology

    async def update(self, technology: Technologies, payload: TechnologyUpdate) -> Technologies:
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(technology, key, value)

        await self.db.commit()
        await self.db.refresh(technology)
        return technology

    async def delete(self, technology: Technologies) -> None:
        await self.db.delete(technology)
        await self.db.commit()