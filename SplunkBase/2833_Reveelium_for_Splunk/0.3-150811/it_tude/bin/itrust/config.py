
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2013 by ITrust

"""Utilities to read configuration files.

Config class is designed to be overriden by your own config class:

class MyConfig(Config):

    server = Section(
            host = String(default='localhost'),
            port = Int(default=8000),
            ssl = Boolean(default=False),
            certfile = String(default=None),
            keyfile = String(default=None),
            )

    database = Section(
            dbname = String(),
            username = String(),
            password = String(),
            host = String(default='localhost'),
            port = Int(default=5432),
            )

In the previous example, server and database are expected sections in the
configuration files. All options which have a default value (even if None), are
not required in configuration files. So, in section [database], dbname,
username and password are required. A MissingOptionError will be raised when
reading config if any of these three option is not defined in configuration
files.

You can use constructor arguments to read configuration files:

conf = MyConfig(path='/etc/ikare', project='ikare-api', extension='.ini')

Previous command will try to read config from the following files :
 * /etc/ikare/ikare-api.ini
 * /etc/ikare/ikare-api.d/*.ini

You can either load config from a list of files using the read method:

filenames = ['/path/to/a.ini', '/path/to/b.txt', '/home/user/.c.conf']
conf = MyConfig()
conf.read(filenames)

"""

import os
from collections import Mapping
try:
    from ConfigParser import ConfigParser
except ImportError:
    from configparser import ConfigParser

#TODO: find/implement a better parser
# ConfigParser is just used to read configuration files.

#TODO: implement a config write mechanism like Config.write(filename)


class MissingOptionError(RuntimeError):

    def __init__(self, msg="Missing value for Option"):
        super(MissingOptionError, self).__init__(msg)


class Config(object):
    """Base class for your own configuration class. (See module doc for usage)
    """

    def __init__(self, path=None, project=None, extension=None):
        """Can read config if path and project are specified. Will search in
        path for file named with the given project (or project + extension if
        specified) and for files in project + ".d" directory (having the given
        extension if specified).
        """
        object.__setattr__(self, '_data', dict())
        if path is not None and project is not None:
            filenames = list()
            base = os.path.join(path, project)
            if extension:
                if not extension.startswith('.'):
                    extension = ".%s" % extension
                filenames.append("%s%s" % (base, extension))
            else:
                filenames.append(base)
            based = "%s.d" % base

            if os.path.isdir(based):
                for name in os.listdir(based):
                    if not extension or extension and name.endswith(extension):
                        filenames.append(os.path.join(based, name))
            self.read(filenames)

    def read(self, filenames):
        """Read and parse a filename or a list of filenames.

        Files that cannot be opened are silently ignored; this is
        designed so that you can specify a list of potential
        configuration file locations (e.g. current directory, user's
        home directory, systemwide directory), and all existing
        configuration files in the list will be read.  A single
        filename may also be given.

        Return list of successfully read files.
        """
        parser = ConfigParser()
        files = parser.read(filenames)

        data = object.__getattribute__(self, '_data')
        for sect_name, sect in self.itersections():
            d = data.setdefault(sect_name, dict())
            for opt_name, opt in sect.iteroptions():
                if parser.has_option(sect_name, opt_name):
                    d[opt_name] = opt.read(parser.get(sect_name, opt_name))
                else:
                    try:
                        d[opt_name] = opt.default
                    except AttributeError:
                        raise MissingOptionError(
                            "Missing value for option '%s'" % opt_name)

        return files

    @classmethod
    def itersections(cls):
        """Iterate over section defined in the Config class.
        """
        for section_name, section in vars(cls).items():
            if isinstance(section, Section):
                yield section_name, section

    def iteritems(self):
        """Iterate over config sections.
        """
        for section_name, section in self.itersections():
            yield section_name, getattr(self, section_name)

    def __getitem__(self, key):
        return getattr(self, key)

    def __setitem__(self, key, value):
        setattr(self, key, value)

    def __delitem__(self, key):
        delattr(self, key)

    def __setattr__(self, name, value):
        raise RuntimeError("Illegal operation on '%s'" % type(self).__name__)

    def __delattr__(self, name):
        raise RuntimeError("Illegal operation on '%s'" % type(self).__name__)


def _find_name(attr, owner):
    try:
        return vars(attr)['__name__']
    except KeyError:
        pass
    for name, prop in vars(owner).items():
        if prop is attr:
            vars(attr)['__name__'] = name
            return name
    raise RuntimeError("Illegal operation on '%s'" % owner.__name__)


class Section(Mapping):
    """Allow sections to be accessed as dicts.
    """

    def __init__(self, **kwargs):
        vars(self)['_options'] = dict()
        for key, value in kwargs.items():
            setattr(self, key, value)

    def iteroptions(self):
        """Iterate over options defined in the Section.
        """
        options = vars(self)['_options']
        for option_name, option in options.items():
            if isinstance(option, Option):
                yield option_name, option

    def __len__(self):
        return len(vars(self)['_options'])

    def __iter__(self):
        return iter(vars(self)['_options'])

    def __getitem__(self, key):
        return getattr(self, key)

    def __setitem__(self, key, value):
        setattr(self, key, value)

    def __delitem__(self, key):
        delattr(self, key)

    def __getattr__(self, name):
        options = vars(self)['_options']
        return options[name]

    def __setattr__(self, name, value):
        if not isinstance(value, Option):
            raise RuntimeError(
                "Illegal operation on '%s'" % type(self).__name__)
        #else
        options = vars(self)['_options']
        options[name] = value

    def __delattr__(self, name):
        options = vars(self)['_options']
        del options[name]

    def __get__(self, instance, owner):
        name = _find_name(self, owner)
        if instance is None:
            return self
        #else
        return _ConfigProxy(instance, self, name)


