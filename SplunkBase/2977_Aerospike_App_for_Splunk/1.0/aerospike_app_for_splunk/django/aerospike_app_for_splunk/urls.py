from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('', 
    url(r'^home/$', 'aerospike_app_for_splunk.views.homepage', name='homepage'), 
    url(r'^setup/$', 'aerospike_app_for_splunk.views.setup', name='setup'),
)
