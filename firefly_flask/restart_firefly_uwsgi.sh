#!/bin/bash
tmux kill-session -t uwsgi_firefly
sleep 3;
tmux new-session -d -s uwsgi_firefly "uwsgi --socket /tmp/firefly_flask.sock --chdir=/srv/nginx/public_html/trivago_hackathon/project/firefly_flask/ --wsgi-file manage.py --chmod-socket=666 --module manage --callable app --logto /tmp/firefly_flask.log"
