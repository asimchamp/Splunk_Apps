define([
    "underscore",
    "backbone",
    "jquery",
    'app/routers/Base.Router',
    'app/views/errors/Errors.View',
    'app/models/SymbolicatedStacktrace.Model',
    'app/controllers/Errors.Controller'
], function(
    _,
    Backbone,
    $,
    BaseRouter,
    ErrorsView,
    SymbolicatedStacktraceModel,
    ErrorsController
){
    return BaseRouter.extend({
        initialize: function(options){
            BaseRouter.prototype.initialize.call(this, "Errors");

            var app = this.model.application.get("app") || this.getApp(),
                owner = this.model.application.get("owner"),
                namespace = {namespace: {app: app}}; // Use app namespace only

            // Add necessary models
            this.model.errorEvent = new Backbone.Model();
            this.deferreds.errorEvent = $.Deferred();

            this.model.symbolicatedStacktrace = new SymbolicatedStacktraceModel({
                '_user': owner,
            }, namespace);


            // Add errors controller to bootstrap and manage errorEvent
            this.controllers.errors = new ErrorsController({
                model: {
                    application: this.model.application,
                    classicUrl: this.model.classicUrl,
                    errorEvent: this.model.errorEvent
                },
                deferreds: {
                    errorEvent: this.deferreds.errorEvent
                }
            });

            // create manager view
            this.views.errorsView = new ErrorsView({
                model: {
                    project: this.model.project,
                    classicUrl: this.model.classicUrl,
                    errorEvent: this.model.errorEvent,
                    symbolicatedStacktrace: this.model.symbolicatedStacktrace
                },
                collection: {
                    projects: this.collection.projects
                },
                deferreds: {
                    errorEvent: this.deferreds.errorEvent
                }
            });
        },
        onPageReady: function(locale, app, page) {
            BaseRouter.prototype.onPageReady.apply(this, arguments);

            // Start errors controller and fetch error event if any
            this.controllers.errors.start();

            // Activate view including searches
            this.views.errorsView.activate({deep: true});

            var $body = $('.main-section-body');
            $body.append(this.views.errorsView.render().el);
        }
    });
});
