#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Here is the common file manipulation exceptions hierarchy:

    FSError:
     +-- FSFileNotFoundError
     +-- FSInvalidOperationError
     +-- FSNotEnoughSpaceError
     +-- FSPermissionError
     +-- FSUnknownError
     +-- FSUnknownUserError
     +-- FSUnknownGroupError
"""

from logging import getLogger


LOGGER = getLogger(__name__)


class FSError(Exception):

    @property
    def reason(self):
        try:
            return self.args[0]
        except IndexError:
            return None

    @property
    def underneath(self):
        try:
            return self.args[1]
        except IndexError:
            return None


class FSInvalidOperationError(FSError):
    """Invalid operation erros are errors raise when an incoherent operation
    is performed. rmdir on a file, rmdir on a non-empty dir, etc.
    """


class FSFileNotFoundError(FSError):
    """File or directory not found.
    """


class FSNotEnoughSpaceError(FSError):
    """Not enough remaining space to perform the operation.
    """


class FSPermissionError(FSError):
    """Not allowed to perform this operation.
    """


class FSUnknownError(FSError):
    """An unknown error.
    """

    def __init__(self, *args, **kwargs):
        LOGGER.exception("FS: An unknown error has been raised")
        FSError.__init__(self, *args, **kwargs)


class FSUnknownUserError(FSError):
    """This user is unknown (raised by chown).
    """


class FSUnknownGroupError(FSError):
    """This group is unknown (raised by chown or chgrp).
    """
