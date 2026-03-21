"""add_published_to_projects

Revision ID: 9c3f1a2d4b6e
Revises: 0674062e7a65
Create Date: 2026-03-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c3f1a2d4b6e"
down_revision: Union[str, Sequence[str], None] = "0674062e7a65"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column.get("name") == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "projects", "published"):
        op.add_column(
            "projects",
            sa.Column("published", sa.Boolean(), nullable=False, server_default=sa.true()),
        )
        op.alter_column("projects", "published", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "projects", "published"):
        op.drop_column("projects", "published")
