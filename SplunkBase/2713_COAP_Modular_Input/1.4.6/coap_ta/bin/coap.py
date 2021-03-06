'''
Wrapper Script for the COAP Modular Input


Because Splunk can't directly invoke Java , we use this python wrapper script that
simply proxys through to the Java program
'''
import os, sys, signal,time,re,threading,hashlib,logging
from subprocess import Popen
#for running on Universal Forwarders where the library is not present
try:
    import splunk.entity as entity
except:
    pass
import xml.dom.minidom

JAVA_MAIN_CLASS = 'com.splunk.modinput.coap.COAPModularInput'
MODINPUT_NAME = 'coap'
SECURE_TRANSPORT = "tls"
#SECURE_TRANSPORT = "ssl"

def get_credentials(session_key):
   myapp = 'coap_ta'
   try:
      # list all credentials
      entities = entity.getEntities(['admin', 'passwords'], namespace=myapp,
                                    owner='nobody', sessionKey=session_key)
   except Exception as e:
      return {}

   return entities.items()

#read XML configuration passed from splunkd, need to refactor to support single instance mode
def get_input_config(config_str):
    config = {}

    try:
        # parse the config XML
        doc = xml.dom.minidom.parseString(config_str)
        root = doc.documentElement
        
        session_key_node = root.getElementsByTagName("session_key")[0]
        if session_key_node and session_key_node.firstChild and session_key_node.firstChild.nodeType == session_key_node.firstChild.TEXT_NODE:
            data = session_key_node.firstChild.data
            config["session_key"] = data 
            
        if not config:
            raise Exception("Invalid configuration received from Splunk.")

        
    except Exception as e:
        raise Exception("Error getting Splunk configuration via STDIN: %s" % str(e))

    return config


def checkForRunningProcess():

    canonPath = getPIDFilePath()
    if os.path.isfile(canonPath):
      pidfile = open(canonPath, "r")
      pidfile.seek(0)
      old_pid = pidfile.readline()
      try:
        os.kill(int(old_pid),signal.SIGKILL)
      except :
        pass
      pidfile.close()  
      os.remove(canonPath)
      
def writePidFile():
    canonPath = getPIDFilePath()
    pid = str(process.pid)
    f = open(canonPath, 'w')
    f.write(pid)
    f.close()
    
def getPIDFilePath():
    return MODINPUT_HOME+MODINPUT_NAME+"_ta.pid"
    
def usage():
    print("usage: %s [--scheme|--validate-arguments]")
    sys.exit(2)

def do_run():
    xml_str = sys.stdin.read()

    config = get_input_config(xml_str)

    credentials_list = get_credentials(config.get("session_key"))

    for i, c in credentials_list:
        replace_key='{encrypted:%s}' % c['username']

        new_xml_str = xml_str.replace(replace_key,c['clear_password'])
        xml_str = new_xml_str

    sys.argv.append(xml_str)
    run_java()

def do_scheme():
    run_java()

def do_validate():
    xml_str = sys.stdin.read()
    sys.argv.append(xml_str)
    run_java()

def build_windows_classpath():
    
    rootdir = MODINPUT_HOME + "bin\\lib\\"
    classpath = ""
    for filename in os.listdir(rootdir):
      classpath = classpath + rootdir+filename+";"
    return classpath
    
def run_java():
    global process,SPLUNK_HOME,MODINPUT_HOME
    if sys.platform.startswith('linux') or sys.platform.startswith('sunos') or sys.platform.startswith('aix') or sys.platform.startswith('hp-ux') or sys.platform.startswith('freebsd')  or sys.platform == 'darwin':
        
      if ('JAVA_HOME' not in os.environ):
         JAVA_EXECUTABLE = 'java'
      else:
         JAVA_EXECUTABLE = os.path.expandvars('$JAVA_HOME') + "/bin/java"
      
      SPLUNK_HOME = os.path.expandvars('$SPLUNK_HOME')
      MODINPUT_HOME = SPLUNK_HOME + "/etc/apps/"+MODINPUT_NAME+"_ta/"
      CLASSPATH = MODINPUT_HOME + "bin/lib/*"
    elif sys.platform == 'win32':
        
      if ('JAVA_HOME' not in os.environ):
         JAVA_EXECUTABLE = 'java'
      else:
         JAVA_EXECUTABLE = os.path.expandvars('%JAVA_HOME%') + "\\bin\\java"
        
      SPLUNK_HOME = os.path.expandvars('%SPLUNK_HOME%')
      MODINPUT_HOME = SPLUNK_HOME  + "\\etc\\apps\\"+MODINPUT_NAME+"_ta\\"
      CLASSPATH = build_windows_classpath()
    else:
      sys.stderr.writelines("ERROR Unsupported platform\n")
      sys.exit(2)

    if RUNMODE == 3:
      checkForRunningProcess()

    
    java_args = [ JAVA_EXECUTABLE, "-classpath",CLASSPATH,"-Xms64m","-Xmx64m","-Dsplunk.securetransport.protocol="+SECURE_TRANSPORT,"-DSPLUNK_HOME="+SPLUNK_HOME,JAVA_MAIN_CLASS]
    java_args.extend(sys.argv[1:])

    # Now we can run our command   
    process = Popen(java_args)
    if RUNMODE == 3:
      writePidFile()
    # Wait for it to complete
    process.wait()
    sys.exit(process.returncode)

def signal_handler(signal, frame):
        #kill the java process
        process.kill()
        #exit this script
        sys.exit(0)

        
signal.signal(signal.SIGINT, signal_handler)

if __name__ == '__main__':
    global RUNMODE
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--scheme":
            RUNMODE = 1
            do_scheme()
        elif sys.argv[1] == "--validate-arguments":
            RUNMODE = 2
            do_validate()
        else:
            usage()
    else:
        RUNMODE = 3
        do_run()