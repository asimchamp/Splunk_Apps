This is the TA for the Great Bay logs, needed for the Great
Bay app.

You can configure input by creating an inputs.conf file in the local
directory with a configuration like this:

[udp://9991]
sourcetype = greatbay:beacon
no_appending_timestamp = true

[udp://9992]
sourcetype = greatbay:audit
no_appending_timestamp = true

if your data is already collected and the sourcetype is syslog,
add the folowing lines in local/props.conf

[syslog]
TRANSFORMS-set_greatbay_st = audit_override, beacon_override


Remember to add the  no_appending_timestamp = true  option to avoid to
add an extra header with the time.!


