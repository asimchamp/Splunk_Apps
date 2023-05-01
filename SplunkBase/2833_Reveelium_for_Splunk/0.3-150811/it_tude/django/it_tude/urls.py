from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
	url(r'^itt_gui/$', 'it_tude.views.itt_gui', name='itt_gui'), 
	url(r'^api_settings/$', 'it_tude.views.api_settings', name='api_settings'),
	url(r'^logs_settings/$', 'it_tude.views.logs_settings', name='logs_settings'),
	url(r'^add_sourcetype/$', 'it_tude.views.add_sourcetype', name='add_sourcetype'),
	url(r'^edit_sourcetype/(?P<log_type>\w+)/(?P<source_id>\d+)/$', 'it_tude.views.edit_sourcetype', name='edit_sourcetype'),
	url(r'^delete_sourcetype/(?P<log_type>\w+)/(?P<source_id>\d+)/$', 'it_tude.views.delete_sourcetype', name='delete_sourcetype'),

)
