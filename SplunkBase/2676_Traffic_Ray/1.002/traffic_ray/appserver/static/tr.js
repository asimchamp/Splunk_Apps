require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
    ],function(
      _,
      $,
      mvc,
      TableView
      ){

    //------------------------------------------------------
    // Highlight specified cells in table.
    // Row Coloring Example with custom, client-side range interpretation
    //
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Enable this custom cell renderer for both the active_hist_searches and the active_realtime_searches field
            return _(['IP', 'Site', 'Hits', 'Bandwidth']).contains(cell.field);
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            ///var value = parseFloat(cell.value);
            var value = cell.value;

            // Apply interpretation for number of historical searches
            if (cell.field === 'IP') 
              {
                ///if (value > 2) {
                ///    $td.addClass('range-cell').addClass('range-severe');
                ///}
                $td.addClass('ip-cell');
              }
            if (cell.field === 'Site') 
              {
                $td.addClass('site-cell');
              }
            else if (cell.field === 'Hits') 
              {
                $td.addClass('hits-cell');
              }
            else if (cell.field === 'Bandwidth')
              {
                $td.addClass('bandwidth-cell');
              }

            // Update the cell content
            $td.text(value);
        }
    });

    mvc.Components.get('table_summary_data').getVisualization(function(tableView) {
        // Add custom cell renderer
        tableView.table.addCellRenderer(new CustomRangeRenderer());
        // Force the table to re-render
        tableView.table.render();
    });
    //------------------------------------------------------

    //------------------------------------------------------
    // Adjust percentage of panel columns, instead of default 50/50
    // Grab the DOM for the first dashboard row
    var Row1 = $('.dashboard-row').first();
/// var Row2 = Row1.next();

    // Get the dashboard cells 
    // (which are the parent elements of the actual panels and define the panel size)
    var dashboardCellsR1 = $(Row1).children('.dashboard-cell');
/// var dashboardCellsR2 = $(Row2).children('.dashboard-cell');

    // Adjust the cells' width
    $(dashboardCellsR1[0]).css('width', '20%');
    $(dashboardCellsR1[1]).css('width', '80%');

/// $(dashboardCellsR2[0]).css('width', '60%');
/// $(dashboardCellsR2[1]).css('width', '40%');

    // Force visualizations (esp. charts) to be redrawn with their new size
    $(window).trigger('resize');
    //------------------------------------------------------
});
