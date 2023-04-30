from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'sentry_ta_exampleApp.views.home', name='home'), 
    url(r'^examplePage/$', 'sentry_ta_exampleApp.views.examplePage', name='examplePage'), 
)
