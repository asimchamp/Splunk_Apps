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
from traceback import format_exc
from subprocess import Popen, PIPE
from splunk_ta_jmx_utility import ibm_java_args_generator, server_extractor_from_xml, input_extractor_from_xml
from solnlib import utils

import java_const
import splunk_ta_jmx_logger_helper as log_helper


LOGGER = log_helper.setup_logging(log_name="ibm_was_jmx")


def usage():
    print("usage: %s [--scheme|--validate-arguments]")
    sys.exit(2)


def loadXML():
    xml_str = sys.stdin.read()
    sys.argv.append(xml_str)
    return xml_str


def setup_signal_handler(process, input_name):
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

        java_const.IBM_WAS_JAVA_MAIN_ARGS.extend(sys.argv[1:])
        try:
            process = Popen(  # nosemgrep false-positive : The value IBM_WAS_JAVA_MAIN_ARGS is a static value which comes from the java_const.py file. It doesn't take any external/user inputs.
                java_const.IBM_WAS_JAVA_MAIN_ARGS
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
        ibm_was_args = java_const.IBM_WAS_JAVA_MAIN_ARGS
        server_name = server_extractor_from_xml(xml_str, LOGGER)
        input_name = input_extractor_from_xml(xml_str, LOGGER)
        if server_name:
            ibm_was_args = ibm_java_args_generator(ibm_was_args, server_name, LOGGER)
        else:
            ibm_was_args = []

        try:
            if ibm_was_args:
                process = Popen(ibm_was_args, stdin=PIPE, stderr=PIPE, text=True) # nosemgrep false-positive : The value ibm_was_args is a static value which comes from the java_const.py file. It doesn't take any external/user inputs.
                LOGGER.info("Invoking modular input with Python process id {} and Java process id {} for stanza {}".format(str(os.getpid()), str(process.pid), input_name))
            else:
                LOGGER.error(
                    "Failed to connect with the JMX server. Properties files not found."
                )
                raise FileNotFoundError(
                    "The files soap.client.props and ssl.client.props "
                    "not found at {}/etc/apps/Splunk_TA_jmx/local/config/{}"
                    "/.".format(os.environ["SPLUNK_HOME"], server_name)
                )
        except:
            LOGGER.error("Failed to invoke the input for stanza {}. Reason: {}".format(input_name, format_exc()))
        else:
            setup_signal_handler(process, input_name)
            pid = dict()
            pid['python_pid'] = str(os.getpid())
            pid['java_pid'] = str(process.pid)
            process.stdin.write((xml_str.decode().replace('\n', '').replace('\r', '') + '\n' + str(pid) + '\n'))
            process.stdin.flush()
            # Write Java std errors to Splunkd
            while True:
                output = process.stderr.readline()
                if output == '' and process.poll() is not None:
                    LOGGER.info("Exiting modular input with Python process id {} and Java process id {} for stanza {}".format(str(os.getpid()), str(process.pid), input_name))
                    break
                if output != '\n':
                    try:
                        sys.stderr.write(output)
                        sys.stderr.flush()
                    except:
                        LOGGER.error("Failed to write stderr to Splunk. Reason: {}".format(format_exc()))
                        break
