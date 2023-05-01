define([
    'underscore',
    'backbone',
    'util/splunkd_utils',
    './SpatialLookupModel'
], function(_, Backbone, SplunkdUtils, SpatialLookupModel) {

    return Backbone.Collection.extend({
        model: SpatialLookupModel,
        url: SplunkdUtils.fullpath('geoshapester/shapes')
    });

});