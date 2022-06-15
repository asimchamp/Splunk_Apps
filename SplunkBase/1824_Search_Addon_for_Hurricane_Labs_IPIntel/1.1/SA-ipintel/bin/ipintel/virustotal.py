from ipintel import get_config,is_ip_addr

import requests

def get_data(addr, *args, **kwargs):
    if is_ip_addr(addr):
        return get_data_ip(addr, *args, **kwargs)
    else:
        return get_data_domain(addr, *args, **kwargs)

def normalize(resolution):
    d = {"last_resolved": resolution["last_resolved"]}
    if "ip_address" in resolution:
        d["addresss"] = resolution["ip_address"]
    elif "hostname" in resolution:
        d["address"] = resolution["hostname"]
    else:
        # Don't modify it
        return resolution
    return d

def get_data_ip(addr):
    apikey = get_config("virustotal", "api_key")
    payload = {"ip": addr, "apikey": apikey}
    data = requests.get("https://www.virustotal.com/vtapi/v2/ip-address/report", params=payload).json()
    d = dict()
    for k in ("resolutions", "detected_urls"):
        if k == "resolutions" and k in data:
            d[k] = map(normalize, data[k])
        else:
            d[k] = data[k] if k in data else []
    return d

def get_data_domain(domain):
    apikey = get_config("virustotal", "api_key")
    payload = {"domain": domain, "apikey": apikey}
    data = requests.get("https://www.virustotal.com/vtapi/v2/domain/report", params=payload).json()
    d = dict()
    for k in ("resolutions", "detected_urls"):
        if k == "resolutions" and k in data:
            d[k] = map(normalize, data[k])
        else:
            d[k] = data[k] if k in data else []
    return d
