require.config({
    paths: {
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});
define(function(require, exports, module) {
    var _ = require('underscore_utils');
    var d3 = require("./d3/d3");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    require("css!./bubblechart.css");
    var dtTotal;

    var BubbleChart = SimpleSplunkView.extend({
        className: "splunk-toolkit-bubble-chart",
        options: {
            managerid: null,  
            param: null, 
            data: "preview", 
            host: null,
            controller: null,
            volumegroup: null,
            volumename: null
        },
        output_mode: "json",
        initialize: function() {
            _.extend(this.options, {
                formatName: _.identity,
                formatTitle: function(d) {
                    return (d.source.name + ' -> ' + d.target.name +
                            ': ' + d.value); 
                }
            });
            SimpleSplunkView.prototype.initialize.apply(this, arguments);
            this.settings.enablePush("value");

            // in the case that any options are changed, it will dynamically update
            // without having to refresh. copy the following line for whichever field
            // you'd like dynamic updating on
	    this.settings.on("change:param", this.render, this);
            this.settings.on("change:host", this.render, this);
            this.settings.on("change:controller", this.render, this);
            this.settings.on("change:volumegroup", this.render, this);
            this.settings.on("change:volumename", this.render, this);
			
            // Set up resize callback. The first argument is a this
            // pointer which gets passed into the callback event
            $(window).resize(this, _.debounce(this._handleResize, 20));
        },

        _handleResize: function(e){
            // e.data is the this pointer passed to the callback.
            // here it refers to this object and we call render()
            e.data.render();
        },

        createView: function() {
            // Here we wet up the initial view layout
            var margin = {top: 0, right: 0, bottom: 0, left: 0};
            var availableWidth = parseInt(this.settings.get("width") || this.$el.width());
            var availableHeight = parseInt(this.settings.get("height") || this.$el.height());

            this.$el.html("");
            var svg = d3.select(this.el)
                .append("svg")
                .attr("width", availableWidth)
                .attr("height", availableHeight)
                .attr("pointer-events", "all");
                
            var tooltip = d3.select(this.el).append("div")
                .attr("class", "bubble-chart-tooltip");

            // The returned object gets passed to updateView as viz
            return { container: this.$el, svg: svg, margin: margin, tooltip: tooltip};
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            // getting settings
            var host = this.settings.get('host');
            var controller = this.settings.get('controller');
            var volumegroup = this.settings.get('volumegroup');
            var volumename = this.settings.get('volumename');

            var collection = data;
            var bubblechart = { 'name': "System", 'children': [ ] }; // how we want it to look
            // making the children formatted array
            for (var i=0; i < collection.length; i++) {
		// For Hosts
		hostIndex = findInArray(bubblechart.children, 'name', "Array - " + collection[i][host]);
		if(hostIndex == -1) {
			bubblechart.children.push({ 'name': "Array - " + collection[i][host], children: [ ], 'size': 20000 });
			hostIndex = bubblechart.children.length - 1;
		}
				
		// For Controllers
		if(volumename != "-") {
			controllerIndex = findInArray(bubblechart.children[hostIndex].children, 'name', "Controller - " + collection[i][controller]);
			if(controllerIndex == -1) {
				bubblechart.children[hostIndex].children.push({ 'name': "Controller - " + collection[i][controller], children: [ ], 'size': 14000 });
				controllerIndex = bubblechart.children[hostIndex].children.length - 1;
			}
		} else {
                        controllerIndex = findInArray(bubblechart.children[hostIndex].children, 'name', "Volume Groups/Pools - " + collection[i][controller]);
                        if(controllerIndex == -1) {
                                bubblechart.children[hostIndex].children.push({ 'name': "Volume Groups/Pools - " + collection[i][controller], children: [ ], 'size': 14000 });
                                controllerIndex = bubblechart.children[hostIndex].children.length - 1;
                        }
		}
				
		// For Volume Groups
		if(volumename != "-") {
			vgIndex = findInArray(bubblechart.children[hostIndex].children[controllerIndex].children, 'name', "Volume Groups/Pools - " + collection[i][volumegroup]);
			if(vgIndex == -1) {
				bubblechart.children[hostIndex].children[controllerIndex].children.push({ 'name': "Volume Groups/Pools - " + collection[i][volumegroup], children: [ ], 'size': 7500 });
				vgIndex = bubblechart.children[hostIndex].children[controllerIndex].children.length - 1;
			}
		} else {
                        vgIndex = findInArray(bubblechart.children[hostIndex].children[controllerIndex].children, 'name', collection[i][volumegroup]);
                        if(vgIndex == -1) {
                                bubblechart.children[hostIndex].children[controllerIndex].children.push({ 'name': collection[i][volumegroup], children: [ ], 'size': 7500 });
                                vgIndex = bubblechart.children[hostIndex].children[controllerIndex].children.length - 1;
                        }
		}
	
		if(volumename != "-") {
			// For Volume
			vIndex = findInArray(bubblechart.children[hostIndex].children[controllerIndex].children[vgIndex].children, 'name', collection[i][volumename]);
			if(vIndex == -1) {
				bubblechart.children[hostIndex].children[controllerIndex].children[vgIndex].children.push({ 'name': collection[i][volumename], children: [ ], 'size': 3000 });
				vIndex = bubblechart.children[hostIndex].children[controllerIndex].children[vgIndex].children.length - 1;
			}
		}
            }

            function findInArray(array, key, value) {
		var found = -1;
		$.each(array, function(index, elm) {
			if(elm[key] == value) {
				found = index;
			}
		});
		return found;
	    }
            return bubblechart; // this is passed into updateView as 'data'
        },

        updateView: function(viz, data) {
            if(JSON.stringify(data) === dtTotal) {
                return ;
            }
            dtTotal = JSON.stringify(data);

            var that = this;
            var max=0;
            var colorArray = {};

            function getClassName(controllerName, vgName) {
                if(vgName.indexOf("UNDEFINED GHS")>=0)
                {
                    return "leafghs";
                }

                var retClass=colorArray[controllerName];
                if(retClass=="" || retClass=="undefined" || retClass==undefined)
                {
                    max=max+1;
                    colorArray[controllerName]="leaf" + max.toString();
                    retClass=colorArray[controllerName];
                    if(20==max) { max = 0; }
                }
                return retClass;
            }

            var margin=20, diameter = 1000;
            // Clear svg
            var svg1 = $(viz.svg[0]);
            svg1.empty();

            svg1 = viz.svg
                          .attr("width", diameter)
                          .attr("height", diameter)
                      .append("g")
                          .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
            var format = d3.format(",d");
            var pack = d3.layout.pack()
                .size([diameter - margin, diameter - margin])
                .value(function(d) { return d.size; });
            var root = data, focus = data, nodes = pack.nodes(data), view;

	    drawG(null, data);

	    function drawG(error, root) {
                var gs = svg1.selectAll("circle")
                       .data(nodes)
                       .enter().append("g")
                       .attr("class", function(d) { return d.children.length > 0 ? "node" : getClassName(d.parent.parent.name,d.parent.name) + " node";; });

                gs.append("circle")
                    //.attr("r", function(d) { if (d.parent !== undefined && d.parent.children.length === 1 && d.name.substring(0, 8) !== "Array - ") { d.r = (d.r/1.2); } return d.r; })
                    .attr("r", function(d) { if (d.parent !== undefined && d.parent.children.length === 1 && d.children.length === 0) { d.r = (d.r/1.2); } return d.r; })
                    .on("click", function(d) { if (focus !== d) zoom(d,true), d3.event.stopPropagation(); });

                gs.filter(function(d) { return d.children.length == 0; }).append("text")
                    .attr("dy", ".3em")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.name.substring(0, d.r / 2); })
                    .on("click", function(d) { if (focus !== d) zoom(d,true), d3.event.stopPropagation(); });
            }
            var node = svg1.selectAll("circle,text");
            d3.select("body").on("click", function() { zoom(root,false); });

            zoomTo([root.x, root.y, root.r * 2 + margin]);

            function zoom(d,act) {
                if(d.name.substring(0, 8) === "Array - ") { act = false; }
                var focus0 = focus; focus = d;
                var transition = d3.transition()
                                   .duration(d3.event.altKey ? 7500 : 750)
                                   .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function(t) { zoomTo(i(t)); };
                });

                transition.selectAll("text")
                    .filter(function(d) { return d.children.length <= 0; })
                    .text(function(d) { return (act)?d.name:d.name.substring(0, d.r / 2); })
                    .style("font",function(d) { return (act)?"12px sans-serif":"8px sans-serif"; });
            }

            function zoomTo(v) {
                var k = diameter / v[2]; view = v;
                node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
                node.attr("r", function(d) { return d.r * k; });
            }

            d3.select(self.frameElement).style("height", diameter + "px");
            // Re-flatten the child array
            function classes(data) {
                var classes = [];
                function recurse(name, node) {
                    if (node.children.length > 0) {
			classes.push({packageName: name || "", className: node.name || "", value: node.size});
                        node.children.forEach(function(child) { 
                            recurse(node.name, child); 
                        });
		    } else {
                        classes.push({packageName: name || "", className: node.name || "", value: node.size});
		    }
                }
                recurse("System", data);
                return {children: classes};
            }

            // Tooltips
            function doMouseEnter(d){
                viz.tooltip
                    .text(d.name)
                    .style("opacity", function(){
                        if(d.value !== undefined) { return 1; }
                        return 0;
                    })
                    .style("left", (d3.mouse(that.el)[0] + 10) + "px")
                    .style("top", (d3.mouse(that.el)[1] + 10) + "px"); 
            }

            // More tooltips
            function doMouseOut(d){
                viz.tooltip.style("opacity", 1e-6);
            }

            node.on("mousemove", doMouseEnter);
	    node.on("mouseover", doMouseEnter);
            node.on("mouseout", doMouseOut);
        }
    });
    return BubbleChart;
});
