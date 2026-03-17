"""merge cv_file and analytics heads

Revision ID: daa4261e5493
Revises: 7a1d3c5e9b2f, e5f1a2b3c4d6
Create Date: 2026-03-16 17:57:21.283243

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'daa4261e5493'
down_revision: Union[str, Sequence[str], None] = ('7a1d3c5e9b2f', 'e5f1a2b3c4d6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
