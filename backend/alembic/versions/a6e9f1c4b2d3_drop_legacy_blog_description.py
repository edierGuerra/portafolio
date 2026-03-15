"""drop legacy blog description column

Revision ID: a6e9f1c4b2d3
Revises: f3b6d9a1c2e4
Create Date: 2026-03-15 20:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a6e9f1c4b2d3"
down_revision: Union[str, Sequence[str], None] = "f3b6d9a1c2e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "blog", "description"):
        op.drop_column("blog", "description")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "blog", "description"):
        op.add_column(
            "blog",
            sa.Column("description", sa.String(length=2000), nullable=False, server_default=""),
        )
        op.execute("UPDATE blog SET description = excerpt WHERE description = '' OR description IS NULL")
        op.alter_column("blog", "description", server_default=None)