require(['jquery','underscore','splunkjs/mvc','util/console','splunkjs/mvc/simplexml/ready!'], function($, _, mvc, console){    
    // Get a reference to the dashboard panels
    var masterView = mvc.Components.get('master');
    var detailView = mvc.Components.get('detail');
	var masterView2 = mvc.Components.get('master2');
	var detailView2 = mvc.Components.get('detail2');

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    var urlTokens = mvc.Components.get('url');


    if(!submittedTokens.has('Owner2')) {
        // if there's no value for the $Type$ token yet, hide the dashboard panel of the detail view
        detailView.$el.parents('.dashboard-panel').hide();
    }
   
	if(!submittedTokens.has('Queue2')) {
	    detailView2.$el.parents('.dashboard-panel').hide();
    }
	        

    submittedTokens.on('change:Owner2', function(){
        // When the token changes...
        if(!submittedTokens.get('Owner2')) {
            // ... hide the panel if the token is not defined
            detailView.$el.parents('.dashboard-panel').hide();
        } else {
            // ... show the panel if the token has a value
            detailView.$el.parents('.dashboard-panel').show();
        }

		});
	submittedTokens.on('change:Queue2', function(){
        if(!submittedTokens.get('Queue2')) {
             detailView2.$el.parents('.dashboard-panel').hide();
        } else {
            detailView2.$el.parents('.dashboard-panel').show();
        }
    });

    masterView.on('click', function(e) {
        e.preventDefault();
        var newValue = e.data['click.value'];
        var newValue2 = e.data['click.name2'];
        // Submit the value for the Type field
        unsubmittedTokens.set('form.Owner2', newValue);
        unsubmittedTokens.set('form.Type', newValue2);
        submittedTokens.set(unsubmittedTokens.toJSON());
        urlTokens.saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
            replaceState: false
        });
    });


        masterView2.on('click', function(e) {
	        e.preventDefault();
            var newValue = e.data['click.value'];
            var newValue2 = e.data['click.name2'];
            unsubmittedTokens.set('form.Queue2', newValue);
            unsubmittedTokens.set('form.Type2', newValue2);
            submittedTokens.set(unsubmittedTokens.toJSON());
            urlTokens.saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
                replaceStatie: false
           });
       });
        		                                
});
