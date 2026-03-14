from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.interests import Interests
from schemas.interests import InterestCreate, InterestUpdate


class InterestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[Interests]:
        stmt = select(Interests).order_by(Interests.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, interest_id: int) -> Interests | None:
        stmt = select(Interests).where(Interests.id == interest_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: InterestCreate) -> Interests:
        interest = Interests(interest=payload.interest)
        self.db.add(interest)
        await self.db.commit()
        await self.db.refresh(interest)
        return interest

    async def update(self, interest: Interests, payload: InterestUpdate) -> Interests:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(interest, key, value)
        await self.db.commit()
        await self.db.refresh(interest)
        return interest

    async def delete(self, interest: Interests) -> None:
        await self.db.delete(interest)
        await self.db.commit()
