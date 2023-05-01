/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: xs_searches_context

*/
require.config({
    "paths": {
        "app": "../app"
    },
    "shim": {
	"app/xsv/nv.d3": ["app/xsv/d3.v3"]
    },
    "urlArgs": "bust=1_0_1"
});

require([
    "underscore",
    "jquery",
    "splunkjs/mvc/utils",
    "splunkjs/mvc",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/tableview",
    "app/xsv/contextChart",
    "app/xsv/searchUtil",
    "app/xsv/urlUtil",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "util/moment",
    "splunkjs/ready!"
    //"splunkjs/mvc/simplexml/ready!"
], function(_, $, utils, mvc, SearchbarView, SearchControlsView, TableView, ContextChart, SearchUtil, URLUtil, d3, nv, moment) {

        //applyStyle();

        var initialLoad = true;
        /*
        var scopeName = null;
        var containerName = null;
        var contextName = null;
        var className = null;
        */

        function getApps() {
            var self = this;
            $(".xsv_populating.xsv_scope").show();
            var $el = $('#appSelect');
            var scopeName = $("#scopeSelect").val();
            var searchString  = "| xsvListApps scope=" + scopeName + "| stats count by Title,Label | fields Title,Label";
            self.SearchUtil.run($el, searchString);
        }

        function getContainers() {
            var self = this;
            $(".xsv_populating.xsv_container").show();
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var $el = $('#containerSelect');
            var searchString = "| xsvListContexts SCOPED " + scopeName + " APP " + appName + " | stats count by Container | fields Container";
            self.SearchUtil.run($el, searchString);
        }

        function getContexts() {
            var self = this;
            $(".xsv_populating.xsv_context").show();
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var containerName = $("#containerSelect").val();
            var $el = $('#contextSelect');
            var searchString = "| xsvListContexts SCOPED " + scopeName + " APP " + appName + " in " + containerName + " | stats count by Container,Context | fields Context";
            self.SearchUtil.run($el, searchString);
        }

        function getClasses() {
            var self = this;
            $(".xsv_populating.xsv_class").show();
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var containerName = $("#containerSelect").val();
            var contextName = $("#contextSelect").val();
            var $el = $('#classSelect');
            var searchString = " | xsvListContexts IN " + containerName + " SCOPED " + scopeName + " APP " + appName + " | stats count by Container,Context,Class | where Container=\"" + containerName + "\" and Context=\"" +contextName + "\" | sort Class | fields Class";
            self.SearchUtil.run($el, searchString);
        }

        function createHandlers() {

            $('#appSelect').on("change", function(e) {
                getContainers();
            });

            $('#scopeSelect').on("change", function(e) {
                getContainers();
            });

            $('#containerSelect').on("change", function(e) {
                getContexts();
            });

            $('#contextSelect').on("change", function(e) {
                getClasses();
            });

            $("#submitButton").click(function() {
                console.log("Submit Button clicked");
                runSearch();
                /*
                var $el = $('#savedSearches');
                var searchString = " | xsvListSearches ";
                var appName = $("#appSelect").val();
                var scopeName = $("#scopeSelect").val();
                var containerName = $("#containerSelect").val();
                var contextName = $("#contextSelect").val();
                require(["bootstrap.modal"],function() {
                    var msg = "Retrieving searches that use context " + contextName + " IN " + containerName + " SCOPED " + scopeName + " ...";
                    $('#searchChartModalMessage').html(msg);
                    $('#searchChartModal').modal('show');
                });
                self.SearchUtil.run($el, searchString);
                */
            });

            $("#appSelect").on('loaded', function(event) {
                $("#appSelect").html("");
                var appDataResults = event.searchResults;
                if (appDataResults == null) {
                    $("#containerSelect").html("");
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
                }
                else {
                    _.each (appDataResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row[0] + "\">"+row[1]+"</option>";
                        $("#appSelect").append(optionHtml);
                    });

                    var app = self.URLUtil.getURLParam("app");
                    if (app != undefined) {
                        $("#appSelect").val(app);
                    }
                    else {
                        $("#appSelect").val($("#appSelect option:first").val());
                    }

                    var scope = self.URLUtil.getURLParam("scope");
                    if (scope != undefined) {
                        $("#scopeSelect").val(scope);
                    }

                    getContainers();
                }
                $(".xsv_populating.xsv_app").hide();
            });

            $("#containerSelect").on('loaded', function(event) {
                var containersDataResults = event.searchResults;
                if (containersDataResults == null) {
                    $("#containerSelect").html("");
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
                    $("#conceptSelect").html("");
                    $(".xsv_populating.xsv_context").hide();
                    $(".xsv_populating.xsv_class").hide();
                    $(".xsv_populating.xsv_concept").hide();
                }
                else {
                    $("#containerSelect").html("");
                    _.each (containersDataResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#containerSelect").append(optionHtml);
                    });

                    var container = self.URLUtil.getURLParam("container");
                    if (container != undefined) {
                        $("#containerSelect").val(container);
                    }
                    else {
                        $("#containerSelect").val($("#containerSelect option:first").val());
                    }

                    getContexts();
                }
                $(".xsv_populating.xsv_container").hide();
            });

            $("#contextSelect").on('loaded', function(event) {
                var contextDataResults = event.searchResults;
                if (contextDataResults == null) {
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
                    $("#conceptSelect").html("");
                }
                else {
                    $("#contextSelect").html("");
                    _.each (contextDataResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#contextSelect").append(optionHtml);
                    });

                    var context = self.URLUtil.getURLParam("context");
                    if (context != undefined) {
                        $("#contextSelect").val(context);
                    }
                    else {
                        $("#contextSelect").val($("#contextSelect option:first").val());
                    }
                    getClasses();
                }
                $(".xsv_populating.xsv_context").hide();
            });

            $("#classSelect").on('loaded', function(event) {
                var classDataResults = event.searchResults;
                if (classDataResults == null) {
                    $("#classSelect").html("");
                    var optionHtml = "<option value=\"\">Default Context</option>";
                    $("#classSelect").append(optionHtml);
                }
                else {
                    $("#classSelect").html("");
                    var optionHtml = "<option value=\"\">Default Context</option>";
                    $("#classSelect").append(optionHtml);
                    _.each (classDataResults.rows, function(row) {
                        optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#classSelect").append(optionHtml);
                    });

                    var theClass = self.URLUtil.getURLParam("class");
                    if (theClass != undefined) {
                        $("#classSelect").val(theClass);
                    }
                    else {
                        $("#classSelect").val($("#classSelect option:first").val());
                    }
                }
                $(".xsv_populating.xsv_class").hide();

                if (initialLoad == true) {
                    runSearch();
                    initialLoad = false;
                }
            });

            $("#savedSearches").on('loaded', function(event) {
                var found = false;
                searchData = event.searchResults;
                if (searchData == null) {
                    require(["bootstrap.modal"],function() {
                        var msg = "Failure retrieving searches.!";
                        $('#searchChartModalMessage').html(msg);
                        //$('#searchChartModal').modal('show');
                    });
                }
                else {
                    var html = "";
                    var scopeName = $("#scopeSelect").val();
                    var containerName = $("#containerSelect").val();
                    var contextName = $("#contextSelect").val();
                    var className = $("#classSelect").val();
                    _.each(searchData.rows, function(row) {
                        var theName = row[0];
                        var theApp = row[1];
                        var theSearch = row[2];
                        var theCommand = row[3];
                        var theContainer = row[4];
                        var theContext = row[5];
                        var theClass = row[6];
                        var theField = row[7];
                        var theScope = row[8];

                        if (theClass == null) theClass = "";

                        if ((containerName == theContainer) &&
                            (contextName == theContext)) {
                            console.log("Found search row ...");
                            found = true;
                            var theUrl= "/manager/xsv/saved/searches/"+encodeURIComponent(theName)+"?uri="+encodeURIComponent("/servicesNS/nobody/"+theApp+"/saved/searches/"+encodeURIComponent(theName))+"&ns="+encodeURIComponent(theApp)+"&action=edit";
                            console.log("theUrl="+theUrl);
                            html += "<tr>";
                            html += "  <td class=\"string\">"+theCommand+"</td>";
                            html += "  <td class=\"string\">"+theApp+"</td>";
                            html += "  <td class=\"string\"><a href=\""+theUrl+"\">"+theName+"</a></td>";
                            html += "</tr>";
                        }
     
                    });
                    $("#savedSearchBody").html(html);

                    if (found == false) {
                        require(["bootstrap.modal"],function() {
                            var msg = "No Searches found for selected context.!";
                            $('#searchChartModalMessage').html(msg);
                            //$('#searchChartModal').modal('show');
                        });
                    }
                    else {
                        $('#searchChartModal').modal('hide');
                    }
                }
            });
        }

        function runSearch() {
            var $el = $('#savedSearches');
            var searchString = " | xsvListSearches ";
            var scopeName = $("#scopeSelect").val();
            var containerName = $("#containerSelect").val();
            var contextName = $("#contextSelect").val();
            require(["bootstrap.modal"],function() {
                var msg = "Retrieving searches that use context " + contextName + " IN " + containerName + " SCOPED " + scopeName + " ...";
                $('#searchChartModalMessage').html(msg);
                $('#searchChartModal').modal('show');
            });
            self.SearchUtil.run($el, searchString);
        }

        function applyStyle() {
            $(".dashboard-row.dashboard-row1 .dashboard-panel").css("background","none");
            $(".dashboard-row.dashboard-row1 .dashboard-panel").css("border","none");
            $(".dashboard-row.dashboard-row2 .dashboard-panel").css("background","none");
            $(".dashboard-row.dashboard-row2 .dashboard-panel").css("border","none");
            $(".dashboard-row.dashboard-row1 .panel-body.html").css("padding-bottom","0px");
            $(".dashboard-row.dashboard-row1 .panel-body.html").css("padding-top","0px");
            $(".dashboard-row.dashboard-row1 .dashboard-panel").css("padding-bottom","0px");
        }

        function createCopyrightDiv() {
            $('#dashboard').append("<div><p>&#0169; Copyright 2015 Scianta Analytics LLC.  All Rights Reserved - Custom App Development for Splunk by Concanon LLC</p></div>");
        }

        // View Logic
        self.URLUtil.loadURLParams();
        createCopyrightDiv();
        createHandlers();
        getApps();
});

