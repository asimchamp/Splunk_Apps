// Translations for en_US
i18n_register({"catalog": {}, "plural": function(n) { return n == 1 ? 0 : 1; }});


require([
    'jquery',
    '/static/app/Roost/custom/tagcloud.js',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/Roost/ready!'
],function($, TagCloud, SearchManager, utils){

    new SearchManager({
        "name": 'customsearch1',
        "search": '``',
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "status_buckets": 0,
        "preview": true,
        "timeFormat": "%s.%Q",
        "wait": 0,
        "runOnSubmit": true
    });

    new TagCloud({
        name: 'custom1',
        managerid: 'customsearch1',
        labelField: 'OriginStateName',
        el: $('#custom')
    }).render();

});
