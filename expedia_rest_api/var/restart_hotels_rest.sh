#/bin/bash
pkill -f th_expedia_rest.fcgi
./th_expedia_rest.fcgi &
sleep 3
chmod 666 /tmp/th_expedia_rest.sock
