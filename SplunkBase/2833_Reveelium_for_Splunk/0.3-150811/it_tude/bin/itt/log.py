#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Logging tools and utilities.
"""

from logging import *
import sys


IttFormater = Formatter(
    "[pid: %(process)-5d] %(asctime)-23s "
    "%(levelname)-8s %(name)-20s %(message)s"
    )


def getRootLogger(min_level=INFO):
    logger = getLogger()
    logger.setLevel(min_level)
    return logger


class StakedLogFilter(Filter):
    """Filter all messages by checking min_level <= level < max_level"""

    def __init__(self, min_level=NOTSET, max_level=CRITICAL + 1):
        """Don't worry if you invert parameters.
        """
        self.min_level = min(min_level, max_level)
        self.max_level = max(min_level, max_level)

    def filter(self, record):
        return self.min_level <= record.levelno < self.max_level


class StdoutHandler(StreamHandler):
    """Handler used to log on ``sys.stdout``, any message with level lower than
    ``logging.WARNING``.
    """

    def __init__(self, form=IttFormater):
        """Accept a formatter as argument.
        """
        StreamHandler.__init__(self, sys.stdout)
        self.addFilter(StakedLogFilter(NOTSET, WARNING))
        self.setFormatter(IttFormater)


class StderrHandler(StreamHandler):
    """Handler used to log on ``sys.stderr``, any message with level higher
    than ``logging.WARNING`` (or equals).
    """

    def __init__(self, form=IttFormater):
        """Accept a formatter as argument.
        """
        StreamHandler.__init__(self, sys.stdout)
        self.addFilter(StakedLogFilter(WARNING, CRITICAL + 1))
        self.setFormatter(IttFormater)
