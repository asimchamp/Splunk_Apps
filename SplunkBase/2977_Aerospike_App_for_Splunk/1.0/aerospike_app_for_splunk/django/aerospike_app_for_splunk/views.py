from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

# Imports for the setup view
from .forms import SetupForm
from django.core.urlresolvers import reverse
from splunkdj.setup import config_required
from splunkdj.setup import create_setup_view_context

@render_to('aerospike_app_for_splunk:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from aerospike_app_for_splunk!",
        "app_name": "aerospike_app_for_splunk"
    }

@render_to('aerospike_app_for_splunk:historic.html')
@login_required
@config_required
def homepage(request):
    return {
        "message": "Hello World from splunk_app_for_aerospike!",
        "app_name": "aerospike_app_for_splunk"
    }
    

@render_to('aerospike_app_for_splunk:setup.html')
@login_required
def setup(request):
    return create_setup_view_context(
        request,
        SetupForm,  # The form class to use
        reverse('aerospike_app_for_splunk:home'))
               # Where to redirect the user after completing setup

