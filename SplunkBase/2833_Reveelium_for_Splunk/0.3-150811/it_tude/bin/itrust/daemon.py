
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2013 by ITrust
#
# From original Daemon class by Sander Marechal
# http://www.jejik.com/articles/2007/02/a_simple_unix_linux_daemon_in_python/

"""Daemon class to run your program in background.

Daemon class is designed to be overriden by your own daemon class:

class MyDaemon(Daemon):

    def run(self):
        # Do stuffs in here
        ...

"""

import atexit
import grp
import os
import pwd
import stat
import sys
import time
from signal import SIGTERM


class Daemon:
    """A generic daemon class.

    Create the directory containing pidfile if required.
    Can change the daemon process user and group to restrict privileges.
    The process dir is set to the user home dir.

    Usage: subclass the Daemon class and override the run() method
    """

    def __init__(self, pidfile, stdin=os.devnull, stdout=os.devnull,
                 stderr=os.devnull, user=None, group=None, umask=0o007):
        """user and group are used to restrict privileges of the daemon
        process. If user and group are set, ensure that the directory
        containing pidfile is writable for user and/or group. If directory does
        not exist, it will be created writable for user and group.
        """
        self.stdin = stdin
        self.stdout = stdout
        self.stderr = stderr
        self.pidfile = os.path.abspath(pidfile)
        self.user = user
        self.group = group
        self.umask = umask

    def fork(self, name="fork"):
        """Fork the process then return the pid. name is a fork identifier used
        in the message in case of error.
        """
        try:
            pid = os.fork()
        except OSError as e:
            msg = "{0!s} failed: {1!d} ({2!s})\n"
            sys.stderr.write(msg.format(name, e.errno, e.strerror))
            sys.exit(1)
        #else
        return pid

    @classmethod
    def getpw(self, user):
        """Return the password database entry for the given user name or user
        ID.
        """
        if type(user) is int:
            method = pwd.getpwuid
        else:
            method = pwd.getpwnam
        return method(user)

    @classmethod
    def getgr(self, group):
        """Return the group database entry for the given group name or group
        ID.
        """
        if type(group) is int:
            method = grp.getgrgid
        else:
            method = grp.getgrnam
        return method(group)

    def daemonize(self):
        """Do the UNIX double-fork magic, see Stevens' "Advanced
        Programming in the UNIX Environment" for details (ISBN 0201563177).
        http://www.erlenstar.demon.co.uk/unix/faq_2.html#SEC16
        """
        pid = self.fork("first fork")
        if pid > 0:
            sys.exit(0)
        #else

        p_uid = os.getuid()
        p_gid = os.getgid()

        if self.user is not None:
            (name, tmp, uid, gid, gecos, home, sh) = self.getpw(self.user)
        else:
            (name, tmp, uid, tmp, gecos, home, sh) = pwd.getpwuid(p_uid)
            gid = p_gid

        if self.group is not None:
            (gr_name, tmp, gid, members) = self.getgr(self.group)
        else:
            (gr_name, tmp, gid, members) = grp.getgrgid(gid)

        directory = os.path.dirname(self.pidfile)
        if not os.path.exists(directory):
            os.makedirs(directory)
            os.chown(directory, uid, gid)
            os.chmod(directory,
                     stat.S_IRWXU | stat.S_IRWXG | stat.S_IROTH | stat.S_IXOTH)

        # decouple from parent environment
        os.setsid()
        if gid != p_gid:
            os.setgid(gid)
        if uid != p_uid:
            os.setuid(uid)
        if home:
            try:
                os.chdir(home)
            except OSError:
                pass
        os.umask(self.umask)

        pid = self.fork("second fork")
        if pid > 0:
            sys.exit(0)
        #else

        # redirect standard file descriptors
        sys.stdin.flush()
        sys.stdout.flush()
        sys.stderr.flush()
        si = os.open(self.stdin, os.O_RDONLY)
        so = os.open(self.stdout, os.O_APPEND)
        se = os.open(self.stderr, os.O_APPEND)
        os.dup2(si, sys.stdin.fileno())
        os.dup2(so, sys.stdout.fileno())
        os.dup2(se, sys.stderr.fileno())
        os.close(si)
        os.close(so)
        os.close(se)

        # write pidfile
        atexit.register(self.delpid)
        pid = os.getpid()
        open(self.pidfile, "w+").write("{0!s}\n".format(pid))

    def delpid(self):
        """Delete the pid file.
        """
        os.remove(self.pidfile)

    def readpid(self):
        """Try to read the pid file. Return the pid in case of success or None
        otherwise.
        """
        try:
            pf = open(self.pidfile, "r")
            pid = int(pf.read().strip())
            pf.close()
        except IOError:
            return None
        #else
        return pid

    def start(self):
        """Start the daemon and create the pidfile.
        """
        pid = self.readpid()

        if pid:
            message = "pidfile %s already exist. Daemon already running?\n"
            sys.stderr.write(message % self.pidfile)
            sys.exit(1)

        # Start the daemon
        self.daemonize()
        self.run()

    def stop(self):
        """Stop the daemon, if pid file exists, then delete the pid file.
        """
        pid = self.readpid()

        if not pid:
            message = "pidfile %s does not exist. Daemon not running?\n"
            sys.stderr.write(message % self.pidfile)
            return  # not an error in a restart

        # Try killing the daemon process
        try:
            while 1:
                os.kill(pid, SIGTERM)
                time.sleep(0.1)
        except OSError as err:
            err = str(err)
            if err.find("No such process") > 0:
                if os.path.exists(self.pidfile):
                    os.remove(self.pidfile)
            else:
                sys.stderr.write(str(err))
                sys.exit(1)

    def restart(self):
        """Stop then re-start the daemon.
        """
        self.stop()
        self.start()

    def running(self):
        """True if pid file exists, false otherwise.
        """
        if self.readpid() is None:
            return False
        #else
        return True

    def run(self):
        """You should override this method when you subclass Daemon. It will be
        called after the process has been daemonized by start() or restart().
        """
