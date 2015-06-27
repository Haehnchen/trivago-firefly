from flask import render_template, redirect, url_for, current_app
from .. import db
from ..models import  Search,Photo
from . import main
from .forms import SearchForm

@main.route('/', methods=['GET', 'POST'])
def index():
    form = SearchForm()
    if form.validate_on_submit():
        query = form.name.data
        if query:
            db_result = Search.query.join(Photo).filter(Search.id==Photo.search_id).filter(Search.search_string == query).all()
            print db_result
        else:
            db_result = None
        return render_template('search.html',form = form, db_result = db_result, query = query)
    else:
        return render_template('search.html',form = form)

