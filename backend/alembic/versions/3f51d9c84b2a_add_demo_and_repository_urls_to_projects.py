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


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("projects", sa.Column("demo_url", sa.String(length=250), nullable=True))
    op.add_column("projects", sa.Column("repository_url", sa.String(length=250), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("projects", "repository_url")
    op.drop_column("projects", "demo_url")
