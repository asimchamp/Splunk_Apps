require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tokenutils',
    'util/console',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView, SearchManager, TokenUtils, console) {

    var SearchBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
        initialize: function(options) {
            if (!options.queryBuilder) {
                throw new Error('queryBuilder should be set.');
            }
            this._template = _.template(options.template);
            this._queryBuilder = options.queryBuilder;

            // Because only one row can be expanded at a time we can
            // reuse SearchManager and deferred object for all rows.
            var searchManager = this._searchManager = new SearchManager(_.extend({
                id: 'example1-details-search-manager',
                preview: false,
                earliest_time: '0',
                latest_time: ''
            }, options.searchOptions));

            searchManager.on('all', function(evt) {
                console.log('SEARCH', evt, Array.prototype.slice.call(arguments, 1));
            });

            this._results = searchManager.data('results', { count: 0, output_mode: 'json' });

            this._results.on('all', function(evt) {
                console.log('RESULTS', evt, Array.prototype.slice.call(arguments, 1));
            });
        },
        canRender: function(rowData) {
            return true;
        },
        getData: function() {
            var dfd = $.Deferred();
            this._results.once('data', function(results) {
                dfd.resolve(results);
            });
            return dfd.promise();
        },
        render: function($container, rowData) {
            var that = this;
            $container.height(106).html('<div class="text-center" style="padding: 40px;">Waiting for data...</div>');
            var searchManager = this._searchManager;
            var query = that._queryBuilder(rowData);
            console.log('Searching for', query);
            searchManager.set({ search: query });
            this.getData().then(function(results) {
                var data = results.data();
                console.log('data', data);
                if (data.results.length === 0) {
                    $container.html('<div class="text-center">No results...</div>');
                } else {
                    $container.html(that._template({ obj: data.results }));
                }
            });
        },

        teardown: function($container, rowData) {
        }
    });

    var table1RowExpansionRenderer = new SearchBasedRowExpansionRenderer({
        template: '<div>' +
            '<strong>Top Districts</strong>' +
            '<ul class="unstyled">' +
            '<% _.each(obj, function(stat) { %>' +
            '<li><%= stat.PdDistrict %> - <code><%= stat.count %></code></li>' +
            '<% }); %>' +
            '</ul>' +
            '</div>',
        queryBuilder: function(rowData) {
            var queryTemplate = 'index=sfpd Category=$category|s$ | top PdDistrict limit=5';
            return TokenUtils.replaceTokenNames(queryTemplate, { category: rowData.values[0] });
        }
    });

    mvc.Components.getInstance("example1").getVisualization(function(tableView1) {
        tableView1.addRowExpansionRenderer(table1RowExpansionRenderer);
        tableView1.render();
    });
});
