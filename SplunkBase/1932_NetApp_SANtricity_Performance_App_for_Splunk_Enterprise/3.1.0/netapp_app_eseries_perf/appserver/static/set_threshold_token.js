require(['splunkjs/mvc','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function(mvc, utils){
	var unsubmittedTokens = mvc.Components.getInstance('default');
	var submittedTokens = mvc.Components.getInstance('submitted');

	// Set the token $thrasholdValue$ to the name of the current app
	unsubmittedTokens.set('thresholdValue', '0');
	submittedTokens.set('thresholdValue', '0');
/*
	$('input[type=text]').change(function(){
		var unsubmittedTokens = mvc.Components.getInstance('default');
		var submittedTokens = mvc.Components.getInstance('submitted');
		var noValue;

		// Set the token $thrasholdValue$
		unsubmittedTokens.set('thresholdValue', $(this).val());
		unsubmittedTokens.set('readVolumeGroup', noValue);
		unsubmittedTokens.set('writeVolumeGroup', noValue);

		// Submit the tokeni $thrasholdValue$
		submittedTokens.set('thresholdValue', $(this).val());
                submittedTokens.set('readVolumeGroup', noValue);
                submittedTokens.set('writeVolumeGroup', noValue);
        });*/

	$(".btn-primary").on("click", function() {
		var newValue;

		// Clearing the value for the $readVolumeGroup$ token
		unsubmittedTokens.set('readVolumeGroup', newValue);
        	submittedTokens.set('readVolumeGroup', newValue);

		// Clearing the value for the $writeVolumeGroup$ token
        	unsubmittedTokens.set('writeVolumeGroup', newValue);
        	submittedTokens.set('writeVolumeGroup', newValue);
	});
});
