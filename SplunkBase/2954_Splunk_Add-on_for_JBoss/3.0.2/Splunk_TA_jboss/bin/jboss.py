#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import import_declare_test
import sys
import traceback
import os.path as op
import time


import splunktalib.common.log as log
import splunktalib.common.util as util

import jboss_consts as c
_LOGGER = log.Logs(default_level="INFO").get_logger(c.JBOSS_LOG)
from solnlib import file_monitor
from splunktalib.timer_queue import TimerQueue
from splunktalib.conf_manager.ta_conf_manager import TAConfManager

from jboss_config import create_jboss_config
from jmx_op_invoker import JMXOpInvoker


class JBoss:

    def __init__(self):
        self._account_configs = None
        self._meta = None
        self._account = None
        self._stanzas = None
        self._jmx_op_invoker = None
        self._timer_queue = None

    def start(self):
        try:
            self._timer_queue = TimerQueue()
            self._timer_queue.start()
            self._setup_signal_handler()
            self.run()
        except Exception:
            msg = "error={}".format(traceback.format_exc())
            _LOGGER.error(msg)

    def run(self):
        jboss_config = create_jboss_config()

        self._meta, self._stanzas, self._account_configs, self.log_level = jboss_config.get_configs()

        log.Logs().set_level(self.log_level)
        c.LOG_LEVEL_VALUE = self.log_level
        _LOGGER.debug("Log level is set to: {}".format(self.log_level))

        callback = self._get_file_change_handler()
        app_dir = op.dirname(op.dirname(op.abspath(__file__)))
        files_to_monitor = (
            op.join(app_dir, "default", c.JBOSS_SETTINGS_CONF_FILE),
            op.join(app_dir, "local", c.JBOSS_SETTINGS_CONF_FILE),
            op.join(app_dir, "lib", "splunktalib", "setting.conf"),
            op.join(app_dir, "default", c.JBOSS_SERVER_CONF_FILE),
            op.join(app_dir, "local", c.JBOSS_SERVER_CONF_FILE),
        )
        conf_monitor = file_monitor.FileChangesChecker(
            callback,
            files_to_monitor,
        )
        self._timer_queue.add_timer(conf_monitor.check_changes, time.time(), 10)
        self._collect_data_through_jmx_op()

    def _collect_data_through_jmx_op(self):
        meta = self._meta
        account_configs = self._account_configs
        stanzas = self._stanzas
        input_stanzas = []
        try:
            for stanza in stanzas:
                for account_config in account_configs:
                    if stanza.get('account') == account_config.get('name'):
                        stanza.update(account_config)
                        break
                input_stanzas.append(stanza)
            
            self._jmx_op_invoker = JMXOpInvoker(meta, input_stanzas)
            self._jmx_op_invoker.start()
        except Exception:
            msg = "error={}".format(
                traceback.format_exc())
            _LOGGER.error(msg)

    def _get_file_change_handler(self):

        def reload_and_exit(changed_files):
            _LOGGER.info("Reload conf %s", changed_files)
            jmx_op_invoker = self._jmx_op_invoker
            if jmx_op_invoker is not None:
                jmx_op_invoker.stop()
            timer_queue = self._timer_queue
            if timer_queue is not None:
                timer_queue.tear_down()

        return reload_and_exit

    def _setup_signal_handler(self):
        """
        Setup signal handlers
        @jmx_op_invoker: jmx_op_invoker.JMXOpInvoker instance
        @timer_queue: ta_util2.timer_queue.TimerQueue
        """

        def _handle_exit(signum, frame):
            _LOGGER.info("JBoss TA is going to exit...")
            jmx_op_invoker = self._jmx_op_invoker
            timer_queue = self._timer_queue
            if jmx_op_invoker is not None:
                jmx_op_invoker.stop()
            if timer_queue is not None:
                timer_queue.tear_down()

        util.handle_tear_down_signals(_handle_exit)

def do_scheme():
    """
    Feed splunkd the TA's scheme
    """

    print("""
    <scheme>
    <title>Splunk Add-on for JBoss</title>
    <description>Collects JBoss data</description>
    <use_external_validation>true</use_external_validation>
    <use_single_instance>true</use_single_instance>
    <streaming_mode>xml</streaming_mode>
    <endpoint>
      <args>
        <arg name="name">
          <title>JBoss data input name</title>
        </arg>
        <arg name="account">
          <title>Jboss Account</title>
        </arg>
        <arg name="object_name">
          <title>ObjectName</title>
        </arg>
        <arg name="operation_name">
          <title>OperationName</title>
        </arg>
        <arg name="params">
          <title>Parameters</title>
        </arg>
        <arg name="signature">
          <title>Signature</title>
        </arg>
        <arg name="split_array">
          <title>SplitArray</title>
        </arg>
        <arg name="duration">
          <title>Collection interval</title>
        </arg>
      </args>
    </endpoint>
    </scheme>
    """)

def usage():
    """
    Print usage of this binary
    """

    hlp = "%s --scheme|--validate-arguments|-h"
    print(hlp % sys.argv[0], file=sys.stderr)
    sys.exit(1)


def main():
    """
    Main entry point
    """

    args = sys.argv
    if len(args) > 1:
        if args[1] == "--scheme":
            do_scheme()
        elif args[1] == "--validate-arguments":
            sys.exit(0)
        elif args[1] in ("-h", "--h", "--help"):
            usage()
        else:
            usage()
    else:
        _LOGGER.info("Start JBoss TA")
        jboss = JBoss()
        jboss.start()
        _LOGGER.info("Stop JBoss TA")
    sys.exit(0)

if __name__ == "__main__":
    main()
