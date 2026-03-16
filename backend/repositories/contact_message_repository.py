from sqlalchemy.ext.asyncio import AsyncSession

from models.contact_message import ContactMessage
from schemas.contact_message import ContactMessageCreate


class ContactMessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, payload: ContactMessageCreate) -> ContactMessage:
        message = ContactMessage(
            name=payload.name,
            email=payload.email,
            company=payload.company,
            budget=payload.budget,
            subject=payload.subject,
            message=payload.message,
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message
