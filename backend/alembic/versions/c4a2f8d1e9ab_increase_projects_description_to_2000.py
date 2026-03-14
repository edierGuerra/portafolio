"""increase_projects_description_to_2000

Revision ID: c4a2f8d1e9ab
Revises: 3f51d9c84b2a
Create Date: 2026-03-14 15:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c4a2f8d1e9ab"
down_revision: Union[str, Sequence[str], None] = "3f51d9c84b2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "projects",
        "description",
        existing_type=sa.String(length=250),
        type_=sa.String(length=2000),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "projects",
        "description",
        existing_type=sa.String(length=2000),
        type_=sa.String(length=250),
        existing_nullable=False,
    )
