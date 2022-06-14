import zmq
import random
import datetime
from time import sleep

context = zmq.Context()
socket = context.socket(zmq.PUB)
socket.bind("tcp://*:5556")


sleeptime=0.5

while True:
    num=random.randint(50,100)
    dirnum=random.randint(1,2)
    if (dirnum==1):
        direction="east"
    else:
        direction="west"
    now = str(datetime.datetime.now())
    sleep(sleeptime)
    payload= direction + " " + now +  " Temperature=" + str(num)

    socket.send(payload)

