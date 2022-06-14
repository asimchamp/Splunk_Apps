require(['jquery'], function($){
	$(function() {

		// When the DOM is ready we move the input elements into the panels
		// where we want them to be displayed

		$('#field1').prependTo($('#table3 .panel-body')).find('label').hide();
		
	});
});
