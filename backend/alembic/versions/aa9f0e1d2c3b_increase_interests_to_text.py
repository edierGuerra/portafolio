"""increase_interests_to_text

Revision ID: aa9f0e1d2c3b
Revises: b1c2d3e4f5a6
Create Date: 2026-03-15 13:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "aa9f0e1d2c3b"
down_revision: Union[str, Sequence[str], None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "interests",
        "interest",
        existing_type=sa.String(length=50),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "interests",
        "interest",
        existing_type=sa.Text(),
        type_=sa.String(length=50),
        existing_nullable=False,
    )
