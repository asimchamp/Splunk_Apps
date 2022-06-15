require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp'
    }
});

require(['jquery_netapp', 'splunkjs/mvc/simplexml/ready!'], function ($) {
	$(document).ready(function () {
		var SearchManager = require('splunkjs/mvc/searchmanager');
		
		var searchString = '| rest /services/apps/local | where title="TA-netapp_eseries" | rename version as ta_version | append [ search index=eseries sourcetype=eseries:webproxy version=* | head 1 | rex field=version "^0?\\.?\\d?(?<first_octate>\\d+?)\\.?\\d?(?<second_octate>\\d?)0?\\..*$" | eval proxy_version=first_octate.".".second_octate | eval proxy_version =case(proxy_version == 1.0,1.1,proxy_version >= 2.0,">= 2.0",1==1,proxy_version) | table proxy_version ] | stats values(ta_version) as ta_version values(proxy_version) as proxy_version | join type=left ta_version [ | inputlookup nesa_compatibility_matrix | rename TAVersion as ta_version | table ta_version WebProxyVersion ]  | table ta_version proxy_version WebProxyVersion'

		var mySearchManager = new SearchManager({
				id : "cacheSearch",
				earliest_time : "-24h",
				latest_time : "now",
				autostart : true,
				search : searchString,
				preview : true,
				cache : false
			});

		var sendFlag=false;
		var myResults = mySearchManager.data("results"); // get the data from that search
		myResults.on("data", function () {
			resultArray = myResults.data().rows;
			$.each(resultArray, function (index, value) {
				var TAVer=value[0];
				var PVer=value[1];
				var RPVer=value[2];
				if(!sendFlag)
				{
					var uri = Splunk.util.make_url('custom', 'netapp_app_eseries_perf', 'test_version_compatibility', 'check_compatiblity');
					$.ajax({
						type : "POST",
						url : uri,
						data : {
							TAVersion : TAVer,
							ProxyVersion : PVer
						},
						beforeSend : function (x) {
						
							if (x && x.overrideMimeType) {
								x.overrideMimeType("application/j-son;charset=UTF-8");
							}
						},
						success : function (rsp) {
							if (rsp == "Current version of TA is not compatible with web proxy. Please check Compatibility Matrix on this page") {
								$("#compatibility").show();
							} else {
								$("#compatibility").hide();
							}
						}
					});
					var msg = "<b>Current Technology Add-on Version : "+TAVer+" </b><br />"+
					"<b>Current Web Proxy Version : "+PVer+" </b><br />"+
					"<b>Recommended Web Proxy Versions :  "+RPVer+" </b>"
					$('#div_version').html(msg);
					sendFlag=true;
				}
			});
		});
	});
});
