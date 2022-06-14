define([
    'app/routers/Transactions.Router',
    'util/router_utils',
    'backbone',
    'underscore'
],
function(
    TransactionsRouter,
    router_utils,
    Backbone,
    _
) {
    var transactionsRouter = new TransactionsRouter();
    router_utils.start_backbone_history();
});
