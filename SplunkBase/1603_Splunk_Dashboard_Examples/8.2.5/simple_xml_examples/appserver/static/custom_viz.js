// XXX: This file is never run. I'm serious. I don't know why it's here. It's
// actually a good example of how to load a custom viz (TagCloud) into an
// existing JS file rather than how custom_viz_tag_cloud.xml does it, which
// loads it via `<viz type="simple_xml_examples.tagcloud">`...
requirejs([
    '../app/simple_xml_examples/libs/jquery-3.6.0-umd-min',
    // This is the built-by-webpack AMD module. Note that `tagcloud/src/` is ESM
    '../app/simple_xml_examples/visualizations/tagcloud/visualization',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
], function($, TagCloud, SearchManager, utils) {
    new SearchManager({
        'id': 'customsearch1',
        'search': 'index=_internal source=*metrics.log group=pipeline | stats max(cpu_seconds) as cpu_seconds by processor',
        'earliest_time': '-24h',
        'latest_time': 'now',
        'app': utils.getCurrentApp(),
        'auto_cancel': 90,
        'status_buckets': 0,
        'preview': true,
        'timeFormat': '%s.%Q',
        'wait': 0,
        'runOnSubmit': true
    });
    new TagCloud({
        id: 'custom1',
        managerid: 'customsearch1',
        labelField: 'processor',
        valueField: 'cpu_seconds',
        el: $('#custom')
    }).render();
});