define([
    'app/routers/NetworkServices.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    NetworkServicesRouter,
    router_utils,
    Backbone,
    _
) {
    var networkRouter = new NetworkServicesRouter();
    router_utils.start_backbone_history();
});
