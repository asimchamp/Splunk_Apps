define(function(require, exports, module) {
   
   // var d3ignore = require("AppBase/js/d3.min");
	console.log(d3);
    var d3layout = require("AppBase/components/bundles/d3.layout");
    var packages = require("AppBase/components/bundles/packages");
    var _ = require("underscore");
    var $ = require("jquery");
    require("css!./bundles.css");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var sliderControls = '<div style="width:100%"><div style="display:inline-block;font-size:18px;width:25%">tension: <input style="position:relative;top:3px;" id="tension_range" type="range" min="0" max="100" value="85"/></div><!--<div style="display:inline-block;font-size:18px;width:25%">scale: <input style="position:relative;top:3px;" id="scale_range" type="range" min="0" max="100" value="85"/>--></div><div style="display:inline-block;font-size:18px;">Tip: Click and drag on the lines to rotate</div></div>';
    var bundles = SimpleSplunkView.extend({
        className: "bundles",
        options: {
            data: "results",
	    "managerid": null,
		"height": 900,
		"width":  1280
        },
	output_mode: "json_rows",
	initialize: function() {
		SimpleSplunkView.prototype.initialize.apply(this,arguments);
		this.settings.on("change:data", this.render, this);
		$(window).resize(this, _.debounce(this._handleResize,20));
	},
	_handleResize: function(e){console.log("resize");console.log(e); e.data.render();},
        createView: function() {
		return true;
        },
        formatData: function(data) {
            return JSON.parse(data[0][0]);
        },
        updateView: function(chartObj, data) {

		this.$el.empty("");
		$(sliderControls).appendTo(this.$el);
		var w = this.settings.get("width"),
		    h = this.settings.get("height"),
		    rx = w / 2,
		    ry = h / 2,
    		    m0,
		    rotate = 180;

		var splines = [];

var cluster = d3.layout.cluster()
    .size([360, ry - 120])
    .sort(function(a, b) { return d3.ascending(a.key, b.key); });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(0.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var div = d3.select(this.el).insert("div", "h2")
    .style("width", w+"px")
    .style("height", w+"px")
    .style("position", "relative")
    .style("-webkit-backface-visibility", "hidden");

 var x = d3.scale.linear().domain([0,w]).range([0,w]);
 var y = d3.scale.linear().domain([0,h]).range([h,0]);

console.log(d3.behavior.zoom);
var svg = div.append("svg:svg")
    .attr("width", w+200)
    .attr("height", w+200)
    .append("svg:g")
    .attr("transform", "translate(" + rx + "," + ry + ")");

svg.append("svg:path")
    .attr("class", "arc")
    .attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
    .on("mousedown", mousedown);

	classes = data;
	console.log(data);
  var inBtwn = packages.root(classes);
  var nodes = cluster.nodes(inBtwn); 
  console.log(nodes);
  var links = packages.imports(nodes);
  var splines = bundle(links);

  var path = svg.selectAll("path.link")
      .data(links)
    .enter().append("svg:path")
      .attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
      .attr("d", function(d, i) { return line(splines[i]); });

  svg.selectAll("g.node")
      .data(nodes.filter(function(n) { return !n.children; }))
    .enter().append("svg:g")
      .attr("class", "node")
      .attr("id", function(d) { return "node-" + d.key; })
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    .append("svg:text")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.key })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  d3.select("#tension_range").on("change", function() {
    line.tension(this.value / 100);
    path.attr("d", function(d, i) { return line(splines[i]); });
  });

  d3.select("#scale_range").on("change", function() {
	svg.transition().attr("transform","scale("+(this.value / 100)+")");
  });



/////////////////////////////
//////// FUNCTIONS /////////
////////////////////////////

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("resize",resize);

var myDiv = this.$el;
function resize(element){
	div.style('width', myDiv.width() + "px");
	div.style('height', myDiv.height() + "px");
}

function mouse(e) {
  return [e.pageX - rx, e.pageY - ry];
}

function mousedown() {
  m0 = mouse(d3.event);
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
    var m1 = mouse(d3.event),
        dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
    div.style("-webkit-transform", "translateY(" + (ry - rx) + "px)rotateZ(" + dm + "deg)translateY(" + (rx - ry) + "px)");
  }
}

function mouseup() {
  if (m0) {
    var m1 = mouse(d3.event),
        dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

    rotate += dm;
    if (rotate > 360) rotate -= 360;
    else if (rotate < 0) rotate += 360;
    m0 = null;

    div.style("-webkit-transform", null);

    svg
        .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
        .selectAll("g.node text")
        .attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
        .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
  }
}

function mouseover(d) {
  svg.selectAll("path.link.target-" + d.key)
      .classed("target", true)
      .each(updateNodes("source", true));

  svg.selectAll("path.link.source-" + d.key)
      .classed("source", true)
      .each(updateNodes("target", true));
}

function mouseout(d) {
  svg.selectAll("path.link.source-" + d.key)
      .classed("source", false)
      .each(updateNodes("target", false));

  svg.selectAll("path.link.target-" + d.key)
      .classed("target", false)
      .each(updateNodes("source", false));
}

function updateNodes(name, value) {
  return function(d) {
    if (value) this.parentNode.appendChild(this);
    svg.select("#node-" + d[name].key).classed(name, value);
  };
}

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

        }
    });
    return bundles;
});
