/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: xsv_home

*/
require.config({
    paths: {
        "app": "../app"
    },
    "shim": {
        "app/xsv/owl.carousel": ["jquery"]
    },
    urlArgs: "bust=" + (new Date()).getTime()
    //urlArgs: "bust=1_0_1"
});

require([
    "underscore",
    "jquery",
    "splunkjs/mvc/utils",
    "splunkjs/mvc",
    "app/xsv/owl.carousel",
    "splunkjs/mvc/simplexml/ready!"
    //"splunkjs/ready!"
], function(_, $, dropdown, utils, mvc, Owl, ready) {
    require(['splunkjs/ready!'], function() {

        console.log("Loading xsv_home ...");

        function createHandlers() {

            console.log("Creating handlers ...");

            $('#context-explorer').on('click', function(event){
                console.log("Context Explorer click");
                window.location.href = "xsv_explore_context";
            });

            $('#display-context').on('click', function(event){
                console.log("Display Context click");
                window.location.href = "xsv_display_context";
            });

            $('#compare-concepts').on('click', function(event){
                console.log("Compare Concepts click");
                window.location.href = "xsv_compare_concepts";
            });

            $('#data-overlay').on('click', function(event){
                console.log("Data Overlay click");
                window.location.href = "xsv_overlay_context";
            });

            $('#create-context').on('click', function(event){
                console.log("Create Context click");
                window.location.href = "xsv_create_wizard";
            });

            $('#create-wizard').on('click', function(event){
                console.log("Create Context Wizard click");
                window.location.href = "xsv_create_context";
            });

            $('#update-context').on('click', function(event){
                console.log("Redefine Context click");
                //window.location.href = "xsv_update_context";
                window.location.href = "xsv_find_context";
            });

            $('#learn').on('click', function(event){
                console.log("Learn click");
                window.open("http://www.scianta.com/learn");
            });
        }

        createHandlers();
    });
});
