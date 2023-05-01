#!/usr/bin/python
# -*- coding: utf-8 -*-
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Hadoop Distributed File System implementation of the FSClient.

Usage:
>>> client = HDFSClient("hdfs://vinz@10.10.0.22:54310")
>>> client.df()
{'available': 21902049280L,
 'capacity': 33429508096L,
 'corrupt_blocks': 0L,
 'filesystem': 'hdfs://10.10.0.22:54310',
 'missing_blocks': 0L,
 'remaining': 21902049280L,
 'under_replicated': 153L,
 'used': 132964352L}

>>> list(client.ls("/tmp"))
[{'atime': 1423057376.738,
  'ctime': 1423057377.54,
  'ftype': 'f',
  'group': u'supergroup',
  'mtime': 1423057377.54,
  'owner': u'hduser',
  'path': '/tmp/test.txt',
  'perms': 420,
  'size': 16L},
 {'atime': 0.0,
  'ctime': 1429888504.478,
  'ftype': 'd',
  'group': u'vinz',
  'mtime': 1429888504.478,
  'owner': u'vinz',
  'path': '/tmp/vinz',
  'perms': 511,
  'size': 0L}]

>>> list(client.ls("/tmp", directory=True))
[{'atime': 0L,
  'ctime': 1429898874.655,
  'ftype': 'd',
  'group': u'supergroup',
  'mtime': 1429898874.655,
  'owner': u'hduser',
  'path': '/tmp',
  'perms': 493}]

>>> for path_data in client.ls(["/tmp", "/blabla"], directory=True):
...     print(path_data)
{'perms': 493, 'ftype': 'd', 'group': u'supergroup', 'ctime': 1429898874.655,
 'mtime': 1429898874.655, 'owner': u'hduser', 'path': '/tmp', 'atime': 0L}
---------------------------------------------------------------------------
FSFileNotFoundError                       Traceback (most recent call last)
[...]
FSFileNotFoundError: ("`/blabla': No such file or directory",
 FileNotFoundException("`/blabla': No such file or directory",))

