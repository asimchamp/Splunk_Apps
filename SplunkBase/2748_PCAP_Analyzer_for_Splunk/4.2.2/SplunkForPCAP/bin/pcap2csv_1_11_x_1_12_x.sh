#!/bin/bash
#Daniel Schwartz
#This script converts pcap files to a csv file using tshark <=1.11.x
#Created: May 2015
#Updated: 08.11.2017
#Updated: 02.05.2018 - Script execution loop tweaked
#Updated: 16.05.2018 - Implemented an if-clause to check if a file exists before tshark get started
#Updated: 20.04.2020 - Added delta.time, frame.number
#Version 1.9
TSHARK=$(which tshark)
VAR=$(more $SPLUNK_HOME/etc/apps/SplunkForPCAP/local/inputs.conf | grep path |  awk '{print $3}')

for line in $VAR
do

	for file in $line/*.pcap
	do
		if [ -f $file ]; then
		$TSHARK -o tcp.calculate_timestamps:TRUE -r "$file" -T fields -e frame.time -e tcp.stream -e frame.number -e ip.src -e ip.dst -e _ws.col.Protocol -e tcp.srcport -e tcp.dstport -e tcp.len -e tcp.window_size -e tcp.flags.syn -e tcp.flags.ack -e tcp.flags.push -e tcp.flags.fin -e tcp.flags.reset -e ip.ttl -e _ws.col.Info -e tcp.analysis.ack_rtt -e vlan.id -e eth.src -e eth.dst -e http.time -e dns.time -e rpc.time -e smb2.time -e smb.time -e tcp.time_delta -e tcp.time_relative > $SPLUNK_HOME/etc/apps/SplunkForPCAP/PCAPcsv/${file##*/}.csv
		mv "$file" $SPLUNK_HOME/etc/apps/SplunkForPCAP/PCAPConverted/
		fi
	done
done
