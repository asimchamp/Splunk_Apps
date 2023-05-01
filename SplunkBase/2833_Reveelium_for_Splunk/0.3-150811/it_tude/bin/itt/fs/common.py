#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Tools to manipulate files independently of the storage mechanism.
"""

from .errors import *
from itrust.common import singleton, with_metaclass
from six import string_types
import glob
import os
import stat
try:
    from urlparse import urlsplit, urlunsplit
except ImportError:
    from urllib.parse import urlsplit, urlunsplit


@singleton
class FSFactory(dict):
    """The database of all known storage mechanisms.
    """

    def instantiate_client(self, uri):
        scheme = uri.split("://")[0]
        if scheme in self:
            return self[scheme](uri)
        #else:
        raise ValueError("Invalid uri. Unknown scheme '{0}'".format(scheme))


class _MetaFSClient(type):

    def __new__(mcls, name, bases, namespace):
        """Add the HTTPStatus subclass to StatusList."""
        cls = type.__new__(mcls, name, bases, namespace)
        if name != "FSClient":
            if not cls.SCHEME:
                raise NotImplementedError("'{0}.SCHEME' is None".format(name))
            #else:
            FSFactory()[cls.SCHEME] = cls
        return cls


class FSClient(with_metaclass(_MetaFSClient, object)):
    """Storage independant base class of all (storage dependant) file
    manipulation classes.

    To handle fs manipulation, subclasses MUST redefine:
     * _config
     * _chgrp
     * _chmod
     * _chown
     * _chgrp
     * _chmod
     * _chown
     * _df
     * _du
     * _ls
     * _mkdir
     * _mv
     * _put
     * _retrieve
     * _rm
     * _rmdir
     * _touch

    Subclasses SHOULD redefine:
     * __init__
     * _setup
     * _handle_exception
     * _teardown
    """

    SCHEME = None

    def __init__(self, uri):
        """uri is the connection string to the filesystem.
        examples of valid uri:
        file:///opt/my/path
        hdfs://hduser@localhost:54310/
        """
        parts = urlsplit(uri)
        self._scheme = parts.scheme
        if parts.password is None:
            self._netloc = parts.netloc
        elif self._hostname:
            userpart = self._username and self._username + "@" or ""
            portpart = self._port and ":" + self._port or ""
            self._netloc = userpart + self._hostname + portpart
        else:
            self._netloc = ""
        self._config(parts.scheme, parts.username, parts.password,
                     parts.hostname, parts.port, parts.path)

    def _config(self, scheme=None, username=None, password=None,
                hostname=None, port=None, path=None):
        raise RuntimeError("Filesystem config is not implemented")

    def __enter__(self):
        self._setup()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type:
            self._handle_exception(exc_type, exc_value, traceback)
        self._teardown()

    def _setup(self):
        pass

    def _handle_exception(self, exc_type, exc_value, traceback):
        pass

    def _teardown(self):
        pass

    def get_url(self, path=None):
        """Return the public (no password) url for the specified path.
        examples of returned url:
        file:///opt/my/path
        hdfs://hduser@localhost:54310/
        """
        return urlunsplit((self._scheme, self._netloc, path or "", "", ""))

    def chgrp(self, paths, group, recursive=False):
        """Change the group of paths. paths is a list of path to chgrp.

        Implementation can raise a FSUnknownGroupError if group is unknown.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._chgrp(paths, group, recursive)

    def _chgrp(self, paths, group, recursive=False):
        """chgrp implementation.
        """
        raise RuntimeError("No implementation of method")

    def chmod(self, paths, mode, recursive=False):
        """Change the mode for paths. paths is a list of path to chmod.

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        mode = stat.S_IMODE(mode)
        return self._chmod(paths, mode, recursive)

    def _chmod(self, paths, mode, recursive=False):
        """chmod implementation.
        """
        raise RuntimeError("No implementation of method")

    def chown(self, paths, owner, recursive=False):
        """Change the owner for paths. paths is a list of path to chmod.
        owner is either user or user:group

        Implementation can raise a FSUnknownUserError if user is unknown.
        Implementation can raise a FSUnknownGroupError if group is specified
        and unknown.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._chown(paths, owner, recursive)

    def _chown(self, paths, owner, recursive=False):
        """chown implementation.
        """
        raise RuntimeError("No implementation of method")

    def delete(self, *args, **kwargs):
        """alias for rm
        """
        return self.rm(*args, **kwargs)

    def df(self):
        """Filesystem information (as returned by df command line utility).

        Return a dictionnary containing the following keys:
         * filesystem: the mounted filesystem
         * capacity: total filesystem size in bytes (!= used + available)
         * used: used storage space in bytes
         * available: free storage space in bytes
        """
        return self._df()

    def _df(self):
        """df implementation.
        """
        raise RuntimeError("No implementation of method")

    def ls(self, paths, directory=False, followlinks=False):
        """Get the fileinfo of the listed paths. If a path is a directory, list
        the files and directories inside it. Set directory to True to get the
        fileinfo of the directory itself, and not its children. Set followlinks
        to True to get the fileinfo of the linked file instead of the link
        infos. followlinkss is ignored if the filesystem doesn't support
        symbolic links.

        Fileinfo is a dictionnary containing at least the following keys:
         * path: the file/directory path
         * ftype: 'f' for file, 'd' for directory, 'l' for symbolic link,
                  'p' for pipe, 's' for socket, 'c' for character device,
                  'b' for block device
         * owner: the user owning the file
         * group: the group owning the file
         * perms: int
         * size: the file size
         * atime: last access timestamp
         * mtime: last modification timestamp

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._ls(paths, directory, followlinks)

    def _ls(self, paths, directory=False, followlinks=False):
        """ls implementation.
        """
        raise RuntimeError("No implementation of method")

    def mkdir(self, paths, parents=False, mode=509):
        """Create the directories if they do not already exist. paths is a list
        of path. If parents is True, make parent directories as needed.

        Raises FSFileNotFoundError when the first non-existing parent path is
        found and parents is False.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._mkdir(paths, parents, mode)

    def _mkdir(self, paths, parents=False, mode=509):
        """mkdir implementation.
        """
        raise RuntimeError("No implementation of method")

    def mv(self, paths, dst):
        """Rename paths to dst, or move paths to dst. paths is a list of path.
        dst is the new name or the destination directory.

        Raises FSInvalidOperationError if paths contains multiple path and dst
        is not a directory.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._mv(paths, dst)

    def _mv(self, paths, dst):
        """mv implementation.
        """
        raise RuntimeError("No implementation of method")

    def put(self, paths, dst, check_crc=False):
        """For remote/distributed filesystems, push a copy of the files pointed
        by paths to the remote destination. For local fs, simply create a copy
        of the files. paths is a list of path. If check_crc is True, check for
        checksum errors.
        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._put(paths, dst, check_crc)

    def _put(self, paths, dst, check_crc=False):
        """put implementation.
        """
        raise RuntimeError("No implementation of method")

    def rename(self, *args, **kwargs):
        """alias for mv method.
        """
        self.mv(*args, **kwargs)

    def retrieve(self, paths, dst, check_crc=False):
        """For remote/distributed filesystems, create a local copy of the files
        pointed by paths. For local fs, simply create a copy of the files.
        paths is a list of path. If check_crc is True, check for checksum
        errors.
        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._retrieve(paths, dst, check_crc)

    def _retrieve(self, paths, dst, check_crc=False):
        """retrieve implementation.
        """
        raise RuntimeError("No implementation of method")

    def rm(self, paths, recursive=False):
        """Delete paths. paths is a list of path. Set recursive to True to
        recursively remove the whole tree.

        Raises FSInvalidOperationError if recursive is False and path is a dir.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._rm(paths, recursive)

    def _rm(self, paths, recursive=False):
        """rm implementation.
        """
        raise RuntimeError("No implementation of method")

    def rmdir(self, paths):
        """Remove empty directories. paths is a list of path.

        Raises FSInvalidOperationError if path is a file or a non-empty dir.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._rmdir(paths)

    def _rmdir(self, paths):
        """rmdir implementation.
        """
        raise RuntimeError("No implementation of method")

    def touch(self, paths):
        """Change files timestamps or create zero-length files (for
        non-existing paths). paths is a list of path.

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if isinstance(paths, string_types):
            paths = [paths]
        return self._touch(paths)

    def _touch(self, paths):
        """touch implementation.
        """
        raise RuntimeError("No implementation of method")

    def unlink(self, *args, **kwargs):
        """alias for rm
        """
        return self.rm(*args, **kwargs)
