"""add_availability_status_to_user

Revision ID: e2c4f1a8b3d6
Revises: d7b3e9c1f2a5
Create Date: 2026-03-15 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e2c4f1a8b3d6"
down_revision: Union[str, Sequence[str], None] = "d7b3e9c1f2a5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "user",
        sa.Column(
            "availability_status",
            sa.String(length=30),
            nullable=False,
            server_default="available",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("user", "availability_status")
