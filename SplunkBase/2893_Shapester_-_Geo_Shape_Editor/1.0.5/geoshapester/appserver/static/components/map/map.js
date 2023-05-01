define([
    'underscore', 'jquery', 'backbone',
    'splunkjs/mvc/basesplunkview',
    'leaflet-src',
    'leaflet-draw',
    'app/geoshapester/components/feature/feature',
    'app/geoshapester/components/feature/featureCollection',
    'app/geoshapester/components/feature/featureTableView',
    'css!./map.css'
], function(_, $, Backbone, BaseSplunkView, L, drawL, Feature, FeatureCollection, FeatureTableView) {

    var TILE_LAYERS = [
        {
            "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>",
            "name": "CartoDB Light",
            "url": "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        },
        {
            "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>",
            "name": "CartoDB Dark",
            "url": "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        },
        {
            "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
            "name": "OpenStreetMap Mapnik",
            "url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        },
        {
            "attribution": "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            "name": "Esri WorldImagery",
            "url": "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        }

    ];

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

    var featureCollection = new FeatureCollection();

    L.Control.FeatureTable = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        initialize: function(options) {
            L.Util.setOptions(this, options);
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'feature-table');
            this.featureTableView = new FeatureTableView({
                collection: featureCollection,
                featureGroup: this.options.featureGroup,
                el: $(container)
            }).render();
            // happens after added to map
            return container;
        },
        onRemove: function(map) {
            // when removed
            this.featureTableView.remove();
            this.featureTableView = null;
        }
    });

    L.control.featureTable = function(options) {
        return new L.Control.FeatureTable(options);
    };

    function updateColor(drawControl, color) {
        drawControl.setDrawingOptions({
            rectangle: {
                shapeOptions: {
                    color: color
                }
            },
            circle: {
                shapeOptions: {
                    color: color
                }
            },
            polygon: {
                shapeOptions: {
                    color: color
                }
            }
        });
    }


    var MapView = BaseSplunkView.extend({
        className: 'splunk-map',
        options: {
            height: 400,
            autoHeight: false,
            windowHeightOffset: 0,
            autoFitBounds: false,
            center: [32.1012, -7.0313],
            zoom: 3,
            tileLayer: 'CartoDB Dark',
            tileLayers: null,
            drilldown: true
        },
        initialize: function() {
            this.configure();
            this.overlays = [];
            this.statusModel = new Backbone.Model();
            this.listenToOnce(this, 'rendered', function() {
                this.listenTo(this.settings, 'change', this.onSettingChange);
                this.bindToComponentSetting('managerid', this.onManagerChange, this);
            });
        },
        createDrawControls: function(map) {
            var featureGroup = this.featureGroup = L.featureGroup().addTo(map);
            
            var drawControl = new L.Control.Draw({
                draw: {
                    // removing polyline and marker because they don't make sense in the context of geospatial indexes
                    polyline: false,
                    marker: false
                },
                edit: {
                    featureGroup: featureGroup,
                    edit: false,
                    remove: false
                }
            }).addTo(map);

            // used to cycle through colors
            var counter = 0;
            var color = COLORS[counter % COLORS.length];
            updateColor(drawControl, color);

            featureCollection.on("bounds:change", function(bounds) { map.fitBounds(bounds, {animate: true})});


            map.on('draw:created', function(e) {
                var layer = e.layer;

                // create new feature
                var feature = new Feature({
                    layer: layer,
                    color: color
                });
                feature.on("destroy", function() {
                    featureGroup.removeLayer(layer);
                });

                featureCollection.add(feature);

                featureGroup.addLayer(layer);

                counter++;

                // get next color in sequence
                color = COLORS[counter % COLORS.length];
                updateColor(drawControl, color);
            });
        },
        addFeature: function(layer){
            var featureGroup = this.featureGroup;
            
        }, 
        initOverlay: function(overlay) {
            this.layersControl.addOverlay(overlay._overlay, overlay.getName());
            this.listenTo(overlay, 'click', this.onOverlayClick);
        },
        onSettingChange: function(setting, value) {
            if (setting === 'autoHeight') {
                this.handleAutoHeight(value);
            }
        },
        handleAutoHeight: function(autoHeightEnabled) {
            $(window).off('resize.' + this.cid);
            if (autoHeightEnabled) {
                $(window).on('resize.' + this.cid, _.debounce(_.bind(this.updateHeight, this, true)));
                this.updateHeight(true);
            } else {
                this.updateHeight();
            }
        },
        updateHeight: function(auto) {
            this.$el.height(auto === true ?
                $(window).height() - this.settings.get('windowHeightOffset') :
                    this.settings.get('height')
            );
        },
        configureTileLayers: function(map) {
            var that = this;

            var tileLayerPromises = _(TILE_LAYERS).map(function(tileLayerConfig) {
                return tileLayerConfig.type === 'gmaps' ? that.loadGoogleMapsTileLayer(tileLayerConfig) : that.loadTileLayer(tileLayerConfig);
            });

            return $.when.apply($, tileLayerPromises).then(function() {
                var tileLayers = {};

                _.each(arguments, function(tl) {
                    tileLayers[tl[1]] = tl[0];
                });

                arguments[0][0].addTo(map);
                return tileLayers;
            });
        },
        loadTileLayer: function(config) {
            return $.Deferred().resolve(L.tileLayer(config.url, _.omit(config, 'url', 'name')), config.name);
        },
        render: function() {
            this.handleAutoHeight(this.settings.get('autoHeight'));

            var mapOptions = _.extend({
                zoomControl: false,
                attributionControl: false
            }, _.omit(this.settings.toJSON(), 'name', 'managerid', 'autoFitBounds', 'autoHeight', 'height', 'id',
                'overlaySettings', 'overlays', 'tileLayer', 'tileLayers', 'windowHeightOffset'));

            var map = this.map = L.map(this.el, mapOptions);
            var handleMapViewChange = _.debounce(_.bind(this.updateMapViewSettings, this), 100);
            map.on('viewreset', handleMapViewChange);
            map.on('move', handleMapViewChange);
            map.on('moveend', handleMapViewChange);


            this.configureTileLayers(map).then(_.bind(function(tileLayers) {
                this.layersControl = L.control.layers(tileLayers, {}, {});
                this.layersControl.addTo(map);
                L.control.zoom({position: 'topleft'}).addTo(map);
                L.control.attribution({prefix: ''}).addTo(map);
                this.createDrawControls(map);
                L.control.featureTable({ 
                    position: 'bottomleft', 
                    featureGroup: this.featureGroup 
                }).addTo(map);
                this.trigger('rendered', this);

                // prevent scrollwheel from zooming the map when over the feature table 
                var elem = L.DomUtil.get('feature-table');
                L.DomEvent.on(elem, 'mousewheel', L.DomEvent.stopPropagation);                
            }, this));

            return this;
        },
        updateMapViewSettings: function() {
            var center = this.map.getCenter();
            this.settings.set({
                center: [center.lat, center.lng],
                zoom: this.map.getZoom()
            });
        },
        remove: function() {
            _(this.overlays).invoke('remove');
            this.handleAutoHeight(false);
            BaseSplunkView.prototype.remove.apply(this, arguments);
        }
    });

    return MapView;
});