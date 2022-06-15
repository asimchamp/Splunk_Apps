#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Local filesystem implementation of the FSClient.

Usage:
>>> client = LocalFSClient("/")
>>> client.df()
{'available': 3027496960,
 'capacity': 7262953472,
 'filesystem': '/dev/vda1',
 'mountpoint': '/',
 'usage': '56%',
 'used': 3842924544}

>>> list(client.ls("/tmp"))
[{'atime': 1430916388.63529,
  'ctime': 1430916457.11529,
  'ftype': 'd',
  'group': 'vinz',
  'mtime': 1430916457.11529,
  'owner': 'vinz',
  'path': '/tmp/vinz',
  'perms': 493,
  'size': 4096},
 {'atime': 1430916087.01129,
  'ctime': 1430917480.04329,
  'ftype': 'f',
  'group': 'root',
  'mtime': 1430917480.04329,
  'owner': 'root',
  'path': '/tmp/test.txt',
  'perms': 420,
  'size': 16}]

>>> list(client.ls("/tmp", directory=True))
[{'atime': 1430917480.68329,
  'ctime': 1430917476.13529,
  'ftype': 'd',
  'group': 'root',
  'mtime': 1430917476.13529,
  'owner': 'root',
  'path': '/tmp',
  'perms': 1023,
  'size': 4096}]

>>> for path_data in client.ls(["/tmp", "/blabla"], directory=True):
...     print(path_data)
{'perms': 1023, 'ftype': 'd', 'group': 'root', 'ctime': 1430917476.13529,
 'mtime': 1430917476.13529, 'owner': 'root', 'path': '/tmp',
 'atime': 1430917480.68329, 'size': 4096}
---------------------------------------------------------------------------
FSFileNotFoundError                       Traceback (most recent call last)
[...]
FSFileNotFoundError: ('/blabla: No such file or directory',
 OSError(2, 'No such file or directory'))

