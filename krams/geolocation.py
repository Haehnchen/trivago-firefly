# -*- coding: utf-8 -*-
from geopy.geocoders import GoogleV3

geolocator = GoogleV3()

location = geolocator.geocode(u'Düsseldorf')
print location.__unicode__()
print location.latitude, location.longitude

#Location((51.2277411, 6.7734556, 0.0))
