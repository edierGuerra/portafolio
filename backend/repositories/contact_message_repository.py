from datetime import datetime as DateTimeType
from typing import Sequence

from sqlalchemy import select
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

    async def list_recent(
        self,
        *,
        limit: int = 20,
        pending_only: bool = False,
    ) -> Sequence[ContactMessage]:
        stmt = select(ContactMessage)
        if pending_only:
            stmt = stmt.where(ContactMessage.responded.is_(False))

        stmt = stmt.order_by(ContactMessage.created_at.desc(), ContactMessage.id.desc()).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, message_id: int) -> ContactMessage | None:
        stmt = select(ContactMessage).where(ContactMessage.id == message_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def mark_as_responded(
        self,
        message: ContactMessage,
        *,
        response_subject: str,
        response_message: str,
    ) -> ContactMessage:
        message.responded = True
        message.responded_at = DateTimeType.utcnow()
        message.response_subject = response_subject
        message.response_message = response_message
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def delete_if_responded(self, message: ContactMessage) -> None:
        if not message.responded:
            raise ValueError("No se puede eliminar un mensaje sin responder")

        await self.db.delete(message)
        await self.db.commit()
