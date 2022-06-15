/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: xs_edit_context

*/
require.config({
    paths: {
        "app": "../app"
    },
    "shim": {
        "app/xsv/nv.d3": ["app/xsv/d3.v3"]
    },
    urlArgs: "bust=1_0_1"
});

require([
    "underscore",
    "jquery",
    "splunkjs/mvc/utils",
    "splunkjs/mvc",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/searchmanager",
    "app/xsv/contextChart",
    "app/xsv/searchUtil",
    "app/xsv/conceptUtil",
    "app/xsv/urlUtil",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "util/moment",
    "splunkjs/ready!"
    //"splunkjs/mvc/simplexml/ready!"
], function(_, $, utils, mvc, SearchbarView, SearchControlsView, SearchManager, ContextChart, SearchUtil, ConceptUtil, URLUtil, d3, nv, moment ) {
    require(['splunkjs/ready!'], function() {

        var contextCompareData = null;
        var dataLoaded = null;
        var contextName = null;
        var domainMin = 0;
        var domainMax = 0;
        var domainMinList = [];
        var domainMaxList = [];
        var conceptList = [];
        var selectedAppName = "";
        var selectedScopeName = "";
        var selectedContainerName = "";
        var selectedContextName = "";
        var selectedClassName = "";
        var selectedHedgeName = "";
        var selectedConceptName = "";

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

        function getHedges() {
            var self = this;
            $(".xsv_populating.xsv_hedge").show();
            var $el = $('#hedgeSelect');
            //var searchString = " | inputlookup synonyms.csv start=11 | where hedge != \"_noise\" | fields hedge | dedup hedge";
            var searchString = " | inputlookup synonyms2.csv start=11 | fields word | sort word";
            self.SearchUtil.run($el, searchString);
        }

        function getConcepts() {
            var self = this;
            $(".xsv_populating.xsv_concept").show();
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var containerName = $("#containerSelect").val();
            var contextName = $("#contextSelect").val();
            var className = $("#classSelect").val();
            var byClause = (className === "") ? "" : " BY \"" + className + "\"";
            var $el = $('#conceptSelect');
            var searchString = " | xsvListConcepts FROM " + contextName + " IN " + containerName + byClause + " SCOPED " + scopeName + " APP " + appName + " | sort concept";
            self.SearchUtil.run($el, searchString);
        }

        function getContextAttributes() {
            var appName = $("#appSelect").val();
            var scopeName = $("#scopeSelect").val();
            if (scopeName != "private") scopeName = appName;
            var containerName = $("#containerSelect").val();
            var contextName = $("#contextSelect").val();
            var className = $("#classSelect").val();
            var byClause = (className === "") ? "" : " BY \"" + className + "\"";
            var $el = $('#contextAttributes');
            var searchString = "| xsvGetContextFields " + contextName + 
                               " IN " + containerName + 
                               byClause + 
                               " SCOPED " + scopeName +
                               " APP " + appName +
                               " FIELDS domainMin domainMax";
            self.SearchUtil.run($el, searchString);
        }

        function getContextCompareData(searchString) {
            var self = this;
            var $el = $('#contextCompare');
            self.SearchUtil.run($el, searchString);
        }

        function processSearch (searchString) {
            console.log("processSearch() entry ...");
            require(["bootstrap.modal"],function() {
                var msg = "Loading Concept ...";
                $('#compareContextModalLabel').html("IN PROGRESS");
                $('#compareContextModalMessage').html(msg);
                $('#compareContextModal').modal('show');
            });

            dataLoaded = _.after(2, function() {
                console.log("dataLoaded!!!");
                var $el = $("#contextChart");
                this.ContextChart.renderContextCompareChart(contextName, domainMinList, domainMaxList, $el, contextCompareData, conceptList);
            });

            getContextAttributes();
            getContextCompareData(searchString);

	}

        function updateChart () {
            var searchString = "| xsvDisplayConcept ";
            
            for (var i = 0; i < conceptList.length; i++) {
                var byClause = (conceptList[i].className === "") ? "" : " BY \"" + conceptList[i].className + "\"";
                var scope = (conceptList[i].scopeName == "private") ? "private" : conceptList[i].appName;
                searchString += conceptList[i].hedgeName + " " + conceptList[i].conceptName + " FROM " + conceptList[i].contextName + " IN " + conceptList[i].containerName + " SCOPED " + scope + " APP " + conceptList[i].appName + byClause;
                if (i < conceptList.length-1) searchString += "; ";
            }

            if (conceptList.length != 0) {
                console.log("searchString=" + searchString);
                processSearch(searchString);
            }
            else {
                $("#contextChart svg").html("");
                //var emptyData = {rows:[],fields:[]};
                //var $el = $("#contextChart");
                //this.ContextChart.renderContextCompareChart("", domainMinList, domainMaxList, $el, emptyData, conceptList);
                $('#chartModal').modal('hide');
            }
        }

        function createCopyrightDiv() {
            $('#dashboard').append("<div><p>&#0169; Copyright 2015 Scianta Analytics LLC.  All Rights Reserved - Custom App Development for Splunk by Concanon LLC</p></div>");
        }

        function createHandlers () {
            var self = this;


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
            $('#classSelect').on("change", function(e) {
                getConcepts();
            });

            $("#submitButton").click(function() {
                
                var requiredParamsPresent = true;
                var appName = $("#appSelect").val();
                var scopeName = $("#scopeSelect").val();
                var containerName = $("#containerSelect").val();
                var contextName = $("#contextSelect").val();
                var className = $("#classSelect").val();
                //var hedgeName = $("#hedgeSelect").val();
                var hedgeName = "";
                var hedgeList = $("#hedgeSelect").select2("val");
                //for (var i = 0; i < hedgeList.length; i++)
                for (var i = hedgeList.length-1; i >= 0; i--)
                    hedgeName += hedgeList[i] + " ";
                var conceptName = $("#conceptSelect").val();
                console.log("Add Button clicked: appName="+appName+"scopeName="+scopeName+",containerName="+containerName+",contextName="+contextName+",className="+className+",hedgeName="+hedgeName+",conceptName="+conceptName);
                if ((appName === "") || (appName == undefined) || (scopeName === "") || (scopeName == undefined) || (containerName === "") || (containerName == undefined) || (contextName === "") || (contextName == undefined) || (conceptName === "") || (conceptName == undefined)) {
                    requiredParamsPresent = false;
                    require(["bootstrap.modal"],function() {
                        var msg = "App, Scope, Container, Context, Class, and Concept are required parameters. Please try again.!";
                        $('#compareContextModalMessage').html(msg);
                        $('#compareContextModal').modal('show');
                    });
                }

                if (requiredParamsPresent !== true) return;

                var tmp = { "appName": appName, "scopeName": scopeName, "containerName": containerName, "contextName":contextName, "className":className, "hedgeName":hedgeName, "conceptName": conceptName, "hedgeName":hedgeName };
                conceptList.push(tmp);

                updateChart();
            });


            $("#removeConcept").click(function() {
                var appName = $("#appNameModal").text();
                var scopeName = $("#scopeNameModal").text();
                var containerName = $("#containerNameModal").text();
                var contextName = $("#contextNameModal").text();
                var className = $("#classNameModal").text();
                var conceptName = $("#conceptNameModal").text();
                var hedgeName = $("#hedgeNameModal").text();

                for (var i = 0; i < conceptList.length; i++) {
                    if ((appName == conceptList[i].appName) && 
                        (scopeName == conceptList[i].scopeName) && 
                        (containerName == conceptList[i].containerName) && 
                        (contextName == conceptList[i].contextName) && 
                        (className == conceptList[i].className) && 
                        (conceptName == conceptList[i].conceptName) && 
                        (hedgeName == conceptList[i].hedgeName)) {

                        conceptList.splice(i,1);
                    }
                }
                updateChart();
            });

            $("#contextChart svg").click(function(e) {
                if (e.target.__data__ != undefined) {
                    var key = e.target.__data__.key.trim();
                    var appName = e.target.__data__.appName;
                    var scopeName = e.target.__data__.scopeName;
                    var containerName = e.target.__data__.containerName;
                    var contextName = e.target.__data__.contextName;
                    var className = e.target.__data__.className;
                    var conceptName = e.target.__data__.conceptName;
                    var hedgeName = e.target.__data__.hedgeName;

                    // Which concept did user click?
                    for (var i = 0; i < conceptList.length; i++) {
                        var theClass = conceptList[i].className;
                        if (theClass == null)
                              theClass = "";
                        if ((appName == conceptList[i].appName) &&
                            (scopeName == conceptList[i].scopeName) &&
                            (containerName == conceptList[i].containerName) &&
                            (contextName == conceptList[i].contextName) &&
                            (className == conceptList[i].className) &&
                            (conceptName == conceptList[i].conceptName) &&
                            (hedgeName == conceptList[i].hedgeName)) {

                            // Get detail for the selected concept
                            self.selectedAppName = appName;
                            self.selectedScopeName = scopeName;
                            self.selectedContainerName = containerName;
                            self.selectedContextName = contextName;
                            self.selectedClassName = className;
                            self.selectedHedgeName = hedgeName;
                            self.selectedConceptName = conceptName;

                            var html = self.ConceptUtil.getConceptDetailSummary(self.selectedAppName, self.selectedScopeName, self.selectedContainerName, self.selectedContextName, self.selectedClassName, self.selectedHedgeName, self.selectedConceptName);
                            require(["bootstrap.modal"],function() {
                                var msg = "details here ...";
                                $('#chartModalLabel').html("Concept Details");
                                $('#chartModalMessage').html(html);
                                $('#chartModal').modal('show');
                            });
                        }
                    }
                }
            });

            $("#appSelect").on('loaded', function(event) {
                $("#appSelect").html("");
                var appDataResults = event.searchResults;
                if (appDataResults == null) {
                    $("#containerSelect").html("");
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
                    $("#conceptSelect").html("");
                }
                else {
                    _.each (appDataResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row[0] + "\">"+row[1]+"</option>";
                        $("#appSelect").append(optionHtml);
                    });

                    if ((app != undefined) && (app != null)) {
                        $("#appSelect").val(app);
                        app = null;
                    }

                    getContainers();
                }
                $(".xsv_populating.xsv_app").hide();
            });

            $("#containerSelect").on('loaded', function(event) {
                $("#containerSelect").html("");
                var containersDataResults = event.searchResults;
                if (containersDataResults == null) {
                    $("#contextSelect").html("");
                    $("#classSelect").html("");
                    $("#conceptSelect").html("");
                    $(".xsv_populating.xsv_context").hide();
                    $(".xsv_populating.xsv_class").hide();
                    $(".xsv_populating.xsv_concept").hide();
                }
                else {
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
                $("#contextSelect").html("");
                var contextDataResults = event.searchResults;
                if (contextDataResults == null) {
                    $("#classSelect").html("");
                    $("#conceptSelect").html("");
                }
                else {
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
                $("#classSelect").html("");
                var classDataResults = event.searchResults;
                if (classDataResults == null) {
                    var optionHtml = "<option value=\"\">Default Context</option>";
                    $("#classSelect").append(optionHtml);
                }
                else {
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
                getConcepts();
                $(".xsv_populating.xsv_class").hide();
            });

            $("#hedgeSelect").on('loaded', function(event) {
                var hedgeDataResults = event.searchResults;
                if (hedgeDataResults == null) {
                }
                else {
                    $("#hedgeSelect").html("");
                    //var optionHtml = "<option value=\"\">None</option>";
                    var optionHtml = "";
                    $("#hedgeSelect").append(optionHtml);
                    _.each (hedgeDataResults.rows, function(row) {
                        optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#hedgeSelect").append(optionHtml);
                    });
                    //require(['app/xsv/select2-4.0.0'], function() {
                        $("#hedgeSelect").select2();
                    //});
                }
                $(".xsv_populating.xsv_hedge").hide();
            });

            $("#conceptSelect").on('loaded', function(event) {
                $("#conceptSelect").html("");
                var conceptDataResults = event.searchResults;
                if (conceptDataResults == null) {
                }
                else {
                    _.each (conceptDataResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#conceptSelect").append(optionHtml);
                    });
                    $("#conceptSelect").val($("#conceptSelect option:first").val());
                }
                $(".xsv_populating.xsv_concept").hide();
            });

            $("#contextAttributes").on('loaded', function(event) {
                var contextData = event.searchResults;
                if (contextData != null) {
                    var scopeName = $("#scopeSelect").val();
                    var containerName = $("#containerSelect").val();
                    var contextName = $("#contextSelect").val();
                    var className = $("#classSelect").val();
                    var obj = new Object();
                    obj.key = contextName+"/"+className;
                    obj.container = containerName;
                    obj.context = contextName;
                    obj.class = className;
                    obj.scope = scopeName;
                    obj.val = parseFloat(contextData.rows[0][0]);
                    domainMinList.push(obj);
                    obj = new Object();
                    obj.key = contextName+"/"+className;
                    obj.container = containerName;
                    obj.context = contextName;
                    obj.class = className;
                    obj.scope = scopeName;
                    obj.val = parseFloat(contextData.rows[0][1]);
                    domainMaxList.push(obj);
                    dataLoaded();
                }
            });
            $("#contextCompare").on('loaded', function(event) {
                contextCompareData = event.searchResults;
                if (contextCompareData == null) {
                    require(["bootstrap.modal"],function() {
                        var msg = "A problem was encountered retrieving the concept information. Please try again.!";
                        $('#compareContextModalLabel').html("ERROR MESSAGE");
                        $('#compareContextModalMessage').html(msg);
                        $('#compareContextModal').modal('show');
                    });
                }
                else {
                    dataLoaded();
                    $('#compareContextModal').modal('hide');
                    $('#chartModal').modal('hide');
                }
            });
        }

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
        getApps();
        getHedges();
    });
});
