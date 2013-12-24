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
