from flask import Flask, jsonify, request
import json
import requests

app = Flask(__name__)
expedia_api_key = 'jryeU4OjCdUNCuJXH01vjc6Vj3ikd7Xs'

@app.route('/', methods=['GET'])
def index():
    return "usage: /hotels/lat/lon (lat and lon need to be float values)"

@app.route('/<float:lat>', methods=['GET'])
def lat_index(lat):
    return "usage: /hotels/lat/lon (lat and lon need to be float values)"

@app.route('/<float:lat>/<float:lon>', methods=['GET'])
def hotels(lat=None, lon=None):
    if not lat and lon:
        return "usage: /hotels/lat/lon (lat and lon need to be float values)"
    radius = request.args.get('radius')
    try:
        radius = int(radius)
    except:
        radius = 30
    try:
        lat, lon = float(lat), float(lon)
        url = 'http://terminal2.expedia.com/x/hotels?location={},{}&radius={}km&apikey={}'.format(lat,lon,radius,expedia_api_key)
        data = requests.get(url)
        json_data = json.loads(data.content)
    except:
        return "error. something went wrong."
    return jsonify({'hotels': json_data})

if __name__ == '__main__':
    app.run(debug=True)