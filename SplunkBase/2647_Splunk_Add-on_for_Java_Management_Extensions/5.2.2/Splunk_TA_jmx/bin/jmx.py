#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#

"""
Wrapper Script for the JMX Modular Input

Copyright (C) 2021 Splunk, Inc.
All Rights Reserved

Because Splunk can't directly invoke Java , we use this python wrapper script that
simply proxys through to the Java program
"""

import import_declare_test
import os
import signal
import sys
from subprocess import PIPE, Popen
from traceback import format_exc

import java_const
import splunk_ta_jmx_logger_helper as log_helper
from lxml import etree
from solnlib import utils
from task_monitor import update_inputs

LOGGER = log_helper.setup_logging(log_name="jmx")


def usage():
    print("usage: %s [--scheme|--validate-arguments]")
    sys.exit(2)


def loadXML():
    xml_str = sys.stdin.read()
    sys.argv.append(xml_str)
    return xml_str


def monitor_tasks(process, token, splunkd_uri):
    import time

    while process.poll() is None:
        if update_inputs:
            update_inputs(
                java_const.CONFIG_HOME[len(java_const.SPLUNK_HOME) + 1 :],
                token,
                splunkd_uri,
            )
        time.sleep(60)


def setup_signal_handler(process):
    """
    Setup signal handlers
    """

    def _handle_exit(signum, frame):
        process.kill()

    utils.handle_teardown_signals(_handle_exit)


if __name__ == "__main__":

    if len(sys.argv) > 1:
        if sys.argv[1] == "--scheme":
            pass
        elif sys.argv[1] == "--validate-arguments":
            loadXML()
        else:
            usage()

        java_const.JAVA_MAIN_ARGS.extend(sys.argv[1:])
        try:
            process = Popen(  # nosemgrep false-positive : The value JAVA_MAIN_ARGS is a static value which comes from the java_const.py file. It doesn't take any external/user inputs.
                java_const.JAVA_MAIN_ARGS
            )
        except:
            LOGGER.warning(
                "Failed to open the invoke the input. Reason: {}".format(format_exc())
            )
        else:
            process.wait()
            sys.exit(process.returncode)
    else:
        xml_str = loadXML()
        xml_str = xml_str.encode()
        token = (
            etree.fromstring(  # nosemgrep false-positive : The 'xml_str' is the arg which is fetched from the stdin while invoking the modular input. It doesn't take any user/external inputs.
                xml_str
            )
            .find("session_key")
            .text
        )
        splunkd_uri = (
            etree.fromstring(  # nosemgrep false-positive : The 'xml_str' is the arg which is fetched from the stdin while invoking the modular input. It doesn't take any user/external inputs.
                xml_str
            )
            .find("server_uri")
            .text
        )
        try:
            process = Popen(  # nosemgrep false-positive : The value JAVA_MAIN_ARGS is a static value which comes from the java_const.py file. It doesn't take any external/user inputs.
                java_const.JAVA_MAIN_ARGS, stdin=PIPE, text=True
            )

        except:
            LOGGER.error(
                "Failed to open the invoke the input. Reason: {}".format(format_exc())
            )

        else:
            setup_signal_handler(process)

            process.stdin.write(
                xml_str.decode().replace("\n", "").replace("\r", "") + "\n"
            )
            process.stdin.flush()

            monitor_tasks(process, token, splunkd_uri)
