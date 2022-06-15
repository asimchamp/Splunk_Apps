/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: contextChart

*/
var ContextChart = {
    min: 0,
    max: 0,
    chartDiv: null,
    contextChartDiv: null,
    contextName: null,
    contextChartData: [],
    contextChartTicks: [],

    renderContextChart: function(contextName, domainMin, domainMax, $el, contextData, isAD) {
        var self = this;
        console.log("renderContextChart() entry ...");

        isAD = typeof isAD !== 'undefined' ? isAD : false;
        self.createContextChartData(contextData);
        self.createContextChartTicks(domainMin,domainMax, 256);
        self.contextChartDiv = $el;
        self.contextName = contextName;
        self.renderChart(contextName, $el, isAD);
    },

    renderContextChart2: function(contextName, domainMin, domainMax, $el, contextData, isAD) {
        var self = this;
        console.log("renderContextChart() entry ...");
        isAD = typeof isAD !== 'undefined' ? isAD : false;
        self.createContextChartData2(contextData);
        self.createContextChartTicks(domainMin,domainMax, 256);
        self.contextChartDiv = $el;
        self.contextName = contextName;
        self.renderChart(contextName, $el, isAD);
    },

    renderContextChartThumbnail: function(contextName, domainMin, domainMax, $el, contextData, isAD) {
        var self = this;
        console.log("renderContextChart() entry ...");
        isAD = typeof isAD !== 'undefined' ? isAD : false;
        self.createContextChartData2(contextData);
        self.createContextChartTicks(domainMin,domainMax, 256);
        self.contextChartDiv = $el;
        self.contextName = contextName;
        self.renderChartThumbnail(contextName, $el, isAD);
    },

    renderContextCompareChart: function(contextName, domainMinList, domainMaxList, $el, contextCompareData, conceptList) {
        var self = this;
        console.log("renderContextCompareChart() entry ...");
        isAD = typeof isAD !== 'undefined' ? isAD : false;
        self.createContextCompareChartData(domainMinList, domainMaxList, contextCompareData, conceptList);
        self.createContextChartTicks(self.getDomainMin(domainMinList),self.getDomainMax(domainMaxList), 256);
        self.contextChartDiv = $el;
        self.contextName = contextName;
        self.renderChart(contextName, $el, isAD);
    },

    renderContextOverlayChart: function(contextName, $el, overlayData, contextData) {
        console.log("renderContextOverlayChart() entry ...");
        var self = this;

        // Use the min/max of overlayData to bound the chart and create ticks.
        var contextRows = contextData.rows;
        var overlayRows = [];
        if (overlayData != null) {
            overlayRows = overlayData.rows;
        }
        var lengthContext = contextRows.length;
        var lengthOverlay = overlayRows.length;
        var minContext = Number(contextRows[0][0]);
        var maxContext = Number(contextRows[contextRows.length-1][0]);
        var minOverlay = minContext;
        var maxOverlay = maxContext;
        if (overlayRows.length > 0) {
            minOverlay = Number(overlayRows[0][0]);
            maxOverlay = Number(overlayRows[overlayRows.length-1][0]);
        }
        var theMin = (minOverlay < minContext) ? minOverlay : minContext;
        var theMax = (maxOverlay > maxContext) ? maxOverlay : maxContext;

        //var results = self.createContextOverlayChartData(contextData, overlayData, minOverlay, maxOverlay);
        var results = self.createContextOverlayChartData(contextData, overlayData, theMin, theMax);
        self.renderChart2(contextName, $el, results);
    },

    renderChart: function(contextName, $el, isAD) {
        console.log("renderChart() entry ...");
        var self = this;

        require(['app/xsv/d3.v3','app/xsv/nv.d3'],function() {
            var height = 450;
            if ($el.selector == "#explorerChart") height = 300;
            else if ($el.selector == "#conceptChart") height = 250;

            if (!$el.data("state")) {
                var chart = nv.models.lineChart().margin({top: 30, right: 50, bottom: 50, left: 100}).useInteractiveGuideline(true).transitionDuration(350).height(height).showLegend(true).showYAxis(true).showXAxis(true);

                chart.xAxis.axisLabel(contextName).highlightZero(false).showMaxMin(false).rotateLabels(-45).tickFormat(function(d) {
                        if (d != null)
                            return d ? d3.format('.02f')(d) : '';
                    });

                chart.yAxis.axisLabel('Membership');

                if(!$($el.selector + " svg").length > 0){
                    var _svg = d3.select($el.selector).append('svg');    
                }

                chart.lines.forceY([0,1]); 

                // Set a palette of colors
                //chart.color(['#2ca02c', '#d62728']) 
                //chart.color(['blue', 'green', 'yellow'])
                //chart.color(['#A6CEE3', '#1F78B4', '#B2DF8A', '#33A02C', '#FB9A99', '#E31A1C', '#FDBF6F', '#FF7F00', '#CAB2D6', '#6A3D9A'])
                //d3.scale.category20();
                d3.scale.category10(); // This is the default

                var selection = d3.select($el.selector + " svg");

                $el.data("state", {
                    chart: chart,
                    selection: selection
                });
            }
            var state = $el.data("state");

            if (isAD) {
                state.chart.color(['#d62728','#2ca02c']);
            }
            else {
                //state.chart.color(['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']);
                state.chart.color(['#1f77b4','#aec7e8', '#ff7f0e','#ffbb78','#2ca02c','#98df8a','#d62728','#ff9896','#9467bd','#c5b0d5','#8c564b','#c49c94','#e377c2','#f7b6d2','#7f7f7f','#c7c7c7','#bcbd22','#dbdb8d','#17becf','#9edae5']);
            }

            nv.addGraph(function() {
                state.selection.datum(self.contextChartData).transition(500).call(state.chart);
                return state.chart;
            });
            state.chart.xAxis.axisLabel(contextName);
            nv.utils.windowResize(function() { state.chart.update() });
        });
     },

     renderChart2: function(contextName, $el, data) {

        console.log("renderChart2() entry ...");

        require(['app/xsv/d3.v3','app/xsv/nv.d3'],function() {

            if (!$el.data("state")) {
                console.log("new linePlusBarChart()");
                var chart = nv.models.linePlusBarChart().margin({top: 30, right: 50, bottom: 50, left: 100}).x(function(d,i) { 
                         if (d != null) return d.x;
                         
                    }).color(d3.scale.category10().range());

                chart.xAxis.highlightZero(false).showMaxMin(false).tickFormat(function(d) {
                        return d ? d3.format('.02f')(d) : '';
                    }).axisLabel(contextName);

                chart.y1Axis.tickFormat(d3.format(',f')).axisLabel("Events");
                chart.y2Axis.tickFormat(d3.format('.02f')).axisLabel("Membership");

                if(!$('#contextOverlayChart svg').length > 0){
                    var _svg = d3.select('#contextOverlayChart').append('svg');    
                }


                var selection = d3.select('#contextOverlayChart svg');

                $el.data("state", {
                    chart: chart,
                    selection: selection
                });
            }
            else
            {
                console.log("use existing linePlusBarChart()");
            }

            var state = $el.data("state");

            nv.addGraph(function() {

                console.log("updating linePlusBarChart()");
                state.selection.datum(data).transition().duration(500).call(state.chart); 
                nv.utils.windowResize(state.chart.update);

                return state.chart;
            });
        });
    },

    renderChartThumbnail: function(contextName, $el, isAD) {
        console.log("renderChart() entry ...");
        var self = this;

        require(['app/xsv/d3.v3','app/xsv/nv.d3'],function() {
            var height = 100;

            if (!$el.data("state")) {
                var chart = nv.models.lineChart().margin({top: 0, right: 0, bottom: 0, left: 0}).useInteractiveGuideline(false).transitionDuration(350).height(height).showLegend(false).showYAxis(false).showXAxis(false);

                chart.xAxis.axisLabel(contextName).highlightZero(false).showMaxMin(false).rotateLabels(-45).tickFormat(function(d) {
                        return d ? d3.format('.02f')(d) : '';
                    });

                //chart.yAxis.axisLabel('Membership');

                if(!$($el.selector + " svg").length > 0){
                    var _svg = d3.select($el.selector).append('svg');
                }

                chart.lines.forceY([0,1]);


                var selection = d3.select($el.selector + " svg");

                $el.data("state", {
                    chart: chart,
                    selection: selection
                });
            }
            var state = $el.data("state");

            if (isAD) {
                state.chart.color(['#d62728','#2ca02c']);
            }
            else {
                //state.chart.color(['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']);
                state.chart.color(['#1f77b4','#aec7e8', '#ff7f0e','#ffbb78','#2ca02c','#98df8a','#d62728','#ff9896','#9467bd','#c5b0d5','#8c564b','#c49c94','#e377c2','#f7b6d2','#7f7f7f','#c7c7c7','#bcbd22','#dbdb8d','#17becf','#9edae5']);
            }

            nv.addGraph(function() {
                state.selection.datum(self.contextChartData).transition(500).call(state.chart);
                return state.chart;
            });
            state.chart.xAxis.axisLabel(contextName);
            nv.utils.windowResize(function() { state.chart.update() });
        });
     },


    createContextOverlayChartData: function(contextData, overlayData, theMin, theMax) {
        var self = this;
        var results = [];
        self.createOverlayDataByBounds(results, overlayData, theMin, theMax);
        self.createContextDataByBounds(results, contextData, theMin, theMax);
        return results;
    },

    createOverlayDataByBounds: function(results, overlayData, theMin, theMax) {

        var values = [];
        if (overlayData == null) {
            var step = (theMax - theMin) / 255;
            var val = theMin;
            for (var i = 0; i < 255; i++) {
                values.push({
                    x: val,
                    y: 0
                });
                val += step;
            }
            results.push ({
                key: "events",
                bar: true,
                values: values
            });
            return results;
        }
        var myData = overlayData.rows;
        var _ = require("underscore");

        var step = (theMax - theMin) / 255;
        var val = theMin;
        for (var i = 0; i < 255; i++) {
            var found = false;
            for (var j = 0; j < myData.length; j++) {
                var x = Number(myData[j][0]);
                var y = Number(myData[j][1]);

                if ((x >= val) && (x < (val + step))) {
                    values.push({
                        x: x,
                        y: y
                    });
                    found = true;
                }
            }
            if (found == false) {
                values.push({
                    x: val,
                    y: 0
                });
            }
            val += step;
        }

        /*
        var checkMin = true;        
        var x_val = 0;
        var y_val = 0;

        _.each(myData, function(myDatum, i) {

            x_val = Number(myDatum[0]);
            y_val = Number(myDatum[1]);
            
            if ((x_val > theMin) && (checkMin == true)) {
                values.push({
                    x: theMin,
                    //y: y_val 
                    y: 0
                });
                checkMin = false;
            }

            if ((x_val >= theMin) && (x_val <= theMax)) {
                values.push({
                    x: x_val, 
                    y: y_val
                });
            }
        });

        if (x_val < theMax) {
            values.push({
                x: theMax,
                //y: y_val 
                y: 0
            });
        }
        */

        results.push ({
            key: "events",
            bar: true,
            values: values
        });
    },

    createContextDataByBounds: function(results, chartData, theMin, theMax) {

        var myData = chartData.rows;
        var fields = chartData.fields;
        var labels = new Array(fields.length-1);
        for (var i = 1; i < fields.length; i++) {
            labels[i-1] = fields[i];
        }
        var values = [];
        var testFirst = true;

        var _ = require("underscore");

        _.each(myData, function(myDatum, i) {
            var x_val = 0;
            _.each(myDatum, function(dataPoint, r){
                if(r === 0) {
                    x_val = dataPoint;
                    return;
                }

                if ((Number(x_val) >= theMin) && (Number(x_val) <= theMax)) {

                    if(r-1 == values.length){
                        values[r-1] = [];
                        // Ensure the series has same X-Axis start
                        if (Number(x_val) > theMin) {
                            values[r-1].push({
                                //series: r-i,
                                x: theMin, 
                                y: parseFloat(dataPoint)
                            });
                        }
                    }

                    values[r-1].push({
                        //series: r-i,
                        x: parseFloat(x_val),
                        y: parseFloat(dataPoint)
                    });
                }
            });
        });

        _.each(values, function(line, i){
            // Ensure the series has same X-Axis end
            var len = line.length;
            var x_val = line[len-1].x;
            var y_val = line[len-1].y;
            if (x_val < theMax) {
                line.push({
                    x: theMax, 
                    y: y_val
                });
            }
            results.push({
                values: line,
                key: labels[i],
                area: true
            });
        });
    },

    createContextChartData: function(chartData) {
        var self = this;
        var myData = chartData.data().rows;
        var fields = chartData.data().fields;
        var labels = new Array(fields.length-1);
        for (var i = 1; i < fields.length; i++) {
            labels[i-1] = fields[i];
        }
        var results = [];
        var values = [];
        self.contextChartData = [];

        var _ = require("underscore");

        _.each(myData, function(myDatum, i) {
            var x_val = 0;
            _.each(myDatum, function(data_point, r){
                if(r === 0){
                    x_val = Number(data_point).toFixed(4);
                    return;
                }
                var y_val = Number(data_point).toFixed(4);

                if(r-1 == values.length){
                    values[r-1] = [];
                }

                values[r-1].push({
                    //series: r-i,
                    x: Number(x_val), 
                    y: Number(y_val)
                });
            });
        });

        _.each(values, function(line, i){
            self.contextChartData.push({
                values: line,
                key: labels[i],
                area: true
            });
        });
    },

    createContextChartData2: function(chartData) {
        var self = this;
        var myData = chartData.rows;
        var fields = chartData.fields;
        var labels = new Array(fields.length-1);
        for (var i = 1; i < fields.length; i++) {
            labels[i-1] = fields[i];
        }
        var results = [];
        var values = [];
        self.contextChartData = [];

        var _ = require("underscore");

        _.each(myData, function(myDatum, i) {
            var x_val = 0;
            _.each(myDatum, function(data_point, r){
                if(r === 0){
                    x_val = Number(data_point).toFixed(4);
                    return;
                }
                var y_val = Number(data_point).toFixed(4);

                if(r-1 == values.length){
                    values[r-1] = [];
                }

                values[r-1].push({
                    //series: r-i,
                    x: Number(x_val),
                    y: Number(y_val)
                });
            });
        });

        _.each(values, function(line, i){
            self.contextChartData.push({
                values: line,
                key: labels[i],
                area: true
            });
        });
    },

    getDomainMin: function(domainMinList) {
        var i = 0;
        var result = 99999999999999999999;
        for (i=0; i < domainMinList.length; i++) {
            if (domainMinList[i].val < result) {
                result = domainMinList[i].val;
            }
        }
        return result;
    },

    getDomainMax: function(domainMaxList) {
        var i = 0;
        var result = -99999999999999999999;
        for (i=0; i < domainMaxList.length; i++) {
            if (domainMaxList[i].val > result) {
                result = domainMaxList[i].val;
            }
        }
        return result;
    },

    getDomainByKey: function(domainList, key) {
        var i = 0;
        var result = 0;
        for (i=0; i < domainList.length; i++) {
            console.log(i + " comparing " + domainList[i].key + " with " + key);
            if (domainList[i].key == key) {
                result = domainList[i].val;
            }
        }
        return result;
    },

    normalizeX: function(a, b, A, B, x) {
       var result = (A + (x - A) * (b -a) / (B - A));
       return result;
    },

    createContextCompareChartData: function(domainMinList, domainMaxList, chartData, conceptList) {
        var self = this;
        var myData = chartData.rows;
        var fields = chartData.fields;
        var labels = new Array(fields.length-1);
        for (var i = 1; i < fields.length; i++) {
            labels[i-1] = fields[i];
        }
        var results = [];
        var values = [];
        self.contextChartData = [];
        var domainMin = self.getDomainMin(domainMinList);
        var domainMax = self.getDomainMax(domainMaxList);

        var min = 0;
        var max = 0;
        var interval = 0;

        var _ = require("underscore");

        _.each(myData, function(myDatum, i) {
            _.each(myDatum, function(data_point, r){
                if(r === 0){
                    return;
                }
                /*
                var startIndex = labels[r-1].indexOf("from") + 5;
                var key = labels[r-1].substring(startIndex).trim();
                min = self.getDomainByKey(domainMinList, key);
                max = self.getDomainByKey(domainMaxList, key);
                */
                min = domainMinList[r-1].val;
                max = domainMaxList[r-1].val;
                interval = (max - min) / 256;
                var x = min + (interval * i);

                if(r-1 == values.length){
                    values[r-1] = [];
                }

                values[r-1].push({
                    series: r-i,
                    x: x,
                    y: parseFloat(data_point)
                });
            });
        });

        var conceptListIndex = 0;
        _.each(values, function(line, i){
            self.contextChartData.push({
                values: line,
                key: labels[i],
                area: true,
                appName: conceptList[conceptListIndex].appName,
                scopeName: conceptList[conceptListIndex].scopeName,
                containerName: conceptList[conceptListIndex].containerName,
                contextName: conceptList[conceptListIndex].contextName,
                className: conceptList[conceptListIndex].className,
                hedgeName: conceptList[conceptListIndex].hedgeName,
                conceptName: conceptList[conceptListIndex].conceptName
            });
            conceptListIndex++;
        });
    },

    createChartTicks: function(chartData) {
        var self = this;
        var myData = chartData.data().rows;
        var index = 0;
        var minSet = false;
        self.contextChartTicks = [];

        var _ = require("underscore");
    
        _.each(myData, function(myDatum, i) {
            var x_val = 0;
            _.each(myDatum, function(data_point, r){
                if(r === 0){
                    x_val = data_point;
                    if (!minSet) {
                        self.min = Number(x_val);
                        minSet = true;
                    }
                    return;
                }
                if ((i+1) % 8 === 0 || i === 0) {
                    self.contextChartTicks[index] = x_val;
                    self.max = Number(x_val);
                    index++;
                }

            });
        });
    },

    createContextChartTicks: function(domainMin, domainMax, columns) {
        var self = this;
        var i = 0;
        var interval = (Number(domainMax) - Number(domainMin)) / columns;
        var runningValue = Number(domainMin);
        self.contextChartTicks = [];

        for (i = 0; i < columns; i++) {
            if (i === 0) {
                self.contextChartTicks[i] = Number(domainMin);
            }
            else if (i == (columns-1)) {
                self.contextChartTicks[i] = Number(domainMax);
            }
            else {
                if ((i+1) % 8 === 0) {
                    var x_val = Number(runningValue).toFixed(4);
                    self.contextChartTicks[i] = Number(x_val);
                }
            }
            runningValue += Number(interval);
        }
    },

    updateContextChartSeries: function(key, newKey, seriesData, isAD) {
        var self = this;
        isAD = typeof isAD !== 'undefined' ? isAD : false;
        var i = 0;
        for (i = 0; i < self.contextChartData.length; i++) {
            if (key == self.contextChartData[i].key) {
                if (newKey !== null) {
                    self.contextChartData[i].key = newKey;
                }
                var line = self.contextChartData[i].values;
                for (j = 0; j < line.length; j++) {
                    var y_val = Number(seriesData[j]).toFixed(4);
                    line[j].y = Number(y_val);
                }
            }
        }
        self.renderChart(self.contextName, self.contextChartDiv, isAD);
    },

    deleteConceptFromContextChartSeries: function(key, newKey) {
        var self = this;
        var i = 0;
        var theKey = key;
        if (newKey !== null) {
            theKey = newKey;
        }

        for (i = 0; i < self.contextChartData.length; i++) {
            if (theKey == self.contextChartData[i].key) {
                self.contextChartData.splice(i,1);
            }
        }
        self.renderChart(self.contextName, self.contextChartDiv);
    }
};
