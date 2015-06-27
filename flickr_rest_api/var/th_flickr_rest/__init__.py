from flask import Flask, jsonify, request
import flickrapi
import sqlite3
import json
import os
basedir = os.path.abspath(os.path.dirname(__file__))

api_key = u'f58f073c2e4b81e2ea674ba21cf637c7'
api_secret = u'01c00f92fc58fd2f'
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json', cache=True)
flickr.cache = flickrapi.SimpleCache(timeout=300, max_entries=1000)

SECRET_KEY = 'dasdhaidUFOIHEzr'

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

#engine = create_engine(SQLALCHEMY_DATABASE_URI, convert_unicode=True, echo=False)
engine = create_engine('mysql://firefly:jsdfgizs78UBCJAFK@localhost/firefly', convert_unicode=True, echo=False)

engine = create_engine(SQLALCHEMY_DATABASE_URI, convert_unicode=True, echo=False)

print engine, dir(engine)

Base = declarative_base()
Base.metadata.reflect(engine)

from sqlalchemy.orm import relationship, backref

class Spot(Base):
    __table__ = Base.metadata.tables['spots']

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return "usage: /photos/lat/lon (lat and lon need to be float values)"

@app.route('/<float:lat>', methods=['GET'])
def lat_index(lat):
    return "usage: /photos/lat/lon (lat and lon need to be float values)"

@app.route('/<float:lat>/<float:lon>', methods=['GET'])
def photos(lat=None, lon=None):
    if not lat and lon:
        return "usage: /photos/lat/lon (lat and lon need to be float values)"
    location_name = request.args.get('q')
    location_name = request.args.get('radius')
    try:
        int(radius)
    except:
        radius = 30
    from sqlalchemy.orm import scoped_session, sessionmaker, Query
    db_session = scoped_session(sessionmaker(bind=engine))
    existing_photos = db_session.query(Spot).filter(Spot.lat == lat, Spot.lon == lon).first()
    if existing_photos:
        json_data = json.loads(existing_photos.json_result)
        return jsonify({'photos':json_data})
    else:
        # location_name
        # json_result
        try:
            lat, lon = float(lat), float(lon)
            data = flickr.photos.search(lat=lat, lon=lon, radius=radius, radius_units='km', privacy_filter=1, license='1,2,3,4,5,6,7', content_type=1, extras='description,license,owner_name,original_format,geo,tags,machine_tags,views,url_o,count_faves,count_comments,visibility,usage,rotation',per_page=250,page=1,is_geo=True)
            photos = data['photos']['photo']
            page = 1
            while page < 5:
                page += 1
                if int(data['photos']['page']) < int(data['photos']['pages']):
                    next_page = flickr.photos.search(lat=lat, lon=lon, radius=30, radius_units='km', privacy_filter=1, license='1,2,3,4,5,6,7', content_type=1, extras='description,license,owner_name,original_format,geo,tags,machine_tags,views,url_o,count_faves,count_comments,visibility,usage,rotation',per_page=250,page=page,is_geo=True)
                    if not next_page.get('photos'):
                        continue
                    photos.extend(next_page['photos']['photo'])
        except:
            return "error. something went wrong."
        if not data.get('photos'):
            return "error. something went wrong."
        new_search = Spot(lat=lat, lon=lon, location_name = '', json_result=json.dumps(photos))
        db_session.add(new_search)
        db_session.commit()
        return jsonify({'photos': photos})

if __name__ == '__main__':
    app.run(debug=True)