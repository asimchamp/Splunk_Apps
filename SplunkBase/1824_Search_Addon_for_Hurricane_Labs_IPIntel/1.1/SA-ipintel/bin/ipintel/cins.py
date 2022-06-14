from ipintel import get_lookup_table,is_ip_addr,lookup_dir

import csv
import os

def get_data(addr, *args, **kwargs):
    if is_ip_addr(addr):
        return get_data_ip(addr, *args, **kwargs)
    else:
        return {"cins_listed": "N/A"}

def get_data_ip(addr):
    filename = get_lookup_table("cins")["filename"]
    lookup = os.path.join(lookup_dir, filename)

    with open(lookup, "r") as f:
        c = csv.reader(f)
        fields = c.next()
        try:
            row = ( r for r in c if r[0] == addr ).next()
        except:
            return {"cins_listed": False}
        else:
            return {"cins_listed": True}
