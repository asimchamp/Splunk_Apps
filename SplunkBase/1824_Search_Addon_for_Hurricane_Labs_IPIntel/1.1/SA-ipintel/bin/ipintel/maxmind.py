from ipintel import get_config,is_ip_addr

from geopy.geocoders import GoogleV3
from pywhois.whois import NICClient

import csv
import re
import requests

MAXMIND_FIELDS = [
    'country_code',
    'country_name',
    'region_code',
    'region_name',
    'city_name',
    'latitude',
    'longitude',
    'metro_code',
    'area_code',
    'time_zone',
    'continent_code',
    'postal_code',
    'isp_name',
    'organization_name',
    'domain',
    'as_number',
    'netspeed',
    'user_type',
    'accuracy_radius',
    'country_confidence',
    'city_confidence',
    'region_confidence',
    'postal_confidence', 
    'error',
]

def get_data(addr, *args, **kwargs):
    if is_ip_addr(addr):
        return get_data_ip(addr, *args, **kwargs)
    else:
        return get_data_domain(addr, *args, **kwargs)

def get_data_ip(addr):
    license = get_config("maxmind", "license")

    payload = {"l": license, "i": addr}
    response = requests.get("http://geoip.maxmind.com/e", params=payload)

    values = csv.reader(response.content.split("\n")).next()
    data = dict(zip(MAXMIND_FIELDS, values))

    if data["error"] != "":
        raise Exception(data["error"])
    return data

def get_data_domain(domain):
    import socket
    addr = socket.gethostbyname_ex(domain)[2][0]
    return get_data_ip(addr)

    # Return some data so it LOOKS like we got geo information
    nic_client = NICClient()
    text = nic_client.whois_lookup(None, domain, 0)
    d = dict()

    try:
        d["city_name"] = re.search("^Registrant City: (.+)", text, flags=re.M).groups()[0]
    except:
        d["city_name"] = "Not available"
    try:
        d["region_name"] = re.search("^Registrant State/Province: (.+)", text, flags=re.M).groups()[0]
    except:
        d["region_name"] = "Not available"
    try:
        d["country_name"] = re.search("^Registrant Country: (.+)", text, flags=re.M).groups()[0]
    except:
        d["country_name"] = "Not available"

    try:
        geocoder = GoogleV3()
        _, (lat, lon) = geocoder.geocode("{city_name}, {region_name} {country_name}".format(**d))

        payload = {"formatted": "true", "lat": lat, "lng": lon, "username": "mcmasterathl", "style": "full"}
        response = requests.get("http://api.geonames.org/timezoneJSON", params=payload)
        d["time_zone"] = response.json()["timezoneId"]
    except:
        d["time_zone"] = "Not available"

    return d
