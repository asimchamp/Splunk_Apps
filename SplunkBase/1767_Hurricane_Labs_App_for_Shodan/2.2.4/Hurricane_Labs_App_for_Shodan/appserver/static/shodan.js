require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, SearchManager) {

	var checkShodanJSON = mvc.Components.get("checkShodanJSON");
	var tokens = mvc.Components.get("submitted");

    var checkShodanJSON = new SearchManager({
        id: "checkShodanJSON",
        earliest_time: "-24h@h",
        latest_time: "now",
		autostart: "false",
        search: "| inputlookup shodan_my_subnets"
    });

    var baseSearch = new SearchManager({
        id: "baseSearch",
        earliest_time: "-24h@h",
        latest_time: "now",
		autostart: "false",
        search: "| inputlookup shodan_output | dedup ip_str,port | multikv fields asn, cpe, data, domains, hostnames, ip, ip_str, isp, link, location, org, os, port, product, hostnames | search ip_str=\"$_ip$\""
    }, { tokens : true});

	checkShodanJSON.startSearch();

	checkShodanJSON.on("search:done", function(props) {
		if(props.content.resultCount === 0) {
			$(document.body).find('#dashboard1').append('<div id="warning">You must add IPs to the lookup <a href="/app/Hurricane_Labs_App_for_Shodan/configure">here</a> before using this dashboard.</div>');
		} else {
			tokens.set('loaded', 'true');
			baseSearch.startSearch();
		}
	});

});
