require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {
     // Row Coloring Example with custom, client-side range interpretation
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Enable this custom cell renderer for both the active_hist_searches and the active_realtime_searches field
            return _(['devFactor', 'DevFactor']).contains(cell.field);
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = parseFloat(cell.value);
            // Apply interpretation for number of historical searches
            if (cell.field === 'devFactor') {
                if (value > 1 || value < -1) {
                    $td.addClass('range-cell').addClass('range-severe');
                }
                else if (value > 0 || value < -0.5) {
                    $td.addClass('range-cell').addClass('range-elevated');
                }
                else if (value < 0) {
                    $td.addClass('range-cell').addClass('range-low');
                }
            }
            // Apply interpretation for number of realtime searches
            if (cell.field === 'DevFactor') {
                if (value > 1 || value < -0.5) {
                    $td.addClass('range-cell').addClass('range-severe');
                }
                else if (value > 0 || value < -0.5) {
                    $td.addClass('range-cell').addClass('range-elevated');
                }
                else if (value < 0) {
                    $td.addClass('range-cell').addClass('range-low');
                }
            }
            // Update the cell content
            $td.text(value.toFixed(2)).addClass('numeric');
        }
    });
    mvc.Components.get('highlight').getVisualization(function(tableView) {
        // Add custom cell renderer
        tableView.table.addCellRenderer(new CustomRangeRenderer());
        // tableView.on('rendered', function() {
            // Apply class of the cells to the parent row in order to color the whole row
           // tableView.$el.find('td.range-cell').each(function() {
           //     $(this).addClass(this.className);
           // });
        //});
        // Force the table to re-render
        tableView.table.render();
    });
});