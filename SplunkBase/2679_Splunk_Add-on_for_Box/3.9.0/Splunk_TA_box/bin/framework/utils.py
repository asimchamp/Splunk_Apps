#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import os
import os.path as op


def make_splunk_path(parts):
    """
    @parts: path relative to splunk home
    """

    home = os.environ.get("SPLUNK_HOME", ".")
    fullpath = op.normpath(op.join(home, *parts))
    return fullpath


def get_appname_from_path(absolute_path):
    parts = absolute_path.split(os.path.sep)
    parts.reverse()
    try:
        idx = parts.index("apps")
    except ValueError:
        return None
    else:
        try:
            if parts[idx + 1] == "etc":
                return parts[idx - 1]
            return None
        except IndexError:
            return None


def setup_logging(log_name, level_name="INFO", refresh=False):
    """
    @log_name: which logger
    @level_name: log level, a string
    """

    import logging
    import logging.handlers as handlers

    level_name = level_name.upper() if level_name else "INFO"
    loglevel_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARN": logging.WARN,
        "ERROR": logging.ERROR,
        "FATAL": logging.FATAL,
    }

    if level_name in loglevel_map:
        loglevel = loglevel_map[level_name]
    else:
        loglevel = logging.INFO

    logfile = make_splunk_path(["var", "log", "splunk", "%s.log" % log_name])
    logger = logging.getLogger(log_name)

    handler_exists = any([True for h in logger.handlers if h.baseFilename == logfile])
    if not handler_exists:
        file_handler = handlers.RotatingFileHandler(
            logfile, mode="a", maxBytes=25000000, backupCount=5
        )
        fmt_str = (
            "%(asctime)s %(levelname)s pid=%(process)d tid=%(thread)d tname=%(threadName)s "
            "filename=%(filename)s::%(funcName)s #%(lineno)d | %(message)s"
        )
        formatter = logging.Formatter(fmt_str)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        logger.setLevel(loglevel)
        logger.propagate = False

    if refresh:
        logger.setLevel(loglevel)

    return logger
