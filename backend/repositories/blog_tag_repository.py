from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.blog_tag import BlogTag
from schemas.blog_tag import BlogTagCreate, BlogTagUpdate


class BlogTagRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[BlogTag]:
        stmt = select(BlogTag).order_by(BlogTag.name.asc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, tag_id: int) -> BlogTag | None:
        stmt = select(BlogTag).where(BlogTag.id == tag_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: BlogTagCreate) -> BlogTag:
        tag = BlogTag(name=payload.name, slug=payload.slug)
        self.db.add(tag)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def update(self, tag: BlogTag, payload: BlogTagUpdate) -> BlogTag:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(tag, key, value)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def delete(self, tag: BlogTag) -> None:
        await self.db.delete(tag)
        await self.db.commit()
