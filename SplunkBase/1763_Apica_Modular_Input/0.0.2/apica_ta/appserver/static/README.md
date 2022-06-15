# Apica Splunk Data Input
## Overview

This is a Splunk modular input add-on for pulling Apica 'Web Performance' checks into Splunk for ease of indexing and analysis.
It creates a new, configurable, data input type for Splunk.
Using this input you can
* Quickly and easily configure Splunk inputs associated with Apica checks. This permits ease of use within Splunk when creating reports/searching etc.
* Tailor inputs to your specific needs e.g. set differing polling frequencies for groups of checks, configure per check access credentials for your pulls (useful if you have multi-tennant checks available in Apica)
* Set granular polling frequencies for individual checks so that you don't saturate you API endpoint


pull Apica check data into Splunk. In addition the


The inputs appears under the standard Sautomatically on the Splunk Manager > Data Inputs page as "Apica"


## Setup

1.	Install from the app manager page in Splunk using the provided spl. Settings >> Data Inputs >> Apica
a.	If you want to install directly from soure see the instructions outlined here:   http://docs.splunk.com/Documentation/Splunk/latest/AdvancedDev/ModInputsIntro
2.	Create a sourcetype specification in props.conf (on the indexer/search heads)) with the following stanza.
    [apica]
    KV_MODE=json
   	Note: if you don't want to avail of Splunks structured data capabilities when searching then you can skip this step. It doesn't impact the operation of the TA in terms of sourcing data from Apica.
3.	Create a new Apica check input using Data inputs >> Apica >> New

## Input Configuration
The following notable configuration options are provided:
* WPM check input name
* WPM check endpoint URL
* Check HTTP Operation/Method
* Authentication Type  and Credentials
* HTTP Proxy support
* Timeout configurations
For comprehensive information see the inline help on the input creation page.
After creating your input it will be listed under the Apica type in the splunk summary page e.g.

## Troubleshooting/Error Logging
All log entries are written to the splunkd.log; typically ($SPLUNK_HOME/var/log/splunk/splunkd.log)
In addition you should check that:
* Roundtrip NW access is available to the Apica API endpoint e.g. http://api-wpm.apicasystem.com/v3/
* You are using valid Apica credentials
* You have correct parameters in the Apica check call you have configured e.g. a valid check number etc.

