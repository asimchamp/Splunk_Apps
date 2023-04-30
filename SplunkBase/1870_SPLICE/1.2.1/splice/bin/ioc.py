import re
import sys
import time
import os, os.path
import pymongo

from splice.ioc      import IOC
from splice.config   import Config
from splice.database import DB
import splice.common as splcom

from splunklib.modularinput import *

class IOCModularInput(Script):

    def get_scheme(self):
	"""
	Return the expected XML by Splunk Enterprise when it starts.

	"""
	scheme = Scheme("IOC - Mount point monitor")
	scheme.description = "Monitor a directory or a mount point for incoming IOCs (STIX, CybOX, OpenIOC)"

	# If single instance mode is enabled, each stanza defined in the script is run in the same instance. 
	# Otherwise, Splunk Enterprise launches a separate instance for each stanza.
	scheme.use_external_validation = True
	scheme.use_single_instance = False

	# Only available data types : 
	# data_type_boolean / data_type_boolean / data_type_number

	ingest_directory = Argument("ingest_directory")
	ingest_directory.data_type = Argument.data_type_string
	ingest_directory.description = "Directory to monitor for incoming IOCs"
	ingest_directory.required_on_create = True
	scheme.add_argument(ingest_directory)
	
	recursive = Argument("recursive")
	recursive.data_type = Argument.data_type_boolean
	recursive.description = "Specify if the ingest directory will be scanned recursively for IOCs."
	recursive.required_on_create = True
	scheme.add_argument(recursive)

	ioc_type = Argument("ioc_type")
	ioc_type.data_type = Argument.data_type_string
	ioc_type.description = "Type of IOC in the ingest directory (auto|stix|cybox|openioc)."
	ioc_type.required_on_create = True
	scheme.add_argument(ioc_type)

	return scheme


    def validate_input(self, validation_definition):
        """
	Validates input.
	"""
	#TODO: check that the directory is valid and accessible for reading.
	#TODO: check the ioc_type is in ['auto','cybox','openioc', 'stix']

    def list_files(self, path, regex_filter=None, recurse=False, regex_flag=re.IGNORECASE):
	"""
	Return the list of files contained in path.
	Return also files in sub directories if recurse is set to True.
	Ignore case by default.
	"""
	files_list = []
	if recurse :
		for root, dirs, files in os.walk(path):
			for f in files:
				files_list.append( os.path.join(root, f) )
	else:
		for f in os.listdir(path):
			files_list.append( os.path.join(path, f) )
	
	# remove files that do not match the regex, if set.
	reg_t = re.compile('.', regex_flag)
	if regex_filter != None :
		try:
		    reg_t = re.compile(regex_filter, regex_flag)
		except Exception, e:
		    raise e

	# keep only files
	new_list = []
	for f in files_list:
		if( os.path.isfile(f) and reg_t.search(f) ):
			new_list.append(f)

	# for each file, keep it's size and last content modification time
	ret = {}
	for f in new_list:
		st = os.stat(f)
		ret[ f ] = {'size': st.st_size, 'mtime': st.st_mtime}
	return ret
	# eof list_files()

    def get_checkpoint_path(self, checkpoint_dir, stanza_name_printable, ingest_dir, ioc_path):
	"""
	checkpoint_dir/alnum(stanza)_alnum(ioc_file)
	"""
	ioc_file_name = ioc_path[ len(ingest_dir)+1 : ] # 'sub/dir/pouet.ioc'	
	ioc_file_name_printable = splcom.get_printable_name(ioc_file_name) # 'sub_dir_pouet_ioc'

	chkpt_file_name = stanza_name_printable + '_' + ioc_file_name_printable
	chkpt_file_path = os.path.join( checkpoint_dir, chkpt_file_name)

	return chkpt_file_path


    def create_checkpoint(self, chkpt_file_path, ioc_path_stat): 
	"""
	return True in case of success, false otherwise.
	"""
	try:
		f_chkpt = open(chkpt_file_path, "w")
		f_chkpt.write("%s:%s\n" % (int(ioc_path_stat['size']), int(ioc_path_stat['mtime'])))
		f_chkpt.close()
	except:
		return False
	return True

    def load_checkpoint(self, chkpt_file_path): 
	f_size  = 0
	f_mtime = 0
	chkpt_exists = False

	try:
		f_chkpt = open(chkpt_file_path, "r")
		chkpt_exists = True
		line = f_chkpt.read()
		f_chkpt.close()

		(f_size,f_mtime) = line.split(':')
		f_size = int(f_size)
		f_mtime = int(f_mtime)
	except:
		pass
	return (chkpt_exists,f_size,f_mtime)

    def stream_events(self, inputs, ew):
        # Splunk Enterprise calls the modular input, 
        # streams XML describing the inputs to stdin,
        # and waits for XML on stdout describing events.

	# ~/modinputs/ioc/alnum(stanza)_alnum(file)
	# handle IOCs modification by looking at IOCs size and modification time.

	# inputs.inputs = {
	#  'ioc://testioc': 
	#          {'host': 'splunkd', 'ingest_directory': '/var/iocs', 'index': 'default', 'ioc_type': 'auto', 'interval': '5'}
	# }
	# inputs.metadata = {
	# 	'server_uri': 'https://127.0.0.1:8089', 'server_host': 'splunkd', 'session_key': 'UuY...', 
	# 	'checkpoint_dir': '/opt/splunk/var/lib/splunk/modinputs/ioc'
	# }

	splice_conf    = Config()
	checkpoint_dir = inputs.metadata['checkpoint_dir']

	for input_name, input_item in inputs.inputs.iteritems():
		input_name_printable = splcom.get_printable_name(input_name)
		db_connection_uri    = splice_conf.get_mongo_connection_uri()

		ingest_dir = input_item["ingest_directory"]
		recursive  = input_item["recursive"]
		ioc_type   = input_item["ioc_type"]

		splice_db = DB(db_connection_uri)
		splice_db.connect()

		# {'/var/iocs/pouet.ioc': {'size': 4, 'mtime': 1404943157.2729905}, ... }
		iocs_files = self.list_files(ingest_dir, regex_filter="\.(ioc|xml)$", recurse=recursive)

		for ioc_path in iocs_files:
			ioc = IOC(type=ioc_type, path=ioc_path, path_size=iocs_files[ ioc_path ]['size'], path_mtime=iocs_files[ ioc_path ]['mtime'], stanza_name=input_name)
			ioc_path_stat = iocs_files[ ioc_path ]
		
			# load the checkpoint
			chkpt_file_path = self.get_checkpoint_path(checkpoint_dir, input_name_printable, ingest_dir, ioc_path)
			(c_exists, f_size, f_mtime) = self.load_checkpoint(chkpt_file_path)

			event_type = None 
			state = None

			# based on the checkpoints load, what should we do with this ioc ?
			if c_exists == False :
				event_type = "new ioc detected"
			
				res = splice_db.store_ioc(ioc)

				if res :
					state = "ioc successfully stored"
					res = self.create_checkpoint(chkpt_file_path, ioc_path_stat)

					if res == False :
						state = "ioc successfully stored but failed to create the checkpoint"
				else:
					state = "failed to store the ioc"
			else:
			# IOC already known, but did it changed ?
				if (f_size != ioc_path_stat['size']) or (f_mtime != int(ioc_path_stat['mtime'])) :
					event_type = "modified ioc detected"

					state = "new modification time (is:%s, was:%s)" % (ioc_path_stat['mtime'], f_mtime) 
					if f_size != ioc_path_stat['size'] :
						state = "new size (is:%s, was:%s)" % (ioc_path_stat['size'], f_size)
					
					res = splice_db.store_ioc(ioc) #, True)
					if res :
						res = self.create_checkpoint(chkpt_file_path, ioc_path_stat)
						if res == False :
							state = "ioc successfully stored but failed to create the checkpoint"
					else:
						state = "failed to store the ioc"

			# output a nice log event 
			if event_type != None :
				event = Event()
				event.stanza = input_name
				data = 'event_type="%s" '% event_type
				data += 'ioc_file="%s" ' % ioc_path
				data += 'mtime="%s" '    % ioc_path_stat['mtime']
				data += 'size="%s" '     % ioc_path_stat['size']
				data += 'status="%s" '   % state
				data += 'stanza="%s" '   % input_name
				event.data = data

				ew.log("INFO", data)
				ew.write_event(event)

	# NOTE:
	# If the ioc and the taxii modular inputs run at the very same time, they both will have the same events to
	# parse. However, when they will insert them in the atomic_indicator collection, the upsert logic is used,
	# so we should be fine (meaning: no duplicate events based on their id).
	splice_db.parse_iocs() 

	# eof stream_events() / run()

if __name__ == "__main__":
	sys.exit(IOCModularInput().run(sys.argv))

