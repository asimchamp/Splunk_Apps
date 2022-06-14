from __future__ import absolute_import

from bulkwhois.cymru import BulkWhoisCymru
from bulkwhois.shadowserver import BulkWhoisShadowserver

from ipintel import is_ip_addr

import json
import pywhois
import re
import socket

def get_data(addr, *args, **kwargs):
    if is_ip_addr(addr):
        return get_data_ip(addr, *args, **kwargs)
    else:
        return get_data_domain(addr, *args, **kwargs)

def get_data_ip(addr, provider="shadow"):
    if provider == "shadow":
        whois = BulkWhoisShadowserver()
    elif provider == "cymru":
        whois = BulkWhoisCymru()
    else:
        return None
    return whois.lookup_ips([addr])[addr]

def get_data_domain(domain):
    whois = pywhois.whois(domain)
    d = dict([(a,getattr(whois, a)) for a in whois.attrs()])

    # get info on the IP it resolves to
    addr = socket.gethostbyname_ex(domain)[2][0]
    d.update(get_data_ip(addr))

    return d
