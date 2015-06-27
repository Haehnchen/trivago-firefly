from flask.ext.wtf import Form
from wtforms import StringField, SubmitField
from wtforms.validators import Required

class SearchForm(Form):
    name = StringField('Where do you want to photograph?', validators=[Required()])
    submit = SubmitField('Submit')
