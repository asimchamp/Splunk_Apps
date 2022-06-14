define([
    "jquery",
    "underscore",
    "backbone",
    "splunkjs/mvc/simplesplunkview",
    "splunkjs/mvc"
], function(
    $,
    _,
    Backbone,
    SimpleSplunkView,
    mvc
){
    return SimpleSplunkView.extend({
        className: "view_name",

        // Set options for the visualization
        options: {
            data: "preview",  // The data results model from a search
            foo: "bar"
        },

        // Override this method to configure the view
        createView: function() {
            // TODO: Create a visualization
            return viz;
        },

        // Override this method to format the data for the view
        formatData: function(data) {
            // TODO: Format the data
            return data;
        },

        // Override this method to put the formatted Splunk data into the view
        updateView: function(viz, data) {
            // TODO: Display the data in the view
        }
    });
});