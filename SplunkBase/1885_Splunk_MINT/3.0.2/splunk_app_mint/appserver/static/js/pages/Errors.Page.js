define([
    'app/routers/Errors.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    ErrorsRouter,
    router_utils,
    Backbone,
    _
) {
    var errorsRouter = new ErrorsRouter();
    router_utils.start_backbone_history();
});
