import logging
import logging.handlers
import os

import splunk.appserver.mrsparkle.lib.util as splunk_lib_util

APP_NAME = __file__.split(os.sep)[-3]


def setup_logging(log_name, log_level):
    """
    Create logger file with given file name and log level.

    :param log_name: Name of log file
    :param log_level: Log level
    :return: logger object
    """
    logfile = splunk_lib_util.make_splunkhome_path(["var", "log", "splunk", "%s.log" % log_name])
    logdir = os.path.dirname(logfile)
    if not os.path.exists(logdir):
        os.makedirs(logdir)
    logger = logging.getLogger(log_name)
    logger.propagate = False

    logger.setLevel(log_level)

    handler_exists = any([True for h in logger.handlers if h.baseFilename == logfile])
    if not handler_exists:
        file_handler = logging.handlers.RotatingFileHandler(logfile, mode="a", maxBytes=10485760, backupCount=10)
        fmt_str = "%(asctime)s %(levelname)s %(thread)d - %(message)s"
        formatter = logging.Formatter(fmt_str)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        if log_level is not None:
            file_handler.setLevel(log_level)

    return logger
