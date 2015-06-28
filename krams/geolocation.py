# -*- coding: utf-8 -*-
from geopy.geocoders import GoogleV3
import flickrapi
import json

api_key = u'f58f073c2e4b81e2ea674ba21cf637c7'
api_secret = u'01c00f92fc58fd2f'
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json', cache=True)
flickr.cache = flickrapi.SimpleCache(timeout=300, max_entries=1000)

SECRET_KEY = 'dasdhaidUFOIHEzr'

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine('mysql://firefly:jsdfgizs78UBCJAFK@localhost/firefly?charset=utf8', convert_unicode=True, echo=False)

Base = declarative_base()
Base.metadata.reflect(engine)

from sqlalchemy.orm import relationship, backref

class Spot(Base):
    __table__ = Base.metadata.tables['spots']


def get_lat_long(location_string):
    geolocator = GoogleV3()
    location = geolocator.geocode(location_string)
    return (location.__unicode__(), location.latitude, location.longitude)

def get_flickr_photos(lat, lon, location_name, radius, number_of_pages):
    lat, lon = float(lat), float(lon)
    data = flickr.photos.search(lat=lat, lon=lon, radius=radius, radius_units='km', privacy_filter=1, license='1,2,3,4,5,6,7', content_type=1, extras='description,license,owner_name,original_format,geo,tags,machine_tags,views,url_o,count_faves,count_comments,visibility,usage,rotation',per_page=250,page=1,is_geo=True)
    photos = data['photos']['photo']
    page = 1
    while page < number_of_pages:
        page += 1
        print "Flickr results, page {}...".format(page)
        if int(data['photos']['page']) < int(data['photos']['pages']):
            next_page = flickr.photos.search(lat=lat, lon=lon, radius=30, radius_units='km', privacy_filter=1, license='1,2,3,4,5,6,7', content_type=1, extras='description,license,owner_name,original_format,geo,tags,machine_tags,views,url_o,count_faves,count_comments,visibility,usage,rotation',per_page=250,page=page,is_geo=True)
            if not next_page.get('photos'):
                continue
            photos.extend(next_page['photos']['photo'])
        print "{} photos so far...".format(len(photos))
    flickr_photos_to_db(photos, lat, lon, location_name)

def flickr_photos_to_db(photos, lat, lon, location_name):
    from sqlalchemy.orm import scoped_session, sessionmaker, Query
    db_session = scoped_session(sessionmaker(bind=engine))

    db_object = Spot(lat=lat, lon=lon, location_name = location_name, json_result=json.dumps(photos))
    db_session.add(db_object)
    db_session.commit()

if __name__ == '__main__':
    cities = [u'Berlin', u'Hamburg', u'München', u'Köln', u'Frankfurt', u'Stuttgart', u'Düsseldorf', u'Dortmund', u'Essen', u'Bremen', u'Leipzig', u'Dresden', u'Hannover', u'Nürnberg', u'Duisburg', u'Bochum', u'Wuppertal', u'Bielefeld', u'Bonn', u'Münster', u'Karlsruhe', u'Mannheim', u'Augsburg', u'Wiesbaden', u'Gelsenkirchen', u'Mönchengladbach', u'Braunschweig', u'Chemnitz', u'Aachen', u'Kiel', u'Halle', u'Magdeburg', u'Krefeld', u'Freiburg', u'Lübeck', u'Oberhausen', u'Erfurt', u'Mainz', u'Rostock', u'Kassel', u'Hagen', u'Saarbrücken', u'Hamm', u'Mülheim', u'Ludwigshafen', u'Potsdam', u'Leverkusen', u'Oldenburg', u'Osnabrück', u'Solingen', u'Herne', u'Neuss', u'Heidelberg', u'Darmstadt', u'Paderborn', u'Regensburg', u'Ingolstadt', u'Würzburg', u'Wolfsburg', u'Fürth', u'Ulm', u'Offenbach', u'Heilbronn', u'Pforzheim', u'Göttingen', u'Bottrop', u'Recklinghausen', u'Reutlingen', u'Koblenz', u'Bergisch Gladbach', u'Remscheid', u'Bremerhaven', u'Jena', u'Trier', u'Erlangen', u'Moers']
    for city in cities:
        print "Working on...", city
        location_name, city_lat, city_lon = get_lat_long(city)
        city_photos = get_flickr_photos(lat=city_lat, lon=city_lon, location_name=location_name, radius=30, number_of_pages=12)
        flickr_photos_to_db(photos=city_photos, lat=city_lat, lon=city_lon, location_name=location_name)