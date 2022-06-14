#All rights reserved
import sys,os,csv,getopt
import json
import re
from datetime import datetime
import splunk.entity as entity
import splunk.rest as rest
import logging
import xml.sax.saxutils as xss

logger = logging.getLogger()
logger.addHandler(logging.StreamHandler())
logger.setLevel("ERROR")
APP_DIR_PATH = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
APP_NAME = __file__.split(os.sep)[-3]

try:
    utils_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'utils')

    sys.path.extend([utils_path])

    from nxapi_utils import NXAPITransport
except Exception as e:
    logger.error("Nexus Error: Error importing the required module: %s",str(e))
    raise

""" global variables """
cmdFile=''
command=''
dev_ip=''
device=''
proxy_scheme=''

""" Display data in JSON format"""
def _display_data(device,component,jsonElement):
    json_row = json.dumps(jsonElement,ensure_ascii=False)
    row_string = json.loads(json_row)
    if type(row_string) is dict:
        for key,value in list(row_string.items()):
            if value != None and type(value) not in [dict,list,tuple]:
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                    row_string[key] = value
    currentTime= datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
    response = {"timestamp":currentTime,"component":component,"device":device,"Row_info":row_string}
    print(json.dumps(response,ensure_ascii=False))
    return 1

""" Split JSON response"""
def _split_json(device,component,jsonData,tableName,rowName):
    if tableName in jsonData:
        single_row = jsonData[tableName][rowName]
        if type(single_row) is list:
            for element in single_row:
                _display_data(device,component,element)
        elif type(single_row) is dict:
            _display_data(device,component,single_row)
    return 1

""" execute CLI"""
def  _execute_command(command,device,component='N/A'):
    cmd_out = None
    cmd_json = None
    try:
        cmd_out= NXAPITransport.clid(command)
    except Exception as e:
        logger.error("Nexus Error: Not able to Execute command through NXAPI: %s, DEVICE IP: %s, COMMAND: %s",str(e),str(device),str(command))
        pass
    if cmd_out != None:
        cmd_json=json.loads(cmd_out)
    if cmd_json !=  None:
        dataKeys=list(cmd_json.keys())
        rowKeyVal = [] 
        for i in range(len(dataKeys)):
            if not "TABLE" in dataKeys[i]:
                check_type = cmd_json[dataKeys[i]] 
                if type(check_type) is dict:
                    internal_single_row = cmd_json[dataKeys[i]]#single_row  has inside raw data in k:v pair
                    internalDataKeys = list(internal_single_row.keys())
                    internalTableNames=[]
                    internalRowNames=[]
            
                    for table in internalDataKeys:
                        if not "TABLE" in table:
                            internal_value = internal_single_row[table]
                            if type(internal_value) is dict:
                                currentTime= datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
                                response = {"timestamp":currentTime,"component":component,"device":device,"Row_info":internal_single_row[table]}
                                print(json.dumps(response,ensure_ascii=False))
                            else:
                                currentTime= datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
                                internal_key_value = {table:internal_value}
                                response = {"timestamp":currentTime,"component":component,"device":device,"Row_info":internal_key_value}
                                print(json.dumps(response,ensure_ascii=False))
                     
                        if "TABLE" in table:
                            internalTableNames.append(table)
                            row=table.replace("TABLE","ROW")
                            internalRowNames.append(row)
                    for i in range(len(internalTableNames)):
                        _split_json(device,component,internal_single_row,internalTableNames[i],internalRowNames[i])  
        
                else:
                    value=cmd_json[dataKeys[i]]
                    key_value = {dataKeys[i]:value}
                    rowKeyVal.append(key_value)

        if rowKeyVal:
            _display_data(device,component,rowKeyVal) 
        tableNames=[]
        rowNames=[]
        for table in dataKeys:
            if "TABLE" in table:
                tableNames.append(table)
                row=table.replace("TABLE","ROW")
                rowNames.append(row)
  
        for i in range(len(tableNames)):
            _split_json(device,component,cmd_json,tableNames[i],rowNames[i]) 
    
def _getCredentials(sessionKey):
   try:
      # list all credentials
      entities = entity.getEntities(['admin', 'passwords'], namespace=APP_NAME,
                                    owner='nobody', sessionKey=sessionKey)
   except Exception as e:
      logger.error("Nexus Error: Could not get %s credentials from splunk. Error: %s"
                      % (APP_NAME, str(e)))

   # return first set of credentials
   device_credentials = dict()
   for i, c in list(entities.items()):
       if (str(c['eai:acl']['app'])) == APP_NAME:
           device = xss.unescape(str(i.split(':')[0]).strip())
           username = xss.unescape(c['username'])
           password = c['clear_password']
           credential = []
           credential = [username,password]
           device_credentials[device] = list(credential)
   return device_credentials
  
