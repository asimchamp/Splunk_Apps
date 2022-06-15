requirejs([
    // It's important that these don't end in ".js" per RJS convention
    '../app/simple_xml_examples/libs/jquery-3.6.0-umd-min',
    '../app/simple_xml_examples/libs/underscore-1.6.0-umd-min',
    '../app/simple_xml_examples/theme_utils',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, themeUtils, mvc, TableView) {
    var isDarkTheme = themeUtils.getCurrentTheme() === 'dark';

    // Row Coloring Example with custom, client-side range interpretation

    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Enable this custom cell renderer for both the active_hist_searches and the active_realtime_searches field
            return _(['active_hist_searches', 'active_realtime_searches']).contains(cell.field);
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = parseFloat(cell.value);

            // Apply interpretation for number of historical searches
            if (cell.field === 'active_hist_searches') {
                if (value > 2) {
                    $td.addClass('range-cell').addClass('range-elevated');
                }
            }

            // Apply interpretation for number of realtime searches
            if (cell.field === 'active_realtime_searches') {
                if (value > 1) {
                    $td.addClass('range-cell').addClass('range-severe');
                }
            }

            // Update the cell content
            $td.text(value.toFixed(2)).addClass('numeric');
        }
    });

    mvc.Components.get('highlight').getVisualization(function(tableView) {
        tableView.on('rendered', function() {
            // Apply class of the cells to the parent row in order to color the whole row
            tableView.$el.find('td.range-cell').each(function() {
                $(this).parents('tr').addClass(this.className);
            });

            if (isDarkTheme) {
                tableView.$el.find('td.timestamp').each(function() {
                    $(this).parents('tr').addClass('dark');
                });
            }
        });
        // Add custom cell renderer, the table will re-render automatically.
        tableView.addCellRenderer(new CustomRangeRenderer());
    });

});