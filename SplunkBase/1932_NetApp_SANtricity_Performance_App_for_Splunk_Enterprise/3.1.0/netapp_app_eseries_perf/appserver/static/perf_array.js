require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});


require([
    'jquery_netapp',
    'underscore_utils',
    'splunkjs/mvc',
    'util/console',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, console) {

    var unsubmittedTokens = mvc.Components.get('default');

    var update_configuration_href = function() {
        var newArrayId = unsubmittedTokens.get('form.arrayId');
        var newHref = "/app/netapp_app_eseries_perf/config_array?form.arrayId=" + newArrayId;
        $('#config_volumes_performance').attr('href', newHref);
    };

    unsubmittedTokens.on('change:form.arrayId', update_configuration_href());

    // Call them here, too, to handle drilldown activity (set on first run).
    update_configuration_href();
});
