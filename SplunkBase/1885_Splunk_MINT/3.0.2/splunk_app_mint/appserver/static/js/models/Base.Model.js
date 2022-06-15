define([
    'jquery',
    'underscore',
    'backbone',
    'app/models/ProxyBase.Model',
    'splunk.util'
], function(
    $,
    _,
    Backbone,
    ProxyBase
) {
    return ProxyBase.extend({
        initialize: function(attributes, options){
            ProxyBase.prototype.initialize.call(this, attributes, options);
        }
    });
});

