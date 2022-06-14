require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {

     // Row Coloring Example with custom, client-side range interpretation

    console.log("bla");
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Enable this custom cell renderer for both the active_hist_searches and the active_realtime_searches field
            return _(['message_type']).contains(cell.field);
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = cell.value;

            if (cell.field === 'message_type') {
                if (value === 'network_alert') {
                    $td.addClass('range-cell').addClass('alert');
                }
            }
            if (cell.field === 'message_type') {
                if (value === 'binary_alert') {
                    $td.addClass('range-cell').addClass('alert');
                }
            }
            if (cell.field === 'message_type') {
                if (value === 'new_user_alert') {
                    $td.addClass('range-cell').addClass('alert');
                }
            }
            if (cell.field === 'message_type') {
                if (value === 'vulnerable_alert') {
                    $td.addClass('range-cell').addClass('alert');
                }
            }
            // Update the cell content
            //$td.text(value.toFixed(2)).addClass('numeric');
            //$td.text(value).addClass('numeric');
            $td.text(value);
        }
    });

    mvc.Components.get('highlight').getVisualization(function(tableView) {
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
