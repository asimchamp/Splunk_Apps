from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^filter_conf/$', 'TrendMicroDeepDiscovery.views.filter_conf', name='filter_conf'),
    url(r'^watchlist_conf/$', 'TrendMicroDeepDiscovery.views.watchlist_conf', name='watchlist_conf'),
    url(r'^investigation/$', 'TrendMicroDeepDiscovery.views.investigation', name='investigation'),
    url(r'^webAccessLogCorrelation/$', 'TrendMicroDeepDiscovery.views.proxyLogCorrelation', name='proxyLogCorrelation'),
    url(r'^webAccessLogCorrelation/setFilter/$', 'TrendMicroDeepDiscovery.views.setFilter', name='setFilter'),
    url(r'^licensing/$', 'TrendMicroDeepDiscovery.views.licensing', name='licensing')
)
