define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/MintMultiDropdown.View",
    "app/contrib/text!app/templates/shared/filters.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/timerangeview",
    "views/shared/controls/SyntheticRadioControl",
    "splunkjs/mvc/tokenforwarder",
    "splunkjs/mvc/dropdownview",
    "util/moment",
    "imports?jquery!jquery.smartresize",
    "./Filters.View.pcss"
], function ($,
             _,
             Backbone,
             BaseView,
             MultiDropdownView,
             FiltersTemplate,
             mvc,
             SearchManager,
             TimeRangeView,
             SyntheticRadioControl,
             TokenForwarder,
             DropdownView,
             moment) {

    var CONNECTION_WIFI_VALUE = 'wifi';

    // Include List of tokens to be peristed in classicUrl.
    var TOKENS_INCLUDELIST = ['filters.earliest', 'filters.latest', 'filters.errorHandled', 'proj'];

    // Mapping of filter to corresponding event field, nodename (if applicable),
    // UI type, label, dropdown labelField, and actual search to populate dropdowns choices.
    var filterToEventMap = {
        'errorHandled': {
            field: 'handled',
            type: SyntheticRadioControl,
            label: 'Error Type',
            nodename: 'All_MINT.Performance.Errors',
        },
        'sessions': {
            field: 'sessions',
            type: SyntheticRadioControl,
            label: 'Count type',
            nodename: 'All_MINT.Usage.Session.Pings',
            ignore: function(){ return true; }
        },
        'appVersion': {
            field: 'appVersionName',
            type: MultiDropdownView,
            label: 'App version',
            nodename: 'All_MINT',
            search: ' | tstats values("All_MINT.appVersionName") as appVersion FROM datamodel=MINT' +
            '  WHERE $project$  AND $filters.tstatsQueryCountry$ | mvexpand appVersion | sort - appVersion',
            dependencies: ['country']
        },
        'osVersion': {
            field: 'osVersion',
            type: MultiDropdownView,
            label: 'OS version',
            nodename: 'All_MINT',
            search: '| tstats values("All_MINT.osVersion") as osVersion FROM datamodel=MINT' +
            ' WHERE $project$  AND $filters.tstatsQueryCountry$ AND $filters.tstatsQueryAppVersion$   | mvexpand osVersion | sort - osVersion',
            dependencies: ['country', 'appVersion']
        },
        'country': {
            field: 'remoteIP_Country',
            type: MultiDropdownView,
            label: 'Country',
            nodename: 'All_MINT',
            labelField: 'country',
            search: ' | tstats values(All_MINT.remoteIP_Country) AS country FROM datamodel=MINT WHERE $project$ '+
            ' AND $filters.tstatsQueryAppVersion$  AND $filters.tstatsQueryOsVersion$ '+
            ' | mvexpand country | sort + country',
            dependencies: ['appVersion', 'osVersion']
        },
        'connection': {
            field: 'connection',
            type: MultiDropdownView,
            label: 'Connection type',
            nodename: 'All_MINT',
            search: ' | tstats values(All_MINT.connection) AS connection FROM datamodel=MINT' +
            '  WHERE $project$  AND $filters.tstatsQueryCountry$ AND $filters.tstatsQueryAppVersion$  AND $filters.tstatsQueryOsVersion$  | mvexpand connection',
             dependencies: ['country', 'appVersion', 'osVersion']
        },
        'carrier': {
            field: 'carrier',
            type: MultiDropdownView,
            label: 'Carrier',
            nodename: 'All_MINT',
            search: ' | tstats values(All_MINT.carrier) AS carrier FROM datamodel=MINT' +
            '  WHERE $project$  AND $filters.tstatsQueryCountry$ AND $filters.tstatsQueryAppVersion$  AND $filters.tstatsQueryOsVersion$ | mvexpand carrier',
            dependencies: ['country', 'appVersion', 'osVersion'],
            /**
             *  Carrier filter is ignored if connection selected is 'WIFI' i.e. carriers are not applicable
             *  This is called by _genSearchStringFromTokenValues whenever generating new filters query string
             */
            ignore: function(filters, tokenValues) {
                var connectionIdx = filters.indexOf('connection'),
                    connectionValue;

                // If connection not part of current filters, do not ignore
                if (connectionIdx === -1) {
                    return false;
                }

                connectionValue = tokenValues[connectionIdx];
                // Accounts for multiple connection values in case of multi dropdown
                if (_.isArray(connectionValue)) {
                    if (connectionValue.length > 1) {
                        // If multiple values selected, non-WIFI must be selected so cannot ignore
                        return false;
                    }
                    connectionValue = connectionValue[0];
                }
                // If connection selected is WIFI, then ignore
                if ((connectionValue || "").toLowerCase() == CONNECTION_WIFI_VALUE) {
                    return true;
                }
                return false;
            }
        },
        'domain': {
            field: 'domain',
            type: MultiDropdownView,
            label: 'Domain name',
            nodename: 'All_MINT.Performance.Network_Monitoring',
            search: ' | tstats values(All_MINT.Performance.Network_Monitoring.domain) AS domain FROM datamodel=MINT' +
            '  WHERE $project$ AND (nodename = All_MINT.Performance.Network_Monitoring) '+
            '  AND $filters.tstatsQueryCountry$ AND $filters.tstatsQueryAppVersion$  AND $filters.tstatsQueryOsVersion$ | mvexpand domain',
            dependencies: ['country', 'appVersion', 'osVersion']
        },
        'path': {
            field: 'path',
            type: MultiDropdownView,
            label: 'Path',
            nodename: 'All_MINT.Performance.Network_Monitoring',
            search: ' | tstats values(All_MINT.Performance.Network_Monitoring.path) AS path FROM datamodel=MINT' +
            ' WHERE $project$ AND (nodename = All_MINT.Performance.Network_Monitoring) ' +
            ' AND $filters.tstatsQueryDomain$ AND $filters.tstatsQueryCountry$ AND $filters.tstatsQueryAppVersion$  AND $filters.tstatsQueryOsVersion$ '+
            '| mvexpand path',
            dependencies: ['country', 'appVersion', 'osVersion', 'domain']
        },
        'view': {
            field: 'current',
            type: MultiDropdownView,
            label: 'View',
            nodename: 'All_MINT.Usage.View',
            search: ' | tstats values(All_MINT.Usage.View.current) AS view FROM datamodel=MINT' +
            ' WHERE $project$ AND (nodename = All_MINT.Usage.View) ' +
            ' AND $filters.tstatsQueryCountry$ AND $filters.tstatsQueryAppVersion$ AND $filters.tstatsQueryOsVersion$ '+
            '| mvexpand view',
            dependencies: ['country', 'appVersion', 'osVersion']
        },
        'environment': {
            field: 'appEnvironment',
            type: MultiDropdownView,
            label: 'Environment',
            nodename: 'All_MINT',
            search: '| tstats values(All_MINT.appEnvironment) as environment FROM datamodel=MINT' +
            ' WHERE $project$ AND (nodename = All_MINT) ' +
            ' AND $filters.tstatsQueryCountry$ AND $filters.tstatsQueryAppVersion$ AND $filters.tstatsQueryOsVersion$ '+
            '| mvexpand environment',
            dependencies: ['country', 'appVersion', 'osVersion']
        }

    };

    /**
     * Convert time range determined by earliest/latest timestamps into a default span for bucketing.
     * Uses Moment.js library to leverage its built-in logic for months and years.
     * @param earliestTime {timestamp} unix timestamp for earliest time
     * @param latestTime {timestamp} unix timestamp for latest time
     * @return {String} ('1s', '1m', '1h', '1d', '1mon', '12mon')
     */
    var getDefaultSpanFromTimeRange = function (earliestTime, latestTime) {
        var span = '',
            duration = latestTime - earliestTime,
            earliestMoment = moment.unix(earliestTime),
            latestMoment = moment.unix(latestTime);

        // Over last 1 minute or less, bucket by second
        // Over last 1 hour or less, bucket by minute
        // Over last 7 days or less, bucket by hour
        // Over last 7 months or less, bucket by day (Uses Moment library)
        // Over last 2 years or less, bucket by month (Uses Moment library)
        // Over last 2+ years, bucket by year
        if (duration <= 60) {
            span = '1s';
        } else if (duration <= 3600) {
            span = '1m';
        } else if (duration <= 7 * 24 * 3600) {
            span = '1h';
        } else if (!latestMoment.clone().subtract(7, 'months').isAfter(earliestMoment, 'second')) {
            span = '1d';
        } else if (!latestMoment.clone().subtract(2, 'years').isAfter(earliestMoment, 'second')) {
            span = '1mon';
        } else {
            span = '12mon';
        }
        return span;
    };

    $(window).smartresize(function () {
        // code that takes it easy...
        $(window).resize();
    });

    return BaseView.extend({
        template: FiltersTemplate,
        /**
         * @param {Object} options {
        *     model: {
        *         classicUrl: <models/classicurl>
        *     }
        *     filters: <Array> Array of filters to render.
        *              Supports following filters:
        *                   appVersion, osVersion, locale, connection, carrier, logLevel
        *              Defaults to
        *                   ['appVersion', 'osVersion', 'locale', 'connection', 'carrier']
        * }
         */
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            options = options || {};

            var defaults = {
                earliest: '-7d@d',
                latest: 'now',
                localeType: 'MultiDropdownView',
                filters: [
                    'appVersion',
                    'osVersion',
                    'environment',
                    'country',
                    'connection',
                    'carrier'
                ]
            };
            _.defaults(this.options, defaults);

            // array to store project choices
            this.project_choices = [];

            // TODO: validation of options.filters array

            this.isCollapsed = false;
            this.searches = {};

            // Reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('filters.earliest', this.options.earliest);
            this.tokens.set('filters.latest', this.options.latest);

            this.tokensIncludelist = TOKENS_INCLUDELIST;


            // get list of all project names 
            this.collection.projects.on('sync', function(){
                if(this.collection.projects.length > 0){
                    this.collection.projects.each(function(project){
                        var choices = {};
                        choices.label = project.entry.get('name');
                        choices.value = project.entry.get('name');
                        this.project_choices.push(choices);
                    }.bind(this));
                }
            }.bind(this));

            // Instantiate timerange
            this.children.timeRangeView = new TimeRangeView({
                id: "timerange-picker",
                managerid: null,
                earliest_time: mvc.tokenSafe("$filters.earliest$"),
                latest_time: mvc.tokenSafe("$filters.latest$"),
                dialogOptions: {
                    showPresetsRealTime: false,
                    showCustomRealTime: false,
                    enableCustomAdvancedRealTime: false
                }
            });

            // filter view for projects
            this.children.projView = new DropdownView({
                id: "project-picker",
                managerid: null,
                choices: this.project_choices,
                showClearButton: false
            });

            //Create a PartyJS event on change of TimeRange View
            this.children.timeRangeView.on("change", function(){
                if(Mint.getOption('apiKey') !== undefined){
                    Mint.logEvent("Timerange changed to-- " + "Earliest Time: " + this.children.timeRangeView.val().earliest_time + " Latest Time: " + this.children.timeRangeView.val().latest_time);                            
                }
            }.bind(this));

            // For each requested filter, instantiate dropdown view, associated search
            // manager, and a token forwarder with value of derived search query
            _.each(this.options.filters, function (filter) {
                // convert filter name from camelCase to dash-seperated
                var elemId = filter.replace(/([A-Z])/g, function (m, $1) {
                    return "-" + $1.toLowerCase();
                });

                
                if (filter == 'errorHandled') {
                    // initialize control to non-handled error, i.e. crashes
                    this.tokens.set('filters.errorHandled', false);

                    this.children[filter] = new SyntheticRadioControl({
                        id: elemId + '-control',
                        model: this.tokens,
                        modelAttribute: 'filters.errorHandled',
                        items: [
                            {label: 'Crashes', value: 'false'},
                            {label: 'Handled', value: 'true'}
                        ],
                        defaultValue: '*'
                    });
                }
                else if (filter == 'sessions') {
                    // initialize control to non-handled error, i.e. crashes
                    this.tokens.set('filters.sessions', true);

                    this.children[filter] = new SyntheticRadioControl({
                        id: elemId + '-control',
                        model: this.tokens,
                        modelAttribute: 'filters.sessions',
                        items: [
                            {label: 'Users', value: 'false'},
                            {label: 'Sessions', value: 'true'}
                        ],
                        defaultValue: 'false'
                    });

                    //Create a PartyJS event on change of the sessions filter
                    this.listenTo(this.children[filter], 'change', function (){
                        if(Mint.getOption('apiKey') !== undefined){
                            Mint.logEvent("Filter clicked: " + filter);                            
                        }

                    });
                }
                else {
                    var searchId = elemId + '-search',
                        dropdownId = elemId + '-dropdown';

                    this.searches[filter] = new SearchManager({
                        id: searchId,
                        earliest_time: "$filters.earliest$",
                        latest_time: "$filters.latest$",
                        search: filterToEventMap[filter].search
                    }, {tokens: true});

                    //if (filter == 'locale' && options.localeType == 'DropdownView') {
                    //        filterToEventMap[filter].type  = DropdownView;
                    //}

                    if(filterToEventMap[filter].type == MultiDropdownView){
                        this.children[filter] = new MultiDropdownView({
                        id: dropdownId,
                        managerid: searchId,
                        value: mvc.tokenSafe('$filters.' + filter + '$'),
                        labelField: filterToEventMap[filter].labelField || filter,
                        valueField: filter,
                        showClearButton: false,
                        default: '*'
                        }); 
                        //create a PartyJS event on change of the appropriate MultiDropdown filter
                        this.listenTo(this.children[filter], 'change', function (){
                            if(Mint.getOption('apiKey') !== undefined){
                                Mint.logEvent("Filter clicked: " + filter);                            
                            }
                        });
                    } else {
                        this.children[filter] = new DropdownView({
                            id: dropdownId,
                            managerid: searchId,
                            value: mvc.tokenSafe('$filters.' + filter + '$'),
                            labelField: filterToEventMap[filter].labelField || filter,
                            valueField: filter,
                            showClearButton: true,
                            choices: [
                                {"label": "All", "value": ""}
                            ]
                        },  {tokens: true});

                        //create a PartyJS event on change of the appropriate Dropdown filter
                        this.listenTo(this.children[filter], 'change', function (){
                            if(Mint.getOption('apiKey') !== undefined){
                                Mint.logEvent("Filter clicked: " + filter);                            
                            }
                        });
                    }
                   
                }


                // new token for search query derived for current filter
                // e.g. $tstatsQueryAppVersion$, notice filter is capitalized
                var filterQueryToken = 'tstatsQuery' + filter[0].toUpperCase() + filter.slice(1);
                this[filterQueryToken + 'TokenTorwarder'] = new TokenForwarder(
                    '$filters.' + filter + '$',
                    '$filters.' + filterQueryToken + '$',
                    _.partial(this._genSearchStringForFilters, filter, true)
                );
            }.bind(this));

            // Create tokens for overall search query from all filters:
            // 1. $filtersQuery$ to be used with regular searches
            this.filtersQueryTokenTorwarder = new TokenForwarder(
                _.map(this.options.filters, function (name) {
                    return "$filters." + name + "$";
                }),
                "$filters.all$",
                _.partial(this._genSearchStringForFilters, this.options.filters, false)
            );

            // 2. $filtersTstatsQuery$ to be used with tstats searches
            this.filtersTstatsQueryTokenForwarder = new TokenForwarder(
                _.map(this.options.filters, function (name) {
                    return "$filters." + name + "$";
                }),
                "$filters.tstatsQueryAll$",
                _.partial(this._genSearchStringForFilters, this.options.filters, true)
            );

        },

        
        events: {
            'click #toggle-filters': 'onToggleFiltersClick'
        },

        startListening: function () {
            // We don't register the change handler on internal timeRange model
            // until timeRangeView has done creating the timepicker
            // TODO: this requires intimiate knowledge of timeRangeView. Proper approach
            // is to listen to timeRangeView change event, but that does not cut it:
            // File SPL- bug: timeRangeView does not trigger 'change' upon token-based update of earliest/latest
            $.when(this.children.timeRangeView._pickerDfd).done(function () {
                // Initialize time-related tokens (duration & span)
                this.onTimeRangeChange();
                // Update time-related tokens whenever time range view changes
                this.listenTo(this.children.timeRangeView.timepicker.model.timeRange, 'change', this.onTimeRangeChange);
            }.bind(this));

            // call the handler on change of project
            this.listenTo(this.children.projView, 'change', function(newProj){
                if(newProj != this.model.classicUrl.get('proj')){
                    this.onProjectChange(newProj);
                }
            });

            // Hide carrier dropdown when selected connection is 'WIFI' only
            if (this.children.connection && this.children.carrier) {
                this.listenTo(this.children.connection, 'change', function (value) {
                    // Accounts for multi dropdown case
                    if (_.isArray(value) && value.length === 1) {
                        value = value[0];
                    }
                    if (_.isString(value) && value.toLowerCase() == CONNECTION_WIFI_VALUE) {
                        this.children.carrier.$el.closest('.dropdown-container').hide();
                    } else {
                        this.children.carrier.$el.closest('.dropdown-container').show();
                    }
                });
            }
        },

        onToggleFiltersClick: function () {
            if (this.isCollapsed) {
                this.expand();
            } else {
                this.collapse();
            }
            this.trigger('toggle');
        },

        onTimeRangeChange: function () {
            var timeRange = this.children.timeRangeView.timepicker.model.timeRange,
                earliestEpoch = timeRange.get('earliest_epoch'),
                latestEpoch = timeRange.get('latest_epoch'),
                duration, span;

            // Create duration & span tokens from time range
            duration = latestEpoch - earliestEpoch;
            span = getDefaultSpanFromTimeRange(earliestEpoch, latestEpoch);

            this.tokens.set({
                'filters.duration': duration,
                'filters.span': span
            });
        },

        // Update classicUrl on change of project filter 
        onProjectChange: function (newProj) {
            this.model.classicUrl.save({
                proj: newProj
            });
        },

        /**
         * Implements a token forwarder logic that generates search string for
         * given list of filters using their respective values passed as arguments
         */
        _genSearchStringForFilters: function (filters, isTstatsQuery) {
            var tokenQueries = [],
                tokenValues = Array.prototype.slice.call(arguments, 2); // remove filters & isTstatsQuery

            if (!_.isArray(filters)) {
                filters = [filters];
            }

            _.each(tokenValues, function (value, index) {
                var query = '', field = '',
                    filter = filters[index];

                // Check if filter should be ignored
                if (filterToEventMap[filter].ignore &&
                    filterToEventMap[filter].ignore(filters, tokenValues)) {
                    return;
                }

                // When generating tstats version of the filter query, prepend
                // nodename to current filter field if one is defined, e.g. All_MINT.osVersion
                if (isTstatsQuery && filterToEventMap[filter].nodename) {
                    field = filterToEventMap[filter].nodename + '.';
                }
                // Use original event field name corresponding to current filter
                field += filterToEventMap[filter].field;

                // Support both multi dropdown and single dropdown cases
                if (_.isArray(value)) {
                    query = _.map(value, function (v) {
                        return (field + '=\"' + v + '\"');
                    }).join(' OR ');
                } else {
                    query = field + '=\"' + value + '\"';
                }

                tokenQueries.push('(' + query + ')');
            });

            if (tokenQueries.length > 1) {
                return '(' + tokenQueries.join(' AND ') + ')';
            } else {
                return tokenQueries.pop();
            }
        },

        collapse: function () {
            // Note: time label is being fetched from the DOM because
            // timeRangeView has no simple API to retrieve it
            var timeLabel = this.children.timeRangeView.timepicker.$('a > .time-label').text();
            this.$('> .fieldset').hide();
            this.$('> h3').first().append('<span>' + _(timeLabel).t() + '</span>');

            this.isCollapsed = true;

            $(window).resize();
        },

        expand: function () {
            this.$('> .fieldset').show();
            this.$('> h3 > span').remove();

            this.isCollapsed = false;

            $(window).resize();
        },

        render: function () {
            var that = this;
            this.$el.html(this.compiledTemplate({
                filters: this.options.filters,
                ids: _.map(this.options.filters, function (filter) {
                    return that.children[filter].id;
                }),
                labels: _.map(this.options.filters, function (filter) {
                    return filterToEventMap[filter].label;
                })
            }));

            // render time range picker view
            this.$('#project-picker').html(this.children.projView.render().el);
            if(this.model.classicUrl.has('proj')){
                this.children.projView.settings.set('default', this.model.classicUrl.get('proj'));
            } else {
                this.children.projView.settings.set('default', 'All Data');
            }
            this.$('#timerange-picker').html(this.children.timeRangeView.render().el);

            // render dropdown views
            _.each(this.options.filters, function (filter) {
                var view = this.children[filter];
                this.$('#' + view.id).html(view.render().el);
            }.bind(this));

            return this;
        }
    }, {
        ConnectionWifiValue: CONNECTION_WIFI_VALUE,
        TokenIncludelist: TOKENS_INCLUDELIST
    });
});
