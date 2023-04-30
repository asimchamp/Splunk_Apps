'''
App:     Splunk for Google App Engine
Author:  Kellen Green
Version: 1.1 Beta3
Date:    9/14/2012
'''

import os
import sys
import time
from subprocess import Popen, PIPE

'''
log error and exit
'''
def exit(msg):
    try: file = open(dataPath('log'), 'a')
    except IOError: print 'An error occurred, but was unable to write to the log file'
    else: file.write(time.strftime('[%m/%d/%y %I:%M:%S]') + ' ' + str(msg) + '\n')
    finally: sys.exit() 

'''
wrapper to write to data files
'''
def getFile(file, type='w'): 
    try: file = open(dataPath(file), type)
    except IOError: exit('IOError: ' + dataPath(file))
    else: return file
 
'''
returns the path to the data files
'''    
def dataPath(file):
    return os.path.dirname(__file__) + os.sep + 'data' + os.sep + file + '.txt'  

'''
returns path to sdk directory
'''
def sdkPath(version='171'):
    return os.path.dirname(__file__) + os.sep + 'sdk-' + version + os.sep

# get application configuration
onSplunk = 1
if (onSplunk == 1):
    import splunk.entity
    
    sessionKey = sys.stdin.readline().strip()
    if len(sessionKey) == 0: exit('Unable to receive session key from splunk')   
    try:
        ent_sfgae = splunk.entity.getEntities(['sfgae', 'config'], namespace='sfgae', owner='nobody', sessionKey=sessionKey)       
        app = ent_sfgae['sfgae_entity']['app']
        version = ent_sfgae['sfgae_entity']['version']
        
        ent_store = splunk.entity.getEntities(['storage', 'passwords'], namespace='sfgae', owner='nobody', sessionKey=sessionKey)
        for key, val in ent_store.items():
            email = val['username']
            clear = val['clear_password']
            break
            
        config = {'app':app,
                  'version':version,
                  'email':email,
                  'password':clear}
    except:
        exit('Unable to gather configuration data from splunk')

else:
    config = {'app':'',
              'version':'',
              'email':'',
              'password':''}  

# create the command line call
args = []
args.append(sys.executable)                     # path to python runtime
args.append(sdkPath() + 'appcfg.py')            # path to appcfg.py  
args.append('--application=' + config['app'])   # application id
args.append('--version=' + config['version'])   # application revision number     
args.append('--email=' + config['email'])       # user email
args.append('--passin')                         # pass in the password
#args.append('--no_cookies')                     # don't store login cookies
args.append('request_logs')                     # calls the request_logs method
args.append('--num_days=1')                     # get logs from up to 1 day ago
args.append(sdkPath() + 'new_project_template') # dir to app.yaml
args.append(dataPath('return'))                 # save results to file
 
# make the call to GAE 
p = Popen(args, stdin=PIPE, stdout=PIPE, stderr=getFile('out'), shell=True)
p.communicate(input=config['password'])
if p.wait() != 0: exit('Error raised during call to AE, see out.txt for more info')
   
# read last file to get the most recent log
try: 
    last_file = open(dataPath('last'), 'r')
except IOError:
    match = 1
else:   
    last = last_file.read()
    match = 0

# read the return file to find new logs
splunk = ''
return_file = getFile('return', 'r')    
for line in return_file:
    print line
    if match == 1: 
        splunk += line
    else:
        if line == last: match = 1
    
# check if return file was empty       
try: line
except NameError: pass
else:         
    # if no match was found, grab everything
    if match == 0:
        return_file.seek(0)
        splunk = return_file.read()
    
    # write to last line to last file
    last_file = getFile('last')
    last_file.write(line)
    
    #print for splunk
    print splunk
