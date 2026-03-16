"""add analytics event table

Revision ID: e5f1a2b3c4d6
Revises: c9e8f7a6b5d4
Create Date: 2026-03-16 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e5f1a2b3c4d6"
down_revision: Union[str, None] = "c9e8f7a6b5d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "analytics_event"):
        op.create_table(
            "analytics_event",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("event_type", sa.String(length=30), nullable=False),
            sa.Column("section", sa.String(length=60), nullable=True),
            sa.Column(
                "referrer",
                sa.String(length=500),
                nullable=False,
                server_default="",
            ),
            sa.Column(
                "session_id",
                sa.String(length=36),
                nullable=False,
                server_default="",
            ),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_analytics_event_event_type",
            "analytics_event",
            ["event_type"],
        )
        op.create_index(
            "ix_analytics_event_created_at",
            "analytics_event",
            ["created_at"],
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "analytics_event"):
        op.drop_index("ix_analytics_event_created_at", table_name="analytics_event")
        op.drop_index("ix_analytics_event_event_type", table_name="analytics_event")
        op.drop_table("analytics_event")
