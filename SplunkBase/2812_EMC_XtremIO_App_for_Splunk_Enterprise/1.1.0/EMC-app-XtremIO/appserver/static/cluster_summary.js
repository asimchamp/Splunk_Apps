require.config({
    paths: {
        jquery_dx: '../app/EMC-app-XtremIO/lib/jquery_dx',
        clusterdetailview: '../app/EMC-app-XtremIO/components/clusterdetails/clusterdetailview'
    }
});
require([
    'jquery_dx',
    'clusterdetailview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'
], function($, clusterdetailview, SearchManager){

        new SearchManager({
            "id": "search20",
            "latest_time": "now",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": "-60m@m",
            "search": "| inputlookup XtremIOClustersLookup | search \"Cluster Name\"=$cluster$ | table \"Cluster Name\" ,\"XtremIO Server\",\"System Start Time\",\"XIOS Version\",Health, \"Overall Efficiency\",\"Data Reduction Ratio\",\"Dedup Ratio\",\"Compression Ratio\",\"Thin Provisioning Savings\",\"Physical Space In Use\",\"Logical Space In Use\",\"Total Capacity\"  ",
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        new clusterdetailview({
            "id": "element20",
            "managerid": "search20",
            "cluster_name": "-",
            "el": $('#summary')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
});
