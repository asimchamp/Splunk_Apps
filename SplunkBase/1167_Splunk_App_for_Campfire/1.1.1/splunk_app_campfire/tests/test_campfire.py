#!/usr/bin/env python
# -*- coding: utf-8 -*-


import ConfigParser
import csv
import gzip
import os
import random
import shutil
import tempfile
import unittest

from .context import bin


class TestCampfire(unittest.TestCase):

    def setUp(self):
        self.subdomain = os.environ.get('CAMPFIRE_SUBDOMAIN')
        self.auth_token = os.environ.get('CAMPFIRE_AUTH_TOKEN')
        self.room_name = os.environ.get('CAMPFIRE_ROOM_NAME')
        self.config_file = tempfile.mkstemp()[1]
        self.events_file = tempfile.mkstemp()[1]
        self.rands = ''.join(
            [random.choice('unittest0123456789') for xyz in range(8)])
        self.rand_row = [self.rands, self.rands]

    def _setup_splunk_home(self):
        self.raw_config = 'default/campfire.conf'
        self.raw_campfire_py = 'bin/campfire.py'

        self.splunk_home = tempfile.mkdtemp()

        self.pd_app = os.path.join(
            self.splunk_home, 'etc', 'apps', 'campfire')
        self.pd_bin = os.path.join(self.pd_app, 'bin')
        self.pd_default = os.path.join(self.pd_app, 'default')
        self.spl_scripts = os.path.join(
            self.splunk_home, 'bin', 'scripts')

        os.makedirs(self.pd_bin)
        os.makedirs(self.pd_default)
        os.makedirs(self.spl_scripts)

        shutil.copyfile(self.raw_config, self.config_file)
        shutil.copy(self.raw_campfire_py, self.pd_bin)

    def test_speak(self):
        camp = bin.campfire.Campfire(self.subdomain, self.auth_token)
        room = camp.find_room_by_name(self.room_name)
        room.join()
        room.speak('test_speak')

    def test_paste(self):
        camp = bin.campfire.Campfire(self.subdomain, self.auth_token)
        room = camp.find_room_by_name(self.room_name)
        room.join()
        room.paste('test_paste')

    def test_bad_auth(self):
        bad_token = 'x'
        camp = bin.campfire.Campfire(self.subdomain, bad_token)
        self.assertRaises(
            bin.campfire.CampfireError, camp.find_room_by_name, self.room_name)

    def test_get_service_api_key(self):
        self._setup_splunk_home()
        config = ConfigParser.RawConfigParser()
        config.read(self.config_file)
        config.set('api', 'subdomain', self.rands)
        with open(self.config_file, 'wb') as cfg:
            config.write(cfg)
        subdomain = bin.campfire.get_api_credentials(self.config_file)[0]
        self.assertEqual(subdomain, self.rands)

    def test_extract_events(self):
        gzf = gzip.open(self.events_file, 'wb')
        writer = csv.writer(gzf)
        writer.writerow(self.rand_row)
        gzf.close()

        events = bin.campfire.extract_events(self.events_file)
        self.assertTrue(self.rand_row in events.reader)

if __name__ == '__main__':
    unittest.main()
