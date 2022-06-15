from ipintel import get_lookup_table,is_ip_addr,lookup_dir

import csv
import os

def get_data(addr):
    if is_ip_addr(addr):
        filename = get_lookup_table("emergingthreats_iprepdata")["filename"]
    else:
        filename = get_lookup_table("emergingthreats_domainrepdata")["filename"]
        if addr[0] != ".":
            addr = ".{}".format(addr)
    lookup = os.path.join(lookup_dir, filename)

    with open(lookup, "r") as f:
        c = csv.reader(f)
        fields = [ f.lower() for f in c.next() ]
        try:
            row = ( r for r in c if r[0] == addr ).next()
        except:
            return None

    d = dict(zip(fields, row))
    cat_id = d["category"]

    filename = get_lookup_table("emergingthreats_categories")["filename"]
    lookup = os.path.join(lookup_dir, filename)

    with open(lookup, "r") as f:
        c = csv.DictReader(f)
        try:
            cat = ( r for r in c if r["category_id"] == cat_id ).next()
        except:
            pass
        else:
            d["category"] = cat["category_full"]

    return d
