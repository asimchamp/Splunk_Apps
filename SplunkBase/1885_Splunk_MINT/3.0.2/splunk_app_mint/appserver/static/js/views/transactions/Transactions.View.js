define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/transactions/transactions.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintBreadcrumbs.View",
    "./Transactions.View.pcss"

], function ($,
             _,
             Backbone,
             BaseView,
             FiltersView,
             TransactionsTemplate,
             mvc,
             SearchManager,
             TableView,
             ChartView,
             BreadCrumbsView) {
    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    // Include List of tokens to be peristed in classicUrl.
    var TOKENS_INCLUDELIST = ['transactionName'];

    return BaseView.extend({
        template: TransactionsTemplate,
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokensIncludelist = TOKENS_INCLUDELIST;


            this.searches = {};
            this.drilldownSearches = {};

            // bottom table query
            this.searches.tableSearch = new SearchManager({
                id: 'table-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count AS Volume avg(All_MINT.Performance.Transaction.TransactionStop.tr_duration) as Duration' +
                '  FROM datamodel=MINT WHERE (nodename = All_MINT.Performance.Transaction.TransactionStop) AND ' + CONTEXT_SEARCH +
                '  BY All_MINT.Performance.Transaction.tr_name, All_MINT.Performance.Transaction.TransactionStop.status' +
                ' | rename All_MINT.Performance.Transaction.tr_name as Name, All_MINT.Performance.Transaction.TransactionStop.status as Status' +
                ' | eventstats sum(Volume) as TotalVolumeByName by Name' +
                ' | eval Percent=(Volume/TotalVolumeByName)*100' +
                ' | eval Weight=(Duration*Volume)' +
                ' | eventstats sum(Weight) as TotalWeight by Name' +
                ' | eval Duration=(TotalWeight/TotalVolumeByName)' +
                ' | eval SuccessRate=round(if(Status == "SUCCESS", Percent, 0),2)' +
                ' | eval FailRate=round(if(Status == "FAIL", Percent, 0),2)' +
                ' | eval CancelRate=round(if(Status == "CANCEL", Percent, 0),2)' +
                ' | fields - Percent, TotalVolumeByName' +
                ' | stats sum(Volume) as Volume, avg(Duration) as Duration,' +
                ' sum(SuccessRate) as "Succeeded (%)", sum(CancelRate) as "Cancelled (%)", sum(FailRate) as "Failed (%)" by Name' +
                ' | eval Duration=round(Duration,2)' +
                ' | rename Duration as "Avg duration (ms)"' +
                ' | sort - Volume'
            }, {tokens: true});

            this.searches.transactionsStatusGraphSearch = new SearchManager({
                id: 'transactions-status-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count AS count from datamodel=MINT' +
                '  WHERE (nodename = All_MINT.Performance.Transaction.TransactionStop) AND ' + CONTEXT_SEARCH +
                '  BY _time , All_MINT.Performance.Transaction.TransactionStop.status ' + SPAN_SETTING +
                ' | rename All_MINT.Performance.Transaction.TransactionStop.status AS status' +
                ' | eval FAIL=if(status == "FAIL", count, 0) | eval CANCEL=if(status == "CANCEL", count, 0)' +
                ' | eval SUCCESS=if(status == "SUCCESS", count, 0)' +
                ' | timechart ' + SPAN_SETTING + ' sum(SUCCESS) AS Succeeded, sum(CANCEL) AS Cancelled, sum(FAIL) as Failed'
            }, {tokens: true});

            // Volume Graph query
            this.drilldownSearches.volumeGraphSearch = new SearchManager({
                id: 'volume-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count AS tr_count from datamodel=MINT' +
                '  WHERE (nodename = All_MINT.Performance.Transaction.TransactionStop' +
                '  AND All_MINT.Performance.Transaction.tr_name = "$transactionName$")' +
                '  AND ' + CONTEXT_SEARCH + ' by _time ' + SPAN_SETTING +
                ' | timechart ' + SPAN_SETTING + ' values(tr_count)'
            }, {tokens: true});

            this.drilldownSearches.durationGraphSearch = new SearchManager({
                id: 'duration-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats avg(All_MINT.Performance.Transaction.TransactionStop.tr_duration) AS duration' +
                '  FROM datamodel=MINT where (nodename = All_MINT.Performance.Transaction.TransactionStop' +
                '  AND All_MINT.Performance.Transaction.tr_name = "$transactionName$")' +
                '  AND ' + CONTEXT_SEARCH + ' by _time ' + SPAN_SETTING +
                ' | timechart ' + SPAN_SETTING + ' eval(round(first(duration),2)) as duration'
            }, {tokens: true});

            this.drilldownSearches.ratesGraphSearch = new SearchManager({
                id: 'rates-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats count AS status_count from datamodel=MINT' +
                '  WHERE (nodename = All_MINT.Performance.Transaction.TransactionStop) AND ' + CONTEXT_SEARCH +
                '  AND All_MINT.Performance.Transaction.tr_name = "$transactionName$"' +
                '  BY _time, All_MINT.Performance.Transaction.TransactionStop.status ' + SPAN_SETTING +
                ' | rename All_MINT.Performance.Transaction.TransactionStop.status AS status' +
                ' | search status = "CANCEL" OR status = "FAIL"' +
                ' | timechart ' + SPAN_SETTING + ' values(status_count) by status' +
                ' | rename CANCEL as Cancelled' +
                ' | rename FAIL as Failed'
            }, {tokens: true});

            this.drilldownSearches.failedReasonsTableSearch = new SearchManager({
                id: 'failed-reasons-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' | tstats summariesonly=t count from datamodel=MINT where (nodename = All_MINT.Performance.Transaction.TransactionStop) AND ' + CONTEXT_SEARCH + 'AND All_MINT.Performance.Transaction.TransactionStop.status = "FAIL" AND All_MINT.Performance.Transaction.tr_name = "$transactionName$" by _time, All_MINT.Performance.Transaction.TransactionStop.failureErrorID' +
                ' | rename All_MINT.Performance.Transaction.TransactionStop.failureErrorID AS errorHash | join errorHash ' +
                ' [| tstats summariesonly=t first(All_MINT.Performance.Errors.message) AS message from datamodel=MINT where nodename=All_MINT.Performance.Errors by All_MINT.Performance.Errors.errorHash | rename All_MINT.Performance.Errors.errorHash as errorHash]' +
                ' | stats sum(count) AS Volume, sparkline(sum(count)) AS Trend by message, errorHash' +
                ' | rename message as "Error message" errorHash as "Error Hash"' +
                ' | sort -Volume'
            }, {tokens: true});

            this.drilldownSearches.cancelReasonsTableSearch = new SearchManager({
                id: 'cancel-reasons-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: '| tstats count AS count from datamodel=MINT where (nodename = All_MINT.Performance.Transaction.TransactionStop) ' +
                'AND All_MINT.Performance.Transaction.TransactionStop.status = "CANCEL" AND All_MINT.Performance.Transaction.tr_name = "$transactionName$" AND ' + CONTEXT_SEARCH + ' by _time, All_MINT.Performance.Transaction.TransactionStop.cancellationReason ' +
                '| rename  All_MINT.Performance.Transaction.TransactionStop.cancellationReason AS "Cancellation reason"' +
                '| stats  sum(count) AS Volume sparkline(sum(count)) AS Trend by "Cancellation reason" | sort - Volume'
            }, {tokens: true});

            this.drilldownSearches.mostRecentTableSearch = new SearchManager({
                id: 'most-recent-reasons-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: '| tstats count AS count avg(All_MINT.Performance.Transaction.TransactionStop.tr_duration) as duration from datamodel=MINT' +
                '   where (nodename = All_MINT.Performance.Transaction.TransactionStop) AND All_MINT.Performance.Transaction.TransactionStop.status != "SUCCESS" AND All_MINT.Performance.Transaction.tr_name = "$transactionName$"  AND ' + CONTEXT_SEARCH + ' by _time, All_MINT.Performance.Transaction.tr_name,' +
                '   All_MINT.Performance.Transaction.TransactionStop.reason,All_MINT.Performance.Transaction.TransactionStop.status, All_MINT.userIdentifier, All_MINT.appVersionName' +
                ' | rename All_MINT.Performance.Transaction.tr_name AS Name, All_MINT.Performance.Transaction.TransactionStop.reason AS Reason | eval errorHash=Reason | head 100 | join type=outer errorHash' +
                '[| tstats summariesonly=t first(All_MINT.Performance.Errors.message) AS message from datamodel=MINT where nodename=All_MINT.Performance.Errors by All_MINT.Performance.Errors.errorHash | rename All_MINT.Performance.Errors.errorHash as errorHash]' +
                ' | rename All_MINT.Performance.Transaction.TransactionStop.status AS Status |eval Reason=if(Status = "FAIL", message, Reason) | fields - errorHash message' +
                ' | rename All_MINT.userIdentifier AS "User identifier", All_MINT.appVersionName AS "App version" ' +
                ' | eval "Duration (ms)"=round(duration,2) | fields - duration, count| eval Time=strftime(_time, "%d/%m/%Y %I:%M:%S %p") | fields - _time' +
                ' | table Reason, Time, Status, "User identifier", "App version", "Duration (ms)"'
            }, {tokens: true});

            this.children.breadCrumbsView = new BreadCrumbsView({
                model: {
                    classicUrl: this.model.classicUrl,
                },
                title: "Transactions",
                breadcrumbs: ["transactionName"]
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

            this.children.tableView = new TableView({
                id: "populate-table",
                managerid: "table-search",
                classicUrl: this.model.classicUrl,
                pageSize: "10",
                drilldown: "row",
                drilldownRedirect: false
            });

            this.searches.tableSearch.on('change', function(){
                this.children.tableView.paginator.settings.set('page', 0);
            }.bind(this));

            this.children.transactionStatusChartView = new ChartView({
                id: "transactions-status-chart",
                managerid: "transactions-status-search",
                type: "line",
                drilldown: "none",
                height: "220px",
                classicUrl: this.model.classicUrl,
                data: "results",
                output_mode: "json",
                multiSeries: true,
                chartOptions: {
                    colors: ['#43a775', '#f59158', '#d7293d'],
                    chart: {
                        type: 'spline',
                        marginTop: 40
                    },
                    legend: {
                        x: 0,
                        y: -5,
                        enabled: true,
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0,
                        floating: false
                    },
                    exporting: {
                        enabled: false
                    }
                }
            });

            this.children.transactionVolumeChartView = new ChartView({
                id: "transactions-volume-chart",
                managerid: "volume-search",
                type: "area",
                drilldown: "none",
                title: "Volume",
                height: "220px",
                classicUrl: this.model.classicUrl,
                chartOptions: {
                    plotOptions: {
                        areaspline: {
                            color: "#33bed1"
                        }
                    }
                },
                data: "results"
            });

            this.children.transactionDurationChartView = new ChartView({
                id: "transactions-duration-chart",
                managerid: "duration-search",
                type: "area",
                drilldown: "none",
                title: "Duration",
                height: "220px",
                classicUrl: this.model.classicUrl,
                rowType: "float",
                chartOptions: {
                    plotOptions: {
                        areaspline: {
                            marker: {
                                fillColor: {
                                    linearGradient: [0, 0, 0, 300],
                                    stops: [
                                        [0, 'rgba(229,48,65,1)'],
                                        [0.2, 'rgba(245,145,88,1)'],
                                        [1, 'rgba(67,167,117,1)']
                                    ]
                                },
                                symbol: 'circle',
                                states: {
                                    hover: {
                                        halo: {
                                            attributes: {
                                                fill: '#000',
                                                opacity: 0.1

                                            }
                                        }
                                    }
                                }
                            },
                        },
                        series: {
                            lineColor: {
                                linearGradient: [0, 0, 0, 300],
                                stops: [
                                    [0, 'rgba(229,48,65,0.5)'],
                                    [0.2, 'rgba(245,145,88,0.5)'],
                                    [1, 'rgba(67,167,117,0.5)']
                                ]
                            },
                            fillColor: {
                                linearGradient: [0, 0, 0, 300],
                                stops: [
                                    [0, 'rgba(229,48,65,0.5)'],
                                    [0.2, 'rgba(245,145,88,0.5)'],
                                    [1, 'rgba(67,167,117,0.5)']
                                ]
                            },
                            dataLabels: {
                                enabled: false,
                                x: 0,
                                y: -10
                            }
                        }
                    }
                },
                data: "results"
            });

            this.children.transactionRatesChartView = new ChartView({
                id: "transactions-rates-chart",
                managerid: "rates-search",
                type: "line",
                drilldown: "none",
                title: "Rates",
                height: "220px",
                classicUrl: this.model.classicUrl,
                output_mode: "json",
                multiSeries: true,
                chartOptions: {
                    colors: ['#f89250', '#d92639'],
                    chart: {
                        type: 'spline',
                        marginTop: 40
                    }
                },
                data: "results"
            });

            this.children.failedTableView = new TableView({
                id: "failed-reasons-table",
                managerid: "failed-reasons-search",
                classicUrl: this.model.classicUrl,
                pageSize: "10",
                drilldown: "row",
                drilldownRedirect: false,
                format: {
                    "Trend": [{
                        type: "sparkline",
                        options: {
                            lineColor: "#d92639"
                        }
                    }]
                }
            });

            this.drilldownSearches.failedReasonsTableSearch.on('change', function(){
                this.children.failedTableView.paginator.settings.set('page', 0);
            }.bind(this));

            this.children.cancelledTableView = new TableView({
                id: "cancelled-reasons-table",
                managerid: "cancel-reasons-search",
                classicUrl: this.model.classicUrl,
                pageSize: "10",
                drilldown: "none",
                drilldownRedirect: false,
                format: {
                    "Trend": [{
                        type: "sparkline",
                        options: {
                            lineColor: "#f89250"
                        }
                    }]
                }
            });

            this.drilldownSearches.cancelReasonsTableSearch.on('change', function(){
                this.children.cancelledTableView.paginator.settings.set('page', 0);
            }.bind(this));

            this.children.mostRecentTableView = new TableView({
                id: "most-recent-reasons-table",
                managerid: "most-recent-reasons-search",
                classicUrl: this.model.classicUrl,
                pageSize: "10",
                drilldown: "none",
                drilldownRedirect: false
            });

            this.drilldownSearches.mostRecentTableSearch.on('change', function(){
                this.children.mostRecentTableView.paginator.settings.set('page', 0);
            }.bind(this));
        },

        activate: function () {
            this.children.tableView.on('table:drilldown', this.onDrilldown, this);

            this.children.failedTableView.on('table:drilldown', this.redirectToError, this);

            return BaseView.prototype.activate.apply(this, arguments);
        },


        redirectToError: function(data) {
            //console.log(data.data["row.Error Hash"]);
            this.redirectToPage(data.data["row.Error Hash"]);
        },

        redirectToPage: function(errorHash) {
            var path = window.location.pathname.split("/");
            path[path.length - 1] = "errors?errorHash=" + errorHash;
            path = path.join("/");
            newUrl = window.location.protocol + "//" + window.location.host + path;
            newUrl += "&filters.earliest=" + this.model.classicUrl.get('filters.earliest') + "&filters.latest=" + this.model.classicUrl.get('filters.latest');
            newUrl += "&proj=" + this.model.classicUrl.get('proj');
            window.location.href = newUrl;
        },


        onChangeTransactionName: function () {
            this._toggleDrilldownView();
        },

        _isDrilldownView: function () {
            var transactionName = this.tokens.get('transactionName');
            if (transactionName !== "*" && !_.isUndefined(transactionName)) {
                return true;
            } else {
                return false;
            }
        },

        tokenEvents: {
            "change:transactionName": 'onChangeTransactionName'
        },

        onDrilldown: function (e) {
            var tableValue = e.data["click.value"],
                classicUrl = this.model.classicUrl;

            e.preventDefault();

            classicUrl.save({transactionName: tableValue});
        },

        _toggleDrilldownView: function () {
            if (!this._isDrilldownView()) {
                this.$('.normal').show();
                this.$('.drilldown').hide();

                $(window).resize();
            } else {
                this.$('.normal').hide();
                this.$('.drilldown').show();
            }
        },
        render: function () {
            if (!this.el.innerHTML) {
                this.$el.html(this.compiledTemplate());

                this.$(".normal .big-graph").append(this.children.transactionStatusChartView.render().el);
                this.$(".normal .table").append(this.children.tableView.render().el);

                this.$(".drilldown #volume-graph").append(this.children.transactionVolumeChartView.render().el);
                this.$(".drilldown #duration-graph").append(this.children.transactionDurationChartView.render().el);
                this.$(".drilldown #rates-graph").append(this.children.transactionRatesChartView.render().el);
                this.$(".drilldown .two-table-failed").append(this.children.failedTableView.render().el);
                this.$(".drilldown .two-table-cancelled").append(this.children.cancelledTableView.render().el);
                this.$(".drilldown .table-recent").append(this.children.mostRecentTableView.render().el);

                this.$('.FiltersRight').append(this.children.filtersView.render().el);
                this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);
            }

            this._toggleDrilldownView();
            return this;
        }
    }, {
        TokenIncludelist: TOKENS_INCLUDELIST
    });
});
