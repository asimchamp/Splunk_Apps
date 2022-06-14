This package is a Citrix XenServer Technology Addon (TA) for the “Splunk App for Server Virtualization”.  There are no visual components to this TA. 

System Requirements:
- Python 2.3 or above (Windows or Linux)
- Network connectivity to the XenServer pool master
- Splunk Universal Forwarder (downloadable for free from splunk.com)

Installation:
- Install the Splunk Universal Forward (Windows or Linux)
- Copy this package to $SPLUNK_HOME$/etc/apps
- Copy $SPLUNK_HOME$/etc/apps/TA-XS60-Server/local/xsconfig.conf.example to $SPLUNK_HOME$/etc/apps/TA-XS60-Server/local/xsconfig.conf
- Edit $SPLUNK_HOME$/etc/apps/TA-XS60-Server/local/xsconfig.conf to provide connection information for you XenServer pool
- Restart the Splunk forwarder

How the TA works
The TA polls the XenServer pool master as defined in xsconfig.conf for environment information including hosts, virtual machines, storage repositories, etc.  The TA forwards this data to a Splunk index named servervirt.

The TA polls each XenServer host to gather performance statistics about the host and the virtual machines running on the host.  XenServer stores this information in a Round Robin Database (RRD) that the Splunk TA parses and forwards to a Splunk index named servervirt.

It is recommended to have one TA for each XenServer pool.
