"use strict";

require(
    ["splunkjs/mvc/utils"],

    function(utils) {
        let app_name = utils.getCurrentApp();
        require.config({
            paths: {
                // $SPLUNK_HOME/etc/apps/SPLUNK_APP_NAME/appserver/static/javascript/views/custom_setup_view
                CustomSetupView: "../app/" + app_name + "/javascript/views/custom_setup_view",
            },
        })
    }
);


require([
    // Splunk Web Framework Provided files
    "backbone", // From the SplunkJS stack
    "jquery", // From the SplunkJS stack
    // Custom files
    "CustomSetupView",
], function(Backbone, jquery, CustomSetupView) {
    var setup_view = new CustomSetupView({
        // Sets the element that will be used for rendering
        el: jquery("#main_container"),
    });

    setup_view.render();
});
