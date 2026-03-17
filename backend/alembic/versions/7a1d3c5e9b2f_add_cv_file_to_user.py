"""add cv_file to user

Revision ID: 7a1d3c5e9b2f
Revises: f3b6d9a1c2e4
Create Date: 2026-03-16 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7a1d3c5e9b2f"
down_revision: Union[str, Sequence[str], None] = "f3b6d9a1c2e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "user", "cv_file"):
        op.add_column("user", sa.Column("cv_file", sa.String(length=500), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "user", "cv_file"):
        op.drop_column("user", "cv_file")
