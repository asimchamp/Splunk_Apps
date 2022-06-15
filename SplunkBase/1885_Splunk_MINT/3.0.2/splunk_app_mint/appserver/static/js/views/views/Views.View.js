    define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/views/views.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintBreadcrumbs.View",
    "splunkjs/mvc/utils",
    // "app/views/shared/MintSingleDisplay.View",
    "./Views.View.pcss"
], function ($,
             _,
             Backbone,
             BaseView,
             FiltersView,
             ViewsTemplate,
             mvc,
             SearchManager,
             TableView,
             ChartView,
             BreadCrumbsView,
             splunkjs_utils) {

    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    var TOKENS_INCLUDELIST = ['viewName'];

    var TOP_VIEWS_TABLE =
        ' | tstats dc(All_MINT.uuid) as Uniques count as Volume avg(All_MINT.Usage.View.loadTime) as Duration' +
        ' FROM datamodel=MINT' +
        ' WHERE (nodename=All_MINT) AND All_MINT.Usage.View.current="$viewName$" AND ' + CONTEXT_SEARCH +
        ' BY All_MINT.currentView' +
        ' | eventstats sum(Volume) AS TotalCount' +
        ' | eval ViewFreq=round((Volume/TotalCount)*100, 2)' +
        ' | appendcols' +
        ' [| tstats count as CountBySpan FROM datamodel=MINT' +
        ' WHERE (nodename=All_MINT) AND All_MINT.Usage.View.current="$viewName$" AND ' + CONTEXT_SEARCH +
        ' BY All_MINT.currentView, _time ' + SPAN_SETTING +
        ' | stats sparkline(sum(CountBySpan)) AS Trend by All_MINT.currentView]' +
        ' | rename All_MINT.currentView as View' +
        ' | eval  "Load time (ms)"=round(Duration, 2)' +
        ' | table View, Uniques, Volume, "Load time (ms)", ViewFreq, Trend' +
        ' | rename Uniques as "Users"' +
        ' | rename Volume as "Occurrences"' +
        ' | rename ViewFreq as "% of total occurrences"' +
        ' | sort - "Users"' +
        ' | fields - "$fieldRemove$"';


    var TOP_VIEWS_CHART =
        ' | tstats avg(All_MINT.Usage.View.loadTime) as duration' +
        ' FROM datamodel=MINT WHERE (nodename=All_MINT.Usage.View)  AND ' + CONTEXT_SEARCH +
        ' AND All_MINT.Usage.View.current="$viewName$"' +
        ' BY _time ' + SPAN_SETTING +
        ' | timechart avg(duration) as Duration' +
        ' | rename Duration as "Avg load time (ms)"';


    // var SINGLE_LOAD_TIME = ' | tstats avg(All_MINT.Usage.View.loadTime) as duration FROM datamodel=MINT WHERE (nodename=All_MINT.Usage.View)  AND ' + CONTEXT_SEARCH + ' | eval duration=round(duration, 0)';

    return BaseView.extend({
        template: ViewsTemplate,
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
                        
            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('viewName', '*');
            this.tokensIncludelist = TOKENS_INCLUDELIST;


            this.tokens.set('fieldRemove', ' ');
            this.searches = {};

            this.searches.topViewsTableSearch = new SearchManager({
                id: 'top-views-table-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: TOP_VIEWS_TABLE
            }, {tokens: true});

            this.searches.topViewsChartSearch = new SearchManager({
                id: 'top-views-chart-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: TOP_VIEWS_CHART
            }, {tokens: true});

            // Duration single query
            //this.searches.durationSingleSearch = new SearchManager({
            //    id: 'duration-single',
            //    earliest_time: "$filters.earliest$",
            //    latest_time: "$filters.latest$",
            //    search: SINGLE_LOAD_TIME
            //}, {tokens: true});

            this.children.topViewsTableView = new TableView({
                id: "top-views-table",
                managerid: "top-views-table-search",
                classicUrl: this.model.classicUrl,
                pageSize: "10",
                drilldown: "row",
                drilldownRedirect: false
            });

            this.children.topViewsTableView.on('table:drilldown', this.onDrilldown, this);

            this.searches.topViewsTableSearch.on('change', function(){
                this.children.topViewsTableView.paginator.settings.set('page', 0);
            }.bind(this));

            this.children.topViewsChartView = new ChartView({
                id: "top-views-chart",
                managerid: "top-views-chart-search",
                title: "Latency (ms)",
                drilldown: "none",
                height: "220px",
                classicUrl: this.model.classicUrl,
                data: "results",
                output_mode: "json",
                multiSeries: true,
                chartOptions: {
                    colors: ['#20b5cb', '#1695a9', '#34c0d6', '#6fc7ae', '#9fd390', '#e6cd24',
                        '#e6ad24', '#ed5a53', '#ea4854', '#c33f5e', '#a4226f'],
                    chart: {
                        type: 'areaspline',
                        marginTop: 15
                    },
                    legend: {
                        align: 'right',
                        enabled: false,
                        verticalAlign: 'middle',
                        layout: 'vertical',
                        x: 0,
                        y: 0
                    },
                    exporting: {
                        enabled: false
                    }
                }
            });


            // this.children.durationAvgSingle = new MintSingleView({
            //     id: "duration-single-avg",
            //     managerid: 'duration-single',
            //     data: 'results',
            //     afterLabel: 'ms'
            // });

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
                title: "Views",
                breadcrumbs: ["viewName"],
                defaultValues: {
                    viewName: '*'
                }
            });
            
        },

        tokenEvents: {
            "change:viewName": 'onChangeViewName'
        },

        onDrilldown: function (e) {
            var tableValue = e.data["click.value"],
                classicUrl = this.model.classicUrl;

            e.preventDefault();

             if (this.tokens.get('viewName') != '*' ) {
                var url = "search?q=tag=mint sourcetype=\"mint:view\" current=\"" + tableValue + "\"";
                splunkjs_utils.redirect(url);
            } else {
                classicUrl.save({viewName: tableValue});
            }
            
            
        },

        onChangeViewName: function (model, value) {
            if (value !== "*") {
                // this.children.topViewsTableView.settings.set('drilldown', 'none');
                // Remove redundant '% of total occurrences' column, it will always be 100 here
                this.tokens.set('fieldRemove', '% of total occurrences');
            } else {
                // this.children.topViewsTableView.settings.set('drilldown', 'row');
                // Put back '% of total occurrences column', we need it for top level views
                this.tokens.set('fieldRemove', ' ');
            }
            
        },

        render: function () {
            // Before rendering, force the changeViewName event just to enforce the drilldown settings
            // or removed column settings in case the user refreshes from inside the drilldown. If the
            // user refreshes inside the drilldown without this line, the viewName won't undergo a 
            // change event, which means the default, top-level drilldown and column settings will show.
            this.onChangeViewName(this.model, this.model.classicUrl.get('viewName'));
            
            this.$el.html(this.compiledTemplate({}));
            this.$(".normal .table").append(this.children.topViewsTableView.render().el);
            this.$(".normal .big-graph").append(this.children.topViewsChartView.render().el);
            //this.$("#loadtime-avg").append(this.children.durationAvgSingle.render().el);
            this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);
            this.$('.FiltersRight').append(this.children.filtersView.render().el);
            
            return this;
        }
    });
});
