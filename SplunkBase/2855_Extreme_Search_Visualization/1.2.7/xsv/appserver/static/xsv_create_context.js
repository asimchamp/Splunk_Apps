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
    urlArgs: "bust=" + (new Date()).getTime()
    //urlArgs: "bust=1_0_1"
});

require([
    "underscore",
    "jquery",
    "bootstrap.dropdown",
    "splunkjs/mvc/utils",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/timerangeview",
    "app/xsv/conceptVectorUtil",
    "app/xsv/contextChart",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "app/xsv/searchUtil",
    "splunkjs/ready!"
], function(_, $, dropdown, utils, mvc, SearchManager, TimeRangeView, ConceptVectorUtil, ContextChart, d3, nvd3, SearchUtil) {
    require(['splunkjs/ready!'], function() {

        var SearchManager = require("splunkjs/mvc/searchmanager");
        var TimeRangeView = require("splunkjs/mvc/timerangeview");

        var earliest = "-1d@d";
        var latest = "now";

        var timeRange = new TimeRangeView({
            id: "timeRange",
            earliest_time: "-1d@d",
            latest_time: "now",
            status_buckets: 300,
            el: $("#timeRange")
        }).render().on("change", function() {
            var tmp = timeRange.val();
            earliest = tmp.earliest_time;
            latest = tmp.latest_time;
            console.log("Time Range Change: earliest="+earliest+", latest="+latest);
        });

        var createContextCommand = null;
        var updateContextCommand = null;
        var selectedMethod = null;
        var conceptList = null;
        var doConceptCheck = true;

        function createContext() {
            var self = this;
            var missingRequiredField = false;
            
            var contextName = $("#contextNameTI").val();
            var containerName = contextName;

            var selectedType = "domain";

            if (contextName === "") {
                missingRequiredField = true;
            }

            var search = $("#searchTA").val();
            if (search === "") {
                missingRequiredField = true;
            }
            var statsCommand = getStatsCommand();

            var notes= "The context " + contextName + " was created with Extreme Search Visualization";
            var type= "domain";


            if (selectedMethod === "dataDefined") {

                createContextCommand = " | xsCreateDDContext";
                updateContextCommand = " | xsUpdateDDContext";
                var commandParams =
                    " name=" + contextName +
                    " container=" + containerName +
                    " scope=app" +
                    " class=\"" + getClassList() + "\"" +
                    " terms=\"" + getConceptNameList() + "\"" +
                    " notes=\"" + notes + "\"" +
                    " read=\"*\"" +
                    //" search=\"" + encodeURIComponent(search + statsCommand) + "\"" +
                    " search=\"" + search + statsCommand + "\"" +
                    " type=" + selectedType +
                    " write=\"*\"";
                createContextCommand = search + statsCommand + createContextCommand + commandParams;
                updateContextCommand = search + statsCommand + updateContextCommand + commandParams;
            }
            else if (selectedMethod === "crossoverDriven") {

                createContextCommand = " | xsCreateCDContext";
                updateContextCommand = " | xsUpdateCDContext";
                var commandParams =
                    " name=" + contextName +
                    " container=" + containerName +
                    " scope=app" +
                    " class=\"" + getClassList() + "\"" +
                    " terms=\"" + getConceptNameList() + "\"" +
                    " notes=\"" + notes + "\"" +
                    " read=\"*\"" +
                    //" search=\"" + encodeURIComponent(search + statsCommand) + "\"" +
                    " search=\"" + search + statsCommand + "\"" +
                    " write=\"*\"";
                createContextCommand = search + statsCommand + createContextCommand + commandParams;
                updateContextCommand = search + statsCommand + updateContextCommand + commandParams;
            }
            else if (selectedMethod === "anomalyDriven") {

                createContextCommand = " | xsCreateADContext";
                updateContextCommand = " | xsUpdateADContext";
                var commandParams =
                    " name=" + contextName +
                    " container=" + containerName +
                    " scope=app" +
                    " endshape=\"" + conceptList[0].shape + "\"" +
                    " shape=\"" + conceptList[1].shape + "\"" +

                    " class=\"" + getClassList() + "\"" +
                    " terms=\"" + getConceptNameList() + "\"" +
                    " notes=\"" + notes + "\"" +
                    " read=\"*\"" +
                    //" search=\"" + encodeURIComponent(search + statsCommand) + "\"" +
                    " search=\"" + search + statsCommand + "\"" +
                    " write=\"*\"";
                createContextCommand = search + statsCommand + createContextCommand + commandParams;
                updateContextCommand = search + statsCommand + updateContextCommand + commandParams;
            }

            var $el = $('#single-step-done-view-container');
            self.SearchUtil.run($el, createContextCommand, earliest, latest);
            $("#single-step-create-view-container").hide();
            $("#single-step-done-view-container").show();
            $("#single-step-review-inprogress-panel").show();
        }

        function getClassList() {
            var theClassList = "";
            var addComma = false;
            $("#classListUL li").each(function( index ) {
                 if (addComma) {
                    theClassList += ","; 
                 }
                 addComma = true;
                 var tmpString = $(this).text();
                 var length = tmpString.length - 1;
                 theClassList += tmpString.substring(0,length).trim();
            });

            if ($('#dayOfWeekCB').is(':checked')) {
                if (addComma) {
                    theClassList += ","; 
                }
                 theClassList += "date_wday";
            }

            if ($('#hourOfDayCB').is(':checked')) {
                if (addComma) {
                    theClassList += ","; 
                }
                 theClassList += "date_hour";
            }

            return theClassList;
        }

        function getConceptNameList() {
            var result = "";
            for (var i = 0 ; i < conceptList.length; i++) {
                result += conceptList[i].name;
                if (i < conceptList.length-1) {
                    result += ",";
                }
            }
            return result;
        }

        function getCustomConcepts () {
            var result = [];
            $("#conceptRows tr").each(function(row) {
                console.log("row="+row);
                var conceptName = $(this).find("input").val();
                var conceptShape = $(this).find("select").val();
                result.push ({"name":conceptName, "shape":conceptShape });
            });
            return result;
        }

        function setConceptObjects() {
            var result = [];
            if (selectedMethod == "dataDefined") {
                var concept = {"name":"minimal","shape":"curvedecrease"};
                result.push(concept);
                concept = {"name":"low","shape":"pi"};
                result.push(concept);
                concept = {"name":"medium","shape":"pi"};
                result.push(concept);
                concept = {"name":"high","shape":"pi"};
                result.push(concept);
                concept = {"name":"extreme","shape":"curveincrease"};
                result.push(concept);
            }
            else if (selectedMethod == "crossoverDriven") {
                var concept = {"name":"minimal","shape":"curve"};
                result.push(concept);
                concept = {"name":"low","shape":"pi"};
                result.push(concept);
                concept = {"name":"medium","shape":"pi"};
                result.push(concept);
                concept = {"name":"high","shape":"pi"};
                result.push(concept);
                concept = {"name":"extreme","shape":"curve"};
                result.push(concept);
            }
            else if (selectedMethod == "anomalyDriven") {
                var concept = {"name":"anomalous","shape":"curve"};
                result.push(concept);
                concept = {"name":"normal","shape":"strapezoid"};
                result.push(concept);
                concept = {"name":"anomalous","shape":"curve"};
                result.push(concept);
            }
            conceptList = result;
        }

        function checkConcepts (contextData) {
            var self = this;
            var updateList = [];
            var needsUpdate = false;
            if (selectedMethod == "dataDefined") {
                for (var i = 0; i < conceptList.length; i++) {
                    var concept = conceptList[i];
                    if (i == 0) {
                        if (concept.shape != "curvedecrease") {
                            needsUpdate = true;
                            console.log("Check 1 Failed");
                        }
                    }
                    else if (i == conceptList.length-1) {
                        if (concept.shape != "curveincrease") {
                            needsUpdate = true;
                            console.log("Check 2 Failed");
                        }
                    }
                    else if (concept.shape != "pi") {
                        needsUpdate = true;
                        console.log("Check 4 Failed");
                    }

                    if (needsUpdate == true) {
                        needsUpdate = false;
                        var min = self.ConceptVectorUtil.findConceptMin(concept.name, contextData);
                        var max = self.ConceptVectorUtil.findConceptMax(concept.name, contextData);
                        concept.points  = {min: min, max:max};
                        console.log("Needs Update: concept="+concept.name+", shape=" + concept.shape + " min="+concept.points.min+", max="+concept.points.max);
                        updateList.push(concept);
                    }
                }
            }

            if (updateList.length > 0) {
                updateConcepts(updateList);
                return true;
            }
            else {
                return false;
            }
        }

        function updateConcepts (updateList) {
            var nameList = "";
            var shapeList = "";
            var pointList = "";
            for (var i = 0; i < updateList.length; i++) {
                nameList += updateList[i].name;
                shapeList += updateList[i].shape;
                pointList += updateList[i].points.min + "," + updateList[i].points.max;
                if ((i >= 0) && (i < updateList.length-1)) {
                nameList += ",";
                shapeList += ";";
                pointList += ";";
                }
            }
            var contextName = $("#contextNameTI").val();
            var containerName = contextName;
            var searchString  = "| xsvUpdateConceptShape  \"" + nameList + "\" FROM " + contextName + " IN " + containerName + " SCOPED app  WITH  shape=\"" + shapeList + "\"";
            doConceptCheck = false;
            var $el = $('#single-step-done-view-container');
            self.SearchUtil.run($el, searchString);
        }


        function getStatsCommand() {
            var contextName = $("#contextNameTI").val();
            var field = contextName;
            var classList = getClassList();
            //var byClause = (classList === "") ? "" : " BY \"" + classList + "\"";
            var byClause = (classList === "") ? "" : " BY " + classList + "";

            if (selectedMethod == "dataDefined") {
                return " | stats count(" + field + ") as count avg(" + field + ") as avg min(" + field + ") as min max(" + field + ") as max median(" + field + ") as median stdev(" + field + ") as size" +  byClause;
            }
            else if (selectedMethod == "crossoverDriven") {
                // Has to be at least 3 points for crossover; we are using 5
                return " | stats count("+field+") as count perc1("+field+") as min perc20("+field+") as "+conceptList[0].name.trim()+"_"+conceptList[1].name.trim()+" perc40("+field+") as "+conceptList[1].name.trim()+"_"+conceptList[2].name.trim()+" perc60("+field+") as "+conceptList[2].name.trim()+"_"+conceptList[3].name.trim()+" perc80("+field+") as "+conceptList[3].name.trim()+"_"+conceptList[4].name.trim()+"  perc99("+field+") as max " + byClause;
            }
            else if (selectedMethod == "anomalyDriven") {
                // Exactly 3 points for anomaly
                //return " | stats count("+field+") as count min("+field+") as min perc5("+field+") as " +conceptList[0].name.trim()+"_"+conceptList[1].name.trim() + " perc10("+field+") as left_max perc90("+field+") as right_min perc95("+field+") as "+conceptList[1].name.trim()+"_"+conceptList[0].name.trim()+" max("+field+") as max " + byClause;
                // leaving off min and max
                return " | stats count("+field+") as count perc10("+field+") as " +conceptList[0].name.trim()+"_"+conceptList[1].name.trim() + " perc20("+field+") as left_max perc80("+field+") as right_min perc90("+field+") as "+conceptList[1].name.trim()+"_"+conceptList[0].name.trim() + byClause;
            }
        }

        function addClassToList() {
            var tmp = $("#newClassTI").val();
            var encodedClass = tmp.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            if (encodedClass !== "") {
                var html = "<li id=\""+encodedClass+"LI\">" + encodedClass +
                           "  <span aria-hidden=\"true\" class=\"remove-class\"><i class=\"icon-trash\"></i></span>" +
                           "  <span aria-hidden=\"true\" class=\"reorder-up\"><i class=\"icon-chevron-up\"></i></span>" +
                           "  <span aria-hidden=\"true\" class=\"reorder-down\"><i class=\"icon-chevron-down\"></i></span>" +
                           "</li>";
                $("#classListUL").append(html);
                $("#newClassTI").val("");

                $("#"+encodedClass+"LI .remove-class").click(function(e) {
                    e.preventDefault();
                    console.log("Remove class " + encodedClass);
                    $("#"+encodedClass+"LI").remove();
                });

                $("#"+encodedClass+"LI .reorder-up").click(function(e){
                    e.preventDefault();
                    var $current = $(this).closest('li')
                    var $previous = $current.prev('li');
                    if($previous.length !== 0){
                      $current.insertBefore($previous);
                    }
                    return false;
                  });

                $("#"+encodedClass+"LI .reorder-down").click(function(e){
                    e.preventDefault();
                    var $current = $(this).closest('li')
                    var $next = $current.next('li');
                    if($next.length !== 0){
                      $current.insertAfter($next);
                    }
                    return false;
                });
            }
        }

        function updateThumbnailChart () {
            var self = this;
            var domainMin = 0;
            var domainMax = 255;
            var contextName = $("#contextNameTI").val();
            var conceptData = self.ConceptVectorUtil.getChartData(contextName, conceptList, selectedMethod);
            var $el = $("#thumbnailChart");
            var isAD = false;
            if (selectedMethod == "anomalyDriven") {
                isAD = true;
            }
            self.ContextChart.renderContextChartThumbnail(contextName, domainMin, domainMax, $el, conceptData, isAD);
        }

        function updateConceptChart () {
            var self = this;
            var domainMin = 0;
            var domainMax = 255;
            var contextName = $("#contextNameTI").val();
            var concepts = getCustomConcepts();
            var conceptData = self.ConceptVectorUtil.getChartData(contextName, concepts, selectedMethod);
            var $el = $("#conceptChart");
            var isAD = false;
            if (selectedMethod == "anomalyDriven") {
                isAD = true;
            }
            self.ContextChart.renderContextChart2(contextName, domainMin, domainMax, $el, conceptData, isAD);
        }


        function createCopyrightDiv() {
            $('#dashboard').append("<div><p>&#0169; Copyright 2015 Scianta Analytics LLC.  All Rights Reserved - Custom App Development for Splunk by Concanon LLC</p></div>");
        }

        function createHandlers() {
            var self = this;

            $("#createContextButton").click(function(e) {
                e.preventDefault();
                $("#create-context-error-msg").html("");
                console.log("Create Context Clicked");
                // verify required fields
                var contextName = $("#contextNameTI").val();
                var search = $("#searchTA").val();
                if (contextName == "") {
                    $("#create-context-error-msg").html("Context Name is a required field.");
                    return;
                }
                if (search == "") {
                    $("#create-context-error-msg").html("Search is a required field.");
                    return;
                }
                createContext();
            });

            $("#goBackContextButton").click(function(e) {
              e.preventDefault();
              $("#single-step-done-view-container").hide();
              $("#single-step-review-inprogress-panel").hide();
              $("#single-step-create-view-container").show();
            });

            $('#newClassTI').keypress(function(e) {
                if (e.which == 13) {
                    addClassToList();
                }
            });

            $("#addNewClassButton").click(function(e) {
                e.preventDefault();
                console.log("Add Class to List Clicked");
                addClassToList();
            });

            $('.xsv-faq-header').on("click", function(e) {
                e.preventDefault();
                console.log("faq header clicked ...");
                if ($(this).find(".icon-accordion-toggle").hasClass("icon-chevron-down")) {
                  $(this).find(".icon-accordion-toggle").removeClass("icon-chevron-down");
                }
                else {
                  $(this).find(".icon-accordion-toggle").addClass("icon-chevron-down");
                }
                var display = $(this).next().css("display");
                if (display == "none") {
                  $(this).next().css("display","block");
                }
                else {
                  $(this).next().css("display","none");
                }
            });

            $("#single-step-done-view-container").on('loaded', function(event) {
           
                $("#single-step-customize-view-container").hide();
                $("#single-step-review-failure-panel").hide();
                console.log("Successful search ...");
                var searchResults = event.searchResults;
                if (searchResults != null) {
                    if (doConceptCheck == true) {
                        doConceptCheck = false;
                        if (checkConcepts(searchResults) == true) {
                            return;
                        }
                    }
                    $("#single-step-review-inprogress-panel").hide();
                    $("#single-step-review-success-panel").show();
                    var len = searchResults.rows.length-1;
                    var contextName = $("#contextNameTI").val();
                    var domainMin = searchResults.rows[0][0];
                    var domainMax = searchResults.rows[len][0];
                    var $el = $("#singleStepChart");
                    var isAD = false;
                    if (selectedMethod == "anomalyDriven") {
                        isAD = true;
                    }
                    self.ContextChart.renderContextChart2(contextName, domainMin, domainMax, $el, searchResults, isAD);
                    $("#theCreateSearchTA").html(createContextCommand);


                    //var containerName = getContainerName();
                    //var contextName = getContextName();
                    //$("#createSearchNameTI").val("Create Context - " + contextName + " in " + containerName);
                    //$("#updateSearchNameTI").val("Update Context - " + contextName + " in " + containerName);
                    //$("#createSearchTA").html(createContextCommand);
                    //$("#updateSearchTA").html(updateContextCommand);
                }
                else {
                    $("#single-step-review-inprogress-panel").hide();
                    $("#single-step-review-success-panel").hide();
                    $("#single-step-review-failure-panel").show();

                    //var errors = event.errorMessages;
                    //$("#single-step-review-failure-messages").html("<br>The following errors were encountered:<br><br>");
                    //for (var i = 0; i < errors.length; i++) {
                    //    $("#single-step-review-failure-messages").append(errors[i] + "<br>");
                    //}
                }
            });

            $('input[type=radio][name=methodRadio]').change(function() {
               selectedMethod = this.value;
               console.log("Selected Method is " + selectedMethod);
               setConceptObjects();
               updateThumbnailChart();
            });

            $("#thumbnailChart svg").click(function(e) {
                e.preventDefault();
                var selectedMethod = $('input[type=radio][name=methodRadio]:checked').val();
                var html = self.ConceptVectorUtil.createConceptsForDisplay(conceptList, selectedMethod);
                $("#conceptRows").html(html);

                $("#conceptRows tr td select").on('change', function(event) {
                    if (selectedMethod == "crossoverDriven") {
                        var selection = event.target.value;
                        if ((selection == "linear")||(selection == "curve")) {
                            $(".endshape").each(function( item ) {
                                $(this).val(selection);
                            });
                        }
                        else {
                            $(".shape").each(function( item ) {
                                $(this).val(selection);
                            });
                        }
                    }
                    updateConceptChart();
                });

                $("#conceptRows tr td input").on('change', function(event) {
                    // TODO - Add check that name is not duplicate
                    updateConceptChart();
                });

                $("#conceptRows tr td input.name-only").keypress(function (e) {
                    // Allow: backspace, delete, tab, and enter
                    if ($.inArray(e.keyCode, [8, 9, 13]) !== -1) { 
                        return;
                    }

                    var code = e.which || e.keyCode;
                    var charStr = String.fromCharCode(code);
                    if (/[a-zA-Z0-9_.]/.test(charStr)) return;

                    e.preventDefault();

                });

                $("#single-step-create-view-container").hide();
                $("#single-step-customize-view-container").show();
                updateConceptChart();
            });

            $("#cancelCustomizeConceptsButton").on('click', function(event) {
                event.preventDefault();
                console.log("Cancel Clicked");
                $("#single-step-customize-view-container").hide();
                $("#single-step-create-view-container").show();
            });

            $("#updateCustomizeConceptsButton").on('click', function(event) {
                event.preventDefault();
                console.log("Update Clicked");
                $("#single-step-customize-view-container").hide();
                $("#single-step-create-view-container").show();
                conceptList = getCustomConcepts();
                updateThumbnailChart();
            });


            $(".name-only").keypress(function (e) {
                // Allow: backspace/delete, tab, and enter
                if ($.inArray(e.keyCode, [8, 9, 13]) !== -1) { 
                    return;
                }

                var code = e.which || e.keyCode;
                var charStr = String.fromCharCode(code);
                if (/[a-zA-Z0-9_.]/.test(charStr)) return;

                e.preventDefault();

            });

            $('#validateSearchButton').on("click", function(e) {
                console.log ("Validate Search ...");
                e.preventDefault();
                var searchString = $("#searchTA").val();
                var range = "&earliest="+earliest+"&latest="+latest;
                window.open("search?q=" + encodeURIComponent(searchString)+range, "_blank");
            });
        }

        function setDefaults() {
            selectedMethod = $('input[type=radio][name=methodRadio]:checked').val();
            setConceptObjects();
        }

        createCopyrightDiv();
        createHandlers();
        setDefaults();
        updateThumbnailChart();
       
    });
});
