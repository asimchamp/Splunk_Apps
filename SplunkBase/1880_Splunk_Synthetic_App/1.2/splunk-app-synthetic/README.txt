# ### ### ### ### ### ### ### ### ### ### ### ### ##
#                                                 ##
#   Splunk App for Synthetic Monitoring 	  ##
#                                                 ##
#   Description:                                  ##
#       Synthetically simulate browser 		  ##
#        interaction and allows to measure	  ##
#     Web Application Performance using	          ##
#                  Selenium	                  ##
#                                                 ##
#                                                 ##
#   Splunk Version:  6.0.3 and Higher             ##
#   App Version: 1.0                              ##
#   Last Modified:   October 2014                 ##
#   Authors: Elias Haddad - Splunk, Inc.          ##
#            				          ##
#           				          ##
#					          ##
#                                                 ##
#                                                 ##
#    Copyright(C) 2014 Splunk, Inc.               ##
#                 All Rights Reserved             ##
# ### ### ### ### ### ### ### ### ### ### ### ### ##




==========================
***Overview ***
==========================
The Synthetic Monitoring app enables you to monitor your Web application and measure critical KPIs such as application performance and availability. Relying on the Selenium Webdriver, this app allows you to  proactively detect application problems before your customers do. With the synthetic monitoring application, you will be able to simulate user interactions around the clock and set up alerts when your application breaches its performance and availability SLAs. This app allows you to compare the end user performance of your application from different locations, various browsers and from a myriad of devices. 

==========================
***Installing ***
==========================

To install this app:
- Install it from the UI or untar the app package to your etc/apps directory

==========================
*** Configuring ***
==========================
This app requires Python 3.4 to be installed on the same Splunk Forwarder or Server where the Selenium script will be executed. 

Follow the steps below to configure Selenium: 
1- Install Python 3.4 or above outside of the Splunk directory path
2- install Selenium webdriver as well as the user_agents module using pip. 
from the newly installed python directory run the following 
You can do by running the following command from the bin folder of the python3.4 directory: 
pip3.4 install user_agents
pip3.4 install selenium

For more details on how to configure python for selenium, refer to the following
http://selenium-python.readthedocs.org/en/latest/installation.html

3- Download and install the Selenium IDE. This will allow you to record Selenium Scripts:
https://addons.mozilla.org/en-US/firefox/addon/selenium-expert-selenium-ide/

4- If you want to simulate Chrome browser interaction, download the latest Chrome Driver from: 
http://chromedriver.storage.googleapis.com/index.html
and place it under /usr/bin. You can skip that step if you want to run the script using Firefox only

5- Download the Selenium Webdiver and place it somewhere on the same splunk machine. 
http://selenium-release.storage.googleapis.com/index.html?path=2.43/


==========================
*** Running a Selenium Script in Splunk ***
==========================

1- Record your script in Selenium IDE. Once the script is successfully recorded export the script from the Selenium IDE menu
File -> Export Test case as -> Python/Junit/Webdriver. Make sure the script is saved with .py extension
2- Save the newly generated script under the <Splunk>/etc/apps/splunk-app-synthetic/bin folder
3- Edit the script to add the splunk transaction definition and do it as follow: 
	###### STEP 1
	### Include the splunktransactions module in your script
	from splunktransactions import Transaction
	
	###### STEP 2
        ### Provide a name to your Application eg. 'Google'
	a=Transaction(driver, 'Google')
        
	###### STEP 3
        ### assign a name to the transaction by defining a start and and end 
        a.TransactionStart(driver, 'Google Home Page')
        driver.get(self.base_url + "/")
        a.TransactionEnd(driver, 'Google Home Page')

	###### STEP 4
        ### Repeat Step 3 and 4 as needed for as many transactions as needed

4- Create a batch/shell file that runs the python script from the newly installed python. Example shell script: 
#!/bin/bash
unset PYTHONPATH
unset LD_LIBRARY_PATH
CLASSPATH="<change me>/selenium-server-standalone-*.jar"
export CLASSPATH
SELENIUM_SERVER_JAR="/<change me>/selenium-server-standalone-*.jar"
export SELENIUM_SERVER_JAR

python3.4 <change me>/etc/apps/splunk-app-synthetic/bin/GoogleTest.py


5- Make sure that the script runs successfully from the command line 
6- Create a scripted input that invokes the shell script. Define the frequency of execution in the scripted input
7- If you want a ping monitor, create another scripted input to point to the ping.py file included with the app. Example inputs.conf entry to ping www.python.org : 
	[script://./bin/ping.py www.python.org]
	disabled = 1
	index = synthetic
	interval = 60.0
	source = ping
	sourcetype = network
8- Make sure all scripted inputs are enabled
9- Data should start getting indexed
10- Edit the location.csv file under etc/apps/splunk-app-synthetic/lookups to map your forwarders hostnames with a location name

App comes with default scripted inputs that you can enable to test things out.


==========================
*** Indexes ***
==========================
As Splunk indexes your Selenium data, the app will index the data into synthetic index


==========================
*** Source types ***
==========================
Sourcetypes that are assigned to the incoming data are synthetic for the Selenium data and Network for the ICMP data


==========================
*** Lookups ***
==========================
Lookups are provided for the mapping of the splunk forwarders host to a logic entity representing the location of that forwarder. The location.csv file need to be updated manually accordingly



==========================
*** Dashboards ***
==========================

The Splunk app for synthetic monitoring comes with several dashboards that allow you to visualize your synthetic monitoring data and compare performance by Application, Transaction, Geography and browser/OS.

==========================
*** TroubleShooting ***
==========================
All error handling from the app can be logged in the internal log files
Make sure you can run the script manually outside of splunk from the command prompt before using it
