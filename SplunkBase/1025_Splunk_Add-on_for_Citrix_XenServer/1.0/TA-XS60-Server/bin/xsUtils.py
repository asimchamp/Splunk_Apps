#!/usr/bin/env python

import time
import ConfigParser
import os
import XenAPI
    
def getConfig():
    config = ConfigParser.ConfigParser()
    APP_DIR = os.path.join(os.environ['SPLUNK_HOME'], 'etc', 'apps', 'TA-XS60-Server')
    CONFIG_FILE = os.path.join(APP_DIR, 'local', 'xsconfig.conf')
    config.read(CONFIG_FILE)
    return config
    
def getExceptionLogger(config):
    from SplunkLogger import SplunkLogger

    SPLUNK_LOG_DIR = os.path.join(os.environ['SPLUNK_HOME'], 'var', 'log')
    EXCEPTION_LOGFILE = os.path.join(SPLUNK_LOG_DIR, 'TA-XS60-Server.log')
    MAX_BYTES = config.getint('logging', 'maxBytes')
    BACKUP_COUNT = config.getint('logging', 'backupCount')
    exceptionLogger = SplunkLogger(EXCEPTION_LOGFILE, MAX_BYTES, BACKUP_COUNT, 'exception_log')
    return exceptionLogger    


def getXSSession(config, log):

    session = ""
    
    try:
        # Start a XS session
        xsURL = config.get("XenServerAPI", "URL")
        xsUsername = config.get("XenServer Credentials", "username")
        xsPassword = config.get("XenServer Credentials", "password")
        
        session = XenAPI.Session(xsURL)
        session.xenapi.login_with_password(xsUsername, xsPassword)
    
    except XenAPI.Failure, e:
        if e.details[0] == 'HOST_IS_SLAVE':
            session = XenAPI.Session('http://' + e.details[1])
            session.login_with_password(xsUsername, xsPassword)
    
    except Exception, ex:
        log.error(ex)
        
    return session

def test():
    print("Splunk for XenServer utilities.")

xsConfig = getConfig()
xsLog = getExceptionLogger(xsConfig)
xsSession = getXSSession(xsConfig, xsLog)

if __name__ == '__main__':
   test()

