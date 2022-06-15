define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/views/Location.View',
    'util/splunkd_utils',
    'splunk.util',

], function(
    _,
    Backbone,
    $,
    BaseRouter,
    ViewsLocationView,
    splunkd_utils,
    splunkUtils
){
    return BaseRouter.extend({
        initialize: function(){
            BaseRouter.prototype.initialize.call(this, "Views Location");

            // create manager view
            this.views.viewsLocationView = new ViewsLocationView({
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
            this.views.viewsLocationView.activate({deep: true});

            var $body = $('.main-section-body');
            $body.append(this.views.viewsLocationView.render().el);
        }
    });
});

