#/bin/bash
pkill -f th_flickr_rest.fcgi
./th_flickr_rest.fcgi &
sleep 3
chmod 666 /tmp/th_flickr_rest.sock
