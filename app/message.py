import random
import re

from exceptions import ValidationLengthException, ValidationContentException


class DefaultMessageBackend(object):
    def __init__(self):
        self.messages = {}
        self.index = 0

    def get_by_id(self, _id, none_msg=None):
        return self.messages.get(_id, none_msg)

    def get_all(self):
        return self.messages.values()

    def add_message(self, text):
        self.index += 1
        self.messages[self.index] = text

    def random(self):
        return self.messages[random.randint(1, self.index)]


class MessageStore(object):
    def __init__(self, backend=None):
        if backend is None:
            self.backend = DefaultMessageBackend()
        else:
            self.backend = backend

    def add_message(self, text):
        self.backend.add_message(text)

    def filter_id(self, _id):
        return self.backend.get_by_id(_id, "<No such message id>")

    def random(self):
        return self.backend.random()

    def all(self):
        return self.backend.get_all()


matcher = re.compile(ur'[a-zA-Z0-9-!\033\r\n$%^&*()_+\ |~=`{}\[\]:";\'<>?,.\/]', re.U|re.I|re.M)
def validate_message(text):
    if len(text) > 80:
        raise ValidationLengthException()

    mo = matcher.sub('', text)
    if len(mo):
        raise ValidationContentException()

    return text
