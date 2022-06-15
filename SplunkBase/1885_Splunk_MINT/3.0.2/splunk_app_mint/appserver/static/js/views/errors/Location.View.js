define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/errors/location.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/tokenforwarder",
    "splunkjs/mvc/splunkmapview",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintBreadcrumbs.View",
    "app/views/shared/MintSingleDisplay.View",
    "./ErrorsLocations.View.pcss"
], function ($,
             _,
             Backbone,
             BaseView,
             FiltersView,
             ErrorsLocationTemplate,
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
        template: ErrorsLocationTemplate,
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // Reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('group_by', '_time');
            this.tokens.set('group_by_chart', '');

            this.searches = {};

            // Errors Graph query
            this.searches.errorsGraphSearch = new SearchManager({
                id: 'errors-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count as count FROM datamodel=MINT' +
                ' WHERE ((All_MINT.Performance.Errors.handled=false) OR (nodename=All_MINT.Usage.Session.Pings))' +
                ' AND ' + CONTEXT_SEARCH + ' BY nodename, _time '+ SPAN_SETTING +
                ' | search nodename=All_MINT.Performance.Errors OR nodename=All_MINT.Usage.Session.Pings' +
                ' | eval type=if(nodename="All_MINT.Usage.Session.Pings", "Pings", "Errors")' +
                ' | eval errors=if(nodename == "All_MINT.Performance.Errors", count, 0)' +
                ' | eval pings=if(nodename == "All_MINT.Usage.Session.Pings", count, 0)' +
                ' | eventstats sum(errors) AS Errors by _time' +
                ' | eventstats sum(pings) AS Pings by _time | eval percent=round((Errors/Pings)*100,2) | where type="Errors"'+
                ' | timechart ' + SPAN_SETTING + ' first(percent) as "Error rate"' +
                ' | fillNull value=0'
            }, {tokens: true});


               // Errors single query
            this.searches.errorsSingleSearch = new SearchManager({
                id: 'errors-single',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count as count FROM datamodel=MINT' +
                ' WHERE ((All_MINT.Performance.Errors.handled=false) OR (nodename=All_MINT.Usage.Session.Pings))' +
                ' AND ' + CONTEXT_SEARCH + ' BY nodename' +
                ' | search nodename=All_MINT.Performance.Errors OR nodename=All_MINT.Usage.Session.Pings' +
                ' | eval type=if(nodename="All_MINT.Usage.Session.Pings", "Pings", "Errors")' +
                ' | eval errors=if(nodename == "All_MINT.Performance.Errors", count, 0)' +
                ' | eval pings=if(nodename == "All_MINT.Usage.Session.Pings", count, 0)' +
                ' | eventstats sum(errors) AS Errors ' +
                ' | eventstats sum(pings) AS Pings' +
                ' | eval "Crash Rate"=round((Errors/Pings)*100, 2)' +
                ' | where type="Errors"' +
                ' | fields "Crash Rate"' 
            }, {tokens: true});


            this.searches.mapSearch = new SearchManager({
                id: 'map-query',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count as count FROM datamodel=MINT' +
                ' WHERE ((All_MINT.Performance.Errors.handled=false) OR (nodename=All_MINT.Usage.Session.Pings))' +
                ' AND ' + CONTEXT_SEARCH + ' BY nodename, All_MINT.remoteIP_Country' +
                ' | search nodename=All_MINT.Performance.Errors OR nodename=All_MINT.Usage.Session.Pings' +
                ' | eval type=if(nodename="All_MINT.Usage.Session.Pings", "Pings", "Errors")' +
                ' | eval errors=if(nodename == "All_MINT.Performance.Errors", count, 0)' +
                ' | eval pings=if(nodename == "All_MINT.Usage.Session.Pings", count, 0)' +
                ' | eventstats sum(errors) AS Errors by All_MINT.remoteIP_Country' +
                ' | eventstats sum(pings) AS Pings by All_MINT.remoteIP_Country' +
                ' | eval "Crash Rate"=round((Errors/Pings)*100, 2) ' +
                ' | where type="Errors"' +
                ' | fields All_MINT.remoteIP_Country, "Crash Rate"' +
                ' | rename All_MINT.remoteIP_Country as Country' +
                ' | geom geo_countries featureIdField=Country'
            }, {tokens: true});


            this.children.errorsAvgSingle = new MintSingleView({
              id: "errors-avg",
              managerid: 'errors-single',
              data: 'results',
              afterLabel: '%'
            });

            this.children.errorsChartView = new ChartView({
                id: "errors-chart",
                managerid: "errors-search",
                type: "spline",
                drilldown: "none",
                title: "Errors",
                height: "220px",
                classicUrl: this.model.classicUrl,
                output_mode: "json",
                multiSeries: true,
                percentageResult: true,
                chartOptions: {
                    chart: {
                        type: 'spline',
                        marginTop: 40,
                    },
                    colors: ['#df4039', '#fddaa0', '#feeccf', '#ef7a24', '#f8a161', '#fccd9f', '#ef4524',
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
                "mapping.choroplethLayer.maximumColor": "0xdf4039",
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
                    //'errorHandled',
                    'appVersion',
                    'osVersion',
                    'environment',
                    'country',
                    'connection',
                    'carrier',
                ]
            });

        },

        tokenEvents: {
            "change:filters.country": 'onChangeCountry',
            "change:filters.errorHandled": 'onChangeErrorHandled'
        },
        // onChangeErrorHandled: function (model, value){
        //     $('#error-type').html(((value==='false') ? "Crashes" : "Handled Exceptions"));
        // },
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
            //console.log(this.tokens.get('filters.errorHandled'));
            this.$el.html(this.compiledTemplate({}));
            this.$('.choro').append(this.children.mapview.render().el);
            //this.$('#error-type').html(((this.tokens.get('filters.errorHandled')==='false') ? "Crashes" : "Handled Exceptions"));
            this.$('#country-errors-chart').append(this.children.errorsChartView.render().el);
            this.$('.FiltersRight').append(this.children.filtersView.render().el);
            // this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);
            this.$('#errors-avg').append(this.children.errorsAvgSingle.render().el);

            return this;
        }
    });
})
;
