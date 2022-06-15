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
        var newController = unsubmittedTokens.get('form.controllerLabel');
        var newVolumeGroup = unsubmittedTokens.get('form.volumeGroup');
        var newHref = "/app/netapp_app_eseries_perf/perf_volumes?form.arrayId=" + newArrayId + "&form.controllerLabel=" + newController + "&form.volumeGroup=" + newVolumeGroup;
        $('#perf_drives_breadcrumb').attr('href', newHref);
    };

    unsubmittedTokens.on('change:form.arrayId', update_breadcrumb_href());

    var update_configuration_href = function() {
        var newArrayId = unsubmittedTokens.get('form.arrayId');
        var newController = unsubmittedTokens.get('form.controllerLabel');
        var newVolumeGroup = unsubmittedTokens.get('form.volumeGroup');
        var newHref = "/app/netapp_app_eseries_perf/config_volumes?form.arrayId=" + newArrayId + "&form.controllerLabel=" + newController + "&form.volumeGroup=" + newVolumeGroup;
        $('#perf_drives_configuration').attr('href', newHref);
    };

    unsubmittedTokens.on('change:form.arrayId', update_configuration_href());

    // Call them here, too, to handle drilldown activity (set on first run).
    update_breadcrumb_href();
    update_configuration_href();
});
