from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.achievements import Achievement
from schemas.achievements import AchievementCreate, AchievementUpdate


class AchievementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[Achievement]:
        stmt = select(Achievement).order_by(Achievement.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, achievement_id: int) -> Achievement | None:
        stmt = select(Achievement).where(Achievement.id == achievement_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: AchievementCreate) -> Achievement:
        achievement = Achievement(title=payload.title, subtitle=payload.subtitle)
        self.db.add(achievement)
        await self.db.commit()
        await self.db.refresh(achievement)
        return achievement

    async def update(self, achievement: Achievement, payload: AchievementUpdate) -> Achievement:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(achievement, key, value)
        await self.db.commit()
        await self.db.refresh(achievement)
        return achievement

    async def delete(self, achievement: Achievement) -> None:
        await self.db.delete(achievement)
        await self.db.commit()
