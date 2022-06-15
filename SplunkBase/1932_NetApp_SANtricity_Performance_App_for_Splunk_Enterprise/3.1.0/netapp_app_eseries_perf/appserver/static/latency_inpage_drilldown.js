require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});

require(['jquery_netapp','underscore_utils','splunkjs/mvc','util/console','splunkjs/mvc/simplexml/ready!'], function($, _, mvc, console){
    // Get a reference to the dashboard panels
    var dashboardReadTable = mvc.Components.get('readTable');
    var dashboardWriteTable = mvc.Components.get('writeTable');
    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');

    dashboardReadTable.on('click', function(e) {
        e.preventDefault();
        var readArrayId = e.data['row.host'];
        var readControllerLabel = e.data['row.Controller Label'];
        var readVolumeGroup = e.data['row.Volume Groups/Pools'];

        // Set the value for the $readVolumeGroup$ token
        unsubmittedTokens.set('readArrayId', readArrayId);
        submittedTokens.set('readArrayId', readArrayId);
        unsubmittedTokens.set('readControllerLabel', readControllerLabel);
        submittedTokens.set('readControllerLabel', readControllerLabel);
        unsubmittedTokens.set('readVolumeGroup', readVolumeGroup);
        submittedTokens.set('readVolumeGroup', readVolumeGroup);
    });

    dashboardWriteTable.on('click', function(e) {
        e.preventDefault();
        var writeArrayId = e.data['row.host'];
        var writeControllerLabel = e.data['row.Controller Label'];
        var writeVolumeGroup = e.data['row.Volume Groups/Pools'];

        // Set the value for the $writeVolumeGroup$ token
        unsubmittedTokens.set('writeArrayId', writeArrayId);
        submittedTokens.set('writeArrayId', writeArrayId);
        unsubmittedTokens.set('writeControllerLabel', writeControllerLabel);
        submittedTokens.set('writeControllerLabel', writeControllerLabel);
        unsubmittedTokens.set('writeVolumeGroup', writeVolumeGroup);
        submittedTokens.set('writeVolumeGroup', writeVolumeGroup);
    });
});
