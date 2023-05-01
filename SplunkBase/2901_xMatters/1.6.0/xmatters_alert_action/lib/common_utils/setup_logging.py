# pylint: skip-file
import logging
from splunk import setupSplunkLogger
from splunk.clilib.bundle_paths import make_splunkhome_path
import os

def setup_logging(log_name, logger_name, logger=None, level=logging.INFO, is_console_header=False,
                  log_format='%(asctime)s %(levelname)s [%(name)s] [%(module)s] [%(funcName)s] [%(process)d]'
                             ' %(message)s', is_propagate=False):
    """
    Setup logging -- Taken from ITSI SA-ITOA library

    @param log_name: log file name
    @param logger_name: logger name (if logger specified then we ignore this argument)
    @param logger: logger object
    @param level: logging level
    @param is_console_header: set to true if console logging is required
    @param log_format: log message format
    @param is_propagate: set to true if you want to propagate log to higher level
    @return: logger
    """
    if log_name is None or logger_name is None:
        raise ValueError("log_name or logger_name is not specified")

    if logger is None:
        # Logger is singleton so if logger is already defined it will return old handler
        logger = logging.getLogger(logger_name)


    logger.propagate = is_propagate  # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(level)

    # If handlers is already defined then do not create new handler, this way we can avoid file opening again
    # which is issue on windows see ITOA-2439 for more information
    # TODO: we do not check for type of handler, we can add this check later
    if len(logger.handlers) == 0:
        try:
            lockdir = make_splunkhome_path(['var', 'log' 'xmatters_alert_action', 'lock'])
            if not os.path.exists(os.path.dirname(lockdir)):
                os.mkdir(make_splunkhome_path(['var', 'log', 'xmatters_alert_action']))
                os.mkdir(make_splunkhome_path(['var', 'log', 'xmatters_alert_action', 'lock']))
            elif not os.path.exists(lockdir):
                os.mkdir(lockdir)
        except OSError as ose:
            #Swallow all "File exists" errors - another thread/process beat us to the punch
            if ose.errno != 17:
                raise

        #Note that there are still some issues with windows here, going to make it so that we dont
        file_handler = logging.handlers.RotatingFileHandler(make_splunkhome_path(['var', 'log', 'splunk', log_name]),
                                                            maxBytes=2500000, backupCount=5)
        formatter = logging.Formatter(log_format)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        # Console stream handler
        if is_console_header:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter(log_format))
            logger.addHandler(console_handler)

    # Read logging level information from log.cfg so it will overwrite log
    # Note if logger level is specified on that file then it will overwrite log level
    LOGGING_DEFAULT_CONFIG_FILE = make_splunkhome_path(['etc', 'log.cfg'])
    LOGGING_LOCAL_CONFIG_FILE = make_splunkhome_path(['etc', 'log-local.cfg'])
    LOGGING_STANZA_NAME = 'python'
    setupSplunkLogger(
        logger,
        LOGGING_DEFAULT_CONFIG_FILE,
        LOGGING_LOCAL_CONFIG_FILE,
        LOGGING_STANZA_NAME,
        verbose=False
    )

    return logger