# ABOUT THIS APP

The Dell Isilon Add-on for Splunk Enterprise is used to gather data from Isilon Cluster, do indexing on it and provide the indexed data to "Dell Isilon App for Splunk Enterprise" app which runs searches on indexed data and build dashboards using it.


# REQUIREMENTS

* Splunk version 6.6.x, 7.0.x and 7.1.x

# RECOMMENDED SYSTEM CONFIGURATION

* Splunk search head system should have 8 GB of RAM and a quad-core CPU to run this app smoothly.


# TOPOLOGY AND SETTING UP SPLUNK ENVIRONMENT

* This app has been distributed in two parts.

  1) Add-on app, which runs collector scripts and gathers data from Dell Isilon node, does indexing on it and provides indexed data to Main app.
  2) Main app, which receives indexed data from Add-on app, runs searches on it and builds dashboard using indexed data.

* This App can be set up in two ways:
  1) **Standalone Mode**: Install main app and Add-on app on a single machine.

     * Here both the apps reside on a single machine.
     * Main app uses the data collected by Add-on app and builds dashboard on it

   2) **Distributed Environment**: Install main app and Add-on app on search head,  Only Add-on on forwarder system and need to create index manually on Indexer.
     
     * Here also both the apps resides on search head machine, but no need to configure Add-on on search head.
     * Only Add-on needs to be installed and configured on forwarder system.
     * On Indexer, Create index from menu Settings-> Indexes-> New Give the name of index (for eg. isilon), which has been used in TA setup form on forwarder system.
     * Execute the following command on forwarder to forward the collected data to the indexer.
       $SPLUNK_HOME/bin/splunk add forward-server <indexer_ip_address>:9997
     * On Indexer machine, enable event listening on port 9997 (recommended by Splunk).
     * Main app on search head uses the received data and builds dashboards on it.

# INSTALLATION OF APP

* This app can be installed through UI using "Manage Apps" or extract zip file directly into $SPLUNK_HOME/etc/apps/ folder.

# TEST YOUR INSTALL

The main app dashboard can take some time before the data is returned which will populate some of the panels. A good test to see that you are receiving all of the data we expect is to run this search after several minutes:

    search `isilon_index` | stats count by sourcetype

In particular, you should see these sourcetypes:
* emc:isilon:rest
* emc:isilon:syslog

If you don't see these sourcetypes, have a look at the messages for "emc:isilon:rest" . User can see logs at $SPLUNK_HOME/var/log/isilon/emc_isilon.log file.

For "emc:isilon:syslog", check the syslog file in /etc/mcp/override/syslog.conf - it should have @<forwarders_ip_address> in front of the required log file and !* at the end of the syslog.conf file. Also run following command to see whether the syslog forwarding is enabled or not:

For Dell Isilon cluster with oneFS version 7.x.x - isi audit settings view
For Dell Isilon cluster with oneFS version 8.x.x - isi audit settings view, isi audit settings global view

Dell Isilon forward syslog and audit logs on 514 udp port by default. Please make sure port 514 is open and available for Isilon syslogs.

# Release Notes
* Version 2.5.0
    * Changed branding of the app.
* Version 2.4.0
    * [Cluster Inventory] Node details panel in the Cluster Inventory dashboards shows wrong Up time.

# SUPPORT

* Access questions and answers specific to Dell Isilon App For Splunk at https://answers.splunk.com.
* Support Offered: Yes
* Support Email: support@crestdatasys.com
* Please visit https://answers.splunk.com, and ask your question regarding Dell Isilon App For Splunk. Please tag your question with the correct App Tag, and your question will be attended to.

# SAVEDSEARCHES

This application contains following six saved searches, which are used in the dashboard. 

* EMC-Isilon-Cluster-Stats-lookup
This saved search is used to populate "ClusterStatsLookup" lookup

* EMC-Isilon-Cluster-lookup
This saved search is used to populate "ClusterNameLookup" lookup

* EMC-Isilon-Disk-lookup
This saved search is used to populate "NodeDiskLookup" lookup

* EMC-Isilon-NodeMapping-lookup
This saved search is used to populate "NodeMappingLookup" lookup

* EMC-Isilon-Users-Sid-lookup
This saved search is used to populate "UsersSidLookup" lookup

* EMC-Isilon-Cluster-Summary
This saved search is used to get summary details of cluster
