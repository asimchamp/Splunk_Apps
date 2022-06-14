
#! /bin/sh

# exit if no Oracle
[ -f /etc/oratab ] || exit 0

INSTANCEDOWN=0

# check for listener
/bin/echo "LISTENER status"
LC=$(/bin/ps -ef | /bin/egrep LISTENER | /bin/egrep -v 'grep' | /bin/egrep LISTENER)

if [ "${LC}" = "" ] ; then
         /bin/echo "ERROR: LISTENER not running!"
else
         /bin/echo "LISTENER is running."
         /usr/sbin/lsof -i :1521 | /bin/grep tnslsnr | /bin/grep LISTEN
fi

# check each instance
for INSTANCE in  `/bin/cat /etc/oratab | /bin/egrep ":N|:Y" | /bin/grep -v \* | /bin/cut -f1 -d:`
do
         /bin/echo -e \\n"Status of ${INSTANCE}"
        for PROCESS in pmon smon
        do
          RC=$(/bin/ps -ef | /bin/egrep ${INSTANCE} | /bin/egrep -v 'grep' | /bin/egrep ${PROCESS})
          if [ "${RC}" = "" ] ; then
            INSTANCEDOWN=1
             /bin/echo "ERROR: Instance ${INSTANCE} ${PROCESS} down!"
          fi
        done
        if [ ${INSTANCEDOWN} = "1" ] ; then
           /bin/echo "Instance ${INSTANCE} is running!"
        else
           /bin/echo "Instance ${INSTANCE} is running."
           /bin/ps -ef | /bin/grep ${INSTANCE} | grep -e pmon -e smon
        fi
done

