define([
    'app/routers/Home.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    HomeRouter,
    router_utils,
    Backbone,
    _
) {
    var homeRouter = new HomeRouter();
    router_utils.start_backbone_history();
});
