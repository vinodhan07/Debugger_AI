"""Add IVFFlat index to documents embedding

Revision ID: 6f37a2dd767e
Revises: e7620be230db
Create Date: 2026-02-22 13:26:22.583331

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f37a2dd767e'
down_revision: Union[str, Sequence[str], None] = 'e7620be230db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Temporarily disabled due to 4096-dimension limit in pgvector/ivfflat/hnsw
    # op.execute("CREATE INDEX documents_embedding_idx ON documents USING hnsw (embedding vector_cosine_ops);")
    pass


def downgrade() -> None:
    """Downgrade schema."""
    # op.execute("DROP INDEX documents_embedding_idx;")
    pass
