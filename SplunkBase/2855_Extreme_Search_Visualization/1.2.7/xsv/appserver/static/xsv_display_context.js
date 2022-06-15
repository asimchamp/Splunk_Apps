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
    "app/xsv/searchUtil",
    "app/xsv/contextChart",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "util/moment",
    "splunkjs/ready!"
], function(_, $, utils, mvc, SearchbarView, SearchControlsView, TableView, SearchManager, SearchUtil, ContextChart, d3, nv, moment) {

        var contextDataTableId = 0;
        var contextSearchId = 0;

        var scopeName = null;
        var containerName = null;
        var contextName = null;
        var className = null;

        function getApps() {
            $(".xsv_populating.xsv_app").show();
            var scopeName = $("#scopeSelect").val();
            var searchString  = "| xsvListApps scope=" + scopeName + "| stats count by Title,Label | fields Title,Label";
            var $el = $('#appSelect');
            self.SearchUtil.run($el, searchString);
        }

        function getContainers() {
            $(".xsv_populating.xsv_container").show();
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var searchString = "| xsvListContexts SCOPED " + scopeName + " APP " + appName + " | stats count by Container | fields Container";
            var $el = $('#containerSelect');
            self.SearchUtil.run($el, searchString);

        }

        function getContexts() {
            $(".xsv_populating.xsv_context").show();
            var appName = $("#appSelect").val();
            var containerName = $("#containerSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var searchString = "| xsvListContexts SCOPED " + scopeName + " APP " + appName + " IN " + containerName + " | stats count by Container,Context | fields Context";
            var $el = $('#contextSelect');
            self.SearchUtil.run($el, searchString);
        }

        function getClasses() {
            $(".xsv_populating.xsv_class").show();
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var containerName = $("#containerSelect").val();
            var contextName = $("#contextSelect").val();

            var searchString = " | xsvListContexts IN " + containerName + " SCOPED " + scopeName + " APP " + appName + " | stats count by Container,Context,Class | where Container=\"" + containerName + "\" and Context=\"" +contextName + "\" | sort Class | fields Class";
            var $el = $('#classSelect');
            self.SearchUtil.run($el, searchString);
        }

        function getContextData() {
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var containerName = $("#containerSelect").val();
            var contextName = $("#contextSelect").val();
            var className = $("#classSelect").val();

            var searchString = "| xsvDisplayContext FROM " + contextName;
            searchString += " IN " + containerName;
            searchString += (className === "") ? "" : " BY \"" + className + "\"";
            searchString += " SCOPED " + scopeName;
            searchString += " APP " + appName;

            var $el = $('#contextChart');
            self.SearchUtil.run($el, searchString);
        }

        function createHandlers() {
            var self = this;

            $(".actionMin").click("mousedown", function(){
                $(this).parents(".html").find(".moduleContent,.actionMin").hide();
                $(this).parents(".html").find(".actionMax").show();
            });

            $(".actionMax").click("mousedown", function(){
                $(this).parents(".html").find(".moduleContent,.actionMin").show();
                $(this).parents(".html").find(".actionMax").hide();
            });

            $('#scopeSelect').on("change", function(e) {
                getApps();
            });

            $('#appSelect').on("change", function(e) {
                getContainers();
            });

            $('#containerSelect').on("change", function(e) {
                getContexts();
            });

            $('#contextSelect').on("change", function(e) {
                getClasses();
            });

            $("#submitButton").click(function() {
                getContextData();
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
                    $("#appSelect").val($("#appSelect option:first").val());

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
                var searchResults  = event.searchResults;
                $("#containerSelect").html("");
                if (searchResults != null) {
                    _.each (searchResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#containerSelect").append(optionHtml);
                    });
                    $("#containerSelect").val($("#containerSelect option:first").val());
                    getContexts();
                }
                else {
                    $(".xsv_populating.xsv_context").hide();
                    $(".xsv_populating.xsv_class").hide();
                    $("#containerSelect").html("");
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
                }
                $(".xsv_populating.xsv_container").hide();
            });

            $("#contextSelect").on('loaded', function(event) {
                var searchResults  = event.searchResults;
                if (searchResults != null) {
                    $("#contextSelect").html("");
                    _.each (searchResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#contextSelect").append(optionHtml);
                    });
                    $("#contextSelect").val($("#contextSelect option:first").val());
                    getClasses();
                }
                else {
                    $(".xsv_populating.xsv_class").hide();
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
                }
                $(".xsv_populating.xsv_context").hide();
            });

            $("#classSelect").on('loaded', function(event) {
                var searchResults  = event.searchResults;
                if (searchResults != null) {
                    $("#classSelect").html("");
                    var optionHtml = "<option value=\"\">Default Context</option>";
                    $("#classSelect").append(optionHtml);
                    _.each (searchResults.rows, function(row) {
                        optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#classSelect").append(optionHtml);
                    });
                    $("#classSelect").val($("#classSelect option:first").val());
                }
                else {
                    $("#classSelect").html("");
                    var optionHtml = "<option value=\"\">Default Context</option>";
                    $("#classSelect").append(optionHtml);
                }
                $(".xsv_populating.xsv_class").hide();
            });

            $("#contextChart").on('loaded', function(event) {
                var searchResults  = event.searchResults;
                if (searchResults != null) {
		    var contextRows = searchResults.rows;
		    var domainMin = Number(contextRows[0][0]);
                    var domainMax = Number(contextRows[contextRows.length-1][0]);
                    var $el = $("#contextChart");
                    self.ContextChart.renderContextChart2(contextName, domainMin, domainMax, $el, searchResults);

                    $("#contextTable").html("");
                    var TableView = require("splunkjs/mvc/tableview");
                    contextDataTableId++;
                    tableView = new TableView({
                        //managerid: "contextSearchManager-"+contextSearchId,
                        managerid: "xsv-"+self.SearchUtil.searchId,
                        el: $("#contextTable")
                    }).render();

                }
                else {
                    require(["bootstrap.modal"],function() {
                        var msg = "A problem was encountered retrieving the selected context. Please try again.!";
                        $('#displayContextModalMessage').html(msg);
                        $('#displayContextModal').modal('show');
                    });
                }
            });
        }

        function applyStyle() {
            $(".dashboard-row.dashboard-row1 .dashboard-panel").css("background","none");
            $(".dashboard-row.dashboard-row1 .dashboard-panel").css("border","none");
        }

        function createCopyrightDiv() {
            $('#dashboard').append("<div><p>&#0169; Copyright 2015 Scianta Analytics LLC.  All Rights Reserved - Custom App Development for Splunk by Concanon LLC</p></div>");
        }

        // View Logic

        createCopyrightDiv();
        createHandlers();
        getApps();
});

