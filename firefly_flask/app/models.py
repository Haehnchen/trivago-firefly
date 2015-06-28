from . import db
from sqlalchemy.dialects.mysql import LONGTEXT

class Search(db.Model):
    __tablename__ = 'spots'
    id = db.Column(db.Integer, primary_key=True)
    search_string = db.Column(db.Text)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    location_name = db.Column(db.Text)
    json_result = db.Column(LONGTEXT)

class Photo(db.Model):
    __tablename__ = 'photos'
    id = db.Column(db.Integer, primary_key=True)
    spotname = db.Column(db.Text)
    source_id = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    tags = db.Column(db.Text)
    views = db.Column(db.Integer)
    favourites = db.Column(db.Integer)
    comments = db.Column(db.Integer)
    username = db.Column(db.Text)
    photo_url = db.Column(db.Text)
    search_id = db.Column(db.ForeignKey(Search.id),nullable=False)



