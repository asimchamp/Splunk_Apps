define([
    'jquery',
    'underscore',
    'backbone',
    'app/controllers/Base.Controller',
    'app/models/Project.Model',
    'app/collections/Projects.Collection',
    'app/views/projects/CreateEditDialog.View',
    'views/shared/dialogs/TextDialog',
    'splunkjs/mvc/savedsearchmanager',
    'splunkjs/mvc',
    'splunk.util',

], function(
    $,
    _,
    Backbone,
    BaseController,
    ProjectModel,
    ProjectsCollection,
    CreateEditDialogView,
    TextDialog,
    SavedSearchManager,
    mvc,
    splunkUtils
){
    // Include List of tokens to be peristed in classicUrl.
    var TOKENS_INCLUDELIST = ['earliest', 'latest'];

    return BaseController.extend({

        initialize: function(options) {
            BaseController.prototype.initialize.apply(this,arguments);

            // reference to default token model
            this.tokens = mvc.Components.getInstance("default");
            this.tokens.set('earliest', this.options.earliestTime);
            this.tokens.set('latest', this.options.latestTime);

            var app = this.model.application.get("app"),
                owner = this.model.application.get("owner"),
                proxyOptions = {appData: {proxy: app, app: app, owner: owner}};

            // Reference internal searches & associated results
            this.searches = this.searches || {};
            this.results = this.results || {};

            // reference to dialog view if any
            this.dialog = void 0;

            // Cache proxyOptions for any future model instantiations
            this.proxyOptions = proxyOptions;

            // Packages collection & associated deferred
            this.collection.packages  = new Backbone.Collection();
            this.deferreds.packages = $.Deferred();

            this.searches.packages = new SavedSearchManager({
                id: "rpt-mint-packages",
                searchname: "MINT: Packages",
                earliest_time: "$earliest$",
                latest_time: "$latest$",
                autostart: true,
                preview: false,
                app: app,
                owner: owner
            }, {tokens: true});

            this.results.packages = this.searches.packages.data("results");        

            this.listenTo(this.results.packages, "data", function() {
                this.results.packagesInside = this.searches.packages.data("results");
                if (!this.results.packages.hasData()) {
                    this.deferreds.packages.resolve();
                } 
                else {
                    var rows = this.results.packages.collection().map(function(model) {
                        return {
                          name: model.get('packageName'),
                          platforms: model.get('platforms')
                        };
                    });

                    this.collection.packages.set(rows);

                    // Mark packages collection as synced
                    this.deferreds.packages.resolve();
                }
            });

            if(!this.results.packages.hasData()){
                this.deferreds.packages.resolve();
            }
            
        },

        start: function() {
            this.searches.packages.startSearch();
        },

        addProject: function() {
            // view created will be removed when hidden
            var proxyOptions = this.proxyOptions,
                projectNew = new ProjectModel({}, proxyOptions),
                addDialog = new CreateEditDialogView({
                    model: {
                        project: projectNew,
                    },
                    collection: {
                        packages: this.collection.packages,
                        projects: this.collection.projects
                    },
                    deferreds: {
                        packages: this.deferreds.packages
                    },
                    createDialog: true,
                    onHiddenRemove: true
                });

            this.dialog = addDialog;
            addDialog.render().show();
        },

        editProject: function(project) {
            // view created will be removed when hidden
            var editDialog = new CreateEditDialogView({
                model: {
                    project: project
                },
                collection: {
                    packages: this.collection.packages
                },
                deferreds: {
                    packages: this.deferreds.packages
                },
                onHiddenRemove: true
            });

            this.dialog = editDialog;
            editDialog.render().show();
        },

        destroyProject: function(project) {
            var deleteDialog = new TextDialog({id: "modal_delete"});

            // override DialogBase dialogShown to put focus on the Delete button
            deleteDialog.dialogShown =  function() {
                this.trigger("show");
                // Apply focus to the first text input in the dialog. [JCS] Doesn't work without doing a debounce. Not sure why.
                _.debounce(function() {
                    this.$('.btn-primary:first').focus();
                }.bind(this), 0)();
                return;
            };
            /* jshint multistr: true */
            // override DialogBase header template to make it consistent with Modal's header
            deleteDialog.settings.set('headerTemplate', '\
                <button type="button" class="close btn-dialog-close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                <h3 class="text-dialog-title modal-title"></h3>\
            ');

            deleteDialog.settings.set("primaryButtonLabel",_("Delete").t());
            deleteDialog.settings.set("cancelButtonLabel",_("Cancel").t());
            deleteDialog.settings.set("titleLabel",_("Delete Project").t());
            deleteDialog.setText(splunkUtils.sprintf(_('Are you sure you want to delete %s?').t(),
                '<em>' + _.escape(project.entry.get('name')) + '</em>'));

            deleteDialog.on('click:primaryButton', function(){
                project.destroy({wait: true}).done(function(){
                    deleteDialog.hide();
                }.bind(this));
            }, this);

            deleteDialog.on("hidden", function(){
                deleteDialog.remove();
            }, this);

            $("body").append(deleteDialog.render().el);
            deleteDialog.show();
        },

        getProject: function(name) {
            var proj = this.collection.projects.find(function(m){
                        return  m.entry.attributes.name === name;
                });
            return proj;
        }
    }, {
        TokenIncludelist: TOKENS_INCLUDELIST
    });
});
