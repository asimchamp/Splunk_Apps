
require.config({
    paths: {
        'waypoints': '../app/cisco-app-Nexus-9k/contrib/waypoints',
        'waypoints-sticky': '../app/cisco-app-Nexus-9k/contrib/waypoints-sticky.min'
    },
    
    shim: {
        'waypoints': {
            deps: ['jquery'],
            exports: 'waypoints'
        },
        'waypoints-sticky': {
            deps: ['jquery', 'waypoints'],
            exports: 'waypointsSticky'
        }
    }
});

require(['jquery', 'underscore', 'waypoints', 'waypoints-sticky'], function($, _, waypoint, waypointsSticky) {

    $('.section-nav').waypoint('sticky', {
        offset: -15
    });
    $(function(){
        // Set up smooth scrolling
        // taken from: http://stackoverflow.com/questions/7717527/jquery-smooth-scrolling-when-clicking-an-anchor-link
        $('a').click(function(){
            $('html, body').animate({
                scrollTop: $( $.attr(this, 'href') ).offset().top - 30
            }, 500);
            return false;
        });
    });

});
