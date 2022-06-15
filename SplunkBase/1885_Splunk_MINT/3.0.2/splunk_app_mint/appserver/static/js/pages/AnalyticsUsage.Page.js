define([
    'app/routers/AnalyticsUsage.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    AnalyticsUsageRouter,
    router_utils,
    Backbone,
    _
) {
    var analyticsOverviewRouter = new AnalyticsUsageRouter();
    router_utils.start_backbone_history();
});
