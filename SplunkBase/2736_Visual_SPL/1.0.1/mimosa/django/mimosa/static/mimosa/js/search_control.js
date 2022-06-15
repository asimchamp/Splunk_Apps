var deps = [
    "splunkjs/ready!",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/timelineview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/searchmanager"
];

define(deps, function (mvc) {
    var SearchbarView = require("splunkjs/mvc/searchbarview");
    var SearchControlsView = require("splunkjs/mvc/searchcontrolsview");
    var TimelineView = require("splunkjs/mvc/timelineview");
    var TableView = require("splunkjs/mvc/tableview");
    var SearchManager = require("splunkjs/mvc/searchmanager");

    // Instantiate the views and search manager
    // var mysearchbar = new SearchbarView({
    //     id: "searchbar1",
    //     managerid: "search1",
    //     el: $("#mysearchbar1")
    // }).render();

    var searchControls = new SearchControlsView({
        id: "sc",
        managerid: "sm",
        el: $("#search-controls")
    }).render();

    var timeline = new TimelineView({
        id: "tl",
        managerid: "sm",
        el: $("#timeline")
    }).render();

    var table = new TableView({
        id: "st",
        managerid: "sm",
        el: $("#search-table")
    }).render();

    var searchManager = new SearchManager({
        id: "sm",
        app: "mimosa",
        cache: true,
        preview: true,
        required_field_list: "*",
        status_buckets: 300,
        search: "*"
    });

    // Update the search manager when the timeline changes
    timeline.on("change", function() {
        searchManager.settings.set(timeline.val());
    });

    // Update the search manager when the query in the searchbar changes
    // mysearchbar.on("change", function() {
    //     mysearch.settings.unset("search");
    //     mysearch.settings.set("search", mysearchbar.val());
    // });

    // Update the search manager when the timerange in the searchbar changes
    // mysearchbar.timerange.on("change", function() {
    //     mysearch.settings.set(mysearchbar.timerange.val());
    // });
    
    return {
        searchManager: searchManager    
    };
});