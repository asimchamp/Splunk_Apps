define([
    'app/routers/AnalyticsTechnical.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    AnalyticsTechnicalRouter,
    router_utils,
    Backbone,
    _
) {
    var analyticsTechnicalRouter = new AnalyticsTechnicalRouter();
    router_utils.start_backbone_history();
});
