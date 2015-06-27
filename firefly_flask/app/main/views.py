from flask import render_template, redirect, url_for, current_app
from .. import db
from ..models import  Search,Photo
from . import main
from .forms import SearchForm

@main.route('/', methods=['GET', 'POST'])
def index():
    form = SearchForm()
    if form.validate_on_submit():
        search_query = form.search_query.data
        return redirect(url_for('main.search',search_query = search_query))
    else:
        return render_template('index.html',form = form)

@main.route('/search/', methods=['GET', 'POST'])
@main.route('/search/<search_query>', methods=['GET', 'POST'])
def search(search_query = None):
    if search_query:
        form = SearchForm()
        form.search_query.data = search_query
        db_result = Search.query.join(Photo).filter(Search.id==Photo.search_id).filter(Search.search_string == search_query).all()

        if form.validate_on_submit():
            return redirect(url_for('main.search',search_query = form.search_query.data))
        else:
            return render_template('search.html',form = form,db_result = db_result)

        form.search_query.data = search_query
        return render_template('search.html',form = form,db_result = db_result, query = search_query)
    else:
        form = SearchForm()
        return render_template('search.html',form = form)

