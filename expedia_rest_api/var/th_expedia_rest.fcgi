#!/usr/bin/env python
from flup.server.fcgi import WSGIServer
from th_expedia_rest import app

app.debug = True

if __name__ == '__main__':
    WSGIServer(app, bindAddress='/tmp/th_expedia_rest.sock').run()
