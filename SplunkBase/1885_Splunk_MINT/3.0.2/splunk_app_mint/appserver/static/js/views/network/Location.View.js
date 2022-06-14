define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/network/location.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/tokenforwarder",
    "splunkjs/mvc/splunkmapview",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintBreadcrumbs.View",
    "app/views/shared/MintSingleDisplay.View",
    "./NetworkLocation.View.pcss"
], function ($,
             _,
             Backbone,
             BaseView,
             FiltersView,
             NetworkLocationTemplate,
             mvc,
             SearchManager,
             PostProcessManager,
             TokenForwarder,
             SplunkMapView,
             TableView,
             ChartView,
             BreadCrumbsView,
             MintSingleView) {

    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    return BaseView.extend({
        template: NetworkLocationTemplate,
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // Reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('group_by', '_time');
            this.tokens.set('group_by_chart', '');

            this.searches = {};

            // Latency Graph query
            this.searches.latencyGraphSearch = new SearchManager({
                id: 'latency-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats avg(All_MINT.Performance.Network_Monitoring.latency) AS latency' +
                '  FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring)' +
                ' AND All_MINT.Performance.Network_Monitoring.statusCode > 0 AND ' + CONTEXT_SEARCH +
                '  BY $group_by$  ' + SPAN_SETTING +
                ' | timechart ' + SPAN_SETTING + ' eval(round(first(latency), 0)) as latency  $group_by_chart$'
            }, {tokens: true});


               // Latency single query
            this.searches.latencySingleSearch = new SearchManager({
                id: 'latency-single',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats avg(All_MINT.Performance.Network_Monitoring.latency) AS latency' +
                '  FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring) ' +
                '  AND All_MINT.Performance.Network_Monitoring.statusCode > 0 ' + CONTEXT_SEARCH +
                '  | eval latency=round(latency,0) '
            }, {tokens: true});


            this.searches.mapSearch = new SearchManager({
                id: 'map-query',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: '| tstats avg("All_MINT.Performance.Network_Monitoring.latency") AS latency' +
                ' from datamodel=MINT where (nodename = All_MINT.Performance.Network_Monitoring) ' +
                ' AND All_MINT.Performance.Network_Monitoring.statusCode > 0 '  +
                CONTEXT_SEARCH +
                ' by All_MINT.remoteIP_Country' +
                ' | rename All_MINT.remoteIP_Country as Country | eval  "Latency"=round(latency ,2) | fields - latency ' +
                ' | geom geo_countries featureIdField=Country'
            }, {tokens: true});


            this.children.latencyAvgSingle = new MintSingleView({
              id: "latency-avg",
              managerid: 'latency-single',
              data: 'results',
              afterLabel: 'ms'
            });

            this.children.latencyChartView = new ChartView({
                id: "latency-chart",
                managerid: "latency-search",
                type: "spline",
                drilldown: "none",
                title: "Latency (ms)",
                height: "220px",
                classicUrl: this.model.classicUrl,
                output_mode: "json",
                multiSeries: true,
                chartOptions: {
                chart: {
                        type: 'spline',
                        marginTop: 40,
                    },
                    colors: ['#fab440', '#fddaa0', '#feeccf', '#ef7a24', '#f8a161', '#fccd9f', '#ef4524',
                        '#fb8169'],
                        legend: {
                            x: 0,
                            y: -15,
                            enabled:false,
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0,
                            floating: false
                        }
                },
                data: "results"
            });


            this.children.mapview = new SplunkMapView({
                id: "mapview",
                managerid: "map-query",
                tileSource: "splunk",
                drilldown: true,
                drilldownRedirect: false,
                //Map type
                "mapping.type": "choropleth",
                //Map position
                "mapping.map.center": "(18,25)",
                //Map zoom
                "mapping.map.zoom": "2",
                //Max color
                "mapping.choroplethLayer.maximumColor": "0xfab440",
                //Color stages
                "mapping.choroplethLayer.colorBins": "5",
                //Color mode
                "mapping.choroplethLayer.colorMode": "auto",
                "mapping.choroplethLayer.neutralPoint": "0",
                "mapping.tileLayer.maxZoom": "2",
                "mapping.tileLayer.minZoom": "2",

                "mapping.choroplethLayer.showBorder": "1",
                "mapping.choroplethLayer.shapeOpacity": "0.75",
                "mapping.markerLayer.markerMinSize": "10",
                "mapping.data.maxClusters": "100",
                "mapping.markerLayer.markerOpacity": "0.8",
                "resizable": false,
                "mapping.tileLayer.tileOpacity": "1",
                "mapping.markerLayer.markerMaxSize": "50",
                "mapping.map.panning": "true",
                "mapping.map.scrollZoom": "false",
                "mapping.showTiles": "1"
            });

            // Filters panel - will set search token $filters.tstatsQueryAll$
            this.children.filtersView = new FiltersView({
                model: {
                    classicUrl: this.model.classicUrl,
                    project: this.model.project
                },
                collection: {
                    projects: this.collection.projects
                },
                filters: [
                    'appVersion',
                    'osVersion',
                    'environment',
                    'country',
                    'connection',
                    'carrier',
                    'domain'
                ]
            });

        },

        tokenEvents: {
            "change:filters.country": 'onChangeCountry'
        },

        onChangeCountry: function (model, value) {
            if (value != "*") {
                // We need set the graph query to group by All_MINT.remoteIP_Country
                this.tokens.set('group_by', 'All_MINT.remoteIP_Country, _time');
                this.tokens.set('group_by_chart', 'BY All_MINT.remoteIP_Country');
                $('#country-name').html("for "+value);
            } else {
                // We need unset the graph query to group by All_MINT.remoteIP_Country
                this.tokens.set('group_by', '_time');
                this.tokens.set('group_by_chart', '');
                $('#country-name').html("for the whole World");
            }
            //console.log('token = '+ this.tokens.get('group_by'));
        },
       
        render: function () {
            this.$el.html(this.compiledTemplate({}));
            this.$('.choro').append(this.children.mapview.render().el);
            this.$('#country-latency-chart').append(this.children.latencyChartView.render().el);
            this.$('.FiltersRight').append(this.children.filtersView.render().el);
            // this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);
            this.$('#latency-avg').append(this.children.latencyAvgSingle.render().el);

            return this;
        }
    });
})
;
