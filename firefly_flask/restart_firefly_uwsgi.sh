#!/bin/sh
pkill -f uwsgi
sleep 1;
screen -dmS firefly_flask uwsgi --socket /tmp/firefly_flask.sock --chdir=/srv/nginx/public_html/trivago_hackathon/project/firefly_flask/ --wsgi-file manage.py --   chmod-socket=666 --module manage --callable app
sleep 2;
