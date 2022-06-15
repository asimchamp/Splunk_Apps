Author: Anthony Tellez
********************

This is Splunk search command returns in realtime whether the password associated with an email account has been breached or dumped onto the internet. This command queries the haveibeenpwned api and displays the results in JSON. It requires access to the internet in order to work.

Usage:

<search that a has field named email> | pwned
<search that contains a field containing a email | owned email as <local-field>

The distribution comes with a sample_email.log file you can use to test

index="sample" sourcetype=“emails”|dedup email_account|rename email_account as email|pwned|table email, isleaked

index="sample" sourcetype=“emails”|dedup email_account |httpget email as email_account|table email_account, disliked
Installation:

The command httpget has been configured in the TA to run out of the box with
read role for the whole system. Just untar gunzip this into the 
$SPLUNK_HOME/etc/apps directory and restart Splunk.

*****************************************************************




