require.config({
    paths: {
        jquery_dx: '../app/EMC-app-XtremIO/lib/jquery_dx',
        volumedetailview: '../app/EMC-app-XtremIO/components/volumedetails/volumedetailview'
    }
});
require([
    'jquery_dx',
    'volumedetailview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'
], function($, volumedetailview, SearchManager){

        new SearchManager({
            "id": "search20",
            "latest_time": "now",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": "-60m@m",
            "search": "| inputlookup XtremIOVolumesLookup | search \"Cluster Name\"=$cluster$ \"Volume Name\" =$volume$|table \"Volume Name\",\"Creation Timestamp\" ,\"Total Snapshots\",\"Total Lun Mappings\",\"Logical Block Size\",\"Logical Space Used\", \"Volume Size\"  ",
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        new volumedetailview({
            "id": "element20",
            "managerid": "search20",
            "el": $('#summary')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
    
});
