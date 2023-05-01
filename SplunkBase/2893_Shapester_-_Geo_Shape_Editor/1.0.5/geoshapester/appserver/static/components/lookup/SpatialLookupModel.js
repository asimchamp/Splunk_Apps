define([
    'underscore',
    'backbone',
    'util/splunkd_utils'
], function(_, Backbone, SplunkdUtils) {

    return Backbone.Model.extend({
        idAttribute: 'name',
        url: SplunkdUtils.fullpath('geoshapester/shapes'),
        isNew: function() {
            // ugly hack to enforce POST instead of PUT
            return true;
        }
    });

});