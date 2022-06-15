## Splunk DataSift Modular Input v0.1

## Overview

This is a Splunk modular input add-on for Indexing DataSift Social Data Streams.


## Dependencies

* Splunk 5.0+
* Supported on Windows, Linux, MacOS, Solaris, FreeBSD, HP-UX, AIX

## Setup

* Untar the release to your $SPLUNK_HOME/etc/apps directory or install directly in to your Splunk server from SplunkBase.
* Restart Splunk

* Go to "Manager" --> "Data Inputs" --> "DataSift Social Data Stream"
* Click "Add, New".  Enter the stream hash of an existing DataSift stream and your credentials.  Hit save and data should flow in to Splunk.

* Make some cool analytics and share them with everyone!


## Logging

Any log entries/errors will get written to $SPLUNK_HOME/var/log/splunk/splunkd.log


## Troubleshooting

* You are using Splunk 5+
* Look for any errors in $SPLUNK_HOME/var/log/splunk/splunkd.log

## Contact

This project was initiated by Michael Wilde

<tr>
<td><em>Email</em></td>
<td>mwilde@splunk.com/td>
</tr>

</table>
