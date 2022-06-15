define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/errors/Location.View',
    'util/splunkd_utils',
    'splunk.util',

], function(
    _,
    Backbone,
    $,
    BaseRouter,
    ErrorsLocationView,
    splunkd_utils,
    splunkUtils
){
    return BaseRouter.extend({
        initialize: function(){
            BaseRouter.prototype.initialize.call(this, "Errors Location");

            // create manager view
            this.views.errorsLocationView = new ErrorsLocationView({
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
            this.views.errorsLocationView.activate({deep: true});

            var $body = $('.main-section-body');
            $body.append(this.views.errorsLocationView.render().el);
        }
    });
});

