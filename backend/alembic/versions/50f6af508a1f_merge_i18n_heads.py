"""merge i18n heads

Revision ID: 50f6af508a1f
Revises: d4e5f6a7b8c9, f8a1c2d3e4b5
Create Date: 2026-03-20 14:35:04.103960

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50f6af508a1f'
down_revision: Union[str, Sequence[str], None] = ('d4e5f6a7b8c9', 'f8a1c2d3e4b5')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
