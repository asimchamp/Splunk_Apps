from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
	url(r'^home/$', 'splunk6overview.views.home', name='home'),
	url(r'^page2/$', 'splunk6overview.views.page2', name='page2'),
	url(r'^page3/$', 'splunk6overview.views.page3', name='page3'),
	url(r'^setup/$', 'splunk6overview.views.setup', name='setup')
)