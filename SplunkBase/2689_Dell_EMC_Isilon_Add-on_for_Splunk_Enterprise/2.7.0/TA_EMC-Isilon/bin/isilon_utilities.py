from builtins import str
import os
import json
import isilon_logger_manager as log
import sys
from splunk.clilib import cli_common as cli
#set up logging
logger = log.setup_logging('emc_isilon')

# Write meta info        
def _write_meta_info(data, filename, file_path=None):
    path = file_path if file_path!=None else sys.path[0]
    pos_file_path = os.path.join(path, filename)
    try:
        pos_file = open(pos_file_path, "w")
        pos_file.truncate()
        data = json.dumps(data)
        pos_file.write(data)
        pos_file.close()
    except Exception as e:
        logger.error("Dell Isilon Error: Error writing call info. %s" % str(e))
        raise
    
# Read meta info
def _read_meta_info(filename, file_path=None):
    path = file_path if file_path!=None else sys.path[0]
    pos_file_path = os.path.join(path, filename)    
    file_data = {}
    try:
        if os.path.exists(pos_file_path):
            pos_file = open(pos_file_path, "r")
            file_data = pos_file.read().strip()                
            file_data = json.loads(file_data)
            pos_file.close()
            return file_data
        else:
            return -1
    except Exception as e:
        logger.error("Dell Isilon Error: Error reading last call info. %s" % str(e))
        raise

# Read isilonappsetup.conf from default directory and validate values of verify and cert_path
def validation_of_ssl_certification():
    inputarg = cli.getConfStanza('isilonappsetup', 'setupentity')
    verify = inputarg['verify']
    cert_path = inputarg['cert_path']
    if verify.lower() in ['1', 'true', 'yes', 't', 'y']:
        if cert_path and cert_path.strip()!='':
            cert_verify = cert_path.strip()
        else:
            cert_verify = ' '
        return True, cert_verify
    else:
        cert_verify = ' '
        return False, cert_verify