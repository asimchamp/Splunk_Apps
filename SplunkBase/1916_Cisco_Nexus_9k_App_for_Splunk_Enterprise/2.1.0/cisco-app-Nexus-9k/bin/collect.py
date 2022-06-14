# Copyright (C) 2013 Cisco Systems Inc.
# All rights reserved
import sys,os,csv,getopt
import json
import re
import splunk.rest as rest
from datetime import datetime
import json
import logging
import xml.sax.saxutils as xss
APP_NAME = __file__.split(os.sep)[-3]

logger = logging.getLogger()
logger.addHandler(logging.StreamHandler())
logger.setLevel("ERROR")

try:
    utils_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'utils')

    sys.path.extend([utils_path])

    from nxapi_utils import NXAPITransport

except Exception as e:
    logger.error("Nexus Error: Error importing the required module: %s",str(e))
    raise

""" global variables """
command=''
dev_ip=''
device=''
input_username = ''
input_password = ''
proxy_scheme=''

""" Display data in JSON format"""
def _display_data(device,component,jsonElement):
    json_row = json.dumps(jsonElement,ensure_ascii=False)
    row_string = json.loads(json_row)
    if type(row_string) is dict:
        for key,value in list(row_string.items()):
            if value != None and type(value) not in [list,tuple,dict]:
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                    row_string[key] = value
    currentTime= datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
    response = {"timestamp":currentTime,"component":component,"device":device,"Row_info":row_string}
    print(json.dumps(response,ensure_ascii=False))
    logger.info("Successfully executed %s cli on switch %s",command,device)
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
    try:
        cmd_out= NXAPITransport.clid(command)
    except Exception as e:
        raise Exception("Nexus Error: Not able to Execute command through NXAPI: %s : DEVICE IP: %s" %(str(e),str(device)))
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
                                logger.info("Successfully executed %s cli on switch %s",command,device)
                            else:
                                currentTime= datetime.now().strftime('%Y-%m-%d %H:%M:%S%z')
                                internal_key_value = {table:internal_value}
                                response = {"timestamp":currentTime,"component":component,"device":device,"Row_info":internal_key_value}
                                print(json.dumps(response,ensure_ascii=False))
                                logger.info("Successfully executed %s cli on switch %s",command,device)
                     
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


""" prepare execution """
def _prepare_and_execute():
    global command, proxy_scheme
    num_of_times_in_loop = 0
    num_of_times_exception_raised = 0
    exception_message = ''
    try:
        device_credentials = json.loads(sys.argv[1])
        for device in list(device_credentials.keys()):
            num_of_times_in_loop += 1
            username = device_credentials[device][0]
            password = device_credentials[device][1]
            target_url = proxy_scheme+"://"+str(device)+"/ins"
            try:
                NXAPITransport.init(target_url=target_url, username=username, password=password, timeout=600)
            except Exception as e:
                logger.error("Nexus Error: Not able to connect to NXAPI: %s DEVICE IP: %s" %(str(e),str(device)))
            try:
                _execute_command(command=command,device=device)
            except Exception as e:
                num_of_times_exception_raised += 1
                exception_message += str(e) + '\t'

        #condition holds true when all IP address are incorrect
        if num_of_times_exception_raised == num_of_times_in_loop:
            logger.error(exception_message)

    except Exception as err:
            logger.error("Nexus Error: Not able to execute command:%s",str(err))


"""
Function reads HTTP_SCHEME configured in local/cisco_nexus_setup.conf OR default/cisco_nexus_setup.conf
by using splunk rest endpoint
return: http_scheme
"""
def get_proxy_scheme(sessionKey):
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
        sessionKey = sys.argv[2]
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
        _parse_command_line_arguments(argv,length_of_argv)
        _execute(argv,length_of_argv)
        
""" Validate command line arguments """
def _validate_argumnets(argv):
    for a in argv:
        if not a:
            logger.error("Nexus Error: Empty argument found. Please provide appropriate command line arguments.")
            return False
    return True

""" Parse command line arguments"""
def _parse_command_line_arguments(argv,length_of_argv):
    global command,dev_ip,input_username,input_password
    if length_of_argv > 1:
        try:
            if length_of_argv == 2 and argv[0] == "-cmd":
                command = argv[1]
            elif length_of_argv > 2:
                if argv[0] == "-cmd":
                    command = argv[1]
                    if argv[2] == "-device":
                        dev_ip = argv[3]
                if argv[0] == '-u':
                    input_username = argv[1]
                    input_password = argv[3]
                    command = argv[5]
                    dev_ip = argv[7]

        except Exception as e:
            logger.error("Nexus Error: Please enter valid arguments.%s",str(e))
            raise
    else:
        logger.error("Nexus Error: Unrecognized command line arguments")
        sys.exit()

""" execute method has following user input category:
    a) devices b) command
"""


def _execute(argv,length_of_argv):
    global dev_ip,command,device,input_username,input_password, proxy_scheme
    num_of_times_in_loop = 0
    num_of_times_exception_raised = 0
    exception_message = ''
    if length_of_argv > 2:
        """ Will execute if user input is device(s)"""
        if dev_ip:
            dev_ip_arr = dev_ip.split(",")
            if input_username:
                for ip in dev_ip_arr:
                    num_of_times_in_loop += 1
                    target_url = proxy_scheme+"://"+str(ip)+"/ins"
                    try:
                        NXAPITransport.init(target_url=target_url, username=input_username, password=input_password, timeout=600)
                    except Exception as e:
                        logger.error("Nexus Error: Not able to connect to NXAPI: %s DEVICE IP: %s" %(str(e),str(ip)))
                    try:
                        _execute_command(command=command,device=ip)
                    except Exception as e:
                        num_of_times_exception_raised += 1
                        exception_message += str(e) + '\t'

            else:
                device_credentials = json.loads(sys.argv[1])
                test_ip_credentials = False
                for device in list(device_credentials.keys()):
                    device = xss.unescape(device)
                    for ip in dev_ip_arr:
                        if ip == device:
                            num_of_times_in_loop += 1
                            test_ip_credentials = True
                            username = device_credentials[device][0]
                            password = device_credentials[device][1]
                            target_url = proxy_scheme+"://"+str(device)+"/ins"
                            try:
                                NXAPITransport.init(target_url=target_url, username=username, password=password, timeout=600)
                            except Exception as e:
                                logger.error("Nexus Error: Not able to connect to NXAPI: %s DEVICE IP: %s" %(str(e),str(ip)))
                            try:
                                _execute_command(command=command,device=ip)
                            except Exception as e:
                                num_of_times_exception_raised += 1
                                exception_message += str(e) + '\t'

                # Will execute if user provides IP address, that is not configured from setup page
                if not test_ip_credentials:
                    logger.error("Entered IP Address is not Available.")

            # Will execute if we cannot connect to any of the IP address/s
            if num_of_times_exception_raised == num_of_times_in_loop:
                logger.error(exception_message)

    else:
        """ Will execute if user input is command """
        _prepare_and_execute()
         
if __name__ == "__main__":
    main(sys.argv[3:])