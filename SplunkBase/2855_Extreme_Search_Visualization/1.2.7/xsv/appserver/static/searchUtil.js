/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: searchUtil

*/
var SearchUtil = {

    searchId: 0,

    run: function($el, searchString, earliest, latest) {
        var self = this;
        if (earliest == null) earliest = "";        
        if (latest == null) latest = "";        
        console.log("searchManager: earliest=" + earliest + " latest=" + latest);

          
        var SearchManager = require("splunkjs/mvc/searchmanager");
        self.searchId++;
        var searchManager = new SearchManager({
            id: "xsv-"+self.searchId,
            search: searchString,
            earliest_time: earliest,
            latest_time: latest,
            preview: false
        });
        console.log("searchString=" + searchString);

        searchManager.on("search:failed", function(properties) {
            console.log("searchManager: FAILED", properties);
            //$el.trigger( { type:"loaded", "searchResults": null } );
        });

        searchManager.on("search:error", function(properties) {
            console.log("searchManager: ERROR", properties);

            if ((arguments != null) && (arguments.length > 0)) {
                console.log("search:error: arguments[0]=" + arguments[0]);
            }

            if ((arguments != null) && (arguments.length > 1)) {
                var errors = [];
                var msgs = arguments[1].data.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    for (m = 0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        errors.push("" + msgs[m].type + " " + msgs[m].text);
                    }
                }
                $el.trigger( { type:"loaded", "searchResults": null, "errorMessages":errors } );
            }

            //$el.trigger( { type:"loaded", "searchResults": null } );
        });

        searchManager.on("search:progress", function(properties) {
            if (typeof properties.content.eventCount !== "undefined") {
                var message = "Events loaded: " + properties.content.eventCount;
                console.log("searchManager: " + message);
                $el.trigger( { type:"progress", "statusMessage": message } );
            }
        });


        searchManager.on("search:done", function(properties) {
            console.log("searchManager DONE!\nSearch job properties:", properties.content);
            if (properties.content.resultCount === 0) {
                console.log("searchManager: No events returned!");
                var errors = [];
                var msgs = properties.content.messages;
                if (msgs.length > 0) {
                    var m = 0;
                    console.log ("The following error was encountered:");
                    for (m=0; m < msgs.length; m++) {
                        console.log("" + msgs[m].type + " " + msgs[m].text);
                        errors.push("" + msgs[m].type + " " + msgs[m].text);
                    }
                    //$el.trigger( { type:"loaded", "searchResults": null, "errorMessages":errors } );
                }
                else if (properties.content.eventCount == 0) {
                    errors.push("The search produced no events");
                }
                $el.trigger( { type:"loaded", "searchResults": null, "errorMessages":errors } );
            }
        });

        var searchResults = searchManager.data("results", {count:0});

        searchResults.on("data", function() {
            console.log("Got search data ...");
            $el.trigger( { type:"loaded", "searchResults": searchResults.data() } );
        });
    }
};
