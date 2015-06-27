#/bin/bash
pkill -f th_flickr_rest.fcgi
/var/th_flickr_rest.fcgi &
sleep 3
chmod 666 /tmp/th_flickr_rest.sock