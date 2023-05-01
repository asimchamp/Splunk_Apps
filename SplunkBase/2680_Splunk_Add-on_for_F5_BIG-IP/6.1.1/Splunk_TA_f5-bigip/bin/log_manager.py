import logging
import logging.handlers
import os

from splunk.clilib import cli_common as cli
from splunk.clilib.bundle_paths import make_splunkhome_path

DEFAULT_LOG_LEVEL = "INFO"


def setup_logging(log_name):
    """Setup logger.

    :param log_name: name for logger
    :param log_level: log level, a string
    :return: a logger object
    """

    # Make path till log file
    log_file = make_splunkhome_path(["var", "log", "splunk", "%s.log" % log_name])
    # Get directory in which log file is present
    log_dir = os.path.dirname(log_file)
    # Create directory at the required path to store log file, if not found
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Read log level from conf file
    cfg = cli.getConfStanza("splunk_ta_f5_settings", "logging")
    log_level = str(cfg.get("loglevel"))

    logger = logging.getLogger(log_name)
    logger.propagate = False

    # Set log level
    try:
        logger.setLevel(log_level)
    except Exception as e:  # noqa: F841
        logger.setLevel(DEFAULT_LOG_LEVEL)

    handler_exists = any([True for h in logger.handlers if h.baseFilename == log_file])

    if not handler_exists:
        file_handler = logging.handlers.RotatingFileHandler(
            log_file, mode="a", maxBytes=10485760, backupCount=15
        )
        # Format logs
        fmt_str = "%(asctime)s %(levelname)s pid=%(process)d tid=%(threadName)s file=%(filename)s:%(funcName)s:%(lineno)d | %(message)s"  # noqa: E501
        formatter = logging.Formatter(fmt_str)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        if log_level is not None:
            try:
                file_handler.setLevel(log_level)
            except Exception as e:  # noqa: F841
                file_handler.setLevel(DEFAULT_LOG_LEVEL)

    return logger
