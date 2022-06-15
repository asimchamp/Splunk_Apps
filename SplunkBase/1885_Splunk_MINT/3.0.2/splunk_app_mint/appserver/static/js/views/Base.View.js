define([
    "jquery",
    "underscore",
    "backbone",
    'views/Base',
    'uri/route'
], function(
    $,
    _,
    Backbone,
    BaseView,
    route
){
    return BaseView.extend({
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.mediator = this.options.mediator || new Backbone.Model({});
            this.deferreds = this.options.deferreds || {};
            this.controllers = this.options.controllers || {};
            this.tokensIncludelist = [];
            this.tokenEvents = this.tokenEvents || {};
        },
        populateProject: function () {
            if (this.collection && this.collection.projects &&
                this.model.classicUrl.has('proj')) {
                this.model.project = this.collection.projects.findByName(this.model.classicUrl.get('proj'));
                this.tokens.set('project', this.model.project.genSearchString('All_MINT.packageName'));
            }
        },
        activate: function() {
            // force initial mutual sync-up
            this.populateProject();

            if (this.model.classicUrl) {
                this.loadClassicUrl();
                this.loadTokens();
            }

            // keep classic url & tokens in sync
            if (this.model.classicUrl && this.tokens) {
                this.listenTo(this.tokens, 'change', this.onTokensChange);
                this.listenTo(this.model.classicUrl, 'change', this.onClassicUrlChange);
                this.listenTo(this.model.classicUrl, 'change:proj', this.populateProject);
            }
            if (this.children && this.children.filtersView) {
                this.children.filtersView.activate();
                this.listenTo(this.children.filtersView, 'toggle', this._toggleFiltersView);
            }

            if (this.tokenEvents) {
                _.each(this.tokenEvents, function(callback, event){
                    this.listenTo(this.tokens, event, this[callback]);
                }, this);
            }

            if (this.searches) {
                _.each(this.searches, function(search){
                    search.startSearch();
                });
            }
            return BaseView.prototype.activate.apply(this, arguments);
        },
        _toggleFiltersView: function () {
            this.$('.FiltersRight').toggleClass('filters-small');
            this.$('.BodyLeft').toggleClass('filters-hidden');
        },
        // load classicUrl into tokens based on tokensIncludelist if set
        loadClassicUrl: function(changedAttributesOnly) {
            var attrs = {};
            if (this.tokens && this.tokensIncludelist.length > 0) {
                attrs = _.pick(
                    (changedAttributesOnly) ? this.model.classicUrl.changedAttributes()
                        : this.model.classicUrl.attributes,
                        this.tokensIncludelist
                );
                if (!_.isEmpty(attrs)) {
                    //console.log('url -> tokens: ', attrs);
                    this.tokens.set(attrs);
                }
            }
        },
        // load tokens into classicUrl based on tokensIncludelist if set
        loadTokens: function(changedAttributesOnly) {
            var attrs = {};
            if (this.tokens && this.tokensIncludelist.length > 0) {
                attrs = _.pick(
                    (changedAttributesOnly) ? this.tokens.changedAttributes()
                        : this.tokens.attributes,
                        this.tokensIncludelist
                );
                if (!_.isEmpty(attrs)) {
                    //console.log('tokens -> url: ', attrs);
                    this.model.classicUrl.save(attrs, {
                        replaceState: true
                    });
                }
            }
        },
        onTokensChange: function() {
            this.loadTokens(true);
        },
        onClassicUrlChange: function() {
            this.loadClassicUrl(true);
        },
        cssNamespace: function() {
            var cssNamespace = BaseView.prototype.cssNamespace.apply(this, arguments);
            return cssNamespace.replace(/^app-views-/, '').replace(/\.view$/, '');
        },
        makeDocLink: function(page) {
            // making help link for app page
            // location is in form: app.<app_name>.<page_name>
            var location = [
                'app',
                this.model.application.get('app'),
                page || this.model.application.get('page')
            ].join(".");

            return route.docHelpInAppContext(
                this.model.application.get("root"),
                this.model.application.get("locale"),
                location,
                this.model.application.get("app"),
                this.model.appLocal.entry.content.get('version'),
                this.model.appLocal.appAllowsDisable(),
                this.model.appLocal.entry.content.get('docs_section_override')
            );
        }
    });
});
