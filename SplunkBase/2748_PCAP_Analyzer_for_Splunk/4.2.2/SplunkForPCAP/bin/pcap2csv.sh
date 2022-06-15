#!/bin/bash
#Daniel Schwartz
#This script aims to check which tshark script to execute
#Created: December 2016
#Version 1.3
#Updated 08.11.2017 - Monitored folders moved to app directory
#Updated 02.05.2018 - Script execution loop tweaked
#Updated 27.05.2019 - Simplified script

#Define variables
TSHARK=$(which tshark)
V10="$SPLUNK_HOME/etc/apps/SplunkForPCAP/bin/pcap2csv_1_10_x.sh"
V11="$SPLUNK_HOME/etc/apps/SplunkForPCAP/bin/pcap2csv_1_11_x_1_12_x.sh"
V2="2"

#Execute
TSHARK_VERSION=$($TSHARK -v | grep TShark | grep Wireshark |cut -b '20')

if [ "$TSHARK_VERSION" -ge "$V2" ]; then
        $V11
else
        $V10
fi

