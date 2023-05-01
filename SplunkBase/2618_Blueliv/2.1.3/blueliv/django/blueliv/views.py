from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

import os
try:
    import configparser as ConfigParser
except:
    import ConfigParser

APP_NAME = 'blueliv'
CONFIG_FILE = 'blueliv.cfg'
CONFIG_DIR = os.path.join(os.environ['SPLUNK_HOME'], 'etc', 'apps', APP_NAME, 'bin',CONFIG_FILE)


def get_api_access_type():
    config = ConfigParser.RawConfigParser(allow_no_value=True)
    access_type = 'FREE'
    try:
        config.read(CONFIG_DIR)
        if config.has_section('API') and config.has_option('API','type'):
            access_type = config.get('API', 'type')
    except:
        access_type = 'FREE'
    
    return access_type

@render_to('blueliv:home.html')
@login_required
def home(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }

@render_to('blueliv:overview.html')
@login_required
def overview(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }

@render_to('blueliv:botnets.html')
@login_required
def botnets(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }

@render_to('blueliv:crimeservers_search.html')
@login_required
def crimeservers_search(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }

@render_to('blueliv:hacktivism.html')
@login_required
def hacktivism(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }

@render_to('blueliv:attacks.html')
@login_required
def attacks(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }

@render_to('blueliv:malwares.html')
@login_required
def malwares(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }

@render_to('blueliv:setup.html')
@login_required
def setup(request):
    return {
        "message": get_api_access_type(),
        "app_name": APP_NAME
    }