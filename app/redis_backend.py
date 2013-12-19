import random
import redis

class RedisMessageBackend(object):
    def __init__(self):
        self.conn = redis.StrictRedis(host='localhost', db=6)

    def get_by_id(self, _id, none_msg=None):
        txt = self.conn.lindex("messages", _id)
        return txt if txt is not None else none_msg

    def get_all(self):
        return self.conn.lrange("messages", 0, -1)

    def add_message(self, text):
        self.conn.lpush("messages", text)

    def random(self):
        llen = self.conn.llen("messages")
        return self.conn.lindex("messages", random.randint(0, llen - 1))


class RedisUserBackend(object):
    def __init__(self):
        self.conn = redis.StrictRedis(host='localhost', db=6)

    def next_message_id(self, client_id):
        mid = self.conn.hincrby("clients", client_id, 1)
        llen = self.conn.llen("messages")

        if mid >= llen:
            mid = 0
            self.conn.hset("clients", client_id, 0)

        return mid

    def authorized(self, ip):
        lock = self.conn.exists("lock:%s" % ip)
        if lock:
            return False
        else:
            self.conn.set("lock:%s" % ip, 1, ex=300)
            return True