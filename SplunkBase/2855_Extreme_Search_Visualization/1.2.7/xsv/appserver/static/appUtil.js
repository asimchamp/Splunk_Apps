/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: appUtil

*/
var AppUtil = {

    exploreSearchId: 0,
    appData: [],

    getApps: function(el) {

        var self = this;
        var $el = el;

        var exploreCommand = "| xsvExploreContexts";
        console.log("exploreCommand="+exploreCommand);

        var SearchManager = require("splunkjs/mvc/searchmanager");

        self.exploreSearchId++;
        var exploreSearchManager = new SearchManager({
            id: "AppSearch-"+self.exploreSearchId,
            cache: false,
            search: exploreCommand
        });

        exploreSearchManager.on("search:failed", function(properties) {
            console.log("FAILED", properties);
        });

        exploreSearchManager.on("search:error", function(properties) {
             console.log("ERROR", properties);
        });

        exploreSearchManager.on("search:done", function(properties) {
            console.log("DONE!\nSearch job properties:", properties.content);
        });

        var exploreSearchResults = exploreSearchManager.data("results", {count:0});

        exploreSearchResults.on("data", function() {
            var _ = require("underscore");
            _.each (exploreSearchResults.data().rows, function(row) {
               self.appData.push(row);
            });
            $el.trigger( { type:"loaded", appData:self.appData} );
        });
    }
};
