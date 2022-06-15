define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/delegates/Popdown',
    'app/contrib/text!app/templates/projects/project-menu.template.html',
],
function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    Popdown,
    ProjectMenuTemplate
){
    return BaseView.extend({
        moduleId: module.id,
        className: 'nav-item dropdown',
        tagName: 'li',
         /**
         * @param {Object} options {
         *     model: {
         *         application: <models.application>,
         *         classicUrl: <models.classicUrl>,
         *         project: <app/models.project>
         *     },
         *     collection: {
         *          projects: <collections.projects>
         *     }
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.collection.projects, 'add', this.render);
            this.listenTo(this.collection.projects, 'remove', this.render);
            this.listenTo(this.model.classicUrl, 'change:proj', function(model, value) {
                this.model.project = this.collection.projects.findByName(value);
                this.render();
            });
        },
        events: {
            'click a.dropdown-menu-item': function(e) {
                e.preventDefault();
                // TODO: ensure html escaping does not change project name
                var projectName = $(e.target).text();
                if (projectName !== this.model.project.entry.get('name')) {
                    this.model.classicUrl.save({
                        proj: projectName
                    }, {
                        replaceState: true
                    });
                }
            }
        },
        render: function() {
            var html = this.compiledTemplate({
                projects: this.collection.projects,
                project: this.model.project
            });

            this.$el.html(html);

            if (this.children.popdown) {
                this.children.popdown.remove();
                this.stopListening(this.children.popdown);
                delete this.children.popdown;
            }

            this.children.popdown = new Popdown({
                el: this.$el,
                minMargin: 5
            });
            return this;
        },
        template: ProjectMenuTemplate
    });
});
