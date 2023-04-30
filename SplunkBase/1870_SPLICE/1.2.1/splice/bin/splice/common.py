import os 
import os.path
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path

def get_value_from_dict(dict, key, default=None):
	"""
	return the value refered by key in dict or the default value
	if it does not exists (None by default).
	"""
	if key in dict :
		return dict[ key ]
	return default

   
def get_printable_name(s):
	"""
	Just return the alphanumeric caracters of a string and 
	substitute others with underscore ('_')
	"""
	name = ""
	for i in range(len(s)):
		if s[i].isalnum():
			name += s[i]
		else:
			name += "_"
	return name


def set_envvars(path):
	"""
	replace environment variable by their values in a path
	$SPLUNK_HOME/var -> /opt/splunk/var
	"""
	items = path.split(os.sep)
	for x in xrange(0,len(items)):
		if items[x] == '$SPLUNK_HOME' :
			items[x] = make_splunkhome_path([''])
		elif items[x].startswith('$') :
			envvar     = items[x].lstrip('$')
			envvar_val = ""

			try:
				envvar_val = os.environ[envvar]
			except KeyError:
				raise "%s could not be found in os environment variables" % envvar
			items[x] = os.path.normpath(envvar_val)
	return os.sep.join(items)


