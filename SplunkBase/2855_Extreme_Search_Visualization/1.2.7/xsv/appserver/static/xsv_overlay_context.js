/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: xs_context_overlay

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
    "splunkjs/mvc/searchmanager",
    "app/xsv/contextChart",
    "app/xsv/searchUtil",
    "app/xsv/urlUtil",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "util/moment",
    "splunkjs/ready!"
    //"splunkjs/mvc/simplexml/ready!"
], function(_, $, utils, mvc, SearchbarView, SearchControlsView, TableView, SearchManager, ContextChart, SearchUtil, URLUtil, d3, nv, moment) {

        //applyStyle();

        var dataLoaded = null;
        var overlayData = null;
        var contextData = null;

        var scopeName = null;
        var containerName = null;
        var contextName = null;
        var className = null;
        var fieldName = null;
        var earliest = "-24h";
        var latest = "now";

        var contextOverlaySearchbar = null;
        var contextOverlaySearchManager = null;

        function getApps() {
            $(".xsv_populating.xsv_app").show();
            var scopeName = $("#scopeSelect").val();
            var searchString  = "| xsvListApps scope=" + scopeName + "| stats count by Title,Label | fields Title,Label";
            var $el = $('#appSelect');
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

        function getParams() {
            appName = $("#appSelect").val();
            scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            containerName = $("#containerSelect").val();
            contextName = $("#contextSelect").val();
            className = $("#classSelect").val();
            fieldName = $("#fieldTI").val();

            if ((appName === "") || (appName ==undefined) || (scopeName === "") || (scopeName == undefined) || (containerName === "") || (containerName == undefined) || (contextName === "") || (contextName == undefined)) { 
                return false;
            }
            if ((fieldName === "") || (fieldName == undefined)) {
                fieldName = contextName;
            }
            return true;
        }


        function getContextSearchString() {
            var min = $("#domainMinTI").val();
            var domainMinString = "";
            if (min != "") {
                domainMinString = " domainmin=" + min;
            }
            var max = $("#domainMaxTI").val();
            var domainMaxString = "";
            if (max != "") {
                domainMaxString = " domainmax=" + max;
            }

            var result = "| xsvDisplayContext FROM " + contextName;
            result += " IN " + containerName;
            result += (className === "") ? "" : " BY \"" + className + "\"";
            result += " SCOPED " + scopeName;
            result += " APP " + appName;
            result += domainMinString;
            result += domainMaxString;
            return result;
        }

        function getContextData() {
            var searchString = getContextSearchString();
            var $el = $('#contextData');
            self.SearchUtil.run($el, searchString);
        }

        function getContextAttributes() {
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var containerName = $("#containerSelect").val();
            var contextName = $("#contextSelect").val();
            var className = $("#classSelect").val();
            var contextSearchString = "| xsvDisplayContextAttributes " + contextName;
            contextSearchString += " IN " + containerName;
            contextSearchString += (className === "") ? "" : " BY \"" + className + "\"";
            contextSearchString += " SCOPED " + scopeName;
            contextSearchString += " APP " + appName;

            var $el = $('#contextAttributes');
            self.SearchUtil.run($el, contextSearchString);
        }

        function getOverlayData(searchString) {

            var contextName = $("#contextSelect").val();
            if (contextName !== null) {
                var $el = $('#overlayData');
                var overlaySearchString = searchString + " | stats count by " + fieldName;
                self.SearchUtil.run($el, overlaySearchString, earliest,latest);
            }
            else {
                console.log("ERROR: getOverlayData(): contextName is NULL");
            }
        }

        function processSearch (searchString) {
            console.log("processSearch() entry ...");

            dataLoaded = _.after(2, function() {
                console.log("dataLoaded!!!");
                var $el = $("#contextOverlayChart");
                this.ContextChart.renderContextOverlayChart(contextName, $el, overlayData, contextData);
                if (overlayData != null) {
                    $('#overlayChartModal').modal('hide');
                    $('#overlayChartModal').css('z-index', '-9999');
                }
            });

            requiredParamsPresent = true;
            getContextData(searchString);
            getOverlayData(searchString);

	}

        function createSearchHandlers() {
            // Instantiate the views and search manager

            contextOverlaySearchManager = new SearchManager({
                id: "contextSearchOverlayManager",
                app: "search",
                preview: true,
                required_field_list: "*",
                status_buckets: 300,
                earliest_time: earliest,
                latest_time: latest,
                search: ""
                //search: "index=_internal | head 100"
            });

            contextOverlaySearchbar = new SearchbarView({
                id: "searchbar1",
                managerid: "contextSearchOverlayManager",
                earliest_time: earliest,
                latest_time: latest,
                el: $("#contextOverlaySearchbar")
            }).render();

            //contextOverlaySearchbar.timerange.val({"earliest_time":earliest, "latest_time":latest});

            contextOverlaySearchbar.timerange.on("change", function() {
                //contextSearchOverlayManager.settings.set(contextOverlaySearchbar.timerange.val());
                contextOverlaySearchManager.settings.set(contextOverlaySearchbar.timerange.val());
                var timerangeVal = contextOverlaySearchbar.timerange.val();
                earliest = timerangeVal.earliest_time;
                latest = timerangeVal.latest_time;
                console.log("timerange change: earliest="+earliest+", latest="+latest);
            });


            //var contextOverlaySearchcontrols = new SearchControlsView({
            //    id: "searchcontrols1",
            //    managerid: "contextSearchOverlayManager",
            //    el: $("#contextOverlaySearchcontrols")
            //}).render();

            var contextOverlayTable = new TableView({
                id: "contextOverlayTable",
                managerid: "contextSearchOverlayManager",
                el: $("#contextOverlayTable")
            }).render();



            // Update the search manager when the query in the searchbar changes
            contextOverlaySearchbar.on("change", function() {
                contextOverlaySearchManager.settings.unset("search");
                var searchString = contextOverlaySearchbar.val();
                var numEvents = $("#numEventsSelect").val();
                if (numEvents != "") searchString += " | head " + numEvents;
                
                contextOverlaySearchManager.settings.set("search", searchString);
                $('#overlayChartModalEventMessage').html("");
                if (getParams() !== true) { 
                    require(["bootstrap.modal"],function() {
                        var msg = "Scope, Container, Context, and Field are required parameters. Please try again.!";
                        $('#overlayChartModalLabel').html("ERROR MESSAGE");
                        $('#overlayChartModalMessage').html(msg);
                        $('#overlayChartModal').css('z-index', '9999');
                        $('#overlayChartModal').modal('show');
                    });
                }
		else
                {
                    require(["bootstrap.modal"],function() {
                        var msg = "Loading Context and Search Data ...";
                        $('#overlayChartModalLabel').html("IN PROGRESS");
                        $('#overlayChartModalMessage').html(msg);
                        $('#overlayChartModal').modal('show');
                        $('#overlayChartModal').css('z-index', '9999');
                    });

                    processSearch(searchString);
                }
            });
        }

        function createHandlers() {

            $(".actionMin").click("mousedown", function(){
                $(this).parents(".html").find(".moduleContent,.actionMin").hide();
                $(this).parents(".html").find(".actionMax").show();
            });

            $(".actionMax").click("mousedown", function(){
                $(this).parents(".html").find(".moduleContent,.actionMin").show();
                $(this).parents(".html").find(".actionMax").hide();
            });

            $('#appSelect').on("change", function(e) {
                getContainers();
            });

            $('#scopeSelect').on("change", function(e) {
                //getContainers();
                getApps();
            });

            $('#containerSelect').on("change", function(e) {
                getContexts();
            });

            $('#contextSelect').on("change", function(e) {
                getClasses();
            });

            $("#appSelect").on('loaded', function(event) {
                var searchResults = event.searchResults;
                $("#appSelect").html("");
                $("#containerSelect").html("");
                $("#contextSelect").html("");
                $("#classSelect").html("");

                if (searchResults != null) {
                    _.each (searchResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row[0] + "\">"+row[1]+"</option>";
                        $("#appSelect").append(optionHtml);
                    });

                    if ((app != undefined) && (app != null)) {
                        $("#appSelect").val(app);
                        app = null;
                    }

                    getContainers();
                }
                else {
                    $(".xsv_populating.xsv_container").hide();
                    $(".xsv_populating.xsv_context").hide();
                    $(".xsv_populating.xsv_class").hide();
                    $("#appSelect").html("");
                    $("#containerSelect").html("");
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
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

                    if ((container != undefined) && (container != null)) {
                        $("#containerSelect").val(container);
                        container = null;
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
                    $(".xsv_populating.xsv_class").hide();
                    $(".xsv_populating.xsv_concept").hide();
                }
                else {
                    $("#contextSelect").html("");
                    _.each (contextDataResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#contextSelect").append(optionHtml);
                    });

                    if ((context != undefined) && (context != null)) {
                        $("#contextSelect").val(context);
                        context = null;
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

                    if ((theClass != undefined) && (theClass != null)) {
                        $("#classSelect").val(theClass);
                        theClass = null;
                    }
                }
                $(".xsv_populating.xsv_class").hide();

                // Get Context Data and see if search field is populated!
                getContextAttributes();
            });

            $("#contextAttributes").on('loaded', function(event) {
                var contextAttributes = event.searchResults;
                if (contextAttributes != null) {
                    console.log("Got Context Attributes");
                    var search = contextAttributes.rows[0][11];
                    if ((search != null) && (search != "")) {
                        //search = decodeURIComponent(search);
                        var index = search.search(/\| *stats/i);
                        if (index > 0) {
                            search = search.substring(0,index-1);
                            console.log("search="+search);
                            contextOverlaySearchbar.val(search);
                            contextOverlaySearchManager.settings.set("search", search);
                        }
                    }
                    else {
                        console.log("no search string");
                    }
                }
            });

            $("#contextData").on('loaded', function(event) {
                contextData = event.searchResults;
                if (contextData == null) {
                    require(["bootstrap.modal"],function() {
                        var msg = "A problem was encountered retrieving the selected context. Please try again.!";
                        $('#overlayChartModalMessage').html(msg);
                        $('#overlayChartModal').modal('show');
                        $('#overlayChartModal').css('z-index', '9999');
                    });
                }
                else {
                    dataLoaded();
                }
            });

            $("#overlayData").on('progress', function(event) {
                $('#overlayChartModalEventMessage').html(event.statusMessage);
            });

            $("#overlayData").on('loaded', function(event) {
                overlayData = event.searchResults;
                if (overlayData == null) {
                    require(["bootstrap.modal"],function() {
                        var msg = "The search did not return events containing the context field!";
                        $('#overlayChartModalMessage').html(msg);
                        $('#overlayChartModal').modal('show');
                        $('#overlayChartModal').css('z-index', '9999');
                        dataLoaded();
                    });
                }
                else {
                    dataLoaded();
                }
            });
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

        var scope = self.URLUtil.getURLParam("scope");
        if (scope != undefined) {
            $("#scopeSelect").val(scope);
        }
        else {
            $("#scopeSelect").val($("#scopeSelect option:first").val());
        }
        var app = self.URLUtil.getURLParam("app");
        var container = self.URLUtil.getURLParam("container");
        var context = self.URLUtil.getURLParam("context");
        var theClass = self.URLUtil.getURLParam("class");

        createCopyrightDiv();
        createHandlers();
        createSearchHandlers();
        getApps();

        $("#element1 .panel-body.html").css("overflow","visible");
});

