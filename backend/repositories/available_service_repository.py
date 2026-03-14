from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.available_services import AvailableService
from schemas.available_services import AvailableServiceCreate, AvailableServiceUpdate


class AvailableServiceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[AvailableService]:
        stmt = select(AvailableService).order_by(AvailableService.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, service_id: int) -> AvailableService | None:
        stmt = select(AvailableService).where(AvailableService.id == service_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: AvailableServiceCreate) -> AvailableService:
        service = AvailableService(service=payload.service)
        self.db.add(service)
        await self.db.commit()
        await self.db.refresh(service)
        return service

    async def update(self, service: AvailableService, payload: AvailableServiceUpdate) -> AvailableService:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(service, key, value)
        await self.db.commit()
        await self.db.refresh(service)
        return service

    async def delete(self, service: AvailableService) -> None:
        await self.db.delete(service)
        await self.db.commit()
