#!/usr/bin/env python
"""Splunk App for Campfire"""

__author__ = 'Greg Albrecht <gba@splunk.com>'
__copyright__ = 'Copyright 2012 Splunk, Inc. & 2009-2012 Lawrence Oluyede'
__license__ = 'BSD 3-Clause'


import ConfigParser
import csv
import httplib2
import gzip
try:
    import json
except ImportError:
    import simplejson as json
import sys
import time
import traceback
import urlparse
import os


TIME_FORMAT = '%b %d %H:%M:%S'


class CampfireError(StandardError):
    """General Exception for Campfire Errors."""
    pass


class HTTPConnector(object):
    """Makes the actual connection to the server and handles the response"""

    def __init__(self, subdomain, token, user_agent=''):
        self.user_agent = user_agent
        self.uri = urlparse.urlparse("https://%s.campfirenow.com" % subdomain)
        # Splunk 4.3 work-around: http://splunk-base.splunk.com/answers/38496
        self._http = httplib2.Http(
            timeout=5, disable_ssl_certificate_validation=True)
        self._http.force_exception_to_status_code = True
        self._http.add_credentials(token, 'X')
        self.response = None

    def get(self, path='', data=None, headers=None, parse_body=True):
        """HTTP GET Handler."""
        return self._request(
            'GET', path, data, headers, parse_body=parse_body)

    def post(self, path, data=None, headers=None):
        """HTTP POST Handler."""
        return self._request('POST', path, data, headers)

    def _uri_for(self, path=''):
        return '/'.join([urlparse.urlunparse(self.uri), path])

    def _request(self, method, path, data=None, additional_headers=None,
            parse_body=True):
        additional_headers = additional_headers or dict()
        data = data or dict()

        headers = {}
        headers['user-agent'] = self.user_agent

        data = json.dumps(data)
        headers['content-type'] = 'application/json'

        headers['content-length'] = str(len(data))
        headers.update(additional_headers)

        if method in ('GET', 'POST'):
            location = self._uri_for(path)
        else:
            raise CampfireError(
                'Unsupported HTTP method: %s' % method)

        self.response, body = self._http.request(
            location, method, data, headers)

        if self.response.status == 401:
            raise CampfireError(
                "You are not authorized to access the resource: '%s'" % path)
        elif self.response.status == 404:
            raise CampfireError(
                "The resource you are looking for does not exist (%s)" % path)

        if parse_body:
            try:
                return json.loads(body)
            except ValueError, ex:
                if self.response.status not in (200, 201):
                    raise CampfireError(
                        "Something did not work fine: HTTP %s - %r - %s"
                        % (self.response.status, ex, body))
        return body


class Room(object):
    def __init__(self, campfire, room_id, data, connector):
        self._campfire = campfire
        self._connector = connector
        self.room_id = room_id
        self.data = data
        self.name = data['name']

    def _path_for_room(self, path):
        uri = '/'.join(['room', str(self.room_id)])
        if path:
            uri = '/'.join([uri, path])
        return uri

    def _post(self, path, data=None, headers=None):
        return self._connector.post(self._path_for_room(path), data, headers)

    def _send(self, message, type_='TextMessage'):
        data = {'message': {'body': message, 'type': type_}}
        return self._post('speak', data)

    def join(self):
        """Joins the Room."""
        self._post('join')

    def speak(self, message):
        """Sends a message to the room. Returns the message content."""
        return self._send(message, type_='TextMessage')['message']

    def paste(self, message):
        """Pastes a message to the room. Returns the message content."""
        return self._send(message, type_='PasteMessage')['message']


class Campfire(object):
    """Initialize a Campfire client with the given subdomain and token."""

    def __init__(self, subdomain, token, connector=HTTPConnector):
        self.subdomain = subdomain
        self._token = token
        connector = connector or HTTPConnector
        # TODO(gba) Use actual version string here, as opposed to magic #.
        self._connector = connector(
            subdomain, token, user_agent='Splunk App for Campfire/1.0.0')
        self.uri = self._connector.uri

    def rooms(self):
        """Returns the rooms available to the Campfire account"""
        return self._connector.get('rooms')['rooms']

    def find_room_by_name(self, name):
        """Finds a Campfire room with the given name.

        Returns a Room instance if found, None otherwise."""
        rooms = self.rooms()
        for room in rooms:
            if room['name'] == name:
                return Room(self, room['id'],
                    data=room, connector=self._connector)


def extract_results(results_file):
    """Extracts results data from Splunk CSV file.

    @param results_file: Path to GZIP compressed CSV file.
    @type results_file: str

    @return: results from CSV file.
    @rtype: list
    """
    results = []
    if results_file is not None and os.path.exists(results_file):
        results = csv.DictReader(gzip.open(results_file))
    return results


def extract_fields(result):
    """Extracts results from search results.

    @return: Paste-able search results.
    @rtype: list
    """
    if '_raw' in result:
        return result['_raw']
    else:
        if '_time' in result:
            result['_time'] = time.strftime(
                TIME_FORMAT, time.localtime(float(result['_time'])))
        return '\t'.join([result[k] for k in result.keys()])


def paste_results(room, results):
    """Pastes search results to room."""
    paste = '\n'.join([extract_fields(result) for result in list(results)])
    room.paste(paste)


def get_api_credentials(config_file):
    """Extracts Campfire Subdomain, Auth Token & Room Name from Splunk Config.

    @return: subdomain, auth token, room name
    @rtype: tuple
    """
    api_credentials = ()
    if config_file is not None and os.path.exists(config_file):
        config = ConfigParser.ConfigParser()
        config.read(config_file)
        api_credentials = (
            config.get('campfire_api', 'subdomain'),
            config.get('campfire_api', 'auth_token'),
            config.get('campfire_api', 'room_name')
        )
    return api_credentials


def search_command(room):
    """Invokes Campfire as a Search Command."""
    import splunk
    import splunk.Intersplunk

    try:
        results, _, _ = splunk.Intersplunk.getOrganizedResults()
        paste_results(room, results)
    # TODO(gba) Catch less general exception.
    except Exception:
        stack = traceback.format_exc()
        results = splunk.Intersplunk.generateErrorResults(
            'Error : Traceback: ' + str(stack)
        )
    finally:
        splunk.Intersplunk.outputResults(results)


def alert_command(room):
    """Invokes Campfire as a Saved-Search Alert Command."""
    room.speak(os.environ.get('SPLUNK_ARG_5'))
    results = extract_results(os.environ.get('SPLUNK_ARG_8'))
    paste_results(room, results)


def get_config_file():
    """Gets Campfire Config File location.

    @return: Path to Campfire Config File.
    @rtype: str
    """
    config_file = 'campfire.conf'
    splunk_home = os.environ.get('SPLUNK_HOME')

    if splunk_home is not None and os.path.exists(splunk_home):
        _config_file = os.path.join(
            splunk_home, 'etc', 'apps', 'splunk_app_campfire', 'local',
            'campfire.conf')
        if os.path.exists(_config_file):
            config_file = _config_file

    return config_file


def join_room():
    """Sets up Campfire API Instance.

    @return: Campfire Room Instance
    @rtype `Campfire.room`
    """
    subdomain, auth_token, room_name = get_api_credentials(get_config_file())
    campfire = Campfire(subdomain, auth_token)
    room = campfire.find_room_by_name(room_name)
    room.join()
    return room


def main():
    """Differentiates alert invocation from search invocation."""
    if 'SPLUNK_ARG_1' in os.environ:
        alert_command(join_room())
    else:
        search_command(join_room())


if __name__ == '__main__':
    sys.exit(main())
