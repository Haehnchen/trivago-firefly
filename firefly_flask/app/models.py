from . import db

class Search(db.Model):
    __tablename__ = 'spots'
    id = db.Column(db.Integer, primary_key=True)
    search_string = db.Column(db.String)
    json_comtent = db.Column(db.String)

class Photo(db.Model):
    __tablename__ = 'photos'
    id = db.Column(db.Integer, primary_key=True)
    spotname = db.Column(db.String)
    source_id = db.Column(db.String)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    tags = db.Column(db.String)
    views = db.Column(db.Integer)
    favourites = db.Column(db.Integer)
    comments = db.Column(db.Integer)
    username = db.Column(db.String)
    photo_url = db.Column(db.String)
    search_id = db.Column(db.ForeignKey(Search.id),nullable=False)



