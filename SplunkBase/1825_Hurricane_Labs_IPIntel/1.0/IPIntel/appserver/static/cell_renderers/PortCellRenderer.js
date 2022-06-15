define(function(require, exports, module) {
    
    // Load dependencies
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var $ = require('jquery');
    
    var BaseCellRenderer = require('views/shared/results_table/renderers/BaseCellRenderer');
    
    var PortCellRenderer = BaseCellRenderer.extend({
         canRender: function(cell) {
             return ($.inArray(cell.field, ["Open Ports"]) >= 0);
         },
         
         render: function($td, cell) {
             // Add the class so that the CSS can style the content
             $td.addClass(cell.value);
             $td.addClass('critical');

             // Handle the response_code
             if( cell.field == "Open Ports" ){
                     
                 var int_value = parseInt(cell.value, 10);
                 var openPortsArr = [22,135,137,445]; 

                if($.inArray(int_value, openPortsArr) > -1) {
                    $td.addClass('skull');
                }
                 
             }

                $td.html( cell.value );
             
         }
    });
    
    return PortCellRenderer;
});
