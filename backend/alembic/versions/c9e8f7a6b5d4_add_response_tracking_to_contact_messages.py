"""add response tracking to contact messages

Revision ID: c9e8f7a6b5d4
Revises: b8d9e1f2a3c4
Create Date: 2026-03-16 13:05:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c9e8f7a6b5d4"
down_revision: Union[str, None] = "b8d9e1f2a3c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column.get("name") == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "contact_message", "responded"):
        op.add_column(
            "contact_message",
            sa.Column("responded", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        )

    if not _has_column(inspector, "contact_message", "responded_at"):
        op.add_column("contact_message", sa.Column("responded_at", sa.DateTime(), nullable=True))

    if not _has_column(inspector, "contact_message", "response_subject"):
        op.add_column(
            "contact_message",
            sa.Column("response_subject", sa.String(length=180), nullable=False, server_default=""),
        )

    if not _has_column(inspector, "contact_message", "response_message"):
        op.add_column(
            "contact_message",
            sa.Column("response_message", sa.Text(), nullable=True),
        )

    # MySQL no permite default directo en TEXT. Se normaliza primero y luego se aplica NOT NULL.
    op.execute(
        sa.text(
            "UPDATE contact_message "
            "SET response_message = '' "
            "WHERE response_message IS NULL"
        )
    )

    op.alter_column(
        "contact_message",
        "response_message",
        existing_type=sa.Text(),
        nullable=False,
    )

    op.alter_column("contact_message", "responded", server_default=None)
    op.alter_column("contact_message", "response_subject", server_default=None)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "contact_message", "response_message"):
        op.drop_column("contact_message", "response_message")

    if _has_column(inspector, "contact_message", "response_subject"):
        op.drop_column("contact_message", "response_subject")

    if _has_column(inspector, "contact_message", "responded_at"):
        op.drop_column("contact_message", "responded_at")

    if _has_column(inspector, "contact_message", "responded"):
        op.drop_column("contact_message", "responded")
