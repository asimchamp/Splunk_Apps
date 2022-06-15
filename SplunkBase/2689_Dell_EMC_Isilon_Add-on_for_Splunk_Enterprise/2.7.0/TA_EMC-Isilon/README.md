# ABOUT THIS APP

The Dell Isilon Add-on for Splunk Enterprise is used to gather data from Isilon Cluster, do indexing on it and provide the indexed data to the "Dell Isilon App for Splunk Enterprise" app which runs searches on indexed data and build dashboards using it.


# REQUIREMENTS

* Splunk version 7.2.x, 7.3.x and 8.0.0
* Dell Isilon cluster with oneFS version 7.1.x, 8.0.x and 8.1.x
* If using a forwarder, it must be a HEAVY forwarder(we use the HF because the universal forwarder does not include python)
* The forwarder system must have network access (HTTPS) to one or more Isilon nodes which are to be Splunked.
* Admin user ID and password for collecting data from the Isilon node.

# RECOMMENDED SYSTEM CONFIGURATION

* Splunk forwarder system should have 4 GB of RAM and a quad-core CPU to run this app smoothly.


# TOPOLOGY AND SETTING UP SPLUNK ENVIRONMENT

* This app has been distributed in two parts.

  1) Add-on app, which runs collector scripts and gathers data from Dell Isilon node, does indexing on it and provides indexed data to the Main app.
  2) The main app, which receives indexed data from the Add-on app, runs searches on it and builds dashboard using indexed data.

* This App can be set up in two ways:
  1) **Standalone Mode**: Install the main app and Add-on app on a single machine.

     * Here both the app resides on a single machine.
     * The main app uses the data collected by Add-on app and builds dashboard on it

   2) **Distributed Environment**: Install main app and Add-on app on search head, Only Add-on on the forwarder system and need to create index manually on Indexer.
     
     * Here also both the apps reside on search head machine, but no need to configure Add-on on the search head.
     * Only Add-on needs to be installed and configured on the forwarder system.
     * On Indexer, Create index from menu Settings-> Indexes-> New, Give the name of an index (for eg. isilon), which has been used in TA setup form on the forwarder system.
     * Execute the following command on the forwarder to forward the collected data to the indexer.
       $SPLUNK_HOME/bin/splunk add forward-server <indexer_ip_address>:9997
     * On Indexer machine, enable event listening on port 9997 (recommended by Splunk).
     * The main app on the search head uses the received data and builds dashboards on it.

# INSTALLATION OF APP

* This app can be installed through UI using "Manage Apps" or extract zip file directly into $SPLUNK_HOME/etc/apps/ folder.

# CONFIGURATION OF APP

*  After installation, go to the Apps->Manage Apps->Set up TA_EMC-Isilon. A new set up screen will open, which will ask for Isilon node credentials. Provide ip address, username, password for any one Isilon node of your cluster. There is an option to provide an index. The default value of the index is isilon. A user has to make sure, the provided index has already been created from the menu Settings->Indexes. After providing these details, click save on Setup form. Once the setup has completed successfully, go to Settings->Advanced search->Search macros. Open entry 'isilon_index' from the list and modify the definition of macro according to index provided in setup form. The default definition is index=isilon.

* If you want to collect data over encrypted network then please follow below steps:
    * Copy isilonappsetup.conf to the local folder within an app
    * Keep verify=True as is
    * Add certificate path where you have stored the certificate pem file.
    * Restart Splunk
* If you want to collect data over unencrypted network then please follow below steps:
    * Copy isilonappsetup.conf to local folder within an app
    * Change verify=False
    * Restart Splunk
*  Splunk REST API will encrypt the password and store it in Add-on folder in encrypted form, REST modular script will fetch these credentials through REST API to connect to the Isilon node.
*  Restart the Splunk
*  To enable forwarding syslog data in any Isilon Cluster version, perform the following step:
    1) Make following changes in file /etc/mcp/override/syslog.conf (copy from /etc/mcp/default/syslog.conf if not present) :
          * Put @<forwarders_ip_address> in front of the required log file and !* at the end of the syslog.conf file.
          * Restart syslogd using this command - /etc/rc.d/syslogd restart.

       * In some cases, syslog.conf file is already placed at /etc/mcp/override directory location but it is empty. In that case,  just put the log file name and the forwarder ip in that file.
         Below is the cotent of sample syslog.conf:
                  auth.*    @<forwarders_ip_address>
                  !audit_config
                  *.*    @<forwarders_ip_address>
                  !audit_protocol
                  *.*    @<forwarders_ip_address>

                  !*

    2) Run the following commands to enable protocol, config and syslog auditing according to Isilon OneFS version:
        * For Dell Isilon cluster with oneFS version 7.x.x - 
        	isi audit settings modify --protocol-auditing-enabled Yes
            isi audit settings modify --config-auditing-enabled Yes 
            isi audit settings modify --config-syslog-enabled Yes

        * For Dell Isilon cluster with oneFS version 8.x.x -
        	isi audit settings global modify --protocol-auditing-enabled Yes
            isi audit settings global modify --config-auditing-enabled Yes 
            isi audit settings global modify --config-syslog-enabled Yes
            isi audit settings modify --syslog-forwarding-enabled Yes


