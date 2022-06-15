#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Common tools and utilities.
"""

import os
from random import SystemRandom
try:
    from ConfigParser import ConfigParser
except ImportError:
    from configparser import ConfigParser


# alphabet used to generate the salt. The size of the alphabet must be a power
# of two (len(SALT_ALPHABET) == 2**X).
SALT_ALPHABET = (
    "./abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    )


def msb(n):
    """The position of the most significant bit of a positive int value.

    >>> x = msb(n)
    >>> pow(2, x) <= n < pow(2, x + 1)
    True
    """
    pos = 0
    while n > 1:
        n = n >> 1
        pos += 1
    return pos


def generate_salt(length=2, rand=None):
    """Return a string of randomly chosen characters from the following set:
    [./a-zA-Z0-9]. length is the returned string length. If set, rand must
    provide a randrange function as the one defined by SystemRandom.randrange.
    Return an empty string if length <= 0.

    >>> generate_salt()
    'Ty'
    >>> generate_salt(8)
    '5gd/GIJ.'
    """
    if length <= 0:
        return ""
    #else:
    if rand is None:
        rand = SystemRandom()
    power = msb(len(SALT_ALPHABET))
    mask = (1 << power) - 1
    salt = []
    x = rand.randrange(0, 1 << (power * length))
    for i in range(0, length):
        salt.append(SALT_ALPHABET[mask & x])
        x = x >> power
    return "".join(salt)


class _FakeSecHead(object):

    def __init__(self, fp, section_name="default"):
        self.fp = fp
        self.sechead = "[" + section_name + "]\n"

    def readline(self):
        if self.sechead:
            try:
                return self.sechead
            finally:
                self.sechead = None
        else:
            return self.fp.readline()


def _read_system_tz():
    # read tz from os.environ
    try:
        tzname = os.environ["TZ"]
    except KeyError:
        pass
    else:
        return tzname

    # read /etc/timezone (debian-like systems)
    try:
        with open("/etc/timezone", "r") as f:
            tzname = f.readline().strip()
    except IOError:
        pass
    else:
        return tzname

    # read ZONE from /etc/sysconfig/clock (redhat-like systems)
    parser = ConfigParser()
    try:
        with open("/etc/sysconfig/clock") as f:
            parser.readfp(_FakeSecHead(f, "clock"))
            tzname = parser.get("clock", "ZONE").strip("'\"")
    except IOError:
        pass
    else:
        return tzname

    #FIXME: Mac OS X method to read system tz
    # $ systemsetup -gettimezone
    # Time Zone: Europe/Copenhagen
    return None


def server_timezone(force_reload=False):
    """Try to guess the current tz from local configuration.
    Set force_reload to True to re-read the tz from local configuration.
    Return a pytz.TzInfo object or None.
    """
    if not force_reload:
        try:
            return server_timezone.tz
        except AttributeError:
            pass

    from pytz import timezone
    server_timezone.tz = None
    tzname = _read_system_tz()
    if tzname is not None:
        server_timezone.tz = timezone(tzname)
    return server_timezone.tz
