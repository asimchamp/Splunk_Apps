
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2014 by ITrust

"""Commonly used tools and utilities.
"""

from distutils.version import StrictVersion
import six


PY3 = six.PY3
PY2 = not PY3

#depending on the version of six, the with_metaclass function can be invalid
if StrictVersion(six.__version__) >= StrictVersion('1.8.0'):
    with_metaclass = six.with_metaclass
else:
    def with_metaclass(meta, *bases):
        """Create a base class with a metaclass."""
        class metaclass(meta):
            def __new__(cls, name, this_bases, d):
                return meta(name, bases, d)
        return type.__new__(metaclass, 'temporary_class', (), {})


def typename(obj):
    """Return the name of the object's type.
    :param object obj:
    """
    return type(obj).__name__


def singleton(cls):
    """Singleton class decorator.
    found in pep-0318 (From Shane Hathaway on python-dev .)
    :param type cls:

    usage:

    @singleton
    class MyClass(object):
        ...
    """
    instances = {}
    def getinstance():
        if cls not in instances:
            instances[cls] = cls()
        return instances[cls]
    return getinstance


def lcfirst(word):
    """Convert the first character of the string to lower case. Do not modify
    anything else in the string.
    :param word: the string to convert
    :type s: str or unicode
    :rtype: str or unicode
    """
    return word[0].lower() + word[1:]


def ucfirst(word):
    """Convert the first character of the string to upper case. Do not modify
    anything else in the string.
    :param word: the string to convert
    :type s: str or unicode
    :rtype: str or unicode
    """
    return word[0].upper() + word[1:]
