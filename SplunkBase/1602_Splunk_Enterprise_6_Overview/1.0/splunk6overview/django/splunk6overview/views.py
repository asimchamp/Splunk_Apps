from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from splunkdj.decorators.render import render_to
from splunkdj.setup import forms
from splunkdj.setup import config_required
from splunkdj.setup import create_setup_view_context
from splunkdj.setup import set_configured

states = [
	('All', 'All'),
    ('AK', 'Alaska'),
    ('AL', 'Alabama'),
    ('AZ', 'Arizona'),
    ('AR', 'Arkansas'),
    ('CA', 'California'),
    ('CO', 'Colorado'),
    ('CT', 'Connecticut'),
    ('DE', 'Delaware'),
    ('FL', 'Florida'),
    ('GA', 'Georgia'),
    ('HI', 'Hawaii'),
    ('ID', 'Idaho'),
    ('IL', 'Illinois'),
    ('IN', 'Indiana'),
    ('IA', 'Iowa'),
    ('KS', 'Kansas'),
    ('KY', 'Kentucky'),
    ('LA', 'Louisiana'),
    ('ME', 'Maine'),
    ('MD', 'Maryland'),
    ('MA', 'Massachusetts'),
    ('MI', 'Michigan'),
    ('MN', 'Minnesota'),
    ('MS', 'Mississippi'),
    ('MO', 'Missouri'),
    ('MT', 'Montana'),
    ('NE', 'Nebraska'),
    ('NV', 'Nevada'),
    ('NH', 'New Hampshire'),
    ('NJ', 'New Jersey'),
    ('NM', 'New Mexico'),
    ('NY', 'New York'),
    ('NC', 'North Carolina'),
    ('ND', 'North Dakota'),
    ('OH', 'Ohio'),
    ('OK', 'Oklahoma'),
    ('OR', 'Oregon'),
    ('PA', 'Pennsylvania'),
    ('RI', 'Rhode Island'),
    ('SC', 'South Carolina'),
    ('SD', 'South Dakota'),
    ('TN', 'Tennessee'),
    ('TX', 'Texas'),
    ('UT', 'Utah'),
    ('VT', 'Vermont'),
    ('VA', 'Virginia'),
    ('WA', 'Washington'),
    ('DC', 'Washington D.C.'),
    ('WV', 'West Virginia'),
    ('WI', 'Wisconsin'),
    ('WY', 'Wyoming')
]


def load_custom(request, form_cls, field):
	custom = request.service.confs['splunk6overview']['settings']['framework_state'] or ""
	return custom


def save_custom(request, form, field, value):
    value = value.strip(' ,')
    value = value.upper()
    request.service.confs['splunk6overview']['settings'].update(framework_state=value)


class AppSettingsForm(forms.Form):
    states = forms.CharField(
        label="State",
        load=load_custom,
        save=save_custom)


@render_to('splunk6overview:home.html')
@login_required
def home(request):
	return {
		"app_name": "splunk6overview"
	}


@render_to('splunk6overview:page2.html')
@login_required
def page2(request):
	return {
		"app_name": "splunk6overview"
	}

@render_to('splunk6overview:page3.html')
@login_required
@config_required
def page3(request):
	states = request.service.confs['splunk6overview']['settings']['framework_state'] or ''

	return {
		"app_name": "splunk6overview",
		"states": states
	}



@render_to('splunk6overview:setup.html')
@login_required
def setup(request):
    setup_view_context = create_setup_view_context(
        request,
        AppSettingsForm,
        reverse('splunk6overview:page3'))


    if request.method == 'GET':
        states_list = { "states": [[state[0], state[1]] for state in states[1:]] }
        setup_view_context.update(states_list)
    return setup_view_context
 
@login_required
def unconfigure(request):
    set_configured(request.service, False)
    
    return HttpResponseRedirect(reverse('splunk6overview:page3'))