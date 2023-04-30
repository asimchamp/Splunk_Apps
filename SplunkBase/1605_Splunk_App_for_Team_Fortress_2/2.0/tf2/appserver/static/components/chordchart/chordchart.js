// d3 code taken and modified from http://bost.ocks.org/mike/uberdata/ by Mike Bostock

define(function(require, exports, module) {
    var _ = require('underscore');
    var d3 = require("../d3/d3");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    require("css!./chordchart.css");

    var ChordChart = SimpleSplunkView.extend({
        className: "splunk-toolkit-chord-chart",
        options: {
            "managerid": null,
            "data": "preview",
            "src_field": "from",
            "dst_field": "to",
            "count_field": "count",
            // This will be an array that contains the src name and color in hexadecimal
            // It'll be converted to HTML format colors (like #ff0000) and used extensively used in updateView
            // If this isn't defined then each src will be set to a random color
            // {Belgium: 0x3e2f12, France: 0x4d3d00, ...}
            "src_colors": {},
            "width": 720,
            "height": 720
        },
        output_mode: "json",
        initialize: function() {
            _.extend(this.options, {
                // Used internally for knowing the order of the src values
                src_order: []
            });

            SimpleSplunkView.prototype.initialize.apply(this, arguments);
            // What does this do?
            //this.settings.enablePush("value");
            // in the case that any options are changed, it will dynamically update
            // without having to refresh. copy the following line for whichever field
            // you'd like dynamic updating on
            this.settings.on("change:src_field",   this.render, this);
            this.settings.on("change:dst_field",   this.render, this);
            this.settings.on("change:count_field", this.render, this);
            // Set up resize callback. The first argument is a this
            // pointer which gets passed into the callback event
            //$(window).resize(this, _.debounce(this._handleResize, 20));
        },
        //_handleResize: function(e) {
        //    // e.data is the this pointer passed to the callback.
        //    // here it refers to this object and we call render()
        //    e.data.render();
        //},
        createView: function() {
            //debugger
            return true;
			
            /*var margin = {top: 0, right: 0, bottom: 0, left: 0};
            var availableWidth = parseInt(this.settings.get("width") || this.$el.width());
            var availableHeight = parseInt(this.settings.get("height") || this.$el.height());

            this.$el.html("");
			
            var svg = d3.select(this.el)
                .append("svg")
                .attr("width", availableWidth)
                .attr("height", availableHeight)
                .attr("pointer-events", "all");
                
            // The returned object gets passed to updateView as viz
            return { container: this.$el, svg: svg, margin: margin };*/
        },
        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var that = this;
            // getting settings
            var src_field   = that.settings.get('src_field');
            var dst_field   = that.settings.get('dst_field');
            var count_field = that.settings.get('count_field');

            var total = _.pluck(data, "count").reduce(function(memo, value) {
                return memo + parseInt(value, 10);
            }, 0);

            var src_order = _.chain(data)
                .map(function(row) {
                    return [row[src_field], row[dst_field]];
                })
                .flatten()
                .uniq()
                .value();

            that.options.src_order = src_order;

            var all_combinations = _.chain(src_order)
                .map(function(src) {
                    // If a src color isn't set from Simple XML then assign a random color
                    if(!_.has(that.options.src_colors, src)) {
                        that.options.src_colors[src] = '#' + Math.random().toString(16).substring(2, 8);
                    }

                    return _.map(src_order, function(dst) {
                        var combination = {};
                        combination[src_field]   = src;
                        combination[dst_field]   = dst;
                        combination[count_field] = "0";
                        return combination;
                    });
                })
                .flatten()
                .value();

            that.trigger("colors_ready");

            var all_data = _.map(all_combinations, function(row) {
                var found_row = _.findWhere(data, _.pick(row, src_field, dst_field));
                return found_row === undefined ? row : found_row;
            });

            formatted_data = _.chain(all_data)
                .groupBy(src_field)
                .map(function(dst, src) {
                    return _.map(dst, function(v) {
                        return parseInt(v[count_field], 10) / total;
                    });
                })
                .value();

            return formatted_data; // this is passed into updateView as 'data'
        },
        updateView: function(viz, data) {
            var that = this;
			debugger;

            var margin = {top: 0, right: 0, bottom: 0, left: 0};
            var width  = parseInt(this.settings.get("width")  || that.$el.width(), 10);
            var height = parseInt(this.settings.get("height") || that.$el.height(), 10);

            // clearing all prior junk from the view (eg. 'waiting for data...')
            that.$el.html("");

            var mysvg = d3.select(that.el)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("pointer-events", "all");

            var src_colors = that.options.src_colors;
            var src_order  = that.options.src_order;

            var outerRadius = Math.min(width, height) / 2 - 10;
            var innerRadius = outerRadius - 24;

            var formatPercent = d3.format(".1%");

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

            var layout = d3.layout.chord()
                .padding(0.04)
                .sortSubgroups(d3.descending)
                .sortChords(d3.ascending);

            var path = d3.svg.chord()
                .radius(innerRadius);

            var svg = mysvg.append("g")
                .attr("id", "circle")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            svg.append("circle")
                .attr("r", outerRadius);

            _.times(src_order.length, function(n) {
                // Compute the chord layout.
                layout.matrix(data);

                // Add a group per neighborhood.
                var group = svg.selectAll(".group")
                    .data(layout.groups)
                    .enter().append("g")
                    .attr("class", "group")
                    .style("cursor", "hand")
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout)
                    .on("click", click);

                // Add a mouseover title.
                group.append("title").text(function(d, i) {
                    return src_order[i] + ": " + formatPercent(d.value) + " of origins";
                });

                // Add the group arc.
                var groupPath = group.append("path")
                    .attr("id", function(d, i) { return "group" + i; })
                    .attr("d", arc)
                    .style("fill", function(d, i) { return src_colors[src_order[i]]; });

                // Add a text label.
                var groupText = group.append("text")
                    .attr("x", 6)
                    .attr("dy", 15);

                groupText.append("textPath")
                    .attr("xlink:href", function(d, i) { return "#group" + i; })
                    .text(function(d, i) { return src_order[i]; });

                // Remove the labels that don't fit. :(
                groupText.filter(function(d, i) {
                    return groupPath[0][i].getTotalLength() / 2 - 30 < this.getComputedTextLength();
                }).remove();

                // Add the chords.
                var chord = svg.selectAll(".chord")
                    .data(layout.chords)
                    .enter().append("path")
                    .attr("class", "chord")
                    .style("fill", function(d) { return src_colors[src_order[d.source.index]]; })
                    .attr("d", path);

                // Add an elaborate mouseover title for each chord.
                chord.append("title").text(function(d) {
                    return src_order[d.source.index] +
                        " → " + src_order[d.target.index] +
                        ": " + formatPercent(d.source.value) +
                        "\n" + src_order[d.target.index] +
                        " → " + src_order[d.source.index] +
                        ": " + formatPercent(d.target.value);
                });

                function mouseover(d, i) {
                    chord.classed("fade", function(p) {
                        return p.source.index != i && p.target.index != i;
                    });
                }

                function mouseout(d, i) {
                    chord.classed("fade", false);
                }

                function click(group) {
                    var city_name = src_order[group.index];
                    that.trigger("click", city_name);
                }

            });
        }
    });
    return ChordChart;
});