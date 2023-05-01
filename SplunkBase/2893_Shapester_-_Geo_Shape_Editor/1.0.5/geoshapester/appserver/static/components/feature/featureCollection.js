define([
    'underscore',
    'jquery',
    'backbone',
    './feature'
], function(_, $, Backbone, FeatureModel) {

    var FeatureCollection = Backbone.Collection.extend({
        model: FeatureModel,
        toJSON: function() {
            var geoJson = this.models.map(function(model) {
                return model.toGeoJSON();
            });
            return {
                type: "FeatureCollection",
                features: geoJson
            };
        },
        save: function(options) {
            return Backbone.sync("create", this, options);
        }
    });

    return FeatureCollection;
});

