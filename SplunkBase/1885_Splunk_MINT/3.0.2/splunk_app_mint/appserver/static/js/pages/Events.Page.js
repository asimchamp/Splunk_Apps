define([
    'app/routers/Events.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    EventsRouter,
    router_utils,
    Backbone,
    _
) {
    var eventsRouter = new EventsRouter();
    router_utils.start_backbone_history();
});
