#!/bin/sh

#current script path
SCRIPTPATH=`dirname $0`

. $SCRIPTPATH/configuration.sh

#Path for temp output file
SPLUNKSARPATH=$SCRIPTPATH/../../../SAR-TEMP

TODELETEFILE=$SPLUNKSARPATH"/"$DAYBEFOREYEAR$DAYBEFOREMON"-"$TODELFILENAME"-splunk"
SARTEMPFILE=$SPLUNKSARPATH"/"$YESTERDAYYEAR$YESTERDAYMON"-"$CURRENTFILENAME"-splunk"

#echo $TODELETEFILE > $SPLUNKSARPATH"/debug.log"

if [[ ! -e $SPLUNKSARPATH ]]; then
	    mkdir $SPLUNKSARPATH
fi

if [[ -e $SARCURRENTFILE ]]; then	
    if [[ ! -e $SARTEMPFILE ]]; then
        $AWK -f $SCRIPTPATH/sardsr2splunk-1.awk $SARCURRENTFILE | $AWK -f $SCRIPTPATH/sardsr2splunk-2.awk > $SARTEMPFILE
    fi
    if [[ -e $TODELETEFILE  ]]; then
        rm -f $TODELETEFILE
    fi  
fi