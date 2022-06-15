require.config({
    paths: {
        'app': '../app',
        'leaflet-src': '../app/geoshapester/contrib/leaflet-0.7.3/leaflet-src',
        'leaflet-draw': '../app/geoshapester/contrib/leaflet.draw-0.2.2/leaflet.draw',
        'leaflet-geodesy': '../app/geoshapester/contrib/leaflet.geodesy',
        'backbone-bootstrap-modal': '../app/geoshapester/contrib/backbone.bootstrap-modal'
    },
    shim: {
        'leaflet-src': {
            deps: ['css!../app/geoshapester/contrib/leaflet-0.7.3/leaflet.css'],
            exports: 'L'
        },
        "leaflet-draw": {
            deps: [
                'leaflet-src', 
                'css!../app/geoshapester/contrib/leaflet.draw-0.2.2/leaflet.draw.css'
            ],
            exports: 'L'
        },
        "backbone-bootstrap-modal": {
            deps: ['jquery', 'underscore', 'backbone']
        }
    }
});