class _ConfigProxy(Mapping):

    _instances = dict()

    def __new__(cls, conf, section, section_name):
        try:
            return cls._instances[(conf, section_name)]
        except KeyError:
            pass
        inst = object.__new__(cls)
        own = vars(inst)
        own['section'] = section
        own['_data'] = conf._data.setdefault(section_name, dict())
        cls._instances[(conf, section_name)] = inst
        return inst

    def iteroptions(self):
        """Iterate over options defined in the Section.
        """
        section = vars(self)['section']
        return section.iteroptions()

    def iteritems(self):
        """Iterate over options and values.
        """
        section = vars(self)['section']
        for option_name in section:
            yield option_name, getattr(self, option_name)

    def __iter__(self):
        section = vars(self)['section']
        return iter(section)

    def __len__(self):
        section = vars(self)['section']
        return len(section)

    def __getitem__(self, key):
        return getattr(self, key)

    def __setitem__(self, key, value):
        setattr(self, key, value)

    def __delitem__(self, key):
        delattr(self, key)

    def __getattr__(self, name):
        own = vars(self)
        try:
            return own['_data'][name]
        except KeyError:
            pass
        opt = getattr(own['section'], name)
        try:
            return opt.default
        except AttributeError:
            raise MissingOptionError("Missing value for option '%s'" % name)

    def __setattr__(self, name, value):
        own = vars(self)
        opt = getattr(own['section'], name)
        own['_data'][name] = opt.adapt(value)

    def __delattr__(self, name):
        own = vars(self)
        del own['_data'][name]


class Option(object):
    """Base class for any configuration's option. Override to implement your
    own option type.
    """

    def __init__(self, **kwargs):
        """Only expect optionnals default=<value> argument. default value is
        assumed to be from the expected type. Override if your implementation
        needs some specific arguments.

        host = Option(default="localhost")
        """
        vars(self).update(kwargs)

    def read(self, raw_data):
        """Convert data read from configuration to the expected type. Override
        to implement your own data conversion. raw_data argument type is always
        a str. Return value type is free. In this implementation, returned
        value is a str.
        Should raise ValueError if data can't be converted.
        """
        return raw_data

    def adapt(self, data):
        """Called to convert/validate a manually set option. Override to
        implement your own data conversion. data argument type is unknown.
        Return value type is free. In this implementation, returned value is a
        str.
        Should raise ValueError if data is invalid or can't be converted.
        """
        return str(data)

    def write(self, data):
        """Convert data so it can be written in configuration file(s). Override
        to implement your own data conversion. data argument type is from the
        type returned by read or adapt method. Return value is always a str. In
        this implementation, data argument is a str.
        Should never raise error.
        """
        return data


class Boolean(Option):
    """bool configuration's option.
    """

    def read(self, raw_data):
        """Convert data read from configuration to bool using the following
        (case insensitive) rules:
        "1", "y", "t", "yes", "true" are True,
        "", "0", "n", "f", "no", "false" are False,
        everything else raises a ValueError.
        """
        data = raw_data.lower()
        if data in ("1", "y", "t", "yes", "true"):
            return True
        #else
        if data in ("", "0", "n", "f", "no", "false"):
            return False
        #else
        raise ValueError("Invalid value for bool(): '%s'" % raw_data)

    def adapt(self, data):
        """Convert manually set data to bool using the following (case
        insensitive) rules:
        True, "1", "y", "t", "yes", "true" are True,
        False, "", "0", "n", "f", "no", "false" are False,
        try to convert everything else using the bool keyword.
        """
        if data in (True, False):
            return data
        #else
        if data in ("1", "y", "t", "yes", "true"):
            return True
        #else
        if data in ("", "0", "n", "f", "no", "false"):
            return False
        #else
        return bool(data)

    def write(self, data):
        """Convert a bool data to str.
        """
        if data:
            return 'true'
        #else
        return 'false'


class Float(Option):
    """float configuration's option.
    """

    def read(self, raw_data):
        """Convert data read from configuration to float using the float
        keyword.
        Can raise ValueError.
        """
        return float(raw_data)

    def adapt(self, data):
        """Convert manually set data to float using the float keyword.
        Can raise ValueError.
        """
        return float(data)

    def write(self, data):
        """Convert a float to str.
        """
        return str(data)


class Int(Option):
    """int configuration's option.
    """

    def read(self, raw_data):
        """Convert data read from configuration to int using the int keyword.
        Can raise ValueError.
        """
        return int(raw_data)

    def adapt(self, data):
        """Convert manually set data to int using the int keyword.
        Can raise ValueError.
        """
        return int(data)

    def write(self, data):
        """Convert an int to str.
        """
        return str(data)


class RGBColor(Option):
    """color configuration's option. Tuple of 3 int.
    """

    def read(self, raw_data):
        """Convert data read from configuration to a tuple of 3 ints.
        Can raise ValueError.
        """
        tmp = raw_data.split(",")
        if len(tmp) != 3:
            raise ValueError("Requires exactly 3 integers")
        #else:
        return tuple(map(int, tmp))

    def adapt(self, data):
        """Convert manually set data to a tuple of 3 int using the int keyword.
        Can raise ValueError.
        """
        tmp = tuple(data)
        if len(tmp) != 3:
            raise ValueError("Requires exactly 3 integers")
        #else:
        return tuple(map(int, tmp))

    def write(self, data):
        """Convert a tuple of 3 int to str.
        """
        return ", ".join(map(str, data))


class String(Option):
    """str configuration's option.
    """
    pass
