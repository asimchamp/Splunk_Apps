require.config({
    paths: {
        jquery_dx: '../app/EMC-app-XtremIO/lib/jquery_dx',
        underscore_utils: '../app/EMC-app-XtremIO/lib/underscore-min'
    }
});

require([
    'jquery_dx',
    'underscore_utils',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, TableView) {

     // Row Coloring Example with custom, client-side range interpretation

    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return _(['System State']).contains(cell.field);
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = cell.value;
            // Apply interpretation for number of historical searches
            
	if (cell.field === 'System State') {
                if (value != 'active') {
                    $td.addClass('range-cell').addClass('range-severe');
                }
            }
             
            // Update the cell content
            $td.text(value).addClass('numeric');
        }
    });

	 mvc.Components.get('highlight_system_state').getVisualization(function(tableView) {
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

