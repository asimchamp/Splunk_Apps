import sys, traceback
try:
  import zmq

  context = zmq.Context()
  socket = context.socket(zmq.PULL)
# Change address and port to match your environment
  socket.bind("tcp://127.0.0.1:5000")

  while True:
    msg = socket.recv()
    print "%s" % msg
except:
  print "exception"
  exc_type, exc_value, exc_traceback = sys.exc_info()
  print "*** print_tb:"
  traceback.print_tb(exc_traceback, limit=1, file=sys.stdout)
  print "*** print_exception:"
  traceback.print_exception(exc_type, exc_value, exc_traceback,
                              limit=2, file=sys.stdout)
  print "*** print_exc:"
  traceback.print_exc()

