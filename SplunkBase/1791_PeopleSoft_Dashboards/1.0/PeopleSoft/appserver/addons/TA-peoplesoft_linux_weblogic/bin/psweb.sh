#!/bin/bash

export PIA_HOME=/pia_home

for instance in `ls $PIA_HOME/webserv`
do

	if [ -f $PIA_HOME/webserv/$instance/bin/startPIA.sh ] 
	then
	
		/bin/echo Status of $instance
	        if [ -z `/bin/ps -ef | /bin/grep java | /bin/grep $instance | /usr/bin/head -n1 | /bin/cut -f1 -d" "` ]
        	then
                	/bin/echo "ERROR $instance is not running."
                else
                	/bin/echo "$instance appears to be running."
                	/bin/echo
                	/bin/echo the process ID is:
                	/bin/echo
                	/bin/cat $PIA_HOME/webserv/$instance/servers/PIA/logs/PIA.pid
                	/bin/echo
                	/bin/echo the open ports info \(lsof\) is:
                	/bin/echo
                	/usr/sbin/lsof -i @`/bin/grep ADMINSERVER_HOSTNAME= $PIA_HOME/webserv/$instance/bin/setEnv.sh | /bin/cut -f2 -d=`:80 -i @`/bin/grep ADMINSERVER_HOSTNAME= $PIA_HOME/webserv/$instance/bin/setEnv.sh | /bin/cut -f2 -d=`:443
                	/bin/echo
                	/bin/echo the java process info is:
                	/bin/echo
                	/bin/ps -ef | /bin/grep `/bin/cat $PIA_HOME/webserv/$instance/servers/PIA/logs/PIA.pid` | /bin/grep -v grep
                	/bin/echo
		fi
        fi
done

