define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/analytics/location.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/tokenforwarder",
    "splunkjs/mvc/splunkmapview",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintBreadcrumbs.View",
    "app/views/shared/MintSingleDisplay.View",
    "./AnalyticsLocation.View.pcss"
], function ($,
             _,
             Backbone,
             BaseView,
             FiltersView,
             AnalyticsLocationTemplate,
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
        template: AnalyticsLocationTemplate,
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // Reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('group_by', '_time');
            this.tokens.set('group_by_chart', '');
            this.tokens.set('query','dc(All_MINT.uuid)');
            this.searches = {};
            // Define the different queries we will be using
            this.queries = {};
            this.queries.graphSearch = {
                'sessions':
                    ' | tstats count as sessions from datamodel=MINT where (nodename = All_MINT.Usage.Session.Pings) ' +
                    ' AND ' + CONTEXT_SEARCH + ' BY _time ' + SPAN_SETTING +
                    ' | timechart ' + SPAN_SETTING + ' sum(sessions) as "Sessions"',
                'users': 
                    ' | tstats dc(All_MINT.uuid) as uniques FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH + ' BY _time ' + SPAN_SETTING +
                    ' | timechart ' + SPAN_SETTING + ' values(uniques) as "Unique users"'
            };
            this.queries.countSearch = {
                'sessions':
                    ' | tstats count as "Sessions" FROM datamodel=MINT' +
                    ' WHERE (nodename = All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH,
                'users':
                    ' | tstats dc(All_MINT.uuid) as "Unique users" FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH
            };
            this.queries.mapSearch = {
                'sessions':
                    ' | tstats count as "Sessions" FROM datamodel=MINT' +
                    ' WHERE (nodename = All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH +
                    ' by All_MINT.remoteIP_Country' +
                    ' | rename All_MINT.remoteIP_Country as Country' +
                    ' | geom geo_countries featureIdField=Country',
                'users': 
                    ' | tstats dc(All_MINT.uuid) as "Unique users" FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH + 
                    ' by All_MINT.remoteIP_Country' +
                    ' | rename All_MINT.remoteIP_Country as Country' +
                    ' | geom geo_countries featureIdField=Country',

            };
            // set the default values
            // NOTE: we don't really need these placeholders, we could just pass the values(searches)
            // directly inside the search mangers, we just do it for readability
            this.tokens.set('graphSearch.query', this.queries.graphSearch.sessions);
            this.tokens.set('countSearch.query', this.queries.countSearch.sessions);
            this.tokens.set('mapSearch.query', this.queries.mapSearch.sessions);


            // Count Graph query
            this.searches.countGraphSearch = new SearchManager({
                id: 'count-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: this.tokens.get('graphSearch.query'),
            }, {tokens: true});


               // Count single query
            this.searches.countSingleSearch = new SearchManager({
                id: 'count-single',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: this.tokens.get('countSearch.query'),
            }, {tokens: true});


            this.searches.mapSearch = new SearchManager({
                id: 'map-query',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: this.tokens.get('mapSearch.query'),
            }, {tokens: true});


            this.children.countAvgSingle = new MintSingleView({
              id: "count-avg",
              managerid: 'count-single',
              data: 'results'
            });

            this.children.countChartView = new ChartView({
                id: "count-chart",
                managerid: "count-search",
                type: "spline",
                drilldown: "none",
                title: 'agg_value',
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
                    'sessions',
                    'appVersion',
                    'osVersion',
                    'environment',
                    'country',
                    'connection',
                    'carrier'
                ]
            });

        },

        tokenEvents: {
            "change:filters.country": 'onChangeCountry',
            "change:filters.sessions": 'onChangeMetric'
        },
        onChangeMetric: function (model, value){
            if (this.tokens.get('filters.sessions')==='true'){
                // Change text
                $('#toggle-value').html('Sessions');
                // Set the tokens value
                this.tokens.set('graphSearch.query', this.queries.graphSearch.sessions);
                this.tokens.set('countSearch.query', this.queries.countSearch.sessions);
                this.tokens.set('mapSearch.query', this.queries.mapSearch.sessions);
                // set the search inside the search manager
                this.searches.countSingleSearch.set('search',mvc.tokenSafe(this.queries.countSearch.sessions));
                this.searches.countGraphSearch.set('search',mvc.tokenSafe(this.queries.graphSearch.sessions));
                this.searches.mapSearch.set('search',mvc.tokenSafe(this.queries.mapSearch.sessions));
                this.searches.mapSearch.startSearch();

            }
            else {
                $('#toggle-value').html('Users');
                // Set the tokens value
                this.tokens.set('graphSearch.query', this.queries.graphSearch.users);
                this.tokens.set('countSearch.query', this.queries.countSearch.users);
                this.tokens.set('mapSearch.query', this.queries.mapSearch.users);
                // set the search inside the search manager
                this.searches.countSingleSearch.set('search',mvc.tokenSafe(this.queries.countSearch.users));
                this.searches.countGraphSearch.set('search',mvc.tokenSafe(this.queries.graphSearch.users));
                this.searches.mapSearch.set('search',mvc.tokenSafe(this.queries.mapSearch.users));
                this.searches.mapSearch.startSearch();


            }
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
            this.$('#toggle-value').html(((this.tokens.get('filters.sessions')===true) ? "Sessions" : "Users"));
            this.$('.FiltersRight').append(this.children.filtersView.render().el);
            this.$('.choro').append(this.children.mapview.render().el);
            this.$('#country-count-chart').append(this.children.countChartView.render().el);

            // this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);
            this.$('#count').append(this.children.countAvgSingle.render().el);

            return this;
        }
    });
})
;
