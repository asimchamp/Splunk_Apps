define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/logs/logs.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/dropdownview",
    "./Logs.View.pcss"
], function(
    $,
    _,
    Backbone,
    BaseView,
    FiltersView,
    LogsTemplate,
    mvc,
    SearchManager,
    TableView,
    DropdownView
){
    return BaseView.extend({
        template: LogsTemplate,
        /**
        * @param {Object} options {
        *     model: {
        *         classicUrl: <models/classicurl>
        *     }
        * }
        */
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            options = options || {};

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");

            this.searches = {};

            // bottom table query
            this.searches.tableSearch = new SearchManager({
                id: 'table-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: ' tag=mint sourcetype="mint:log" AND $filters.queryAll$' +
                        ' | lookup logLevelLookup sdk_idx as level OUTPUT lv_name as Level' +
                        ' | spath input=_raw | mvexpand log_name | rename log_name as Name' +
                        ' | table _time, Level, Name'
            }, {tokens: true});

            // Table view
            this.children.tableView = new TableView({
                id: "populate-table",
                managerid: "table-search",
                pageSize: "10",
                drilldown: "cell",
                drilldownRedirect: false
            });

            // Filters panel - will set search token $filtersQuery$
            this.children.filtersView = new FiltersView({
                model: {
                    classicUrl: this.model.classicUrl,
                    project: this.model.project
                },
                collection: {
                    projects: this.collection.projects
                },
                filters: [
                    'appVersion',
                    'osVersion',
                    'locale',
                    'connection',
                    'carrier',
                    'logLevel'
                ]
            });
        },

        events: {
            'click #toggle-filters': 'onToggleFiltersClick',
        },

        onToggleFiltersClick: function() {
            if (this.children.filtersView.isCollapsed) {
                this.children.filtersView.expand();
            } else {
                this.children.filtersView.collapse();
            }
            this.$('.FiltersRight').toggleClass('filters-small');
            this.$('.BodyLeft').toggleClass('filters-hidden');
        },

        populateProject: function() {
            var projectName = this.model.classicUrl.get('proj');

            this.model.project = this.collection.projects.findByName(projectName);
            this.tokens.set('project', this.model.project.genSearchString('All_MINT.packageName'));
        },

        activate: function() {
            // initialize project
            this.populateProject();

            // setup classic url listener to update project
            this.listenTo(this.model.classicUrl, 'change:proj', this.populateProject);

            _.each(this.searches, function(search){
                search.startSearch();
            });

            return BaseView.prototype.activate.apply(this, arguments);
        },

        render: function(){
            this.$el.html(this.compiledTemplate({}));

            this.$("#bottom-table").append(this.children.tableView.render().el);

            this.$('.FiltersRight').append(this.children.filtersView.render().el);

            return this;
        }
    });
});
