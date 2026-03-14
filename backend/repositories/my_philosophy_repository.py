from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.my_philosophy import MyPhilosophy
from schemas.my_philosophy import MyPhilosophyCreate, MyPhilosophyUpdate


class MyPhilosophyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[MyPhilosophy]:
        stmt = select(MyPhilosophy).order_by(MyPhilosophy.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, philosophy_id: int) -> MyPhilosophy | None:
        stmt = select(MyPhilosophy).where(MyPhilosophy.id == philosophy_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: MyPhilosophyCreate) -> MyPhilosophy:
        philosophy = MyPhilosophy(philosophy=payload.philosophy, image=payload.image)
        self.db.add(philosophy)
        await self.db.commit()
        await self.db.refresh(philosophy)
        return philosophy

    async def update(self, philosophy: MyPhilosophy, payload: MyPhilosophyUpdate) -> MyPhilosophy:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(philosophy, key, value)
        await self.db.commit()
        await self.db.refresh(philosophy)
        return philosophy

    async def delete(self, philosophy: MyPhilosophy) -> None:
        await self.db.delete(philosophy)
        await self.db.commit()