* Enable receiving the syslog data at forwarder. To do that, go to Settings -> Data Inputs -> UDP -> New. Provide the port number(514 is recommended by Splunk), sourcetype as emc:isilon:syslog and index same as provided in setup form of TA for same isilon cluster to this data input entry.  
* Make sure while receiving syslogs on you have set following metadata - index=Name of index, same as defined in above UDP data input, sourcetype=emc:isilon:syslog.

# External Data Sources

We are using Dell Isilon API for data collection purpose.

# CIM COMPATIBILITY

This app is compatible  with "Authentication","Inventory" and "Performance" datamodels of Splunk CIM (Common information model).


# TEST YOUR INSTALL

The main app dashboard can take some time to populate the dashboards Once data collection is started. A good test to see that you are receiving all of the data we expect is to run this search after several minutes:

    search `isilon_index` | stats count by sourcetype

In particular, you should see these sourcetypes:
* emc:isilon:rest
* emc:isilon:syslog

If you don't see these sourcetypes, have a look at the messages for "emc:isilon:rest". User can see logs at $SPLUNK_HOME/var/log/isilon/emc_isilon.log file.


For "emc:isilon:syslog", check the syslog file in /etc/mcp/override/syslog.conf - it should have @<forwarders_ip_address> in front of the required log file and !* at the end of the syslog.conf file. Also, run following command to see whether the syslog forwarding is enabled or not:

For Dell Isilon cluster with oneFS version 7.x.x - isi audit settings view
For Dell Isilon cluster with oneFS version 8.x.x - isi audit settings view, isi audit settings global view

Dell Isilon forward syslog and audit logs on 514 UDP port by default. Please make sure port 514 is open and reserved for Isilon syslogs only.

# SAMPLE EVENT GENERATOR

The TA_EMC-Isilon, comes with sample data files, which can be used to generate sample data for testing. In order to generate sample data, it requires SA-Eventgen application.  
The TA will generate sample data of rest api calls and sys logs at an interval of 10 minutes. You can update this configuration from eventgen.conf file available under $SPLUNK_HOME/etc/apps/TA_EMC-Isilon/default/.

# UPGRADE TA (v2.2 to v2.3)
Follow below steps to upgrade Dell Isilon Technology addon from version 2.2 to 2.3
* Download tar of Dell Isilon Technology addon from splunk base (v2.3)
* Extract tar of Dell Isilon Technology addon under $SPLUNK_HOME/etc/apps
* Execute upgrade python script under $SPLUNK_HOME/etc/apps/TA_EMC-Isilon/bin/upgrade_from_v2.2_to_v2.3.py. On execution, the      script will ask for input and the user has to provide already setup nodes as comma-separated value.
  for eg. $SPLUNK_HOME/bin/splunk cmd python $SPLUNK_HOME/etc/apps/TA_EMC-Isilon/bin/upgrade_from_v2.2_to_v2.3.py
  User can verify configured nodes from $SPLUNK_HOME/etc/apps/TA_EMC-Isilon/local/passwords.conf
  This script will add stanza for each node in given list in file $SPLUNK_HOME/etc/apps/TA_EMC-Isilon/local/isilonappsetup.conf. Verify entry for each node in this file
* Restart Splunk 

# Release Notes
* Version 2.4.0
    * Added support of new security patch coming in Dell Isilon cluster with oneFS version 8.1.0.4 and above.
    * Added support of pagination in active directory API calls.
    * Fixed 503 Server Error: Service Not Available Error for API calls.
* Version 2.5.0
    * Fixed Appcert cloud issues
* Version 2.6.0
    * Added support of Splunk-8.0.0.
    * Removed ssl check flag and certificate path textbox from UI to suffice Splunk Cloud checks.
* Version 2.7.0
    * Created custom setup page.
    * Changed branding of the add-on.

# OPEN SOURCE COMPONENTS AND LICENSES
* pytz (URL: https://pypi.org/project/pytz)
* requests (URL: https://pypi.python.org/pypi/requests)
* backport (URL: https://pypi.org/project/backports)
* defusedxml (URL: https://pypi.python.org/pypi/defusedxml)

# REFERENCES

* Syslog of audit protocol has failure code in case of failed audit action. The description of each failure code can be found in below Url.
  https://msdn.microsoft.com/en-us/library/ee441884.aspx
* We have used external library pytz(version: 2019.3) to manage different timezones.
  https://pypi.org/project/pytz/2019.3/
* We have used external library requests(version: 2.22.0) to make https requests.
  https://pypi.python.org/pypi/requests/2.22.0
* We have used external library backport(version: 1.0)
  https://pypi.org/project/backports/1.0/
* We have used external library defusedxml(version: 0.6.0) to handle security concerns while parsing untrusted XML data.
  https://pypi.python.org/pypi/defusedxml/0.6.0

# SUPPORT

* Access questions and answers specific to Dell Isilon Add-on For Splunk at https://answers.splunk.com.
* Support Offered: Yes
* Support Email: support@crestdatasys.com
* Please visit https://answers.splunk.com, and ask your question regarding Dell Isilon Add-on For Splunk. Please tag your question with the correct App Tag, and your question will be attended to.

* Copyright (C) 2020 Dell Technologies Inc. All Rights Reserved.