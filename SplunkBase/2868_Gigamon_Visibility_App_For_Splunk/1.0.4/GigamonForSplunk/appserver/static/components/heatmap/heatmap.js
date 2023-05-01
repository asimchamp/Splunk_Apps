define(function(require, exports, module) {
    var _ = require("underscore");
    var $ = require("jquery");
    if (!exports.d3) { require("../../js/d3.v2.min"); }
    if (d3.version.substr(0,1) < 3) {
	d3.scale.threshold = function() {return d3_scale_threshold([ .5 ], [ 0, 1 ]);};
	function d3_scale_threshold(domain, range) {
			function scale(x) {if (x <= x) return range[d3.bisect(domain, x)];}
    			scale.domain = function(_) {if (!arguments.length) return domain;domain = _;return scale;};
    			scale.range = function(_) {if (!arguments.length) return range;range = _;return scale;};
			scale.invertExtent = function(y) {y = range.indexOf(y);return [ domain[y - 1], domain[y] ];};
    			scale.copy = function() {return d3_scale_threshold(domain, range);};
			 return scale;}
    }
    require("css!./heatmap.css")
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var heatmapView = SimpleSplunkView.extend({
        className: "heatmaps",
        options: {
            "data": "results",
	    "managerid": null,
	    "element": null,
	    "width": 650,
	    "labelField": "portId",
	    "threshold" : 0, 
	    "colors": ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"].reverse(),
	    "tooltip_template" : '<div id="tooltip" class="hidden"><p><span id="value"></p></div>' 
        },
	output_mode: "json",
	initialize: function() {
		SimpleSplunkView.prototype.initialize.apply(this,arguments);
		this.settings.on("change:data", this.render, this);
		$(window).resize(this, _.debounce(this._handleResize,20));
	},
	_handleResize: function(e){ e.data.render();},
        createView: function() {
		return true;
        },
        formatData: function(data) {
		var stgs = this.settings;
		var fields = [];
		_.each(data, function(d) {
			if (stgs.get("labelField") in d) {
				d.label = d[stgs.get("labelField")];
			}
			d.heat = (typeof(d.heaters) == "string") ? JSON.parse(d.heaters) : d.heaters;
			if (d.heat.length > fields.length){ _.each(d.heat, function(e){ if (!(e.label in fields)) { fields.push(e.label); } });}
		});
	    	return {"d": data, "l": fields};
        },
        updateView: function(chartObj, mydata) {

		var fields = mydata.l;
		var data = mydata.d;
		var TemplateSettings = {
  			interpolate: /\{\{(.+?)\}\}/g
        	};
		this.$el.empty("");
		var ELSIZE = this.$el.width() || this.settings.get("width"),
		    cellSize = this.settings.get("cellSize") || 12;

		var myColors = this.settings.get("colors");
		var myDomain = [ d3.min(data, function(d){
                                return d3.min(d.heat, function(e){return e.value;});
                        }), d3.max(data, function(d){
                                return d3.max(d.heat, function(e){return e.value;});

                        }) ];
		var threshold = this.settings.get("threshold");
		var colorScale = null;
		if (threshold > 0) {
			myDomain = [( -1 * threshold), threshold ];
			myColors = (myColors.length == 3 ? myColors : [ "#0000BB","#FFFFFF","#BB0000"]);
			colorScale = d3.scale.threshold()
				.domain(myDomain)	
				.range(d3.range(myColors.length).map(function(d){
					return myColors[d];
				}));
		} else {
			colorScale = d3.scale.quantize()
                                .domain(myDomain)
                                .range(d3.range(myColors.length).map(function(d){
                                        return myColors[d];
                                }));
		}
		
		this.$el.append(this.settings.get("tooltip_template"));

		var margin = { top: 100, right: 10, bottom: 50, left: 75 },
      			cellSize=24;
      			col_number=fields.length;
      			row_number=data.length;
      			width = ELSIZE, 
      			height = cellSize*row_number + 75 +100, 
      			legendElementWidth = width / myColors.length,
      			colorBuckets = myColors.length,
      			colors = myColors,
      			rowLabel =[ "??" ],
      			colLabel = fields;

      var svg = d3.select(this.el).append("svg")
          .attr("width", width)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          ;
      var rowSortOrder=false;
      var colSortOrder=false;
      var rowLabels = svg.append("g")
          .selectAll(".rowLabelg")
          .data(data)
          .enter()
          .append("text")
          .text(function (d) { return d.label; })
          .attr("x", 0)
          .attr("y", function (d, i) { y = (i+1) * cellSize; _.each(d.heat,function(e){e.y = y; e.parent_label = d.label}); return y; })
          .style("text-anchor", "end")
          .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
          .attr("class", function (d,i) { return "rowLabel mono r"+i;} ) 
          .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
          .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
          //.on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
          ;
      var colLabels = svg.append("g")
          .selectAll(".colLabelg")
          .data(colLabel)
          .enter()
          .append("text")
          .text(function (d) { return d; })
          .attr("x", 0)
          .attr("y", function (d, i) { return (i+1) * cellSize; })
          .style("text-anchor", "left")
          .attr("transform", "translate("+cellSize/2 + ",-6) rotate(-90)")
          .attr("class",  function (d,i) { return "colLabel mono c"+i;} )
          .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
          .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
          //.on("click", function(d,i) {colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
          ;
      var heatMap = svg.append("g").attr("class","g3")
            .selectAll(".rowg")
            .data(data)
            .enter()
	    .append("g").attr("class","g3").selectAll(".cellg")
	    .data(function(d){return d.heat;})
            .enter()
            .append("rect")
            .attr("x", function(d,i) { return (fields.indexOf(d.label)+1) * cellSize; })
            .attr("y", function(d) { return d.y })
            .attr("class", function(d){return "cell cell-border";})
            .attr("width", cellSize)
            .attr("height", cellSize)
            .style("fill", function(d) { return colorScale(d.value); })
	    .attr("title",function(d){return d.value;})
	    .on("mouseover", function(d,i){
			var val = d.value, lbl = d.label, plbl = d.parent_label;
			var X = d3.event.layerX, Y = d3.event.layerY;
			d3.select("#tooltip")
				.style("left",X+"px")
				.style("top", Y+"px")
				.select("#value")
				.html( plbl + "<hr/>" + lbl +": "+val);

			d3.select("#tooltip").classed("hidden",false);
				
		})
	     .on("mouseout", function(d,i){
			d3.select("#tooltip").classed("hidden",true);
		})
            ;

	function interpolateArray(data, fitCount) {

    var linearInterpolate = function (before, after, atPoint) {
        return before + (after - before) * atPoint;
    };

    var newData = new Array();
    var springFactor = new Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0]; // for new allocation
    for ( var i = 1; i < fitCount - 1; i++) {
        var tmp = i * springFactor;
        var before = new Number(Math.floor(tmp)).toFixed();
        var after = new Number(Math.ceil(tmp)).toFixed();
        var atPoint = tmp - before;
        newData[i] = linearInterpolate(data[before], data[after], atPoint);
    }
    newData[fitCount - 1] = data[data.length - 1]; // for new allocation
    return newData;
};

      var heightAdjust = 72, legendShift = 75;
	console.log(svg);
      var legend = svg.append("svg")
		.attr("class","legendcnt")
		.attr("x",300 )
		.attr("y",(-1 * height))
		.attr("overflow","visible")
		.attr("id","heatmap_legend")
	  .selectAll(".legend")
          .data(interpolateArray(colorScale.domain(),myColors.length))
          .enter().append("g")
          .attr("class", "legend");
     
      legend.append("rect")
        .attr("x", 0)//function(d, i) { return legendElementWidth * i - legendShift; })
        .attr("y", function(d, i) { return (height-heightAdjust) +(i * cellSize)})
        .attr("width", 50)
        .attr("height", cellSize)
	.attr("style",function(d,i){ return "stroke:#000; stroke-width:1;fill:"+myColors[i]+";";});
     
      legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return d.toFixed(1); })
        .attr("width", 50)
        .attr("x", 60)//function(d, i) { return legendElementWidth * i - legendShift; })
        .attr("y", function(d, i){ return (height -heightAdjust)+(i*cellSize)+(cellSize/2+6) });
        }
    });
    return heatmapView;
});
