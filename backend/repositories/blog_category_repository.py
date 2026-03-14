from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.blog_category import BlogCategory
from schemas.blog_category import BlogCategoryCreate, BlogCategoryUpdate


class BlogCategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[BlogCategory]:
        stmt = select(BlogCategory).order_by(BlogCategory.id.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, category_id: int) -> BlogCategory | None:
        stmt = select(BlogCategory).where(BlogCategory.id == category_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: BlogCategoryCreate) -> BlogCategory:
        category = BlogCategory(name=payload.name)
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update(self, category: BlogCategory, payload: BlogCategoryUpdate) -> BlogCategory:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(category, key, value)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete(self, category: BlogCategory) -> None:
        await self.db.delete(category)
        await self.db.commit()
