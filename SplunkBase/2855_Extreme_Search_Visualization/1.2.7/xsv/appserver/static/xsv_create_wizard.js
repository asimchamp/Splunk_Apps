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
        "app/xsv/nv.d3": ["app/xsv/d3.v3"],
        "app/xsv/owl.carousel": ["jquery"]
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
    "splunkjs/mvc/timerangeview",
    "app/xsv/conceptVectorUtil",
    "app/xsv/contextChart",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "app/xsv/searchUtil",
    "app/xsv/urlUtil",
    "app/xsv/owl.carousel",
    "splunkjs/ready!"
], function(_, $, dropdown, utils, mvc, TimeRangeView, ConceptVectorUtil, ContextChart, d3_v3, nv_d3, SearchUtil, URLUtil, Owl) {
    require(['splunkjs/ready!'], function() {

        var appOwl = null;
        var selectedApp = null;
        var selectedMethod = "userDefined";
        var selectedType = "domain";
        var selectedConcepts = null;
        var contextName = null;
        var domainMin = null;
        var domainMax = null;
        var doConceptCheck = true;

        var scopeSearchId = 0;
        var containersSearchId = 0;
        var contextsSearchId = 0;
        var classesSearchId = 0;
        var createContextSearchId = 0;
        var createContextCommand = "";
        var updateContextCommand = "";

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

        function getApps() {
            var self = this;
            var $el = $('.owl-carousel.apps');
            var searchString = "| xsvListapps all | stats count by Title,Label | fields Title, Label";
            self.SearchUtil.run($el, searchString);
        }

        function setAppData(appData) {
            var self = this;
            var content = "";
            _.each (appData.rows, function(row) {
                var app = row[0];
                var name = row[1];
                var img = "/static/app/xsv/images/defaultAppIcon.png";
                var imgStyle = "style=\"background-color: #c0c0c0;\"";
                if (app.indexOf("SA-") != -1)
                    img = "/static/app/xsv/images/icon_enterprise_security.png";

                content +=  "<div><a class=\"item explorer-item app link\" edata=\"" + app + "\">" +
                            "<img src=\"" + img + "\" height=\"36\" width=\"36\" " + imgStyle + "></img>" +
                            "<span class=\"explorer-row-label\" style=\"display:block;\">" + name + "</span>" +
                           "</a></div>";
            });

            $(".owl-carousel.apps").html(content);

            require(["app/xsv/owl.carousel"], function() {

                self.appOwl = $('.owl-carousel.apps');
                self.appOwl.owlCarousel({
                    loop:false,
                    margin:20,
                    nav:false,
                    slideBy:"page",
                    responsive:{
                        0:{
                            items:3
                        },
                        600:{
                            items:3
                        },
                        1000:{
                            items:4
                        }
                    }
                });

                $('.app.link').on('click', function(event){
                    event.preventDefault();
                    selectedApp = $(this).attr("edata");
                    console.log("selected app="+selectedApp);

                    $('.app.link').parent().removeClass('clicked');
                    $(this).parent().addClass('clicked');

                });

                var urlApp = self.URLUtil.getURLParam("app");
                if (urlApp != null) {
                    $('.app.link').each( function (item) {
                        console.log("item="+item);
                        var tmp = $(this).attr("edata");
                        if (tmp == urlApp) {
                            selectedApp = $(this).attr("edata");
                            $('.app.link').parent().removeClass('clicked');
                            $(this).parent().addClass('clicked');
                            self.appOwl.trigger('to.owl.carousel', [item, 1, true]);
                        }
                    });
                }

                var urlScope = self.URLUtil.getURLParam("scope");
                if (urlScope == "private") {
                    $("#privateCB").prop('checked', true);
                }
            });

            // Placed here ... hoping delay will allow items to be drawn
            //$(".edit-btn").css("display","none");
            //$(".more-info-btn").css("display","none");
            $(".dashboard-view-controls").css("display","none");
            $(".progress-container").css("display","block");

            // Attempt to Asyncronously retrieve images - JOE TEST
            _.each (appData.rows, function(row) {
                var app = row[0];
                var name = row[1];
                var img = "/static/app/" + app + "/appIcon.png";
                var imgStyle = "";
                // We already set images for SA-
                if (app.indexOf("SA-") == -1) {
                    $.ajax({
                        url: img,
                        async:true,
                        error: function()
                        {
                            console.log("file does not exist: " + img);
                        },
                        success: function()
                        {
                            console.log("file exists");
                            imgStyle = "";
                            $(".item.explorer-item.app.link[edata='"+app+"'] img").attr("src", img);
                            $(".item.explorer-item.app.link[edata='"+app+"'] img").css("background-color", "none");
                        }
                    });
                }
            });
        }

        function getContainers() {
            var self = this;
            $(".xsv_populating.xsv_container").show();
            var scopeStr = "";
            if ($('#privateCB').is(':checked')) {
                scopeStr = " SCOPED private ";
            }
            else {
               scopeStr = " SCOPED " + selectedApp + " ";
            }
            var searchString  = "| xsvListContexts app " + selectedApp + scopeStr + " | stats count by Container | fields Container";
            var $el = $('#containerSelect');
            self.SearchUtil.run($el, searchString);
        }


        function getContexts() {
            var self = this;
            $(".xsv_populating.xsv_context").show();
            var containerName = $("#containerSelect").val();
            var scopeStr = "";
            if ($('#privateCB').is(':checked')) {
                scopeStr = " SCOPED private ";
            }
            else {
               scopeStr = " SCOPED " + selectedApp + " ";
            }
            var searchString = "| xsvListContexts app " + selectedApp + scopeStr + " in " + containerName + " | stats count by Container,Context | fields Context";
            var $el = $('#contextSelect');
            self.SearchUtil.run($el, searchString);
        }

        function getContainerName() {
            var containerName = $("#containerSelect").val();
            if (containerName === "") {
               containerName = $("#containerNameTI").val();
            }
            return containerName;
        }

        function getContextName() {
            var contextName = $("#contextSelect").val();
            if (contextName === "") {
                contextName = $("#contextNameTI").val();
            }
            return contextName;
        }

        function createContext() {

            var missingRequiredField = false;
            
            var containerName = getContainerName();
            if (containerName === "") {
                missingRequiredField = true;
            }

            var contextName = getContextName();
            if (contextName === "") {
                missingRequiredField = true;
            }

            var classList = "";
            var theClassList = "";
            var addComma = false;
            $("#classListUL li").each(function( index ) {
                 if (addComma) {
                    theClassList += ","; 
                 }
                 addComma = true;
                 theClassList += $(this).text().trim();
                 //var tmpString = $(this).text().trim();
                 //var length = tmpString.length - 1;
                 //theClassList += tmpString.substring(0,length);
            });
            if (theClassList !== "") {
                classList = " class=\"" + theClassList + "\"";
            }

            var shapeList = "";
            var endShapeList = "";
            var conceptList = "";
            addComma = false;
            var concepts = getConcepts();
            for (var i = 0; i < concepts.length; i++) {
                 if (addComma) {
                    conceptList += ","; 
                 }
                 addComma = true;
                 conceptList += concepts[i].name.trim();
            }
            if (selectedMethod == "anomalyDriven") { // special case for anomalous
                conceptList += "," + concepts[0].name.trim();
            }

            if (conceptList !== "") {
                conceptList = " terms=\"" + conceptList + "\"";
            }
            else {
                missingRequiredField = true;
            }

            var min = $("#domainMinTI").val();
            if (min === "") {
                if ((selectedType == "domain") && (selectedMethod == "userDefined")) {
                    missingRequiredField = true;
                }
            }
            var max = $("#domainMaxTI").val();
            if (max === "") {
                if ((selectedType == "domain") && (selectedMethod == "userDefined")) {
                    missingRequiredField = true;
                }
            }

            var count = 0;
            
            var width = $("#widthTI").val();
            var width_str = "";
            if (width !== "") {
                width_str = " width="+width;
            }
            else
            {
                if ((selectedType != "domain") && (selectedMethod == "userDefined")) {
                    missingRequiredField = true;
                }
                width = 0;
            }

            var avg = $("#averageTI").val();
            if (avg === "") {
                if ((selectedType == "average_centered") && (selectedMethod == "userDefined")) {
                    missingRequiredField = true;
                }
                avg = 0;
            }

            var median = $("#medianTI").val();
            if (median === "") {
                if ((selectedType == "median_centered") && (selectedMethod == "userDefined")) {
                    missingRequiredField = true;
                }
                median = 0;
            }

            var size = $("#sizeTI").val();
            if (size === "") {
                if ((selectedType != "domain") && (selectedMethod == "userDefined")) {
                    missingRequiredField = true;
                }
                size = 0;
            }

            var search = $("#searchTA").val();
            if (search === "") {
                if (selectedMethod == "dataDefined") {
                    missingRequiredField = true;
                }
            }

            var notes = $("#notesTA").val();
            var uom = $("#uomTI").val();

            if (missingRequiredField) {
                displayRequiredFieldsMessage(selectedType);
                return;
            }
            var scopeStr = "";
            if ($('#privateCB').is(':checked')) {
                scopeStr = " scope=private ";
            }
            else {
                scopeStr = " scope=" + selectedApp + " ";
            }

            if (selectedMethod === "userDefined") {
                createContextCommand = "| xsCreateUDContext" +
                    " name=" + contextName +
                    " container=" + containerName +
                    " app=" + selectedApp +
                    scopeStr +
                    classList +
                    conceptList +
                    " avg=" + avg +
                    " count=" + count +
                    " endshape=curve" +
                    " max=" + max +
                    " median=" + median +
                    " min=" + min +
                    " notes=\"" + notes + "\"" +
                    " read=\"*\"" +
                    //" search=\"" + encodeURIComponent(search) + "\"" +
                    " search=\"" + search + "\"" +
                    " shape=pi" +
                    " size=" + size +
                    " type=" + selectedType +
                    " uom=\"" + uom + "\"" +
                    width_str +
                    " write=\"*\"";
            }
            else if (selectedMethod === "dataDefined") {
                var byClause = (theClassList === "") ? "" : " BY \"" + theClassList + "\"";
                var stats = $("#statsTA").val();
                var statsCommand = "";
                if (stats != "") {
                    statsCommand = " | " + stats;
                }

                createContextCommand = " | xsCreateDDContext";
                updateContextCommand = " | xsUpdateDDContext";
                var commandParams =
                    " name=" + contextName +
                    " app=" + selectedApp +
                    " container=" + containerName +
                    scopeStr +
                    classList +
                    conceptList +
                    " notes=\"" + notes + "\"" +
                    " read=\"*\"" +
                    //" search=\"" + encodeURIComponent(search + statsCommand) + "\"" +
                    " search=\"" + search + statsCommand + "\"" +
                    " shape=pi" +
                    " type=" + selectedType +
                    " uom=\"" + uom + "\"" +
                    width_str +
                    " write=\"*\"";
                createContextCommand = search + statsCommand + createContextCommand + commandParams;
                updateContextCommand = search + statsCommand + updateContextCommand + commandParams;
            }
            else if (selectedMethod === "crossoverDriven") {
                var byClause = (theClassList === "") ? "" : " BY \"" + theClassList + "\"";
                var stats = $("#statsTA").val();
                var statsCommand = "";
                if (stats != "") {
                    statsCommand = " | " + stats;
                }

                createContextCommand = " | xsCreateCDContext";
                updateContextCommand = " | xsUpdateCDContext";
                var commandParams =
                    " name=" + contextName +
                    " app=" + selectedApp +
                    " container=" + containerName +
                    scopeStr +
                    classList +
                    conceptList +
                    " endshape=\"" + concepts[0].shape + "\"" +
                    " shape=\"" + concepts[1].shape + "\"" +
                    " notes=\"" + notes + "\"" +
                    " read=\"*\"" +
                    //" search=\"" + encodeURIComponent(search + statsCommand) + "\"" +
                    " search=\"" + search + statsCommand + "\"" +
                    " uom=\"" + uom + "\"" +
                    " write=\"*\"";
                createContextCommand = search + statsCommand + createContextCommand + commandParams;
                updateContextCommand = search + statsCommand + updateContextCommand + commandParams;
            }
            else if (selectedMethod === "anomalyDriven") {
                var byClause = (theClassList === "") ? "" : " BY \"" + theClassList + "\"";
                var stats = $("#statsTA").val();
                var statsCommand = "";
                if (stats != "") {
                    statsCommand = " | " + stats;
                }

                createContextCommand = " | xsCreateADContext";
                updateContextCommand = " | xsUpdateADContext";
                var commandParams =
                    " name=" + contextName +
                    " app=" + selectedApp +
                    " container=" + containerName +
                    scopeStr +
                    classList +
                    conceptList +
                    " endshape=\"" + concepts[0].shape + "\"" +
                    " shape=\"" + concepts[1].shape + "\"" +
                    " notes=\"" + notes + "\"" +
                    " read=\"*\"" +
                    //" search=\"" + encodeURIComponent(search + statsCommand) + "\"" +
                    " search=\"" + search + statsCommand + "\"" +
                    " uom=\"" + uom + "\"" +
                    " write=\"*\"";
                createContextCommand = search + statsCommand + createContextCommand + commandParams;
                updateContextCommand = search + statsCommand + updateContextCommand + commandParams;
            }

            var $el = $('#done-view-container');
            self.SearchUtil.run($el, createContextCommand, earliest, latest);
        }

        function displayCreateMessage (type) {
            require(["bootstrap.modal"],function() {
                var msg = "Creating Context ...<br>";
                $('#createContextModalLabel').html("IN PROGRESS");
                $('#createContextModalMessage').html(msg);
                $('#createContextModal').modal('show');
            });
        }

        function displayRequiredFieldsMessage (type) {
            require(["bootstrap.modal"],function() {
                var msg = "One or more required fields are missing!<br><br>";
                    msg += "Required fields are indicated with an \"*\"";
                $('#createContextModalLabel').html("ERROR MESSAGE");
                $('#createContextModalMessage').html(msg);
                $('#createContextModal').modal('show');
            });
        }

        function displaySearchErrorMessage (errors) {
            require(["bootstrap.modal"],function() {
                var msg = "The following error was encountered: <br><br>";
                msg += errors;
                $('#createContextModalLabel').html("ERROR MESSAGE");
                $('#createContextModalMessage').html(msg);
                $('#createContextModal').modal('show');
                //$('#createContextModal').data("state", {contextName: contextName});
            });
        }

        function addConceptToList() {
            var concept = $("#newConceptTI").val();
            if (concept !== "") {
                var html = "<li id=\""+concept+"LI\">" + concept + 
                           "  <span aria-hidden=\"true\" class=\"remove-concept\"><i class=\"icon-trash\"></i></span>" +
                           "  <span aria-hidden=\"true\" class=\"reorder-up\"><i class=\"icon-chevron-up\"></i></span>" +
                           "  <span aria-hidden=\"true\" class=\"reorder-down\"><i class=\"icon-chevron-down\"></i></span>" +
                           "</li>";
                $("#conceptListUL").append(html);
                $("#newConceptTI").val("");

                $("#"+concept+"LI .remove-concept").click(function(e) {
                    e.preventDefault();
                    console.log("Remove concept " + concept);
                    $("#"+concept+"LI").remove();
                });

                $("#"+concept+"LI .reorder-up").click(function(e){
                    e.preventDefault();
                    var $current = $(this).closest('li')
                    var $previous = $current.prev('li');
                    if($previous.length !== 0){
                      $current.insertBefore($previous);
                    }
                    return false;
                  });

                $("#"+concept+"LI .reorder-down").click(function(e){
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

        function addPeriodicityToList(val) {
            var html = "<li id=\""+val+"LI\">" + val + 
                       "  <span aria-hidden=\"true\" class=\"remove-class\"><i class=\"icon-trash\"></i></span>" +
                       "  <span aria-hidden=\"true\" class=\"reorder-up\"><i class=\"icon-chevron-up\"></i></span>" +
                       "  <span aria-hidden=\"true\" class=\"reorder-down\"><i class=\"icon-chevron-down\"></i></span>" +
                       "</li>";
            $("#classListUL").append(html);

            //$("#"+val+"LI span").click(function() {
            //    console.log("Remove periodicity " + val);
            //    $("#"+val+"LI").remove();
            //});

            $("#"+val+"LI .remove-class").click(function(e) {
                e.preventDefault();
                console.log("Remove class " + val);
                $("#"+val+"LI").remove();
            });

            $("#"+val+"LI .reorder-up").click(function(e){
                e.preventDefault();
                var $current = $(this).closest('li')
                var $previous = $current.prev('li');
                if($previous.length !== 0){
                  $current.insertBefore($previous);
                }
                return false;
              });

            $("#"+val+"LI .reorder-down").click(function(e){
                e.preventDefault();
                var $current = $(this).closest('li')
                var $next = $current.next('li');
                if($next.length !== 0){
                  $current.insertAfter($next);
                }
                return false;
            });
        }

        function addClassToList() {
            var theClass = $("#newClassTI").val();
            var idClass = theClass.replace(/./g, '_');
            if (theClass !== "") {
                var html = "<li id=\""+idClass+"LI\">" + theClass + 
                           "  <span aria-hidden=\"true\" class=\"remove-class\"><i class=\"icon-trash\"></i></span>" +
                           "  <span aria-hidden=\"true\" class=\"reorder-up\"><i class=\"icon-chevron-up\"></i></span>" +
                           "  <span aria-hidden=\"true\" class=\"reorder-down\"><i class=\"icon-chevron-down\"></i></span>" +
                           "</li>";
                $("#classListUL").append(html);
                $("#newClassTI").val("");

                //$("#"+theClass+"LI span").click(function() {
                //    console.log("Remove class " + theClass);
                //    $("#"+theClass+"LI").remove();
                //});

                $("#"+idClass+"LI .remove-class").click(function(e) {
                    e.preventDefault();
                    console.log("Remove class " + theClass);
                    $("#"+idClass+"LI").remove();
                });

                $("#"+idClass+"LI .reorder-up").click(function(e){
                    e.preventDefault();
                    var $current = $(this).closest('li')
                    var $previous = $current.prev('li');
                    if($previous.length !== 0){
                      $current.insertBefore($previous);
                    }
                    return false;
                  });

                $("#"+idClass+"LI .reorder-down").click(function(e){
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

        function createCopyrightDiv() {
            $('#dashboard').append("<div><p>&#0169; Copyright 2015 Scianta Analytics LLC.  All Rights Reserved - Custom App Development for Splunk by Concanon LLC</p></div>");
        }

        function createConceptsForDisplay(conceptList) {
            var html = "";
            if (selectedMethod == "crossoverDriven") {
                for (var i = 0; i < conceptList.length; i++) {
                    html += "<tr><td><input type=\"text\" value=\"" + conceptList[i] + "\" class=\"name-only\" maxlength=\"64\"/></td>";
                    if ((i ==0) || (i == conceptList.length-1)) {
                        html += " <td><select style=\"display:block;\" class=\"endshape\">";
                    }
                    else {
                        html += " <td><select style=\"display:block;\" class=\"shape\">";
                    }
                    if ((i ==0) || (i == conceptList.length-1)) {
                        html += " <option value=\"curve\"selected=\"selected\">Curve</option>";
                        //html += " <option value=\"linear\">Linear</option>";
                    } else {
                        html += " <option class=\"shape\" value=\"pi\" selected=\"selected\">PI</option>";
                        //html += " <option class=\"shape\" value=\"triangle\">Triangle</option>";
                    }
                    html += " </select></td></tr>";
                }
            }
            else if (selectedMethod == "anomalyDriven") {
                html += "<tr><td><input type=\"text\" value=\"" + conceptList[0] + "\" class=\"name-only\" maxlength=\"64\"/></td>";
                html += " <td><select style=\"display:block;\">";
                html += " <option value=\"curve\" selected=\"selected\">Curve</option>";
                //html += " <option value=\"linear\" >Linear</option>";
                html += " </select></td></tr>";
                html += "<tr><td><input type=\"text\" value=\"" + conceptList[1] + "\" class=\"name-only\" maxlength=\"64\"/></td>";
                html += " <td><select style=\"display:block;\">";
                //html += " <option value=\"pi\">PI</option>";
                html += " <option value=\"strapezoid\" selected=\"selected\">S-Trapezoid</option>";
                html += " </select></td></tr>";
            }
            else {
                for (var i = 0; i < conceptList.length; i++) {
                    html += "<tr><td><input type=\"text\" value=\"" + conceptList[i] + "\" class=\"name-only\" maxlength=\"64\"/></td>";
                    html += " <td><select style=\"display:block;\">";
                    html += " <option value=\"curvedecrease\"";
                    html += (i == 0 && conceptList.length > 1) ? "selected=\"selected\"" : "";
                    html += ">Curve Decrease</option>";
                    html += " <option value=\"curveincrease\"";
                    html += (i == conceptList.length-1 && conceptList.length > 1) ? "selected=\"selected\"" : "";
                    html += ">Curve Increase</option>";
                    html += " <option value=\"lineardecrease\">Linear Decrease</option>";
                    html += " <option value=\"linearincrease\">Linear Increase</option>";
                    html += " <option value=\"pi\"";
                    html += (i == 0 && conceptList.length == 1) ? "selected=\"selected\"" : "";
                    html += (i != 0 && i != conceptList.length-1 && conceptList.length > 2 && selectedMethod != "anomalyDriven") ? "selected=\"selected\"" : "";
                    html += ">PI</option>";
                    html += " <option value=\"trapezoid\">Trapezoid</option>";
                    html += " <option value=\"strapezoid\">S-Trapezoid</option>";
                    html += " <option value=\"triangle\">Triangle</option>";
                    html += " </select></td></tr>";
                }
            }
            return html;
        }

        function updateConceptChart () {
            var self = this;
            var domainMin = 0;
            var domainMax = 0;
            var concepts = getConcepts();
            var conceptData = self.ConceptVectorUtil.getChartData(getContextName(), concepts, selectedMethod);
            var $el = $("#conceptChart");
            var isAD = false;
            if (selectedMethod == "anomalyDriven") {
                isAD = true;
            }
            self.ContextChart.renderContextChart2(getContextName(), domainMin, domainMax, $el, conceptData, isAD);
        }

        function checkConcepts (contextData) {
            var concepts = getConcepts();
            var updateList = [];
            var needsUpdate = false;
            if ((selectedMethod != "anomalyDriven")&&(selectedMethod != "crossoverDriven")) {
                for (var i = 0; i < concepts.length; i++) {
                    var concept = concepts[i];
                    if (i == 0) {
                        if (concept.shape != "curvedecrease") {
                            needsUpdate = true;
                            console.log("Check 1 Failed");
                        }
                    }
                    else if (i == concepts.length-1) {
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
                        var min = findConceptMin(concept.name, contextData);
                        var max = findConceptMax(concept.name, contextData);
                        concept.points  = {min: min, max:max};
                        console.log("Needs Update: concept="+concept.name+", shape=" + concept.shape + " min="+concept.points.min+", max="+concept.points.max);
                        updateList.push(concept);
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
        }

        function findConceptMin (name, contextData) {
            var idx = -1;
            var result = contextData.rows[0][0];
            var min = 0;
            for (var i = 0; i < contextData.fields.length; i++) {
                if (contextData.fields[i] == name) idx=i;
            }
            if (idx != -1) {
                min = contextData.rows[0][idx];
                if ( min == contextData.rows[1][idx]) {
                    for (var j = 1; j < contextData.rows.length; j++) {
                        if (contextData.rows[j][idx] != min ) {
                            return contextData.rows[j-1][0];
                        }
                    }
                }
            }
            return result;
        }

        function findConceptMax (name, contextData) {
            var idx = -1;
            var max = 0;
            var result = contextData.rows[255][0];
            for (var i = 0; i < contextData.fields.length; i++) {
                if (contextData.fields[i] == name) idx=i;
            }
          
            if (idx != -1) {
                max = contextData.rows[contextData.rows.length-1][idx];
                if ( max == contextData.rows[contextData.rows.length-2][idx]) {
                    for (var j = contextData.rows.length-2; j > 0; j--) {
                        if (contextData.rows[j][idx] != max ) {
                            return contextData.rows[j+1][0];
                        }
                    }
                }
            }
            return result;
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
            var scopeStr = "";
            if ($('#privateCB').is(':checked')) {
                scopeStr = " SCOPED private ";
            }
            else {
               scopeStr = " SCOPED " + selectedApp + " ";
            }
            var searchString  = "| xsvUpdateConceptShape  \"" + nameList + "\" FROM " + getContextName() + " IN " + getContainerName() + " APP " + selectedApp + scopeStr + " WITH shape=\"" + shapeList + "\"";
            doConceptCheck = false;
            var $el = $('#done-view-container');
            self.SearchUtil.run($el, searchString);
        }

        function getConcepts () {
            var result = [];
            $("#conceptRows tr").each(function(row) {
                console.log("row="+row);
                var conceptName = $(this).find("input").val();
                var conceptShape = $(this).find("select").val();
                result.push ({"name":conceptName, "shape":conceptShape });
            });
            return result;
        }

        function displayConcepts (conceptList) {
            var html = createConceptsForDisplay(conceptList);
            $("#conceptRows").html(html);
            updateConceptChart();

            $(".concept-select-view").hide();
            $(".concept-custom-view").hide();
            $(".concept-detail-view").show();

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
        }

        function setCustomOptions() {
            var html = "";
            if (selectedMethod != "crossoverDriven") {
                html +="<option value=\"1\">1</option>"
                html +="<option value=\"2\">2</option>"
            }
            html +="<option value=\"3\">3</option>"
            html +="<option value=\"4\">4</option>"
            html +="<option value=\"5\">5</option>"
            html +="<option value=\"6\">6</option>"
            html +="<option value=\"7\">7</option>"
            html +="<option value=\"8\">8</option>"
            html +="<option value=\"9\">9</option>"
            html +="<option value=\"10\">10</option>"
            $("#numberOfConcepts").html(html);
        }

        function setStats() {
            var contextName = getContextName();
            var classList = "";
            var theClassList = "";
            var addComma = false;
            $("#classListUL li").each(function( index ) {
                 if (addComma) {
                    theClassList += ",";
                 }
                 addComma = true;
                 theClassList += $(this).text().trim();
            });
            if (theClassList !== "") {
                classList = " class=\"" + theClassList + "\"";
            }
            //var byClause = (theClassList === "") ? "" : " BY \"" + theClassList + "\"";
            var byClause = (theClassList === "") ? "" : " BY " + theClassList;
            var field = $("#fieldTI").val();

            if ((selectedMethod == "userDefined") || (selectedMethod == "dataDefined")) {
                $("#statsTA").val("stats count(" + field + ") as count avg(" + field + ") as avg min(" + field + ") as min max(" + field + ") as max median(" + field + ") as median stdev(" + field + ") as size" +  byClause);
            }
            else if (selectedMethod == "crossoverDriven") {
                // Has to be at least 3 points for crossover
                var concepts = getConcepts();
                if (concepts.length == 3) {
                    $("#statsTA").val(" stats count("+field+") as count min("+field+") as min perc30("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc70("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" max("+field+") as max " + byClause);
                    //$("#statsTA").val(" stats count("+field+") as count min("+field+") as min max("+field+") as max range("+field+") as range " + byClause + " | eval " + concepts[0].name.trim()+"_"+concepts[1].name.trim()+"= min+range/3 | eval " + concepts[1].name.trim()+"_"+concepts[2].name.trim()+"=max-range/3");
                }
                else if (concepts.length == 4) {
                    $("#statsTA").val(" stats count("+field+") as count perc1("+field+") as min perc25("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc50("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" perc75("+field+") as "+concepts[2].name.trim()+"_"+concepts[3].name.trim()+"  perc99("+field+") as max " + byClause);
                }
                else if (concepts.length == 5) {
                    $("#statsTA").val(" stats count("+field+") as count perc1("+field+") as min perc20("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc40("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" perc60("+field+") as "+concepts[2].name.trim()+"_"+concepts[3].name.trim()+" perc80("+field+") as "+concepts[3].name.trim()+"_"+concepts[4].name.trim()+"  perc99("+field+") as max " + byClause);
                }
                else if (concepts.length == 6) {
                    $("#statsTA").val(" stats count("+field+") as count perc1("+field+") as min perc16("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc33("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" perc50("+field+") as "+concepts[2].name.trim()+"_"+concepts[3].name.trim()+" perc67("+field+") as "+concepts[3].name.trim()+"_"+concepts[4].name.trim()+" perc84("+field+") as "+concepts[4].name.trim()+"_"+concepts[5].name.trim()+"  perc99("+field+") as max " + byClause);
                }
                else if (concepts.length == 7) {
                    $("#statsTA").val(" stats count("+field+") as count perc1("+field+") as min perc14("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc28("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" perc42("+field+") as "+concepts[2].name.trim()+"_"+concepts[3].name.trim()+" perc58("+field+") as "+concepts[3].name.trim()+"_"+concepts[4].name.trim()+" perc72("+field+") as "+concepts[4].name.trim()+"_"+concepts[5].name.trim()+" perc86("+field+") as "+concepts[5].name.trim()+"_"+concepts[6].name.trim()+"  perc99("+field+") as max " + byClause);
                }
                else if (concepts.length == 8) {
                    $("#statsTA").val(" stats count("+field+") as count perc1("+field+") as min perc12("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc24("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" perc36("+field+") as "+concepts[2].name.trim()+"_"+concepts[3].name.trim()+" perc50("+field+") as "+concepts[3].name.trim()+"_"+concepts[4].name.trim()+" perc64("+field+") as "+concepts[4].name.trim()+"_"+concepts[5].name.trim()+" perc76("+field+") as "+concepts[5].name.trim()+"_"+concepts[6].name.trim()+" perc88("+field+") as "+concepts[6].name.trim()+"_"+concepts[7].name.trim()+"  perc99("+field+") as max " + byClause);
                }
                else if (concepts.length == 9) {
                    $("#statsTA").val(" stats count("+field+") as count perc1("+field+") as min perc11("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc22("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" perc33("+field+") as "+concepts[2].name.trim()+"_"+concepts[3].name.trim()+" perc44("+field+") as "+concepts[3].name.trim()+"_"+concepts[4].name.trim()+" perc56("+field+") as "+concepts[4].name.trim()+"_"+concepts[5].name.trim()+" perc67("+field+") as "+concepts[5].name.trim()+"_"+concepts[6].name.trim()+" perc78("+field+") as "+concepts[6].name.trim()+"_"+concepts[7].name.trim()+" perc89("+field+") as "+concepts[7].name.trim()+"_"+concepts[8].name.trim()+"  perc99("+field+") as max " + byClause);
                } 
                else if (concepts.length == 10) {
                    $("#statsTA").val(" stats count("+field+") as count perc1("+field+") as min perc10("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim()+" perc20("+field+") as "+concepts[1].name.trim()+"_"+concepts[2].name.trim()+" perc30("+field+") as "+concepts[2].name.trim()+"_"+concepts[3].name.trim()+" perc40("+field+") as "+concepts[3].name.trim()+"_"+concepts[4].name.trim()+" perc50("+field+") as "+concepts[4].name.trim()+"_"+concepts[5].name.trim()+" perc60("+field+") as "+concepts[5].name.trim()+"_"+concepts[6].name.trim()+" perc70("+field+") as "+concepts[6].name.trim()+"_"+concepts[7].name.trim()+" perc80("+field+") as "+concepts[7].name.trim()+"_"+concepts[8].name.trim()+" perc90("+field+") as "+concepts[8].name.trim()+"_"+concepts[9].name.trim()+" perc99("+field+") as max " + byClause);
                }
            }
            else if (selectedMethod == "anomalyDriven") {
                // Exactly 3 points for anomaly
                var concepts = getConcepts();
                //$("#statsTA").val(" stats count("+field+") as count min("+field+") as min perc5("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim() + " perc10("+field+") as left_max perc90("+field+") as right_min perc95("+field+") as "+concepts[1].name.trim()+"_"+concepts[0].name.trim()+" max("+field+") as max " + byClause);
                // Leaving off min and max
                $("#statsTA").val(" stats count("+field+") as count perc10("+field+") as "+concepts[0].name.trim()+"_"+concepts[1].name.trim() + " perc20("+field+") as left_max perc80("+field+") as right_min perc90("+field+") as "+concepts[1].name.trim()+"_"+concepts[0].name.trim() + byClause);
            }
        }

        function createHandlers() {
            var self = this;

            $("#prevButton").on('click', function(event) {
                event.preventDefault();
                var isDisabled = $("#prevButton").attr("disabled");
                if (isDisabled == "disabled") return;

                if($("#name-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#app-view-container").show();

                    $("#stepName").removeClass("active");
                    $("#stepApp").removeClass("completed");
                    $("#stepApp").addClass("active");
                }
                else if($("#method-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#name-view-container").show();

                    $("#stepMethod").removeClass("active");
                    $("#stepName").removeClass("completed");
                    $("#stepName").addClass("active");
                }
                else if($("#type-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#method-view-container").show();

                    $("#stepType").removeClass("active");
                    $("#stepMethod").removeClass("completed");
                    $("#stepMethod").addClass("active");
                }
                else if($("#concepts-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#type-view-container").show();

                    $("#stepConcepts").removeClass("active");
                    $("#stepType").removeClass("completed");
                    $("#stepType").addClass("active");
                }
                else if($("#class-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#concepts-view-container").show();

                    $("#stepClass").removeClass("active");
                    $("#stepConcepts").removeClass("completed");
                    $("#stepConcepts").addClass("active");
                    $(window).trigger('resize'); // force chart to update in case of window resize
                }
                else if($("#range-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#class-view-container").show();

                    $("#stepRange").removeClass("active");
                    $("#stepClass").removeClass("completed");
                    $("#stepClass").addClass("active");
                }
                else if($("#done-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#range-view-container").show();

                    $("#stepDone").removeClass("active");
                    $("#stepRange").removeClass("completed");
                    $("#stepRange").addClass("active");
                }
            });

            $("#nextButton").on('click', function(event) {
                event.preventDefault();
                var isDisabled = $("#nextButton").attr("disabled");
                if (isDisabled == "disabled") return;


                if($("#app-view-container").is(':visible')) {

                    if (selectedApp == null) {
                        $("#app-error-msg").html("App selection is required!");
                    }
                    else {
                        $("#app-error-msg").html("");
                        $("#xsv-view-container").children().hide();
                        $("#name-view-container").show();

                        $("#stepApp").removeClass("active");
                        $("#stepApp").addClass("completed");
                        $("#stepName").addClass("active");

                        getContainers();
                        $("#name-error-msg").html("");
                    }
                }
                else if($("#name-view-container").is(':visible')) {
                    var selectedContainer = $('#containerSelect').val();
                    var newContainer = $('#containerNameTI').val();
                    var selectedContext = $('#contextSelect').val();
                    var description = $('#descriptionTI').val();
                    var uom = $('#uomTI').val();
                    var newContext = $('#contextNameTI').val();
                    if ((selectedApp == null) ||
                        ((selectedContainer == "") && (newContainer == "")) ||
                        ((selectedContext == "") && (newContext == "")) ||
                        (description == "") || 
                        (uom == "")) {
                        $("#name-error-msg").html("Container, Context, Class, Description, and Unit of Measure are required fields!");
                        return;
                    }
                    else {
                        $("#name-error-msg").html("");
                        $("#xsv-view-container").children().hide();
                        $("#method-view-container").show();

                        $("#stepName").removeClass("active");
                        $("#stepName").addClass("completed");
                        $("#stepMethod").addClass("active");
                    }
                }
                else if($("#method-view-container").is(':visible')) {
                    if (selectedMethod != null) {
                        $("#xsv-view-container").children().hide();
                        $("#type-view-container").show();

                        if (selectedMethod == "crossoverDriven") {
                            $("#fiveConcepts").show();
                            $("#fourConcepts").show();
                            $("#threeConcepts").show();
                            $("#twoConcepts").hide();
                            $("#anomalyConcepts").hide();
                            $("#customConcepts").show();
                            setCustomOptions();
                            $("#average-centered").attr("disabled","disabled");
                            $("#median-centered").attr("disabled","disabled");
                        }
                        else if (selectedMethod == "anomalyDriven"){
                            $("#fiveConcepts").hide();
                            $("#fourConcepts").hide();
                            $("#threeConcepts").hide();
                            $("#anomalyConcepts").show();
                            $("#twoConcepts").hide();
                            $("#customConcepts").hide();
                            $("#average-centered").attr("disabled","disabled");
                            $("#median-centered").attr("disabled","disabled");

                        }
                        else {
                            $("#fiveConcepts").show();
                            $("#fourConcepts").show();
                            $("#threeConcepts").show();
                            $("#twoConcepts").show();
                            $("#customConcepts").show();
                            $("#anomalyConcepts").hide();
                            setCustomOptions();
                            $("#average-centered").removeAttr("disabled");
                            $("#median-centered").removeAttr("disabled");
                        }

                        $("#stepMethod").removeClass("active");
                        $("#stepMethod").addClass("completed");
                        $("#stepType").addClass("active");
                    }
                }
                else if($("#type-view-container").is(':visible')) {

                    if (selectedType != null) {
                        $(".concept-item").removeClass("clicked");
                        $(".concept-detail-view").hide();
                        $(".concept-select-view").show();

                        if (selectedMethod == "userDefined") {
                            $("#selectedType").html(selectedType);
                            $("#dataDefined").hide();
                            $("#userDefined").show();
                            $("#statsDefined").hide();


                            if (selectedType == "domain") {
                                $("#averageCenteredAttributes").hide();
                                $("#medianCenteredAttributes").hide();
                                $("#averageAndMedianAttributes").hide();
                                $("#domainAttributes").show();
                            }
                            else if (selectedType == "average_centered") {
                                $("#domainAttributes").hide();
                                $("#medianCenteredAttributes").hide();
                                $("#averageAndMedianAttributes").show();
                                $("#averageCenteredAttributes").show();
     
                            }
                            else if (selectedType == "median_centered") {
                                $("#domainAttributes").hide();
                                $("#averageCenteredAttributes").hide();
                                $("#averageAndMedianAttributes").show();
                                $("#medianCenteredAttributes").show();
                            }

                        } else {
                            $("#selectedType").html(selectedType);
                            $("#userDefined").hide();
                            $("#dataDefined").show();
                            $("#statsDefined").show();
                            var contextName = $("#contextNameTI").val();
                            $("#fieldTI").val(getContextName());

                            if (selectedMethod == "anomalyDriven"){
                                conceptList = ["anomalous","normal"];
                                displayConcepts(conceptList);
                                $("#anomalyConcepts").addClass("clicked");
                            }
                            else {
                                $(".concept-item").removeClass("clicked");
                                $(".concept-detail-view").hide();
                                $(".concept-select-view").show();
                            }
                        }


                        $("#xsv-view-container").children().hide();
                        $("#concepts-view-container").show();

                        $("#stepType").removeClass("active");
                        $("#stepType").addClass("completed");
                        $("#stepConcepts").addClass("active");

                        $("#concept-custom-error-msg").html("");
                        $("#concept-select-error-msg").html("");

                    }
                }
                else if($("#concepts-view-container").is(':visible')) {
                    //var tmp = $(".concept-selections").find("div.concept-item.clicked")[0];
                    var tmp = $(".concept-detail-view").is(':visible');
                    if (tmp == true) {
                        $("#concept-custom-error-msg").html("");
                        $("#concept-select-error-msg").html("");
                        selectedConcepts = [0].id;
                        $("#xsv-view-container").children().hide();
                        $("#class-view-container").show();

                        $("#stepConcepts").removeClass("active");
                        $("#stepConcepts").addClass("completed");
                        $("#stepClass").addClass("active");
                    }
                    else {
                        var customView = $(".concept-custom-view").is(':visible');
                        if (customView == true) {
                            $("#concept-custom-error-msg").html("Selection for the number of concepts is required!");
                        }
                        else {
                            $("#concept-select-error-msg").html("Selection of a concept configuration is required!");
                        }
                        return;
                    }
                }
                else if($("#class-view-container").is(':visible')) {
                    $("#xsv-view-container").children().hide();
                    $("#range-view-container").show();

                    $("#stepClass").removeClass("active");
                    $("#stepClass").addClass("completed");
                    $("#stepRange").addClass("active");

                    $("#range-datadefined-error-msg").html("");
                    $("#range-userdefined-error-msg").html("");
                    $("#statsCB").prop('checked', true);
                    setStats();
                }
                else if($("#range-view-container").is(':visible')) {
                    var missingRequiredFields = false;
                    if (selectedMethod == "userDefined") {
                        if (selectedType == "domain") {
                            var min = $("#domainMinTI").val();
                            var max = $("#domainMaxTI").val();
                            if ((min === "") || (max === "")) {
                                missingRequiredFields = true;
                            }
                        }
                        else if (selectedType == "average_centered") {
                            var avg = $("#averageTI").val();
                            var size = $("#sizeTI").val();
                            var width = $("#widthTI").val();
                            if ((avg === "") || (size === "") || (width === "")) {
                                missingRequiredFields = true;
                            }
                        }
                        else if (selectedType == "median_centered") {
                            var median = $("#medianTI").val();
                            var size = $("#sizeTI").val();
                            var width = $("#widthTI").val();
                            if ((median === "") || (size === "") || (width === "")) {
                                missingRequiredFields = true;
                            }
                        }

                        if (missingRequiredFields == true) {
                            $("#range-userdefined-error-msg").html("Range parameters are required fields!");
                            return;
                        }
                        $("#range-userdefined-error-msg").html("");
                    }
                    else {
                        var search = $("#searchTA").val();
                        if (search === "") {
                            $("#range-datadefined-error-msg").html("Search is a required field!");
                            return;
                        }
                        $("#range-datadefined-error-msg").html("");
                    }

                    // Create the Context
                    $("#xsv-view-container").children().hide();
                    $("#done-view-container").show();
                    $("#review-failure-panel").hide();
                    $("#review-success-panel").hide();
                    $("#review-inprogress-panel").show();

                    $("#stepRange").removeClass("active");
                    $("#stepRange").addClass("completed");
                    $("#stepDone").addClass("active");
                    createContext();
                }
            });

            $(".owl-carousel.apps").on('loaded', function(event) {
                setAppData(event.searchResults);
                $('.loading-apps').hide();
                $('.owl-carousel.apps').show();
            });

            $(".explorer-nav.right.apps").click(function(e){
                e.preventDefault();
                console.log("right clicked");
                self.appOwl.trigger('next.owl.carousel');
            });

            $(".explorer-nav.left.apps").click(function(e){
                e.preventDefault();
                console.log("left clicked");
                self.appOwl.trigger('prev.owl.carousel');
            });

            $("#containerSelect").on('loaded', function(event) {
                $("#containerSelect").html("");
                $("#containerSelect").append("<option value=\"\">New Container</option");

                if (event.searchResults != null) {
                    _.each (event.searchResults.rows, function(row) {
                        var optionHtml = "<option value=\"" + row + "\">"+row+"</option>";
                        $("#containerSelect").append(optionHtml);
                    });

                    var container = self.URLUtil.getURLParam("container");
                    if (container != undefined) {
                        $("#containerSelect").val(container);
                        getContexts();
                    }
                    else {
                        $("#containerSelect").val($("#containerSelect option:first").val());
                    }
                }

                $("#contextSelect").html("");
                $("#contextSelect").append("<option value=\"\">New Context</option");
                $(".xsv_populating.xsv_context").hide();
                $(".xsv_populating.xsv_container").hide();

            });

            $("#contextSelect").on('loaded', function(event) {
                $("#contextSelect").html("");
                $("#contextSelect").append("<option value=\"\">New Context</option");

                if (event.searchResults != null) {
                    _.each (event.searchResults.rows, function(row) {
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
                }

                $(".xsv_populating.xsv_context").hide();
            });

            $('#containerSelect').on("change", function(e) {
                var selection = $('#containerSelect').val();
                if (selection !== "") {
                    $("#containerNameTI").val("");
                    $("#containerNameTI").attr("disabled","disabled");

                    getContexts();
                }
                else {
                    $("#containerNameTI").val("");
                    $("#containerNameTI").removeAttr("disabled");

                    $("#contextSelect").html("");
                    $("#contextSelect").append("<option value=\"\">New Context</option");
                }

            });

            $('#contextSelect').on("change", function(e) {
                var selection = $('#contextSelect').val();
                if (selection !== "") {
                    $("#contextNameTI").val("");
                    $("#contextNameTI").attr("disabled","disabled");
                }
                else {
                    $("#contextNameTI").val("");
                    $("#contextNameTI").removeAttr("disabled");
                }
            });

            $('.concept-item').on("click", function(e) {
                e.preventDefault();
                console.log("item selected");
                $('.concept-item').removeClass('clicked');
                $(this).addClass('clicked');

                if (this.id == "customConcepts") {
                    $(".concept-select-view").hide();
                    $(".concept-custom-view").show();
                    return;
                }
                else if (this.id == "fiveConcepts") {
                    conceptList = ["minimal","low","medium","high","extreme"];
                }
                else if (this.id == "fourConcepts") {
                    conceptList = ["low","medium","high","extreme"];
                }
                else if (this.id == "threeConcepts") {
                    conceptList = ["low","medium","high"];
                }
                else if (this.id == "anomalyConcepts") {
                    conceptList = ["anomalous","normal","anomalous"];
                }
                else if (this.id == "twoConcepts") {
                    conceptList = ["low","high"];
                }
                displayConcepts(conceptList);

            });

            $("#addNewConceptButton").click(function(e) {
                e.preventDefault();
                console.log("Add Concept to List Clicked");
                addConceptToList();
            });

            $("#conceptGoButton").click(function(e) {
                e.preventDefault();
                var numberOfConcepts = $("#numberOfConcepts").val();
                var conceptList = null;
                if (numberOfConcepts == 1) {
                  conceptList = ["one"];
                }
                else if (numberOfConcepts == 2) {
                  conceptList = ["one","two"];
                }
                else if (numberOfConcepts == 3) {
                  conceptList = ["one","two","three"];
                }
                else if (numberOfConcepts == 4) {
                  conceptList = ["one","two","three","four"];
                }
                else if (numberOfConcepts == 5) {
                  conceptList = ["one","two","three","four","five"];
                }
                else if (numberOfConcepts == 6) {
                  conceptList = ["one","two","three","four","five","six"];
                }
                else if (numberOfConcepts == 7) {
                  conceptList = ["one","two","three","four","five","six","seven"];
                }
                else if (numberOfConcepts == 8) {
                  conceptList = ["one","two","three","four","five","six","seven","eight"];
                }
                else if (numberOfConcepts == 9) {
                  conceptList = ["one","two","three","four","five","six","seven","eight","nine"];
                }
                else if (numberOfConcepts == 10) {
                  conceptList = ["one","two","three","four","five","six","seven","eight","nine","ten"];
                }
                else if (numberOfConcepts == 11) {
                  conceptList = ["one","two","three","four","five","six","seven","eight","nine","ten","eleven"];
                }
                else if (numberOfConcepts == 12) {
                  conceptList = ["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"];
                }

                displayConcepts(conceptList);
            });

            $("#cancelCustomConceptsButton").click(function(e) {
                e.preventDefault();
                $(".concept-detail-view").hide();
                $(".concept-custom-view").hide();
                $(".concept-select-view").show();
            });

            $("#cancelDetailConceptsButton").click(function(e) {
                e.preventDefault();
                $(".concept-detail-view").hide();
                $(".concept-custom-view").hide();
                $(".concept-select-view").show();
            });

            $('#dataDefinedSelect').on("change", function(e) {
                var dataDefined = $("#dataDefinedSelect").val();
                if (dataDefined == "userDefined") {
                    $("#dataDefined").hide();
                    $("#userDefined").show();
                    $("#statsDefined").hide();
                }
                else {
                    $("#userDefined").hide();
                    $("#dataDefined").show();
                    $("#statsDefined").show();
                    var contextName = getContextName();
                    $("#fieldTI").val(contextName);
                }
            });

            $('#typeSelect').on("change", function(e) {
                var type = $("#typeSelect").val();
                console.log("change val=" + type);

                if (type == "domain") {
                    $("#averageCenteredAttributes").hide();
                    $("#medianCenteredAttributes").hide();
                    $("#averageAndMedianAttributes").hide();
                    $("#domainAttributes").show();
                }
                else if (type == "average_centered") {
                    $("#domainAttributes").hide();
                    $("#medianCenteredAttributes").hide();
                    $("#averageAndMedianAttributes").show();
                    $("#averageCenteredAttributes").show();
     
                }
                else if (type == "median_centered") {
                    $("#domainAttributes").hide();
                    $("#averageCenteredAttributes").hide();
                    $("#averageAndMedianAttributes").show();
                    $("#medianCenteredAttributes").show();
                }
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

            $('input[type=radio][name=methodRadio]').change(function() {
               selectedMethod = this.value;
               console.log("Selected Method is " + selectedMethod);
            });

            $('input[type=radio][name=typeRadio]').change(function() {
               selectedType = this.value;
               console.log("Selected Type is " + selectedMethod);
            });

            $("#addNewClassButton").click(function(e) {
                e.preventDefault();
                console.log("Add Class to List Clicked");
                addClassToList();
            });

            $("#date_wday_link").click(function(e) {
                e.preventDefault();
                var val = $("#date_wday_link").text();
                addPeriodicityToList(val);
            });

            $("#date_hour_link").click(function(e) {
                e.preventDefault();
                var val = $("#date_hour_link").text();
                addPeriodicityToList(val);
            });

            $("#createSavedSearchButton").click(function(e) {
                e.preventDefault();
                console.log("Create Context Saved Search Button clicked");
                var searchName = $("#createSearchNameTI").val();
                var search = $("#createSearchTA").val().replace(/"/g, '\'');
                var $el = $('#createSearchResponse');
                var searchString = "| xsvCreateSavedSearch app="+selectedApp+" name=\""+searchName+"\" search=\""+search + "\"";
                self.SearchUtil.run($el, searchString);
            });

            $("#updateSavedSearchButton").click(function(e) {
                e.preventDefault();
                console.log("Update Context Saved Search Button clicked");
                var searchName = $("#updateSearchNameTI").val();
                var search = $("#updateSearchTA").val().replace(/"/g, '\'');;
                var $el = $('#updateSearchResponse');
                var searchString = "| xsvCreateSavedSearch app="+selectedApp+" name=\""+searchName+"\" search=\""+search + "\"";
                self.SearchUtil.run($el, searchString);
            });

            $("#conceptShape").on('loaded', function(event) {
                console.log ("Concept Shapes updated successfully");
                var scopeStr = "";
                if ($('#privateCB').is(':checked')) {
                    scopeStr = " scope=private ";
                }
                else {
                    scopeStr = " scope=" + selectedApp + " ";
                }
                var searchString  = "| xsvDisplayContext  " + getContextName()+ " IN " + getContainerName + " APP " + selectedApp + scopeStr;
            });

            $("#createSearchResponse").on('loaded', function(event) {
                var searchResults = event.searchResults;
                if (searchResults != null) {
                    var httpErrorCode = searchResults.rows[0][0];
                    if (httpErrorCode == "201") {
                        $("#createSavedSearchMessage").html("Successfulyy Created Saved Search!");
                        $("#createSavedSearchError").html("");
                    }
                    else if (httpErrorCode == "409") {
                        $("#createSavedSearchError").html("Saved Search Already Exists!");
                        $("#createSavedSearchMessage").html("");
                    }
                    else {
                        $("#createSavedSearchError").html("Failure Creating Saved Search!");
                        $("#createSavedSearchMessage").html("");
                    }
                }
                else {
                    $("#createSavedSearchError").html("Failure Creating Saved Search!");
                    $("#createSavedSearchMessage").html("");
                }
            });

            $("#updateSearchResponse").on('loaded', function(event) {
                var searchResults = event.searchResults;
                if (searchResults != null) {
                    var httpErrorCode = searchResults.rows[0][0];
                    if (httpErrorCode == "201") {
                        $("#updateSavedSearchMessage").html("Successfulyy Created Saved Search!");
                        $("#updateSavedSearchError").html("");
                    }
                    else if (httpErrorCode == "409") {
                        $("#updateSavedSearchMessage").html("");
                        $("#updateSavedSearchError").html("Saved Search Already Exists!");
                    }
                    else {
                        $("#updateSavedSearchMessage").html("");
                        $("#updateSavedSearchError").html("Failure Creating Saved Search!");
                    }
                }
                else {
                    $("#updateSavedSearchMessage").html("");
                    $("#updateSavedSearchError").html("Failure Creating Saved Search!");
                }
            });

            $("#done-view-container").on('loaded', function(event) {
                console.log("Successful search ...");
                var searchResults = event.searchResults;
                if (searchResults != null) {
                    if (doConceptCheck == true) {
                        doConceptCheck = false;
                        if (checkConcepts(searchResults) == true) {
                            return;
                        }
                    }
                    $("#review-inprogress-panel").hide();
                    $("#review-failure-panel").hide();
                    $("#review-success-panel").show();
                    $("#nextButton").attr("disabled","disabled");
                    $("#prevButton").attr("disabled","disabled");
                    var domainMin = searchResults.rows[0][0];
                    //var domainMax = searchResults.rows[255][0];
                    var domainMax = searchResults.rows[searchResults.rows.length-1][0];
                    var $el = $("#explorerChart");
                    var isAD = false;
                    if (selectedMethod == "anomalyDriven") {
                        isAD = true;
                    }
                    self.ContextChart.renderContextChart2(getContextName(), domainMin, domainMax, $el, searchResults, isAD);

                    if (selectedMethod != "userDefined") {
                        $("#review-search-panel").show();
                        var containerName = getContainerName();
                        var contextName = getContextName();
                        $("#createSearchNameTI").val("Create Context - " + contextName + " in " + containerName);
                        $("#updateSearchNameTI").val("Update Context - " + contextName + " in " + containerName);
                        $("#createSearchTA").html(createContextCommand);
                        $("#updateSearchTA").html(updateContextCommand);
                    }
                    else {
                        $("#createSearchNameTI").val("");
                        $("#updateSearchNameTI").val("");
                        $("#review-search-panel").hide();
                        $("#createSearchTA").html("");
                        $("#updateSearchTA").html("");
                    }
                }
                else {
                    $("#review-inprogress-panel").hide();
                    $("#review-search-panel").hide();
                    $("#review-success-panel").hide();
                    $("#review-failure-panel").show();

                    //var errors = event.errorMessages;
                    //$("#review-failure-messages").html("<br><br>The following errors were encountered:<br><br>");
                    //for (var i = 0; i < errors.length; i++) {
                    //    $("#review-failure-messages").append(errors[i] + "<br>");
                    //}

                    $("#review-success-panel").hide();
                    $("#review-failure-panel").show();
                }

                $("#xsv-view-container").children().hide();
                $("#done-view-container").show();

                $("#stepRange").removeClass("active");
                $("#stepRange").addClass("completed");
                $("#stepDone").addClass("active");
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

            $(".numbers-only").keypress(function (e) {
                // Allow: backspace/delete, tab, and enter
                if ($.inArray(e.keyCode, [8, 9, 13]) !== -1) {
                    return;
                }

                var code = e.which || e.keyCode;
                var charStr = String.fromCharCode(code);
                if (/[0-9.-]/.test(charStr)) return;

                e.preventDefault();
            });

            $("#createContextButton").click(function(e) {
                e.preventDefault();
                console.log("Create Context Clicked");
                displayCreateMessage();
                createContext();
            });

            $('#newConceptTI').keypress(function(e) {
                if (e.which == 13) {
                    addConceptToList();
                }
            });

            $('#newClassTI').keypress(function(e) {
                if (e.which == 13) {
                    addClassToList();
                }
            });

            $('.dropdown-toggle').dropdown();

            $('#validateSearchButton').on("click", function(e) {
                e.preventDefault();
                console.log ("Validate Search ...");

                var stats = $("#statsTA").val();
                var statsCommand = "";
                if (stats != "") {
                    statsCommand = " | " + stats;
                }
                var searchString = $("#searchTA").val() + statsCommand;
                var range = "&earliest="+earliest+"&latest="+latest;
                window.open("search?q=" + encodeURIComponent(searchString)+range, "_blank");
            });
        }

        function setURLParams() {
        }

        $("#row1").css("margin-top","40px");

        self.URLUtil.loadURLParams();
        createHandlers();
        getApps();
        //createCopyrightDiv();
    });
});
