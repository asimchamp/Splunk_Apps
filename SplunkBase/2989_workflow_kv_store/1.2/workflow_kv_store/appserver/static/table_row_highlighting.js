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
            return _(['email']).contains(cell.field);
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = String(cell.value);

            // Apply interpretation for number of historical searches
            if (cell.field === 'email') {
                if (value.split(';')[1] == 1) {
                    $td.addClass('range-cell').addClass('range-severe');
                }
                 
                                                                
            if (value.split(';')[1] == 2) {
                $td.addClass('range-cell').addClass('range-low');
                }

            if (value.split(';')[1] == 3) {
                $td.addClass('range-cell').addClass('range-confirm');
                }
                                                                
            if (value.split(';')[1] == 4) {
                $td.addClass('range-cell').addClass('range-back');
                }

            }

           
            // Update the cell content
            $td.text(value.split(';')[0]).addClass('text');
        }
    });
        if(typeof mvc.Components.get('content_table') != typeof undefined){
    mvc.Components.get('content_table').getVisualization(function(tableView) {
        tableView.on('rendered', function() {
            // Apply class of the cells to the parent row in order to color the whole row
            tableView.$el.find('td.range-cell').each(function() {
                $(this).parents('tr').addClass(this.className);
            });
        });
        // Add custom cell renderer, the table will re-render automatically.
        tableView.addCellRenderer(new CustomRangeRenderer());
    });
        }

        
        if(typeof mvc.Components.get('edit_table') != typeof undefined){
        mvc.Components.get('edit_table').getVisualization(function(tableView) {
            tableView.on('rendered', function() {
            // Apply class of the cells to the parent row in order to color the whole row
            tableView.$el.find('td.range-cell').each(function() {
            $(this).parents('tr').addClass(this.className);
        });
    });
        // Add custom cell renderer, the table will re-render automatically.
            tableView.addCellRenderer(new CustomRangeRenderer());
        });
        }
        
        
});