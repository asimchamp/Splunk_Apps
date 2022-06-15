define([
    'jquery',
    'underscore',
    'backbone',
], function(
    $,
    _,
    Backbone
) {
    return Backbone.Model.extend({
        idAttribute: 'name',

        defaults: {
            selected: 0
        }

    });
});

