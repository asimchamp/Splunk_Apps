from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'mimosa.views.home', name='home'),
    url(r'^main/$', 'mimosa.views.main', name='main'),
    url(r'^pipeline/$', 'mimosa.views.pipeline', name='pipeline'),
    url(r'^searches$', 'mimosa.views.searches', name='searches'),
)