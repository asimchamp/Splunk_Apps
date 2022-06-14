define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'app/views/Base.View',
    'app/views/shared/Checklist.View',
    'app/collections/SelectableItems.Collection',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticCheckboxControl'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    ChecklistView,
    SelectableItemsCollection,
    ControlGroup,
    SyntheticCheckboxControl
){
    return BaseView.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *     model: {
        *         project: <app/models/Project.Model>
        *     },
        *     collection: {
        *         packages: <Backbone.Collection: [{name:<packageName>},...]>
        *     },
        *     deferreds: {
        *         packages: <$.Deferred>
        *     }
        * }
        */
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model = this.options.model || {};

            this.collection.selectablePackages = new SelectableItemsCollection();

            // create and initialize state
            this.model.state = new Backbone.Model({
                selectAll: false
            });

            // sub views
            this.children.selectAllCheckboxControl = new SyntheticCheckboxControl({
                model: this.model.state,
                modelAttribute: 'selectAll',
                label: _('Select all').t()
            });

            this.children.selectAllOrSome = new ControlGroup({
                controls: this.children.selectAllCheckboxControl,
                label: _('Select apps').t(),
                tooltip: _("Select the MINT mobile app projects to include in this project").t()
            });

            var iconFormatter = function(model) {
              var platforms = model.get("platforms");

              return _.map(platforms, function (platform) {
                return 'mintplatforms-' + platform.toLowerCase();
              });
            };

            this.children.packagesChecklist = new ChecklistView({
                iconFormatter: iconFormatter,
                collection: this.collection.selectablePackages
            });

            // listen to selectAll state to update selectablePackages
            this.listenTo(this.model.state, "change:selectAll", function(model, value) {
                this.collection.selectablePackages.each(function(item) {
                    item.set('selected', value);
                });
            });

            // listen to validation of project packages to update error state of select control group
            this.listenTo(this.model.project.entry.content, 'attributeValidated:packages', function(isValid, key, error) {
                this.children.selectAllOrSome.error(!isValid, error);
            });

            $.when(this.deferreds.packages).then(function() {
                this.initializeSelectablePackages();
                this.render();
            }.bind(this));
        },
        /*
         *  clone copy of packages, and set selected attribute
         *  based on project associated packages
         */
        initializeSelectablePackages: function() {
            var project = this.model.project,
                projectPackages = project.associated.packages;

            // packages collection of selectable items
            this.collection.packages.each(function(p) {
                // add with raw attributes so that collection
                // casts them as instance of collection.model
                this.collection.selectablePackages.add(p.attributes);
            }.bind(this));

            // mark packages as selected when applicable
            projectPackages.each(function(projectPackage) {
                var packageName = projectPackage.get('name');
                if (packageName === '*') {
                    // mark all as selected
                    this.model.state.set('selectAll', true);
                } else {
                    // mark package with same name as selected
                    var package = this.collection.selectablePackages.findWhere({name: packageName});
                    if (package) {
                        package.set('selected', 1);
                    }
                }
            }.bind(this));
        },
        getSelectedPackages: function() {
            // TODO: this requires knowledge of consumer. Change to return selectableItems format
            return this.collection.selectablePackages.selected().map(function(p) {
                return p.clone().unset('selected');
            });
        },
        render: function(){
            if (this.collection.selectablePackages.isEmpty()) {
                this.$el.empty();
                if (this.deferreds.packages.state() == 'resolved') {
                    // no results found case
                    this.$el.html('<p class="apps-loading-status">' +
                        _('No apps found.').t() + '<br>' +
                        _('Please try again later after data is retrieved and accelerated').t() +
                        '</p>'
                    );
                    //Cancelling PartyJS transaction when there is an error
                    if(Mint.getOption('apiKey') !== undefined){
                        Mint.transactionCancel("New project creation", "Data not accelerated yet");
                    }
                } else {
                    // still loading case
                    this.$el.html('<p class="apps-loading-status">' +
                        _('Loading apps').t() +
                        '&#8230;&nbsp;<span class="spinner"></span></p>'
                    );                    
                }
                return this;
            }

            this.children.selectAllOrSome.render().$el.detach();
            this.children.packagesChecklist.render().$el.detach();

            this.$el.html(this.children.selectAllOrSome.el);
            this.$('.controls').append(this.children.packagesChecklist.el);
            return this;
        }
    });
});
