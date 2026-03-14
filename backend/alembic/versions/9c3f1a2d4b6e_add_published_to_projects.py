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


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "projects",
        sa.Column("published", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column("projects", "published", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("projects", "published")
