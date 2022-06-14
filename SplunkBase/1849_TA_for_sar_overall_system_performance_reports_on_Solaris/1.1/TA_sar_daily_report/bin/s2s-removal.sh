#!/bin/sh

#current script path
SCRIPTPATH=`dirname $0`

. $SCRIPTPATH/configuration.sh

#Path for temp output file
SPLUNKSARPATH1=$SCRIPTPATH/../../../SAR-TEMP

#Path for temp output file
SPLUNKSARPATH2=$SCRIPTPATH/../../../SAR-BACKFILL

ALLFILESTEMP=$SPLUNKSARPATH1"/*"
ALLFILESREM=$SPLUNKSARPATH2"/*"

if [[ $TEMP_REMOVAL -eq 1 ]]; then
  rm $ALLFILESTEMP
  rmdir $SPLUNKSARPATH1
fi

if [[ $BACKFILL_REMOVAL -eq 1 ]]; then
  rm $ALLFILESREM
  rmdir $SPLUNKSARPATH2
fi
