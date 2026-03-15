"""expand blog stage2 with tags and seo

Revision ID: f3b6d9a1c2e4
Revises: e2c4f1a8b3d6
Create Date: 2026-03-15 18:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f3b6d9a1c2e4"
down_revision: Union[str, Sequence[str], None] = "e2c4f1a8b3d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


blog_status_enum = sa.Enum("draft", "published", "scheduled", "archived", name="blogstatus")


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return any(index["name"] == index_name for index in inspector.get_indexes(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    blog_status_enum.create(bind, checkfirst=True)

    if not _has_column(inspector, "blog", "slug"):
        op.add_column("blog", sa.Column("slug", sa.String(length=140), nullable=False, server_default=""))
    if not _has_column(inspector, "blog", "excerpt"):
        op.add_column("blog", sa.Column("excerpt", sa.String(length=500), nullable=False, server_default=""))
    if not _has_column(inspector, "blog", "content"):
        op.add_column("blog", sa.Column("content", sa.Text(), nullable=True))
    if not _has_column(inspector, "blog", "status"):
        op.add_column("blog", sa.Column("status", blog_status_enum, nullable=False, server_default="draft"))
    if not _has_column(inspector, "blog", "is_featured"):
        op.add_column("blog", sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()))
    if not _has_column(inspector, "blog", "published_at"):
        op.add_column("blog", sa.Column("published_at", sa.DateTime(), nullable=True))
    if not _has_column(inspector, "blog", "created_at"):
        op.add_column("blog", sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")))
    if not _has_column(inspector, "blog", "updated_at"):
        op.add_column("blog", sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")))
    if not _has_column(inspector, "blog", "read_time_minutes"):
        op.add_column("blog", sa.Column("read_time_minutes", sa.Integer(), nullable=False, server_default="1"))
    if not _has_column(inspector, "blog", "seo_title"):
        op.add_column("blog", sa.Column("seo_title", sa.String(length=160), nullable=True))
    if not _has_column(inspector, "blog", "seo_description"):
        op.add_column("blog", sa.Column("seo_description", sa.String(length=300), nullable=True))

    op.alter_column("blog", "title", type_=sa.String(length=120), existing_nullable=False)
    op.alter_column("blog", "description", type_=sa.String(length=2000), existing_nullable=False)

    op.execute("UPDATE blog SET slug = CONCAT('post-', id) WHERE slug = '' OR slug IS NULL")
    op.execute("UPDATE blog SET excerpt = LEFT(description, 500) WHERE excerpt = '' OR excerpt IS NULL")

    inspector = sa.inspect(bind)
    if not _has_index(inspector, "blog", "ix_blog_slug"):
        op.create_index("ix_blog_slug", "blog", ["slug"], unique=True)

    if not _has_table(inspector, "blog_tag"):
        op.create_table(
            "blog_tag",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=60), nullable=False),
            sa.Column("slug", sa.String(length=80), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)
    if not _has_index(inspector, "blog_tag", "ix_blog_tag_slug"):
        op.create_index("ix_blog_tag_slug", "blog_tag", ["slug"], unique=True)

    if not _has_table(inspector, "blog_post_tags"):
        op.create_table(
            "blog_post_tags",
            sa.Column("blog_id", sa.Integer(), nullable=False),
            sa.Column("tag_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["blog_id"], ["blog.id"]),
            sa.ForeignKeyConstraint(["tag_id"], ["blog_tag.id"]),
            sa.PrimaryKeyConstraint("blog_id", "tag_id"),
        )

    op.alter_column("blog", "slug", server_default=None)
    op.alter_column("blog", "excerpt", server_default=None)
    op.alter_column("blog", "status", server_default=None)
    op.alter_column("blog", "is_featured", server_default=None)
    op.alter_column("blog", "created_at", server_default=None)
    op.alter_column("blog", "updated_at", server_default=None)
    op.alter_column("blog", "read_time_minutes", server_default=None)


def downgrade() -> None:
    op.drop_table("blog_post_tags")
    op.drop_index("ix_blog_tag_slug", table_name="blog_tag")
    op.drop_table("blog_tag")

    op.drop_index("ix_blog_slug", table_name="blog")

    op.drop_column("blog", "seo_description")
    op.drop_column("blog", "seo_title")
    op.drop_column("blog", "read_time_minutes")
    op.drop_column("blog", "updated_at")
    op.drop_column("blog", "created_at")
    op.drop_column("blog", "published_at")
    op.drop_column("blog", "is_featured")
    op.drop_column("blog", "status")
    op.drop_column("blog", "content")
    op.drop_column("blog", "excerpt")
    op.drop_column("blog", "slug")

    blog_status_enum.drop(op.get_bind(), checkfirst=True)
