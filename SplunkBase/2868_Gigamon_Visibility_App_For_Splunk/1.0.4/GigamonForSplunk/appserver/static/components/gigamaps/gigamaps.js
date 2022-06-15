define(function(require, exports, module) {
    var _ = require("underscore");
    var $ = require("jquery");
    var d3Obj = require("../../js/d3.v2.min");
    require("css!./gigamaps.css")
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var gigamapView = SimpleSplunkView.extend({
        className: "gigamaps",
        options: {
            "data": "results",
	    "managerid": null,
	    "element": null,
	    "width": 1024
        },
	output_mode: "json_rows",
	initialize: function() {
		console.log("initializing gigamaps");
		SimpleSplunkView.prototype.initialize.apply(this,arguments);
		this.settings.on("change:data", this.render, this);
		$(window).resize(this, _.debounce(this._handleResize,20));
	},
	_handleResize: function(e){ e.data.render();},
        createView: function() {
		console.log("create gigamaps view");
		return true;
        },
	_objectify: function(results){
		rowHeader = [ "alias","clusterId","counter","json","deviceIp","dstPorts","srcPorts","subType","type","timestamp"];
		var step = 0, size = 0;
		var counter = 0;
		var tmp =  {"d":_.map(results,function(row){
			counter = counter + 1;
  			rowObj = {};
  			_.each(row,function(rowItem,rowItemIndex){
  				rowObj[rowHeader[rowItemIndex]] = rowItem;
  			});
			if (rowObj["step"] > step) { step = rowObj["step"]; }
  				return rowObj;
  			}), "step": 0, "size": 0 };
		tmp.step = step; tmp.size = size;
		console.log(tmp);
		return tmp;
	},
        formatData: function(data) {
	    objData = this._objectify(data);       
	    return objData;
        },
        updateView: function(chartObj, data) {
		var GigamonTemplateSettings = {
  			interpolate: /\{\{(.+?)\}\}/g
        };
		console.log("update gigamaps view");
		this.$el.empty("");
		var ELSIZE = this.settings.get("width");
		$(_.map(data.d,function(map){
                              map.cellwidth = ELSIZE;
			      myJson = JSON.parse(map.json);
                              return _.template($("#gigamaps_template").html(),{ "map":myJson},GigamonTemplateSettings);;
                        }).join(" ")).appendTo(this.$el);
        }
    });
    return gigamapView;
});
