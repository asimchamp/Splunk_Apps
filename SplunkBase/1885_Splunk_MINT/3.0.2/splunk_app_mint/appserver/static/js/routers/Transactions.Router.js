define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/transactions/Transactions.View',
    'util/splunkd_utils',
    'splunk.util',

], function(
    _,
    Backbone,
    $,
    BaseRouter,
    TransactionsView,
    splunkd_utils,
    splunkUtils
){
    return BaseRouter.extend({
        initialize: function(){
            BaseRouter.prototype.initialize.call(this, "Transactions");

            // create manager view
            this.views.transactionsView = new TransactionsView({
                model: {
                    project: this.model.project,
                    classicUrl: this.model.classicUrl
                },
                collection: {
                    projects: this.collection.projects
                }
            });
        },
        onPageReady: function(locale, app, page) {
            BaseRouter.prototype.onPageReady.apply(this, arguments);
            // activate view including searches
            this.views.transactionsView.activate({deep: true});

            var $body = $('.main-section-body');
            $body.append(this.views.transactionsView.render().el);
        }
    });
});
