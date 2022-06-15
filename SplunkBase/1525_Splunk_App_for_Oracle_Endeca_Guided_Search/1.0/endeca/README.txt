The Splunk App for Oracle Endeca Guided Search allows you to consume logs from your implemntation of Oracle Endeca Guided Search for both systems operations and site analytics use cases.

The application provides extractions, transforms, configuration, lookups, saved searches, and dashboards for several different log types including...
- Dgraph Request Logs
- Endeca logserver output
- Forge logs
- Dgidx logs
- Baseline update logs

After installing the application you can find screenshots of each of the dashboards in /endeca/screenshots

##### What's New #####
1.0 (2013-05-03)
- First Release of App

###### Installation Instructions ######

1.  Download application .spl file from Splunkbase (endeca_guided_search.spl)
2.  Create a new index within Splunk named endeca
3.  Install the application with Splunk by navigating within Splunk web to Manager>Apps>Install app from file and then brows to endeca_guided_search.spl and upload it.
4.  Confirm app is loaded by opening the application from the menu by choosing App>Oracle Endeca Guided Search
5.  Configure inputs for each of the Endeca logs types that you have available from the following list.  Please make sure to point input to the "endeca" index and use the sourcetype listed.
	- Dgraph Request: 
		* Standard monitor location (update as appropriate)=<Endeca App Directory>/logs/dgraphs/.../*.reqlog	
		* index = endeca
		* sourcetype = dgraph_request
	- Endeca Logserver Output
		* Standard monitor location (update as appropriate)=<Endeca App Directory>/logs/logserver_output	
		* index = endeca
		* sourcetype = logserver_output
	- Forge
		* Standard monitor location (update as appropriate)=<Endeca App Directory>/logs/dgraphs/.../*.reqlog	
		* index = endeca
		* sourcetype = forge
	- Dgidx
		* Standard monitor location (update as appropriate)=<Endeca App Directory>/logs/dgraphs/.../*.reqlog
		* index = endeca
		* sourcetype = dgidx	
	- Baseline Update
		* Standard monitor location (update as appropriate)=<Endeca App Directory>/logs/provisioned_scripts/BaselineUpdate*.log	
		* index = endeca
		* sourcetype = baseline_update
6.  Verify data is flowing by executing a search query over all time of ... index=endeca
7.  Start using the application.
