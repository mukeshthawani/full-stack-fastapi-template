"""Add Google credentials table

Revision ID: 847d7a4df0ea
Revises: 1a31ce608336
Create Date: 2024-08-22 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes

# revision identifiers, used by Alembic.
revision = '847d7a4df0ea'
down_revision = '1a31ce608336'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'googlecredentials',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('credentials_json', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('expiry', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )


def downgrade():
    op.drop_table('googlecredentials')
