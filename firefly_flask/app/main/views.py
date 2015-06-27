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
    form = SearchForm()
    if form.validate_on_submit():
        return redirect(url_for('main.search', search_query=form.search_query.data))
    form.search_query.data = search_query
<<<<<<< HEAD
    return render_template('search.html',form = form, query = search_query)
=======
    #result = Search.query.join(Photo).filter(Search.id==Photo.search_id).filter(Search.search_string == search_query).all()
    result = requests.get('http://visitfirefly.de/photos/%s/%s'%(lat,lon)).json()
    return render_template('search.html',form = form, query = search_query,result = result)
>>>>>>> 27b0b7e9269c0a020615eabe505f7325144d0c6e

@main.route('/about')
def about():
    return render_template('about.html')

@main.route('/why')
def why():
    return render_template('why.html')
