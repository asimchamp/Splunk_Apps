define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/errors/errors.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "app/views/errors/Stacktrace.View",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintPercentage.View",
    "app/views/shared/MintBreadcrumbs.View",
    "app/views/shared/MintSingleDisplay.View",
    "splunk.util",
    'app/utils',
    "./Errors.View.pcss"
], function ($,
             _,
             Backbone,
             BaseView,
             FiltersView,
             ErrorsTemplate,
             mvc,
             SearchManager,
             splunkjs_utils,
             TokenUtils,
             StacktraceView,
             TableView,
             ChartView,
             PercentageView,
             BreadCrumbsView,
             MintSingleView,
             splunkUtils,
             utils) {
    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    // Include List of tokens to be peristed in classicUrl.
    var TOKENS_INCLUDELIST = ['errorHash'];

    var PlatformIconCellRenderer = TableView.BaseCellRenderer.extend({
        canRender: function (cellData) {
            return cellData.field === 'Platform';
        },
        render: function ($td, cellData) {
            $td.addClass('text').html(_.template('<text><%- platform %></text>', {
                platform: cellData.value
            }));
        }
    });

    // Predicate test to check if error stacktrace can be symbolicated.
    // Returns true if non-Android platform AND not handled error AND where field has a hex address
    var canSymbolicate = function (platform, handled, where) {
        return (!utils.isAndroid(platform)) &&
            (!handled || !splunkUtils.normalizeBoolean(handled)) &&
            (!where || where.match(/0[xX][\da-f]+/i));
    };

    // Convert error event raw stacktrace field to array of lines
    var convertStacktraceRawToArray = function (stacktraceRaw) {
        var stacktrace = {};

        // Convert to array if needed
        if (_.isString(stacktraceRaw)) {
            stacktrace = stacktraceRaw.split('\n');
        } else if (!_.isArray(stacktraceRaw)) {
            _.each(stacktraceRaw, function (value, key) {
                stacktrace[key] = value.split('\n');
            });
        } else {
            stacktrace = stacktraceRaw;
        }

        return stacktrace;
    };

    return BaseView.extend({
            template: ErrorsTemplate,
            /**
             * @param {Object} options {
          *     model: {
          *         classicUrl: <models/classicurl>,
          *         project: <app/models/Project.Model>,
          *         symbolicatedStacktrace: <app/models/SymbolicatedStacktrace.Model>
          *     },
          *     deferreds: {
          *         errorEvent: <$.Deferred>
          *     }
          * }
             */
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);

                // reference to default token model
                this.tokens = mvc.Components.getInstance("default");

                this.tokensIncludelist = TOKENS_INCLUDELIST;

                // keep track of searches and associated results
                this.searches = {};
                this.results = {};
                this.drilldownSearches = {};

                this.collection.errors = new Backbone.Collection();

                // keep track of error stacktrace model behind stacktrace view
                this.model.stacktrace = new Backbone.Model();

                this.searches.errorsList = new SearchManager({
                    id: 'errors-list-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats dc(All_MINT.uuid) as UniqueUsers count as Occurrences last(All_MINT.platform) as Platform' +
                    ' max(_time) as LastOccurred last(All_MINT.Performance.Errors.message) as Error' +
                    ' last(All_MINT.Performance.Errors.where) as Location' +
                    ' FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Performance.Errors) AND ' + CONTEXT_SEARCH +
                    ' by All_MINT.Performance.Errors.errorHash' +
                    ' | eval LastOccurred=strftime(LastOccurred, "%d %b %Y %H:%M")' +
                    ' | appendcols' +
                    ' [| tstats count as TrendOccurrences FROM datamodel=MINT' +
                    '  WHERE (nodename=All_MINT.Performance.Errors) AND ' + CONTEXT_SEARCH +
                    '  by All_MINT.Performance.Errors.errorHash, _time ' + SPAN_SETTING +
                    '  | stats sparkline(sum(TrendOccurrences)) AS Trend by All_MINT.Performance.Errors.errorHash]' +
                    ' | rename All_MINT.Performance.Errors.errorHash as errorHash' +
                    ' | rename UniqueUsers as "Users"' +
                    ' | rename LastOccurred as "Last occurred"' +
                    ' | lookup symbolicatedStacktraceLookup _key as errorHash OUTPUT affected_method as LocationSym' +
                    ' | eval Location=coalesce(LocationSym,Location) | fields - LocationSym | replace "*0x*0x*" WITH "Unsymbolicated" IN Location'
                }, {tokens: true});

                this.results.errorsList = this.searches.errorsList.data('results', {output_mode: 'json'});

                this.searches.errorsChart = new SearchManager({
                    id: 'errors-chart-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as Errors FROM datamodel=MINT' +
                    ' WHERE (nodename = All_MINT.Performance.Errors) AND ' + CONTEXT_SEARCH +
                    ' BY _time ' + SPAN_SETTING +
                    ' | timechart ' + SPAN_SETTING + ' values(Errors) as Errors'
                }, {tokens: true});

                this.drilldownSearches.occurrencesChart = new SearchManager({
                    id: 'occurrences-graph-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as Occurrences' +
                    ' FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                    ' BY _time ' + SPAN_SETTING +
                    ' | timechart ' + SPAN_SETTING + ' values(Occurrences) as Occurrences '
                }, {tokens: true});

                this.drilldownSearches.affectedUsers = new SearchManager({
                    id: 'affected-users-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as Occurrences max(_time) as LastOccurred' +
                    ' FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                    ' by All_MINT.userIdentifier' +
                    ' | eval LastOccurred=strftime(LastOccurred, "%d %b %Y %H:%M")' +
                    ' | rename LastOccurred as "Last occurred"' +
                    ' | rename All_MINT.userIdentifier as "User ID"' +
                    ' | fields "User ID" "Last occurred" Occurrences'
                }, {tokens: true});

                this.drilldownSearches.occurences = new SearchManager({
                    id: 'occurences-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as occurrences' +
                    ' FROM datamodel=MINT WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH
                }, {tokens: true});

                this.drilldownSearches.affectedUsers = new SearchManager({
                    id: 'total-affected-users-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats dc(All_MINT.uuid) as UniqueUsers' +
                    ' FROM datamodel=MINT WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH
                }, {tokens: true});

                this.drilldownSearches.memoryUsage = new SearchManager({
                    id: 'memory-usage-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as occurrences' +
                    ' sum(All_MINT.Performance.Errors.memAppTotal) as memAppTotalSum' +
                    ' sum(All_MINT.Performance.Errors.memAppAvailable) as memAppAvailableSum' +
                    ' first(All_MINT.Performance.Errors.stacktrace) as STACKTRACE' +
                    ' FROM datamodel=MINT WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                    ' | eval memory = round((memAppTotalSum - memAppAvailableSum)/ occurrences,0)' +
                    ' | fields - occurrences memAppTotalSum memAppAvailableSum STACKTRACE'
                }, {tokens: true});

                this.drilldownSearches.network = new SearchManager({
                    id: 'aggregated-network-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as occurrences' +
                    ' FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                    ' by All_MINT.connection' +
                    ' | rename All_MINT.connection as connection' +
                    ' | eval type=if(connection="WIFI", "WiFi", "Cellular")' +
                    ' | eventstats sum(occurrences) as total' +
                    ' | eval percent=(occurrences/total)*100' +
                    ' | stats sum(percent) as Percent by type' +
                    ' | eval percent=round(Percent,2)' +
                    ' | fields - Percent'
                }, {tokens: true});

                // this.drilldownSearches.gps = new SearchManager({
                //     id: 'aggregated-gps-search',
                //     earliest_time: "$filters.earliest$",
                //     latest_time: "$filters.latest$",
                //     search:
                //         ' | tstats count as occurrences' +
                //         ' FROM datamodel=MINT' +
                //         ' WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                //         ' by All_MINT.gpsStatus' +
                //         ' | rename All_MINT.gpsStatus as gpsStatus' +
                //         ' | eval type=if(gpsStatus="ON", "GPS On", "GPS Off")' +
                //         ' | eventstats sum(occurrences) as total | eval percent=(occurrences/total)*100' +
                //         ' | where gpsStatus="ON" | fields type percent' +
                //         ' | appendpipe [ | eval type = "GPS Off" | eval percent = 100 - percent ]' +
                //         ' | eval percent=round(percent,2)'
                // }, {tokens: true});

                this.drilldownSearches.appVersion = new SearchManager({
                    id: 'aggregated-app-version-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as occurrences' +
                    ' FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                    ' by All_MINT.appVersionName' +
                    ' | eventstats sum(occurrences) as total | eval percent=(occurrences/total)*100' +
                    ' | fields - occurrences, total | sort - percent limit=3' +
                    ' | eventstats sum(percent) as top3_percent' +
                    ' | rename All_MINT.appVersionName as appVersionName' +
                    ' | appendpipe [ | eval appVersionName = "Others"' +
                    ' | eval percent = 100-top3_percent | dedup appVersionName ]' +
                    ' | fields - top3_percent | eval percent=round(percent,2)'
                }, {tokens: true});

                this.drilldownSearches.osVersion = new SearchManager({
                    id: 'aggregated-os-version-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as occurrences' +
                    ' FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                    ' by All_MINT.osVersion' +
                    ' | eventstats sum(occurrences) as total | eval percent=(occurrences/total)*100' +
                    ' | fields - occurrences, total | sort - percent limit=3' +
                    ' | eventstats sum(percent) as top3_percent' +
                    ' | rename All_MINT.osVersion as osVersionName' +
                    ' | appendpipe [ | eval osVersionName = "Others"' +
                    ' | eval percent = 100-top3_percent | dedup osVersionName ]' +
                    ' | fields - top3_percent | eval percent=round(percent,2)'
                }, {tokens: true});

                this.drilldownSearches.device = new SearchManager({
                    id: 'aggregated-device-search',
                    earliest_time: "$filters.earliest$",
                    latest_time: "$filters.latest$",
                    search: ' | tstats count as occurrences' +
                    ' FROM datamodel=MINT' +
                    ' WHERE (nodename=All_MINT.Performance.Errors) AND All_MINT.Performance.Errors.errorHash="$errorHash$" AND ' + CONTEXT_SEARCH +
                    ' by All_MINT.device' +
                    ' | eventstats sum(occurrences) as total | eval percent=(occurrences/total)*100' +
                    ' | fields - occurrences, total | sort - percent limit=3' +
                    ' | eventstats sum(percent) as top3_percent' +
                    ' | rename All_MINT.device as deviceName' +
                    ' | appendpipe [ | eval deviceName = "Others"' +
                    ' | eval percent = 100-top3_percent | dedup deviceName ]' +
                    ' | fields - top3_percent | eval percent=round(percent,2)'
                }, {tokens: true});

                this.children.errorsListView = new TableView({
                    id: "errors-list",
                    managerid: "errors-list-search",
                    classicUrl: this.model.classicUrl,
                    pageSize: "10",
                    drilldown: "row",
                    fields: ['Error', 'Platform', 'Occurrences', 'Users', 'Location', 'Last occurred', 'Trend'],
                    drilldownRedirect: false
                });

                this.children.errorsListView.addCellRenderer(new PlatformIconCellRenderer());

                this.searches.errorsList.on('change', function(){
                    this.children.errorsListView.paginator.settings.set('page', 0);
                }.bind(this));

                this.children.errorsChartView = new ChartView({
                    id: "errors-chart",
                    managerid: "errors-chart-search",
                    type: "line",
                    drilldown: "none",
                    height: "220px",
                    outputMode: "json",
                    title: "Occurrences",
                    classicUrl: this.model.classicUrl,
                    chartOptions: {
                        plotOptions: {
                            areaspline: {
                                color: "#d7293d"
                            }
                        }
                    },
                    data: "results",
                });

                this.children.occurrencesChartView = new ChartView({
                    id: "occurrences-chart",
                    managerid: "occurrences-graph-search",
                    type: "line",
                    drilldown: "none",
                    height: "220px",
                    outputMode: "json",
                    title: "Occurrences",
                    classicUrl: this.model.classicUrl,
                    chartOptions: {
                        plotOptions: {
                            areaspline: {
                                color: "#d7293d"
                            }
                        }
                    },
                    data: "results",
                });

                this.children.affectedUsersView = new TableView({
                    id: "affected-users",
                    managerid: "affected-users-search",
                    pageSize: "10",
                    drilldown: "row",
                    drilldownRedirect: false
                });

                this.drilldownSearches.affectedUsers.on('change', function(){
                    this.children.affectedUsersView.paginator.settings.set('page', 0);
                }.bind(this));

                this.children.stacktraceView = new StacktraceView({
                    model: {
                        errorEvent: this.model.errorEvent,
                        stacktrace: this.model.stacktrace,
                        symbolicatedStacktrace: this.model.symbolicatedStacktrace
                    }
                });

                this.children.totalOccurrencesView = new MintSingleView({
                    id: "total-occurrences",
                    managerid: 'occurences-search',
                    field: 'occurrences',
                    data: 'results'
                });

                this.children.totalAffectedUsersView = new MintSingleView({
                    id: "total-affected-users",
                    managerid: 'total-affected-users-search',
                    field: 'UniqueUsers',
                    data: 'results'
                });

                this.children.totalMemoryView = new MintSingleView({
                    id: "total-memory",
                    managerid: 'memory-usage-search',
                    field: 'memory',
                    afterLabel: 'MB',
                    data: 'results'
                });

                this.children.networkView = new PercentageView({
                    id: "aggregated-network",
                    managerid: 'aggregated-network-search',
                    data: 'results'
                });

                // this.children.gpsView = new PercentageView({
                //     id: "aggregated-gps",
                //     managerid: 'aggregated-gps-search',
                //     data: 'results'
                // });

                this.children.appVersionView = new PercentageView({
                    id: "aggregated-app-version",
                    managerid: 'aggregated-app-version-search',
                    data: 'results'
                });

                this.children.osVersionView = new PercentageView({
                    id: "aggregated-os-version",
                    managerid: 'aggregated-os-version-search',
                    data: 'results'
                });

                this.children.deviceView = new PercentageView({
                    id: "aggregated-device",
                    managerid: 'aggregated-device-search',
                    data: 'results'
                });

                this.children.breadCrumbsView = new BreadCrumbsView({
                    model: {
                        classicUrl: this.model.classicUrl
                    },
                    title: "Errors",
                    labelFormatter: function (self, errorHash) {
                        var label = errorHash,
                            errorItem;

                        // Format label based on currently selected errorEvent model
                        // If model is not ready, leverage the fetched errors collection
                        if (this.model.errorEvent.get('errorHash') === errorHash) {
                            label = this.model.errorEvent.get('message');
                        } else {
                            errorItem = this.collection.errors.findWhere({errorHash: errorHash});
                            if (errorItem) {
                                label = errorItem.get('Error');
                            }
                        }

                        return label;
                    }.bind(this),
                    breadcrumbs: ["errorHash"]
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
                        'errorHandled',
                        'appVersion',
                        'osVersion',
                        'environment',
                        'country',
                        'connection',
                        'carrier'
                    ]
                });
            },

            activate: function () {
                this.listenTo(this.children.errorsListView, 'table:drilldown', this.onDrilldown);

                this.listenTo(this.model.errorEvent, 'change', this.onChangeErrorEvent);

                // In case model already set before view activation
                if (this.deferreds.errorEvent.state() == 'resolved') {
                    this.onChangeErrorEvent(this.model.errorEvent);
                }

                this.listenTo(this.results.errorsList, 'data', this.onFetchResultsErrorsList);

                return BaseView.prototype.activate.apply(this, arguments);
            },

            events: {
                "click .nav-tabs li a": "_changeActiveTab",
                "click .error-drilldown": "_drilldownErrorSearch"
            },

            tokenEvents: {
                "change:errorHash": 'onChangeErrorHash'
            },

            onFetchResultsErrorsList: function (resultsModel, data) {
                this.collection.errors.reset(data.results);
            },

            onChangeErrorEvent: function () {
                // 0) Re-render breadcrumbs which depends on error model message
                this.children.breadCrumbsView.render();

                // 1) Clear local stacktrace models
                this.model.stacktrace.clear();
                this.model.symbolicatedStacktrace.clear();

                var errorHash = this.model.errorEvent.get('errorHash'),
                    platform = this.model.errorEvent.get('platform'),
                    handled = this.model.errorEvent.get('handled'),
                    where = this.model.errorEvent.get('where'),
                    symbolicatedStacktraceDeferred = $.Deferred();

                if (!errorHash) {
                    console.warn('[Errors.View] No errorHash found');
                    return;
                }
                //Starting a PartyJS transaction to track symbolication
                if(Mint.getOption('apiKey') !== undefined){
                    Mint.transactionStart('Symbolication:'+errorHash);
                }

                if (!canSymbolicate(platform, handled, where)) {
                    // 2a) Symbolication is not applicable so skip it
                    symbolicatedStacktraceDeferred.reject();
                } else {
                    // 2b) Fetch symbolicated stacktrace from KVStore
                    this.model.symbolicatedStacktrace.set('id', errorHash);
                    this.model.symbolicatedStacktrace.fetch({
                        success: function () {
                            var complete = this.model.symbolicatedStacktrace.get('complete');
                            console.log("Fetched cached " + (complete ? '' : 'PARTIAL ') + "sym stacktrace from KVStore");
                            // 3a) If symbolicated stacktrace already in KVStore
                            if (complete === true) {
                                // 4a) If cached KVStore version is complete
                                if(Mint.getOption('apiKey') !== undefined){ 
                                    Mint.transactionStop('Symbolication:'+errorHash);   
                                }                             
                                symbolicatedStacktraceDeferred.resolve();
                            } else {
                                if(Mint.getOption('apiKey') !== undefined){
                                    Mint.transactionStop('Symbolication:'+errorHash);
                                }
                                // 4b) If cached KVStore version is partial, attempt symbolication again
                                this.model.symbolicatedStacktrace.setSymbolicatePayload(this.model.errorEvent.attributes);
                                var symbolicateRequest = this.model.symbolicatedStacktrace.symbolicate({
                                    success: function () {
                                        var complete = this.model.symbolicatedStacktrace.get('complete');
                                        console.log("Fetched new " + (complete ? '' : 'PARTIAL ') + "sym stacktrace from Symbolicator");
                                        // Update KVStore entry with set ID=errorHash
                                        this.model.symbolicatedStacktrace.save();
                                        symbolicatedStacktraceDeferred.resolve();
                                    }.bind(this),
                                    error: function () {
                                        symbolicatedStacktraceDeferred.resolve();
                                    }.bind(this)
                                });
                                if (!symbolicateRequest) {
                                    symbolicatedStacktraceDeferred.resolve();
                                }
                            }
                        }.bind(this),
                        error: function () {
                            // 3b) If symbolicated stacktrace does not exist in KVStore, symbolicate then cache in KVStore
                            this.model.symbolicatedStacktrace.setSymbolicatePayload(this.model.errorEvent.attributes);
                            var symbolicateRequest = this.model.symbolicatedStacktrace.symbolicate({
                                success: function () {
                                    var complete = this.model.symbolicatedStacktrace.get('complete');
                                    console.log("Fetched new " + (complete ? '' : 'PARTIAL ') + "sym stacktrace from Symbolicator");
                                    // Create new KVStore entry with set ID=errorHash
                                    this.model.symbolicatedStacktrace.unset('id');
                                    this.model.symbolicatedStacktrace.set('_key', errorHash);
                                    this.model.symbolicatedStacktrace.save();
                                    if(Mint.getOption('apiKey') !== undefined){
                                        Mint.transactionStop('Symbolication:'+errorHash);
                                    }
                                    symbolicatedStacktraceDeferred.resolve();
                                }.bind(this),
                                error: function () {
                                    symbolicatedStacktraceDeferred.reject();
                                }.bind(this)
                            });
                            if (!symbolicateRequest) {
                                symbolicatedStacktraceDeferred.reject();
                            }
                        }.bind(this)
                    });
                }

                // Update stacktrace model when data ready
                $.when(symbolicatedStacktraceDeferred).done(function () {
                    // Populate stacktrace model with symbolicated stacktrace
                    var stacktrace = this.model.symbolicatedStacktrace.get('stacktrace');

                    this.model.stacktrace.set('stacktrace', stacktrace);
                }.bind(this)).fail(function () {
                    if(Mint.getOption('apiKey') !== undefined){
                        Mint.transactionCancel('Symbolication:'+errorHash, 'Failed to fetch the stacktrace from symbolicator');
                    }
                    console.log("Fallback to original stacktrace from event");
                    // Populate stacktrace model with original stacktrace
                    this._fallbackToOriginalStacktrace();
                }.bind(this));
            },

            onChangeErrorHash: function (tokens, errorHash) {
                // Clear view models
                this.model.stacktrace.clear();
                this.model.symbolicatedStacktrace.clearErrors();

                // Explicitly trigger onChangeErrorEvent in case currently selected error
                // is the same as previously loaded errorEvent - and hence no 'change' event
                var currErrorHash = this.model.errorEvent.get('errorHash');
                if (errorHash && (errorHash === currErrorHash)) {
                    this.onChangeErrorEvent(this.model.errorEvent);
                }

                this._toggleDrilldownView();
            },

            onDrilldown: function (e) {
                e.preventDefault();

                this.tokens.set({
                    errorHash: e.data["row.errorHash"]
                });
            },

            _fallbackToOriginalStacktrace: function () {
                var stacktraceRaw = this.model.errorEvent.get('stacktrace'),
                    stacktrace = convertStacktraceRawToArray(stacktraceRaw);

                this.model.stacktrace.set('stacktrace', stacktrace);
            },

            _drilldownErrorSearch: function (ev) {
                ev.preventDefault();
                var url = "search?q=tag=mint sourcetype=\"mint:error\" errorHash=" + this.tokens.get('errorHash');
                splunkjs_utils.redirect(url, ev.modifierKey);
            },

            _changeActiveTab: function (ev) {
                ev.preventDefault();
                var $el = $(ev.currentTarget).parent();
                var id = $el.data('id');
                this.$('.nav-tabs .active').removeClass('active');
                this.$('.nav-tabs li[data-id=' + id + ']').addClass('active');
                this.$('.content-tabs').hide();
                this.$('#' + id).show();
            },

            _isDrilldownView: function () {
                var errorHash = this.tokens.get('errorHash');
                if (errorHash !== "*" && !_.isUndefined(errorHash)) {
                    return true;
                } else {
                    return false;
                }
            },

            _toggleDrilldownView: function () {
                if (!this._isDrilldownView()) {
                    this.$('.normal').show();
                    this.$('.drilldown').hide();
                    this.$('#error-handled-control').parent('.input').show();

                    $(window).resize();
                } else {
                    this.$('.normal').hide();
                    this.$('.drilldown').show();
                    this.$('#error-handled-control').parent('.input').hide();
                }
            },

            render: function () {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate());

                    this.$(".normal .big-graph").append(this.children.errorsChartView.render().el);
                    this.$(".normal .table").append(this.children.errorsListView.render().el);

                    this.$(".drilldown #total-occurrences").append(this.children.totalOccurrencesView.render().el);
                    this.$(".drilldown #total-affected-users").append(this.children.totalAffectedUsersView.render().el);
                    this.$(".drilldown #total-memory").append(this.children.totalMemoryView.render().el);

                    this.$(".drilldown #occurrences-graph").append(this.children.occurrencesChartView.render().el);
                    this.$(".drilldown #affected-users").append(this.children.affectedUsersView.render().el);
                    this.$(".drilldown #stacktrace").append(this.children.stacktraceView.render().el);
                    this.$(".drilldown #network").append(this.children.networkView.render().el);
                    // this.$(".drilldown #gps").append(this.children.gpsView.render().el);
                    this.$(".drilldown #app-version").append(this.children.appVersionView.render().el);
                    this.$(".drilldown #os-version").append(this.children.osVersionView.render().el);
                    this.$(".drilldown #device").append(this.children.deviceView.render().el);

                    this.$('.FiltersRight').append(this.children.filtersView.render().el);
                    this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);
                }

                this._toggleDrilldownView();
                return this;
            }
        },
        {
            TokenIncludelist: TOKENS_INCLUDELIST
        });
});

