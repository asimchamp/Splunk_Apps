require([
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc',
    'underscore',
    'splunkjs/mvc/simplexml/ready!'],function(
    TableView,
    ChartView,
    SearchManager,
    mvc,
    _
    ){

    var EventSearchBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
        initialize: function(args) {
            // initialize will run once, so we will set up a search and a chart to be reused.
            this._searchManager = new SearchManager({
                id: 'process-search-manager',
		earliest_time: "-7d@d",
		latest_time: "now",
                preview: false
            });
            this._chartView = new ChartView({
                managerid: 'process-search-manager',
		type:'pie',
                'charting.legend.placement': 'true'
            });
        },

        canRender: function(rowData) {
            // Since more than one row expansion renderer can be registered we let each decide if they can handle that
            // data
            // Here we will always handle it.
            return true;
        },

        render: function($container, rowData) {
            // rowData contains information about the row that is expanded.  We can see the cells, fields, and values
            // We will find the sourcetype cell to use its value
            var sourcetypeCell = _(rowData.cells).find(function (cell) {
               return cell.field === 'User';
            });
            
            sourcetypeCell = sourcetypeCell.value.replace(/\\/g, "\\\\");
            //update the search with the sourcetype that we are interested in
            this._searchManager.set({ search: 'sourcetype=cisco:nvm:flowdata liuid=' + sourcetypeCell + ' | top pn limit=15'});

            // $container is the jquery object where we can put out content.
            // In this case we will render our chart and add it to the $container
            $container.append(this._chartView.render().el);
        }
    });

    var tableElement = mvc.Components.getInstance("expand_with_events");
    tableElement.getVisualization(function(tableView) {
        tableView.addRowExpansionRenderer(new EventSearchBasedRowExpansionRenderer());
        tableView.render();
    });
});
