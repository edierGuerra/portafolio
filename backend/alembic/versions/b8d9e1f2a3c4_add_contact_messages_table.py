"""add contact messages table

Revision ID: b8d9e1f2a3c4
Revises: aa9f0e1d2c3b
Create Date: 2026-03-16 10:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b8d9e1f2a3c4"
down_revision: Union[str, None] = "aa9f0e1d2c3b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "contact_message"):
        op.create_table(
            "contact_message",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("email", sa.String(length=120), nullable=False),
            sa.Column("company", sa.String(length=120), nullable=False, server_default=""),
            sa.Column("budget", sa.String(length=80), nullable=False, server_default=""),
            sa.Column("subject", sa.String(length=180), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "contact_message"):
        op.drop_table("contact_message")
