[ping://<name>]
host_field = <value>
* This marks the column name in the csv that will contain hostnames to be pinged

workers = <number>
* This is an optional parameter which specifies how many worker processes should be used for a specific instance of this modular input

[webping://<name>]
host_field = <value>
* This marks the column name in the csv that will contain hostnames to be tested
* This must be in the form of a URL with a scheme - https://hostname:port

workers = <number>
* This is an optional parameter which specifies how many worker processes should be used for a specific instance of this modular input

web_timeout = <number>
* This defines the web timeout to be used for the availability tests.

[connect://<name>]
host_field = <value>
* This marks the column name in the csv that will contain hostnames to be pinged

workers = <number>
* This is an optional parameter which specifies how many worker processes should be used for a specific instance of this modular input

port_field = <value>
* This marks the column name in the csv that will contain destination ports to be used for this test.
* If it is not specified, then the connect modular input expects the hostname in the form hostname:port or IP:port.
