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

    var update_breadcrumb_href = function() {
        var newArrayId = unsubmittedTokens.get('form.arrayId');
        var newHref = "/app/netapp_app_eseries_perf/config_array?form.arrayId=" + newArrayId;
        $('#config_vgroups_breadcrumb').attr('href', newHref);
    };

    unsubmittedTokens.on('change:form.arrayId', update_breadcrumb_href());

    var update_performance_href = function() {
        var newArrayId = unsubmittedTokens.get('form.arrayId');
        var newController = unsubmittedTokens.get('form.controllerLabel');
        var newVolumeGroup = unsubmittedTokens.get('form.volumeGroup');
        var newHref = "/app/netapp_app_eseries_perf/perf_volumes?form.arrayId=" + newArrayId + "&form.controllerLabel=" + newController + "&form.volumeGroup=" + newVolumeGroup;
        $('#config_vgroups_performance').attr('href', newHref);
    };

    unsubmittedTokens.on('change:form.arrayId', update_performance_href());

    // Call them here, too, to handle drilldown activity (set on first run).
    update_breadcrumb_href();
    update_performance_href();
});
