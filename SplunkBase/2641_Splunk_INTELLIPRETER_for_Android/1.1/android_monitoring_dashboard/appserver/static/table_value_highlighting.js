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
            return cell.field !== 'Crash_Report.EVENTSLOG.item' ;
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = parseFloat(cell.value);
            // Apply interpretation for number of historical searches
           //if (tr:nth-child(1)==='KPI1') {
			
			//for (i=0;i<7<i++){
			 
			
			 
			 //  if(cell.field==="KPI1")
			//   {
					if (value.indexOf('am_crash') !== -1) {
						$td.addClass('range-cell').addClass('range-crash');
					}
					else if (value.indexOf('am_proc_start') !== -1) {
						$td.addClass('range-cell').addClass('range-proc_start');
					}
					else{
						$td.addClass('range-cell').addClass('range-Free');
					}
			//	}
				
				
            // }
            // Apply interpretation for number of realtime searches
           // if (cell.field === 'active_realtime_searches') {
            //    if (value > 1) {
            //        $td.addClass('range-cell').addClass('range-severe');
               // }
            //}
            // Update the cell content
			//***************** changed here --> commented below line
            //$td.text(value.toFixed(2)).addClass('numeric');
        }
    });
	
	 var CustomRangeRenderer2 = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Enable this custom cell renderer for both the active_hist_searches and the active_realtime_searches field
            return cell.field !== 'Crash_Report.DROPBOX' ;
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = parseFloat(cell.value);
            // Apply interpretation for number of historical searches
           //if (tr:nth-child(1)==='KPI1') {
			
			//for (i=0;i<7<i++){
			 
			
			 
			   if(cell.field==='Crash_Report.DROPBOX')
			   {
					if (value.indexOf('Build') !== -1) {
						$td.addClass('range-cell').addClass('range-Build');
					}
					else if (value.indexOf('Package') !== -1) {
						$td.addClass('range-cell').addClass('range-Package');
					}
					else{
						$td.addClass('range-cell').addClass('range-Free');
					}
				}
				
				
            // }
            // Apply interpretation for number of realtime searches
           // if (cell.field === 'active_realtime_searches') {
            //    if (value > 1) {
            //        $td.addClass('range-cell').addClass('range-severe');
               // }
            //}
            // Update the cell content
			//***************** changed here --> commented below line
            //$td.text(value.toFixed(2)).addClass('numeric');
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
	   mvc.Components.get('highlight2').getVisualization(function(tableView) {
        // Add custom cell renderer
        tableView.table.addCellRenderer(new CustomRangeRenderer2());
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