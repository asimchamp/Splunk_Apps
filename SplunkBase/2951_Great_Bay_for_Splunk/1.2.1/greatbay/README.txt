This app is the web interface for Great Bay logs (Great Bay Network Intelligent Platform).
The TA-greatbay is needed for this app to work.

Installation:

Install this app on the search head (in a distributed environment).
Install also the TA-greatbay app on the search head, and in case of a
distributed environment, also on the indexer.
You will also need to configure your input (by default, the TA is
working on syslog sourcetype).

Optional: if you are not using the default index, configure the index
to use by copying the default/macros.conf to the local directory and
modify the greatbay_index macro.
