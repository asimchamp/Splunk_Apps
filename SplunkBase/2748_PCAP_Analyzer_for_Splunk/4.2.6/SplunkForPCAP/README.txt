=> NOTES
- What is tshark? TShark is a network protocol analyzer. It lets you capture packet data from a live network, or read packets from a previously saved capture file, either printing a decoded form of those packets to the standard output or writing the packets to a file
- PCAP Analyzer For Splunk writes a log about the added paths to $SPLUNK_HOME/var/log/splunk/PCAPInputHistory.log 

=> CONTACT
Feedback welcome! You can contact me by emailing <1daniel.schwartz1@gmail.com>.

For issues please contact me via email or open a new issue on Github: 
https://github.com/DanielSchwartz1/SplunkForPCAP/issues/new

Emails will be usually answered between Monday-Friday 9am - 6pm European Time.
Getting started: https://schwartzdaniel.com/pcap-analyzer-for-splunk-getting-started/

=> INTRODUCTION

The Splunk App for PCAP files will express the pcap files into helpful charts by converting the files into a Splunk readable CSV file

=> NOTES ABOUT THE DATA

I have suffered from timestamp problems with PCAP files over 500MB. 
In case of big files I have split the pcap files into smaller files by using editcap.exe out of the Wireshark package.

-Index defined for the data: Default Index is choosed

-Sourcetype defined for the data:
-->sourcetype=pcap:csv

=>REQUIREMENTS

Wireshark (tshark) needs to be installed (available)
=> GETTING STARTED

Getting started - Requirements!
Step 1: Make sure the ../SplunkForPCAP/bin/ folder has all administrative privileges to execute the batch and shell script
Step 2: Make sure you have tshark installed (in most cases delivered with Wireshark)
Step 3: Make sure you have set SPLUNK_HOME variable

To allow Splunk to collect your PCAP Files you have to specify where you have stored your pcap files.
You can specify your location in the Data Inputs (via Settings) --> PCAP File Location.

The app checks every 3 minutes for a new pcap file in your specified folder.

You will recognize that after you can see your pcap file indexed in Splunk it is removed from your folder. The new location of the PCAP File is: $SPLUNK_HOME\etc\apps\SplunkForPCAP\PCAPConverted. That is happening to avoid that the automatic script converts your pcap file twice.

=> ROADMAP

Support for more protocols and more use cases
Dashboards will change to highlight the most important use cases for troubleshooting.
