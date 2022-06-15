define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/home/Home.View',
    'app/controllers/Projects.Controller',
    'util/splunkd_utils',
    'splunk.util'
], function(
    _,
    Backbone,
    $,
    BaseRouter,
    HomeView,
    ProjectsController,
    splunkd_utils,
    splunkUtils
){
    return BaseRouter.extend({
        initialize: function(){
            // Call our ancestor and set page title
            BaseRouter.prototype.initialize.call(this, "Home");

            var searches = this.searches = this.searches || {},
                app = this.model.application.get("app") || this.getApp(),
                owner = this.model.application.get("owner"),
                proxyOptions = {appData: {proxy: app, app: app, owner: owner}};

            this.enableAppBar = false;
            this.enableProjectMenu = false;
            this.fetchProjects = true;

            // Add Controllers
            this.controllers.projects = new ProjectsController({
                model: {
                    application: this.model.application,
                    classicUrl: this.model.classicUrl
                },
                collection: {
                    projects: this.collection.projects
                }
            });
            this.controllers.projects.start();

            // create manager view
            this.views.homeView = new HomeView({
                model: {
                    application: this.model.application,
                    classicUrl: this.model.classicUrl
                },
                collection: {
                    projects: this.collection.projects,
                },
                deferreds: {
                    projects: this.deferreds.projects
                },
                controllers: {
                    projects: this.controllers.projects,
                },
                isAdminUser: this.isAdminUser.bind(this)
            });
        },

        /**
         * Gotowork when page is ready
         */
        onPageReady: function(locale, app, page) {
            BaseRouter.prototype.onPageReady.apply(this, arguments);
            this.views.homeView.activate();

            var version = this.model.serverInfo.getVersion() || undefined;
            if (version) {
                if (parseFloat(version) <= 6.4) {
                    var job_link = $("a[data-role='jobs-link']")[0];
                    $(job_link).attr("href", '/en-US/app/splunk_app_mint/job_management');
                }
            }

            var $body = $('.main-section-body');
            $body.append(this.views.homeView.render().el);
        }
    });
});
