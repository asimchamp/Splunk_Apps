"""
Copyright (C) 2005-2015 Splunk Inc. All Rights Reserved.
"""

import datetime
import os
import os.path as op
import urllib

def handle_tear_down_signals(callback):
    import signal

    signal.signal(signal.SIGTERM, callback)
    signal.signal(signal.SIGINT, callback)

    if os.name == "nt":
        signal.signal(signal.SIGBREAK, callback)


def datetime_to_seconds(dt):
    epoch_time = datetime.datetime.utcfromtimestamp(0)
    return (dt - epoch_time).total_seconds()


def is_true(val):
    value = str(val).strip().upper()
    if value in ("1", "TRUE", "T", "Y", "YES"):
        return True
    return False


def is_false(val):
    return not is_true(val)

def remove_http_proxy_env_vars():
    for k in ("http_proxy", "https_proxy"):
        if k in os.environ:
            del os.environ[k]
        elif k.upper() in os.environ:
            del os.environ[k.upper()]

def get_appname_from_path(absolute_path):
    absolute_path = op.normpath(absolute_path)
    parts = absolute_path.split(os.path.sep)
    parts.reverse()
    for key in ("apps", "slave-apps", "master-apps"):
        try:
            idx = parts.index(key)
        except ValueError:
            continue
        else:
            try:
                if parts[idx + 1] == "etc":
                    return parts[idx - 1]
            except IndexError:
                pass
            continue
    return None

def format_stanza_name(name):
    return urllib.quote(name.encode("utf-8"), "")