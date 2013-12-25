#!/usr/bin/python

import os

import bottle
bottle.TEMPLATE_PATH = (os.path.join(os.path.dirname(__file__), "views"),)
bottle.debug(False)

from middleware import StripPathMiddleware
from message import MessageStore, validate_message
from redis_backend import RedisMessageBackend, RedisUserBackend
from exceptions import ValidationLengthException, ValidationContentException


backend = RedisMessageBackend()
message_store = MessageStore(backend)
users = RedisUserBackend()
app = bottle.Bottle()

@app.route('/')
def show_index():
    return bottle.template("base")


def __setup_response():
    bottle.response.content_type = "text/plain"
    bottle.response.set_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    bottle.response.set_header('Pragma', 'no-cache')
    bottle.response.set_header('Expires', '0')


@app.get('/messages/<client_id>/next')
def get_next_message(client_id):
    __setup_response()

    next_mid = users.next_message_id(client_id)
    return message_store.filter_id(next_mid)


@app.get('/messages/random')
def get_random_message():
    __setup_response()
    return message_store.random()


@app.get('/messages/<message_id:int>')
def get_message(message_id):
    bottle.response.content_type = "text/plain"
    return message_store.filter_id(message_id)


@app.get('/messages')
def get_all_message():
    __setup_response()
    return bottle.template("message", messages=message_store.all())


@app.post("/messages")
def post_message():
    message = None

    if not bottle.request.content_type.startswith('multipart/'):
        # handle raw data (from `curl -d'' for instance)
        maxlen = max(0, min(bottle.request.content_length, 10000))
        body = bottle.request.body.read(maxlen)
        for pair in body.split('&'):
            if not pair: continue
            nv = pair.split('=', 1)
            if len(nv) != 2: continue

            if nv[0] == "text":
                message = nv[1]
    else:
        # handle proper web form request
        message = bottle.request.forms.text

    if message is None:
        bottle.response.status = 400
        return "Empty message\n"

    try:
        text = validate_message(message)
    except ValidationLengthException:
        bottle.response.status = 400
        return "Message must be shorter than 80 characters\n"
    except ValidationContentException:
        bottle.response.status = 400
        return "Message contains invalid characters\n"

    if not users.authorized(bottle.request.remote_addr):
        bottle.response.status = 400
        return "You're allowed to send only one message per 1 minute\n"

    message_store.add_message(text)
    return "ok\n"


application = StripPathMiddleware(app)