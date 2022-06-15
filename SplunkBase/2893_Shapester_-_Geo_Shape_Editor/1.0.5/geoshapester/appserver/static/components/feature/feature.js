define([
    'underscore',
    'jquery',
    'backbone',
    'leaflet-src',
    'leaflet-geodesy'
], function(_, $, Backbone, L, geodesy) {
    
    var idx = 1;

    var Feature = Backbone.Model.extend({
        defaults: {
            featureId: "",
            persist: false,
            edit: true
        },
        initialize: function() {
            this.listenTo(this, "change:edit", this.edit);
            if (!this.get('featureId')) {
                var featureId = this.get('name') || ('feature' + idx++);
                this.set('featureId', featureId);
            } 
        },
        parse: function(response, options) {
            debugger
            if (options.collection) {
                response.featureId = response.id;
            } 
            return response;
        },
        edit: function() {
            if (!this.get("edit")) {
                return;
            }
            console.log(this.get("layer"));
            // this.get("layer").fire("edit:start");
        },
        toGeoJSON: function() {
            var layer = this.get("layer");
            var json = layer.toGeoJSON();
            if (json.geometry.type == "Point") {
                var c = geodesy.circle(layer._latlng, layer._mRadius, {parts: 60});
                json = c.toGeoJSON();
            }
            var featureId = this.get("featureId");
            json.id = featureId;
            json.properties.name = featureId;
            return json;
        }
    });

    return Feature;
});

