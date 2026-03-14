from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.blog import Blog
from schemas.blog import BlogCreate, BlogUpdate


class BlogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> Sequence[Blog]:
        stmt = (
            select(Blog)
            .options(selectinload(Blog.category))
            .order_by(Blog.date.desc(), Blog.id.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, blog_id: int) -> Blog | None:
        stmt = (
            select(Blog)
            .options(selectinload(Blog.category))
            .where(Blog.id == blog_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: BlogCreate) -> Blog:
        blog = Blog(
            title=payload.title,
            description=payload.description,
            image=payload.image,
            date=payload.date,
            category_id=payload.category_id,
        )
        self.db.add(blog)
        await self.db.commit()
        # Recargar con la relacion de categoria
        return await self.get_by_id(blog.id)

    async def update(self, blog: Blog, payload: BlogUpdate) -> Blog:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(blog, key, value)
        await self.db.commit()
        return await self.get_by_id(blog.id)

    async def delete(self, blog: Blog) -> None:
        await self.db.delete(blog)
        await self.db.commit()