"""

from .common import FSClient
from .errors import *
from six import integer_types
import errno
import glob
import grp
import os
import pwd
import shutil
import stat
import subprocess


_FTYPES = {
    stat.S_IFBLK: "b",
    stat.S_IFCHR: "c",
    stat.S_IFDIR: "d",
    stat.S_IFIFO: "p",
    stat.S_IFLNK: "l",
    stat.S_IFREG: "f",
    stat.S_IFSOCK: "s",
    }


_ERRORS = {
    errno.EACCES: FSPermissionError,
    errno.EPERM: FSPermissionError,
    errno.ENOENT: FSFileNotFoundError,
    errno.ENOTEMPTY: FSInvalidOperationError,
    errno.ENOTDIR: FSInvalidOperationError,
    errno.EISDIR: FSInvalidOperationError,
    errno.ENOSPC: FSNotEnoughSpaceError,
    errno.EFBIG: FSNotEnoughSpaceError,
    }


def _build_oserror_exc(path, err):
    """Automatically create exceptions when handling some OSErrors.
    """
    if err.errno in _ERRORS:
        return _ERRORS[err.errno]("{0}: {1}".format(path, err.strerror), err)
    #else:
    return FSUnknownError(err.args[1], err)


def _is_expandable(path):
    """True if path contains non-protected *, ? or [ characters.
    """
    for char in "*?[":
        pos = path.find(char)
        if pos == 0 or pos > 0 and path[pos - 1] != "\\":
            return True
    return False


def _expand_paths(paths):
    """Iterate on a list of path, expanding Unix style pathname pattern.

    Return a generator that yields strings.
    """
    for path in paths:
        if not _is_expandable(path):
            yield path
        else:
            for expanded_path in glob.iglob(path):
                yield expanded_path


def _path_walk(path, recursive=True):
    """Generate the path list of pathnames in a tree.
    If recursive is False, only yield the specified path.

    Return a generator that yields strings.
    """
    yield path
    if recursive:
        for dirpath, dirnames, filenames in os.walk(path):
            for dirname in dirnames:
                yield os.path.join(dirpath, dirname)
            for filename in filenames:
                yield os.path.join(dirpath, filename)


def username(uid):
    """Return the name of the user matching the given uid. Return the uid
    itself if the user is not found.
    """
    try:
        data = pwd.getpwuid(uid)
    except KeyError:
        return uid
    #else:
    return data[0]


def groupname(gid):
    """Return the name of the group matching the given gid. Return the gid
    itself if the group is not found.
    """
    try:
        data = grp.getgrgid(gid)
    except KeyError:
        return gid
    #else:
    return data[0]


def user_uid(name):
    """Return the uid of the user matching the given name. Return the name
    itself if the user is not found.
    """
    try:
        data = pwd.getpwnam(name)
    except (KeyError, TypeError):
        try:
            return int(name)
        except ValueError:
            return name
    #else:
    return data[2]


def group_gid(name):
    """Return the gid of the group matching the given name. Return the name
    itself if the group is not found.
    """
    try:
        data = grp.getgrnam(name)
    except (KeyError, TypeError):
        try:
            return int(name)
        except ValueError:
            return name
    #else:
    return data[2]


def fileinfos(path, followlinks=False):
    """Get file infos for the given path.

    Set followlinks to True to get the fileinfo of the linked file instead of
    the link infos.

    Return a dictionnary containing the following keys:
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
     * ctime: creation (or metadata modification) timestamp
    """
    stat_func = followlinks and os.stat or os.lstat
    try:
        st = stat_func(path)
    except os.error as err:
        raise _build_oserror_exc(path, err)
    #else:
    return {"path": path,
            "ftype": _FTYPES[stat.S_IFMT(st.st_mode)],
            "owner": username(st.st_uid),
            "group": groupname(st.st_gid),
            "perms": stat.S_IMODE(st.st_mode),
            "size": st.st_size,
            "atime": st.st_atime,
            "mtime": st.st_mtime,
            "ctime": st.st_ctime,
            }


class LocalFSClient(FSClient):
    """Local filesystem implementation of the FSClient.
    """

    SCHEME = "file"

    def _config(self, scheme=None, username=None, password=None,
                hostname=None, port=None, path=None):
        if scheme != self.SCHEME:
            raise ValueError(
                "Invalid uri. Scheme must be '{0}'".format(self.SCHEME))
        #else:
        if not path:
            raise ValueError("Invalid uri. A path is required")
        #else:
        self.root_path = path

    def _chgrp(self, paths, group, recursive=False):
        """Change the group of paths. paths is a list of path to chgrp.

        Raises FSUnknownGroupError if group is unknown.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        gid = group_gid(group)
        if not isinstance(gid, integer_types):
            raise FSUnknownGroupError("Unkown group '{0}'".format(group))
        #else:
        for path in _expand_paths(paths):
            try:
                for pathname in _path_walk(path, recursive):
                    os.chown(pathname, -1, gid)
                    yield {"path": pathname, "result": True}

            except os.error as err:
                raise _build_oserror_exc(path, err)

    def _chmod(self, paths, mode, recursive=False):
        """Change the mode for paths. paths is a list of path to chmod.

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        for path in _expand_paths(paths):
            try:
                for pathname in _path_walk(path, recursive):
                    os.chmod(pathname, mode)
                    yield {"path": pathname, "result": True}

            except os.error as err:
                raise _build_oserror_exc(path, err)

    def _chown(self, paths, owner, recursive=False):
        """Change the owner for paths. paths is a list of path to chmod.
        owner is either user or user:group

        Raises FSUnknownUserError if user is unknown.
        Raises FSUnknownGroupError if group is specified and unknown.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if ":" in owner:
            user, group = owner.split(":", 1)
            gid = group_gid(group)
            if not isinstance(gid, integer_types):
                raise FSUnknownGroupError("Unkown group '{0}'".format(group))
        else:
            user = owner
            gid = -1
        uid = user_uid(user)
        if not isinstance(gid, integer_types):
            raise FSUnknownGroupError("Unkown user '{0}'".format(user))
        #else:
        for path in _expand_paths(paths):
            try:
                for pathname in _path_walk(path, recursive):
                    os.chown(pathname, uid, gid)
                    yield {"path": pathname, "result": True}

            except os.error as err:
                raise _build_oserror_exc(path, err)

    def _df(self):
        """Filesystem information (as returned by df command line utility).

        Return a dictionnary containing the following keys:
         * filesystem: the mounted filesystem
         * capacity: total filesystem size in bytes (!= used + available)
         * used: used storage space in bytes
         * available: free storage space in bytes
         * mountpoint: the filesystem mount point
        """
        cmd = ["df", "-B1", "-P", self.root_path]
        popen = subprocess.Popen(cmd, stdout=subprocess.PIPE)
        output = popen.stdout.read()
        lines = output.split("\n")
        if len(lines) < 2:
            raise FSUnknownError("'{0}': Didn't produce "
                                 "the expected result".format(" ".join(cmd)))
        #else:
        data = iter(lines[1].split())
        return {"filesystem": next(data),
                "capacity": int(next(data)),
                "used": int(next(data)),
                "available": int(next(data)),
                "usage": next(data),
                "mountpoint": next(data),
                }

    def _ls(self, paths, directory=False, followlinks=False):
        """Get the fileinfo of the listed paths. If a path is a directory, list
        the files and directories inside it. Set directory to True to get the
        fileinfo of the directory itself, and not its children. Set followlinks
        to True to get the fileinfo of the linked file instead of the link
        infos. followlinkss is ignored if the filesystem doesn't support
        symbolic links.

        Fileinfo is a dictionnary containing the following keys:
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
         * ctime: creation (or metadata modification) timestamp

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        for path in _expand_paths(paths):
            infos = fileinfos(path, followlinks)
            if infos["ftype"] != "d" or directory:
                yield infos
            else:
                for filename in os.listdir(path):
                    filepath = os.path.join(path, filename)
                    yield fileinfos(filepath)

    def _mkdir(self, paths, parents=False, mode=509):
        """Create the directories if they do not already exist. paths is a list
        of path. If parents is True, make parent directories as needed.

        Raises FSFileNotFoundError when the first non-existing parent path is
        found and parents is False.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        mkdir_func = parents and os.makedirs or os.mkdir
        for path in paths:
            try:
                mkdir_func(path, mode)
                yield {"path": path, "result": True}

            except os.error as err:
                if err.errno == errno.EEXIST:
                    yield {
                        "path": path,
                        "result": False,
                        "error": "{0}: {1}".format(path, err.strerror),
                        }
                elif err.errno == errno.ENOENT:
                    raise FSFileNotFoundError(
                        path + ": Parent directory doesn't exist", err)
                else:
                    raise _build_oserror_exc(path, err)

    def _mv(self, paths, dst):
        """Rename paths to dst, or move paths to dst. paths is a list of path.
        dst is the new name or the destination directory.

        Raises FSInvalidOperationError if paths contains multiple path and dst
        is not a directory.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        if not os.path.isdir(dst):
            expanded_paths = list(_expand_paths(paths))
            if len(expanded_paths) > 1:
                raise FSInvalidOperationError(
                    "Destination must be a directory", None)
        else:
            expanded_paths = _expand_paths(paths)

        for path in expanded_paths:
            try:
                shutil.move(path, dst)
                yield {"path": path, "result": True}

            except os.error as err:
                raise _build_oserror_exc(path, err)

    def _put(self, paths, dst, check_crc=False):
        """For remote/distributed filesystems, push a copy of the files pointed
        by paths to the remote destination. For local fs, simply create a copy
        of the files. paths is a list of path. If check_crc is True, check for
        checksum errors.

        Raises FSInvalidOperationError if paths contains multiple path and dst
        is not a directory.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        check_crc is ignored for local filesystem.

        Return a generator that yields dictionnaries.
        """
        if not os.path.isdir(dst):
            dst_exists = False
            expanded_paths = list(_expand_paths(paths))
            if len(expanded_paths) > 1:
                raise FSInvalidOperationError(
                    "Destination must be a directory", None)
        else:
            dst_exists = True
            expanded_paths = _expand_paths(paths)

        for path in expanded_paths:
            try:
                if os.path.isdir(path):
                    if dst_exists:
                        basename = os.path.basename(path.rstrip(os.path.sep))
                        real_dst = os.path.join(dst, basename)
                    else:
                        real_dst = dst
                    shutil.copytree(path, real_dst, symlinks=True)
                    yield {"path": path, "result": True}
                else:
                    shutil.copy2(path, dst)
                    yield {"path": path, "result": True}

            except os.error as err:
                raise _build_oserror_exc(path, err)

    def _retrieve(self, paths, dst, check_crc=False):
        """For remote/distributed filesystems, create a local copy of the files
        pointed by paths. For local fs, simply create a copy of the files.
        paths is a list of path. If check_crc is True, check for checksum
        errors.

        Raises FSInvalidOperationError if paths contains multiple path and dst
        is not a directory.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        check_crc is ignored for local filesystem.

        Return a generator that yields dictionnaries.
        """
        return self._put(paths, dst, check_crc)

    def _rm(self, paths, recursive=False):
        """Delete paths. paths is a list of path. Set recursive to True to
        recursively remove the whole tree.

        Raises FSInvalidOperationError if recursive is False and path is a dir.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        rm_func = recursive and shutil.rmtree or os.remove
        for path in _expand_paths(paths):
            try:
                rm_func(path)
                yield {"path": path, "result": True}

            except os.error as err:
                raise _build_oserror_exc(path, err)

    def _rmdir(self, paths):
        """Remove empty directories. paths is a list of path.

        Raises FSInvalidOperationError if path is a file or a non-empty dir.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        for path in _expand_paths(paths):
            try:
                os.rmdir(path)
                yield {"path": path, "result": True}

            except os.error as err:
                raise _build_oserror_exc(path, err)

    def _touch(self, paths):
        """Change files timestamps or create zero-length files (for
        non-existing paths). paths is a list of path.

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        for path in paths:
            try:
                os.utime(path, None)
                yield {"path": path, "result": True}
            except os.error as err:
                if err.errno == errno.ENOENT:
                    try:
                        with open(path, "w") as fp:
                            fp.flush()
                        yield {"path": path, "result": True}
                    except (os.error, IOError) as err2:
                        if err2.errno == errno.ENOENT:
                            raise FSInvalidOperationError(
                                "{0}: {1}".format(path, err2.strerror), err2)
                        raise _build_oserror_exc(path, err2)
                else:
                    raise _build_oserror_exc(path, err)
