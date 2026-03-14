from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.social_networks import SocialNetworks
from schemas.social_networks import SocialNetworkCreate, SocialNetworkUpdate


class SocialNetworkRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[SocialNetworks]:
        stmt = select(SocialNetworks).order_by(SocialNetworks.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, network_id: int) -> SocialNetworks | None:
        stmt = select(SocialNetworks).where(SocialNetworks.id == network_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: SocialNetworkCreate) -> SocialNetworks:
        network = SocialNetworks(name=payload.name, url=payload.url, icon=payload.icon)
        self.db.add(network)
        await self.db.commit()
        await self.db.refresh(network)
        return network

    async def update(self, network: SocialNetworks, payload: SocialNetworkUpdate) -> SocialNetworks:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(network, key, value)
        await self.db.commit()
        await self.db.refresh(network)
        return network

    async def delete(self, network: SocialNetworks) -> None:
        await self.db.delete(network)
        await self.db.commit()
