import zmq
import datetime
import random
from time import sleep

context = zmq.Context()
socket = context.socket(zmq.PUSH)
socket.connect('tcp://127.0.0.1:5000')
sleeptime=0.5

while True:
    num=random.randint(50,100)
    now = str(datetime.datetime.now())
    sleep(sleeptime)
    payload = now + " Temperature=" + str(num)
    socket.send(payload)
