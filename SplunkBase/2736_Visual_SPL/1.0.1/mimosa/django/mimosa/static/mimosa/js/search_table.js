var deps = [
    "splunkjs/ready!",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/timelineview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/chartview"
];

define(deps, function (mvc) {
    var SearchbarView = require("splunkjs/mvc/searchbarview");
    var SearchControlsView = require("splunkjs/mvc/searchcontrolsview");
    var TimelineView = require("splunkjs/mvc/timelineview");
    var TableView = require("splunkjs/mvc/tableview");
    var SearchManager = require("splunkjs/mvc/searchmanager");
    var ChartView = require("splunkjs/mvc/chartview");

    var searchControls = new SearchControlsView({
        id: "sc",
        managerid: "sm",
        el: $("#search-controls")
    }).render();

    var table = new TableView({
        id: "st",
        managerid: "sm",
        el: $("#search-table"),
        count: 5,
        drilldownRedirect: false
    }).render();
    
    
    
    table.on('click:row', function (event) {
        var results = event.component.results || event.component.searchData;
        var rows = results.attributes.rows;
        var fields = results.attributes.fields;
        var row = rows[event.index];
        var result = {};
        for(var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var fieldName = field.name || field;
            result[fieldName] = row[i];    
        }
        
        var page = event.component.paginator.settings.get('page');
        
        $('#console').trigger('rebind', [page, event.index, result]);
    });

    var searchManager = new SearchManager({
        id: "sm",
        app: "mimosa",
        cache: true,
        preview: true,
        required_field_list: "*",
        status_buckets: 300,
        search: "*"
    });
    
    
    var chart;
    var updateChartType = function (chartType) {
        if(chart) {
            chart.remove();
        }
        var chartElement = 'search-chart-' + chartType;
        $('#search-chart').append('<div id="' + chartElement + '"></div>');
        chart = new ChartView({
            id: "chart",
            managerid: "sm",
            type: chartType,
            el: $('#' + chartElement)
        }).render();        
    };
    updateChartType('bar');

    return {
        searchManager: searchManager,
        tableView: table,
        chartView: chart,
        updateChartType: updateChartType
    };
});