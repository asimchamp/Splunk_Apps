/**
 * This cell renderer allows cells with MV values to be opened and closed.
 */
define(function(require, exports, module) {
	
    // Load dependencies
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var $ = require('jquery');
    
    var TableView = require("splunkjs/mvc/tableview");
    
    var ExtraFieldRowExpansionRowRenderer = TableView.BaseRowExpansionRenderer.extend({
		 
	     defaults: {
	            fieldsToShowCount: 2,
	            dropEmptyCells: true
	     },
		 
	     initialize: function() {
	            
	    	 args = _.extend({}, this.defaults);
	    
	         for( var c = 0; c < arguments.length; c++){
	        	 args = _.extend(args, arguments[c]);
	         }
	    
	         // Get the arguments
	         this.fieldsToShowCount = args.fieldsToShowCount;
	         
	         
	         this._template = 	'<table> \
	        	 				<% for(var c = 0; c < cells.length; c++) { %> \
	        	 				<% if((cells[c].value !== null && cells[c].value.length > 0) || !dropEmptyCells) { %> \
	        	 				<tr> \
	        	 				<td style="font-weight: bold; border: 1px solid #BBB"><%- cells[c].field %></td> \
	        	 				<% if(cells[c].value) { %> \
	        	 				<td style="border: 1px solid #BBB"><%- cells[c].value %></td> \
	        	 				<% } else { %> \
	        	 				<td style="border: 1px solid #BBB"></td> \
	        	 				<% } %> \
	        	 				</tr> \
	        	 				<% } %> \
	        	 				<% } %> \
	        	 				</table>';
	         
	         this._template = 	'<table> \
	 				<% for(var c = 0; c < cells.length; c++) { %> \
	 				<% if((cells[c].value !== null && cells[c].value.length > 0) || !dropEmptyCells) { %> \
	 				<tr> \
	 				<td style="font-weight: bold;"><%- cells[c].field %></td> \
	 				<% if(cells[c].value) { %> \
	 				<td style=""><%- cells[c].value %></td> \
	 				<% } else { %> \
	 				<td style=""></td> \
	 				<% } %> \
	 				</tr> \
	 				<% } %> \
	 				<% } %> \
	 				</table>';
	         
	         
	         this._template = 	'<table> \
	        	 	<tr><td style="font-weight: bold;">Additional Fields</td><td style="font-weight: bold;">Value</td></tr> \
	 				<% for(var c = 0; c < cells.length; c++) { %> \
	 				<% if((cells[c].value !== null && cells[c].value.length > 0) || !dropEmptyCells) { %> \
	 				<tr> \
	 				<td style=""><%- cells[c].field %></td> \
	 				<% if(cells[c].value) { %> \
	 				<td style=""><%- cells[c].value %></td> \
	 				<% } else { %> \
	 				<td style=""></td> \
	 				<% } %> \
	 				</tr> \
	 				<% } %> \
	 				<% } %> \
	 				</table>';
	     },
	     
	     
	     
	     hideExtraColumns: function(cid){
	    	 
	    	 $('head').append('<style type="text/css">'
	    			 + '[data-cid="' + cid + '"] > table > thead > tr > th:nth-child(n+' + (this.fieldsToShowCount + 2) + '){ display: none; }'
	    			 + '[data-cid="' + cid + '"] > table > tbody > tr > td:nth-child(n+' + (this.fieldsToShowCount + 2) + '){ display: none; }'
	    			 + '</style>');
	    	 
	    	 
	    	 $('[data-cid="' + cid + '"] > table > thead > tr > th:nth-child(n+' + (this.fieldsToShowCount + 2) + ')').hide();
    		 $('[data-cid="' + cid + '"] > table > tbody > tr > td:nth-child(n+' + (this.fieldsToShowCount + 2) + ')').hide();
	     },
	     
    	 canRender: function(rowData) {
    		 return true;
		 },
		 
		 render: function($container, rowData) {
			 
			 
			 var cellsToShow = rowData.cells.slice(this.fieldsToShowCount,1000);
			 
			 $container.html( _.template(this._template,{
	            	cells: cellsToShow,
	            	dropEmptyCells: this.dropEmptyCells
	         }) );
			 
			 //this._el.appendTo($container);
		 }
		 
    	});
    
    return ExtraFieldRowExpansionRowRenderer;
    
});

