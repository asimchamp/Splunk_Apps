
define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    "models/SplunkDBase",
    "util/splunkd_utils",
    "splunkjs/mvc/utils"
], function(
    _,
    Backbone,
    mvc,
    $,
    SimpleSplunkView,
    SplunkDBaseModel,
    splunkd_utils,
    mvc_utils
){
    return SimpleSplunkView.extend({
        className: "SetupView",
        
        /**
         * Save the app as configured so that the setup page doesn't keep showing.
         * 
         * See RTO-268.
         */
        setConfigured: function(){

            var app_config = new SplunkDBaseModel();

            $.when(app_config.fetch({
                url: splunkd_utils.fullpath('/servicesNS/nobody/system/apps/local/splunk_app_cef')
            })).done(function(){
                // Stop if the CEF app is already configured
                if (app_config.entry.content.get("configured")) {
                    console.info("App is already set as configured; no need to update it");
                    return;
                }

                // Set the CEF app as configured
                app_config.entry.content.set({
                    configured: true
                }, {
                    silent: true
                });

                // Kick off the request to edit the entry
                var save_promise = app_config.save();

                // Wire up a response to tell the user if this was a success
                if (save_promise) {

                    // If successful, note that this worked
                    save_promise.done(function (model, response, options) {
                        console.info("CEF app configuration was successfully updated");
                    }.bind(this))

                    // Otherwise, note a failure message
                    .fail(function (response) {
                        alert("CEF app was not configured successfully");
                    }.bind(this));
                }
            }.bind(this));
        },

        render: function () {
            this.$el.html('Setup is no longer required for the Splunk App for CEF' + 
                '<div style="margin-top: 16px">' + 
                '<a href="cef_output_list" class="btn btn-primary">Go to app</a>' + 
                '</div>'
            );
        }
    });
});