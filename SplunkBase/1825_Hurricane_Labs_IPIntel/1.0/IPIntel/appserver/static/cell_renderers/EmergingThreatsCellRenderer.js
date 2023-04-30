define(function(require, exports, module) {
    
    // Load dependencies
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var $ = require('jquery');
    
    var BaseCellRenderer = require('views/shared/results_table/renderers/BaseCellRenderer');
    
    var EmergingThreatsCellRenderer = BaseCellRenderer.extend({
         canRender: function(cell) {
             return ($.inArray(cell.field, ["Emerging Threats IP Reputation"]) >= 0);
         },
         setup: function($td, cell) {
         },
         render: function($td, cell) {
             // Add the class so that the CSS can style the content
             $td.addClass(cell.value);
             //$td.addClass('critical');
             var allCols = [];
             var wrapper = $('#element5', this.$el);
             $td.html( cell.value );

        if( cell.field == "Emerging Threats IP Reputation" ) {
            var noneArr = ['Category: None', 'Score: None']
            wrapper.removeClass('critical');
            console.log('Current Value: ' + cell.value);
            if($.inArray(cell.value, noneArr) == -1) {
                wrapper.addClass('critical');
            }
        }

      }
    });
    
    return EmergingThreatsCellRenderer;
});
