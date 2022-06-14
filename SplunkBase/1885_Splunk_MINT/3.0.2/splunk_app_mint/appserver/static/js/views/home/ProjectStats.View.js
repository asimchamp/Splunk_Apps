define([
    "jquery",
    "underscore",
    "backbone",
    "app/contrib/text!app/templates/home/project-stats.template.html",
    'app/views/Base.View',
    'splunk.util',
    'bootstrap.tooltip'
], function(
    $,
    _,
    Backbone,
    template,
    BaseView,
    splunkUtils
    // boostrap.tooltip
){
    return BaseView.extend({
        template: template,
        /**
        * @param {Object} options {
        *     model: {
        *         application: <models/shared/Application>,
        *         project: <app/models/Project.Model>,
        *         projectStats: <Backbone.Model>
        *     },
        *     controllers: {
        *         projects: <app/controllers/Projects.Controller>
        *     }
        * }
        */
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            // DEBUG ONLY
            //window.projectStats = this.model.projectStats;
            this.listenTo(this.model.classicUrl, 'change', this.render);
            this.listenTo(this.model.projectStats, 'change', this.render);
           
        },

        events: {
            'click a.edit-project': function(e) {
                e.preventDefault();
                this.controllers.projects.editProject(this.model.project);
            },
            'click a.delete-project': function(e) {
                e.preventDefault();
                this.controllers.projects.destroyProject(this.model.project);
            }
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                project: this.model.project,
                projectStats: this.model.projectStats,
                projectHomeLink: splunkUtils.make_full_url(
                    ['app', this.model.application.get('app'), 'analytics_usage'].join('/'),
                    { proj: this.model.project.entry.get('name'),
                      'filters.earliest': this.model.classicUrl.get('earliest'),
                      'filters.latest': this.model.classicUrl.get('latest')
                    }
                )
            }));

            this.$('.panel-head p').tooltip();

            return this;
        }
    });
});