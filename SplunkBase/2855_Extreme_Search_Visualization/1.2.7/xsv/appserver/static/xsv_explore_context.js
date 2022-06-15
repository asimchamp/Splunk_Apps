/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: xs_explore_context

*/
require.config({
    "paths": {
        "app": "../app"
    },
    "shim": {
	"app/xsv/nv.d3": ["app/xsv/d3.v3"],
	"app/xsv/owl.carousel": ["jquery"]
    },
    urlArgs: "bust=" + (new Date()).getTime()
    //"urlArgs": "bust=1_0_1"
});

require([
    "underscore",
    "jquery",
    "splunkjs/mvc/utils",
    "splunkjs/mvc",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/searchmanager",
    "app/xsv/owl.carousel",
    "app/xsv/contextChart",
    "app/xsv/searchUtil",
    "app/xsv/appUtil",
    "app/xsv/contextUtil",
    "app/xsv/conceptUtil",
    "app/xsv/urlUtil",
    "app/xsv/d3.v3",
    "app/xsv/nv.d3",
    "util/moment",
    "splunkjs/ready!"
], function(_, $, utils, mvc, SearchbarView, SearchControlsView, TableView, SearchManager, Owl, ContextChart, SearchUtil, AppUtil, ContextUtil, ConceptUtil, URLUtil, d3, nv, moment) {
    require(['splunkjs/ready!','splunkjs/mvc/simplexml/ready!','app/xsv/owl.carousel','jquery'], function() {

        console.log("xsv_explore_context loading ...");
        var loading = false;
        var update_in_progress = false;
        var appData = [];
        var apps = [];
        var containers = [];
        var contexts = [];
        var classes = [];
        var selectedApp = null;
        var selectedContainer = null;
        var selectedContext = null;
        var selectedClass = null;

        var appOwl = null;
        var containerOwl = null;
        var contextOwl = null;
        var classOwl = null;
        var filterString = "";
        var newFilter = false;
        var classCount = 0;

        var $el = null;
        var contextDataResultsForChart  = null;
        var conceptDataResults  = null;

        function getApps() {
            var self = this;
            self.loading = true;
            apps = [];
            var $el = $('.explorer-category.apps');
            var searchString = "| xsvExploreContexts | dedup App Label Container Context Class Scope";
            searchString += " | stats count by App,Label,Scope | sort App - Scope";
            console.log("searchString="+searchString);
            self.SearchUtil.run($el, searchString);
        }

        function getContainers() {
            console.log("getContainers() entry ...");
            var self = this;
            self.loading = true;
            containers = [];
            var $el = $('.explorer-category.containers');
            var searchString = "| xsvExploreContexts | dedup App Label Container Context Class Scope";
            searchString += " | where App=\""+selectedApp.app+"\"";
            searchString += " and Scope=\""+selectedApp.scope+"\"";
            searchString += " | stats count by Container";
            console.log("searchString="+searchString);
            self.SearchUtil.run($el, searchString);
        }

        function getContexts() {
            console.log("getContexts() entry ...");
            var self = this;
            self.loading = true;
            contexts = [];
            var $el = $('.explorer-category.contexts');
            var searchString = "| xsvExploreContexts | dedup App Label Container Context Class Scope";
            searchString += " | where App=\""+selectedApp.app+"\"";
            searchString += " and Container=\""+selectedContainer.name+"\"";
            searchString += " and Scope=\""+selectedApp.scope+"\"";
            searchString += " | stats count by Context";
            console.log("searchString="+searchString);
            self.SearchUtil.run($el, searchString);
        }

        function getClasses() {
            console.log("getClasses() entry ...");
            var self = this;
            self.loading = true;
            classes = [];
            var $el = $('.explorer-category.classes');
            var searchString = "| xsvExploreContexts | dedup App Label Container Context Class Scope";
            searchString += " | where App=\"" + selectedApp.app + "\"";
            searchString += " and Container=\"" + selectedContainer.name + "\"";
            searchString += " and Context=\"" + selectedContext.name + "\"";
            searchString += " and Scope=\"" + selectedApp.scope + "\"";
            searchString += " | table Class ";
            if ((filterString != undefined) && (filterString != "")) {
                searchString += ' | where like(Class,"%'+filterString+'%")';
            }
            console.log("searchString="+searchString);
            self.SearchUtil.run($el, searchString);
        }

        function getConceptAttributess() {
            console.log("getConceptAttributess() entry ...");
            var self = this;
            var scope = selectedApp.scope;
            if (scope != "private") scope = selectedApp.app;
            var $el = $('.explorer-category.concepts');
            var searchString = "| xsvDisplayConceptAttributes " + selectedContext.name
            searchString += " IN " + selectedContainer.name;
            //searchString += (selectedClass.name === "") ? "" : " BY \"" + selectedClass.name + "\"";
            searchString += ((selectedClass == null)||(selectedClass.name === "")) ? "" : " BY \"" + selectedClass.name + "\"";
            searchString += " SCOPED " + scope;
            searchString += " APP " + selectedApp.app;
            console.log("searchString="+searchString);
            self.SearchUtil.run($el, searchString);
        }

        function getContextAttributess() {
            console.log("getContextAttributess() entry ...");
            var self = this;
            var scope = selectedApp.scope;
            if (scope != "private") scope = selectedApp.app;
            var $el = $('#contextdetail');
            var searchString = "| xsvDisplayContextAttributes " + selectedContext.name;
            searchString += " IN " + selectedContainer.name;
            //searchString += (selectedClass.name === "") ? "" : " BY \"" + selectedClass.name + "\"";
            searchString += ((selectedClass == null)||(selectedClass.name === "")) ? "" : " BY \"" + selectedClass.name + "\"";
            searchString += " SCOPED " + scope;
            searchString += " APP " + selectedApp.app;
            console.log("searchString="+searchString);
            self.SearchUtil.run($el, searchString);
        }

        function setContextChart() {

            var self = this;
            var scope = selectedApp.scope;
            if (scope != "private") scope = selectedApp.app;
            var $el = $("#explorerChart");
            var searchString = "| xsvDisplayContext FROM " + selectedContext.name;
            searchString += " IN " + selectedContainer.name;
            //searchString += (selectedClass.name === "") ? "" : " BY \"" + selectedClass.name + "\"";
            searchString += ((selectedClass == null)||(selectedClass.name === "")) ? "" : " BY \"" + selectedClass.name + "\"";
            searchString += " SCOPED " + scope;
            searchString += " APP " + selectedApp.app;
            console.log("searchString="+searchString);
            self.SearchUtil.run($el, searchString);
        }


        function setAppData() {

            var content = "";

            for(var i=0; i < apps.length; i++) {
                var img = "/static/app/xsv/images/defaultAppIcon.png";
                var imgStyle = "style=\"background-color: #c0c0c0;\"";
                if (apps[i].app.indexOf("SA-") != -1)
                    img = "/static/app/xsv/images/icon_enterprise_security.png";

                var name  = apps[i].name;
                var app   = apps[i].app;
                var scope = apps[i].scope;
                var count = "(" + apps[i].count + " contexts)";


                content +=  "<div style=\"display:inline-block;width:150px;\"><a class=\"item explorer-item app link\" edata=\"" + app + "\" sdata=\"" + scope + "\">" +
                            "<img src=\"" + img + "\" height=\"36\" width=\"36\" " + imgStyle + "></img>" +
                            "<span class=\"explorer-row-label\" style=\"display:block;\">" + name + "</span>" +
                            "<span class=\"explorer-row-label\" style=\"display:block;\">" + count + "</span>" +
                            "<span class=\"explorer-row-label\" style=\"display:block;\">" + scope + "</span>" +
                           "</a></div>";
            }

            $(".owl-carousel.apps").html(content);


            $('.app.link').off();
            $('.app.link').on('click', function(event){
                event.preventDefault();

                if (self.update_in_progress) {
                    return;
                }
                self.update_in_progress = true;

                var app = $(this).attr("edata");
                var scope = $(this).attr("sdata");
                for (var i = 0; i < apps.length; i++) {
                    if ((app == apps[i].app) && (scope == apps[i].scope)) {
                        selectedApp = apps[i];
                        selectedContainer = null;
                        selectedContext = null;
                        selectedClass = null;
                        filterString = "";
                        setAppDetail();
                        break;
                    }
                }

                $('.app.link').parent().removeClass('clicked');
                $(this).parent().addClass('clicked');

                require(["app/xsv/owl.carousel"], function() {
                    console.log("destroying carousels");
                    $(".owl-carousel.containers").html("");
                    $(".owl-carousel.containers").owlCarousel("destroy");
                    $('.owl-carousel.containers').hide();
                    $('.loading-containers').show();
                    $(".explorer-category-description.containers").html("");

                    $(".owl-carousel.contexts").html("");
                    $(".owl-carousel.contexts").owlCarousel("destroy");
                    $('.owl-carousel.contexts').hide();
                    $('.loading-contexts').show();
                    $(".explorer-category-description.contexts").html("");

                    $(".owl-carousel.classes").html("");
                    $(".owl-carousel.classes").owlCarousel("destroy");
                    $('.owl-carousel.classes').hide();
                    $('.no-classes').hide();
                    $('.loading-classes').show();
                    $(".explorer-category-description.classes").html("");

                    $('.loading-concepts').show();
                    $("#explorerChart").hide();
                    $(".explorer-category-description.concepts").html("");


                    updateHistory();
                    getContainers();
                });

            });

            // Attempt to Asyncronously retrieve images
            for(var i=0; i < apps.length; i++) {
                var name  = apps[i].name;
                var app   = apps[i].app;
                var img = "/static/app/" + app + "/appIcon.png";
                var imgStyle = "";
                // We already set images for SA-
                if (app.indexOf("SA-") == -1) {
                    $.ajax({
                        url: img,
                        async:false,
                        error: function()
                        {
                            console.log("file does not exist: " + img);
                        },
                        success: function()
                        {
                            console.log("file exists:" + img);
                            imgStyle = "";
                            $(".item.explorer-item.app.link[edata='"+app+"'] img").attr("src", img);
                            $(".item.explorer-item.app.link[edata='"+app+"'] img").css("background-color", "none");
                        }
                    });
                }
            };
        }

        function setContainerData(app) {
            console.log("setContainerData() entry ...");

            var content = "";
            if (containers != null) {

                for(var i=0; i < containers.length; i++) {
                    var name = containers[i].name;
                    var count  = "(" + containers[i].count + " contexts)";
 
                    content += "<div style=\"display:inline-block;width:150px;\"><a class=\"item explorer-item container link\" edata=\"" + name + "\">" +
                                "<img src=\"/static/app/xsv/images/fileIcon.png\" height=\"36\" width=\"36\"></img>" +
                                "<span class=\"explorer-row-label\" style=\"display:block;\">" + name + "</span>" +
                                "<span class=\"explorer-row-label\" style=\"display:block;\">" + count + "</span>" +
                               "</a></div>";
                }
            }


            $(".owl-carousel.containers").html(content);


            $('.container.link').off();
            $('.container.link').on('click', function(event){
                event.preventDefault();

                if (self.update_in_progress) {
                    return;
                }
                self.update_in_progress = true;

                var container = $(this).attr("edata");

                $('.container.link').parent().removeClass('clicked');
                $(this).parent().addClass('clicked');

                for (var i = 0; i < containers.length; i++) {
                    if (container == containers[i].name) {

                        selectedContainer = containers[i];
                        setContainerDetail();
                        selectedContext = null;
                        selectedClass = null;
                        filterString = "";

                        require(["app/xsv/owl.carousel"], function() {
                            console.log("destroying carousels");
                            $(".owl-carousel.contexts").html("");
                            $(".owl-carousel.contexts").owlCarousel("destroy");
                            $('.owl-carousel.contexts').hide();
                            $('.loading-contexts').show();
                            $(".explorer-category-description.contexts").html("");

                            $(".owl-carousel.classes").html("");
                            $(".owl-carousel.classes").owlCarousel("destroy");
                            $('.owl-carousel.classes').hide();
                            $('.no-classes').hide();
                            $('.loading-classes').show();
                            $(".explorer-category-description.classes").html("");

                            $('.loading-concepts').show();
                            $("#explorerChart").hide();
                            $(".explorer-category-description.concepts").html("");

                            updateHistory();
                            getContexts();

                        });
                        break;
                    }
                }

            });
        }

        function setContextData() {


            var content = "";
            if (contexts != null) {
                for(var i=0; i < contexts.length; i++) {
                    var name = contexts[i].name;
                    var count  = "(" + contexts[i].count + " contexts)";
    
                    content += "<div style=\"display:inline-block;width:150px;\"><a class=\"item explorer-item context link\" edata=\"" + name + "\">" +
                                "<img src=\"/static/app/xsv/images/contextIcon.png\" height=\"36\" width=\"36\"></img>" +
                                "<span class=\"explorer-row-label\" style=\"display:block;\">" + name + "</span>" +
                                "<span class=\"explorer-row-label\" style=\"display:block;\">" + count + "</span>" +
                               "</a></div>";
                }
    
                $(".owl-carousel.contexts").html(content);

                $('.context.link').off();
                $('.context.link').on('click', function(event){
                    event.preventDefault();

                    if (self.update_in_progress) {
                        return;
                    }
                    self.update_in_progress = true;

                    var context = $(this).attr("edata");
    
                    $('.context.link').parent().removeClass('clicked');
                    $(this).parent().addClass('clicked');

                    for (var i = 0; i < contexts.length; i++) {
                        if (context == contexts[i].name) {
            
                            selectedContext = contexts[i];
                            setContextDetail();
                            selectedClass = null;
                            $("#classActionSelect").val("");
                            filterString = "";

                            require(["app/xsv/owl.carousel"], function() {
                                console.log("destroying carousels");
                                $(".owl-carousel.classes").html("");
                                $(".owl-carousel.classes").owlCarousel("destroy");
                                $('.owl-carousel.classes').hide();
                                $('.no-classes').hide();
                                $('.loading-classes').show();
                                $(".explorer-category-description.classes").html("");

                                $('.loading-concepts').show();
                                $("#explorerChart").hide();
                                $(".explorer-category-description.concepts").html("");

                                updateHistory();
                                getClasses();
                            });
                            break;
                        }
                    }

                });

            }
        }

        function setClassData() {
            var self = this;

            var content = "";
            if (classes != null) {
                for(var i=0; i < classes.length; i++) {
                    var name = classes[i].name;
                    if (name == "")
                        name = "Default Context";

                    var titleString = "";
                    if (name.length > 20) titleString = 'title="'+name+'"';

                    content += "<div style=\"display:inline-block;width:150px;\"><a class=\"item explorer-item class link\" edata=\"" + name + "\">" +
                                "<img src=\"/static/app/xsv/images/classIcon.png\" height=\"36\" width=\"36\"></img>" +
                                "<span class=\"explorer-row-label\" style=\"display:block;\" " + titleString + ">" + name + "</span>" +
                               "</a></div>";
                }

                $(".owl-carousel.classes").html(content);

                $('.class.link').off();
                $('.class.link').on('click', function(event){
                    event.preventDefault();

                    if (self.update_in_progress) {
                        return;
                    }
                    self.update_in_progress = true;

                    var theClass = $(this).attr("edata");
                    if (theClass == "Default Context")
                        theClass = "";

                    $('.class.link').parent().removeClass('clicked');
                    $(this).parent().addClass('clicked');

                    for (var i = 0; i < classes.length; i++) {
                        if (theClass == classes[i].name) {
                            selectedClass = classes[i];
                            setClassDetail();
                            if (filterString != "") {
                                newFilter = false;
                            }
                        }
                    }

                    require(["app/xsv/owl.carousel"], function() {

                        $('.loading-concepts').show();
                        $("#explorerChart").hide();
                        $(".explorer-category-description.concepts").html("");

                        updateHistory();
                        getConceptAttributess();
                        getContextAttributess();
                        setContextChart();
                    });
                });
            }
        }

        function updateAppCarousel() {
            var self = this;
            console.log("updateAppCarousel() entry ...");

            require(["app/xsv/owl.carousel"], function() {

                appOwl = $('.owl-carousel.apps');
                if ((appOwl == null) || (typeof appOwl.owlCarousel != 'function')){
                    console.log ("WARNING: Carousel Not Loaded");
                    var reloadCount = self.URLUtil.getURLParam("reloadCount");
                    if (reloadCount == null) {
                        console.log ("WARNING: Carousel Not Loaded, Refreshing Page!!!");
                        window.location.href = "xsv_explore_context?reloadCount=1";
                    }
                }
                appOwl.owlCarousel({
                    loop:false,
                    margin:20,
                    slideBy:4,
                    nav:false,
                    rewind:false,
                    dots:false,
                    items:4
                })

                var urlApp = self.URLUtil.getURLParam("app");
                var urlScope = self.URLUtil.getURLParam("scope");
                if (self.loading && (urlApp != undefined) && (urlApp != "")){
                    $('.item.explorer-item.app').each(function() {
                        var app = $(this).attr("edata");
                        var scope = $(this).attr("sdata");
                        if (urlScope != null) {
                            if ((urlApp == app) && (urlScope == scope)) {
                                $(this).parent().addClass('clicked');
                            }
                        }
                        else {
                            if (urlApp == app) {
                                $(this).parent().addClass('clicked');
                            }
                        }
                    });
                } 
                else {
                    $('.app.link').first().parent().addClass('clicked');
                } 
            });
        }

        function updateContainerCarousel() {
            var self = this;
            console.log("updateContainerCarousel() entry ...");

            require(["app/xsv/owl.carousel"], function() {

                containerOwl = $('.owl-carousel.containers');
                containerOwl.owlCarousel({
                    loop:false,
                    margin:20,
                    slideBy:4,
                    nav:false,
                    rewind:false,
                    dots:false,
                    items:4
                })

                var container = self.URLUtil.getURLParam("container");
                if (self.loading && (container != undefined) && (container != "")) {
                    var found = false;
                    $('.item.explorer-item.container').each(function() {
                        var tmp = $(this).attr("edata");
                        if (container == tmp) {
                            $(this).parent().addClass('clicked');
                            found = true;
                        }
                    });
                    if (found == false) {
                        $('.container.link').first().parent().addClass('clicked');
                    }
                } 
                else {
                    $('.container.link').first().parent().addClass('clicked');
                } 
            });
        }

        function updateContextCarousel() {
            var self = this;
            console.log("updateContextCarousel() entry ...");

            require(["app/xsv/owl.carousel"], function() {
                contextOwl = $('.owl-carousel.contexts');
                contextOwl.owlCarousel({
                    loop:false,
                    margin:20,
                    slideBy:4,
                    nav:false,
                    rewind:false,
                    dots:false,
                    items:4
                })

                var context = self.URLUtil.getURLParam("context");
                if (self.loading && (context != undefined) && (context != "")) {
                    var found = false;
                    $('.item.explorer-item.context').each(function() {
                        var tmp = $(this).attr("edata");
                        if (context == tmp) {
                            $(this).parent().addClass('clicked');
                            found = true;
                        }
                    });
                    if (found == false) {
                        $('.container.link').first().parent().addClass('clicked');
                    }
                } 
                else {
                    $('.context.link').first().parent().addClass('clicked');
                } 
            })
        }

        function updateClassCarousel() {
            var self = this;
            console.log("updateClassCarousel() entry ...");

            require(["app/xsv/owl.carousel"], function() {
                classOwl = $('.owl-carousel.classes');
                classOwl.owlCarousel({
                    loop:false,
                    margin:20,
                    slideBy:4,
                    nav:false,
                    rewind:false,
                    dots:false,
                    items:4
                })


                var theClass = self.URLUtil.getURLParam("class");
                if (self.loading && (theClass != undefined) && (theClass != "") && (newFilter == false)) {
                    var found = false;
                    $('.item.explorer-item.class').each(function() {
                        var tmp = $(this).attr("edata");
                        if (tmp == "Default Context") tmp = "";
                        if (theClass == tmp) {
                            $(this).parent().addClass('clicked');
                            found = true;
                        }
                    });
                    if (found == false) {
                        $('.class.link').first().parent().addClass('clicked');
                    }
                    self.loading = false;
                } 
                else {
                    $('.class.link').first().parent().addClass('clicked');
                } 
            })
        }


        function setAppDetail() {
            var appName = selectedApp.name;
            var html = "<div class=\"control-group\">" +
                       "  <label>Name: </label>" +
                       "  <label>"+appName+"</label>" +
                       "</div>";

            $(".explorer-category-description.apps").html(html);
        }
        function setContainerDetail() {
            var containerName = selectedContainer.name;
            var html = "<div class=\"container-detail\">" +
                       "  <div class=\"control-group\">" +
                       "    <label>Name: </label>" +
                       "    <label>"+containerName+"</label>" +
                       "  </div>" +
                       "</div>";

            $(".explorer-category-description.containers").html(html);
        }

        // Other attributes: center,count, numberConcepts, size, notes, uom, alfacut
        function setContextDetail() {
            var self = this;

            var contextName = self.contextDataResults.rows[0][0];
            var className   = self.contextDataResults.rows[0][1];
            var type        = self.contextDataResults.rows[0][2];
            var uom         = self.contextDataResults.rows[0][3];
            var domainMin   = parseFloat(self.contextDataResults.rows[0][4]);
            var domainMax   = parseFloat(self.contextDataResults.rows[0][5]);
            var count       = self.contextDataResults.rows[0][6];
            var center      = parseFloat(self.contextDataResults.rows[0][7]); // avg, median, center
            var width       = parseFloat(self.contextDataResults.rows[0][8]);
            var size        = parseFloat(self.contextDataResults.rows[0][9]);
            var notes       = self.contextDataResults.rows[0][10];
            var search      = self.contextDataResults.rows[0][11];
            var read        = self.contextDataResults.rows[0][12];
            var write       = self.contextDataResults.rows[0][13];
            var version     = self.contextDataResults.rows[0][14];

            var html = "<div class=\"context-detail\">" +
                       //"  <label class=\"category-description\">Selected context details ...</label>" +
                       "  <div class=\"control-group\">" +
                       "    <label>Name: </label>" +
                       "    <label>"+contextName+"</label>" +
                       "  </div>" +
                       "  <div class=\"control-group\">" +
                       "    <label>Type: </label>" +
                       "    <label>"+type+"</label>" +
                       "  </div>" +
                       "</div>";

            $(".explorer-category-description.contexts").html(html);
        }

        function setClassDetail() {
            var self = this;
            if (classes.length == 0) {
                var html = "<div class=\"class-detail\">" +
                           "  <div class=\"control-group\">" +
                           "    <label>Filter String:</label>" +
                           "    <label>"+filterString+"</label>" +
                           "  </div>" +
                           "  <div class=\"control-group\">" +
                           "    <label>Filter Match:</label>" +
                           "    <label>"+classCount+"</label>" +
                           "  </div>" +
                           "</div>";
                $(".explorer-category-description.classes").html(html);
                return;
            }
            var contextName = self.contextDataResults.rows[0][0];
            var className   = self.contextDataResults.rows[0][1];
            if (className == null) className = "Default Context";
            var type        = self.contextDataResults.rows[0][2];
            var uom         = self.contextDataResults.rows[0][3];
            var domainMin   = parseFloat(self.contextDataResults.rows[0][4]);
            var domainMax   = parseFloat(self.contextDataResults.rows[0][5]);
            var count       = self.contextDataResults.rows[0][6];
            var center      = parseFloat(self.contextDataResults.rows[0][7]); // avg, median, center
            var width       = parseFloat(self.contextDataResults.rows[0][8]);
            var size        = parseFloat(self.contextDataResults.rows[0][9]);
            var notes       = self.contextDataResults.rows[0][10];
            var search      = self.contextDataResults.rows[0][11];
            var read        = self.contextDataResults.rows[0][12];
            var write       = self.contextDataResults.rows[0][13];
            var version     = self.contextDataResults.rows[0][14];


            var html = "<div class=\"class-detail\">" +
                       "  <div class=\"control-group\">" +
                       "    <label>Name: </label>" +
                       "    <label>"+className+"</label>" +
                       "  </div>" +
                       "  <div class=\"control-group\">" +
                       "    <label>Last Update:</label>" +
                       "    <label>"+version+"</label>" +
                       "  </div>" +
                       "  <div class=\"control-group\">" +
                       "    <label>Domain Min:</label>" +
                       "    <label>"+domainMin+"</label>" +
                       "  </div>"+
                       "  <div class=\"control-group\">" +
                       "    <label>Domain Max:</label>" +
                       "    <label>"+domainMax+"</label>" +
                       "  </div>" +
                       "  <div class=\"control-group\">" +
                       "    <label>Filter String:</label>" +
                       "    <label>"+filterString+"</label>" +
                       "  </div>" +
                       "  <div class=\"control-group\">" +
                       "    <label>Filter Match:</label>" +
                       "    <label>"+classCount+"</label>" +
                       "  </div>" +
                       "</div>";

            $(".explorer-category-description.classes").html(html);
        }

        function createHandlers() {
            var self = this;

            $("#filterDialogButton").click(function(e){
                e.preventDefault();
                filterString = $("#filterString").val();
                newFilter = true;
                $("#classActionSelect").val("");
                $('#filterModal').css('z-index', '-9999');
                $('#filterModal').modal('hide');

                require(["app/xsv/owl.carousel"], function() {
                    console.log("destroying carousels");
                    $(".owl-carousel.classes").html("");
                    $(".owl-carousel.classes").owlCarousel("destroy");
                    $('.owl-carousel.classes').hide();
                    $('.no-classes').hide();
                    $('.loading-classes').show();
                    $(".explorer-category-description.classes").html("");

                    $('.loading-concepts').show();
                    $("#explorerChart").hide();
                    $(".explorer-category-description.concepts").html("");
                    selectedClass = null;
                    getClasses();
                    updateHistory();
                });
            });

            $("#cancelDialogButton").click(function(e){
                e.preventDefault();
                $("#classActionSelect").val("");
            });

            $(".explorer-nav.right.apps").click(function(e){
                e.preventDefault();
                console.log("right clicked");
                appOwl.trigger('next.owl.carousel');
            })

            $(".explorer-nav.left.apps").click(function(e){
                e.preventDefault();
                console.log("left clicked");
                appOwl.trigger('prev.owl.carousel');
            })

            $(".explorer-nav.right.containers").click(function(e){
                e.preventDefault();
                console.log("right clicked");
                containerOwl.trigger('next.owl.carousel');
            })

            $(".explorer-nav.left.containers").click(function(e){
                e.preventDefault();
                console.log("left clicked");
                containerOwl.trigger('prev.owl.carousel');
            })

            $(".explorer-nav.right.contexts").click(function(e){
                e.preventDefault();
                console.log("right clicked");
                contextOwl.trigger('next.owl.carousel');
            })

            $(".explorer-nav.left.contexts").click(function(e){
                e.preventDefault();
                console.log("left clicked");
                contextOwl.trigger('prev.owl.carousel');
            })

            $(".explorer-nav.right.classes").click(function(e){
                e.preventDefault();
                console.log("right clicked");
                classOwl.trigger('next.owl.carousel');
            })

            $(".explorer-nav.left.classes").click(function(e){
                e.preventDefault();
                console.log("left clicked");
                classOwl.trigger('prev.owl.carousel');
            })

            $('.explorer-category.apps').on('loaded', function(event){
                console.log("Loading Apps ...");
                var searchResults = event.searchResults;
                var urlApp = self.URLUtil.getURLParam("app");
                var urlScope = self.URLUtil.getURLParam("scope");
                if (searchResults != null) {
                    for (var i =0; i < searchResults.rows.length; i++) {
                        var row = searchResults.rows[i];
                        var app = row[0];
                        var label = row[1];
                        var scope = row[2];
                        var count = row[3];
                        apps.push({"app":app, "name":label, "scope":scope, "count":count});
                        if ((app == urlApp) && (scope == urlScope)) {
                            selectedApp = apps[apps.length-1];
                        }

                    }
                    if (selectedApp == null) {
                        selectedApp = apps[0];
                    }
                }
                else {
                    var html = "";
                    var msgs = event.errorMessages;
                    
                    if (msgs != null) {
                        var msg = "";
                        for (var i = 0; i < msgs.length; i++) {
                            if (msgs[i].indexOf("CSRF") > -1) {
                                // This is a CSRF validation failure!
                                // Splunk issue with session cookie when different splunk instances accessed in same browser.
                                // Prompt user to refresh the browser, so new cookie is obtained
                                msg = "A problem was encountered with your session. Please Refresh the page!";
                                break;
                            }
                            msg += "<p>" + msgs[i] + "</p>";
                        }
                        require(["bootstrap.modal"],function() {
                            $('#errorModalMessage').html(msg);
                            $('#errorModal').css('z-index', '9999');
                            $('#errorModal').modal('show');
                        });
                    }
                }
                setAppData();
                updateAppCarousel();
                setAppDetail();
                $('.loading-apps').hide();
                $('.owl-carousel.apps').show();

                getContainers();
            });

            $('.explorer-category.containers').on('loaded', function(event){
                console.log("Loading Containers ...");
                var urlContainer = self.URLUtil.getURLParam("container");
                var searchResults = event.searchResults;
                if (searchResults != null) {
                    for (var i =0; i < searchResults.rows.length; i++) {
                        var row = searchResults.rows[i];
                        var name = row[0];
                        var count = row[1];
                        containers.push({"name":name, "count":count});
                        if (name == urlContainer) {
                            selectedContainer = containers[containers.length-1];
                        }

                    }
                    if (selectedContainer == null) {
                        selectedContainer = containers[0];
                    }
                }
                setContainerData();
                updateContainerCarousel();
                setContainerDetail();
                $('.loading-containers').hide();
                $('.owl-carousel.containers').show();

                getContexts();
            });

            $('.explorer-category.contexts').on('loaded', function(event){
                console.log("Loading Contexts ...");
                var urlContext = self.URLUtil.getURLParam("context");
                var searchResults = event.searchResults;
                if (searchResults != null) {
                    for (var i =0; i < searchResults.rows.length; i++) {
                        var row = searchResults.rows[i];
                        var name = row[0];
                        var count = row[1];
                        contexts.push({"name":name, "count":count});
                        if (name == urlContext) {
                            selectedContext = contexts[contexts.length-1];
                        }

                    }
                    if (selectedContext == null) {
                        selectedContext = contexts[0];
                    }
                }
                setContextData();
                updateContextCarousel();
                $('.loading-contexts').hide();
                $('.owl-carousel.contexts').show();

                getClasses();
            });

            $('.explorer-category.classes').on('loaded', function(event){
                var urlClass = self.URLUtil.getURLParam("class");
                console.log("Loading Classes ...");
                var searchResults = event.searchResults;
                if (searchResults != null) {
                    classCount = searchResults.rows.length;
                    var length = 0;
                    if (searchResults.rows.length > 100) {
                        length = 100;
                    }
                    else {
                        length = searchResults.rows.length;
                    }

                    for (var i =0; i < length; i++) {
                        var row = searchResults.rows[i];
                        var name = row[0];
                        classes.push({"name":name});
                        if (name == urlClass) {
                            selectedClass = classes[classes.length-1];
                        }

                    }

                    if (selectedClass == null) {
                        selectedClass = classes[0];
                    }

                    $('.loading-concepts').show();
                    $("#explorerChart").hide();
                    $(".explorer-category-description.concepts").html("");

                    setClassData();
                    updateClassCarousel();
                    $('.loading-classes').hide();
                    $('.owl-carousel.classes').show();

                    getConceptAttributess();
                    getContextAttributess();
                    setContextChart();
                }
                else {
                    console.log("No Classes Returned");
                    classCount = 0;
                    getContextAttributess();
                    $(".explorer-category-description.contexts").html("");
                    $('.loading-classes').hide();
                    $('.no-classes').show();
                    $(".explorer-category-description.concepts").html("");
                    //$("#explorerChart").html("");;
                    $("#explorerChart").hide();
                    $('.loading-concepts').hide();
                }
            });

            $('.explorer-category.concepts').on('loaded', function(event) {
                self.conceptDataResults = event.searchResults;
                if (self.conceptDataResults != null) {
                    var html = self.ConceptUtil.getConceptDetail(self.conceptDataResults.rows[0][0], self.conceptDataResults);
                    $(".explorer-category-description.concepts").html(html);
                }
            });

            $('#contextdetail').on('loaded', function(event) {
                self.contextDataResults = event.searchResults;
                console.log("Context/Class Loaded ...");
                setContextDetail();
                setClassDetail();
            });


            $("#appActionSelect").change(function() {
                updateHistory();
                var action = $("#appActionSelect").val(); 

                if (action == "create") {
                    window.location.href = "xsv_create_wizard?container=&context=&class=&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
            });

            $("#containerActionSelect").change(function() {
                updateHistory();
                var action = $("#containerActionSelect").val(); 

                if (action == "create") {
                    window.location.href = "xsv_create_wizard?container="+selectedContainer.name+"&context=&class=&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
            });

            $("#contextActionSelect").change(function() {
                updateHistory();
                var action = $("#contextActionSelect").val(); 

                if (action == "create") {
                    window.location.href = "xsv_create_wizard?container="+selectedContainer.name+"&context="+selectedContext.name+"&class=&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
                else if (action == "clone") {
                }
                else if (action == "redefine") {
                    window.location.href = "xsv_update_context?container="+selectedContainer.name+"&context="+selectedContext.name+"&class=&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
                else if (action == "overlay") {
                    window.location.href = "xsv_overlay_context?container="+selectedContainer.name+"&context="+selectedContext.name+"&class=&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
                else if (action == "searches") {
                    window.location.href = "xsv_searches_context?container="+selectedContainer.name+"&context="+selectedContext.name+"&class=&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
            });

            $("#classActionSelect").change(function() {
                updateHistory();
                if (selectedClass != null) {
                    var theClass = selectedClass.name;
                    if (theClass == null) theClass = "";
                }
                else {
                    theClass = "";
                }

                var action = $("#classActionSelect").val(); 
                if (action == "clone") {
                }
                else if (action == "redefine") {
                    window.location.href = "xsv_update_context?container="+selectedContainer.name+"&context="+selectedContext.name+"&class="+theClass+"&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
                else if (action == "overlay") {
                    window.location.href = "xsv_overlay_context?container="+selectedContainer.name+"&context="+selectedContext.name+"&class="+theClass+"&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
                else if (action == "filter") {
                    console.log("filter selected ...");
                    $("#filterString").val("");
                    require(["bootstrap.modal"],function() {
                        $('#filterModalMessage').html("Enter String to Filter Classes");
                        $('#filterModal').css('z-index', '9999');
                        $('#filterModal').modal('show');
                        $('#filterString').focus();
                    });
                }
            });

            $("#conceptActionSelect").change(function() {
                updateHistory();
                var theClass = selectedClass.name;
                if (theClass == null) theClass = "";

                var action = $("#conceptActionSelect").val(); 
                if (action == "create") {
                    window.location.href = "xsv_update_context?container="+selectedContainer.name+"&context="+selectedContext.name+"&class="+theClass+"&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
                else if (action == "compare") {
                    window.location.href = "xsv_compare_concepts?container="+selectedContainer.name+"&context="+selectedContext.name+"&class="+theClass+"&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
                else if (action == "delete") {
                    window.location.href = "xsv_update_context?container="+selectedContainer.name+"&context="+selectedContext.name+"&class="+theClass+"&app="+selectedApp.app+"&scope="+selectedApp.scope;
                }
            });


            $('#explorerChart').on('loaded', function(event) {
                self.contextDataResultsForChart = event.searchResults;
                if (self.contextDataResultsForChart == null) {
                    console.log("Failure Retrieving Context Data Results for Chart");
                    return;
                }
                var isAD = false;
                if (self.contextDataResultsForChart.fields.length == 3) {
                    isAD = true;
                }
                var contextRows = self.contextDataResultsForChart.rows;
                var domainMin = Number(contextRows[0][0]);
                var domainMax = Number(contextRows[contextRows.length-1][0]);
                var $el = $("#explorerChart");
                self.ContextChart.renderContextChart2(event.contextName, domainMin, domainMax, $el, self.contextDataResultsForChart, isAD);

                $('.loading-concepts').hide();
                $("#explorerChart").show();

                $("#explorerChart svg").off();
                $("#explorerChart svg").click(function(e) {
                    e.preventDefault();
                    var key = e.target.__data__.key;
                    $("path.nv-area").css("fill-opacity","0.5");
                    $(e.target).css("fill-opacity","1");

                    var html = self.ConceptUtil.getConceptDetail(key, self.conceptDataResults);
                    $(".explorer-category-description.concepts").html(html);
                });
                self.update_in_progress = false;
            });
        }

        function applyStyle() {
            $('.splunk-dashboard-controls').hide();
        }

        function createCopyrightDiv() {
            $('#xsv_copyright').html("<div><p>&#0169; Copyright 2015 Scianta Analytics LLC.  All Rights Reserved - Custom App Development for Splunk by Concanon LLC</p></div>");
        }

        function updateHistory() {
            var appString = (selectedApp != null)? selectedApp.app: "";
            var scopeString = (selectedApp != null)? selectedApp.scope: "";
            var containerString = (selectedContainer != null) ? selectedContainer.name : "";
            var contextString = (selectedContext != null) ? selectedContext.name : "";
            var classString = (selectedClass != null) ? selectedClass.name : "";
            var newUrl= "xsv_explore_context?app="+appString+"&scope="+scopeString+"&container="+containerString+"&context="+contextString+"&class="+classString+"&filterString="+filterString;
            window.history.replaceState(null, this.title, newUrl);
            self.URLUtil.loadURLParams();
        }

        self.URLUtil.loadURLParams();
        var urlFilter = self.URLUtil.getURLParam("filterString");
        filterString= (urlFilter != undefined) ? urlFilter : "";

        applyStyle();
        //createCopyrightDiv();
        createHandlers();

       getApps();
    });
});

