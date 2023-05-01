======= LogMeIn Technology Add-on =======

	Author: Alan Ivarson (aivarson@splunk.com)
	
	Version/Date: 01-25-2015

	Supported product(s): LogMeIn Pro
	Version(s): Unknown

	Source type(s): logmein

	Input requirement(s): This TA contains an inputs.conf that monitors the default directory
	of a LogMeIn Pro, Windows install. If you did not install LogMeIn Pro to the default directory you will
	need to modify the inputs.conf.

	Configuration: The default input automatically pulls the current daily log from the LogMeIn Pro
	default install location. Note: There is a commented stanza which can also pull in all previous
	days files (if desired).

	This TA contains search-time extractions. It should be installed on the forwarders (for inputs) and the
	Splunk Search Head(s).
	
	CIM: This TA contains extractions, eventtypes and tags to fit the authentication Data Model.	
