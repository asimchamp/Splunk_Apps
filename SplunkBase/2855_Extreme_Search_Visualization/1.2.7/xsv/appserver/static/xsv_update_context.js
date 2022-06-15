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
    urlArgs: "bust=1_0_1" + (new Date()).getTime()
});

require([
    "underscore",
    "jquery",
    "splunkjs/mvc/utils",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "app/xsv/searchUtil",
    "app/xsv/contextChart",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "app/xsv/bootstrap-slider",
    "bootstrap.modal",
    "util/moment",
    "splunkjs/mvc/tableview",
    "splunkjs/ready!"
    //"splunkjs/mvc/simplexml/ready!"
], function(_, $, utils, mvc, SearchManager, SearchUtil, ContextChart, d3_v3, nv_d3, bootstrap_slider, bootstrap_modal, moment, TableView) {
    require(['splunkjs/ready!'], function() {

        var isAD = false;
        var appName = getParameterByName("app");
        var scopeName = getParameterByName("scope");
        var containerName = getParameterByName("container");
        var contextName = getParameterByName("context");
        var className = getParameterByName("class");
        if (className === null || className === "null" || className === "") {
            className = "";
        }
        else {
            $("#addConceptButton").attr("disabled","disabled");
        }
        var byClause = (className === "") ? "" : " BY \"" + className + "\"";

 
        var scopeStr = " SCOPED " + scopeName;
        if (scopeName != "private") scopeStr = " SCOPED " + appName;
        require(["bootstrap.modal"],function() {
            $('#loadingContextModalMessage').html("Loading Context " + contextName + " IN " + containerName + " APP " + appName + byClause + scopeStr + " . . . ");
            $('#loadingContextModal').modal('show');
            $('#loadingContextModal').css('z-index', '9999');
        });

        var chartTicks = [];
        var chartData = [];
        var domainMin = 0;
        var domainMax = 0;
        var contextData = null;
        var contextDataResults = null;
        var conceptData = null;
        var conceptFocus = null;

        var conceptSearchId = 0;
        var contextSearchId = 0;
        var contextDataSearchId = 0;
        var contextDataTableId = 0;
        var updateContextSearchId = 0;
        var updateConceptSearchId = 0;
        var renameConceptSearchId = 0;
        var deleteConceptSearchId = 0;
        var addConceptSearchId = 0;
        var conceptChangesPending = false;

        var selectedConceptName = "";
        var selectedConceptType = "";

        var tableView = null;

        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
            var results = regex.exec(location.search);
            return (results === null || results === "null") ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }


        function generatePointString(conceptName, conceptType) {
            var result = "";
            if (conceptType == "curvedecrease") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptInflectionSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "curveincrease") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptInflectionSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "lineardecrease") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "linearincrease") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "pi") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptInflectionLeftSL").val() + ",";
                result += $("#"+conceptName+"ConceptCenterSL").val() + ",";
                result += $("#"+conceptName+"ConceptInflectionRightSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "trapezoid") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptTrapLeftSL").val() + ",";
                result += $("#"+conceptName+"ConceptTrapRightSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "strapezoid") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptInflectionLeftSL").val() + ",";
                result += $("#"+conceptName+"ConceptTrapLeftSL").val() + ",";
                result += $("#"+conceptName+"ConceptTrapRightSL").val() + ",";
                result += $("#"+conceptName+"ConceptInflectionRightSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "triangle") {
                result += $("#"+conceptName+"ConceptMinimumSL").val() + ",";
                result += $("#"+conceptName+"ConceptCenterSL").val() + ",";
                result += $("#"+conceptName+"ConceptMaximumSL").val();
                return result;
            }
            else if (conceptType == "custom") {
                console.log("TODO - generatePointString for custom");
                var vector = generateVector(conceptName,conceptType);
                for (var i = 0; i < 255; i++) {
                    result += String(vector[i]) + ","
                }
                result += String(vector[255])
                return result;
            }
        }

        function generateVector(conceptName, conceptType) {

            if (conceptType == "curvedecrease") {
                return createVectorCurveDecrease(conceptName);
            }
            else if (conceptType == "curveincrease") {
                return createVectorCurveIncrease(conceptName);
            }
            else if (conceptType == "lineardecrease") {
                return createVectorLinearDecrease(conceptName);
            }
            else if (conceptType == "linearincrease") {
                return createVectorLinearIncrease(conceptName);
            }
            else if (conceptType == "pi") {
                return createVectorPI(conceptName);
            }
            else if (conceptType == "trapezoid") {
                return createVectorTrapezoid(conceptName);
            }
            else if (conceptType == "strapezoid") {
                return createVectorStrapezoid(conceptName);
            }
            else if (conceptType == "triangle") {
                return createVectorTriangle(conceptName);
            }
            else if (conceptType == "custom") {
                return createVectorCustom(conceptName);
            }
        }

        function convertPointStringToNumber(val) {
            var point = parseFloat(val);
            //return Math.round(point * 10000) / 10000;
            return point;
        }

        function convertPointNumberToString(val) {
        }

        function createVectorCurveDecrease(conceptName) {

            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var inflection = $("#"+conceptName+"ConceptInflectionSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var inflectionPoint = convertPointStringToNumber(inflection);
            var termMax = convertPointStringToNumber(max);

            if (inflectionPoint > termMax) {
                inflectionPoint = termMax;
                $("#"+conceptName+"ConceptInflectionSL").slider('setValue',inflectionPoint);
                $("#"+conceptName+"ConceptInflectionLabel").text(inflectionPoint);
            }

            if (termMin > inflectionPoint) {
                termMin = inflectionPoint;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;
            var leftSize = (termMax-inflectionPoint) * 2;
            var rightSize = (inflectionPoint - termMin) * 2;
            var i = 0;
            for(i=0;i<256;i++)
            {
                var bucketSize = domainMin + i/255 * domainSize;
                if (bucketSize <= termMin)
                    result[i] = 1.00;
                else if (bucketSize < inflectionPoint)
                    result[i] = (1 - (2 * (Math.pow((bucketSize-termMin)/rightSize,2))));
                else if (bucketSize < termMax)
                    result[i] = (2 * (Math.pow((bucketSize-termMax)/leftSize,2)));
                else 
                    result[i] = 0;
            }
            return result;
        }

        function createVectorCurveIncrease(conceptName) {
            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var inflection = $("#"+conceptName+"ConceptInflectionSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var inflectionPoint = convertPointStringToNumber(inflection);
            var termMax = convertPointStringToNumber(max);

            if (inflectionPoint > termMax) {
                inflectionPoint = termMax;
                $("#"+conceptName+"ConceptInflectionSL").slider('setValue',inflectionPoint);
                $("#"+conceptName+"ConceptInflectionLabel").text(inflectionPoint);
            }

            if (termMin > inflectionPoint) {
                termMin = inflectionPoint;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;
            var leftSize = (termMax-inflectionPoint) * 2;
            var rightSize = (inflectionPoint - termMin) * 2;
            var i = 0;
            for(i=0;i<256;i++)
            {
                var bucketSize = domainMin + i/255 * domainSize;
                if (bucketSize >= termMax)
                    result[i] = 1.00;
                else if (bucketSize > inflectionPoint)
                    result[i] = (1 - (2 * (Math.pow((bucketSize-termMax)/leftSize,2))));
                else if (bucketSize > termMin)
                    result[i] = (2 * (Math.pow((bucketSize-termMin)/rightSize,2)));
                else 
                    result[i] = 0;
            }
            return result;
        }

        function createVectorLinearDecrease(conceptName) {
            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var termMax = convertPointStringToNumber(max);

            if (termMin > termMax) {
                termMin = termMax;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;
            var termSize = termMax - termMin;

            // set the CIX for each bucket 
            var i = 0;
            for(i=0; i<256; i++)
            {
                var distanceFromMin = domainMin + i/255 * domainSize;
                if (distanceFromMin <= termMin)
                    result[i] = 1.00;
                else if(distanceFromMin < termMax)
                    result[i] = 1.00 - (distanceFromMin - termMin)/ termSize;
                else 
                    result[i] = 0;
            }
            return result;
        }

        function createVectorLinearIncrease(conceptName) {
            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var termMax = convertPointStringToNumber(max);

            if (termMin > termMax) {
                termMin = termMax;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;
            var termSize = termMax - termMin;

            // set the CIX for each bucket 
            var i = 0;
            for(i=0; i<256; i++)
            {
                var distanceFromMin = domainMin + i/255 * domainSize;
                if (distanceFromMin > termMax)
                    result[i] = 1.00;
                else if(distanceFromMin > termMin)
                    result[i] = ((distanceFromMin - termMin)/ termSize);
                else 
                    result[i] = 0;
            }
            return result;
        }

        function createVectorPI(conceptName) {
            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var inflectionLeft = $("#"+conceptName+"ConceptInflectionLeftSL").val();
            var center = $("#"+conceptName+"ConceptCenterSL").val();
            var inflectionRight = $("#"+conceptName+"ConceptInflectionRightSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var leftInflectionPoint = convertPointStringToNumber(inflectionLeft);
            var centerPoint = convertPointStringToNumber(center);
            var rightInflectionPoint = convertPointStringToNumber(inflectionRight);
            var termMax = convertPointStringToNumber(max);

            if (rightInflectionPoint > termMax) {
                rightInflectionPoint = termMax;
                $("#"+conceptName+"ConceptInflectionRightSL").slider('setValue',rightInflectionPoint);
                $("#"+conceptName+"ConceptInflectionRightLabel").text(rightInflectionPoint);
            }
            if (centerPoint > rightInflectionPoint) {
                centerPoint = rightInflectionPoint;
                $("#"+conceptName+"ConceptCenterSL").slider('setValue',centerPoint);
                $("#"+conceptName+"ConceptCenterLabel").text(centerPoint);
            }
            if (leftInflectionPoint > centerPoint) {
                leftInflectionPoint = centerPoint;
                $("#"+conceptName+"ConceptInflectionLeftSL").slider('setValue',centerPoint);
                $("#"+conceptName+"ConceptInflectionLeftLabel").text(centerPoint);
            }
            if (termMin > leftInflectionPoint) {
                termMin = leftInflectionPoint;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;

            var i = 0;

            for(i=0;i<256;i++)
            {
                var bucketIDX = domainMin + i/255 * domainSize;
                if (bucketIDX >= termMin && bucketIDX <= termMax)
                {
                    if (bucketIDX < leftInflectionPoint)
                        result[i] = (2 * (Math.pow((bucketIDX - termMin)/((leftInflectionPoint - termMin)*2),2)));
                    else if (bucketIDX < centerPoint)
                        result[i] = (1 - (2 * (Math.pow((bucketIDX - centerPoint)/((centerPoint - leftInflectionPoint)*2),2))));
                    else if (bucketIDX < rightInflectionPoint)
                        result[i] = (1 - (2 * (Math.pow((bucketIDX - centerPoint)/((rightInflectionPoint - centerPoint)*2),2))));
                    else if (bucketIDX < termMax)
                        result[i] = (2 * (Math.pow((bucketIDX - termMax)/((termMax - rightInflectionPoint)*2),2)));
                }
                else
                {
                    result[i]=0;
                }
            }
    
            return result;
        }

        function createVectorTrapezoid(conceptName) {
            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var trapLeft = $("#"+conceptName+"ConceptTrapLeftSL").val();
            var trapRight = $("#"+conceptName+"ConceptTrapRightSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var leftTrapPoint = convertPointStringToNumber(trapLeft);
            var rightTrapPoint = convertPointStringToNumber(trapRight);
            var termMax = convertPointStringToNumber(max);

            if (rightTrapPoint > termMax) {
                rightTrapPoint = termMax;
                $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',rightTrapPoint);
                $("#"+conceptName+"ConceptTrapRightLabel").text(rightTrapPoint);
            }
            if (leftTrapPoint > rightTrapPoint) {
                leftTrapPoint = rightTrapPoint;
                $("#"+conceptName+"ConceptTrapLeftSL").slider('setValue',leftTrapPoint);
                $("#"+conceptName+"ConceptTrapLeftLabel").text(leftTrapPoint);
            }
            if (termMin > leftTrapPoint) {
                termMin = leftTrapPoint;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;

            for(i=0;i<256;i++)
            {
                var bucketSize = domainMin + i/255 * domainSize;
                if (bucketSize >= termMin && bucketSize <= termMax)
                {
                    if (bucketSize < leftTrapPoint)
                        result[i]=((bucketSize - termMin)/(leftTrapPoint - termMin));
                    else if (bucketSize > rightTrapPoint)
                        result[i]=(1 - (bucketSize - rightTrapPoint)/(termMax - rightTrapPoint));
                    else
                        result[i]=1.0;
                }
                else
                {
                    result[i]=0;
                }
            }
            return result;
        }

        function createVectorStrapezoid(conceptName) {
            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var inflectionLeft = $("#"+conceptName+"ConceptInflectionLeftSL").val();
            var trapLeft = $("#"+conceptName+"ConceptTrapLeftSL").val();
            var trapRight = $("#"+conceptName+"ConceptTrapRightSL").val();
            var inflectionRight = $("#"+conceptName+"ConceptInflectionRightSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var leftInflectionPoint = convertPointStringToNumber(inflectionLeft);
            var leftTrapPoint = convertPointStringToNumber(trapLeft);
            var rightTrapPoint = convertPointStringToNumber(trapRight);
            var rightInflectionPoint = convertPointStringToNumber(inflectionRight);
            var termMax = convertPointStringToNumber(max);

            if (rightInflectionPoint > termMax) {
                rightInflectionPoint = termMax;
                $("#"+conceptName+"ConceptInflectionRightSL").slider('setValue',rightInflectionPoint);
                $("#"+conceptName+"ConceptInflectionRightLabel").text(rightInflectionPoint);
            }
            if (rightTrapPoint > rightInflectionPoint) {
                rightTrapPoint = rightInflectionPoint;
                $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',rightTrapPoint);
                $("#"+conceptName+"ConceptTrapRightLabel").text(rightTrapPoint);
            }
            if (leftTrapPoint > rightTrapPoint) {
                leftTrapPoint = rightTrapPoint;
                $("#"+conceptName+"ConceptTrapLeftSL").slider('setValue',leftTrapPoint);
                $("#"+conceptName+"ConceptTrapLeftLabel").text(leftTrapPoint);
            }
            if (leftInflectionPoint > leftTrapPoint) {
                leftInflectionPoint = leftTrapPoint;
                $("#"+conceptName+"ConceptInflectionLeftSL").slider('setValue',leftInflectionPoint);
                $("#"+conceptName+"ConceptInflectionLeftLabel").text(leftInflectionPoint);
            }
            if (termMin > leftInflectionPoint) {
                termMin = leftInflectionPoint;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;
            //var step = Math.round((domainMax - domainMin ) * 10000 / 255 ) / 10000;
            var step = (domainMax - domainMin ) / 255;
            var bucketSize = domainMin;
            for(i=0;i<256;i++)
            {
                if (bucketSize >= termMin && bucketSize <= termMax)
                {
                    if (bucketSize >= leftInflectionPoint && bucketSize <= leftTrapPoint) {
                        //result[i]=(1-(2 * (Math.pow((bucketSize - leftTrapPoint)/((leftTrapPoint - leftInflectionPoint)*2),2))));
                        var tmp = (1-(2 * (Math.pow((bucketSize - leftTrapPoint)/((leftTrapPoint - leftInflectionPoint)*2),2))));
                        result[i] = Math.round(tmp * 10000) / 10000;
                    }
                    else if (bucketSize >= termMin && bucketSize <= leftInflectionPoint) {
                        //result[i]=(2 * (Math.pow((bucketSize - termMin)/((leftInflectionPoint - termMin)*2),2)));
                        var tmp = (2 * (Math.pow((bucketSize - termMin)/((leftInflectionPoint - termMin)*2),2)));
                        result[i] = Math.round(tmp * 10000) / 10000;
                    }
                    else if (bucketSize >= rightTrapPoint && bucketSize <= rightInflectionPoint) {
                        //result[i]=(1-(2 * (Math.pow((bucketSize - rightTrapPoint)/((rightInflectionPoint - rightTrapPoint)*2),2))));
                        var tmp = (1-(2 * (Math.pow((bucketSize - rightTrapPoint)/((rightInflectionPoint - rightTrapPoint)*2),2))));
                        result[i] = Math.round(tmp * 10000) / 10000;
                    }
                    else if (bucketSize >= rightInflectionPoint && bucketSize <= termMax) {
                        //result[i]=(2 * (Math.pow((bucketSize - termMax)/((termMax - rightInflectionPoint)*2),2)));
                        var tmp = (2 * (Math.pow((bucketSize - termMax)/((termMax - rightInflectionPoint)*2),2)));
                        result[i] = Math.round(tmp * 10000) / 10000;
                    }
                    else {
                        result[i]=1.0;
                    }
                }
                else
                {
                    result[i]=0;
                }
                bucketSize += step;
            }
            return result;
        }

        function createVectorTriangle(conceptName) {
            var min = $("#"+conceptName+"ConceptMinimumSL").val();
            var center = $("#"+conceptName+"ConceptCenterSL").val();
            var max = $("#"+conceptName+"ConceptMaximumSL").val();

            var termMin = convertPointStringToNumber(min);
            var centerPoint = convertPointStringToNumber(center);
            var termMax = convertPointStringToNumber(max);

            if (centerPoint > termMax) {
                centerPoint = termMax;
                $("#"+conceptName+"ConceptCenterSL").slider('setValue',centerPoint);
                $("#"+conceptName+"ConceptCenterLabel").text(centerPoint);
            }
            if (termMin > centerPoint) {
                termMin = centerPoint;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;

            for(i=0;i<256;i++)
            {
                var bucketSize = domainMin + i/255 * domainSize;
                if (bucketSize >= termMin && bucketSize <= termMax)
                {
                    if (bucketSize < centerPoint)
                        result[i] = ((bucketSize - termMin)/(centerPoint - termMin));
                    else if (bucketSize == centerPoint)
                        result[i] = 1.0;
                    else
                        result[i]= (1 - (bucketSize - centerPoint)/(termMax - centerPoint));
                }
                else
                {
                    result[i]=0;
                }
            }
            return result;
        }
        function createVectorCustom(conceptName) {
            var min = domainMin;
            var crossoverLeft = $("#"+conceptName+"ConceptCrossoverLeftSL").val();
            var trapLeft = $("#"+conceptName+"ConceptTrapLeftSL").val();
            var trapRight = $("#"+conceptName+"ConceptTrapRightSL").val();
            var crossoverRight = $("#"+conceptName+"ConceptCrossoverRightSL").val();
            var max = domainMax;

            // Create Left Curve
            var termMin = convertPointStringToNumber(min);
            var inflectionPoint = convertPointStringToNumber(crossoverLeft);
            var termMax = convertPointStringToNumber(trapLeft);

            if (inflectionPoint > termMax) {
                inflectionPoint = termMax;
                $("#"+conceptName+"ConceptCrossoverLeftSL").slider('setValue',inflectionPoint);
                $("#"+conceptName+"ConceptCrossoverLeftLabel").text(inflectionPoint);
            }

            if (termMin > inflectionPoint) {
                termMin = inflectionPoint;
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptMinimumLabel").text(termMin);
            }

            var result = [];
            var domainSize = domainMax - domainMin;
            var leftSize = (termMax-inflectionPoint) * 2;
            var rightSize = (inflectionPoint - termMin) * 2;
            var i = 0;
            var bucketSize = domainMin;
            //var step = Math.round((domainMax - domainMin ) * 10000 / 255 ) / 10000;
            var step = (domainMax - domainMin ) / 255;
            for(i=0;i<256;i++)
            {
                if (bucketSize <= termMin)
                    result[i] = 1.00;
                else if (bucketSize < inflectionPoint) {
                    var tmp = (1 - (2 * (Math.pow((bucketSize-termMin)/rightSize,2))));
                    result[i] = Math.round(tmp * 10000) / 10000;
                }
                else if (bucketSize < termMax) {
                    var tmp = (2 * (Math.pow((bucketSize-termMax)/leftSize,2)));
                    result[i] = Math.round(tmp * 10000) / 10000;
                }
                else
                    result[i] = 0;

                bucketSize += step;
            }

            // Create Right Curve
            termMin = convertPointStringToNumber(trapRight);
            inflectionPoint = convertPointStringToNumber(crossoverRight);
            termMax = convertPointStringToNumber(max);

            if (inflectionPoint > termMax) {
                inflectionPoint = termMax;
                $("#"+conceptName+"ConceptCrossoverRightSL").slider('setValue',inflectionPoint);
                $("#"+conceptName+"ConceptTrapCrossovertLabel").text(inflectionPoint);
            }

            if (termMin > inflectionPoint) {
                termMin = inflectionPoint;
                $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',termMin);
                $("#"+conceptName+"ConceptTrapLeftLabel").text(termMin);
            }

            var result2 = [];
            var domainSize = domainMax - domainMin;
            var leftSize = (termMax-inflectionPoint) * 2;
            var rightSize = (inflectionPoint - termMin) * 2;
            var bucketSize = domainMax;
            var i = 0;
            for(i=255;i>=0;i--)
            {
                if (bucketSize >= termMax)
                    result2[i] = 1.00;
                else if (bucketSize > inflectionPoint) {
                    var tmp = (1 - (2 * (Math.pow((bucketSize-termMax)/leftSize,2))));
                    result2[i] = Math.round(tmp * 10000) / 10000;
                }
                else if (bucketSize > termMin) {
                    var tmp = (2 * (Math.pow((bucketSize-termMin)/rightSize,2)));
                    result2[i] = Math.round(tmp * 10000) / 10000;
                }
                else
                    result2[i] = 0;

                bucketSize -= step;
            }

            // merge vectors
            for(i=0; i<256; i++)
                if (result[i] < result2[i])
                    result[i] = result2[i]; 
            return result;

        }

        function checkCustom(conceptName, pointType) {
            var isCustom = false;
            _.each(conceptData.rows, function(data) {
                var name = data[0];
                var type = data[1];
                if (name == conceptName) {
                    if (type == "custom") {
                        isCustom = true;
                    }
                }
                else if (name != conceptName) {
                    console.log("Found other concept: " + name + ", type " + type);
                    if (isCustom == true) {
                        if (pointType == "CROSSOVER_LEFT") {
                            var crossoverLeft = Number($("#"+conceptName+"ConceptCrossoverLeftSL").val());
                            $("#"+name+"ConceptInflectionLeftSL").slider('setValue',crossoverLeft);
                            $("#"+name+"ConceptInflectionLeftLabel").text(crossoverLeft);

                            var trapLeft = Number($("#"+conceptName+"ConceptTrapLeftSL").val());
                            var distance = Math.round((trapLeft - crossoverLeft) * 10000) / 10000;
                            var min = Math.round((crossoverLeft - distance) * 10000) / 10000;
                            $("#"+name+"ConceptMinimumSL").slider("setAttribute", "min",min);
                            $("#"+name+"ConceptMinimumSL").slider('setValue',min);
                            $("#"+name+"ConceptMinimumLeftLabel").text(min);
                            domainMin = min;
                        }
                        else if (pointType == "TRAP_LEFT") {
                            var trapLeft = Number($("#"+conceptName+"ConceptTrapLeftSL").val());
                            $("#"+name+"ConceptTrapLeftSL").slider('setValue',trapLeft);
                            $("#"+name+"ConceptTrapLeftLabel").text(trapLeft);

                            var crossoverLeft = Number($("#"+conceptName+"ConceptCrossoverLeftSL").val());
                            var distance = Math.round((trapLeft - crossoverLeft) * 10000) / 10000;
                            var min = Math.round((crossoverLeft - distance) * 10000) / 10000;
                            console.log("Calculating: trapLeft=" + trapLeft + " crossoverLeft=" + crossoverLeft + " distance=" + distance + " min=" + min);
                            $("#"+name+"ConceptMinimumSL").slider("setAttribute", "min",min);
                            $("#"+name+"ConceptMinimumSL").slider('setValue',min);
                            $("#"+name+"ConceptMinimumLeftLabel").text(min);
                            domainMin = min;
                        }
                        else if (pointType == "TRAP_RIGHT") {
                            var trapRight = Number($("#"+conceptName+"ConceptTrapRightSL").val());
                            $("#"+name+"ConceptTrapRightSL").slider('setValue',trapRight);
                            $("#"+name+"ConceptTrapRightLabel").text(trapRight);

                            var crossoverRight = Number($("#"+conceptName+"ConceptCrossoverRightSL").val());
                            var distance = Math.round((crossoverRight - trapRight) * 10000) / 10000;
                            var max = Math.round((crossoverRight + distance) * 10000) / 10000;
                            domainMax = max;
                            $("#"+name+"ConceptMaximumSL").slider("setAttribute", "max",max);
                            $("#"+name+"ConceptMaximumSL").data('slider').max = max;
                            $("#"+name+"ConceptMaximumSL").slider('setValue',max);
                            $("#"+name+"ConceptMaximumLeftLabel").text(max);
                        }
                        else if (pointType == "CROSSOVER_RIGHT") {
                            var crossoverRight = Number($("#"+conceptName+"ConceptCrossoverRightSL").val());
                            $("#"+name+"ConceptInflectionRightSL").slider('setValue',crossoverRight);
                            $("#"+name+"ConceptInflectionRightLabel").text(crossoverRight);

                            var trapRight = Number($("#"+conceptName+"ConceptTrapRightSL").val());
                            var distance = Math.round((crossoverRight - trapRight) * 10000) / 10000;
                            var max = Math.round((crossoverRight + distance) * 10000) / 10000;
                            $("#"+name+"ConceptMaximumSL").slider("setAttribute", "max",max);
                            $("#"+name+"ConceptMaximumSL").slider('setValue',max);
                            $("#"+name+"ConceptMaximumLeftLabel").text(max);
                            domainMax = max;
                        }

                        console.log("Resetting domainMin="+domainMin+" domainMax="+domainMax);
                        var normalResults = generateVector(name, "strapezoid"); 
                        var newConceptName = $("#"+name+"ConceptNameTI").val();
                        var outlierResults = generateVector(conceptName, "custom"); 

                        var newDataResults = new Object();
                        // field[0] = context name
                        // field[1] = outlier concept name
                        // field[2] = normal concept name
                        newDataResults.fields = new Array(3);
                        newDataResults.fields[0] = contextDataResults.fields[0];
                        newDataResults.fields[1] = contextDataResults.fields[1];
                        //newDataResults.fields[1] = newConceptName;
                        newDataResults.fields[2] = contextDataResults.fields[2];
                        newDataResults.rows = new Array(256);
                        var xValue = domainMin;
                        var step = Math.round((domainMax - domainMin ) * 10000 / 255 ) / 10000;
                        for (var i = 0; i < 256; i++) {
                            var outlierValue = outlierResults[i];
                            //var normalValue = normalResults[i];
                            var normalValue = Math.round((1-outlierValue) * 10000) / 10000;
                            newDataResults.rows[i] = [xValue,outlierValue,normalValue];
                            //newDataResults.rows[i] = [xValue,outlierValue,1-outlierValue];
                            xValue += step;
                        }

                        //var isAD = false;
                        //if ((contextData.rows[0][2] == "crossover")&&(contextData.rows[0][15] == "2")) {
                        //    isAD = true;
                        //}
                     
                        var $el = $("#contextChart");
                        self.ContextChart.renderContextChart2(contextName, domainMin, domainMax, $el, newDataResults, isAD);
                        //self.ContextChart.renderContextChart2(contextName, domainMin, domainMax, $el, newDataResults);
                    }
                }
            });
            return isCustom;
        }

        function resetContextAttributes() {
            $('#contextNameTI').val( contextData.rows[0][0] );
            $('#classNameTI').val( contextData.rows[0][1] );
            var type = contextData.rows[0][2];
            $('#typeTI').val( type);
            $('#uomTI').val( contextData.rows[0][3] );
            domainMin = parseFloat(contextData.rows[0][4]);
            $('#domainMinTI').val( domainMin);
            domainMax = parseFloat(contextData.rows[0][5]);
            $('#domainMaxTI').val( domainMax );
            $('#countTI').val( contextData.rows[0][6] );
            var center = parseFloat(contextData.rows[0][7] );
            $('#averageTI').val( center );
            $('#medianTI').val( center );
            $('#widthTI').val( parseFloat(contextData.rows[0][8] ));
            $('#sizeTI').val( parseFloat(contextData.rows[0][9] ));
            $('#notesTA').val( contextData.rows[0][10] );
            //$('#searchTA').val( decodeURIComponent(contextData.rows[0][11]) );
            $('#searchTA').val( contextData.rows[0][11] );
            $('#readTI').val( contextData.rows[0][12] );
            $('#writeTI').val( contextData.rows[0][13] );

            if (type == "average_centered") {
                $("#domainAttributes").hide();
                $("#averageCenteredAttributes").show();
                $("#averageAndMedianAttributes").show();
            }
            else if (type == "median_centered") {
                $("#domainAttributes").hide();
                $("#medianCenteredAttributes").show();
                $("#averageAndMedianAttributes").show();
            }
        }

        function getContextAttributes() {
            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var searchString = "|xsvDisplayContextAttributes " + contextName + " IN " + containerName + byClause + scopeStr + " APP " + appName;
            var $el = $('#appNameTI');
            self.SearchUtil.run($el, searchString);
        }

        function getConceptAttributes() {
            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var searchString = "|xsvDisplayConceptAttributes " + contextName + " IN " + containerName + byClause + scopeStr + " APP " + appName;
            var $el = $('#containerNameTI');
            self.SearchUtil.run($el, searchString);
        }

        function sortConcepts(a,b) {
            var result = 0;
            var aMin = 0;
            var aMax = 0;
            var aCenter = 0;
            var bMin = 0;
            var bMax = 0;
            var bCenter = 0;

            var conceptType = a[1];
            if ((conceptType == "curvedecrease") || (conceptType == "curveincrease")) {
                aCenter = a[4];
            }
            else if ((conceptType == "lineardecrease") || (conceptType == "linearincrease")) {
                aCenter = a[4];
            }
            else if (conceptType == "pi") {
                aCenter = a[5];
            }
            else if (conceptType == "trapezoid") {
                aMin = a[3];
                aMax = a[6];
                aCenter = aMax - (aMax - aMin)/2;
            }
            else if (conceptType == "strapezoid") {
                aMin = a[3];
                aMax = a[8];
                aCenter = aMax - (aMax - aMin)/2;
            }
            else if (conceptType == "triangle") {
                aCenter = a[4];
            }

            conceptType = b[1];
            if ((conceptType == "curvedecrease") || (conceptType == "curveincrease")) {
                bCenter = b[4];
            }
            else if ((conceptType == "lineardecrease") || (conceptType == "linearincrease")) {
                bCenter = b[4];
            }
            else if (conceptType == "pi") {
                bCenter = b[5];
            }
            else if (conceptType == "trapezoid") {
                bMin = b[3];
                bMax = b[6];
                bCenter = bMax - (bMax - bMin)/2;
            }
            else if (conceptType == "strapezoid") {
                bMin = b[3];
                bMax = b[8];
                bCenter = bMax - (bMax - bMin)/2;
            }
            else if (conceptType == "triangle") {
                bCenter = b[4];
            }

            return aCenter - bCenter;
        }

        // Set the Concept Panel Tabs and Attributes
        function createConceptTab(data, isActive) {
            var self = this;
            //var isAD = false;
            var adDisable = "";
            var adHide = "";
            ///if ((contextData.rows[0][2] == "crossover")&&(contextData.rows[0][15] == "2")) {
            if (isAD) {
                //console.log("This is an AD Context!");
                //isAD = true;
                adDisable = " disabled=\"disabled\" ";
                adHide = " style=\"display:none\" ";
                $("#addConceptButton").attr("disabled","disabled");
            }
            var step = Math.round((domainMax - domainMin ) * 10000 / 255 ) / 10000;
            //var step = (domainMax - domainMin ) / 256;
            var conceptName = data[0];
            var conceptType = data[1];
            var alphacut = data[2];

            if (conceptType == "custom") {
                customDisable = " disabled=\"disabled\" ";
                adHide = "";
            }

            var center = 0;
            var inflection = 0;
            var inflectionLeft = 0;
            var inflectionRight = 0;
            var max = 0;
            var min = 0;
            var trapLeft = 0;
            var trapRight = 0;
            var crossoverLeft = 0;
            var crossoverRight = 0;
            var customDisable = "";

            if (conceptType == "curvedecrease") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //inflection = data[4];
                inflection = Math.round((Number(data[4]) * 10000)) / 10000;
                //max = data[5];
                max = Math.round((Number(data[5]) * 10000)) / 10000;
            }
            else if (conceptType == "curveincrease") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //inflection = data[4];
                inflection = Math.round((Number(data[4]) * 10000)) / 10000;
                //max = data[5];
                max = Math.round((Number(data[5]) * 10000)) / 10000;
            }
            else if (conceptType == "lineardecrease") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //max = data[4];
                max = Math.round((Number(data[4]) * 10000)) / 10000;
            }
            else if (conceptType == "linearincrease") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //max = data[4];
                max = Math.round((Number(data[4]) * 10000)) / 10000;
            }
            else if (conceptType == "pi") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //inflectionLeft = data[4];
                inflectionLeft = Math.round((Number(data[4]) * 10000)) / 10000;
                //center = data[5];
                center = Math.round((Number(data[5]) * 10000)) / 10000;
                //inflectionRight = data[6];
                inflectionRight = Math.round((Number(data[6]) * 10000)) / 10000;
                //max = data[7];
                max = Math.round((Number(data[7]) * 10000)) / 10000;
            }
            else if (conceptType == "trapezoid") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //trapLeft = data[4];
                trapLeft = Math.round((Number(data[4]) * 10000)) / 10000;
                //trapRight = data[5];
                trapRight = Math.round((Number(data[5]) * 10000)) / 10000;
                //max = data[6];
                max = Math.round((Number(data[6]) * 10000)) / 10000;
            }
            else if (conceptType == "strapezoid") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //inflectionLeft = data[4];
                inflectionLeft = Math.round((Number(data[4]) * 10000)) / 10000;
                //trapLeft = data[5];
                trapLeft = Math.round((Number(data[5]) * 10000)) / 10000;
                //trapRight = data[6];
                trapRight = Math.round((Number(data[6]) * 10000)) / 10000;
                //inflectionRight = data[7];
                inflectionRight = Math.round((Number(data[7]) * 10000)) / 10000;
                //max = data[8];
                max = Math.round((Number(data[8]) * 10000)) / 10000;
            }
            else if (conceptType == "triangle") {
                //min = data[3];
                min = Math.round((Number(data[3]) * 10000)) / 10000;
                //center = data[4];
                center = Math.round((Number(data[4]) * 10000)) / 10000;
                //max = data[5];
                max = Math.round((Number(data[5]) * 10000)) / 10000;
            }
            else if (conceptType == "custom") {

                var lowerCrossoverDone = false;
                var lowerMaxDone = false;
                var upperMinDone = false;
                var upperCrossoverDone = false;
                for (var x = 0; x < 255; x++) {
                    if (x == 0) {
                        min = domainMin
                    }
                    else if (x == 255) {
                        max = domainMax
                    }
                    else if (lowerCrossoverDone == false) {
                      if (Number(data[x+3]) <= 0.5) {
                        crossoverLeft = Math.round((domainMin + (step * x)) * 1000) / 1000;
                        console.log("crossoverLeft="+crossoverLeft);
                        lowerCrossoverDone = true;
                      }
                    }
                    else if (lowerMaxDone == false) {
                        if (Number(data[x+3]) == 0) {
                            trapLeft = Math.round((domainMin + (step * x)) * 1000) / 1000;
                            console.log("trapLeft="+trapLeft);
                            lowerMaxDone = true;
                        }
                    }
                    else if (upperMinDone == false) {
                        if (Number(data[x+3]) > 0) {
                            trapRight = Math.round((domainMin + (step * x)) * 1000) / 1000;
                            console.log("trapRight="+trapRight);
                            upperMinDone = true;
                        }
                    }
                    else if (upperCrossoverDone == false) {
                        if (Number(data[x+3]) >= 0.5) {
                            crossoverRight = Math.round((domainMin + (step * x)) * 1000) / 1000;
                            console.log("crossoverRight="+crossoverRight);
                            upperCrossoverDone = true;
                        }
                    }
                }
            }

            var isActivePanel = " active ";
            if (isActive === "") {
                isActivePanel = "";
            }

            var deleteDisabled = "";
            if (!(className === null || className === "null" || className === "") || isAD) {
                deleteDisabled = " disabled=\"disabled\" ";
            }

            var conceptTab = "<li role=\"presentation\"" + isActive + "><a href=\"#" + conceptName + "\" aria-controls=\"" + conceptName + "\" role=\"tab\" >" + conceptName + "</a></li>";
            $('#conceptTabs').append(conceptTab);
            var conceptPane = "<div role=\"tabpanel\" class=\"tab-pane" + isActivePanel + "\" id=\"" + conceptName + "\" style=\"padding-top:20px;\">";
            conceptPane +=    "  <div class=\"container-fluid\">";
            conceptPane +=    "    <div class=\"row-fluid\">";
            conceptPane +=    "      <div class=\"span4\">";
            conceptPane +=    "        <div class=\"control-group\">";
            conceptPane +=    "          <label>Concept Name: </label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptNameTI\" type=\"text\" value=\"" + conceptName + "\" class=\"concept-name name-only\" maxlength=\"64\" old-name=\"" + conceptName + "\"/>";
            conceptPane +=    "        </div>";
            conceptPane +=    "        <div class=\"control-group\">";
            conceptPane +=    "          <label>Shape: </label>";
            conceptPane +=    "          <select id=\""+conceptName+"ShapeSelect\"" + adDisable + ">";
            if (conceptType == "custom")
                conceptPane +=    "            <option value=\"custom\" selected >Custom</option>";
            //else
            //    conceptPane +=    "            <option value=\"custom\" >Custom</option>";
            if (conceptType == "curvedecrease")
                conceptPane +=    "            <option value=\"curvedecrease\" selected >Curve Decrease</option>";
            else
                conceptPane +=    "            <option value=\"curvedecrease\" >Curve Decrease</option>";
            if (conceptType == "curveincrease")
                conceptPane +=    "            <option value=\"curveincrease\" selected >Curve Increase</option>";
            else
                conceptPane +=    "            <option value=\"curveincrease\">Curve Increase</option>";
            if (conceptType == "lineardecrease")
                conceptPane +=    "            <option value=\"lineardecrease\" selected >Linear Decrease</option>";
            else
                conceptPane +=    "            <option value=\"lineardecrease\">Linear Decrease</option>";
            if (conceptType == "linearincrease")
                conceptPane +=    "            <option value=\"linearincrease\" selected >Linear Increase</option>";
            else
                conceptPane +=    "            <option value=\"linearincrease\">Linear Increase</option>";
            if (conceptType == "pi")
                conceptPane +=    "            <option value=\"pi\" selected >PI</option>";
            else
                conceptPane +=    "            <option value=\"pi\">PI</option>";
            if (conceptType == "trapezoid")
                conceptPane +=    "            <option value=\"trapezoid\" selected >Trapezoid</option>";
            else
                conceptPane +=    "            <option value=\"trapezoid\">Trapezoid</option>";
            if (conceptType == "strapezoid")
                conceptPane +=    "            <option value=\"strapezoid\" selected >S-Trapezoid</option>";
            else
                conceptPane +=    "            <option value=\"strapezoid\">S-Trapezoid</option>";
            if (conceptType == "triangle")
                conceptPane +=    "            <option value=\"triangle\" selected >Triangle</option>";
            else
                conceptPane +=    "            <option value=\"triangle\">Triangle</option>";
            conceptPane +=    "          </select>";
            conceptPane +=    "        </div>";
            conceptPane +=    "      </div>";
            conceptPane +=    "      <div class=\"span8\"" + adHide + ">";

            conceptPane +=    "        <div id=\""+conceptName+"MinGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Minimum: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptMinimumLabel\" style=\"display:inline-block\">" + min + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptMinimumSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+min+"\" style=\"width:400px; display:block;\">";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptInflectionGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Inflection: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptInflectionLabel\" style=\"display:inline-block;\">" + inflection + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptInflectionSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+inflection+"\" style=\"width:400px; display:block;\" > ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptInflectionLeftGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Inflection Left: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptInflectionLeftLabel\" style=\"display:inline-block;\">" + inflectionLeft + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptInflectionLeftSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+inflectionLeft+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptCrossoverLeftGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Crossover Left: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptCrossoverLeftLabel\" style=\"display:inline-block;\">" + crossoverLeft + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptCrossoverLeftSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+crossoverLeft+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptTrapLeftGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Trap Left: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptTrapLeftLabel\" style=\"display:inline-block;\">" + trapLeft + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptTrapLeftSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+trapLeft+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptCenterGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Center: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptCenterLabel\" style=\"display:inline-block;\">" + center + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptCenterSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+center+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptTrapRightGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Trap Right: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptTrapRightLabel\" style=\"display:inline-block;\">" + trapRight + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptTrapRightSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+trapRight+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptCrossoverRightGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Crossover Right: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptCrossoverRightLabel\" style=\"display:inline-block;\">" + crossoverRight + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptCrossoverRightSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+crossoverRight+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"ConceptInflectionRightGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Inflection Right: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptInflectionRightLabel\" style=\"display:inline-block;\">" + inflectionRight + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptInflectionRightSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+inflectionRight+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "        <div id=\""+conceptName+"MaxGroup\" class=\"control-group\">";
            conceptPane +=    "          <label style=\"display:inline-block\">Maximum: </label>";
            conceptPane +=    "          <label id=\""+conceptName+"ConceptMaximumLabel\" style=\"display:inline-block;\">" + max + "</label>";
            conceptPane +=    "          <input id=\""+conceptName+"ConceptMaximumSL\" type=\"text\" class=\"span3\" value=\"\" data-slider-min=\""+domainMin+"\" data-slider-max=\""+domainMax+"\" data-slider-step=\""+step+"\" data-slider-value=\""+max+"\" style=\"width:400px; display:block;\"> ";
            conceptPane +=    "        </div>";

            conceptPane +=    "      </div>";
            conceptPane +=    "    </div>";
            conceptPane +=    "    <div class=\"row-fluid\">";
            conceptPane +=    "      <div class=\"buttons-wrapper pull-right clearfix\">";
            conceptPane +=    "        <a id=\""+conceptName+"DeleteConceptButton\" class=\"btn btn-danger pull-left\" href=\"#\" style=\"display: inline;margin-right:10px;\""+deleteDisabled+">Delete</a>";
            conceptPane +=    "        <a id=\""+conceptName+"ResetConceptButton\" class=\"cancel-button btn pull-left\" href=\"#\" style=\"display: inline;margin-right:10px;\">Reset</a>";
            conceptPane +=    "        <a id=\""+conceptName+"ApplyConceptButton\" class=\"save-button btn btn-primary pull-left\" href=\"#\" style=\"display: inline;\">Apply</a>";
            conceptPane +=    "      </div>";
            conceptPane +=    "    </div>";
            conceptPane +=    "  </div>";
            conceptPane +=    "</div>";

            $('#conceptPanes').append(conceptPane);

            $("#"+conceptName+"DeleteConceptButton").click(function() {
                console.log("Delete Concept clicked");

                require(["bootstrap.modal"],function() {
                    var msg = "Delete concept \"" + conceptName + "\"! Press confirm to delete; otherwise, click Cancel.";
                    $('#deleteConceptModalMessage').html(msg);
                    $('#deleteConceptModal').modal('show');
                    $('#deleteConceptModal').css('z-index', '9999');
                    $('#deleteConceptModal').data("state", {conceptName: conceptName});
                });
            });

            $("#"+conceptName+"ConceptNameTI").change(function() {
                var oldConceptName = $("#"+conceptName+"ConceptNameTI").attr("old-name");
                console.log("old-name="+oldConceptName);
                var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                if (newConceptName === "") {
                    $("#"+conceptName+"ConceptNameTI").val(conceptName);
                    return; 
                }
                console.log("Concept Name Change Detected: oldConceptName=" + oldConceptName + ", newConceptName=" + newConceptName);

                // Don't allow user to change concept name to one that already exists.
                if (isDuplicateConceptName(newConceptName)) {
                    console.log("Concept Name already exists ...");
                    $("#"+conceptName+"ConceptNameTI").val(conceptName);
                    return;
                }

                $('#conceptTabs a[href="#' + conceptName + '"]').html(newConceptName);
                var ctype = $("#"+conceptName+"ShapeSelect").val();
                if (ctype != "custom") {
                    var results = generateVector(conceptName, ctype); 
                    self.ContextChart.updateContextChartSeries(oldConceptName, newConceptName, results, isAD);
                    $("#"+conceptName+"ConceptNameTI").attr("old-name", newConceptName);
                }
                conceptChangesPending = true;

            });

            $("#"+conceptName+"ConceptNameTI").keypress(function(e) {
                // Allow: backspace, delete, tab, and enter
                if ($.inArray(e.keyCode, [8, 9, 13]) !== -1) {
                    return;
                }

                var code = e.which || e.keyCode;
                var charStr = String.fromCharCode(code);
                if (/[a-zA-Z0-9_.]/.test(charStr)) return;

                e.preventDefault();
            });

            $("#"+conceptName+"ResetConceptButton").click(function() {
                console.log("Reset Concept clicked");
                _.each(conceptData.rows, function(data) {
                     if (isAD) {
                         resetConceptAttributes(data);
                     }
                     else if (data[0] == conceptName) {
                         resetConceptAttributes(data);
                     }
                });
            });

            $("#"+conceptName+"ApplyConceptButton").click(function() {
                console.log("Apply Concept Clicked");
                require(["bootstrap.modal"],function() {
                    var msg = "Click <i>Continue</i> to update the concept "+conceptName+"; otherwise, click <i>Cancel</i>";
                    $('#areYouSureContextModalLabel').html("Are You Sure");
                    $('#areYouSureContextModalMessage').html(msg);
                    $('#areYouSureContextModal').modal('show');
                    $('#areYouSureContextModal').css('z-index', '9999');
                });
                selectedAction = "concept";
                selectedConceptType = $("#"+conceptName+"ShapeSelect").val();
                selectedConceptName = conceptName;
            });

            $("#"+conceptName+"CancelConceptButton").click(function() {
                console.log("Cancel Create Concept Clicked");
            });

            $("#"+conceptName+"CreateConceptButton").click(function() {
                console.log("Create Concept Clicked");
            });

            require(["app/xsv/bootstrap-slider"],function() {
                //require("css!./slider.css");
                $("#"+conceptName+"ConceptMinimumSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptMinimumLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;
                });

                $("#"+conceptName+"ConceptMaximumSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptMaximumLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;
                });

                $("#"+conceptName+"ConceptInflectionSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptInflectionLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;
                });

                $("#"+conceptName+"ConceptInflectionLeftSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptInflectionLeftLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;
                });

                $("#"+conceptName+"ConceptInflectionRightSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptInflectionRightLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;
                });

                $("#"+conceptName+"ConceptCenterSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptCenterLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;
                });

                $("#"+conceptName+"ConceptTrapLeftSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptTrapLeftLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;

                    checkCustom(newConceptName, "TRAP_LEFT");
                });

                $("#"+conceptName+"ConceptTrapRightSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptTrapRightLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;

                    checkCustom(newConceptName, "TRAP_RIGHT");
                });

                $("#"+conceptName+"ConceptCrossoverLeftSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptCrossoverLeftLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;

                    checkCustom(newConceptName, "CROSSOVER_LEFT");
                });

                $("#"+conceptName+"ConceptCrossoverRightSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptCrossoverRightLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;

                    checkCustom(newConceptName, "CROSSOVER_RIGHT");
                });

                $("#"+conceptName+"ConceptCenterSL").slider().on('slideStop', function(ev) {
                    $("#"+conceptName+"ConceptCenterLabel").html(parseFloat(ev.value));
                    var ctype = $("#"+conceptName+"ShapeSelect").val();
                    var results = generateVector(conceptName, ctype); 
                    var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    conceptChangesPending = true;
                });
            });

            // Hide the sliders that don't correspond to this concept type
            if (conceptType == "custom") {
                $("#"+conceptName+"MinGroup").hide();
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").show();
                $("#"+conceptName+"ConceptTrapRightGroup").show();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").show();
                $("#"+conceptName+"ConceptCrossoverRightGroup").show();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"MaxGroup").hide();
            }
            else if ((conceptType == "curvedecrease") || (conceptType == "curveincrease")) {
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").hide();
                $("#"+conceptName+"ConceptCrossoverRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
            }
            else if ((conceptType == "lineardecrease") || (conceptType == "linearincrease")) {
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").hide();
                $("#"+conceptName+"ConceptCrossoverRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionGroup").hide();
            }
            else if (conceptType == "pi") {
                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").hide();
                $("#"+conceptName+"ConceptCrossoverRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionGroup").hide();
            }
            else if (conceptType == "trapezoid") {
                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").hide();
                $("#"+conceptName+"ConceptCrossoverRightGroup").hide();
            }
            else if (conceptType == "strapezoid") {
                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").hide();
                $("#"+conceptName+"ConceptCrossoverRightGroup").hide();
                //$("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                //$("#"+conceptName+"ConceptInflectionRightGroup").hide();
            }
            else if (conceptType == "triangle") {
                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").hide();
                $("#"+conceptName+"ConceptCrossoverRightGroup").hide();
            }

            $("#"+conceptName+"ShapeSelect").change(function() {
                var newConceptType = $("#"+conceptName+"ShapeSelect").val();
                var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                var min = 0;
                var max = 0;
                var inflection = 0;
                var center = 0;
                var results = null;
                if ((newConceptType == "curvedecrease") || (newConceptType == "curveincrease")) {
                    $("#"+conceptName+"ConceptCenterGroup").hide();
                    $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                    $("#"+conceptName+"ConceptTrapRightGroup").hide();
                    $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                    $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                    $("#"+conceptName+"ConceptInflectionGroup").show();

                    // Set a default value for inflection
                    min = parseFloat($("#"+conceptName+"ConceptMinimumSL").val());
                    max = parseFloat($("#"+conceptName+"ConceptMaximumSL").val());
                    inflection = min + (max-min)/2;
                    $("#"+conceptName+"ConceptInflectionLabel").text(inflection.toFixed(4));
                    $("#"+conceptName+"ConceptInflectionSL").slider('setValue',inflection);

                    results = generateVector(conceptName, newConceptType); 
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                    
                }
                else if ((newConceptType == "lineardecrease") || (newConceptType == "linearincrease")) {
                    $("#"+conceptName+"ConceptCenterGroup").hide();
                    $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                    $("#"+conceptName+"ConceptTrapRightGroup").hide();
                    $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                    $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                    $("#"+conceptName+"ConceptInflectionGroup").hide();

                    results = generateVector(conceptName, newConceptType); 
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                }
                else if (newConceptType == "pi") {
                    $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                    $("#"+conceptName+"ConceptTrapRightGroup").hide();
                    $("#"+conceptName+"ConceptInflectionGroup").hide();
                    $("#"+conceptName+"ConceptInflectionLeftGroup").show();
                    $("#"+conceptName+"ConceptInflectionRightGroup").show();
                    $("#"+conceptName+"ConceptCenterGroup").show();

                    // Set a default value for inflectionLeft, Center, and InflectionRight
                    min = parseFloat($("#"+conceptName+"ConceptMinimumSL").val());
                    max = parseFloat($("#"+conceptName+"ConceptMaximumSL").val());
                    center = min + (max-min)/2;
                    var segmentSize = (max - min ) / 4;
                    var inflectionLeft = min + segmentSize;
                    var inflectionRight = max - segmentSize;
                    $("#"+conceptName+"ConceptCenterLabel").text(center.toFixed(4));
                    $("#"+conceptName+"ConceptCenterSL").slider('setValue',center);
                    $("#"+conceptName+"ConceptInflectionLeftLabel").text(inflectionLeft.toFixed(4));
                    $("#"+conceptName+"ConceptInflectionLeftSL").slider('setValue',inflectionLeft);
                    $("#"+conceptName+"ConceptInflectionRightLabel").text(inflectionRight.toFixed(4));
                    $("#"+conceptName+"ConceptInflectionRightSL").slider('setValue',inflectionRight);

                    results = generateVector(conceptName, newConceptType); 
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                }
                else if (newConceptType == "trapezoid") {
                    $("#"+conceptName+"ConceptInflectionGroup").hide();
                    $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                    $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                    $("#"+conceptName+"ConceptCenterGroup").hide();
                    $("#"+conceptName+"ConceptTrapLeftGroup").show();
                    $("#"+conceptName+"ConceptTrapRightGroup").show();

                    // Set a default value for trapLeft and trapRight
                    min = parseFloat($("#"+conceptName+"ConceptMinimumSL").val());
                    max = parseFloat($("#"+conceptName+"ConceptMaximumSL").val());
                    var trapLeft = min + ((max-min)/2 * 0.25);
                    var trapRight = max - ((max-min)/2 * 0.25);
                    $("#"+conceptName+"ConceptTrapLeftLabel").text(trapLeft.toFixed(4));
                    $("#"+conceptName+"ConceptTrapLeftSL").slider('setValue',trapLeft);
                    $("#"+conceptName+"ConceptTrapRightLabel").text(trapRight.toFixed(4));
                    $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',trapRight);

                    results = generateVector(conceptName, newConceptType); 
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                }
                else if (newConceptType == "strapezoid") {
                    $("#"+conceptName+"ConceptInflectionGroup").hide();
                    $("#"+conceptName+"ConceptCenterGroup").hide();
                    $("#"+conceptName+"ConceptInflectionLeftGroup").show();
                    $("#"+conceptName+"ConceptInflectionRightGroup").show();
                    $("#"+conceptName+"ConceptTrapLeftGroup").show();
                    $("#"+conceptName+"ConceptTrapRightGroup").show();

                    // Set a default value for trapLeft and trapRight
                    min = parseFloat($("#"+conceptName+"ConceptMinimumSL").val());
                    max = parseFloat($("#"+conceptName+"ConceptMaximumSL").val());
                    var termSize = max - min;
                    var trapSize = termSize * 0.25;
                    var trapLeft = min + trapSize;
                    var trapRight = max - trapSize;
                    var inflectionLeft = min + trapSize/2;
                    var inflectionRight = max - trapSize/2;

                    $("#"+conceptName+"ConceptTrapLeftLabel").text(trapLeft.toFixed(4));
                    $("#"+conceptName+"ConceptTrapLeftSL").slider('setValue',trapLeft);
                    $("#"+conceptName+"ConceptTrapRightLabel").text(trapRight.toFixed(4));
                    $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',trapRight);
                    $("#"+conceptName+"ConceptInflectionLeftLabel").text(inflectionLeft.toFixed(4));
                    $("#"+conceptName+"ConceptInflectionLeftSL").slider('setValue',inflectionLeft);
                    $("#"+conceptName+"ConceptInflectionRightLabel").text(inflectionRight.toFixed(4));
                    $("#"+conceptName+"ConceptInflectionRightSL").slider('setValue',inflectionRight);

                    results = generateVector(conceptName, newConceptType); 
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                }
                else if (newConceptType == "triangle") {
                    $("#"+conceptName+"ConceptInflectionGroup").hide();
                    $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                    $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                    $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                    $("#"+conceptName+"ConceptTrapRightGroup").hide();
                    $("#"+conceptName+"ConceptCenterGroup").show();

                    // Set a default value for center
                    min = parseFloat($("#"+conceptName+"ConceptMinimumSL").val());
                    max = parseFloat($("#"+conceptName+"ConceptMaximumSL").val());
                    center = min + (max-min)/2;
                    $("#"+conceptName+"ConceptCenterLabel").text(center.toFixed(4));
                    $("#"+conceptName+"ConceptCenterSL").slider('setValue',center);

                    results = generateVector(conceptName, newConceptType); 
                    self.ContextChart.updateContextChartSeries(newConceptName, null, results, isAD);
                }
                else if (newConceptType == "custom") {
                    // TODO - Do we event want to allow this?
                }
                conceptChangesPending = true;
            });
        }

        function isDuplicateConceptName(newConceptName) {
            var result = false;

            var nameCount = 0;
            $(".concept-name").each(function() {
                var val = $(this).val();
                if (val == newConceptName) {
                    nameCount++;
                }
            });

            if (nameCount > 1) {
                return true;
            }
            return false;

            /*
            _.each(conceptData.rows, function(data) {
                if (data[0] == newConceptName) {
                    result = true;
                }
            });
            return result;
            */
        }

        function resetConceptAttributes(data) {

            domainMin = parseFloat(contextData.rows[0][4]);
            $('#domainMinTI').val( domainMin);
            domainMax = parseFloat(contextData.rows[0][5]);
            $('#domainMaxTI').val( domainMax);

            var step = ((domainMax - domainMin ) / 255).toFixed(4);
            var conceptName = data[0];
            var conceptType = data[1];
            //var alphacut = data[2];

            var oldConceptName = $("#"+conceptName+"ConceptNameTI").val();
            $("#"+conceptName+"ConceptNameTI").val(conceptName);
            $("#"+conceptName+"ShapeSelect").val(conceptType);
            $("#"+conceptName+"ConceptNameTI").attr("old-name", conceptName);
            $('#conceptTabs a[href="#' + conceptName + '"]').html(conceptName);

            if ((conceptType == "curvedecrease") || (conceptType == "curvedecrease")) {
                $("#"+conceptName+"ConceptMinimumLabel").text(data[3]);
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',parseFloat(data[3]));
                $("#"+conceptName+"ConceptInflectionLabel").text(data[4]);
                $("#"+conceptName+"ConceptInflectionSL").slider('setValue',parseFloat(data[4]));
                $("#"+conceptName+"ConceptMaximumLabel").text(data[5]);
                $("#"+conceptName+"ConceptMaximumSL").slider('setValue',parseFloat(data[5]));

                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionGroup").show();
            }
            else if ((conceptType == "lineardecrease") || (conceptType == "linearincrease")) {
                $("#"+conceptName+"ConceptMinimumLabel").text(data[3]);
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',parseFloat(data[3]));
                $("#"+conceptName+"ConceptMaximum").text(data[4]);
                $("#"+conceptName+"ConceptMaximumSL").slider('setValue',parseFloat(data[4]));

                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionGroup").hide();
            }
            else if (conceptType == "pi") {
                $("#"+conceptName+"ConceptMinimumLabel").text(data[3]);
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',parseFloat(data[3]));
                $("#"+conceptName+"ConceptInflectionLeftLabel").text(data[4]);
                $("#"+conceptName+"ConceptInflectionLeftSL").slider('setValue',parseFloat(data[4]));
                $("#"+conceptName+"ConceptCenterLabel").text(data[5]);
                $("#"+conceptName+"ConceptCenterSL").slider('setValue',parseFloat(data[5]));
                $("#"+conceptName+"ConceptInflectionRightLabel").text(data[6]);
                $("#"+conceptName+"ConceptInflectionRightSL").slider('setValue',parseFloat(data[6]));
                $("#"+conceptName+"ConceptMaximumLabel").text(data[7]);
                $("#"+conceptName+"ConceptMaximumSL").slider('setValue',parseFloat(data[7]));

                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").show();
                $("#"+conceptName+"ConceptInflectionRightGroup").show();
                $("#"+conceptName+"ConceptCenterGroup").show();
            }
            else if (conceptType == "trapezoid") {
                $("#"+conceptName+"ConceptMinimumLabel").text(data[3]);
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',parseFloat(data[3]));
                $("#"+conceptName+"ConceptTrapLeftLabel").text(data[4]);
                $("#"+conceptName+"ConceptTrapLeftSL").slider('setValue',parseFloat(data[4]));
                $("#"+conceptName+"ConceptTrapRightLabel").text(data[5]);
                $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',parseFloat(data[5]));
                $("#"+conceptName+"ConceptMaximumLabel").text(data[6]);
                $("#"+conceptName+"ConceptMaximumSL").slider('setValue',parseFloat(data[6]));

                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").show();
                $("#"+conceptName+"ConceptTrapRightGroup").show();
            }
            else if (conceptType == "strapezoid") {
                $("#"+conceptName+"ConceptMinimumLabel").text(data[3]);
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',parseFloat(data[3]));
                $("#"+conceptName+"ConceptInflectionLeftLabel").text(data[4]);
                $("#"+conceptName+"ConceptInflectionLeftSL").slider('setValue',parseFloat(data[4]));
                $("#"+conceptName+"ConceptTrapLeftLabel").text(data[5]);
                $("#"+conceptName+"ConceptTrapLeftSL").slider('setValue',parseFloat(data[5]));
                $("#"+conceptName+"ConceptTrapRightLabel").text(data[6]);
                $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',parseFloat(data[6]));
                $("#"+conceptName+"ConceptInflectionRightLabel").text(data[7]);
                $("#"+conceptName+"ConceptInflectionRightSL").slider('setValue',parseFloat(data[7]));
                $("#"+conceptName+"ConceptMaximumLabel").text(data[8]);
                $("#"+conceptName+"ConceptMaximumSL").slider('setValue',parseFloat(data[8]));

                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").show();
                $("#"+conceptName+"ConceptInflectionRightGroup").show();
                $("#"+conceptName+"ConceptTrapLeftGroup").show();
                $("#"+conceptName+"ConceptTrapRightGroup").show();
            }
            else if (conceptType == "triangle") {
                $("#"+conceptName+"ConceptMinimumLabel").text(data[3]);
                $("#"+conceptName+"ConceptMinimumSL").slider('setValue',parseFloat(data[3]));
                $("#"+conceptName+"ConceptCenterLabel").text(data[4]);
                $("#"+conceptName+"ConceptCenterSL").slider('setValue',parseFloat(data[4]));
                $("#"+conceptName+"ConceptMaximumLabel").text(data[5]);
                $("#"+conceptName+"ConceptMaximumSL").slider('setValue',parseFloat(data[5]));

                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").hide();
                $("#"+conceptName+"ConceptTrapRightGroup").hide();
                $("#"+conceptName+"ConceptCenterGroup").show();
            }
            else if (conceptType == "custom") {
                var crossoverLeft = 0;
                var crossoverRight = 0;
                var trapLeft = 0;
                var trapRight = 0;
                var lowerCrossoverDone = false;
                var lowerMaxDone = false;
                var upperMinDone = false;
                var upperCrossoverDone = false;
                for (var x = 0; x < 255; x++) {
                    if (x == 0) {
                        min = domainMin
                    }
                    else if (x == 255) {
                        max = domainMax
                    }
                    else if (lowerCrossoverDone == false) {
                      if (Number(data[x+3]) <= 0.5) {
                        crossoverLeft = Math.round((domainMin + (step * x)) * 1000) / 1000;
                        console.log("crossoverLeft="+crossoverLeft);
                        lowerCrossoverDone = true;
                      }
                    }
                    else if (lowerMaxDone == false) {
                        if (Number(data[x+3]) == 0) {
                            trapLeft = Math.round((domainMin + (step * x)) * 1000) / 1000;
                            console.log("trapLeft="+trapLeft);
                            lowerMaxDone = true;
                        }
                    }
                    else if (upperMinDone == false) {
                        if (Number(data[x+3]) > 0) {
                            trapRight = Math.round((domainMin + (step * x)) * 1000) / 1000;
                            console.log("trapRight="+trapRight);
                            upperMinDone = true;
                        }
                    }
                    else if (upperCrossoverDone == false) {
                        if (Number(data[x+3]) >= 0.5) {
                            crossoverRight = Math.round((domainMin + (step * x)) * 1000) / 1000;
                            console.log("crossoverRight="+crossoverRight);
                            upperCrossoverDone = true;
                        }
                    }
                }

                $("#"+conceptName+"ConceptCrossoverLeftLabel").text(crossoverLeft);
                $("#"+conceptName+"ConceptCrossoverLeftSL").slider('setValue',parseFloat(crossoverLeft));
                $("#"+conceptName+"ConceptTrapLeftLabel").text(trapLeft);
                $("#"+conceptName+"ConceptTrapLeftSL").slider('setValue',parseFloat(trapLeft));
                $("#"+conceptName+"ConceptTrapRightLabel").text(trapRight);
                $("#"+conceptName+"ConceptTrapRightSL").slider('setValue',parseFloat(trapRight));
                $("#"+conceptName+"ConceptCrossoverRightLabel").text(crossoverRight);
                $("#"+conceptName+"ConceptCrossoverRightSL").slider('setValue',parseFloat(crossoverRight));

                $("#"+conceptName+"MinGroup").hide();
                $("#"+conceptName+"ConceptCenterGroup").hide();
                $("#"+conceptName+"ConceptTrapLeftGroup").show();
                $("#"+conceptName+"ConceptTrapRightGroup").show();
                $("#"+conceptName+"ConceptCrossoverLeftGroup").show();
                $("#"+conceptName+"ConceptCrossoverRightGroup").show();
                $("#"+conceptName+"ConceptInflectionLeftGroup").hide();
                $("#"+conceptName+"ConceptInflectionRightGroup").hide();
                $("#"+conceptName+"ConceptInflectionGroup").hide();
                $("#"+conceptName+"MaxGroup").hide();
            }

            var results = generateVector(conceptName, conceptType); 
            self.ContextChart.updateContextChartSeries(oldConceptName, conceptName, results, isAD);
            conceptChangesPending = false;
        }

        function getContextData() {
            var self = this;
            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var searchString = "|xsvDisplayContext FROM " + contextName + " IN " + containerName + byClause + scopeStr + " APP " + appName;
            var $el = $('#contextNameTI');
            self.SearchUtil.run($el, searchString);
        }

        function createChartClickHandler() {

            $("#contextChart svg").click(function(e) {
                var key = e.target.__data__.key;
                // <path.nv-area>
                $("path.nv-area").css("fill-opacity","0.5");
                $(e.target).css("fill-opacity","1");
                $('#conceptTabs a[href="#' + key + '"]').tab('show');
            });
        }

        function updateContext() {

            // Currently we do not allow the user to change context name, container, class, scope, read and write fields.
            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var tmpClass = $("#classNameTI").val();
            var byClause = (tmpClass === "") ? "" : " BY \"" + tmpClass + "\"";
            var setContextFieldsCommand = "|xsvSetContextFields " + $("#contextNameTI").val() +
                                          " IN " + $("#containerNameTI").val() +
                                          byClause +
                                          scopeStr +
                                          " APP " + appName;
            var size = $("#sizeTI").val();
            var type = $("#typeTI").val();
            var width = $("#widthTI").val();

            if (type == "average_centered") {
                var avg = $("#averageTI").val();
                if (avg === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD center VALUE " + avg;

                if (size === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD size VALUE " + size;

                if (size === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD width VALUE " + width;
            }
            else if (type == "median_centered") {
                var median = $("#medianTI").val();
                if (median === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD center VALUE " + median;

                if (size === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD size VALUE " + size;

                if (size === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD width VALUE " + width;
            }
            else if (type == "domain") {
                var min = $("#domainMinTI").val();
                if (min === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD domainMin VALUE \"" + min + "\"";

                var max = $("#domainMaxTI").val();
                if (max === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD domainMax VALUE \"" + max + "\"";

                if (!validDomains(min,max)) {
                    require(["bootstrap.modal"],function() {
                        var msg = "Concepts do not lie within the specified Domain Values.<br><br>";
                            msg += "Please udate concept point ranges before updating domain values.";
                        $('#updateContextModalLabel').html("Error Message");
                        $('#updateContextModalMessage').html(msg);
                        $('#updateContextModal').modal('show');
                        $('#updateContextModal').css('z-index', '9999');
                    });
                    return;
                }

                domainMax =  parseFloat(max);
                domainMin =  parseFloat(min);
            }
            else if (type == "crossover") {
                var min = $("#domainMinTI").val();
                if (min === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD domainMin VALUE \"" + min + "\"";

                var max = $("#domainMaxTI").val();
                if (max === "") {
                    displayRequiredFieldMessage();
                    return;
                }
                setContextFieldsCommand +=  " FIELD domainMax VALUE \"" + max + "\"";

                if (!validDomains(min,max)) {
                    require(["bootstrap.modal"],function() {
                        var msg = "Concepts do not lie within the specified Domain Values.<br><br>";
                            msg += "Please udate concept point ranges before updating domain values.";
                        $('#updateContextModalLabel').html("Error Message");
                        $('#updateContextModalMessage').html(msg);
                        $('#updateContextModal').modal('show');
                        $('#updateContextModal').css('z-index', '9999');
                    });
                    return;
                }

                domainMax =  parseFloat(max);
                domainMin =  parseFloat(min);

            }

            var count = $("#countTI").val();
            if (count === "") {
                displayRequiredFieldMessage();
                return;
            }
            setContextFieldsCommand +=  " FIELD count VALUE " + count;
            setContextFieldsCommand +=  " FIELD notes VALUE \"" + $("#notesTA").val() + "\"";
            //setContextFieldsCommand +=  " FIELD search VALUE \"" + encodeURIComponent($("#searchTA").val()) + "\"";
            setContextFieldsCommand +=  " FIELD search VALUE \"" + $("#searchTA").val() + "\"";
            setContextFieldsCommand +=  " FIELD uom VALUE \"" + $("#uomTI").val() + "\"";


            var encodedMessage = setContextFieldsCommand.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            console.log("setContextFieldsCommand="+encodedMessage);

            var SearchManager = require("splunkjs/mvc/searchmanager");

            updateContextSearchId++;
            var updateContextSearchManager = new SearchManager({
                id: "updateContextSearch-"+updateContextSearchId,
                cache: false,
                search: setContextFieldsCommand
            });

            updateContextSearchManager.on("search:failed", function(properties) {
                console.log("FAILED", properties);
            });

            updateContextSearchManager.on("search:error", function(properties) {
                 console.log("ERROR", properties);
            });

            updateContextSearchManager.on("search:done", function(properties) {
                console.log("DONE!\nSearch job properties:", properties.content);
                var isSuccessMessage = false;
                var msgs = properties.content.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    var errors = "The following error was encountered: <br><br>";
                    for (m=0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        if (msgs[m].text.indexOf("xsvSetContextFields: fields updated successfully") !== -1) {
                            isSuccessMessage = true;
                        }
                        errors += msgs[m].type + " " + msgs[m].text + "<br>";
                    }

                    if (!isSuccessMessage) {
                        displaySearchMessage("Error Message",errors);
                        return;
                    }
                    displaySearchMessage("Success","Context updated successfully");
                    conceptChangesPending = false;
                }

                getContextAttributes();
                //getContextData(); JOE
            });
        }

        function updateContextDomain(min,max) {
            console.log("updateContextDomain("+min+","+max+") ...");
            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var tmpClass = $("#classNameTI").val();
            var byClause = (tmpClass === "") ? "" : " BY \"" + tmpClass + "\"";
            var setContextFieldsCommand = "|xsvSetContextFields " + $("#contextNameTI").val() +
                                          " IN " + $("#containerNameTI").val() +
                                          byClause +
                                          scopeStr +
                                          " APP " + appName +
                                          " FIELD domainMin VALUE \"" + min + "\"" +
                                          " FIELD domainMax VALUE \"" + max + "\"";

            var encodedMessage = setContextFieldsCommand.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            console.log("setContextFieldsCommand="+encodedMessage);

            var SearchManager = require("splunkjs/mvc/searchmanager");

            updateContextSearchId++;
            var updateContextSearchManager = new SearchManager({
                id: "updateContextSearch-"+updateContextSearchId,
                cache: false,
                search: setContextFieldsCommand
            });

            updateContextSearchManager.on("search:failed", function(properties) {
                console.log("FAILED", properties);
            });

            updateContextSearchManager.on("search:error", function(properties) {
                 console.log("ERROR", properties);
            });

            updateContextSearchManager.on("search:done", function(properties) {
                console.log("DONE!\nSearch job properties:", properties.content);
                var msgs = properties.content.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    var errors = "The following error was encountered: <br><br>";
                    for (m=0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        if (msgs[m].text.indexOf("xsvSetContextFields: fields updated successfully") !== -1) {
                            isSuccessMessage = true;
                        }
                        //errors += msgs[m].type + " " + msgs[m].text + "<br>";
                    }
                    if (!isSuccessMessage) {
                        return;
                    }
                }
                $('#domainMinTI').val( domainMin);
                $('#domainMaxTI').val( domainMax );
                updateConcept(selectedConceptName, selectedConceptType);
            });
        }

        function validDomains (min,max) {
            var result = true;
            _.each(conceptData.rows, function(data) {
                // Verify the minimum concept values are larger than min
                var conceptMin = parseFloat(data[3]);
                var conceptType = data[1];
                if (conceptType != "custom") {
                    if (conceptMin < min) {
                        result = false;
                    }

                    var conceptMax = 0;
                    if ( (conceptType == "curvedecrease") || (conceptType == "curveincrease") || (conceptType == "triangle")) {
                        conceptMax = parseFloat(data[5]);
                    }
                    else if ( (conceptType == "lineardecrease") || (conceptType == "linearincrease")) {
                        conceptMax = parseFloat(data[4]);
                    }
                    else if (conceptType == "pi") {
                        conceptMax = parseFloat(data[7]);
                    }
                    else if (conceptType == "trapezoid") {
                        conceptMax = parseFloat(data[6]);
                    }
                    else if (conceptType == "strapezoid") {
                        conceptMax = parseFloat(data[8]);
                    }
                    if (conceptMax > max) {
                        result = false;
                    }
                }
            });
            return result;
        }

        function displayRequiredFieldMessage () {
            require(["bootstrap.modal"],function() {
                var msg = "One or more required fields are missing!<br><br>";
                    msg += "Required fields are indicated with an \"*\"";
                $('#updateContextModalLabel').html("Error Message");
                $('#updateContextModalMessage').html(msg);
                $('#updateContextModal').modal('show');
                $('#updateContextModal').css('z-index', '9999');
            });
        }

        function displaySearchMessage (head, msg) {
            require(["bootstrap.modal"],function() {
                $('#updateContextModalLabel').html(head);
                $('#updateContextModalMessage').html(msg);
                $('#updateContextModal').modal('show');
                $('#updateContextModal').css('z-index', '9999');
            });
        }

        function renameConcept(conceptName, newConceptName) {

            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var tmpClass = $("#classNameTI").val();
            var byClause = (tmpClass === "") ? "" : " BY \"" + tmpClass + "\"";
            var renameConceptCommand = "|xsvRenameConcept " + conceptName + 
                                          " FROM " + $("#contextNameTI").val() +
                                          " IN " + $("#containerNameTI").val() +
                                          byClause + 
                                          scopeStr +
                                          " APP " + appName +
                                          " TO " + newConceptName;

            var encodedMessage = renameConceptCommand.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            console.log("renameConceptCommand="+encodedMessage);

            var SearchManager = require("splunkjs/mvc/searchmanager");

            renameConceptSearchId++;
            var renameConceptSearchManager = new SearchManager({
                id: "renameConceptSearch-"+renameConceptSearchId,
                cache: false,
                search: renameConceptCommand
            });

            renameConceptSearchManager.on("search:failed", function(properties) {
                console.log("FAILED", properties);
            });

            renameConceptSearchManager.on("search:error", function(properties) {
                 console.log("ERROR", properties);
            });

            renameConceptSearchManager.on("search:done", function(properties) {
                console.log("DONE!\nSearch job properties:", properties.content);
                var isSuccessMessage = false;
                var msgs = properties.content.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    var errors = "The following error was encountered: <br><br>";
                    for (m=0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        if (msgs[m].text.indexOf("xsvRenameConcept: Concept renamed successfully") !== -1) {
                            isSuccessMessage = true;
                        }
                        errors += msgs[m].type + " " + msgs[m].text + "<br>";
                    }
                    if (!isSuccessMessage) {
                        displaySearchMessage("Error Message",errors);
                        return;
                    }
                }
            });
        }

        function updateConcept(conceptName, conceptType) {
            console.log("updateConcept("+conceptName+","+conceptType+") entry ...");
            var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
            console.log("new concept name = " + newConceptName);
            var pointsString = generatePointString(conceptName, conceptType);

            // TODO: Refactor - what if concept name changes ... 

            // For custom concept, we want to update other concept too ...
            var conceptName2 = "";
            var pointString2 = "";
            if (conceptType == "custom") {
                _.each(conceptData.rows, function(data) {
                    var name = data[0];
                    if (name != conceptName) {
                        conceptName2 = name;
                    }
                });
                pointsString2 = generatePointString(conceptName2, "strapezoid");

                // regenerate the custom string
                pointsString = "";
                var vector = generateVector(conceptName2,"strapezoid");
                for (var i = 0; i < vector.length; i++) {
                    var tmp = Math.round((1-vector[i]) * 10000) / 10000;
                    pointsString += String(tmp);
                    if (i < vector.length-1)
                        pointsString += ",";
                }
            }

            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var tmpClass = $("#classNameTI").val();
            var byClause = (tmpClass === "") ? "" : " BY \"" + tmpClass + "\"";
            var updateConceptCommand = "|xsvUpdateConcept ";
            
            if (conceptType != "custom") {
                updateConceptCommand += conceptName;
            }
            else {
                updateConceptCommand += "\"" + conceptName + "," + conceptName2 + "\"";
            }
           updateConceptCommand += " FROM " + $("#contextNameTI").val();
           updateConceptCommand += " IN " + $("#containerNameTI").val();
           updateConceptCommand += byClause;
           updateConceptCommand += scopeStr;
           updateConceptCommand += " APP " + appName;

            if (conceptType != "custom") {
                updateConceptCommand +=  " WITH points=\""+pointsString+"\"";
                updateConceptCommand +=  " shape="+$("#" + conceptName+"ShapeSelect").val();
            }
            else {
                updateConceptCommand +=  " WITH points=\""+pointsString+";"+pointsString2+"\"";
                updateConceptCommand +=  " shape=\"custom;strapezoid\"";
            }

            var encodedMessage = updateConceptCommand.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            console.log("updateConceptCommand="+encodedMessage);

            var SearchManager = require("splunkjs/mvc/searchmanager");

            updateConceptSearchId++;
            var updateConceptSearchManager = new SearchManager({
                id: "updateConceptSearch-"+updateConceptSearchId,
                cache: false,
                search: updateConceptCommand
            });

            updateConceptSearchManager.on("search:failed", function(properties) {
                console.log("FAILED", properties);
            });

            updateConceptSearchManager.on("search:error", function(properties) {
                console.log("ERROR", properties);
            });

            updateConceptSearchManager.on("search:done", function(properties) {
                console.log("DONE!\nSearch job properties:", properties.content);
                var isSuccessMessage = false;
                var msgs = properties.content.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    var errors = "The following error was encountered: <br><br>";
                    for (m=0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        if (msgs[m].text.indexOf("xsvUpdateConcept: Concept updated successfully") !== -1) {
                            isSuccessMessage = true;
                        }
                        errors += msgs[m].type + " " + msgs[m].text + "<br>";
                    }
                    if (!isSuccessMessage) {
                        displaySearchMessage("Error Message",errors);
                        return;
                    }
                }


            var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
            if (conceptName != newConceptName) {
                renameConcept(conceptName, newConceptName);
            }
            getContextAttributes();
            displaySearchMessage("Success", "Concept Updated Successfully");
            conceptChangesPending = false;
            });
        }

        function deleteConcept(conceptName) {

            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var tmpClass = $("#classNameTI").val();
            var byClause = (tmpClass === "") ? "" : " BY \"" + tmpClass + "\"";
            var deleteConceptCommand = "|xsvDeleteConcept " + conceptName + 
                                          " FROM " + $("#contextNameTI").val() +
                                          " IN " + $("#containerNameTI").val() +
                                          byClause + 
                                          scopeStr +
                                          " APP " + appName;

            var encodedMessage = deleteConceptCommand.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            console.log("deleteConceptCommand="+encodedMessage);

            var SearchManager = require("splunkjs/mvc/searchmanager");

            deleteConceptSearchId++;
            var deleteConceptSearchManager = new SearchManager({
                id: "deleteConceptSearch-"+deleteConceptSearchId,
                cache: false,
                search: deleteConceptCommand
            });

            deleteConceptSearchManager.on("search:failed", function(properties) {
                console.log("FAILED", properties);
            });

            deleteConceptSearchManager.on("search:error", function(properties) {
                 console.log("ERROR", properties);
            });

            deleteConceptSearchManager.on("search:done", function(properties) {
                console.log("DONE!\nSearch job properties:", properties.content);
                var isSuccessMessage = false;
                var msgs = properties.content.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    var errors = "The following error was encountered: <br><br>";
                    for (m=0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        if (msgs[m].text.indexOf("Concept deleted successfully") !== -1) {
                            isSuccessMessage = true;
                        }
                        errors += msgs[m].type + " " + msgs[m].text + "<br>";
                    }
                    if (!isSuccessMessage) {
                        $('#deleteConceptModal').modal('hide');
                        $('#deleteContextModal').css('z-index', '-9999');
                        displaySearchMessage("Error Message",errors);
                        return;
                    }
                }
                /*
                var newConceptName = $("#"+conceptName+"ConceptNameTI").val();
                var theTab = $('#conceptTabs a[href="#' + conceptName+'"]');
                var thePanel = $("#"+conceptName);
                $("#"+conceptName).remove();
                $('#conceptTabs a[href="#' + conceptName+'"]').parent().remove();
                $('#conceptTabs li a').last().tab('show');

                self.ContextChart.deleteConceptFromContextChartSeries(conceptName, newConceptName, isAD);
		*/
                getContextAttributes();
                //getContextData(); JOE

                $('#deleteConceptModal').modal('hide');
                $('#deleteContextModal').css('z-index', '-9999');
                displaySearchMessage("Success", "Concept Deleted Successfully");
            });
        }

        function addConcept(conceptName, conceptType) {
            var mpoint = domainMax - (domainMax-domainMin)/2;
            var tmpClass = $("#classNameTI").val();
            var byClause = (tmpClass === "") ? "" : " BY \"" + tmpClass + "\"";
            var scopeStr = " SCOPED " + scopeName;
            if (scopeName != "private") scopeStr = " SCOPED " + appName;
            var addConceptCommand = "|xsvCreateConcept " +  conceptName +
                                          " FROM " + $("#contextNameTI").val() +
                                          " IN " + $("#containerNameTI").val() +
                                          byClause + 
                                          scopeStr +
                                          " APP " + appName +
                                          " WITH points=\"" + domainMin + "," + mpoint + "," + domainMax + "\"" +
                                          " shape=triangle";

            var encodedMessage = addConceptCommand.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });
            console.log("addConceptCommand="+encodedMessage);

            var SearchManager = require("splunkjs/mvc/searchmanager");

            addConceptSearchId++;
            var addConceptSearchManager = new SearchManager({
                id: "addConceptSearch-"+addConceptSearchId,
                cache: false,
                search: addConceptCommand
            });

            addConceptSearchManager.on("search:failed", function(properties) {
                console.log("FAILED", properties);
            });

            addConceptSearchManager.on("search:error", function(properties) {
                 console.log("ERROR", properties);
            });

            addConceptSearchManager.on("search:done", function(properties) {
                console.log("DONE!\nSearch job properties:", properties.content);
                var msgs = properties.content.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    var errors = "The following error was encountered: <br><br>";
                    for (m=0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        errors += msgs[m].type + " " + msgs[m].text + "<br>";
                    }
                    displaySearchMessage("Error Message", errors);
                    return;
                }
                conceptFocus = conceptName;
                getContextAttributes();
                //getContextData(); JOE

                $('#addConceptModal').modal('hide');
                $('#addConceptModal').css('z-index', '-9999');
                displaySearchMessage("Success", "Concept Added Successfully");
            });
        }

        function createHandlers() {
            $("#resetContextButton").click(function() {
                console.log("Reset Context clicked");
                resetContextAttributes();
            });

            $("#applyContextButton").click(function() {
                console.log("Apply Context Clicked");
                var contextname = $("#contextNameTI").val();
                require(["bootstrap.modal"],function() {
                    var msg = "Click <i>Continue</i> to update the context "+contextname+"; otherwise, click <i>Cancel</i>";
                    $('#areYouSureContextModalLabel').html("Are You Sure");
                    $('#areYouSureContextModalMessage').html(msg);
                    $('#areYouSureContextModal').modal('show');
                    $('#areYouSureContextModal').css('z-index', '9999');
                });

                selectedAction = "context";
            });

            $("#deleteConceptDialogButton").click(function() {
                var deleteConceptName = $('#deleteConceptModal').data("state").conceptName;
                console.log("Delete Concept " + deleteConceptName + " Dialog Button Pressed");
                deleteConcept(deleteConceptName);
            });

            $("#addConceptDialogButton").click(function() {
                $("#newConceptErrorMessage").text("");
                var newConceptName = $('#newConceptNameTI').val();
                if (newConceptName === "") {
                    return;
                }
                var newConceptType = $('#newConceptShapeSelect').val();
                if (isDuplicateConceptName(newConceptName)) {
                    console.log("Concept Name already exists ...");
                    $("#newConceptErrorMessage").text("Concept Name Already exists! Try again ...");
                    return;
                }
                addConcept(newConceptName, newConceptType);
            });

            $("#addConceptButton").click(function() {
                console.log("Add Concept Button Pressed");
                $('#addConceptModal').modal('show');
                $('#addConceptModal').css('z-index', '9999');
            });

            $(".actionMin").click("mousedown", function(){
                $(this).parents(".html").find(".moduleContent,.actionMin").hide();
                $(this).parents(".html").find(".actionMax").show();
            });

            $(".actionMax").click("mousedown", function(){
                $(this).parents(".html").find(".moduleContent,.actionMin").show();
                $(this).parents(".html").find(".actionMax").hide();
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

            $(".name-only").keypress(function(e) {
                // Allow: backspace, delete, tab, and enter
                if ($.inArray(e.keyCode, [8, 9, 13]) !== -1) {
                    return;
                }

                var code = e.which || e.keyCode;
                var charStr = String.fromCharCode(code);
                if (/[a-zA-Z0-9_.]/.test(charStr)) return;

                e.preventDefault();
            });

            $("#appNameTI").on('loaded', function(event) {
                contextData = event.searchResults;
                if (contextData != null) {
                    if ((contextData.rows[0][2] == "crossover")&&(contextData.rows[0][15] == "2")) {
                        console.log("This is an AD Context!");
                        isAD = true;
                    }
                    resetContextAttributes();
                    getConceptAttributes();

                    $('#appNameTI').val(appName);
                    $('#containerNameTI').val(containerName);
                    $('#classNameTI').val(className);
                    $('#scopeNameTI').val(scopeName);

                    getContextData();
                }
                else {
                    $('#loadingContextModal').modal('hide');
                    $('#loadingContextModal').css('z-index', '-9999');
                    //displaySearchMessage("Error Message",errors);
                    require(["bootstrap.modal"],function() {
                        $('#updateContextModalLabel').html("Error Message");
                        $('#updateContextModalMessage').html("Failure retrieving context attributes ...");
                        $('#updateContextModal').modal('show');
                        $('#updateContextModal').css('z-index', '9999');
                    });
                    return;
                }
            });

            $("#containerNameTI").on('loaded', function(event) {
                conceptData = event.searchResults;

                // Remove any prior tab and panel html
                $('#conceptTabs').html("");
                $('#conceptPanes').html("");

                var active = "class=\"active\"";

                // Sort the concepts and then display them
                conceptData.rows.sort(sortConcepts);
                _.each(conceptData.rows, function(data) {
                    createConceptTab(data, active);
                    active = "";
                });

                require(["bootstrap.tab"],function() {

                    $('#conceptTabs a').click(function (e) {
                        e.preventDefault();
                        if (conceptChangesPending) {
                            var msg = "You have changes for this concept!<br><br>";
                                msg += "Please click Apply or Reset before navigating to another concept.";
                            $('#updateContextModalLabel').html("WARNING");
                            $('#updateContextModalMessage').html(msg);
                            $('#updateContextModal').modal('show');
                            $('#updateContextModal').css('z-index', '9999');
                        }
                        else {
                            $(this).tab('show');
                        }
                    });
                });

                if (conceptFocus) {
                    $('#conceptTabs a[href="#' + conceptFocus + '"]').tab('show');
                    conceptFocus = null;
                }

                $('#loadingContextModal').modal('hide');
                $('#loadingContextModal').css('z-index', '-9999');
            });

            $("#contextNameTI").on('loaded', function(event) {
                contextDataResults = event.searchResults;
                $("#contextTable").html("");
                var TableView = require("splunkjs/mvc/tableview");
                contextDataTableId++;
                var managerId = "xsv-" + (self.SearchUtil.searchId);
                console.log("managerid="+managerId);
                tableView = new TableView({
                    id: "contextDataTable-"+contextDataTableId,
                    managerid: managerId,
                    el: $("#contextTable")
                }).render();

                //var isAD = false;
                //if ((contextData.rows[0][2] == "crossover")&&(contextData.rows[0][15] == "2")) {
                //    isAD = true;
                //}

                var $el = $("#contextChart");
                self.ContextChart.renderContextChart2(contextName, domainMin, domainMax, $el, contextDataResults, isAD);
                //self.ContextChart.renderContextChart2(contextName, domainMin, domainMax, $el, contextDataResults);
                createChartClickHandler();
            });

            $("#areYouSureCancel").on('click', function(event) {
                console.log("Cancel Clicked");
                $('#areYouSureContextModal').modal('hide');
                $('#areYouSureContextModal').css('z-index', '-9999');
            });

            $("#areYouSureConfirm").on('click', function(event) {
                console.log("Confirm Clicked");
                if (selectedAction == "context") {
                    updateContext();
                }
                else if (selectedAction == "concept") {
                    // If its a crossover context, have to update the domain values so custom concept gets generated correctly
                    if (contextData.rows[0][2] == "crossover") {
                        updateContextDomain(domainMin, domainMax);
                        // updateConcept will be invoked after domain is updated.
                    }
                    else {
                        updateConcept(selectedConceptName, selectedConceptType);
                    }
                }

                $('#areYouSureContextModal').modal('hide');
                $('#areYouSureContextModal').css('z-index', '-9999');
            });
        }

        function createCopyrightDiv() {
            $('#dashboard').append("<div><p>&#0169; Copyright 2015 Scianta Analytics LLC.  All Rights Reserved - Custom App Development for Splunk by Concanon LLC</p></div>");
        }

        // Main Processing
        createHandlers();
        getContextAttributes();
        //getContextData(); JOE

        createCopyrightDiv();
    });
});
