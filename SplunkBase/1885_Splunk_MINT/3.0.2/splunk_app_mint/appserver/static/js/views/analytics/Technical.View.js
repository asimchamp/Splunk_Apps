define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/analytics/technical.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/MintTop.View",
    "./Technical.View.pcss"
], function(
    $,
    _,
    Backbone,
    BaseView,
    FiltersView,
    AnalyticsTechnicalTemplate,
    mvc,
    SearchManager,
    ChartView,
    TableView,
    TopView
){

    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    // Include List of tokens to be peristed in classicUrl
    var TOKENS_INCLUDELIST = ['topContext'];

    // SEARCHES go here!
    var TOP_VERSION = function(name) {
        return '' +
        ' | tstats dc(All_MINT.uuid) as Uniques  FROM datamodel=MINT' +
        ' WHERE (nodename = All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH + ' by All_MINT.' + name +
        ' | eventstats sum(Uniques) as total | eval percent=(Uniques/total)*100' +
        ' | eval percent=round(percent,2)' +
        ' | sort - Uniques limit=1' +
        ' | fields - Uniques, total';
    };

    var CHART =
        ' | tstats dc(All_MINT.uuid) as uniques FROM datamodel=MINT' +
        ' WHERE (nodename = All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH + ' by All_MINT.$topContext$, _time ' + SPAN_SETTING +
        ' | timechart ' + SPAN_SETTING + ' values(uniques) by All_MINT.$topContext$ where max in top5, otherstr=Other';

    var VERSIONS =
        ' | tstats dc(All_MINT.uuid) as Uniques count as count  FROM datamodel=MINT' +
        ' WHERE (All_MINT.Performance.Errors.handled=false OR nodename = All_MINT.Usage.Session.Pings)' +
        ' AND ' + CONTEXT_SEARCH + '  by All_MINT.$topContext$ , nodename' +
        ' | search (nodename = All_MINT.Performance.Errors OR nodename = All_MINT.Usage.Session.Pings)'+
        ' | rename All_MINT.$topContext$ AS Name' +
        ' | eventstats sum(count) AS total_by_name by Name' +
        ' | eval errors=if(nodename == "All_MINT.Performance.Errors", count, 0)' +
        ' | eval pings=if(nodename == "All_MINT.Usage.Session.Pings", count, 0)' +
        ' | eventstats sum(errors) AS Errors by Name' +
        ' | eventstats sum(pings) AS Pings by Name' +
        ' | fields - errors, pings' +
        ' | search nodename = All_MINT.Usage.Session.Pings' +

        ' | eventstats sum(Uniques) AS total_uniques' +

        ' | eval "Crash Rate"=round((Errors/Pings)*100, 2)' +
        ' | fields - errors,Errors,Pings,nodename' +
        ' | eventstats sum(count) AS total_pings' +
        ' | eval Usage=round((Uniques/total_uniques)*100,2)' +
        ' | fields - total_pings, total_by_name, total_uniques' +
        ' | rename count AS Sessions, Name as "$topContextName$" Uniques as Users, Usage as "Users (%)", "Crash Rate" as "Crash Rate (%)"' +
        ' | table "$topContextName$", Sessions, Users, "Users (%)", "Crash Rate (%)"' +
        ' | sort - Sessions';

    var CustomSparkLineCell = TableView.BaseCellRenderer.extend({
        canRender: function(cellData) {
            return cellData.field === 'Usage';
        },
        template: _.template('<td class="nbar"><a href="#" title="" class="tip"><span style="width: <%- usage %>%;"></span></a><span class="usage"><%- usage %>%</span></td>'),
        round: function(price, digits){
            var accuracy;

            digits = !_.isUndefined(digits) ? digits : 2;
            accuracy = Math.pow(10, digits);

            if(_.isNaN(price)) return 0;

            return (Math.round(price * accuracy)) / accuracy;
        },
        render: function($td, cellData) {
            $td.addClass('icon').html(this.template({
                usage: this.round(cellData.value, 2)
            }));
        }
    });

    /* Definition names for top children views */
    var topViewsMap = [
        {name: "app-version", id: "top_app_version", token: "appVersionName", title: "App Versions", subtitle: "Top app version"},
        {name: "os-version", id: "top_os_version", token: "osVersion", title: "OS Versions", subtitle: "Top OS version"},
        {name: "device", id: "top_device", token: "device", title: "Devices", subtitle: "Top device"},
        {name: "locale", id: "top_locale", token: "locale", title: "Locales", subtitle: "Top locale"},
        {name: "carrier", id: "top_carrier", token: "carrier", title: "Carriers", subtitle: "Top carrier"}
    ];

    return BaseView.extend({
        template: AnalyticsTechnicalTemplate,
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            var defaults = {
                topContext: "appVersionName",
                topContextName: "App Versions"
            };
            _.defaults(this.options, defaults);

            this.searches = {};
            this.activeTile = null;
            this.tiles = new Backbone.Collection(topViewsMap);

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('topContext', this.options.topContext);
            this.tokens.set('topContextName', this.options.topContext);
            this.tokensIncludelist = TOKENS_INCLUDELIST;

            this.activeTile = null;
            this.tiles = new Backbone.Collection(topViewsMap);

            /* Top Filter Views instantiation */
            _.each(this.tiles.models, this._instantiateViews, this);

            /* Main Table Views instantiation */
            this.searches.versions = new SearchManager({
                id: 'versions',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  VERSIONS,
            }, {tokens: true});

            this.children.main_table = new TableView({
                id: "main-table",
                managerid: "versions",
                type: "area",
                drilldown: "none",
                drilldownRedirect: false,
                title: "Unique users",
                height: "220px",
                classicUrl: this.model.classicUrl,
                data: "results"
            });

            this.children.main_table.addCellRenderer(new CustomSparkLineCell());

            this.searches.versions.on('change', function(){
                this.children.main_table.paginator.settings.set('page', 0);
            }.bind(this));

            /* Main Chart Views instantiation */

            this.searches.chart = new SearchManager({
                id: 'chart',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: CHART,
            }, {tokens: true});

            this.children.main_chart = new ChartView({
                id: "main-chart",
                managerid: "chart",
                type: "spline",
                drilldown: "none",
                title: "App Versions",
                height: "220px",
                classicUrl: this.model.classicUrl,
                output_mode: "json",
                multiSeries: true,
                chartOptions: {
                    chart: {
                        type: 'spline',
                        marginTop: 40,
                    },
                    colors: ['#20b5cb', '#8bd2ce', '#246985', '#18495d', '#d3e269', '#80b959', '#FFD248',
                        '#efa511', '#4b538b', '#994151', '#BE92B5'],
                        legend: {
                            x: 0,
                            y: -15,
                            enabled:true,
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0,
                            floating: false
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
        },

        events: {
            'click .PopTiles a': 'onClicked'
        },

        onClicked: function(event){
            var $el = $(event.currentTarget),
                id = $el.children()[0].id;

            this.$('.PopTiles .active').removeClass('active');
            this.activeTile.set({active: false});
            this.activeTile = this.tiles.findWhere({id: id});
            this.model.classicUrl.save({topContext: this.activeTile.get('token')});
        },

        /* Instantiate similar views and search managers */
        _instantiateViews: function (model) {
            var search_id = 'top-'+model.get('name');

            this.searches[search_id] = new SearchManager({
                id: search_id,
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  TOP_VERSION(model.get('token')),
            }, {tokens: true});

            this.children[model.get('id')] =  new TopView({
                id: model.get('id'),
                model: model,
                managerid: "top-" + model.get('name'),
                title: model.get('title'),
                subtitle: model.get('subtitle'),
                data: "results"
            });
        },

        tokenEvents: {
            'change:topContext': 'onChangeTopContext'
        },

        onChangeTopContext: function () {
            var topContext = this.tokens.get('topContext');
            //Create a PartyJS event on change of tabs
            if(Mint.getOption('apiKey') !== undefined){
                Mint.logEvent("Analytics Technical Tab: " + topContext);
            }
            if ( !this.activeTile ) {
                this.activeTile = this.tiles.findWhere({token: topContext});
            }
            this.changeTopContextName(topContext);
            this.activeTile.set({active: true});
            this.children.main_chart.options.title = this.activeTile.get('title');
        },

        changeTopContextName: function(topContext) {
            var topView = _.findWhere(topViewsMap, {token: topContext});
            this.tokens.set('topContextName', topView.title);
        },

        render: function(){
            this.$el.html(this.compiledTemplate({}));

            this.$("#top_app_version").html(this.children.top_app_version.render().el);
            this.$("#top_os_version").html(this.children.top_os_version.render().el);
            this.$("#top_device").html(this.children.top_device.render().el);
            this.$("#top_locale").html(this.children.top_locale.render().el);
            this.$("#top_carrier").html(this.children.top_carrier.render().el);
            this.$(".BigGraph").html(this.children.main_chart.render().el);
            this.$('.Table').html(this.children.main_table.render().el);
            this.$('.FiltersRight').append(this.children.filtersView.render().el);

            this.onChangeTopContext();

            return this;
        }
    }, {
        TokenIncludelist: TOKENS_INCLUDELIST
    });
});

