#!/bin/sh

#current script path
SCRIPTPATH=`dirname $0`

. $SCRIPTPATH/configuration.sh

if [[ $EARLIESTDATE == "" ]]; then
	_dateshift $EARLIESTDAYSAGO
	startDate=$_DATESHIFT
else
	startDate=$EARLIESTDATE
fi

if [[ $LATESTDATE == "" ]]; then
	_dateshift $LATESTDAYSAGO
	endDate=$_DATESHIFT
else
	endDate=$LATESTDATE
fi

_diffdate $startDate $endDate
NUMDAYS=`expr $_DIFFDATE + 1`

#Path for temp output file
SPLUNKSARPATH=$SCRIPTPATH/../../../SAR-BACKFILL

i=0

while [ $i -lt $NUMDAYS ]
do
   _dateshift $startDate $i
   split_date $_DATESHIFT

####################################################################################################################
#                                                EDIT THIS SECTION - CURRENTFILE                                   #
# IF CURRENTFILE USES A STATIC PATH. ALWAYS USE: CURRENTFILE=COMMONFILEROOT$SARFILEROOT$SD2_DAY                    #
# IF CURRENTFILE USES A DYNAMIC PATH: USE EXAMPLE BELOW TO CONFIGURE FOR OWN ENVIRONMENT                           #
# VARIABLES TO USE:                                                                                                #
#   SD_YEAR (4 DIGIT YEAR)                                                                                         #
#   SD2_MONTH (2 DIGIT MONTH)                                                                                      #
#   SD2_DAY (2 DIGIT DAY)
# DYNAMIC PATH EXAMPLE: CURRENTFILE=$COMMONFILEROOT$SD_YEAR"."$SD2_MONTH"/"$CURRENTHOST"/"$SARFILEROOT$SD2_DAY     #
#                                                                                                                  #
  CURRENTFILE=COMMONFILEROOT$SARFILEROOT$SD2_DAY   
#   CURRENTFILE=$COMMONFILEROOT$SD_YEAR"."$SD2_MONTH"/"$CURRENTHOST"/"$SARFILEROOT$SD2_DAY
####################################################################################################################

# DO NOT EDIT BELOW THIS POINT #   
   SARTEMPFILE=$SPLUNKSARPATH"/"$SD_YEAR$SD2_MONTH"-"$SARFILEROOT$SD2_DAY"-splunk"
   
   if [[ ! -e $SPLUNKSARPATH ]]; then
	    mkdir $SPLUNKSARPATH
   fi

   if [[ -e $CURRENTFILE ]]; then	
       if [[ ! -e $SARTEMPFILE ]]; then
          $AWK -f $SCRIPTPATH/sardsr2splunk-1.awk $CURRENTFILE | $AWK -f $SCRIPTPATH/sardsr2splunk-2.awk > $SARTEMPFILE
       fi
   fi  
   i=`expr $i + 1`
done