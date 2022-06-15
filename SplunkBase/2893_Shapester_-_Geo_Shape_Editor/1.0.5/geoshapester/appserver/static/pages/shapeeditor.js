require([
    'underscore', 'jquery', 'splunkjs/mvc',
    'app/geoshapester/pages/_base',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunkjs/mvc/searchcontrolsview',
    'app/geoshapester/components/map/map'
], function(_, $, mvc, BasePage, SearchManager, SearchBarView, SearchControlsView, Map) {

    BasePage.initRouter();
    BasePage.initPage();
    BasePage.syncState({ replaceState: true });

    var mapHeightOffset =
        65 + // header
        32; //footer

    var map = new Map({
        id: 'map',
        el: $('#map'),
        autoHeight: true,
        windowHeightOffset: mapHeightOffset,
        autoFitBounds: false
    }).render();

    // http://leafletjs.com/reference.html#circle
    var circle_options = {
        color: '#fff',      // Stroke color
        opacity: 1,         // Stroke opacity
        weight: 10,         // Stroke weight
        fillColor: '#000',  // Fill color
        fillOpacity: 0.6    // Fill opacity
    };
  

});

