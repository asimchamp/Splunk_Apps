define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/analytics/Usage.View',
    'util/splunkd_utils',
    'splunk.util'
], function(
    _,
    Backbone,
    $,
    BaseRouter,
    AnalyticsUsageView,
    splunkd_utils,
    splunkUtils
){
    return BaseRouter.extend({
        initialize: function(){
            BaseRouter.prototype.initialize.call(this, "Analytics Usage");

            // create manager view
            this.views.analyticsUsageView = new AnalyticsUsageView({
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
            this.views.analyticsUsageView.activate({deep: true});

            var $body = $('.main-section-body');
            $body.append(this.views.analyticsUsageView.render().el);
            $('.nav-pills li.nav-item-undefined').addClass('active');
        }
    });
});
