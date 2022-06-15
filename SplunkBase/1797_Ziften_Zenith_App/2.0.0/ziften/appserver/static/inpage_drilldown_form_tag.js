require(['jquery','underscore','splunkjs/mvc','util/console','splunkjs/mvc/simplexml/ready!'], function($, _, mvc, console){    
    // Get a reference to the dashboard panels
    var masterView = mvc.Components.get('master');
    var othermasterView = mvc.Components.get('othermaster');
    var detailView = mvc.Components.get('detail');
    var moredetailView = mvc.Components.get('moredetail');

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    var urlTokens = mvc.Components.get('url');

    //if(!submittedTokens.has('sourcetype')) {
    //    // if there's no value for the $sourcetype$ token yet, hide the dashboard panel of the detail view
    //    detailView.$el.parents('.dashboard-panel').hide();
    //}
    //
    //submittedTokens.on('change:sourcetype', function(){
    //    // When the token changes...
    //    if(!submittedTokens.get('sourcetype')) {
    //        // ... hide the panel if the token is not defined
    //        detailView.$el.parents('.dashboard-panel').hide();
    //    } else {
    //        // ... show the panel if the token has a value
    //        detailView.$el.parents('.dashboard-panel').show();
    //    }
    //});

    masterView.on('click', function(e) {
        e.preventDefault();
        var newValue = e.data['row.tag'];
        
        // Submit the value for the sourcetype field
        unsubmittedTokens.set('form.tag', newValue);
        submittedTokens.set(unsubmittedTokens.toJSON());
        urlTokens.saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
            replaceState: false
        });

    });
    detailView.on('click', function(e) {
        e.preventDefault();
        var newValue = e.data['row.agentguid'];
        
        // Submit the value for the sourcetype field
        unsubmittedTokens.set('form.guid', newValue);
        submittedTokens.set(unsubmittedTokens.toJSON());
        urlTokens.saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
            replaceState: false
        });

    });

    moredetailView.on('click', function(e) {
        e.preventDefault();
        var newValue = e.data['row.ipaddress'];
        
        // Submit the value for the sourcetype field
        unsubmittedTokens.set('form.ipaddress', newValue);
        submittedTokens.set(unsubmittedTokens.toJSON());
        urlTokens.saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
            replaceState: false
        });

    });



});
