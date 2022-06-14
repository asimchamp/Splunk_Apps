define([
    'app/routers/Views.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    ViewsRouter,
    router_utils,
    Backbone,
    _
) {
    var viewsRouter = new ViewsRouter();
    router_utils.start_backbone_history();
});
