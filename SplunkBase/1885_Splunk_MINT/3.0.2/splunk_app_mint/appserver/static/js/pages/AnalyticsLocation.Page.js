define([
    'app/routers/AnalyticsLocation.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    AnalyticsLocationRouter,
    router_utils,
    Backbone,
    _
) {
    var analyticsLocationRouter = new AnalyticsLocationRouter();
    router_utils.start_backbone_history();
});

