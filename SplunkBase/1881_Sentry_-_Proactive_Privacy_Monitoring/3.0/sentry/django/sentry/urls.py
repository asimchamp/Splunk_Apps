from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'sentry.views.home', name='home'),
    url(r'^analytic/commonality/$', 'sentry.views.commonality', name='commonality'),
    url(r'^analytic/cust_demo/$', 'sentry.views.cust_demo', name='cust_demo'),
    url(r'^analytic/non_employee/$', 'sentry.views.non_employee', name='non_employee'),
    url(r'^relation/personal/$', 'sentry.views.personal', name='personal'),
    url(r'^relation/physical/$', 'sentry.views.physical', name='physical'),
    url(r'^relation/organizational/$', 'sentry.views.organizational', name='organizational'),
    url(r'^triage/$', 'sentry.views.triage', name='triage'),
    url(r'^lookup/$', 'sentry.views.lookup', name='lookup'),
    url(r'^diagnostic/$', 'sentry.views.diagnostic', name='diagnostic'),
    url(r'^redacted/$', 'sentry.views.redacted', name='redacted'),
    url(r'^search/$', 'sentry.views.search', name='search'),
)
