"""Add en_reviewed fields to user profile

Revision ID: add_en_reviewed_fields_user
Revises: d4e5f6a7b8c9
Create Date: 2026-03-20 15:30:00.000000

"""
from alembic import op  # type: ignore[attr-defined]
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_en_reviewed_fields_user'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def _has_column(inspector, table, column):
    """Check if a column exists in a table."""
    return column in [c['name'] for c in inspector.get_columns(table)]


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    
    # User table - Add reviewed fields for EN translations
    if not _has_column(inspector, 'user', 'name_en_reviewed'):
        op.add_column('user', sa.Column('name_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'user', 'professional_profile_en_reviewed'):
        op.add_column('user', sa.Column('professional_profile_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'user', 'about_me_en_reviewed'):
        op.add_column('user', sa.Column('about_me_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'user', 'location_en_reviewed'):
        op.add_column('user', sa.Column('location_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))


def downgrade() -> None:
    # User table
    op.drop_column('user', 'location_en_reviewed')
    op.drop_column('user', 'about_me_en_reviewed')
    op.drop_column('user', 'professional_profile_en_reviewed')
    op.drop_column('user', 'name_en_reviewed')
