define([
    'underscore',
    'jquery',
    'backbone',
    'app/geoshapester/components/feature/featureTableRowView',
    'app/geoshapester/components/lookup/lookupDialogView',
    'app/geoshapester/components/lookup/LookupListView',
    'util/splunkd_utils',
    'app/geoshapester/components/lookup/SpatialLookupModel',
    'app/geoshapester/components/lookup/SpatialLookupCollection',
    'leaflet-src',
    'app/geoshapester/components/feature/feature'
], function(_, $, Backbone, FeatureTableRowView, LookupDialogView, LookupListView, SplunkdUtils, SpatialLookupModel, SpatialLookupCollection, L, FeatureModel) {

    var COLORS = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f39c12",
        "#d35400",
        "#c0392b"
    ];

    var FeatureTableView = Backbone.View.extend({
        events: {
            "click .action.save-lookup": "save",
            "click .action.load-lookup": "load"
        },
        initialize: function(options) {
            _.bindAll(this, "render", "removeFeature", "addFeature", "save", "renderFeatures");
            FeatureTableView.__super__.initialize.apply(this, arguments);
            this.model = new SpatialLookupModel();
            this.state = new Backbone.Model();
            this.listenTo(this.state, 'change:saving', this.updateState);
            this.collection = options.collection;
            this.listenTo(this.collection, "remove", this.removeFeature);
            this.listenTo(this.collection, "add", this.addFeature);
            this.listenTo(this.collection, "reset", this.renderFeatures);
            this.listenTo(this.model, "change:name", this.updateTitle);
            this.children = [];
            this.featureGroup = options.featureGroup;
        },

        removeFeature: function(model) {
            this.collection.remove(model);
        },

        addFeature: function(model) {
            var featureRow = new FeatureTableRowView({model: model});
            this.$el.find("tbody").append(featureRow.render().$el);
            featureRow.focus();
            this.children.push(featureRow);
        },

        renderFeatures: function() {
            _(this.children).invoke('remove');
            this.collection.each(this.addFeature);
        },

        save: function(e) {
            e.preventDefault();
            var state = this.state;
            if (state.get('saving')) return;
            var view = this;

            if (!this.model.get('name')) {
                var lookupDialogView = new LookupDialogView({model: this.model});
                lookupDialogView.on("ok", function(e) {
                    if (!view.model.get('name')) {
                        alert('Lookup name not specified');
                        return;
                    }
                    view.saveLookup();
                });
                new Backbone.BootstrapModal({
                    content: lookupDialogView,
                    enterTriggersOk: true,
                    animate: true,
                    escape: true,
                    focusOk: false,
                    title: 'Save as new Lookup'
                }).open();
            } else {
                this.saveLookup();
            }
        },

        saveLookup: function() {
            this.model.set('geoJSON', this.collection.toJSON());
            var state = this.state;
            state.set('saving', true);
            this.model.save()
                .fail(function(e) {
                    console.error(e);
                    alert('Error saving the lookup (see console)');
                })
                .always(function() {
                    state.set('saving', false);
                });
        },

        load: function(e) {
            e.preventDefault();
            var lookupCollection = new SpatialLookupCollection();
            var state = new Backbone.Model({ loading: true });
            
            lookupCollection.fetch().then(function(){
                state.set('loading', false);
            });
            
            var listView = new LookupListView({
                model: state,
                collection: lookupCollection
            });
            
            var dialog = new Backbone.BootstrapModal({
                content: listView,
                okText: "Close",
                escape: true,
                animate: true,
                enterTriggersOk: true,
                title: 'Load existing Lookup',
                allowCancel: false
            });
            dialog.open();
            
            var that = this;
            
            state.once('change:selected', function(state, selectedLookup) {
                console.log('change:selected', selectedLookup);
                dialog.close();
                that.model.set('name', selectedLookup);
                var lookupModel = lookupCollection.get(selectedLookup);
                
                var featureGroup = that.featureGroup;
                that.collection.each(function(model){
                    that.collection.remove(model);
                });
                _(featureGroup.getLayers()).each(function(layer){
                    featureGroup.removeLayer(layer);
                });
                
                var geoJson = L.geoJson(lookupModel.get('geoJSON'));
                
                var counter = 0;
                
                _(geoJson.getLayers()).each(function(layer){
                    var color = COLORS[counter % COLORS.length];
                    layer.options.color = color;
                    var feature = new FeatureModel({
                        name: layer.feature.id,
                        layer: layer,
                        color: color,
                        edit: false
                    });
                    
                    feature.on("destroy", function() {
                        featureGroup.removeLayer(layer);
                    });
                    that.collection.add(feature);
                    featureGroup.addLayer(layer);
                    counter++;
                });
                
                var bounds = featureGroup.getBounds();
                that.collection.trigger("bounds:change", bounds);

                that.renderFeatures();
            });
        },

        updateTitle: function() {
            var $title = this.$('h3');
            var name = this.model.get('name') ? "geo_" + this.model.get('name') : null;
            $title.text(name || 'Untitled Lookup');
            $title[!name ? 'addClass' : 'removeClass']('title-new');
        },

        updateState: function() {
            this.$('.save-lookup')[this.state.get('saving') ? 'addClass' : 'removeClass']('disabled');
        },

        render: function() {
            this.$el.html(_.template(this.template));
            this.updateTitle();
            return this.$el;
        },
        template: '\
            <h3></h3>\
            <table id="feature-table" class="table table-striped">\
                <thead>\
                    <tr><td></td><td style="min-width: 150px" colspan="2">Feature ID</td></tr>\
                </thead>\
                <tbody>\
                </tbody>\
            </table>\
            <a class="btn btn-default action save-lookup" href="#" role="button">Save</a>\
            <a class="btn btn-default action load-lookup" href="#" role="button">Load</a>'
    });

    return FeatureTableView;
});

