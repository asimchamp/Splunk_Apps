#!/usr/bin/env python
import re
import sys

from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
from splunklib.searchcommands import dispatch, StreamingCommand, Configuration, Option, validators

@Configuration()

class MuRoCommand(StreamingCommand):
    """
    ...search...| muro file="<FILE>" [ignorecase="True|False"] [merge="True|False"] <FIELDS>
    """

    file       = Option(name='file', require=True)
    ignorecase = Option(name='ignorecase', require=False, default=False, validate=validators.Boolean())
    merge      = Option(name='merge', require=False, default=False, validate=validators.Boolean())


    def stream(self, events):

	# ignore script name, __EXECUTE__ and file=X, ignorecase is optional
	# order is guarantee by Option()
	fields = sys.argv[3:]
	if len(fields) == 0 :
		raise ValueError('command called with an invalid syntax')

	fv = []
	for f in fields:
		if not re.search('^[a-z]+=', f) :
			fv.append( f )
	fields = fv

	re_flags = 0
	if self.ignorecase :
		re_flags = re.IGNORECASE

	# load the regexps
	regexps = {}
	reg_id = 1

	try:
		# obviously we can pass ../../ 
		regex_file = make_splunkhome_path(['etc', 'apps', 'muro', 'local', self.file])

		f = open(regex_file, "rb")
		line = f.readline()
		while line:
			line = line.strip()
			if line == "":
				line = f.readline()
				continue
			try:
				rc = re.compile(line, flags=re_flags)
				regexps[ reg_id ] = {'regex':line, 'reg_t':rc}
				reg_id += 1
			except:
				pass
			line = f.readline()
		f.close()		
	except Exception, e:
		raise e

	if self.merge :
		# compile one 'giant' regex with the OR operator.
		tmp = []
		for (id, regexp) in regexps.iteritems():
			tmp.append(regexp['regex'])
		regstr = '|'.join(tmp)
		reg_t  = re.compile(regstr, flags=re_flags)

		for event in events:

			matches = []
			for f in fields:
				if not f in event :
					continue

				if reg_t.search( event[f] ) :
					matches.append( '%s:-1' % f )

			if len(matches) == 0 :
				event['muro'] = 'no matches'
			else:
				event['muro'] = ','.join(matches)

			yield event
	else:
		for event in events:

			matches = []
			for f in fields:
				if not f in event :
					continue

				for (id, regexp) in regexps.iteritems():
					if regexp['reg_t'].search( event[f] ) :
						matches.append( '%s:%s' % (f,id) )

			if len(matches) == 0 :
				event['muro'] = 'no matches'
			else:
				event['muro'] = ','.join(matches)

			yield event

dispatch(MuRoCommand, sys.argv, sys.stdin, sys.stdout, __name__)

