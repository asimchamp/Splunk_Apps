require(['jquery','underscore','splunkjs/mvc','util/console','splunkjs/mvc/simplexml/ready!'], function($, _, mvc, console){    
    // Get a reference to the dashboard panels
    var masterView = mvc.Components.get('master');
    var detailView = mvc.Components.get('detail');

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    var urlTokens = mvc.Components.get('url');

    if(!submittedTokens.has('sourcetype')) {
        // if there's no value for the $sourcetype$ token yet, hide the dashboard panel of the detail view
        detailView.$el.parents('.dashboard-panel').hide();
    }
    
    submittedTokens.on('change:agentguid', function(){
        // When the token changes...
        if(!submittedTokens.get('agentguid')) {
            // ... hide the panel if the token is not defined
            detailView.$el.parents('.dashboard-panel').hide();
        } else {
            // ... show the panel if the token has a value
            detailView.$el.parents('.dashboard-panel').show();
        }
        if(!submittedTokens.get('computername')) {
            // ... hide the panel if the token is not defined
            detailView.$el.parents('.dashboard-panel').hide();
        } else {
            // ... show the panel if the token has a value
            detailView.$el.parents('.dashboard-panel').show();
        }

    });

    masterView.on('click', function(e) {
        e.preventDefault();
        var newValue = e.data['row.agentguid'];
        var newValue2 = e.data['row.computername'];
        
        // Submit the value for the sourcetype field
        unsubmittedTokens.set('form.agentguid', newValue);
        unsubmittedTokens.set('form.computername', newValue2);
        submittedTokens.set(unsubmittedTokens.toJSON());
        urlTokens.saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
            replaceState: false
        });

    });
});
