#!/usr/bin/env python
"""Campfire Splunk Setup REST Handler."""

__author__ = 'Greg Albrecht <gba@splunk.com>'
__copyright__ = 'Copyright 2012 Splunk, Inc.'
__license__ = 'BSD 3-Clause'


import logging
import os
import shutil

import splunk.admin


class ConfigCampfireApp(splunk.admin.MConfigHandler):
    """Campfire Splunk Setup REST Handler."""

    def setup(self):
        """Sets up required configuration params for splunk_app_campfire."""
        if self.requestedAction == splunk.admin.ACTION_EDIT:
            self.supportedArgs.addOptArg('subdomain')
            self.supportedArgs.addOptArg('auth_token')
            self.supportedArgs.addOptArg('room_name')

    def handleList(self, confInfo):
        """Handles configuration params for splunk_app_campfire."""
        conf = self.readConf('campfire')
        if conf is not None:
            for stanza, settings in conf.items():
                for key, val in settings.items():
                    confInfo[stanza].append(key, val)

    def handleEdit(self, confInfo):
        """Handles editing configuration params for splunk_app_campfire."""
        if self.callerArgs.data['subdomain'][0] in [None, '']:
            self.callerArgs.data['subdomain'][0] = ''
        if self.callerArgs.data['auth_token'][0] in [None, '']:
            self.callerArgs.data['auth_token'][0] = ''
        if self.callerArgs.data['room_name'][0] in [None, '']:
            self.callerArgs.data['room_name'][0] = ''

        self.writeConf('campfire', 'campfire_api', self.callerArgs.data)
        install_campfire_py(os.environ.get('SPLUNK_HOME'))


def install_campfire_py(splunk_home):
    """Copies campfire.py to Splunk's bin/scripts directory."""
    script_src = os.path.join(
        splunk_home, 'etc', 'apps', 'splunk_app_campfire', 'bin',
        'campfire.py')
    script_dest = os.path.join(splunk_home, 'bin', 'scripts')

    logging.info(
        "Copying script_src=%s to script_dest=%s" %
        (script_src, script_dest))
    shutil.copy(script_src, script_dest)


if __name__ == '__main__':
    splunk.admin.init(ConfigCampfireApp, splunk.admin.CONTEXT_NONE)
