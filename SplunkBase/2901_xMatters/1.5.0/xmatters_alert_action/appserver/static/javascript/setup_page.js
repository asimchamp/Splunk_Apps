"use strict";

var app_name = "xmatters_alert_action";

require.config({
    paths: {
        // $SPLUNK_HOME/etc/apps/SPLUNK_APP_NAME/appserver/static/javascript/views/setup_view
        SetupView: "../app/" + app_name + "/javascript/views/setup_view",
    },
});

require([
    // Splunk Web Framework Provided files
    "backbone", // From the SplunkJS stack
    "jquery", // From the SplunkJS stack
    // Custom files
    "SetupView",
], function(Backbone, jquery, SetupView) {
    var setup_view = new SetupView({
        // Sets the element that will be used for rendering
        el: jquery("#main_container"),
    });

    setup_view.render();
});
