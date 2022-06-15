require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'app/splunk_dell_firewalls/tagcloud',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, TagCloud, SearchManager, utils){

    new SearchManager({
        "id": 'customsearch1',
        "search": 'index=sonicwall tid=257 | top limit=20 app_name',
        "earliest_time": "-12h",
        "latest_time": "now",
        "app": utils.getCurrentApp(),
        "auto_cancel": 120,
        "status_buckets": 0,
        "preview": true,
        "timeFormat": "%s.%Q",
        "wait": 0,
        "runOnSubmit": true
    });

    new TagCloud({
        id: 'custom1',
        managerid: 'customsearch1',
        labelField: 'app_name',
        valueField: 'count',
        el: $('#custom')
    }).render();

});
