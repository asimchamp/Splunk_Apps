require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
],
function(
    $,
    _,
    mvc
) {
    var service = mvc.createService();

    if(service.app !== "d3plus") {
        alert(
            'WARNING! Your app name is not "d3plus" so all the dashboads will probably not work.\n\n' +
            'Rename the app (folder name) to "d3plus" and restart Splunk.'
        );
    }
});
