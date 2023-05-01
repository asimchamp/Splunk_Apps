/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: conceptUtil

*/
var ConceptUtil = {

    conceptSearchId: 0,

    getConceptAttributes: function($el, appName, scopeName, containerName, contextName, className) {
        var self = this;
        var scope = scopeName;
        if (scope != "private") scope = appName;
        var conceptSearchString = "| xsvDisplayConceptAttributes " + contextName;
        conceptSearchString += " IN " + containerName;
        conceptSearchString += (className === "") ? "" : " BY \"" + className + "\"";
        conceptSearchString += " SCOPED " + scope;
        conceptSearchString += " APP " + appName;

        var SearchManager = require("splunkjs/mvc/searchmanager");
        self.conceptSearchId++;
        var conceptSearchManager = new SearchManager({
            id: "conceptDataSearch-"+self.conceptSearchId,
            search: conceptSearchString
        });
        console.log("conceptSearchString=" + conceptSearchString);

        conceptSearchManager.on("search:failed", function(properties) {
            console.log("conceptSearchManager FAILED", properties);
        });

        conceptSearchManager.on("search:error", function(properties) {
             console.log("conceptSearchManager ERROR", properties);
        });

        conceptSearchManager.on("search:done", function(properties) {
            console.log("conceptSearchManager DONE!\nSearch job properties:", properties.content);
            if (properties.content.resultCount === 0) {
                console.log("conceptSearchManager: No events returned!");
            }
        });

        var conceptSearchResults = conceptSearchManager.data("results", {count:0});

        conceptSearchResults.on("data", function() {
            console.log("Get concept data ...");
            $el.trigger( { type:"loaded", conceptDataResults: conceptSearchResults.data() } );
        });
    },

    getConceptData: function($el, scopeName, containerName, contextName, className) {
        var self = this;
        var scope = scopeName;
        if (scope != "private") scope = appName;
        var conceptCommand = " | xsvListConcepts FROM " + contextName + " IN " + containerName + " BY \"" + className + "\" SCOPED " + scope + " | sort concept";
        console.log("conceptCommand=" + conceptCommand);

        var SearchManager = require("splunkjs/mvc/searchmanager");
        self.conceptSearchId++;
        var conceptSearchManager = new SearchManager({
            id: "conceptDataSearch-"+self.conceptSearchId,
            search: conceptCommand
        });

        conceptSearchManager.on("search:failed", function(properties) {
            console.log("conceptSearchManager: FAILED", properties);
            $el.trigger( { type:"loaded", conceptDataResults: null } );
        });

        conceptSearchManager.on("search:error", function(properties) {
            console.log("conceptSearchManager: ERROR", properties);
            $el.trigger( { type:"loaded", conceptDataResults: null } );
        });

        conceptSearchManager.on("search:done", function(properties) {
            console.log("conceptSearchManager DONE!\nSearch job properties:", properties.content);
            if (properties.content.resultCount === 0) {
                console.log("conceptSearchManager: No events returned!");
                $el.trigger( { type:"loaded", conceptDataResults: null } );
            }
        });

        var conceptSearchResults = conceptSearchManager.data("results", {count:0});

        conceptSearchResults.on("data", function() {
            console.log("conceptSearchManager:Get concept data ...");
            $el.trigger( { type:"loaded", conceptDataResults: conceptSearchResults.data() } );
        });
    },

    getConceptDetail: function(conceptName, conceptDataResults) {
        console.log("getConceptDetail for " + conceptName);
        for (var i = 0; i < conceptDataResults.rows.length; i++) {
            if (conceptName == conceptDataResults.rows[i][0]) {
                var conceptType = conceptDataResults.rows[i][1];
                var alphaCut = conceptDataResults.rows[i][2];
                var html = "<div class=\"concept-detail\">" +
                           //"  <label class=\"category-description\">Selected concept details ...</label>" +
                           "  <div class=\"control-group\">" +
                           "    <label>Name: </label>" +
                           "    <label id=\"conceptNameModal\">"+conceptName+"</label>" +
                           "  </div>" +
                           "  <div class=\"control-group\">" +
                           "    <label>Type:</label>" +
                           "    <label>"+conceptType+"</label>" +
                           "  </div>";
                if ((conceptType == "curvedecrease")||(conceptType == "curveincrease")) {
                    html += "  <div class=\"control-group\">" +
                            "    <label>Min:</label>" +
                            "    <label>"+conceptDataResults.rows[i][3]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Inflection:</label>" +
                            "    <label>"+conceptDataResults.rows[i][4]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Max:</label>" +
                            "    <label>"+conceptDataResults.rows[i][5]+"</label>" +
                            "  </div>" +
                            "</div>";
                }
                else if ((conceptType == "linearincrease")|| (conceptType == "lineardecrease")) {
                    html += "  <div class=\"control-group\">" +
                            "    <label>Min:</label>" +
                            "    <label>"+conceptDataResults.rows[i][3]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Max:</label>" +
                            "    <label>"+conceptDataResults.rows[i][5]+"</label>" +
                            "  </div>" +
                            "</div>";
                }
                else if (conceptType == "pi") {
                    html += "  <div class=\"control-group\">" +
                            "    <label>Min:</label>" +
                            "    <label>"+conceptDataResults.rows[i][3]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Left Inflection:</label>" +
                            "    <label>"+conceptDataResults.rows[i][4]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Center:</label>" +
                            "    <label>"+conceptDataResults.rows[i][5]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Right Inflection:</label>" +
                            "    <label>"+conceptDataResults.rows[i][6]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Max:</label>" +
                            "    <label>"+conceptDataResults.rows[i][7]+"</label>" +
                            "  </div>" +
                            "</div>";
                }
                else if (conceptType == "trapezoid") {
                    html += "  <div class=\"control-group\">" +
                            "    <label>Min:</label>" +
                            "    <label>"+conceptDataResults.rows[i][3]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Left Trap:</label>" +
                            "    <label>"+conceptDataResults.rows[i][4]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Right Trap::</label>" +
                            "    <label>"+conceptDataResults.rows[i][5]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Max:</label>" +
                            "    <label>"+conceptDataResults.rows[i][6]+"</label>" +
                            "  </div>" +
                            "</div>";
                }
                else if (conceptType == "triangle") {
                    html += "  <div class=\"control-group\">" +
                            "    <label>Min:</label>" +
                            "    <label>"+conceptDataResults.rows[i][3]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Center:</label>" +
                            "    <label>"+conceptDataResults.rows[i][4]+"</label>" +
                            "  </div>" +
                            "  <div class=\"control-group\">" +
                            "    <label>Max:</label>" +
                            "    <label>"+conceptDataResults.rows[i][5]+"</label>" +
                            "  </div>" +
                            "</div>";
                }
                break;
            }
        }
        return html;
    },

    getConceptDetailSummary: function(appName, scopeName, containerName, contextName, className, hedgeName, conceptName) {
        console.log("getConceptDetailSummary for " + conceptName);
        var html = "<div class=\"concept-detail\">" +
                   "  <div class=\"control-group\">" +
                   "    <label>App: </label>" +
                   "    <label id=\"appNameModal\">"+appName+"</label>" +
                   "  </div>" +
                   "  <div class=\"control-group\">" +
                   "    <label>Scope: </label>" +
                   "    <label id=\"scopeNameModal\">"+scopeName+"</label>" +
                   "  </div>" +
                   "  <div class=\"control-group\">" +
                   "    <label>Container: </label>" +
                   "    <label id=\"containerNameModal\">"+containerName+"</label>" +
                   "  </div>" +
                   "  <div class=\"control-group\">" +
                   "    <label>Context: </label>" +
                   "    <label id=\"contextNameModal\">"+contextName+"</label>" +
                   "  </div>" +
                   "  <div class=\"control-group\">" +
                   "    <label>Class: </label>" +
                   "    <label id=\"classNameModal\">"+className+"</label>" +
                   "  </div>" +
                   "  <div class=\"control-group\">" +
                   "    <label>Hedge: </label>" +
                   "    <label id=\"hedgeNameModal\">"+hedgeName+"</label>" +
                   "  </div>" +
                   "  <div class=\"control-group\">" +
                   "    <label>Concept: </label>" +
                   "    <label id=\"conceptNameModal\">"+conceptName+"</label>" +
                   "  </div>";
        return html;
    }
};
