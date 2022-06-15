requirejs([
    'splunkjs/mvc',
    // This could be a static import but we _want_ the Splunk runtime version
    // since it'll be populated with the username
    'splunk.config',
    'splunkjs/mvc/simplexml/ready!'
], function(mvc, SplunkConfig) {
    var unsubmittedTokens = mvc.Components.getInstance('default');
    var submittedTokens = mvc.Components.getInstance('submitted');

    // Set the token $currentUser$ to the name of the currently logged in user
    var username = SplunkConfig['USERNAME'];
    unsubmittedTokens.set('currentUser', username);
    submittedTokens.set('currentUser', username);
});