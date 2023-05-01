define(function(require, exports, module) {

    var d3 = require("../d3/d3");
    var _ = require("underscore");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    var TreeMap= SimpleSplunkView.extend({
        className: "splunk-toolkit-treemap",
        options: {
            "managerid": null,
            "data": "preview",
            "height": "400",
            "width": "600",
            "is_numeric": [],
            "levels": [],
            "color_field": {"scale": "d3plus"},
            "size_field": "count",
            "time_field": "",
            "tooltip_data": {"children": true},
            "ui" : true,
            "aggs" : false
        },
        output_mode: "json",

        initialize: function() {
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            $(window).resize(this, _.debounce(this._handleResize, 20));
        },
        _handleResize: function(e) {
            // e.data is the this pointer passed to the callback.
            // here it refers to this object and we call render()
            e.data.render();
        },

        // createView takes no arguments
        // it creates the view we need
        // then returns the visualization as the first
        // arugment (named 'viz') to updateView, below
        createView: function() {

            // this gets rid of the "waiting for data message"
            // and assures us that we have a clean slate
            this.$el.html("");

            // get the height and width from the options
            // and set the div container to that size
            var height = this.settings.get("height");
            var width= this.settings.get("width");
            this.$el.height(height); 
            this.$el.width(width);

            // get the div id, adding a # to reference the fact
            // that it is going to be an id when referencedd
            var divId = "#" + this.$el.attr("id");

            // create a container for the viz inside this container
            // so that it can have space to add timeline, color spectrum, etc.
           
            $(divId).append('<div id="viz_container"></div>');

            // get the levels list and size_field
            var levels = this.settings.get("levels");
            var size_field = this.settings.get("size_field");
            var time_field = this.settings.get("time_field");
            var color_field = this.settings.get("color_field");
            var ui = this.settings.get("ui");
            var tooltip_data = this.settings.get("tooltip_data");
            var aggs = this.settings.get("aggs");

            // this is where we create the actual visualization
            // but we haven't attached the data to it yet
            var visualization = d3plus.viz()
              .container("#viz_container")
              .type("tree_map")
              .id(levels)
              .size(size_field)
              .ui(ui)
              .tooltip(tooltip_data)
              .time(time_field)
              .color(color_field);
        
            // add the aggregators if they're defined
            if(aggs){visualization.aggs(aggs)}

            return visualization;
        },

        // Making the data look how we want it to for updateView to do its job
        // it becomes the second arugment ('data') for updateView
        formatData: function(data) {
          var numeric_fields= this.settings.get("is_numeric");

          // Convert the string value to number
          data = _(data).map(function(f){
            for (var i=0; i<numeric_fields.length; i++){
                f[numeric_fields[i]] = parseInt(f[numeric_fields[i]]);
                }
            return f;
          });
          return data;
        },

        // this is the final step
        // where the data actually meets the visualization
        // in this case, our visualization from createView is viz
        // and our data from formatData is data
        updateView: function(viz, data) {

          // d3plus has a data and a draw method
          // that we are using to finalize our visualization
          viz
            .data(data)
            .draw()
        }
    });
    return TreeMap;
});
