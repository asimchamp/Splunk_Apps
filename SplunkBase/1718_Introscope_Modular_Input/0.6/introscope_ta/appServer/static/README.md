## Splunk Introscope Modular Input v0.6

## Overview

This is a Splunk modular input for integrating with Wiley Introscope.
The apps get metric Data from Introscope via the Soap Webservice. The xml received is handled by the app, and forwarded to Splunk as key-value pair, for best performance and optimized size.
For now, it has only been testing for historical Data (Live Data may work, but hasn't been tested)

You'll find also getmetrics search command, but as getting infos at search time was pretty slow, this search command has not been canceled. I prefer index the Data for better performance. If someone has interest, and can complete it, please upload the changes back.

## Dependencies

* Splunk 5.0+
* Supported on Windows, Linux, MacOS, Solaris, FreeBSD, HP-UX, AIX

## Setup

* Untar the release to your $SPLUNK_HOME/etc/apps directory
* Restart Splunk


## Logging

Any log entries/errors will get written to $SPLUNK_HOME/var/log/splunk/splunkd.log


## Troubleshooting

* You are using Splunk 5+
* Look for any errors in $SPLUNK_HOME/var/log/splunk/splunkd.log

## Contact

This project was initiated by Sebastien Brennion
<table>

<tr>
<td><em>Email</em></td>
<td>sebastien.brennion@sbb.ch</td>
</tr>

</table>
