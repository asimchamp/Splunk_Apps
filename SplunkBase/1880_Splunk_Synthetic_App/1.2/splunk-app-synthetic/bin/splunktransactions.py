import uuid
import time
import socket
from user_agents import parse
from datetime import datetime, timedelta, date

class Transaction():

    def __init__(self, driver,name):
        ua = driver.execute_script("return navigator.userAgent")
        user_agent = parse(ua)
        self.execution_id=uuid.uuid1()
        self.app_name=name
        self.browser_version=user_agent.browser.version_string
        self.browser=user_agent.browser.family
        self.os=user_agent.os.family
        self.os_version=user_agent.os.version_string
        self.ip=socket.gethostbyname(socket.gethostname())
        self.tx_count=0
        self.transaction_list={}
        
    def TransactionStart(self, driver, tx_name):
        self.tx_count=self.tx_count+1
        current_time_epoch = time.time()
        self.transaction_list[tx_name, 'start']=current_time_epoch
        current_time = str(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(current_time_epoch)))
        print(current_time + " event_type=\"start\"" +  " transaction_start=\"" + current_time + "\" transaction_name=\"" + tx_name + "\" transaction_start_epoch=\"" +  str(self.transaction_list[tx_name, 'start']) +  "\" execution_id=\"" + str(self.execution_id) + "\" browser=\"" + self.browser + "\" browser_version=\"" + self.browser_version + "\" os=\"" + self.os + "\" os_version=\"" + self.os_version + "\" ip=\"" + self.ip + "\" title=\"" + driver.title +  "\" app_name=\"" + self.app_name + "\"")

    def TransactionEnd(self, driver, tx_name):
        current_time_epoch = time.time()
        self.transaction_list[tx_name, 'end']=current_time_epoch
        current_time = str(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(current_time_epoch)))
        self.transaction_list[tx_name, 'duration'] = self.transaction_list[tx_name, 'end'] - self.transaction_list[tx_name, 'start']
        print(current_time + " event_type=\"end\"" + " transaction_name=\"" + tx_name +  "\" transaction_end_epoch=\"" +  str(self.transaction_list[tx_name, 'end']) +  "\" transaction_duration=\"" +  str(self.transaction_list[tx_name, 'duration']) +  "\" execution_id=\"" + str(self.execution_id) + "\" transaction_end=\"" + current_time + "\" browser=\"" + self.browser + "\" browser_version=\"" + self.browser_version + "\" os=\"" + self.os + "\" os_version=\"" + self.os_version + "\" ip=\"" + self.ip + "\" title=\"" + driver.title + "\" app_name=\"" + self.app_name + "\"")

