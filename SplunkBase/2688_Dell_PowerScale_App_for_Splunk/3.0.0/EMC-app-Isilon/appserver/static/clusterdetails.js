require(["splunkjs/mvc/utils"], function (SplunkUtil) {
    var app_name = SplunkUtil.getCurrentApp();  
    require.config({
        paths: {
            'jquery_isilon': '../app/' + app_name + '/js/jquery_isilon',
            'underscore_utils': '../app/' + app_name + '/js/underscore-min'
        }
});

require([
	'underscore_utils',
	'jquery_isilon',
	'splunkjs/mvc',
	'splunkjs/mvc/searchmanager',
	'splunkjs/mvc/postprocessmanager',
	'app/EMC-app-Isilon/components/clusterdetails/clusterdetailsview',
	'splunkjs/mvc/simplexml/ready!',
	'splunkjs/ready!'
], function(_,$,
	mvc,
	SearchManager,
	PostProcessManager,
	clusterdetailsview
	){
        // The splunkjs/ready loader script will automatically instantiate all elements
        // declared in the dashboard's HTML.

        var summarySearch = new SearchManager({
            id: "summarySearch",
            "latest_time": mvc.tokenSafe("$time.latest$"),
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": mvc.tokenSafe("$time.earliest$"),
            preview: true,
            cache: true,
            search: mvc.tokenSafe("| savedsearch EMC-Isilon-Cluster-Summary | search Cluster_Name = $cluster$ | fields - Cluster_Name"),
            "auto_cancel": 90,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});
	
        var summaryElement = new clusterdetailsview({
            "id": "summaryElement",
            "managerid": "summarySearch",
            "el": $('#summary'),
            "viewShow": "keyvalue",
            "lnk": ""
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        var versionSearch = new SearchManager({
            id: "versionSearch",
            "latest_time": mvc.tokenSafe("$time.latest$"),
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": mvc.tokenSafe("$time.earliest$"),
            preview: true,
            cache: true,
            search: mvc.tokenSafe("| `get_cluster_version_details($cluster$)`"),
            "auto_cancel": 90,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});


        var versionElement = new clusterdetailsview({
            "id": "versionElement",
            "managerid": "versionSearch",
            "el": $('#versiondetails'),
            "viewShow": "keyvalue",
            "lnk": ""
        }, {tokens: true, tokenNamespace: "submitted"}).render();
});
});
