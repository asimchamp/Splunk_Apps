define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/Base.View',
    "app/views/shared/Filters.View",
    "app/contrib/text!app/templates/events/events.template.html",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "app/views/shared/charts/MintTable.View",
    "app/views/shared/charts/MintChart.View",
    "app/views/shared/MintBreadcrumbs.View",
    "splunkjs/mvc/utils",
    "./Events.View.pcss"
], function(
    $,
    _,
    Backbone,
    BaseView,
    FiltersView,
    EventsTemplate,
    mvc,
    SearchManager,
    TableView,
    ChartView,
    BreadCrumbsView,
    splunkjs_utils
){

    var FILTERS_SEARCH = '$filters.tstatsQueryAll$',
        PROJECT_SEARCH = '$project$',
        SPAN_SETTING = 'span=$filters.span$',
        CONTEXT_SEARCH = PROJECT_SEARCH + ' AND ' + FILTERS_SEARCH;

    var TOKENS_INCLUDELIST = ['eventName'];

    var TOP_EVENTS_TABLE =
        ' | tstats dc(All_MINT.uuid) as Uniques count as Count' +
        ' FROM datamodel=MINT' +
        ' WHERE (nodename=All_MINT.Usage.Events) AND ' + CONTEXT_SEARCH +
        ' AND All_MINT.Usage.Events.event_name="$eventName$"' +
        ' BY All_MINT.Usage.Events.event_name' +
        ' | eventstats sum(Count) AS TotalCount' +
        ' | eval EventFreq=round((Count/TotalCount)*100, 2)' +
        ' | eval EventPerUnique=round((Count/Uniques),2)' +
        ' | appendcols ' +
        ' [| tstats count as CountBySpan FROM datamodel=MINT' +
        '  WHERE (nodename=All_MINT.Usage.Events) AND ' + CONTEXT_SEARCH +
        ' AND All_MINT.Usage.Events.event_name="$eventName$"' +
        ' BY All_MINT.Usage.Events.event_name, _time ' + SPAN_SETTING +
        ' | stats sparkline(sum(CountBySpan)) AS Trend by All_MINT.Usage.Events.event_name]' +
        ' | rename All_MINT.Usage.Events.event_name as Event' +
        ' | table Event, Uniques, Count, EventPerUnique, EventFreq, Trend' +
        ' | rename Count as "Occurrences"' +
        ' | rename Uniques as "Users"' +
        ' | rename EventFreq as "% of total occurrences"' +
        ' | rename EventPerUnique as "Events per user"' +
        ' | sort - "Users"'  +
        ' | fields - "$fieldRemove$"';

    var TOP_EVENTS_CHART =
        ' | tstats count FROM datamodel=MINT WHERE (nodename=All_MINT.Usage.Events) AND ' + CONTEXT_SEARCH +
        ' AND All_MINT.Usage.Events.event_name="$eventName$"' +
        ' BY All_MINT.Usage.Events.event_name, _time ' + SPAN_SETTING +
        ' | timechart ' + SPAN_SETTING + ' sum(count) by All_MINT.Usage.Events.event_name where max in top5, otherstr=Other';

    return BaseView.extend({
        template: EventsTemplate,
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('eventName', '*');
            this.tokensIncludelist = TOKENS_INCLUDELIST;

            this.tokens.set('fieldRemove', ' ');
            this.searches = {};

            this.searches.topEventsTableSearch = new SearchManager({
                id: 'top-events-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: TOP_EVENTS_TABLE
            }, {tokens: true});

            this.searches.topEventsChartSearch = new SearchManager({
                id: 'top-events-chart-search',
                earliest_time: "$filters.earliest$",
                latest_time: "$filters.latest$",
                search: TOP_EVENTS_CHART
            }, {tokens: true});

            this.children.topEventsChartView = new ChartView({
                id: "top-events-chart",
                managerid: "top-events-chart-search",
                title: "Events",
                type: "line",
                drilldown: "none",
                height: "220px",
                classicUrl: this.model.classicUrl,
                data: "results",
                output_mode: "json",
                multiSeries: true,
                chartOptions:  {
                    colors: ['#1695a9', '#34c0d6', '#6fc7ae', '#9fd390', '#e6cd24',
                        '#e6ad24', '#ed5a53', '#ea4854', '#c33f5e', '#a4226f'],
                    chart: {
                        type: 'spline',
                        marginTop: 50
                    },
                    legend: {
                        align: 'right',
                        enabled: true,
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

            this.children.topEventsTableView = new TableView({
                id: "top-events-table",
                managerid: "top-events-search",
                classicUrl: this.model.classicUrl,
                pageSize: "10",
                drilldown: "row",
                drilldownRedirect: false
            });
            
            this.children.topEventsTableView.on('table:drilldown', this.onDrilldown, this);

            this.searches.topEventsTableSearch.on('change', function(){
                this.children.topEventsTableView.paginator.settings.set('page', 0);
            }.bind(this));
            
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
              title: "Events",
              breadcrumbs: ["eventName"],
                defaultValues: {
                    eventName: '*'
                }
          });
        },

      tokenEvents: {
          "change:eventName": 'onChangeEventName'
      },

      onDrilldown: function (e) {
        var tableValue = e.data["click.value"],
        classicUrl = this.model.classicUrl;

        e.preventDefault();

        if (this.tokens.get('eventName') != '*' ) {
            var url = "search?q=tag=mint sourcetype=\"mint:event\" event_name=\"" + tableValue + "\"";
            splunkjs_utils.redirect(url);
        } else {
            classicUrl.save({eventName: tableValue});
        }

      },

      onChangeEventName: function (model, value) {
            if (value !== "*") {
                // this.children.topEventsTableView.settings.set('drilldown', 'none');
                // Remove redundant '% of total occurrences' column, it will always be 100 here
                this.tokens.set('fieldRemove', '% of total occurrences');
            } else {
                // this.children.topEventsTableView.settings.set('drilldown', 'row');
                // Put back '% of total occurrences column', we need it for top level views
                this.tokens.set('fieldRemove', ' ');
            }
        },

        render: function(){
            // Before rendering, force the changeEventName event just to enforce the drilldown settings
            // or removed column settings in case the user refreshes from inside the drilldown. If the
            // user refreshes inside the drilldown without this line, the eventName won't undergo a 
            // change event, which means the default, top-level drilldown and column settings will show.
            this.onChangeEventName(this.model, this.model.classicUrl.get('eventName'));
            
            this.$el.html(this.compiledTemplate({}));

            this.$(".normal .big-graph").append(this.children.topEventsChartView.render().el);
            this.$(".normal .table").append(this.children.topEventsTableView.render().el);

            this.$('.NavBreadcrumb').append(this.children.breadCrumbsView.render().el);
            this.$('.FiltersRight').append(this.children.filtersView.render().el);

            return this;
        }
    });
});

