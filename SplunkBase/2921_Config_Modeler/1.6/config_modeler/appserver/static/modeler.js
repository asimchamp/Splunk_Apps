/**
 * Created by berniem on 10/5/15.
 * D3 indent tree code taken from http://bl.ocks.org/mbostock/1093025
 */

require.config({
  paths: {
    "app": "../app"
  }
});

require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "app/config_modeler/components/d3/d3",
    "splunk.util",
    "splunkjs/mvc/simplexml",
    "splunkjs/mvc/headerview",
    "splunkjs/mvc/footerview",
    "splunkjs/mvc/simplexml/dashboardview",
    "splunkjs/mvc/simplexml/dashboard/panelref",
    "splunkjs/mvc/simplexml/element/html",
    "splunkjs/mvc/simplexml/element/list",
    "splunkjs/mvc/simplexml/element/map",
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/simplexml/eventhandler",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/submit",
    "splunkjs/mvc/textinputview",
    "splunkjs/mvc/radiogroupview",
    "splunkjs/mvc/multidropdownview",
    "splunkjs/mvc/searchmanager",
    // Add comma-separated libraries and modules manually here, for example:
    // ..."splunkjs/mvc/simplexml/urltokenmodel",
    // "splunkjs/mvc/checkboxview"
  ],
  function(
    mvc,
    utils,
    TokenUtils,
    _,
    $,
    d3,
    SplunkUtil,
    DashboardController,
    HeaderView,
    FooterView,
    Dashboard,
    PanelRef,
    HtmlElement,
    ListElement,
    MapElement,
    FormUtils,
    EventHandler,
    DropdownInput,
    MultiSelectInput,
    TextInput,
    SubmitButton,
    TextInputView,
    RadioGroupView,
    MultiDropdownView,
    SearchManager) {
    (function() {
      var app = DashboardController.model.app.get('app')
      var tokens = mvc.Components.get("default");
      var appsData;
      var serverClassesList;
      var serverClasses;

      $("#drop").hide();
      // Find Deployment server
      var dsServer = new SearchManager({
        id: "dsServer",
        autostart: true,
        cache: false,
        search: "|rest /services/server/info | mvexpand server_roles | where server_roles==\"deployment_server\" | return $splunk_server"
      });

      // get Splunk form instances
      var multiSelect = mvc.Components.getInstance("multi");
      var dropDown = mvc.Components.getInstance("drop");
      var radioButton = mvc.Components.getInstance("type");

      // Returns a list serverclasses and apps
      var appList = new SearchManager({
        id: "appList",
        autostart: true,
        cache: false,
        search: mvc.tokenSafe("| rest splunk_server=$dsserver$ /services/deployment/server/applications" +
          "| eval serverclasses=if(isnull(serverclasses), \"NA\", serverclasses)" +
          "| stats count by serverclasses title" +
          "| fields serverclasses title")
      });

      // Find httpport deployment server is using
      var httpPort = new SearchManager({
        id: "httpPort",
        autostart: true,
        cache: false,
        search: mvc.tokenSafe("| rest splunk_server=$dsserver$ /services/properties/web/settings/httpport")
      });

      // Finds SSL enable/ disabled value
      var enableSSL = new SearchManager({
        id: "enableSSL",
        autostart: true,
        cache: false,
        search: mvc.tokenSafe("| rest splunk_server=$dsserver$ /services/properties/web/settings/enableSplunkWebSSL")
      });

      var overridedata = $("#ctree").data();

      if(_.isEmpty($("#ctree").data())) {

        // Sets $dsserver$ token used by other searches
        dsServer.on("search:done", function() {
          var data = this.data("results");
          data.on("data", function() {
            tokens.set("dsserver", this.data().rows[0][0]);
          });
        });
      } else {
        tokens.set("port", ":" + overridedata.port || "");
        tokens.set("dsserver", overridedata.dsserver);
        tokens.set("protocol", overridedata.protocol + "://" || "http://");
      }

      // Gets App and Serverclasses
      appList.on("search:done", function() {
        this.data("results").on("data", function() {
          // Prepares data for Multiselect
          appsData = this.data().rows;
          appList = _.uniq(_.map(appsData, function(app){return app[1]}));
          serverClassesList = _.without(_.uniq(_.map(appsData, function(app){return app[0]})), "NA");
          multiSelect.settings.set("choices", _.map(appList, function(app){return {label: app, value: app}}));
          dropDown.settings.set("choices", _.map(serverClassesList, function(app){return {label: app, value: app}}))
          serverClasses = _.groupBy(appsData, function(a) { return a[0]});
        });
      });

      // Determines webserver protocol of deployment server
      enableSSL.on("search:done", function() {
        this.data("results").on("data", function() {
          if(this.data().rows[0][0] === "false" || this.data().rows[0][0] === "0") {
            tokens.set("protocol", "http://");
          } else {
            tokens.set("protocol", "https://");
          }
        });
      });

      // Determines webserver port of deployment server
      httpPort.on("search:done", function() {
        this.data("results").on("data", function() {
          tokens.set("port", ":" + this.data().rows[0][0]);
        })
      });

      // Update user input from multiselect to dropdown through radio group
      radioButton.on("change",function() {
        if(this.settings.get("value") === "Apps") {
          $("#multi").show();
          $("#drop").hide();
        } else {
          $("#multi").hide();
          $("#drop").show();
        }
      });

      // Sets apps token when user updates input
      multiSelect.on("change", function() {
        tokens.set("apps", this.settings.get("value"));
      });

      // Sets apps token when user updates input
      dropDown.on("change", function() {
        var value = this.settings.get("value");
        if(typeof(value) !== "undefined" && typeof(serverClasses) !== "undefined"){
          tokens.set("apps", _.map(serverClasses[value], function(app) { return app[1]}))
        }
      });

      // on change/ update of multiselect query api for merged config
      tokens.on("change:apps", function(){
        var values = this.get("apps");
        $("#ctree").remove("svg");
        var host = this.get("dsserver");
        var protocol = this.get("protocol");
        var port = this.get("port");

        // Verify tokens for dsserver uri are populated
        if ((typeof(host) !== "undefined") && (typeof(protocol) !== "undefined") && (typeof(port) !== "undefined")) {
          var dsurl = protocol+host+port+"/en-US/custom/" + app + "/configmodel";
          this.set("dsurl", dsurl);
          var apps = {'apps': values, 'dsserver': dsurl};
          console.log(protocol+host+port+"/en-US/custom/" + app + "/configmodel");
          $.post("/en-US/custom/" + app + "/rsubmit", apps ,function(data){
            d3.select("#tree").remove();
            var configs = JSON.parse(data);
            var margin = {top: 10, right: 20, bottom: 30, left: 20};
            var width = 1500 - margin.left - margin.right
            var barHeight = 20;
            var barWidth = width * .8;
            var i = 0;
            var duration = 400;
            var root;

            // Formatting of config objects to fit d3 tree
            mergedconf = {name: "configs", children: []}
            for (var key in configs) {
              var F = {name: key, children: []}
              for (var stanza in configs[key]) {
                var S = {name: "[" + stanza + "]", children: []}
                for (var set in configs[key][stanza]){
                  var setting;

                  setting = {name: configs[key][stanza][set][0] + " -----  " + set + " = " + configs[key][stanza][set][1],
                    size: Math.round(999 * Math.random())};
                  S.children.push(setting);
                }
                F.children.push(S);
              }
              mergedconf.children.push(F);
            }
            var tree = d3.layout.tree()
              .nodeSize([0, 20]);

            var diagonal = d3.svg.diagonal()
              .projection(function(d) { return [d.y, d.x]; });
            var svg = d3.select("#ctree").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("id", "tree")
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            mergedconf.x0 = 0;
            mergedconf.y0 = 0;
            update(root = mergedconf);

            function update(source) {
              // Compute the flattened node list.
              var nodes = tree.nodes(root);
              var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

              d3.select("#ctree svg").transition()
                .duration(duration)
                .attr("height", height);

              d3.select(self.frameElement).transition()
                .duration(duration)
                .style("height", height + "px");

              // Compute the "layout".
              nodes.forEach(function(n, i) {
                n.x = i * barHeight;
              });

              // Update the nodes???
              var node = svg.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

              var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .style("opacity", 1e-6);

              // Enter any new nodes at the parent's previous position.
              nodeEnter.append("rect")
                .attr("y", -barHeight / 2)
                .attr("height", barHeight)
                .attr("width", barWidth)
                .style("fill", color)
                .on("click", click);

              nodeEnter.append("text")
                .attr("dy", 3.5)
                .attr("dx", 5.5)
                .text(function(d) { return d.name; });

              // Transition nodes to their new position.
              nodeEnter.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1);

              node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1)
                .select("rect")
                .style("fill", color);

              // Transition exiting nodes to the parent's new position.
              node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .style("opacity", 1e-6)
                .remove();

              // Update the links???
              var link = svg.selectAll("path.link")
                .data(tree.links(nodes), function(d) { return d.target.id; });

              // Enter any new links at the parent's previous position.
              link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                  var o = {x: source.x0, y: source.y0};
                  return diagonal({source: o, target: o});
                })
                .transition()
                .duration(duration)
                .attr("d", diagonal);

              // Transition links to their new position.
              link.transition()
                .duration(duration)
                .attr("d", diagonal);

              // Transition exiting nodes to the parent's new position.
              link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                  var o = {x: source.x, y: source.y};
                  return diagonal({source: o, target: o});
                })
                .remove();

              // Stash the old positions for transition.
              nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
              });
            }

            // Toggle children on click.
            function click(d) {
              if (d.children) {
                d._children = d.children;
                d.children = null;
              } else {
                d.children = d._children;
                d._children = null;
              }
              update(d);
            }

            function color(d) {
              return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
            }

          });
        }

      });

    })();
  });