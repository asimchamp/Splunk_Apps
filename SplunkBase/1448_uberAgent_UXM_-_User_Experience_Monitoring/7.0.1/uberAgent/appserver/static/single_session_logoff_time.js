
require(['jquery', 'underscore', 'splunkjs/mvc', 'splunkjs/mvc/tableview', 'splunkjs/mvc/simplexml/ready!'], function($, _, mvc, TableView)
{
   var TimebarCellRenderer = TableView.BaseCellRenderer.extend(
   {
      // Called to check whether to invoke our custom renderer
      canRender: function(cell)
      {
         return (cell.field === 'Lifetime' || cell.field === 'Command line');
      },
      
      // The render function is only called when canRender returns true
      render: function($td, cell)
      {
         if (cell.value === null)
         {
            return;
         }

         if (cell.field === 'Lifetime')
         {
            var elements = cell.value.split (";");
            if (elements.length != 4)
            {
               return;
            }
            var startRelativeTime = elements[0];
            var lifetime = elements[1];
            var totalDuration = elements[2];
            var processType = elements[3];
            
            var startTimeRelativeInt = parseInt(startRelativeTime, 10);
            var lifetimeInt = parseInt(lifetime, 10);
            var totalDurationInt = parseInt(totalDuration, 10);

            var endRelativeTime = startTimeRelativeInt + lifetimeInt;

            var cellWidth = 0;

            // Calculate the width of the cell
            if (startTimeRelativeInt <  totalDurationInt && totalDurationInt > 0)
            {
               if (startTimeRelativeInt + lifetimeInt > totalDurationInt)
               {
                  // Cell would be too large. Limit it to the size of the cell
                  cellWidth = (totalDurationInt - startTimeRelativeInt) / totalDurationInt * 100;
               }
               else
               {
                  // Cell width fits
                  cellWidth = lifetimeInt / totalDurationInt * 100;
               }
            }

            var color = "#1e93c6";
            if (processType === "User profile")
            {
               color = "#99712b";
            }
            else if (processType === "Session teardown")
            {
               color = "#d6563c";
            }
            else if (processType === "GP logoff script")
            {
               color = "#6a5c9e";
            }
            
            $td.addClass('timebar-cell').html(_.template('<div title="<%- tooltip %>" class="timebar-wrapper"><div class="timebar" style="margin-left:<%- leftPercent %>%; width:<%- widthPercent %>%; background-color:<%- color %>;"></div></div>',
            {
               leftPercent:   startRelativeTime / totalDuration * 100,
               widthPercent:  cellWidth,
               tooltip:       "Relative start time (ms): " + startRelativeTime + "\n" + "Lifetime (ms): " + lifetime + "\n" + "Relative end time (ms): " + endRelativeTime,
               color:         color
            }));
         }
         else if (cell.field === 'Command line')
         {
            var message = cell.value;
            var tooltip = cell.value;
            
            message = message.replace ("\\SystemRoot\\System32\\", "...\\");
            message = message.replace ("%SystemRoot%\\system32\\", "...\\");
            message = message.replace ("\\??\\C:\\Windows\\system32\\", "...\\");
            message = message.replace ("C:\\Windows\\system32\\", "...\\");
            message = message.replace ("C:\\Program Files (x86)\\", "...\\");
            message = message.replace ("C:\\Program Files\\", "...\\");
            message = message.replace ("C:\\Windows\\SysWOW64\\", "...\\");
            message = message.replace ("C:\\Windows\\", "...\\");
            if (message.length > 50)
            {
               message = message.substring(0, 49) + "...";
            }
               
            $td.html(_.template('<div title="<%- tooltip %>"> <%- text %></div>',
            {
               text:       message,
               tooltip:    tooltip
            }));
         }
      }
   });

   mvc.Components.get('Table_Panel31').getVisualization(function(tableView)
   {
      // Register custom cell renderer
      tableView.table.addCellRenderer(new TimebarCellRenderer());
      
      // Force the table to re-render
      tableView.table.render();
   });
});