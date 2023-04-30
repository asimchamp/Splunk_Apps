from ipintel import is_ip_addr
from safebrowsinglookup import SafebrowsinglookupClient as Client

def get_data(addr, *args, **kwargs):
    if is_ip_addr(addr):
        return None
    else:
        return get_data_domain(addr, *args, **kwargs)

def get_data_domain(domain):
    url = "http://{}/".format(domain)

    client = Client("")
    status = client.lookup(url)[url]
    if status == "error": status = "no data"
    return {"safebrowsing": status}
