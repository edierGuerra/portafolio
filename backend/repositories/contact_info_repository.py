from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.contact_info import ContactInfo
from schemas.contact_info import ContactInfoCreate, ContactInfoUpdate


class ContactInfoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[ContactInfo]:
        stmt = select(ContactInfo).order_by(ContactInfo.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, contact_id: int) -> ContactInfo | None:
        stmt = select(ContactInfo).where(ContactInfo.id == contact_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: ContactInfoCreate) -> ContactInfo:
        contact = ContactInfo(
            email=payload.email,
            phone=payload.phone,
            location=payload.location,
            availability=payload.availability,
        )
        self.db.add(contact)
        await self.db.commit()
        await self.db.refresh(contact)
        return contact

    async def update(self, contact: ContactInfo, payload: ContactInfoUpdate) -> ContactInfo:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(contact, key, value)
        await self.db.commit()
        await self.db.refresh(contact)
        return contact

    async def delete(self, contact: ContactInfo) -> None:
        await self.db.delete(contact)
        await self.db.commit()
