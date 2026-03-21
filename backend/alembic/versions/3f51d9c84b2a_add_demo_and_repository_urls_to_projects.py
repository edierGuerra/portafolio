"""add_demo_and_repository_urls_to_projects

Revision ID: 3f51d9c84b2a
Revises: 9c3f1a2d4b6e
Create Date: 2026-03-14 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3f51d9c84b2a"
down_revision: Union[str, Sequence[str], None] = "9c3f1a2d4b6e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column.get("name") == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "projects", "demo_url"):
        op.add_column("projects", sa.Column("demo_url", sa.String(length=250), nullable=True))
    if not _has_column(inspector, "projects", "repository_url"):
        op.add_column("projects", sa.Column("repository_url", sa.String(length=250), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "projects", "repository_url"):
        op.drop_column("projects", "repository_url")
    if _has_column(inspector, "projects", "demo_url"):
        op.drop_column("projects", "demo_url")
