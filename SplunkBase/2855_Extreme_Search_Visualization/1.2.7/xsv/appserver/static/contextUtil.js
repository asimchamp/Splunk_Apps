/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: contextUtil

*/
var ContextUtil = {

    contextSearchId: 0,

    getContextDataForChart: function($el, appName, scopeName, containerName, contextName, className) {
        var self = this;

        console.log("getContextData() entry ...");

        var scope = scopeName;
        if (scope != "private") scope = appName;

        var contextSearchString = "| xsvDisplayContext FROM " + contextName;
        contextSearchString += " IN " + containerName;
        contextSearchString += (className === "") ? "" : " BY \"" + className + "\"";
        contextSearchString += " SCOPED " + scope;
        contextSearchString += " APP " + appName;

        var SearchManager = require("splunkjs/mvc/searchmanager");
        self.contextSearchId++;
        var contextSearchManager = new SearchManager({
            id: "contextSearchManager-"+self.contextSearchId,
            search: contextSearchString
        });
        console.log("contextSearchString=" + contextSearchString);

        contextSearchManager.on("search:failed", function(properties) {
            console.log("contextSearchManager: FAILED", properties);
            $el.trigger( { type:"loaded", contextName: contextName, "contextDataResultsForChart":null, "domainMin":0, "domainMax":0} );
        });

        contextSearchManager.on("search:error", function(properties) {
            console.log("contextSearchManager: ERROR", properties);
            $el.trigger( { type:"loaded", contextName: contextName, "contextDataResultsForChart":null, "domainMin":0, "domainMax":0} );
        });

        contextSearchManager.on("search:done", function(properties) {
            console.log("contextSearchManager: DONE!\nSearch job properties:", properties.content);
            if (properties.content.resultCount === 0) {
                console.log("contextSearchManager: No events returned!");
                $el.trigger( { type:"loaded", contextName: contextName, "contextDataResultsForChart":null, "domainMin":0, "domainMax":0} );
            }
        });

        var contextDataResults = contextSearchManager.data("results", {count:0}); //get all the results
        console.log("Waiting for contextDataForChart ...");
        contextDataResults.on("data", function() {
            console.log("Got contextData ...");
            var contextRows = contextDataResults.data().rows;
            var domainMin = Number(contextRows[0][0]);
            var domainMax = Number(contextRows[contextRows.length-1][0]);

            $el.trigger( { type:"loaded", contextName: contextName, "contextDataResultsForChart":contextDataResults, "domainMin":domainMin, "domainMax":domainMax} );

        });
    },

    getContextAttributes: function($el, appName, scopeName, containerName, contextName, className) {
        var self = this;

        var scope = scopeName;
        if (scope != "private") scope = appName;

        var contextSearchString = "| xsvDisplayContextAttributes " + contextName;
        contextSearchString += " IN " + containerName;
        contextSearchString += (className === "") ? "" : " BY \"" + className + "\"";
        contextSearchString += " SCOPED " + scope;
        contextSearchString += " APP " + appName;

        var SearchManager = require("splunkjs/mvc/searchmanager");
        self.contextSearchId++;
        var contextSearchManager = new SearchManager({
            id: "contextSearch-"+self.contextSearchId,
            search: contextSearchString
        });

        contextSearchManager.on("search:failed", function(properties) {
            console.log("contextSearchManager: FAILED", properties);
            $el.trigger( { type:"loaded", contextName: contextName, "contextDataResults":null, "domainMin":0, "domainMax":0} );
        });

        contextSearchManager.on("search:error", function(properties) {
            console.log("contextSearchManager: ERROR", properties);
            $el.trigger( { type:"loaded", contextName: contextName, "contextDataResults":null, "domainMin":0, "domainMax":0} );
        });

        contextSearchManager.on("search:done", function(properties) {
            console.log("contextSearchManager: DONE!\nSearch job properties:", properties.content);
            if (properties.content.resultCount === 0) {
                console.log("contextSearchManager: No events returned!");
                $el.trigger( { type:"loaded", "contextDataResults":null } );
            }
        });

        var contextDataResults = contextSearchManager.data("results", {count:0});
        console.log("Waiting for contextData ...");
        contextDataResults.on("data", function() {
            $el.trigger( { type:"loaded", "contextDataResults":contextDataResults.data() } );
        });
    },

    getContextData: function($el, scopeName, containerName) {
        var self = this;

        var scope = scopeName;
        if (scope != "private") scope = appName;
       
        var contextsCommand = "| xsvListContexts scoped " + scope + " in " + containerName + " | stats count by Container,Context | fields Context";
        console.log("contextsCommand="+contextsCommand);

        var SearchManager = require("splunkjs/mvc/searchmanager");

        self.contextSearchId++;
        var contextsSearchManager = new SearchManager({
            id: "contextsSearch-"+self.contextSearchId,
            cache: false,
            search: contextsCommand
        });

        contextsSearchManager.on("search:failed", function(properties) {
            console.log("contextsSearchManager: FAILED", properties);
        });

        contextsSearchManager.on("search:error", function(properties) {
             console.log("contextsSearchManager: ERROR", properties);
        });

        contextsSearchManager.on("search:done", function(properties) {
            console.log("contextsSearchManager: DONE!\nSearch job properties:", properties.content);
            if (properties.content.resultCount == 0) {
                console.log("contextsSearchManager: No events returned!");
                $el.trigger( { type:"loaded", "contextDataResults":null } );
            }
        });

        var contextDataResults = contextsSearchManager.data("results", {count:0});
        console.log("Waiting for contextData ...");
        contextDataResults.on("data", function() {
            $el.trigger( { type:"loaded", "contextDataResults":contextDataResults.data() } );
        });
    }
};
