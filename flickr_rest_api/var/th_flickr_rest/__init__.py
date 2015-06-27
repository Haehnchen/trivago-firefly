from flask import Flask, jsonify
import flickrapi

api_key = u'f58f073c2e4b81e2ea674ba21cf637c7'
api_secret = u'01c00f92fc58fd2f'
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json')

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
    try:
        lat, lon = float(lat), float(lon)
        data = flickr.photos.search(lat=lat, lon=lon, radius=30, radius_units='km', privacy_filter=1, license='1,2,3,4,5,6,7', content_type=1, extras='description,license,owner_name,original_format,geo,tags,machine_tags,views,url_o,count_faves,count_comments,visibility,usage,rotation',per_page=250,page=1,is_geo=True)
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
    return jsonify({'photos': photos})

if __name__ == '__main__':
    app.run(debug=True)