define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    'app/views/home/ProjectStats.View',
    'app/views/home/Settings.View',
    "app/contrib/text!app/templates/home/home.template.html",
    "splunkjs/mvc/savedsearchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc",
    "views/shared/FlashMessages",
    "util/splunkd_utils",
    "splunk.util",
    "app/views/home/SideBar.View",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/dropdownview",
    "splunkjs/mvc/timerangeview",
    "./Home.View.pcss"
], function (
    $,
    _,
    Backbone,
    BaseView,
    ProjectStatsView,
    SettingsView,
    HomeTemplate,
    SavedSearchManager,
    PostProcessManager,
    mvc,
    FlashMessagesView,
    splunkd_utils,
    splunk_utils,
    SideBarView,
    SearchManager,
    DropdownView,
    TimeRangeView
) {

    // custom fetch condition to be used when creating ResultsModel.
    // the following is similar to ResultsModel.defaultCondition
    // except it returns true when job completes forcing an eventual fetch
    var resultsModelFetchCondition = function (manager) {
        var props = manager.get('data') || {},
            isDone = props.isDone;

        return isDone;
    };

    var latestEventTimeQuery = '| tstats count from datamodel=MINT by _time span=1s | sort limit=1 - _time | fields - count';

    var latestIosSDKVersionQuery = 'tag=mint platform=iOS sourcetype=mint:ping | sort limit=1 - sdkVersion | table sdkVersion';

    var latestAndroidSDKVersionQuery = 'tag=mint platform=Android sourcetype=mint:ping | sort limit=1 - sdkVersion | table sdkVersion';

    var envFilterQuery = '| tstats values(All_MINT.appEnvironment) as environment FROM datamodel=MINT' +
            ' WHERE (nodename = All_MINT) | mvexpand environment';

    var kpisQuery = '| tstats  dc(All_MINT.uuid) as uniques count as sessions avg(All_MINT.Performance.Network_Monitoring.latency) as latency FROM datamodel=MINT WHERE All_MINT.appEnvironment="$environment$" nodename=All_MINT.Usage.Session.Pings OR All_MINT.Performance.Errors.handled=false OR All_MINT.Performance.Network_Monitoring.statusCode > 0 BY nodename, All_MINT.packageName |eventstats values(latency) as latency by All_MINT.packageName |search nodename=All_MINT.Performance.Errors OR nodename=All_MINT.Usage.Session.Pings | eval type=if(nodename="All_MINT.Usage.Session.Pings", "Pings", "Errors") | eval errors=if(nodename == "All_MINT.Performance.Errors", sessions, 0) | eval pings=if(nodename == "All_MINT.Usage.Session.Pings", sessions, 0) | eventstats sum(errors) AS error_volume sum(pings) as pings_volume by All_MINT.packageName  | fields - errors, pings, type | eval error_rate=round((error_volume/pings_volume*100), 2)  | fields - error_volume, pings_volume , sessions | search nodename = All_MINT.Usage.Session.Pings  | fields - nodename | eval latency=round(latency,2)';

    // Include List of tokens to be peristed in classicUrl.
    var TOKENS_INCLUDELIST = ['earliest', 'latest'];

    return BaseView.extend({
        template: HomeTemplate,
        /**
         * @param {Object} options {
        *    model: {
        *        application: <models/shared/Application>,
        *        classicUrl: <models/classicurl>,
        *        token: <app/models/CDSToken.Model>
        *    },
        *    collection: {
        *        projects: <app/collections/Project.Collection>,
        *    },
        *    deferreds: {
        *        projects: <$.Deferred>
        *    },
        *    controllers: {
        *        projects: <app/controllers/Projects.Controller>
        *    },
        *    isAdminUser: <function> handler to determine if user is of admin role
        * }
         */
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // explicitly set default earliest time in the absence of Filters
            var defaults = {
                earliestTime: '-7d@d',
                latestTime: 'now',
                appEnvironment: '*'
            };
            _.defaults(this.options, defaults);

            //Set up the model for PartyJS
            this.children.settingsView = new SettingsView({
                model: {
                    app: this.model.application.get('app'),
                    owner: this.model.application.get("owner")
                }
            });

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('earliest', this.options.earliestTime);
            this.tokens.set('latest', this.options.latestTime);
            this.tokens.set('environment', this.options.appEnvironment);

            this.tokensIncludelist = TOKENS_INCLUDELIST;


            // keep track of searches and associated results
            this.searches = {};
            this.results = {};

            //Environment filter search
            this.searches.envFilter = new SearchManager({
                id: 'env-filter',
                earliest_time: mvc.tokenSafe("$earliest$"),
                latest_time: mvc.tokenSafe("$latest$"),
                search: envFilterQuery
            });

            this.searches.latestEvent = new SearchManager({
                id: 'latest-event',
                earliest_time: '-48h@h',
                latest_time: 'now',
                search: latestEventTimeQuery
            });

            this.searches.latestIosSdkVersion = new SearchManager({
                id: 'latest-ios',
                earliest_time: '-48h@h',
                latest_time: 'now',
                search: latestIosSDKVersionQuery
            });

            this.searches.latestAndroidSdkVersion = new SearchManager({
                id: 'latest-android',
                earliest_time: '-48h@h',
                latest_time: 'now',
                search: latestAndroidSDKVersionQuery
            });

            // main search to get stats per package
            this.searches.statsByPackageSearch = new SearchManager({
                id: 'stats-by-package-search',
                earliest_time: mvc.tokenSafe("$earliest$"),
                latest_time: mvc.tokenSafe("$latest$"),
                search: kpisQuery,
                autostart: true,
                preview: true,
                app: this.model.application.get('app'),
                owner: this.model.application.get('owner')
            }, {tokens: true});

            //Environment filter view
            this.children.envFilter = new DropdownView({
                id: "env-filter-view",
                managerid: 'env-filter',
                labelField: 'Environment',
                value: mvc.tokenSafe("$environment$"),
                valueField: 'environment',
                showClearButton: false,
                default: 'All',
                choices: [
                    {"label": "All", "value": "*"}
                ]
            });

            //Time range filter view
            this.children.timeRangeView = new TimeRangeView({
                id: "timerange-picker",
                managerid: null,
                earliest_time: mvc.tokenSafe("$earliest$"),
                latest_time: mvc.tokenSafe("$latest$"),
                dialogOptions: {
                    showPresetsRealTime: false,
                    showCustomRealTime: false,
                    enableCustomAdvancedRealTime: false
                }
            });

            this.children.latestEvent = new SideBarView({
                id: "latest-event-view",
                managerid: 'latest-event',
                data: 'results',
                view_type: 'last_event',
                html: "<h3>Most recent event</h3><p><%- results %> ago</p>"
            });

            this.children.androidVersionView = new SideBarView({
                id: "latest-android-view",
                managerid: 'latest-android',
                data: 'results',
                view_type: 'android',
                html: "<h3>Android</h3><p><%- results %></p>"
            });

            this.children.iOSVersionView = new SideBarView({
                id: "latest-ios-view",
                managerid: 'latest-ios',
                data: 'results',
                view_type: 'ios',
                html: "<h3>iOS</h3><p><%- results %></p>"
            });


            this.results.statsByPackageSearch = this.searches.statsByPackageSearch.data('results');
            this.listenTo(this.collection.projects, 'reset', function () {
                if (this.collection.projects.previousModels) {
                    this.collection.projects.previousModels.each(function (previousProject) {
                        this.cancelProjectSearch(previousProject);
                        this.removeProjectTile(previousProject);
                    }, this);
                }
                this.collection.projects.each(function (project) {
                    this.setupProjectSearch(project);
                    this.addProjectTile(project);
                }, this);
            });
            this.listenTo(this.collection.projects, 'add', function (project) {
                this.setupProjectSearch(project);
                this.addProjectTile(project);
            });
            this.listenTo(this.collection.projects, 'remove', function (project) {
                this.cancelProjectSearch(project);
                this.removeProjectTile(project);
            });
            this.listenTo(this.collection.projects, 'change', function (project) {
                var id = project.id,
                    projectSearchString = project.genSearchString('All_MINT.packageName'),
                    projectToken = 'project-' + project.cid;
                // update project search token which will re-trigger project stats search
                this.tokens.set(projectToken, projectSearchString);
                // update project tile
                this.children[id].render();
            });
        },
        events: {
            'click a.add-project': function (e) {
                e.preventDefault();
                //Creating a PartyJS transaction for adding new projects
                if(Mint.getOption('apiKey') !== undefined){
                    Mint.transactionStart("New project creation");
                }
                this.controllers.projects.addProject();
            },
            'click a.mint-settings': function (e) {
                e.preventDefault();
                this.children.settingsView.activate().render().show();
            }
        },
        /*
         * Setup project post-processing search based on main search.
         * Also setup search results model, and associated listener
         */
        setupProjectSearch: function (project) {
            var id = project.id,
                projectSearchString = project.genSearchString('All_MINT.packageName'),
                projectToken = 'project-' + project.cid;

            this.tokens.set(projectToken, projectSearchString);

            // dedicate in-memory model for project stats
            this.model[id] = new Backbone.Model();
            this.clearProjectStatsModel(this.model[id]);

            // post-process search to aggregate stats per project
            this.searches[id] = new PostProcessManager({
                id: id,
                managerid: 'stats-by-package-search',
                search: 'search ' + '$' + projectToken + '$' +
                ' | stats sum(uniques) as uniques avg(latency) as latency avg(error_rate) as error_rate' +
                ' | eval error_rate=round(error_rate,2)' +
                ' | eval latency=round(latency,2)'
            }, {tokens: true});

            // listen to data on results model
            // NOTE: pass custom condition equivalent to ResultsModel.defaultCondition
            // except it also returns true when job completes forcing an eventual fetch
            this.results[id] = this.searches[id].data('results', {
                condition: resultsModelFetchCondition
            });

            this.results[id].on('data', function (id) {
                var resultsModel = this.results[id],
                    results, row, attrs = {};

                if (!resultsModel.hasData()) {
                    this.setInvalidProjectStatsModel(this.model[id]);
                    return;
                }

                results = resultsModel.data();
                row = results.rows[0];

                _.each(results.fields, function (field, idx) {
                    attrs[field] = row[idx];
                });

                // In case there are no network DTOs, check if latency isn't included in results & attrs.
                if (attrs.latency === undefined) {
                    attrs.latency = null;
                }

                // DEBUG ONLY
                //window.attrs = attrs;

                // set project stats
                this.model[id].set(attrs);

                // DEBUG ONLY
                //window.values = this.model[id];

            }.bind(this, id), this);

            // TODO: Add timeout handler
            this.searches[id].startSearch();
        },
        cancelProjectSearch: function (project) {
            var id = project.id;
            // cancel outstanding search and listeners
            // TODO: PostProcessManager does not implement cancel method
            // which ideally should cancel the job itself
            this.searches[id].dispose();
            this.results[id].off(null, null, this);
            delete this.searches[id];
            delete this.results[id];
        },
        // TODO: refactor helper methods by moving them into new ProjectStats Model
        clearProjectStatsModel: function (projectStats) {
            projectStats.set({
                uniques: '',
                error_rate: '',
                latency: ''
            });
        },
        setInvalidProjectStatsModel: function (projectStats) {
            projectStats.set({
                uniques: null,
                error_rate: null,
                latency: null
            });
        },
        addProjectTile: function (project) {
            var id = project.id;
            this.children[id] = new ProjectStatsView({
                model: {
                    application: this.model.application,
                    project: project,
                    projectStats: this.model[id],
                    classicUrl: this.model.classicUrl
                },
                controllers: {
                    projects: this.controllers.projects
                }
            });
            this.$('.dashboard-row').append(this.children[id].render().el);
        },
        removeProjectTile: function (project) {
            var id = project.id;
            this.children[id].remove();
            delete this.children[id];
        },
        render: function () {
            this.$el.html(this.compiledTemplate({}));

            this.$("#env-filter").append(this.children.envFilter.render().el);
            this.$("#timerange-filter").append(this.children.timeRangeView.render().el);
            this.collection.projects.each(this.addProjectTile, this);

            if (!this.options.isAdminUser()) {
                this.$('a.mint-settings').remove();
                this.$('a.add-project').remove();
            }
            this.$('#last-event-holder').append(this.children.latestEvent.render().el);
            this.$('#android').append(this.children.androidVersionView.render().el);
            this.$('#ios').append(this.children.iOSVersionView.render().el);

            return this;
        }
    }, {
        TokenIncludelist: TOKENS_INCLUDELIST
    });
});
