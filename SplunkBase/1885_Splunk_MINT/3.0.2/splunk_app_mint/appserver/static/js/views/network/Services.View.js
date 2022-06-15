define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/network/services.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/tokenforwarder",
    "splunkjs/mvc/singleview",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintBreadcrumbs.View",
    "app/views/shared/MintSingleDisplay.View",
    "./Services.View.pcss"
], function ($,
             _,
             Backbone,
             BaseView,
             FiltersView,
             NetworkServicesTemplate,
             mvc,
             SearchManager,
             PostProcessManager,
             TokenForwarder,
             SingleView,
             TableView,
             ChartView,
             BreadCrumbsView,
             MintSingleView) {
    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    // Include List of tokens to be peristed in classicUrl.
    var TOKENS_INCLUDELIST = ['domain', 'path'];

    return BaseView.extend({
        template: NetworkServicesTemplate,
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // Reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('domain', '*');
            this.tokens.set('path', '*');
            this.tokens.set('group_by', 'domain');
            this.tokensIncludelist = TOKENS_INCLUDELIST;


            // Generate $group_by$ token based on $domain$ token
            this.groupByTokenForwarder = new TokenForwarder(["$domain$"], "$group_by$", function (domain) {
                return (domain !== '*') ? 'path' : 'domain';
            });

            this.searches = {};

            this.searches.tableSearch = new SearchManager({
                id: 'table-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: '| tstats count as volume avg(All_MINT.Performance.Network_Monitoring.latency) AS avg_latency' +
                ' FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring) ' +
                ' AND All_MINT.Performance.Network_Monitoring.domain=$domain$ AND All_MINT.Performance.Network_Monitoring.path=$path|s$  AND ' + CONTEXT_SEARCH +
                ' BY All_MINT.Performance.Network_Monitoring.$group_by$, All_MINT.Performance.Network_Monitoring.statusCode, All_MINT.Performance.Network_Monitoring.exception' +
                ' | rename All_MINT.Performance.Network_Monitoring.$group_by$ as $group_by$ All_MINT.Performance.Network_Monitoring.statusCode as status' +
                ' All_MINT.Performance.Network_Monitoring.exception as exception' +
                ' | eval is_error=if(status>399,"yes","no") | eval error_volume=if(is_error=="yes", volume, 0)' +
                ' | eval non_crash_latency=if(status > 0, avg_latency, 0)' +
                ' | eval non_crash_volume=if(status > 0, volume, 0)' +
                ' | eval is_network_error=if(exception=="NA","no","yes")' +
                ' | eval network_error_volume=if(is_network_error=="yes", volume, 0)' +
                ' | eval latency_by_status=(non_crash_volume*non_crash_latency)' +
                ' | stats sum(volume) as volume sum(non_crash_volume) as sum_non_crash_volume sum(error_volume) as error_volume sum(network_error_volume) as network_error_volume sum(latency_by_status) as sum_latency by $group_by$' +
                ' | eval network_error_rate=round((network_error_volume/volume)*100,2)' +
                ' | eval latency=round((sum_latency/sum_non_crash_volume),2) | eval error_rate=round((error_volume/volume)*100,2) | fields - error_volume, sum_latency, sum_non_crash_volume, network_error_volume' +
                ' | rename domain as "Service" path as "Path" volume as "Volume" latency as "Avg latency (ms)" error_rate as "HTTP Error rate (%)" network_error_rate as "Network Error Rate (%)"' +
                ' | sort - Volume'
            }, {tokens: true});


            this.searches.latencySingleValue = new SearchManager({
                id: 'latency-avg-single-value',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: '| tstats avg(All_MINT.Performance.Network_Monitoring.latency) AS latency' +
                ' FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring)' +
                ' AND All_MINT.Performance.Network_Monitoring.domain=$domain$ AND All_MINT.Performance.Network_Monitoring.path=$path|s$ ' +
                ' AND All_MINT.Performance.Network_Monitoring.statusCode > 0  AND ' + CONTEXT_SEARCH +
                ' | eval latency=round(latency,2)'
            }, {tokens: true});


            this.searches.volumeSingleValue = new SearchManager({
                id: 'volume-single-value',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: '| tstats count AS volume ' +
                ' FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring) ' +
                '  AND All_MINT.Performance.Network_Monitoring.domain=$domain$ AND All_MINT.Performance.Network_Monitoring.path=$path|s$ ' +
                '  AND ' + CONTEXT_SEARCH
            }, {tokens: true});

            this.searches.httpErrorSingleValue = new SearchManager({
                id: 'http-error-rate-single-value',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count as volume FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring)' +
                ' AND All_MINT.Performance.Network_Monitoring.domain=$domain$ AND All_MINT.Performance.Network_Monitoring.path=$path|s$' +
                ' AND ' + CONTEXT_SEARCH +
                '  BY  All_MINT.Performance.Network_Monitoring.statusCode ' +
                ' |rename All_MINT.Performance.Network_Monitoring.statusCode as status' +
                ' | eval is_error=if(status>399,"yes","no") ' +
                ' | eval error_volume=if(is_error=="yes", volume, 0)' +
                ' | stats sum(volume) as volume sum(error_volume) as error_volume' +
                ' | eval error_rate=round((error_volume/volume)*100,2)' +
                ' | fields - error_volume, volume'
            }, {tokens: true});

            // Latency Graph query
            this.searches.latencyGraphSearch = new SearchManager({
                id: 'latency-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats avg(All_MINT.Performance.Network_Monitoring.latency) AS latency' +
                '  FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring) AND ' + CONTEXT_SEARCH +
                '  AND All_MINT.Performance.Network_Monitoring.statusCode != 0 ' +
                '  AND All_MINT.Performance.Network_Monitoring.domain=$domain$ AND All_MINT.Performance.Network_Monitoring.path=$path|s$' +
                '  BY _time ' + SPAN_SETTING +
                ' | timechart ' + SPAN_SETTING + ' eval(round(first(latency), 0)) as latency'
            }, {tokens: true});

            // Volume Graph query
            this.searches.volumeGraphSearch = new SearchManager({
                id: 'volume-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count(All_MINT.Performance.Network_Monitoring.url) as volume' +
                '  FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring) AND ' + CONTEXT_SEARCH +
                '  AND All_MINT.Performance.Network_Monitoring.domain=$domain$ AND All_MINT.Performance.Network_Monitoring.path=$path|s$' +
                '  BY _time ' + SPAN_SETTING +
                ' | timechart ' + SPAN_SETTING + ' first(volume) as volume'
            }, {tokens: true});

            // Error Rate Graph query
            this.searches.errorRateGraphSearch = new SearchManager({
                id: 'error-rate-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count(All_MINT.Performance.Network_Monitoring.url) as volume' +
                '  FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Network_Monitoring) AND ' + CONTEXT_SEARCH +
                '  AND All_MINT.Performance.Network_Monitoring.domain=$domain$ AND All_MINT.Performance.Network_Monitoring.path=$path|s$' +
                '  BY All_MINT.Performance.Network_Monitoring.statusCode, _time ' + SPAN_SETTING +
                ' | rename All_MINT.Performance.Network_Monitoring.statusCode as status' +
                ' | eval is_error=if(status>399,"yes","no") | eval error_volume=if(is_error=="yes", volume, 0)' +
                ' | timechart ' + SPAN_SETTING + ' eval(round(sum(error_volume)/sum(volume)*100,2)) as error_rate'
            }, {tokens: true});

            // Table view
            this.children.tableView = new TableView({
                id: "populate-table",
                managerid: "table-search",
                classicUrl: this.model.classicUrl,
                pageSize: "10",
                drilldown: "row",
                drilldownRedirect: false
            });

            this.children.tableView.on('table:drilldown', this.onDrilldown, this);
   
            this.searches.tableSearch.on('change', function(){
                this.children.tableView.paginator.settings.set('page', 0);
            }.bind(this));

            this.children.latencyChartView = new ChartView({
                id: "latency-chart",
                managerid: "latency-search",
                type: "area",
                drilldown: "none",
                title: "Latency (ms)",
                height: "220px",
                classicUrl: this.model.classicUrl,
                chartOptions: {
                    plotOptions: {
                        areaspline: {
                            color: "#fab440"
                        }
                    }
                },
                data: "results"
            });

            this.children.latencyAvgView = new MintSingleView({
                id: "latency-avg",
                managerid: 'latency-avg-single-value',
                field: 'latency',
                afterLabel: 'ms',
                data: 'results',
                fieldIdx: 0,
                multivalue: true
            });

            this.children.errorRateAvgView = new MintSingleView({
                id: "error-rate-avg",
                managerid: 'http-error-rate-single-value',
                field: 'error_rate',
                afterLabel: '%',
                data: 'results',
                fieldIdx: 0,
                multivalue: true
            });

            this.children.volumeAvgView = new MintSingleView({
                id: "volume-avg",
                managerid: 'volume-single-value',
                field: 'volume',
                data: 'results',
                fieldIdx: 0,
                multivalue: true
            });

            this.children.volumeChartView = new ChartView({
                id: "volume-chart",
                managerid: "volume-search",
                type: "area",
                drilldown: "none",
                title: "Request volume",
                height: "220px",
                classicUrl: this.model.classicUrl,
                chartOptions: {
                    plotOptions: {
                        areaspline: {
                            color: "#1d5690"
                        }
                    }
                },
                data: "results"
            });

            this.children.errorRateChartView = new ChartView({
                id: "error-rate-chart",
                managerid: "error-rate-search",
                type: "area",
                drilldown: "none",
                title: "Error rate (%)",
                height: "220px",
                percentageResult: true,
                classicUrl: this.model.classicUrl,
                chartOptions: {
                    plotOptions: {
                        areaspline: {
                            color: "#d7293d"
                        }
                    }
                },
                data: "results"
            });

            // Filters panel - will set search token $filters.tstatsQueryAll$
            this.children.filtersView = new FiltersView({
                model: {
                    classicUrl: this.model.classicUrl,
                    project: this.model.project
                },
                collection: {
                    projects: this.collection.projects
                }
            });

            this.children.breadCrumbsView = new BreadCrumbsView({
                model: {
                    classicUrl: this.model.classicUrl,
                },
                title: "Services",
                breadcrumbs: ["domain", "path"],
                defaultValues: {
                    domain: '*',
                    path: '*'
                }
            });

        },

        tokenEvents: {
            "change:path": 'onChangePath'
        },

        onDrilldown: function (e) {
            var tableValue = e.data["click.value"],
                classicUrl = this.model.classicUrl;

            e.preventDefault();

            if (!classicUrl.get("domain") || classicUrl.get("domain") == "*") {
                classicUrl.save({domain: tableValue});
            } else {
                classicUrl.save({path: tableValue});
            }
        },

        onChangePath: function (model, value) {
            if (value !== "*") {
                this.children.tableView.settings.set('drilldown', 'none');
            } else {
                this.children.tableView.settings.set('drilldown', 'row');
            }
        },

        render: function () {
            // Before rendering, force the changePath event just to enforce the drilldown settings
            // or removed column settings in case the user refreshes from inside the drilldown. If the
            // user refreshes inside the drilldown without this line, the path won't undergo a 
            // change event, which means the default, top-level drilldown and column settings will show.
            this.onChangePath(this.model, this.model.classicUrl.get('path'));
            
            this.$el.html(this.compiledTemplate({}));

            this.$("#bottom-table").append(this.children.tableView.render().el);

            this.$("#latency-chart").html(this.children.latencyChartView.render().el);

            this.$("#volume-chart").html(this.children.volumeChartView.render().el);

            this.$("#error-rate-chart").html(this.children.errorRateChartView.render().el);

            this.$('.FiltersRight').append(this.children.filtersView.render().el);

            this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);

            this.$('#latency-avg').append(this.children.latencyAvgView.render().el);

            this.$('#volume-avg').append(this.children.volumeAvgView.render().el);

            this.$('#error-rate-avg').append(this.children.errorRateAvgView.render().el);

            return this;
        }
    }, {
        TokenIncludelist: TOKENS_INCLUDELIST
    });
});
