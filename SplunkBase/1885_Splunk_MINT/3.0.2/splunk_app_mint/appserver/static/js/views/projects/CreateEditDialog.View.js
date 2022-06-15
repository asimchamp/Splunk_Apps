define(
    [
        'underscore',
        'jquery',
        'backbone',
        'module',
        'views/shared/Modal',
        'models/Base',
        'views/shared/FlashMessages',
        'views/shared/controls/TextControl',
        'views/shared/controls/ControlGroup',
        'app/views/projects/SelectApps.View',
        'app/contrib/text!app/templates/projects/project-dialog.template.html',
        'util/splunkd_utils'
    ],
    function(
        _,
        $,
        Backbone,
        module,
        Modal,
        BaseModel,
        FlashMessagesView,
        TextControl,
        ControlGroup,
        SelectAppsView,
        template,
        splunkDUtils
    )
    {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' modal-project',
            template: template,
            /**
            * @param {Object} options {
            *     model: {
            *         project: <app/models/Project.Model>
            *     },
            *     collection: {
            *         packages: <Backbone.Collection: [{name:<packageName>},...]>,
            *         projects: <app/collections/Projects.Collection>
            *     },
            *     deferreds: {
            *         packages: <$.Deferred>
            *     }
            *     createDialog: true|false      Default is false
            *     onHiddenRemove: true|false    Optional
            * }
            */
            initialize: function () {
                Modal.prototype.initialize.apply(this, arguments);
                this.deferreds = this.options.deferreds || {};

                _.defaults(this.options, {
                    createDialog: false
                });

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        project: this.model.project,
                        projectContent: this.model.project.entry.content
                    }
                });

                this.children.selectAppsView = new SelectAppsView({
                    model: {
                        project: this.model.project
                    },
                    collection: {
                        packages: this.collection.packages
                    },
                    deferreds: {
                        packages: this.deferreds.packages
                    }
                });

                this.children.nameTextControl = new TextControl({
                    modelAttribute: 'name',
                    model: this.model.project.entry.content,
                    save: false,
                    enabled: (this.options.createDialog) ? true : false
                });

                this.children.name = new ControlGroup({
                    controls: this.children.nameTextControl,
                    label: _("Project name").t(),
                    help: _("Can only contain letters, numbers, and underscores").t(),
                    tooltip: _("The project name is used as the project ID and cannot be changed later.").t()
                });
            },

            events: $.extend({}, Modal.prototype.events, {
                'click a.modal-btn-primary': 'onSubmit',
            }),

            onSubmit: function(e) {
                e.preventDefault();

                var selectedPackages = this.children.selectAppsView.getSelectedPackages();
                this.model.project.associated.packages.reset(selectedPackages);

                // Manually trigger client-side validation (e.g. name not empty)
                this.model.project.entry.content.validate();
                if (this.model.project.entry.content.isValid()) {
                    // Save will trigger server-side validation (e.g. name unique)
                    this.model.project.save({},{
                        success: function(model,resp,options) {
                            if (this.options.createDialog) {
                                this.collection.projects.add(this.model.project);
                                //Stopping PartyJS transaction after successful new project creation
                                if(Mint.getOption('apiKey') !== undefined){
                                    Mint.transactionStop("New project creation");
                                }
                            }
                            this.hide();
                        }.bind(this),
                        error: function() {
                            //Cancelling PartyJS transaction when there is an error
                            if(Mint.getOption('apiKey') !== undefined){
                                Mint.transactionCancel("New project creation", "error saving the new project model");
                            }
                        }
                    });
                }
            },

            render: function () {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html((this.options.createDialog) ?
                      _("Create New Project").t()
                    : _("Edit Project").t()
                );

                this.$(Modal.BODY_SELECTOR)
                    .removeClass('modal-body-scrolling')
                    .append(this.compiledTemplate());

                this.$(Modal.BODY_SELECTOR + ' .form-flash-messages')
                    .html(this.children.flashMessages.render().el);

                this.$(Modal.BODY_FORM_SELECTOR)
                    .append(this.children.name.render().el)
                    .append(this.children.selectAppsView.render().el);

                // overwrite tooltip placement to 'right' post initialization
                // by updating attribute in tooltip namespace directly. Currently restricted to 'top'.
                // TODO: Update ControlGroup API to accept all tooltip options
                this.$(Modal.BODY_FORM_SELECTOR).find('a.tooltip-link').each(function() {
                    var $tooltip = $(this),
                        tooltip = $tooltip.data('tooltip') ||
                                  $tooltip.data('bs.tooltip'); // support Bootstrap 3 where data is namespaced with 'bs'
                    if (tooltip) {
                        tooltip.options.placement = 'right';
                    }
                });

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' +
                    ((this.options.createDialog) ? _("Create Project").t() : _("Save Changes").t()) + '</a>');
                return this;
            }
        });
    }
);
