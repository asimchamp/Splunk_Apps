import sys
from os import path
sys.path.append(path.dirname( path.dirname( path.abspath(__file__) ) ) )

import cloudpassage
import datetime
import re


def halo_session(api_key, secret_key, **kwargs):
    session = cloudpassage.HaloSession(api_key, secret_key,
                                       api_host=kwargs["api_host"],
                                       api_port=443)

    api = cloudpassage.HttpHelper(session)
    try:
        api.get('/v1/servers?per_page=1')
    except Exception as e :
        raise Exception, e
    return True

def validate_time(date):
    """validate time"""
    iso_regex = "\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{4})?)?$"
    m = re.match(iso_regex, date)
    try:
        filter(None, re.match(iso_regex, date).groups())
    except AttributeError as e:
        raise ValueError(date + " is not in iso8601 time format")

def validate_time_range(date):
    """validate time range"""
    date_parsed = None
    time_range = datetime.datetime.now() - datetime.timedelta(days=90)
    try:
        date_parsed = datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ" )
    except:
        date_parsed = datetime.datetime.strptime(date, '%Y-%m-%d')

    if date_parsed < time_range:
        raise ValueError(date + " is out of 90 days data retention range")

def optional_proxy_values(proxy_host, proxy_port):
    if (proxy_host == 'None') or (proxy_port == 'None'):
        return False
    elif (proxy_host is None) or (proxy_port is None):
        return False
    else:
        return True

def startdate(date):
    validate_time(date)
    validate_time_range(date)
    return True

def page_size(per_page):
    """validate per_page range"""
    min_per_page = 1
    max_per_page = 500
    allowed_range = range(min_per_page, max_per_page + 1)

    if int(per_page) not in allowed_range:
        raise ValueError("%s is invalid. Size must be between %s and %s" % (per_page,
                                                                            min_per_page,
                                                                            max_per_page))
