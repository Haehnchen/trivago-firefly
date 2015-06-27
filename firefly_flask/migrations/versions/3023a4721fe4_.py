"""empty message

Revision ID: 3023a4721fe4
Revises: 5928aa7f11ca
Create Date: 2015-06-27 15:45:56.644861

"""

# revision identifiers, used by Alembic.
revision = '3023a4721fe4'
down_revision = '5928aa7f11ca'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('spots', sa.Column('json_comtent', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('spots', 'json_comtent')
    ### end Alembic commands ###