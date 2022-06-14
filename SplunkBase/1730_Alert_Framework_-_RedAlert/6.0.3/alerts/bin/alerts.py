##	REDALERT -- ALERT FRAMEWORK FOR SPLUNK
##
##	Author:		Ron Naken (ron@splunk.com)
##	Version:	1.0b
##
##	Copyright (c) 2014 Splunk Inc.	All rights reserved.
##

import sys, gzip, os, csv, logging, logging.handlers, string, envoy.core, time
import splunklib.client as client
import urllib, urllib2
from xml.dom import minidom

_APP_ = 'alerts'

path_app = os.path.join(os.environ['SPLUNK_HOME'], 'etc', 'apps', _APP_)
path_log = os.path.join(path_app, 'bin', _APP_ + '.log')

LOG_FORMAT = '%(asctime)s %(levelname)s [ALERTS] %(message)s'

BLANK_ALERT = {
	'alid': '',
	'disabled': 0,
	'description': '',
	'timeout': 60,
	'iters': 1,
	'command': '',
	'entitytype': 'Shell'
}

_alerts_ = {}
_service_ = None
_passwd_ = {}

def load_passwd(folder):
	global _passwd_
	keys = [ 'host', 'port', 'username', 'password', 'scheme', 'version' ]
	try:
		path_conf = os.path.join(path_app, folder, '_passwd_.conf')
		fp = open(path_conf, 'r')
		_passwd_ = {}
		for l in fp.readlines():
			l = l.strip()
			if l.startswith('#'):
				continue
			pos = l.find('=')
			key = l[:pos].strip().lower()
			val = l[pos + 1:].strip()
			if key in keys:
				_passwd_.update({ key: str(val) })
		fp.close()
	except Exception as e:
		if (folder == 'local') and (len(_passwd_) <= 0):
			logger.error('Error loading _passwd_.conf: %s' % str(e))
			sys.exit(1)

def rest_search(cmd, timeout, alid):

	global _service_

	if _passwd_ == {}:
		load_passwd('default')
		load_passwd('local')

	search = 'search ' + cmd

	if _service_ is None:
		try:
			_service_ = client.connect(**_passwd_)
		except Exception as e:
			logger.error('Cannot authenticate to Splunk.  Check your _passwd_.conf settings. << %s' % str(e))
			sys.exit(1)

	t = time.time()

	try:
		_service_.parse(search, parse_only=True)
	except Exception as e:
		logger.error('action=SEARCH, id="%s" >> %s << %s' % (alid, search, str(e)))
		sys.exit(1)

	job = _service_.jobs.create(search)
	while 1:
		progress = 0.0
		scanned = 0
		matched = 0
		results = 0
		dur = time.time() - t
		while not job.is_ready():
			if dur > timeout:
				break
		try:
			stats = {'isDone': job['isDone'],
					 'doneProgress': job['doneProgress'],
					 'scanCount': job['scanCount'],
					 'eventCount': job['eventCount'],
					 'resultCount': job['resultCount']}
			progress = float(stats['doneProgress'])*100
			scanned = int(stats['scanCount'])
			matched = int(stats['eventCount'])
			results = int(stats['resultCount'])
			if stats['isDone'] == '1':
				logger.info('action=SEARCH, id="%s", duration=%d, progress=%03.1f, events_scanned=%d, events_matched=%d, events_returned=%d >> %s' % (alid, dur, progress, scanned, matched, results, cmd))
				break
		finally:
			if dur >= timeout:
				logger.info('action=SEARCH, id="%s", duration=%d, progress=%03.1f, events_scanned=%d, events_matched=%d, events_returned=%d >> %s' % (alid, dur, progress, scanned, matched, results, cmd))
				break

		time.sleep(2)

	job.cancel()

def load_conf(folder):
	global _alerts_
	keys = [ 'alid', 'disabled', 'description', 'timeout', 'command', 'iters', 'entitytype' ]
	try:
		path_conf = os.path.join(path_app, folder, 'sa_alerts.conf')
		fp = open(path_conf, 'r')
		stanza = 'default'
		_alerts_[stanza] = {}
		_alerts_[stanza].update(BLANK_ALERT)
		for l in fp.readlines():
			l = l.strip()
			if l.startswith('['):
				stanza = l[1:-1]
				try:
					if _alerts_[stanza]:
						continue
				except:
					_alerts_[stanza] = {}
					_alerts_[stanza].update(BLANK_ALERT)
					continue
			pos = l.find('=')
			key = l[:pos].strip().lower()
			val = l[pos + 1:].strip()
			if (str(val) <> 'None') and (key in keys):
				_alerts_[stanza].update({ key: str(val) })
		fp.close()
	except Exception as e:
		if (folder == 'local') and (len(_alerts_) <= 0):
			logger.error('Error loading .conf: %s' % str(e))
			sys.exit(1)

if __name__ == "__main__":

	if len(sys.argv) > 9:
		sh = logging.StreamHandler(sys.stdout)
	else:
		sh = logging.handlers.SysLogHandler(address = ('localhost', 9020))

	logger = logging.getLogger(__name__)
	logger.setLevel(logging.INFO)
	sh.setFormatter(logging.Formatter(LOG_FORMAT))
	logger.addHandler(sh)
	logger.propagate = False

	if len(sys.argv) <= 8:
		logger.warn('Syntax error: Not enough arguments.')
		sys.exit(1)

	load_conf('default')
	load_conf('local')

	# dict of command-line arguments
	ar = {}
	c = 0
	for k in sys.argv:
		ar['_' + str(c)] = k
		c += 1

	# check search name match with alert ids
	c = 0
	for k, alert in _alerts_.items():
		if (int(alert['disabled']) == 0) and (string.find(sys.argv[4], '[' + alert['alid'] + ']') >= 0):
			fp = csv.DictReader(gzip.open(sys.argv[8], 'r'), delimiter=',', quotechar='"')
			for line in fp:
				line.update(ar)
				c += 1
				if c > int(alert['iters']):
					sys.exit(0)
				s = string.Template(alert['command'])
				cmd = s.safe_substitute(line)
				tmp = { 'timeout': int(alert['timeout']) }
				if alert['entitytype'] == 'Search':
					rest_search(cmd, int(alert['timeout']), alert['alid'])
				else:
					try:
						r = envoy.run(cmd, **tmp)
						if r.status_code == 0:
							logger.info('action=SHELL, id="%s", return_code=%d >> %s' % (alert['alid'], r.status_code, cmd))
						else:
							logger.error('action=SHELL, id="%s", return_code=%d >> %s' % (alert['alid'], r.status_code, cmd))
					except Exception as e:
						logger.error('action=SHELL, id="%s", err="%s" >> %s' % (alert['alid'], str(e), cmd))

			sys.exit(0)		# no need to scroll through the rest of the alert definitions after a match

	if c == 0:
		logger.error('No match found. Ensure a valid "[ALERT_ID]" is present in your search name. (i.e. "[ALERT_ID] MyAlert").  search_name="%s"' % sys.argv[4])

