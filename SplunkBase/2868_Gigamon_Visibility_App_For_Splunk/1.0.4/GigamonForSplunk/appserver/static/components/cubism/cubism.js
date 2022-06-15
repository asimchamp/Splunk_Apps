define(function(require, exports, module) {
    var _ = require("underscore");
    var $ = require("jquery");
    var d3obj = require("../../js/d3.v2.min");
    require("css!./cubism.css")
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var cubismView = SimpleSplunkView.extend({
        className: "cubism",
        options: {
            "data": "results",
	    "managerid": null,
	    "element": null,
	    "colors": ["#08519c","#3182bd","#6baed6","#bdd7e7","#bae4b3","#74c476","#31a354","#006d2c"],
	    "extent": [0,200],
	    "height": 30,
	    "width": 1024,
	    "debug": false,
	    "horizon_height": 35,
	    "show_negatives" : true
        },
	output_mode: "json",
	initialize: function() {
		SimpleSplunkView.prototype.initialize.apply(this,arguments);
		this.settings.on("change:data", this.render, this);
		$(window).resize(this, _.debounce(this._handleResize,20));
	},
	_handleResize: function(e){  }, //.render();},
        createView: function() {
		return true;
        },
        formatData: function(data) {
	    objData = data; 
	    var HorizonData = {}, size = 0, start = 2000000000000, stop = 0, step;
	    var counter = 0;
	    _.each(objData, function(d) {
                        if (!(d.item in HorizonData)) {
				d.label = d.item;
				if ("description" in d) {
					d.label = d.description;
				}
                                HorizonData[d.item] = {"label":d.label, "start": start, "stop": stop, "step":d.step,"values":[]};
                        }
			if (d.start < HorizonData[d.item].start && d.start > 0) HorizonData[d.item].start = d.start;
			if( d.stop > HorizonData[d.item].stop) HorizonData[d.item].stop = d.stop;
                        HorizonData[d.item].values.push(d.value);
			counter = counter + 1;
                });
             _.each(HorizonData, function(x){
			if (x.values.length > size) size = x.values.length;
			if (x.start < start && x.start > 0) start = x.start;
			if( x.stop > stop) stop = x.stop;
             });
	     step = (start - stop) / size;
	     return { "data":HorizonData, "size": size, "step":Math.abs(step), "start":start, "stop":stop }
        },
        updateView: function(chartObj, data) {
		this.$el.empty("");
		var viewEl = this.$el;
		var ELSIZE = this.$el.width() > 500 ? this.$el.width() : this.settings.get("width");
		var cubeObj = require("./cubism.v1.min");
		console.log("Start: " + new Date(+data.start) + " Stop: "+ new Date(+data.stop));
		var context = cubism.context()
			.serverDelay(new Date(+data.start) - new Date(+data.stop))
			.step(data.step)
			.size(ELSIZE)
			.stop();
		context.scale.domain([data.start, data.stop]);
		var myData = _.map(data.data, function(x) {
			var values = [];
			return context.metric(function(start,stop,step,callback){ 
				var _interpolateArray = function(data, fitCount) {
					for(var k=0;k<data.length;k++){data[k]=+data[k];}
        				var linearInterpolate = function (before, after, atPoint) {
                				return +before + (+after - +before) * +atPoint;
        				};

        				var newData = [];
        				var springFactor = new Number((data.length - 1) / (fitCount - 1));
        				newData[0] = data[0]; // for new allocation
        				for ( var i = 1; i < fitCount - 1; i++) {
                				var tmp = i * springFactor;
                				var before = new Number(Math.floor(tmp)).toFixed();
                				var after = new Number(Math.ceil(tmp)).toFixed();
                				var atPoint = Number(tmp - before);
                				newData.push(linearInterpolate(data[before], data[after], atPoint));
        				 }
        				newData[fitCount - 1] = data[data.length - 1]; // for new allocation
        				return newData;
        			};
				callback(null, _interpolateArray(x.values, ELSIZE)); 
			}, x.label);
		});

		legend = _.map(this.settings.get("colors"),function(x){
			return "<div class='cubism legend color' style='background-color: "+x+";'>&nbsp;</div>"
			
		});
		var colors = this.settings.get("colors");
		var myColors = (this.settings.get("show_negatives") ? colors : colors.slice(colors.length / 2, colors.length))
		var showPercentage = function(data, idx) {
			var numEl = myColors.length;
			var halfEl = numEl/2;
			var prefix = (idx < halfEl) ? "-" : "+";
			var pert = ( idx < halfEl ? (halfEl-(idx+1)) * (100 / halfEl) : (idx) * (100 / halfEl) );
			return "> "+ prefix + Math.round((pert >= 100 ? pert - 100 : pert)) + "%"
		};
	
			
		d3.select(this.el).selectAll(".legendblurb")
			.data(["blurb"])
			.enter().append("span")
			.attr("class", "cubism legendblurb")
			.style("width","250px")
			.text("The color refers to the percentage within each row of the maximum value in that row.");

		d3.select(this.el).selectAll(".legend")
			.data(myColors)
			.enter().append("div")
			.attr("class", "cubism legend")
			.style("background-color",function(d){return d;})
			.append("div")
			.attr("class","cubism legend label")
			.text(showPercentage);

		d3.select(this.el).selectAll(".axis")
    			.data(["top", "bottom"])
  			.enter().append("div")
    			.attr("class", function(d) { return d + " axis"; })
    			.each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

		d3.select(this.el).append("div")
    			.attr("class", "rule")
    			.call(context.rule());

		var horizons = d3.select(this.el).selectAll(".horizon");
		horizons
    			.data(myData)
  			.enter()
			.insert("div", ".bottom")
    			.attr("class", "horizon")
    			.call(context.horizon()
				.height(this.settings.get("horizon_height"))
			);
		context.on("focus", function(i) {
 			d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
		});

		context.stop();

        }
    });
    return cubismView;
});
