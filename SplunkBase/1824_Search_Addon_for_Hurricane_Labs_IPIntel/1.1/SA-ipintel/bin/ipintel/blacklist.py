from ipintel import is_ip_addr

import socket
import time

IP_BLACKLISTS = [
    "bl.spamcop.net",
    "dnsbl.sorbs.net",
    "b.barracudacentral.org",
    "cbl.abuseat.org",
    "dnsbl-1.uceprotect.net",
    "pbl.spamhaus.org",
    "sbl.spamhaus.org"
    "virus.rbl.msrbl.net",
    "sbl-xbl.spamhaus.org",
    "phishing.rbl.msrbl.net",
    "tor.ahbl.org",
    "zen.spamhaus.org",
    "zombie.dnsbl.sorbs.net",
    "ipbl.zeustracker.abuse.ch",
]

DOMAIN_BLACKLISTS = [
    "abuse.rfc-ignorant.org",
    "bogusmx.rfc-ignorant.org",
    "dbl.spamhaus.org",
    "dsn.rfc-ignorant.org",
    "l1.apews.org",
    "list.anonwhois.net",
    "multi.surbl.org",
    "multi.uribl.com",
    "postmaster.rfc-ignorant.org",
    "rddn.dnsbl.net.au",
    "rhsbl.sorbs.net",
]

def get_data(addr, *args, **kwargs):
    parts = addr.split(".")
    if is_ip_addr(addr):
        parts.reverse()
        BLACKLISTS = IP_BLACKLISTS
    else:
        # This is very, very wrong
        if len(parts) > 2:
            parts = parts[-2:]
        BLACKLISTS = DOMAIN_BLACKLISTS

    d = list()

    for dnsbl in BLACKLISTS:
        fqdn = ".".join(parts[:] + [dnsbl])
        try:
            t1 = time.time()
            socket.gethostbyname_ex(fqdn)
        except socket.gaierror:
            t2 = time.time()
            listed = False
        else:
            t2 = time.time()
            listed = True
        d.append({
            "dnsbl": dnsbl,
            "listed": listed,
            "time": t2 - t1,
        })

    return d
