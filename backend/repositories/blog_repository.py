import json
from typing import Sequence
from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.blog import Blog, BlogStatus as BlogStatusModel
from models.blog_image import BlogImage
from models.blog_tag import BlogTag
from schemas.blog import BlogCreate, BlogUpdate


class BlogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self, *, include_unpublished: bool = False) -> Sequence[Blog]:
        stmt = (
            select(Blog)
            .options(
                selectinload(Blog.category),
                selectinload(Blog.tags),
                selectinload(Blog.content_images),
            )
            .order_by(Blog.published_at.desc(), Blog.date.desc(), Blog.id.desc())
        )
        if not include_unpublished:
            stmt = stmt.where(Blog.status == BlogStatusModel.PUBLISHED)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, blog_id: int) -> Blog | None:
        stmt = (
            select(Blog)
            .options(
                selectinload(Blog.category),
                selectinload(Blog.tags),
                selectinload(Blog.content_images),
            )
            .where(Blog.id == blog_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    def _extract_content_image_urls(raw_content: str | None) -> list[str]:
        if not raw_content:
            return []

        try:
            parsed = json.loads(raw_content)
        except json.JSONDecodeError:
            return []

        if not isinstance(parsed, list):
            return []

        urls: list[str] = []
        for block in parsed:
            if not isinstance(block, dict):
                continue
            if block.get("type") != "image":
                continue

            value = block.get("value")
            if not isinstance(value, str):
                continue

            url = value.strip()
            if url:
                urls.append(url)

        # Preserva orden y elimina duplicados exactos
        return list(dict.fromkeys(urls))

    async def _sync_content_images(self, blog: Blog, raw_content: str | None) -> None:
        urls = self._extract_content_image_urls(raw_content)

        await self.db.execute(delete(BlogImage).where(BlogImage.blog_id == blog.id))

        for position, image_url in enumerate(urls):
            self.db.add(
                BlogImage(
                    blog_id=blog.id,
                    image_url=image_url,
                    position=position,
                )
            )

    async def _resolve_tags(self, tag_ids: list[int]) -> list[BlogTag]:
        unique_ids = list(dict.fromkeys(tag_ids))
        if not unique_ids:
            return []

        stmt = select(BlogTag).where(BlogTag.id.in_(unique_ids))
        result = await self.db.execute(stmt)
        tags = result.scalars().all()

        existing_ids = {tag.id for tag in tags}
        missing_ids = [tag_id for tag_id in unique_ids if tag_id not in existing_ids]
        if missing_ids:
            raise ValueError(
                f"No existen tags con los ids: {', '.join(str(tag_id) for tag_id in missing_ids)}"
            )

        tags_by_id = {tag.id: tag for tag in tags}
        return [tags_by_id[tag_id] for tag_id in unique_ids]

    async def create(self, payload: BlogCreate) -> Blog:
        tags = await self._resolve_tags(payload.tag_ids)

        published_at = payload.published_at
        if payload.status.value == BlogStatusModel.PUBLISHED.value and published_at is None:
            published_at = datetime.utcnow()

        blog = Blog(
            title=payload.title,
            slug=payload.slug,
            excerpt=payload.excerpt,
            content=payload.content,
            image=payload.image,
            date=payload.date,
            category_id=payload.category_id,
            status=BlogStatusModel(payload.status.value),
            is_featured=payload.is_featured,
            published_at=published_at,
            read_time_minutes=payload.read_time_minutes,
            seo_title=payload.seo_title,
            seo_description=payload.seo_description,
        )
        blog.tags = tags
        self.db.add(blog)
        await self.db.flush()
        await self._sync_content_images(blog, payload.content)
        await self.db.commit()
        # Recargar con la relacion de categoria
        return await self.get_by_id(blog.id)

    async def update(self, blog: Blog, payload: BlogUpdate) -> Blog:
        update_data = payload.model_dump(exclude_unset=True)

        tag_ids = update_data.pop("tag_ids", None)
        if "status" in update_data and update_data["status"] is not None:
            update_data["status"] = BlogStatusModel(update_data["status"].value)
            if update_data["status"] == BlogStatusModel.PUBLISHED and not blog.published_at:
                blog.published_at = datetime.utcnow()

        for key, value in update_data.items():
            setattr(blog, key, value)

        if tag_ids is not None:
            blog.tags = await self._resolve_tags(tag_ids)

        await self._sync_content_images(blog, blog.content)

        await self.db.commit()
        return await self.get_by_id(blog.id)

    async def delete(self, blog: Blog) -> None:
        await self.db.delete(blog)
        await self.db.commit()
