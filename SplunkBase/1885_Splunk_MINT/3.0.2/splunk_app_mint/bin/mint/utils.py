import os
import time
import logging.handlers

# logging.Formatter does not support logging local time with current offset
# since it relies on time module which does not store timezone in time tuple.
# Therefore logged time is inaccurate unless we force UTC timezone
# More info:
# http://stackoverflow.com/questions/27858539/python-logging-module-emits-wrong-timezone-information 
# https://docs.python.org/2/library/logging.html#logging.Formatter.formatTime
logging.Formatter.converter = time.gmtime

def setup_logging(app):
    logger = logging.getLogger(app)
    if len(logger.handlers)>0:
        return logger
    LOG_FILENAME = os.path.join(os.environ.get('SPLUNK_HOME'), 'var','log','splunk','%s.log' % app)
    logger.setLevel(logging.DEBUG)
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1024000, backupCount=5)
    handler.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] [%(filename)s] %(message)s'))
    handler.setLevel(logging.DEBUG)
    logger.addHandler(handler)
    
    return logger

logger = setup_logging("mint")


def get_key(config, key, default=None):
    if key in config:
        if config[key] and len(config[key]) > 0:
            return config[key]
   
    return default