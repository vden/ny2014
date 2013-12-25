ny2014
======

New Year congratulations server

Deployment

```bash
git clone https://github.com/vden/ny2014 ny2014
cd ny2014

# run virtualenv
virtualenv .
. bin/activate

# install requirements
pip install -r requirements.txt

# add config to nginx
# /etc/nginx/sites-enabled on debian-based
# /etc/nginx/conf.d on rhel/centos/fedora
cp etc/ny2014 /etc/nginx/sites-enabled/ny2014-server.conf
sudo edit /etc/nginx/sites-enabled/ny2014-server.conf

# (optional) add uwsgi startup file to supervisor
# cp etc/ny2014.conf /etc/supervisor/conf.d/
```

API

```
GET /messages/<client_id>/next/

This will return last 20 messages in cycle. Here `client_id' is a random string, it's needed only to identify last shown message to this particular client.

GET /messages/ — shows every message one by one.
GET /message/<id>/ — shows message by number `id'.

POST /messages/ [param `text'] — post message to feed.
```