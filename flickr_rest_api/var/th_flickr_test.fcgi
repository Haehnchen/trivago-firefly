from flup.server.fcgi import WSGIServer
from th_flickr_rest import app

#app.debug = True

if __name__ == '__main__':
    WSGIServer(app, bindAddress='/tmp/th_flickr_rest.sock').run()