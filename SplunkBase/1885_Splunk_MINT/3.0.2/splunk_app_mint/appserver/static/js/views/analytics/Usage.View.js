define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/analytics/usage.template.html",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintSingleDisplay.View",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "./Usage.View.pcss"
], function(
    $,
    _,
    Backbone,
    BaseView,
    FiltersView,
    AnalyticsUsageTemplate,
    ChartView,
    MintSingleView,
    mvc,
    SearchManager
){

    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    var UNIQUES_USERS =
        ' | tstats dc(All_MINT.uuid) as "Unique users" FROM datamodel=MINT' +
        ' WHERE (nodename=All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH;

    var UNIQUES_USERS_CHART =
        ' | tstats dc(All_MINT.uuid) as uniques FROM datamodel=MINT' +
        ' WHERE (nodename=All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH + ' BY _time ' + SPAN_SETTING +
        ' | timechart ' + SPAN_SETTING + ' values(uniques) as "Unique users"';

    var AFFECTED_USERS =
        ' | tstats dc(All_MINT.uuid) as "Affected users" FROM datamodel=MINT' +
        ' WHERE nodename=All_MINT.Performance.Errors AND ' + CONTEXT_SEARCH;

    var AFFECTED_USERS_CHART =
        ' | tstats dc(All_MINT.uuid) as affected FROM datamodel=MINT' +
        ' WHERE (nodename=All_MINT.Performance.Errors) AND ' + CONTEXT_SEARCH + ' BY _time ' + SPAN_SETTING +
        ' | timechart ' + SPAN_SETTING + ' values(affected) as "Affected users"';

    var SESSIONS =
        ' | tstats count as "Sessions" FROM datamodel=MINT' +
        ' WHERE (nodename = All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH;

    var SESSIONS_CHART =
        ' | tstats count as sessions from datamodel=MINT where (nodename = All_MINT.Usage.Session.Pings) ' +
        '   AND ' + CONTEXT_SEARCH + ' BY _time ' + SPAN_SETTING +
        ' | timechart ' + SPAN_SETTING + ' sum(sessions) as "Sessions"';

    var ERROR_RATE =
        ' | tstats count as count FROM datamodel=MINT' +
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
        ' | fields "Crash Rate"' ;
    
    var ERROR_RATE_CHART =
        ' | tstats count as count FROM datamodel=MINT' +
        ' WHERE ((All_MINT.Performance.Errors.handled=false) OR (nodename=All_MINT.Usage.Session.Pings))' +
        ' AND ' + CONTEXT_SEARCH + ' BY nodename, _time '+ SPAN_SETTING +
        ' | search nodename=All_MINT.Performance.Errors OR nodename=All_MINT.Usage.Session.Pings' +
        ' | eval type=if(nodename="All_MINT.Usage.Session.Pings", "Pings", "Errors")' +
        ' | eval errors=if(nodename == "All_MINT.Performance.Errors", count, 0)' +
        ' | eval pings=if(nodename == "All_MINT.Usage.Session.Pings", count, 0)' +
        ' | eventstats sum(errors) AS Errors by _time' +
        ' | eventstats sum(pings) AS Pings by _time | eval percent=round((Errors/Pings)*100,2) | where type="Errors"'+
        ' | timechart ' + SPAN_SETTING + ' first(percent) as "Error rate"' +
        ' | fillNull value=0';

    var SESSION_LENGTH =
        ' | tstats avg("All_MINT.Usage.Session.Gnips.ses_duration") as ses_duration FROM datamodel=MINT' +
        ' WHERE (nodename = All_MINT.Usage.Session.Gnips) AND ' + CONTEXT_SEARCH +
        ' | eval ses_duration=tostring(round(ses_duration/1000,0),"duration")' +
        ' | rename ses_duration as "Session duration"';

    var SESSIONS_LENTH_CHART =
        ' | tstats avg("All_MINT.Usage.Session.Gnips.ses_duration") as ses_duration FROM datamodel=MINT' +
        ' WHERE (nodename = All_MINT.Usage.Session.Gnips) AND' + CONTEXT_SEARCH + ' BY _time ' + SPAN_SETTING +
        ' | eval ses_duration_value=round(ses_duration, 0)' +
        ' | eval ses_duration_label=tostring(round(ses_duration/1000,0),"duration") ' +
        ' | timechart first(ses_duration_value) as value first(ses_duration_label) as label ' + SPAN_SETTING;

    var SESSIONS_PER_USER =
        ' | tstats count as count FROM datamodel=MINT' +
        ' WHERE (nodename = All_MINT.Usage.Session.Pings) AND ' + CONTEXT_SEARCH + ' BY All_MINT.uuid' +
        ' | stats avg(count) as spu' +
        ' | eval spu=round(spu,2)' +
        ' | rename spu as "Session per user"';

    var SESSIONS_PER_USER_CHART =
        ' | tstats count as count FROM datamodel=MINT' +
        ' WHERE (nodename = All_MINT.Usage.Session.Pings) AND' + CONTEXT_SEARCH + ' BY All_MINT.uuid, _time '+ SPAN_SETTING +
        ' | timechart ' + SPAN_SETTING + ' eval(round(avg(count),2)) as "Session per user"';

    // Include List of tokens to be peristed in classicUrl
    var TOKENS_INCLUDELIST = ['topContext'];

    var topViewsMap = [
        {title: "Unique users", id: "unique-users-single", token: "uniqueUsers", rowType: "int", durationResult: false, percentageResult: false, color: "#00b2ba", search: UNIQUES_USERS_CHART},
        {title: "Affected users", id: "affected-users-single", token: "affectedUsers", rowType: "int", durationResult: false, percentageResult: false, color: "#fab440", search: AFFECTED_USERS_CHART},
        {title: "Sessions", id: "sessions-single", token: "sessions", rowType: "int", durationResult: false, percentageResult: false, color: "#0f4e7a", search: SESSIONS_CHART},
        {title: "Crash rate (%)", id: "error-rate-single", token: "crashRate", rowType: "float", durationResult: false, percentageResult: true, color: "#df4039", search: ERROR_RATE_CHART},
        {title: "Sessions length", id: "sessions-length-single", token: "sessionLength", rowType: "date", durationResult: true, percentageResult: false, color: "#0f4e7a", search: SESSIONS_LENTH_CHART},
        {title: "Sessions per user", id: "sessions-per-user-single", token: "sessionPerUser", rowType: "float", durationResult: false, percentageResult: false, color: "#0f4e7a", search: SESSIONS_PER_USER_CHART}
    ];

    return BaseView.extend({
        template: AnalyticsUsageTemplate,
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            var defaults = {
                topContext: "uniqueUsers",
            };
            _.defaults(this.options, defaults);

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('topContext', this.options.topContext);
            this.tokensIncludelist = TOKENS_INCLUDELIST;

            this.searches = {};
            this.activeTile = null;
            this.tiles = new Backbone.Collection(topViewsMap);

            this.searches.unique_users = new SearchManager({
                id: 'unique-users',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  UNIQUES_USERS
            }, {tokens: true});

            this.searches.affected_users = new SearchManager({
                id: 'affected-users',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  AFFECTED_USERS,
            }, {tokens: true});

            this.searches.sessions = new SearchManager({
                id: 'sessions',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  SESSIONS,
            }, {tokens: true});

            this.searches.error_rate = new SearchManager({
                id: 'error_rate',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  ERROR_RATE,
            }, {tokens: true});

            this.searches.sessions_length = new SearchManager({
                id: 'sessions_length',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  SESSION_LENGTH,
            }, {tokens: true});

            this.searches.sessions_per_user = new SearchManager({
                id: 'sessions_per_user',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  SESSIONS_PER_USER,
            }, {tokens: true});

            this.searches.main_chart = new SearchManager({
                id: 'chart-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search:  UNIQUES_USERS_CHART,
            }, {tokens: true});


            this.children.unique_users =  new MintSingleView({
                id: "unique-users-single-value",
                managerid: "unique-users",
                data: "results"
            });

            this.children.affected_users =  new MintSingleView({
                id: "affected-users-single",
                managerid: "affected-users",
                data: "results"
            });

            this.children.sessions =  new MintSingleView({
                id: "sessions-single",
                managerid: "sessions",
                data: "results"
            });

            this.children.error_rate =  new MintSingleView({
                id: "error-rate-single",
                managerid: "error_rate",
                data: "results"
            });

            this.children.sessions_length =  new MintSingleView({
                id: "sessions-length-single",
                managerid: "sessions_length",
                data: "results"
            });

            this.children.sessions_per_user =  new MintSingleView({
                id: "sessions-per-user-single",
                managerid: "sessions_per_user",
                data: "results"
            });

            this.children.main_chart = new ChartView({
                id: "main-chart",
                managerid: "chart-search",
                title: "Unique users",
                classicUrl: this.model.classicUrl,
                chartOptions: {
                    plotOptions: {
                        areaspline: {
                            color: "#00b2ba"
                        }
                    },
                    yAxis: {
                        type: "datetime"
                    }
                }
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

        tokenEvents: {
            'change:topContext': 'onChangeTopContext'
        },

        onChangeTopContext: function () {
            var topContext = this.tokens.get('topContext');
            //Create a PartyJS event on change of tabs
            if(Mint.getOption('apiKey') !== undefined){
                Mint.logEvent("Analytics Usage Tab: " + topContext);
            }
            if ( !this.activeTile ) {
                this.activeTile = this.tiles.findWhere({token: topContext});
            }
            this.activeTile.set({active: true});
            this.children.main_chart.options.title = this.activeTile.get('title');
        },

        onClicked: function(event){
            var mainChart = this.children.main_chart,
                chartOptions = mainChart.options.chartOptions,
                $el = $(event.currentTarget),
                id = $el.children('p')[0].id;

            this.$('.PopTiles .active').removeClass('active');
            this.activeTile.set({active: false});
            this.activeTile = this.tiles.findWhere({id: id});
            $el.addClass('active');

            this.tokens.set('topContext', this.activeTile.get('token'));

            chartOptions.plotOptions.areaspline.color = this.activeTile.get('color');
            mainChart.options.title = this.activeTile.get('title');
            mainChart.options.rowType = this.activeTile.get('rowType');
            mainChart.options.percentageResult = this.activeTile.get('percentageResult');
            mainChart.options.durationResult = this.activeTile.get('durationResult');
            this.searches.main_chart.settings.set("search", mvc.tokenSafe(this.activeTile.get('search')));
        },

        render: function(){
            this.$el.html(this.compiledTemplate({}));

            this.$("#unique-users-single").html(this.children.unique_users.render().el);

            this.$("#affected-users-single").html(this.children.affected_users.render().el);

            this.$("#sessions-single").html(this.children.sessions.render().el);

            this.$("#error-rate-single").html(this.children.error_rate.render().el);

            this.$("#sessions-length-single").html(this.children.sessions_length.render().el);

            this.$("#sessions-per-user-single").html(this.children.sessions_per_user.render().el);

            this.$(".BigGraph").append(this.children.main_chart.render().el);

            this.$('.FiltersRight').append(this.children.filtersView.render().el);

            this.onChangeTopContext();

            return this;
        }

    }, {
        TokenIncludelist: TOKENS_INCLUDELIST
    });

});


