from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, ForeignKey

from config.database_config import Base


class BlogPostTags(Base):
    __tablename__ = "blog_post_tags"

    blog_id: Mapped[int] = mapped_column(Integer, ForeignKey("blog.id"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(Integer, ForeignKey("blog_tag.id"), primary_key=True)
