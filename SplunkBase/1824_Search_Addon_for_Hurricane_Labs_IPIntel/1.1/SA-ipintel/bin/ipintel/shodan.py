from __future__ import absolute_import

from shodan import WebAPI
from ipintel import get_config,is_ip_addr

import socket

def get_data(addr):
    apikey = get_config("shodan", "api_key")
    try:
        api = WebAPI(apikey)
        if is_ip_addr(addr):
            banners = api.host(addr)["data"]
        else:
            ip = socket.gethostbyname_ex(addr)[2][0]
            banners = api.host(ip)["data"]
    except:
        return []
    return banners