"""

from .common import FSClient
from .errors import *
from .localfs import _expand_paths
from snakebite import client as sbclient
from snakebite import errors as sberrors
import os
import subprocess


_SB_ERRORS = (
    sberrors.FileNotFoundException,
    sberrors.FileAlreadyExistsException,
    sberrors.DirectoryException,
    sberrors.RequestError,
    sberrors.FileException,
    sberrors.InvalidInputException,
    sberrors.OutOfNNException,
    )

_ERRORS = {
    sberrors.FileNotFoundException: FSFileNotFoundError,
    sberrors.FileAlreadyExistsException: FSInvalidOperationError,
    sberrors.DirectoryException: FSInvalidOperationError,
    #sberrors.RequestError: ,
    #sberrors.FileException: ,
    #sberrors.InvalidInputException: ,
    #sberrors.OutOfNNException: ,
    }


def _build_sberror_exc(err):
    """Automatically create exceptions when handling some snakebite errors.
    """
    if isinstance(err, sberrors.RequestError):
        if "AccessControlException" in str(err):
            return FSPermissionError("Permission denied", err)
    try:
        return _ERRORS[type(err)](err.args[0], err)
    except KeyError:
        return FSUnknownError(err.args[0], err)


def _handle_bad_result(res):
    """Automatically create the expected exceptions when the snakebite result
    is just a false result.
    """
    if "Parent directory doesn't exist" in res["error"]:
        raise sberrors.FileNotFoundException(
            "`{0}': Parent directory doesn't exist".format(res["path"]))
    #else:
    if "FileNotFoundException" in res["error"]:
        raise sberrors.FileNotFoundException(
            "`{0}': No such file or directory".format(res["path"]))


def fileinfos(ls_infos):
    """Convert the ls file infos from the format returned by hdfs.

    Return a dictionnary containing the following keys:
     * path: the file/directory path
     * ftype: 'f' for file, 'd' for directory
     * owner: the user owning the file
     * group: the group owning the file
     * perms: int
     * size: the file size
     * atime: last access timestamp
     * mtime: last modification timestamp
     * ctime: (= mtime)
    """
    return {"path": ls_infos["path"],
            "ftype": ls_infos["file_type"],
            "owner": ls_infos["owner"],
            "group": ls_infos["group"],
            "perms": ls_infos["permission"],
            "size": ls_infos["length"],
            "atime": ls_infos["access_time"] / 1000.0,
            "mtime": ls_infos["modification_time"] / 1000.0,
            "ctime": ls_infos["modification_time"] / 1000.0,
            }


def get_hadoop_home():
    for key in ("HADOOP_HOME", "HADOOP_INSTALL", "HADOOP_COMMON_HOME"):
        try:
            return os.environ[key]
        except KeyError:
            pass
    raise KeyError("Unable to guess hadoop install home from environment")


def cmd_output(args):
    """Execute the given cmd. Once the cmd is completed, return the cmd output.
    Raise a RuntimeError if the cmd return an error code.
    """
    process = subprocess.Popen(args,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    ret = process.wait()
    if ret != 0:
        raise RuntimeError(process.stderr.read())
    #else:
    return process.stdout.read()


class HDFSClient(FSClient):
    """Hadoop Distributed File System implementation of the FSClient.
    """

    SCHEME = "hdfs"

    def _config(self, scheme=None, username=None, password=None,
                hostname=None, port=None, path=None):
        if scheme != self.SCHEME:
            raise ValueError(
                "Invalid uri. Scheme must be '{0}'".format(self.SCHEME))
        #else:
        if not hostname:
            raise ValueError("Invalid uri. Host name or IP address required")
        #else:
        self.root_path = path
        hadoop_home = get_hadoop_home()
        kwargs = {
            "port": 54310,
            "hadoop_version": 9,
            "use_trash": False,
            }
        self.hadoop_env = {
            "HADOOP_HOME": hadoop_home,
            "JAVA_HOME": os.environ["JAVA_HOME"],
            }
        netloc = hostname
        if port:
            kwargs["port"] = port
            netloc = netloc + ":" + str(port)
        if username:
            kwargs["effective_user"] = username
            self.hadoop_env["HADOOP_USER_NAME"] = username
            netloc = hostname + "@" + netloc
        self._hadoop_cmd = os.path.join(hadoop_home, "bin", "hadoop")
        self._hdfs_url = "hdfs://" + netloc 
        self._sbcli = sbclient.Client(hostname, **kwargs)

    def _chgrp(self, paths, group, recursive=False):
        """Change the group of paths. paths is a list of path to chgrp.

        This implementation does not raise FSUnknownGroupError.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.chgrp(paths, group, recursive):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _chmod(self, paths, mode, recursive=False):
        """Change the mode for paths. paths is a list of path to chmod.

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.chmod(paths, mode, recursive):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _chown(self, paths, owner, recursive=False):
        """Change the owner for paths. paths is a list of path to chmod.
        owner is either user or user:group

        This implementation does not raise FSUnknownUserError.
        This implementation does not raise FSUnknownGroupError.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.chown(paths, owner, recursive):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _df(self):
        """Filesystem information (as returned by df command line utility).

        Return a dictionnary containing the following keys:
         * filesystem: the mounted filesystem
         * capacity: total filesystem size in bytes (!= used + available)
         * used: used storage space in bytes
         * available: free storage space in bytes
         * remaining: free storage space in bytes (= available)
         * corrupt_blocks:
         * missing_blocks:
         * under_replicated:
        """
        try:
            hdfs_df_data = dict(self._sbcli.df())
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)
        #else:
        hdfs_df_data["available"] = hdfs_df_data["remaining"]
        return hdfs_df_data

    def _ls(self, paths, directory=False, followlinks=False):
        """Get the fileinfo of the listed paths. If a path is a directory, list
        the files and directories inside it. Set directory to True to get the
        fileinfo of the directory itself, and not its children. followlinks is
        always ignored.

        Fileinfo is a dictionnary containing the following keys:
         * path: the file/directory path
         * ftype: 'f' for file, 'd' for directory
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
        kwargs = dict()
        if directory:
            kwargs["include_toplevel"] = True
            kwargs["include_children"] = False

        try:
            for res in self._sbcli.ls(paths, **kwargs):
                yield fileinfos(res)
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _mkdir(self, paths, parents=False, mode=509):
        """Create the directories if they do not already exist. paths is a list
        of path. If parents is True, make parent directories as needed.

        Raises FSFileNotFoundError when the first non-existing parent path is
        found and parents is False.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.mkdir(paths, parents, mode):
                if not res["result"]:
                    _handle_bad_result(res)
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _mv(self, paths, dst):
        """Rename paths to dst, or move paths to dst. paths is a list of path.
        dst is the new name or the destination directory.

        Raises FSInvalidOperationError if paths contains multiple path and dst
        is not a directory.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.rename(paths, dst):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _put(self, paths, dst, check_crc=False):
        """For remote/distributed filesystems, push a copy of the files pointed
        by paths to the remote destination. For local fs, simply create a copy
        of the files. paths is a list of path. If check_crc is True, check for
        checksum errors.

        This implementation behaves more like hadoop's copyFromLocal than
        hadoop's put.

        Return a generator that yields dictionnaries.
        """
        if list(self.ls(dst, directory=True))[0]["ftype"] != "d":
            expanded_paths = list(_expand_paths(paths))
            if len(expanded_paths) > 1:
                raise FSInvalidOperationError(
                    "Destination must be a directory", None)
        else:
            expanded_paths = _expand_paths(paths)

        put_cmd = [self._hadoop_cmd, "fs", "-copyFromLocal"]
        for path in expanded_paths:
            try:
                subprocess.check_output(
                    put_cmd + [path, self.get_url(dst)],
                    env=self.hadoop_env,
                    stderr=subprocess.STDOUT,
                    )
                yield {"path": path, "result": True}
            except subprocess.CalledProcessError as err:
                if "Permission denied" in err.output:
                    raise FSPermissionError("Permission denied", err)
                #else:
                raise FSUnknownError(err.output, err)

    def _retrieve(self, paths, dst, check_crc=False):
        """For remote/distributed filesystems, create a local copy of the files
        pointed by paths. For local fs, simply create a copy of the files.
        paths is a list of path. If check_crc is True, check for checksum
        errors.

        This implementation behaves more like hadoop's copyToLocal than
        hadoop's get.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.copyToLocal(paths, dst, check_crc):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _rm(self, paths, recursive=False):
        """Delete paths. paths is a list of path. Set recursive to True to
        recursively remove the whole tree.

        Raises FSInvalidOperationError if recursive is False and path is a dir.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.delete(paths, recursive):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _rmdir(self, paths):
        """Remove empty directories. paths is a list of path.

        Raises FSInvalidOperationError if path is a file or a non-empty dir.
        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.rmdir(paths):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)

    def _touch(self, paths):
        """Change files timestamps or create zero-length files (for
        non-existing paths). paths is a list of path.

        Raises FSFileNotFoundError when the first non-existing path is found.
        Raises FSPermissionError in case of insufficient permissions.

        Return a generator that yields dictionnaries.
        """
        try:
            for res in self._sbcli.touchz(paths):
                yield res
        except _SB_ERRORS as err:
            raise _build_sberror_exc(err)
