from splunk.clilib import cli_common as common

import json
import os
import re
import time

tags = {
    "blacklist": "reputation",
    "iprep": "reptuation",
    "cins": "reputation",

    "location": "recon",
    "shodan": "recon",
    "virustotal_resolutions": "recon",
    "whois": "recon",
}

def make_splunk_event(data, sourcetype):
    event = dict()
    event.update(data)
    event["source"] = "ipintel"
    event["sourcetype"] = sourcetype
    if sourcetype in tags:
        event["tag::sourcetype"] = tags[sourcetype]
    event["_raw"] = json.dumps(data, encoding='latin1')
    event["_time"] = time.time()
    return event

def get_config(section, key):
    return common.getConfStanza("ipintel", section)[key]

def get_lookup_table(table_name):
    return common.getConfStanza("transforms", table_name)
lookup_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "lookups"))

is_ip_addr = lambda addr: True if re.match("^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", addr) else False
