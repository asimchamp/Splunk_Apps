require(['jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/multiselectview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'], 
    function($, _, mvc, MultiSelectView,SearchManager){

        //Instantiate our multi select view
        multiSelect = new MultiSelectView({
            "id": "multi_value_input",
            "value": "$submitted:multiToken$",
            "el": $('#multi_value_input'),
            "labelField": "app_name",
            "valueField": "app_name",
            "managerid": "multiSearch"
        }, {tokens: true}).render();

        //Run the search the multi select is looking for
        var multiSearch = new SearchManager({
            "id": "multiSearch",
            "earliest_time": "-30m",
            "status_buckets": 0,
            "search": "index=sonicwall tid=262 | url_decode | chart county by url_process_function",
            "cancelOnUnload": true,
            "latest_time": "now",
            "auto_cancel": 90,
            "preview": true
        }, {tokens: true});
    }
);
