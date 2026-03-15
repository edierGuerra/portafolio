"""add blog content images table

Revision ID: b1c2d3e4f5a6
Revises: a6e9f1c4b2d3
Create Date: 2026-03-15 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, None] = "a6e9f1c4b2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return any(index["name"] == index_name for index in inspector.get_indexes(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "blog_image"):
        op.create_table(
            "blog_image",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("blog_id", sa.Integer(), nullable=False),
            sa.Column("image_url", sa.String(length=250), nullable=False),
            sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.ForeignKeyConstraint(["blog_id"], ["blog.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)
    index_name = op.f("ix_blog_image_blog_id")
    if _has_table(inspector, "blog_image") and not _has_index(inspector, "blog_image", index_name):
        op.create_index(index_name, "blog_image", ["blog_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    index_name = op.f("ix_blog_image_blog_id")
    if _has_table(inspector, "blog_image") and _has_index(inspector, "blog_image", index_name):
        op.drop_index(index_name, table_name="blog_image")

    inspector = sa.inspect(bind)
    if _has_table(inspector, "blog_image"):
        op.drop_table("blog_image")
