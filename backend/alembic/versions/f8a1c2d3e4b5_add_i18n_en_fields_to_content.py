"""add i18n en fields to content

Revision ID: f8a1c2d3e4b5
Revises: daa4261e5493
Create Date: 2026-03-19 20:25:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f8a1c2d3e4b5"
down_revision: Union[str, Sequence[str], None] = "daa4261e5493"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column.get("name") == column_name for column in inspector.get_columns(table_name))


def _add_column_if_missing(inspector: sa.Inspector, table_name: str, column: sa.Column) -> None:
    if not _has_column(inspector, table_name, column.name):
        op.add_column(table_name, column)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    _add_column_if_missing(inspector, "user", sa.Column("name_en", sa.String(length=50), nullable=True))
    _add_column_if_missing(inspector, "user", sa.Column("professional_profile_en", sa.String(length=50), nullable=True))
    _add_column_if_missing(inspector, "user", sa.Column("about_me_en", sa.Text(), nullable=True))
    _add_column_if_missing(inspector, "user", sa.Column("location_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "technologies", sa.Column("name_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "experience", sa.Column("position_en", sa.String(length=50), nullable=True))
    _add_column_if_missing(inspector, "experience", sa.Column("company_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "achievements", sa.Column("title_en", sa.String(length=50), nullable=True))
    _add_column_if_missing(inspector, "achievements", sa.Column("subtitle_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "interests", sa.Column("interest_en", sa.Text(), nullable=True))

    _add_column_if_missing(inspector, "my_philosophy", sa.Column("philosophy_en", sa.String(length=250), nullable=True))

    _add_column_if_missing(inspector, "available_services", sa.Column("service_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "frequently_asked_questions", sa.Column("question_en", sa.String(length=250), nullable=True))
    _add_column_if_missing(inspector, "frequently_asked_questions", sa.Column("answer_en", sa.String(length=250), nullable=True))

    _add_column_if_missing(inspector, "contact_info", sa.Column("location_en", sa.String(length=50), nullable=True))
    _add_column_if_missing(inspector, "contact_info", sa.Column("availability_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "projects", sa.Column("title_en", sa.String(length=50), nullable=True))
    _add_column_if_missing(inspector, "projects", sa.Column("description_en", sa.String(length=2000), nullable=True))
    _add_column_if_missing(inspector, "projects", sa.Column("state_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "blog_category", sa.Column("name_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "blog_tag", sa.Column("name_en", sa.String(length=60), nullable=True))

    _add_column_if_missing(inspector, "social_networks", sa.Column("name_en", sa.String(length=50), nullable=True))

    _add_column_if_missing(inspector, "blog", sa.Column("title_en", sa.String(length=120), nullable=True))
    _add_column_if_missing(inspector, "blog", sa.Column("excerpt_en", sa.String(length=500), nullable=True))
    _add_column_if_missing(inspector, "blog", sa.Column("content_en", sa.Text(), nullable=True))
    _add_column_if_missing(inspector, "blog", sa.Column("seo_title_en", sa.String(length=160), nullable=True))
    _add_column_if_missing(inspector, "blog", sa.Column("seo_description_en", sa.String(length=300), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    for table_name, column_name in [
        ("blog", "seo_description_en"),
        ("blog", "seo_title_en"),
        ("blog", "content_en"),
        ("blog", "excerpt_en"),
        ("blog", "title_en"),
        ("social_networks", "name_en"),
        ("blog_tag", "name_en"),
        ("blog_category", "name_en"),
        ("projects", "state_en"),
        ("projects", "description_en"),
        ("projects", "title_en"),
        ("contact_info", "availability_en"),
        ("contact_info", "location_en"),
        ("frequently_asked_questions", "answer_en"),
        ("frequently_asked_questions", "question_en"),
        ("available_services", "service_en"),
        ("my_philosophy", "philosophy_en"),
        ("interests", "interest_en"),
        ("achievements", "subtitle_en"),
        ("achievements", "title_en"),
        ("experience", "company_en"),
        ("experience", "position_en"),
        ("technologies", "name_en"),
        ("user", "location_en"),
        ("user", "about_me_en"),
        ("user", "professional_profile_en"),
        ("user", "name_en"),
    ]:
        if _has_column(inspector, table_name, column_name):
            op.drop_column(table_name, column_name)
