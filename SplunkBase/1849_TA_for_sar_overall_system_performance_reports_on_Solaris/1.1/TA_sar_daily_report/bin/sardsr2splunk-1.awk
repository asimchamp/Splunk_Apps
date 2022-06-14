BEGIN { }
$0 ~ /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/ { date=$6 ; host=$2 ; next};
$2 ~ /%usr/ { print "CPU" ; next};
$2 ~ /device/ { print "DEVICE" ; next};
$2 ~ /runq-sz/ { print "RUNQ" ; next};
$2 ~ /bread\/s/ { print "BREAD" ; next};
$2 ~ /swpin\/s/ { print "SWPIN" ; next};
$2 ~ /scall\/s/ { print "SCALL" ; next};
$2 ~ /iget\/s/ { print "IGET" ; next};
$2 ~ /rawch\/s/ { print "RAWCH" ; next};
$2 ~ /proc-sz/ { print "PROC-SZ" ; next};
$2 ~ /msg\/s/ { print "MSG" ; next};
$2 ~ /atch\/s/ { print "ATCH" ; next};
$2 ~ /pgout\/s/ { print "PGOUT" ; next};
$2 ~ /freemem/ { print "FREEMEM" ; next}
$2 ~ /sml_mem/ { print "SML_MEM" ; next};

$0 ~ /^[0-9]{2}:[0-9]{2}:[0-9]{2}[ ]+[0-9]+.*/ { printf "%s %s host=%s\n",date, $0, host ; next};
$0 ~ /^[0-9]{2}:[0-9]{2}:[0-9]{2}[ ]+[a-zA-Z]+[0-9]/ { printf "%s %s %9s %14s %7s %7s %7s %7s %7s host=%7s\n",date, $1,$2,$3,$4,$5,$6,$7,$8,host ; next};

$1 ~ /[a-zA-Z]+[0-9]+/ { printf "%29s %14s %7s %7s %7s %7s %7s host=%7s\n",$1, $2, $3, $4, $5, $6, $7,host ; next};
END { }