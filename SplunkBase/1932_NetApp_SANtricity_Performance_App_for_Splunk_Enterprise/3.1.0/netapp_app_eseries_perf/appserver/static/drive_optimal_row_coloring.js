require.config({
    paths: {
		jquery_netapp: '../app/netapp_app_eseries_perf/js/jquery_netapp',
        underscore_utils: '../app/netapp_app_eseries_perf/js/underscore-min'
    }
});

require([
    'jquery_netapp',
    'underscore_utils',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, TableView) {

    // Row Coloring Example with custom, client-side range interpretation
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
	canRender: function(cell) {
	    // Enable this custom cell renderer for these fields
	    return _(['Status']).contains(cell.field);
	},
	render: function($td, cell) {
	    // Add a class to the cell based on the returned value
	    var value = String(cell.value);

	    if (value != 'optimal') {
		$td.addClass('range-cell').addClass('range-elevated');
	    }
            $td.text(value);
	}
    });

    mvc.Components.get('drives_table').getVisualization(function(tableView) {
	// Add custom cell renderer
	tableView.table.addCellRenderer(new CustomRangeRenderer());
	tableView.on('rendered', function() {
	    // Apply class of the cells to the parent row in order to color the whole row
	    tableView.$el.find('td.range-cell').each(function() {
		$(this).parents('tr').addClass(this.className);
	    });
	});
	// Force the table to re-render
	tableView.table.render();
    });
});
