define([
    'app/routers/ErrorsLocation.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    ErrorsLocationRouter,
    router_utils,
    Backbone,
    _
) {
    var errorsLocationRouter = new ErrorsLocationRouter();
    router_utils.start_backbone_history();
});

