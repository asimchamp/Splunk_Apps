define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/views/Views.View',
    'util/splunkd_utils',
    'splunk.util',

], function(
    _,
    Backbone,
    $,
    BaseRouter,
    ViewsView,
    splunkd_utils,
    splunkUtils
){
    return BaseRouter.extend({
        initialize: function(){
            BaseRouter.prototype.initialize.call(this, "Views");

            // create manager view
            this.views.viewsView = new ViewsView({
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
            this.views.viewsView.activate({deep: true});

            var $body = $('.main-section-body');
            $body.append(this.views.viewsView.render().el);
        }
    });
});
