
require(['jquery', 'underscore', 'splunkjs/mvc', 'splunkjs/mvc/tableview', 'splunkjs/mvc/simplexml/ready!'], function($, _, mvc, TableView)
{
   var TimebarCellRenderer = TableView.BaseCellRenderer.extend(
   {
      // Called to check whether to invoke our custom renderer
      canRender: function(cell)
      {
         return (cell.field === 'Wake timer owner' || cell.field === 'Wake source text');
      },
      
      // The render function is only called when canRender returns true
      render: function($td, cell)
      {
         if (cell.value === null)
         {
            return;
         }

         if (cell.field === 'Wake timer owner' || cell.field === 'Wake source text')
         {
            var message = cell.value;

            $td.html(_.template('<div title="<%- tooltip %>"> <%- text %></div>',
            {
               text:       message,
               tooltip:    message
            }));
         }
      }
   });

   mvc.Components.get('Table_Panel31DrillDown').getVisualization(function(tableView)
   {
      // Register custom cell renderer
      tableView.table.addCellRenderer(new TimebarCellRenderer());
      
      // Force the table to re-render
      tableView.table.render();
   });
});