#!/bin/bash

export HOME=/ps_home/tools853
export PS_CFG_HOME=/ps_cfg_home

. /etc/bashrc
. $HOME/psconfig.sh
export ORACLE_HOME=/usr/lib/oracle/11.2/client64
export LD_LIBRARY_PATH=$TUXDIR/lib:$LD_LIBRARY_PATH:$ORACLE_HOME/lib
export PATH=$TUXDIR/bin:$PATH:$ORACLE_HOME/bin


for instance in `/bin/ls $PS_CFG_HOME/appserv`
        do
        if [ -f $PS_CFG_HOME/appserv/$instance/psappsrv.cfg ]
                then
                /bin/ps -ef | /bin/grep $instance | /bin/grep -v grep >/dev/null 2>&1 && ( /bin/echo Status of $instance && $HOME/bin/psadmin -c sstatus -d $instance 2>/dev/null | /bin/sed 's/>//g' && $HOME/bin/psadmin -c cstatus -d $instance 2>/dev/null | /bin/sed 's/>//g' ) || /bin/echo -e Status of $instance \\n ERROR! $instance is not running
        fi
        done

