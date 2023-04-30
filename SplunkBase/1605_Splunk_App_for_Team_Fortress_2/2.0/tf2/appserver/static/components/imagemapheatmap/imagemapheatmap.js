// image map heatmap overlap
// vs@splunk.com 9/6/14

//logging, uncoment to disable
//console.log = function() {}
//console.warn = function() {}
//console.debug = function() {}
//console.error = function() {}

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("../d3/d3");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!./imagemapheatmap.css");

    var overlay = SimpleSplunkView.extend({
        className: "hothothot",

        options: {
            managerid: null,   
            data: "preview", 
            xField: null,
			yField: null,
			zField: null,
            countField: 'count',
			labelField: null,
			drilldown: null,
			height: 400
        },

        output_mode: "json",

        initialize: function() {
          /*  _.extend(this.options, {
                formatName: _.identity,
                formatTitle: function(d) { console.log(d);
                    return (d.source.name + ' -> ' + d.target.name + ': ' + d.value); 
                }
            });*/
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            //this.settings.enablePush("value");

            // in the case that any options are changed, it will dynamically update
            // without having to refresh. copy the following line for whichever field
            // you'd like dynamic updating on  
           

            // Set up resize callback. The first argument is a this
            // pointer which gets passed into the callback event
            $(window).resize(this, _.debounce(this._handleResize, 0));
        },

        _handleResize: function(e){
            
            // e.data is the this pointer passed to the callback.
            // here it refers to this object and we call render()
            e.data.render();
        },

        createView: function() {
            var margin = {top: 0, right: 0, bottom: 0, left: 0};
            var availableWidth = parseInt(this.settings.get("width") || this.$el.width());
            var availableHeight = parseInt(this.settings.get("height") || this.$el.height());

            this.$el.html("");
			
            var svg = d3.select(this.el)
                .append("svg")
                .attr("width", availableWidth)
                .attr("height", availableHeight)
                .attr("pointer-events", "all");
			    
            // The returned object gets passed to updateView as viz
            return { container: this.$el, svg: svg, margin: margin };
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            // getting settings
            var xField = this.settings.get('xField');
			var yField = this.settings.get('yField');
			var zField = this.settings.get('zField');
			var countField = this.settings.get('countField');
			var labelField = this.settings.get('labelField');
			
			var dataset = JSON.stringify(data);
			var regx = new RegExp(xField,"g");
			var regy = new RegExp(yField,"g");
			var regz = new RegExp(zField,"g");
			var regc = new RegExp(countField,"g");
			dataset = dataset.replace(regx, 'x').replace(regy, 'y').replace(regz, 'z').replace(regc, 'count');
			
			console.debug(dataset);
			return JSON.parse(dataset);
        },

        updateView: function(viz, data) {
			var that = this;
			var svg = $(viz.svg[0]).empty();
			//var mapInfo = viz.mapData;
			
			
			//debugger;
			//load map info
			$.ajaxSetup({async: false});
			var currentMap = data[0].map_name; //this should be pulled from search results //
			//currentMap = "xcp_corporation_b1";
			var currentApp = $(location).attr("pathname").match(/app\/([^\/]+)\//i)[1];
			var mapInfo = null;
			
			debugger;
			/*$.ajax({
			  url: "/static/app/" + currentApp + "/maps/map_info.json",
			  dataType: 'json',
			  async: false,
			  
			  success: function(data) {
			    //stuff
			    //...
				debugger;
				console.log("new method: ", data)
			  }
			});*/
			
			
			var helpData = jQuery.getJSON("/static/app/" + currentApp + "/maps/map_info.json").done(function( data ) {
				console.debug("loading map data: ", data);
				mapInfo = data.maps[currentMap];
				debugger;
		
				if (typeof(mapInfo) == "undefined") {
					console.warn("no data found for map: ", currentMap)
				
					//fake it
					mapInfo = {
									"name": "cp_dustbowl",
									"minx": -3716,
									"miny": -2912,
									"maxx": 2856,
									"maxy": 3422,
									"height": 928,
									"width": 915	
								};
				} else {
					console.log("loading data for map: ", currentMap)
				
					var dim = mapInfo.res.split("x");
					mapInfo.width=dim[0];
					mapInfo.height=dim[1];
					mapInfo.name=currentMap;
				}
			}).error(console.error("failed to load map infocom"));
			$.ajaxSetup({async: true});
			

			var mapXScale = d3.scale.linear()
				.domain([mapInfo.minx, mapInfo.maxx])
				.range([0, mapInfo.width]);
		
			var mapYScale = d3.scale.linear()
				.domain([mapInfo.miny, mapInfo.maxy])
				.range([0, mapInfo.height]);
	
			var killCountScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return d.count; }), d3.max(data, function(d) { return d.count; })])
				.range([1,3]);
		
			var marker = {size: 10, type: "rect"}

			//var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
			//var colors = ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15"];
			var colors = ["#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026"];
            var colorScale = d3.scale.quantile()
                .domain([0, d3.max(data, function (d) { return d.count; })])
                .range(colors);

			var margin = {top: 20, right: 80, bottom: 30, left: 50},
			    width = mapInfo.width - margin.left - margin.right,
			    height = mapInfo.height - margin.top - margin.bottom;

			/*var colorLow = 'green', colorMed = 'yellow', colorHigh = 'red';
			var colorScale = d3.scale.linear()
			     .domain([-1, 0, 1])
			     .range([colorLow, colorMed, colorHigh]);*/

			var m = viz.svg
			    .attr("width", mapInfo.width)
			    .attr("height", mapInfo.height)
			    .append("g");
			    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var imageMap = m.append("svg:image")
				.attr("xlink:href", "/static/app/tf2/maps/" + mapInfo.name + ".jpg")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", mapInfo.width)
				.attr("height", mapInfo.height);
		
			
			var heatMap = m.selectAll(".heatmap").data(data);
			if (marker.type == "circle") {
				marker.size = marker.size/2;
			  	heatMap.enter().append("svg:circle")
			    .attr("cx", function(d) { return mapXScale(d.c); })
			    .attr("cy", function(d) { return mapYScale(d.y); })
				.attr("width", function(d) { return marker.size * killCountScale(d.count); })
			    .attr("height", function(d) { return marker.size * killCountScale(d.count); })
				.attr("r", function(d) { return marker.size * killCountScale(d.count); })
			    //.style("fill", function(d) { return colorScale(d.score); });
			} else if (marker.type == "triangle") {
			  	heatMap.enter().append("polygon")
				//.attr("points", "5,5 10,15 15,5");
				.attr("points", function(d){ var z = (xpos) + "," + ypos + " " + (xpos+scale) + "," + (ypos+scale) + " " + (xpos+scale) + "," + ypos; return v; });
			} else {
			  	heatMap.enter().append("svg:rect")
			    .attr("x", function(d) { return mapXScale(d.x); })
			    .attr("y", function(d) { return mapYScale(d.y); })
				.attr("width", function(d) { return marker.size * killCountScale(d.count); })
			    .attr("height", function(d) { return marker.size * killCountScale(d.count); });
			}
			
			//heatMap.style("fill", "red").style("opacity", "0.8");	
			heatMap.style("fill", "red").style("opacity", "0.8")
				.transition().duration(1000)
				.style("fill", function(d) { return colorScale(d.count); }).style("opacity", "0.95");
			  	
	        //tooltip
			heatMap.append("title").html(function(d) 
			{ 
				//console.debug(that.settings)
				var label=""
				var label=(that.settings.get('labelField')) ? d[that.settings.get('labelField')] : "Count: "+ d.count; 
				return label; 
			});
			
				
            /*var format = d3.format(",d");
            var color = d3.scale.category20c();

			var margin = {top: 1, right: 1, bottom: 1, left: 1},
				containerHeight = this.$el.height(),
				containerWidth = this.$el.width(),
			    width = containerWidth + margin.left,
			    height = containerHeight + margin.bottom;
			
            var graph = viz.svg
                .append("g")
                .attr("transform", "translate(" + viz.margin.left + "," + viz.margin.top + ")")
				.attr("width", width)
				.attr("height", height);	

			var sankey = d3.sankey()
			    .nodeWidth(15)
			    .nodePadding(10)
			    .size([containerWidth, containerHeight])
		        .nodes(data.nodes)
		        .links(data.links)
		        .layout(32);
				
            svg.height(height).width(width);
			
			var path = sankey.link();
					
		    var link = graph.selectAll(".link")
		        .data(data.links)
		        .enter().append("path")
		        .attr("class", "link")
		        .attr("d", path)
		        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		        .sort(function(a, b) { return b.dy - a.dy; });

		    link.append("title")
		        .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

		    var node = graph.selectAll(".node")
		        .data(data.nodes)
		        .enter().append("g")
		        .attr("class", "node")
		        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		        /*.call(d3.behavior.drag()
		        .origin(function(d) { return d; })
		        .on("dragstart", function() { this.parentNode.appendChild(this); })
		        .on("drag", dragmove))*/;

			/*node.append("rect")
				.attr("height", function(d) { return d.dy; })
				.attr("width", sankey.nodeWidth())
				.style("fill", function(d) { return d.color = color(d.name.replace(/ ., "")); })
			/*	.style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
				.append("title")
				.text(function(d) { return d.name + "\n" + format(d.value); });*/

			/*node.append("text")
				.attr("x", -6)
				.attr("y", function(d) { return d.dy / 2; })
				.attr("dy", ".35em")
				.attr("text-anchor", "end")
				.attr("transform", null)
				.text(function(d) { return d.name; })
				.filter(function(d) { return d.x < width / 2; })
				.attr("x", 6 + sankey.nodeWidth())
				.attr("text-anchor", "start");

			function dragmove(d) {
				d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
				sankey.relayout();
				link.attr("d", path);
			}
			
			//optional drilldown into field clicked
			if (that.settings.get('drilldown') != null) {
	            node.style("cursor", "hand").on('click', function(e) { 
					 //if x=0 is source of the event, x>0 is the target
					 var drilldownClick = (e.x==0) ? that.settings.get('sourceField') : that.settings.get('destinationField'),
					 	drilldownUri = that.settings.get('drilldown') /*+ "?" + drilldownClick + "=" + e.name;
				/*	 console.log("click uri: ", drilldownUri);
					 window.location.href = drilldownUri;
	             });
			 }*/

            // Re-flatten the child array
          /*  function classes(data) {
                var classes = [];
                function recurse(name, node) {
                    if (node.children) 
                        node.children.forEach(function(child) { 
                            recurse(node.name, child); 
                        });
                    else 
                        classes.push({packageName: name || "", className: node.name || "", value: node.size});
                }

                recurse(null, data);
                return {children: classes};
            }

            // Tooltips
         /*   function doMouseEnter(d){
                var text;
                if(d.className === undefined || d.className === ""){
                    text = "Event: " + d.value;
                } else {
                    text = d.className+": " + d.value;
                }
                tooltip
                    .text(text)
                    .style("opacity", function(){
                        if(d.value !== undefined) { return 1; }
                        return 0;
                    })
                    .style("left", (d3.mouse(that.el)[0]) + "px")
                    .style("top", (d3.mouse(that.el)[1]) + "px"); 
            }

            // More tooltips
           /* function doMouseOut(d){
                tooltip.style("opacity", 1e-6);
            }

            //node.on("mouseover", doMouseEnter);
            //node.on("mouseout", doMouseOut);
            
            // Drilldown clickings. edit this in order to change the search token that 
            // is set to 'value' (a token in bubbles django), this will change the drilldown
            // search.
           node.on('click', function(e) { 
                var clickEvent = {
                    name: e.className,
                    category: e.packageName,
                    value: e.value
                };
                that.settings.set("value", e.className);
                that.trigger("click", clickEvent);
            });*/
        }
    });
    return overlay;
});




