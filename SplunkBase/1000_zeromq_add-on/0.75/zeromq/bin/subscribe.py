import sys
import zmq

# Socket to talk to server
context = zmq.Context()
socket = context.socket(zmq.SUB)

socket.connect ("tcp://localhost:5556")

# Subscribe to direction
filter = "east"
socket.setsockopt(zmq.SUBSCRIBE, filter)

while True:
    string = socket.recv()
    print string

