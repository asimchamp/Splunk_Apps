define(function(require, exports, module) {
    var _ = require("underscore");
    var mvc = require("splunkjs/mvc");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var D3BoxPlot = SimpleSplunkView.extend({
        className: "d3boxplot",
        options: {
            data: "preview"
        },
        createView: function() {
		console.log("createview");	
		console.log(d3);
		var iqr = function(k) { 
			return function(d, i) {
		        var q1 = d.quartiles[0],
		            q3 = d.quartiles[2],
			    iqr = (q3 - q1) * k,
		            i = -1,
                	    j = d.length;
			    while (d[++i] < q1 - iqr);
		            while (d[--j] > q3 + iqr);
		            return [i, j];
		 }};
		var margin = {top: 10, right: 50, bottom: 20, left: 50},
		    width = 130 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;
		var chart = d3.box()
		    .whiskers(iqr(1.5))
		    .width(width)
		    .height(height);	
            return { "chart": chart, "width":width,"height":height, "margin":margin };
        },
        formatData: function(data) {
		var d3_data = [];
  		var index = 0;
  		_.each(data, function(Rcolumn, RrowCount) {
 			Rcolumn.shift();
  			_.each(Rcolumn, function(DColumn, DrowCount) {d3_data.push( [index, DColumn ]);	});
			index++;
			});
		var mydata = [];
	  	var min = Infinity,
                    max = -Infinity;
		
		d3_data.forEach(function(x) {
		    var e = Math.floor(x[0]),
		        s = Math.floor(x[1]),
		        d = mydata[e];
		    if (!d) d = mydata[e] = [s];
		    else d.push(s);
		    if (s > max) max = s;
		    if (s < min) min = s;
		  });
            return data;
        },
        updateView: function(chartObj, data) {            
		var width = chartObj.width, 
		    height = chartObj.height,	
		    margin = chartObj.margin,
		    chart = chartObj.chart;

	 	console.log("update view");
		d3.select(this.el).selectAll("svg")
		      .data(data)
		      .enter().append("svg")
		      .attr("class", "box")
		      .attr("width", width + margin.left + margin.right)
		      .attr("height", height + margin.bottom + margin.top)
		      .append("g")
		      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		      .call(chart);
		
        }
    });
    return D3BoxPlot;
});
