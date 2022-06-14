define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/events/Events.View',
    'util/splunkd_utils',
    'splunk.util',

], function(
    _,
    Backbone,
    $,
    BaseRouter,
    EventsView,
    splunkd_utils,
    splunkUtils
){
    return BaseRouter.extend({
        initialize: function(){
            BaseRouter.prototype.initialize.call(this, "Events");

            // create manager view
            this.views.eventsView = new EventsView({
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
            this.views.eventsView.activate({deep: true});

            var $body = $('.main-section-body');
            $body.append(this.views.eventsView.render().el);
        }
    });
});
