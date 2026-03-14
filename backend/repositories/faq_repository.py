from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.frequently_asked_questions import FrequentlyAskedQuestion
from schemas.frequently_asked_questions import FrequentlyAskedQuestionCreate, FrequentlyAskedQuestionUpdate


class FaqRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[FrequentlyAskedQuestion]:
        stmt = select(FrequentlyAskedQuestion).order_by(FrequentlyAskedQuestion.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, faq_id: int) -> FrequentlyAskedQuestion | None:
        stmt = select(FrequentlyAskedQuestion).where(FrequentlyAskedQuestion.id == faq_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: FrequentlyAskedQuestionCreate) -> FrequentlyAskedQuestion:
        faq = FrequentlyAskedQuestion(question=payload.question, answer=payload.answer)
        self.db.add(faq)
        await self.db.commit()
        await self.db.refresh(faq)
        return faq

    async def update(self, faq: FrequentlyAskedQuestion, payload: FrequentlyAskedQuestionUpdate) -> FrequentlyAskedQuestion:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(faq, key, value)
        await self.db.commit()
        await self.db.refresh(faq)
        return faq

    async def delete(self, faq: FrequentlyAskedQuestion) -> None:
        await self.db.delete(faq)
        await self.db.commit()
