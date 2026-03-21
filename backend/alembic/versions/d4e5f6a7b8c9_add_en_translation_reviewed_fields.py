"""Add en_translation_reviewed fields to track reviewed translations

Revision ID: d4e5f6a7b8c9
Revises: f3b6d9a1c2e4
Create Date: 2026-03-20 12:00:00.000000

"""
from alembic import op  # type: ignore[attr-defined]
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4e5f6a7b8c9'
down_revision = 'f3b6d9a1c2e4'
branch_labels = None
depends_on = None


def _has_column(inspector, table, column):
    """Check if a column exists in a table."""
    return column in [c['name'] for c in inspector.get_columns(table)]


def upgrade() -> None:
    # Projects table
    inspector = sa.inspect(op.get_bind())
    
    if not _has_column(inspector, 'projects', 'title_en_reviewed'):
        op.add_column('projects', sa.Column('title_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'projects', 'description_en_reviewed'):
        op.add_column('projects', sa.Column('description_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'projects', 'state_en_reviewed'):
        op.add_column('projects', sa.Column('state_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # Blog table
    if not _has_column(inspector, 'blog', 'title_en_reviewed'):
        op.add_column('blog', sa.Column('title_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'blog', 'excerpt_en_reviewed'):
        op.add_column('blog', sa.Column('excerpt_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'blog', 'content_en_reviewed'):
        op.add_column('blog', sa.Column('content_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'blog', 'seo_title_en_reviewed'):
        op.add_column('blog', sa.Column('seo_title_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'blog', 'seo_description_en_reviewed'):
        op.add_column('blog', sa.Column('seo_description_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # Experience table
    if not _has_column(inspector, 'experience', 'position_en_reviewed'):
        op.add_column('experience', sa.Column('position_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'experience', 'company_en_reviewed'):
        op.add_column('experience', sa.Column('company_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # Blog Category table
    if not _has_column(inspector, 'blog_category', 'name_en_reviewed'):
        op.add_column('blog_category', sa.Column('name_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # Blog Tag table
    if not _has_column(inspector, 'blog_tag', 'name_en_reviewed'):
        op.add_column('blog_tag', sa.Column('name_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # Achievements table
    if not _has_column(inspector, 'achievements', 'title_en_reviewed'):
        op.add_column('achievements', sa.Column('title_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    if not _has_column(inspector, 'achievements', 'subtitle_en_reviewed'):
        op.add_column('achievements', sa.Column('subtitle_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # Technologies table
    if not _has_column(inspector, 'technologies', 'name_en_reviewed'):
        op.add_column('technologies', sa.Column('name_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # Interests table
    if not _has_column(inspector, 'interests', 'interest_en_reviewed'):
        op.add_column('interests', sa.Column('interest_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))
    
    # MyPhilosophy table
    if not _has_column(inspector, 'my_philosophy', 'philosophy_en_reviewed'):
        op.add_column('my_philosophy', sa.Column('philosophy_en_reviewed', sa.Boolean(), nullable=False, server_default='0'))


def downgrade() -> None:
    # MyPhilosophy table
    op.drop_column('my_philosophy', 'philosophy_en_reviewed')
    
    # Interests table
    op.drop_column('interests', 'interest_en_reviewed')
    
    # Technologies table
    op.drop_column('technologies', 'name_en_reviewed')
    
    # Achievements table
    op.drop_column('achievements', 'subtitle_en_reviewed')
    op.drop_column('achievements', 'title_en_reviewed')
    
    # Blog Tag table
    op.drop_column('blog_tag', 'name_en_reviewed')
    
    # Blog Category table
    op.drop_column('blog_category', 'name_en_reviewed')
    
    # Experience table
    op.drop_column('experience', 'company_en_reviewed')
    op.drop_column('experience', 'position_en_reviewed')
    
    # Blog table
    op.drop_column('blog', 'seo_description_en_reviewed')
    op.drop_column('blog', 'seo_title_en_reviewed')
    op.drop_column('blog', 'content_en_reviewed')
    op.drop_column('blog', 'excerpt_en_reviewed')
    op.drop_column('blog', 'title_en_reviewed')
    
    # Projects table
    op.drop_column('projects', 'state_en_reviewed')
    op.drop_column('projects', 'description_en_reviewed')
    op.drop_column('projects', 'title_en_reviewed')
