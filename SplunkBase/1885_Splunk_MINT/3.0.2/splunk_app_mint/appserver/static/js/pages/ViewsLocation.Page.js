define([
    'app/routers/ViewsLocation.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    ViewsLocationRouter,
    router_utils,
    Backbone,
    _
) {
    var viewsLocationRouter = new ViewsLocationRouter();
    router_utils.start_backbone_history();
});

