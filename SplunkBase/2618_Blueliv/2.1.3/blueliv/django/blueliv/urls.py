from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'blueliv.views.home', name='home'), 
    url(r'^overview/$', 'blueliv.views.overview', name='overview'), 
    url(r'^botnets/$', 'blueliv.views.botnets', name='botnets'),
    url(r'^crimeservers_search/$', 'blueliv.views.crimeservers_search', name='crimeservers_search'),
    url(r'^attacks/$', 'blueliv.views.attacks', name='attacks'),
    url(r'^malwares/$', 'blueliv.views.malwares', name='malwares'),
    url(r'^hacktivism/$', 'blueliv.views.hacktivism', name='hacktivism'),
    url(r'^setup/$', 'blueliv.views.setup', name='setup')
)
