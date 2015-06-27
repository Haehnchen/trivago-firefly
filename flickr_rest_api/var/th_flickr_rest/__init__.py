from flask import Flask, jsonify
import flickrapi

service = 'flickr'
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
        data = flickr.photos.search(lat=lat, lon=lon, radius=30, radius_units='km', privacy_filter=1, content_type=1, extras='description,license,owner_name,original_format,geo,tags,machine_tags,views,url_o,count_faves,count_comments,visibility,usage,rotation',per_page=250,page=1,is_geo=True)
    except:
        return "error. something went wrong."
    return jsonify({'photos': data['photos']['photo']})

if __name__ == '__main__':
    app.run(debug=False)