""" prepare execution """         
def _prepare_and_execute(sessionKey):
    global command,cmdFile, proxy_scheme
    device_credentials = _getCredentials(sessionKey)
    for device in list(device_credentials.keys()):
         username = device_credentials[device][0]
         password = device_credentials[device][1]
         target_url = proxy_scheme+"://"+ str(device)+"/ins"
         try:
             NXAPITransport.init(target_url=target_url, username=username, password=password, timeout=600)
         except Exception as e:
             logger.error("Nexus Error: Not able to connect to NXAPI: %s, DEVICE IP: %s",str(e),str(device))
             continue
         if cmdFile:
             cmdFile = os.path.join(os.path.dirname(os.path.realpath(__file__)),cmdFile)
             file = open(cmdFile, 'r')
             cmdList = file.readlines()
             for cmdIn in cmdList:
                 cmdIn=cmdIn.strip()
                 (cmdIn,component)=cmdIn.split(',')
                 cmdIn=cmdIn.strip()
                 _execute_command(command=cmdIn,device=device,component=component)
         elif command:
                 _execute_command(command=command,device=device)

def get_proxy_scheme(sessionKey):
    """
    Function reads HTTP_SCHEME configured in local/cisco_nexus_setup.conf OR default/cisco_nexus_setup.conf
    by using splunk rest endpoint
    return: http_scheme
    """
    _, res = rest.simpleRequest("/servicesNS/nobody/" + APP_NAME + "/configs/conf-cisco_nexus_setup/SCHEME",
                                                                                sessionKey = sessionKey,
                                                                                method = 'GET',
                                                                                getargs={"output_mode": "json"},
                                                                                raiseAllErrors=True)
    res_json = json.loads(res)
    scheme = res_json.get("entry", [{}])[0].get("content", {}).get("HTTP_SCHEME")
    return scheme

""" main method """    
def main(argv):
    try:
        global proxy_scheme
        sessionKey = sys.stdin.readline().strip()
        if len(sessionKey) == 0:
            logger.error("Nexus Error: Did not receive a session key from splunkd.")
            sys.exit()
        proxy_scheme = get_proxy_scheme(sessionKey)
    except Exception as e:
        logger.error("Nexus Error: Unable to read proxy scheme from cisco_nexus_setup.conf. Error: {0}".format( e))
        logger.error("Nexus Error: Defaulting to https.")
        proxy_scheme = 'https'
    length_of_argv = len(argv)
    if _validate_argumnets(argv):
        _parse_command_line_arguments(argv, length_of_argv, sessionKey)
        _execute(argv,length_of_argv, sessionKey)
        
""" Validate command line arguments """
def _validate_argumnets(argv):
    for a in argv:
        if not a:
            logger.error("Nexus Error: Empty argument found. Please provide appropriate command line arguments.")
            return False
    return True

""" Parse command line arguments"""
def _parse_command_line_arguments(argv,length_of_argv, sessionKey):
    global cmdFile,command,dev_ip,inputcsv
    if length_of_argv > 1:
        try:
            if length_of_argv == 2:
                if argv[0] == "-inputFile":
                    cmdFile = argv[1]
                elif argv[0] == "-cmd":
                    command = argv[1]
            elif length_of_argv > 2:
                if argv[0] == "-cmd":
                    command = argv[1]
                if argv[2] == "-device":
                    dev_ip = argv[3]
        except Exception as e:
            logger.error("Nexus Error: Please enter valid arguments. %s",str(e))
            raise
    else:
        logger.error("Nexus Error: Unrecognized command line arguments")
        sys.exit()

    
""" execute method has following user input category:
    a) devices b) cmdFile c) command
"""
def _execute(argv,length_of_argv, sessionKey):
    global dev_ip,credential_file,command,device,inputcsv,cmdFile, proxy_scheme
    if length_of_argv > 2:
        """ Will execute if user input is device(s)"""
        if dev_ip:
            dev_ip_arr = dev_ip.split(",")
            device_credentials = _getCredentials(sessionKey)
            for device in list(device_credentials.keys()):
                for ip in dev_ip_arr:
                    if ip == device:
                        username = device_credentials[device][0]
                        password = device_credentials[device][1]
                        target_url = proxy_scheme+"://"+str(device)+"/ins"
                        try:
                            NXAPITransport.init(target_url=target_url, username=username, password=password, timeout=600)
                        except Exception as e:
                            logger.error("Not able to connect to NXAPI: %s, DEVICE IP: %s",str(e),str(ip))
                            pass
                        _execute_command(command=command,device=ip)
        else:
            _prepare_and_execute(sessionKey)    
    else:
        """ Will execute if user input is cmdFile  """ 
        """ Will execute if user input is command """
        _prepare_and_execute(sessionKey)
         
            
if __name__ == "__main__":
   main(sys.argv[1:])
