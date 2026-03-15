"""increase_about_me_to_text

Revision ID: d7b3e9c1f2a5
Revises: c4a2f8d1e9ab
Create Date: 2026-03-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d7b3e9c1f2a5"
down_revision: Union[str, Sequence[str], None] = "c4a2f8d1e9ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "user",
        "about_me",
        existing_type=sa.String(length=250),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "user",
        "about_me",
        existing_type=sa.Text(),
        type_=sa.String(length=250),
        existing_nullable=False,
    )
