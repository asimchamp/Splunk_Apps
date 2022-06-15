define([
    'jquery',
    'underscore',
    'backbone',
    'app/controllers/Base.Controller',
    "splunkjs/mvc",
    'splunkjs/mvc/searchmanager'
], function(
    $,
    _,
    Backbone,
    BaseController,
    mvc,
    SearchManager
){
    
    // Include List of tokens to be peristed in classicUrl.
    var TOKENS_INCLUDELIST = [];

    return BaseController.extend({

        /**
        * @param {Object} options {
        *     model: {
        *         application: <models/shared/Application>,
        *         classicUrl: <models/classicurl>,
        *         errorEvent: <Backone.Model>
        *     },
        *     deferreds: {
        *         errorEvent: <$.Deferred> 
        *     }
        */

        initialize: function(options) {
            BaseController.prototype.initialize.apply(this,arguments);

            var app = this.model.application.get("app"),
                owner = this.model.application.get("owner"),
                proxyOptions = {appData: {proxy: app, app: app, owner: owner}};

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");

            this.tokensIncludelist = TOKENS_INCLUDELIST;

            // Cache proxyOptions for any future model instantiations
            this.proxyOptions = proxyOptions;

            // Reference internal searches & associated results
            this.searches = this.searches || {};
            this.results = this.results || {};

            this.searches.errorEvent = new SearchManager({
                id: 'error-event-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                autostart: false,
                app: app,
                owner: owner
            }, {tokens: true});

            this.results.errorEvent = this.searches.errorEvent.data('results', {
                output_mode: 'json',
                count: 1
            });
        },

        start: function() {
            this.listenTo(this.results.errorEvent, 'data', this.onFetchResultsErrorEvent);

            this.listenTo(this.model.classicUrl, 'change:errorHash', this.setSearchFromClassicUrl);

            this.setSearchFromClassicUrl();
        },

        onFetchResultsErrorEvent: function(resultsModel, data) {
            // console.log('Fetched error event', data);
            if (!resultsModel.hasData()) {
                console.warn('[Errors.Controller] No error event found');
            }

            if (!data || !data.results || !data.results[0]) { return; }

            var attrs = data.results[0];

            // Attempt JSON parsing of stacktrace field since Splunk indexes
            // fields as string, including JSON values
            try {
                attrs.stacktrace = JSON.parse(attrs.stacktrace);
            }
            catch(e) {
                // If not a JSON format, must be a string (or single-threaded format)
                // Note: Depending on MINT SDKs, stacktrace format may change:
                // from a string (single-threaded case) to a hash of strings with string keys (multi-threaded case).
                // Hence the following normalization of stacktrace format to multi-threaded format.
                attrs.stacktrace = { "0" : attrs.stacktrace };
            }

            // Set error event model with search results
            this.model.errorEvent.set(attrs);

            // Mark error event as ready - useful to deal with race condition
            this.deferreds.errorEvent.resolve();
        },

        setSearchFromClassicUrl: function() {
            var errorHash = this.model.classicUrl.get('errorHash');

            if (errorHash && errorHash != '*') {
                this.searches.errorEvent.settings.set('search',
                    ' index=mint sourcetype="mint:error" errorHash="' + errorHash + '"' +
                    ' | head 1 | spath stacktrace | fields *'
                );
                this.searches.errorEvent.startSearch();
            }
        }
    }, {
        TokenIncludelist: TOKENS_INCLUDELIST
    });
});