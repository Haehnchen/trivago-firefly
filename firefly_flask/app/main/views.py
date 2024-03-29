from flask import render_template, redirect, url_for, current_app
from .. import db
from ..models import  Search,Photo
from . import main
from .forms import SearchForm
import requests

@main.route('/', methods=['GET', 'POST'])
def index():
    form = SearchForm()
    if form.validate_on_submit():
        search_query = form.search_query.data
        return redirect(url_for('main.search',search_query = search_query))
    else:
        return render_template('index.html',form = form)

@main.route('/search/<search_query>', methods=['GET', 'POST'])
def search(search_query = None):
    search_query = search_query.title()
    form = SearchForm()
    if form.validate_on_submit():
        return redirect(url_for('main.search', search_query=form.search_query.data.title()))
    form.search_query.data = search_query.title()
    return render_template('search.html',form = form, query = search_query.title())

@main.route('/about')
def about():
    return render_template('about.html')

@main.route('/why')
def why():
    return render_template('why.html')

@main.route('/tech_stack')
def tech_stack():
    return render_template('tech_stack.html')
