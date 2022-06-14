define([
    'app/routers/NetworkLocation.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    NetworkLocationRouter,
    router_utils,
    Backbone,
    _
) {
    var networkRouter = new NetworkLocationRouter();
    router_utils.start_backbone_history();
});

