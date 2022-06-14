// Cluster Dendrogram D3.js code taken and modified from http://bl.ocks.org/mbostock/4063570 by Mike Bostock

require.config({
    paths: {
        jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});


define(function (require, exports, module) {
    var d3 = require("../d3/d3");
    var $ = require("jquery_netapp")
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var utils = require("splunkjs/mvc/utils");
    d3layout = require("./treelist");
    var _ = require("underscore_utils");
    require("css!./treelist");
    require("css!./bootstrap-glyphicons");
    require("css!./font-awesome.css");

    var Dendrogram = SimpleSplunkView.extend({
            className : "splunk-toolkit-dendrogram",
            options : {
                "managerid" : null,
                "data" : "preview",
                "root_label" : "root_label not set",
                "height" : "auto",
                "node_outline_color" : "#d62728",
                "node_close_color" : "#e7969c",
                "node_open_color" : "#ffffff",
                "label_size_color" : "#d62728",
                "label_count_color" : "#1f77b4",
                "initial_open_level" : 1,
                "margin_left" : 100,
                "margin_right" : 400
            },
            output_mode : "json_rows",
            initialize : function () {
                _(this.options).extend({
                    "height_px" : 500
                });
                SimpleSplunkView.prototype.initialize.apply(this, arguments);

                this.settings.on("change:order", this.render, this);

                $(window).resize(this, _.debounce(this._handleResize, 20));
            },
            _handleResize : function (e) {
                // e.data is the this pointer passed to the callback.
                // here it refers to this object and we call render()
                e.data.render();
            },
            createView : function () {
                return true;
            },
            // Making the data look how we want it to for updateView to do its job
            formatData : function (data) {
                var height = this.settings.get("height");
                var height_px = this.settings.get("height_px");
                var root_label = this.settings.get("root_label");

                this.settings.set("height_px", height === "auto" ? Math.max(data.length * 30, height_px) : height);

                var nest = function (list) {
					if(typeof(list[0][0])=="object")
					{
						return {
							"name" : list[0]
						};
					}
					else {

						var groups = _(list).groupBy(0);
						return _(groups).map(function (value, key) {
							var children = _(value)
								.chain()
								.map(function (v) {
									return _(v).rest();
								})
								.compact()
								.value();

							return children.length == 1 && children[0].length - 1 === 0 ? {
								"name" : key
							}
							 : {
								"name" : key,
								"children" : nest(children)
							};
						});
					}
                }; 

                var formatted_data = {
                    "name" : "-1||"+root_label,
                    "children" : nest(data)
                };
                return formatted_data;
            },
            updateView : function (viz, data) {
                this.$el.html("");

                var width = this.$el.width();
                var height = this.settings.get("height_px");

                var m = [20, this.settings.get("margin_right"), 20, this.settings.get("margin_left")],
                w = width - m[1] - m[3],
                h = height - m[0] - m[2],
                i = 0;

                var tree = d3layout.tree()
                    .size([h, w]);

                function toggle_children(tree, level) {
                    if (tree.children) {
                        _(tree.children).each(function (child) {
                            toggle_children(child, level + 1);
                        });

                        if (level >= initial_open_level) {
                            toggle(tree);
                        }
                    }
                }

                var initial_open_level = this.settings.get("initial_open_level");

                if (initial_open_level >= 0) {
                    toggle_children(data, 0);
                }

                // Toggle children.
                function toggle(d) {
                    if (d.children) {
						d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                }
                this.$el.append("<div id='dendogram_el'></div>");
                var id = 0;
                var tree = d3layout.treelist()
                    .childIndent(10)
                    .nodeHeight(30);
                var ul = d3.select("#dendogram_el").append("ul").classed("treelist", true);

                function render(data, parent) {
                    var nodes = tree.nodes(data),
                    duration = 250;

                    var nodeEls = ul.selectAll("li.node").data(nodes, function (d) {
                            d.id = d.id || ++id;
                            return d.id;
                        });
                    //entered nodes
                    var entered = nodeEls.enter().append("li").classed("node", true)
                        .style("top", parent.y + 75 + "px")
                        .style("opacity", 0)
                        .style("height", tree.nodeHeight() + "px")
                        .on("mouseover", function (d) {
                            d3.select(this).classed("selected", true);
                        })
                        .on("mouseout", function (d) {
                            d3.selectAll(".selected").classed("selected", false);
                        });
                    //add arrows if it is a folder
                    entered.append("span").attr("class", function (d) {
						var d_depth = d.name.split("||")[0];
						if(d_depth=="5")
						{
							return "";
						}
						else {
							var icon = d.children ? " glyphicon-chevron-down" : d._children ? "glyphicon-chevron-right" : "";
							var caret = (typeof(d.children)=="undefined" && typeof(d._children)=="undefined") ? "" : "caret";
							return caret + " glyphicon " + icon;
						}
                    }).on("click", function (d) {
                        toggle(d);
                        render(data, d);
                        return true;
                    });

                    //add icons for folder for file
                    entered.append("span").attr("class", function (d) {
                        var icon = "";
                        // for Folder : depth=1
                        // for Array : depth=3
                        // for Controller : depth=5
                        // for Volume Groups : depth=7
                        // for Volumes : depth=9
                        var name="";
						var d_depth="";
                        if(d.name!=undefined){
							d_depth = d.name.split("||")[0]
							name = d.name.split("||")[1];
                        } else  if(d.data.name!=undefined) {
							d_depth = d.data.name.split("||")[0]
							name = d.data.name.split("||")[1];
                        }
                        if (d_depth == "1") {
                            icon = "glyphicon glyphicon-folder-close folder ";
                        } else if (d_depth == 2 || d_depth == 3) {
                            icon = "fa fa-bars array ";
                        } else if (d.depth == 4 || d_depth == 5) {
                            icon = "fa fa-desktop controller ";
                        } else if (d_depth == 6 || d_depth == 7) {
                            icon = "fa fa-database volumegroup ";
                        } else if (d_depth == 8 || d_depth == 9) {
                            if (name.split("##")[0] === "N.A.") {
                                icon = "volumehide";
                            } else {
                                icon = "glyphicon glyphicon-hdd volume ";
                            }
                        } else {
                            icon = "fa fa-archive ";
                        }
                        return icon;
                    });
                    //add text
                    entered.append("span").attr("class", function (d) {
                        var name="";
						var d_depth="";
                        if(d.name!=undefined){
							d_depth = d.name.split("||")[0]
							name = d.name.split("||")[1];
                        } else  if(d.data.name!=undefined) {
							d_depth = d.data.name.split("||")[0]
							name = d.data.name.split("||")[1];
                        }

                        var className = "";
                        if (d_depth == 1) {
                            className = "folderfilename";
                        } else if (d_depth == "3") {
                            var n = name.split("##")[0].indexOf("Needs Attention");
                            if(n==-1)
                            {
                                className = "arrayfilename";
                            }
                            else
                            {
                                className = "arrayfilenameNeedAttention";
                            }
                        } else if (d_depth == 5) {
                            className = "controllerfilename";
                        } else if (d_depth == 7) {
                            className = "volumegroupfilename";
                        } else if (d_depth == 9) {
                            if (name.split("##")[0] === "N.A.") {
                                className = "volumehide";
                            } else {
                                className = "volumefilename";
                            }
                        } else {
                            className = "filename";
                        }
                        return className;
                    })
                    .html(function (d) {
                        var name="";
						var d_depth="";
                        if(d.name!=undefined){
							d_depth = d.name.split("||")[0]
							name = d.name.split("||")[1];
                        } else if(d.data.name!=undefined) {
							d_depth = d.data.name.split("||")[0]
							name = d.data.name.split("||")[1];
                        }
						var txt;
						if (d_depth == 3)
						{
							var txtArr = name.split("##");
							txt = txtArr[0];
							var n = name.split("##")[0].indexOf("Needs Attention");
							if(n!=-1) {
								txt = txtArr[0].replace(/^(.*)\s+\(Needs Attention\)/, "<a  target='_blank' class='arrayfilename' href='perf_array?form.arrayId=" + txtArr[1] + "'>$1</a>")+" <a  target='_blank' class='arrayfilenameNeedAttention' href='failure_array?form.arrayId_tkn=" + txtArr[1] + "'>(Needs Attention)</a>";
							}
							else
							{
								txt = "<a target='_blank' class='arrayfilename' href='perf_array?form.arrayId=" + txtArr[1] + "'>" + txtArr[0] + "</a>";
							}
						}
						else
						{
							txt=name;
						}
                        return "&nbsp;" + txt;
                    })
                    .on("click", function (d) {
						var name="";
						var d_depth="";
                        if(d.name!=undefined){
							d_depth = d.name.split("||")[0]
							name = d.name.split("||")[1];
                        } else if(d.data.name!=undefined) {
							d_depth = d.data.name.split("||")[0]
							name = d.data.name.split("||")[1];
                        }
                        if (d_depth == 3) {
							//Open Performance - Array by Controller dashboard
							/*if(d.name!=undefined){
								utils.redirect("perf_array?form.arrayId=" + d.name.split("##")[1], "_blank");
							} else  if(d.data.name!=undefined) {
								utils.redirect("perf_array?form.arrayId=" + d.data.name.split("##")[1], "_blank");
							}*/
                        } else if (d_depth == 5) {
                            //Open Performance - Controller by Volume Group/Pool dashboard
							if(d.name!=undefined){
								utils.redirect("perf_vgroups?form.arrayId=" + d.parent.parent.name.split("||")[1].split("##")[1] + "&form.controllerLabel=" + d.name.split("||")[1].split("##")[0], "_blank");
							} else  if(d.data.name!=undefined) {
								utils.redirect("perf_vgroups?form.arrayId=" + d.parent.parent.data.name.split("||")[1].split("##")[1] + "&form.controllerLabel=" + d.data.name.split("||")[1].split("##")[0], "_blank");
							}
                        } else if (d_depth == 7) {
                            //Open Performance - Volume Group/Pool by Drive dashboard
							if(d.name!=undefined){
								utils.redirect("perf_volumes?form.arrayId=" + d.parent.parent.parent.parent.name.split("||")[1].split("##")[1] + "&form.controllerLabel=" + d.parent.parent.name.split("||")[1].split("##")[0] + "&form.volumeGroup=" + d.name.split("||")[1].split("##")[0], "_blank");								
							} else  if(d.data.name!=undefined) {
								utils.redirect("perf_volumes?form.arrayId=" + d.parent.parent.parent.parent.data.name.split("||")[1].split("##")[1] + "&form.controllerLabel=" + d.parent.parent.data.name.split("||")[1].split("##")[0] + "&form.volumeGroup=" + d.data.name.split("||")[1].split("##")[0], "_blank");
							}
                        } else if (d_depth == 9) {
                            //Open Performance - Cache Hits by Volume dashboard
							if(d.name!=undefined){
								utils.redirect("perf_cachehits?form.volumeName=" + d.name.split("||")[1].split("##")[0] + "&form.arrayId=" + d.parent.parent.parent.parent.parent.parent.name.split("||")[1].split("##")[1] + "&form.controllerLabel=" + d.parent.parent.parent.parent.name.split("||")[1].split("##")[0] + "&form.volumeGroup=" + d.parent.parent.name.split("||")[1].split("##")[0], "_blank");
							} else  if(d.data.name!=undefined) {
								utils.redirect("perf_cachehits?form.volumeName=" + d.data.name.split("||")[1].split("##")[0] + "&form.arrayId=" + d.parent.parent.parent.parent.parent.parent.data.name.split("||")[1].split("##")[1] + "&form.controllerLabel=" + d.parent.parent.parent.parent.name.split("||")[1].split("##")[0] + "&form.volumeGroup=" + d.parent.parent.data.name.split("||")[1].split("##")[0], "_blank");
							}
                        }
                        return true;
                    });
                    //update caret direction
                    nodeEls.select("span.caret").attr("class", function (d) {
                        var icon = d.children ? " glyphicon-chevron-down"
                             : d._children ? "glyphicon-chevron-right" : "";
						var caret = (typeof(d.children)=="undefined" && typeof(d._children)=="undefined")?"":"caret";
                        return caret + " glyphicon " + icon;
                    });
                    //update position with transition
                    nodeEls.transition().duration(duration)
                    .style("top", function (d) {
                        return (d.y - tree.nodeHeight()) + 75 + "px";
                    })
                    .style("left", function (d) {
						var left = (typeof(d.children)=="undefined" && typeof(d._children)=="undefined")?40:20;
                        return d.x + left + "px";
                    })
                    .style("opacity", 1);
                    nodeEls.exit().remove();
					
                    var min_height="450px";
                    var node_height = nodes.length * 35;
                    if(node_height > 450)
                    {
                        min_height = node_height + 'px';
                    }
                    $('#dendogram_el').closest('.dashboard-element').css('min-height',min_height);
                    $('#dendogram_el').closest('.dashboard-element').css('overflow-y', 'auto');
                }

                render(data, data);
            }
        });
    return Dendrogram;
});