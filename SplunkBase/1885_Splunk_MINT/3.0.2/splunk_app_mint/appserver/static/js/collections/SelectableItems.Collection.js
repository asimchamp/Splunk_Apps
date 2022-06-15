define([
    'jquery',
    'underscore',
    'backbone',
    'app/models/SelectableItem.Model',
], function(
    $,
    _,
    Backbone,
    Model
) {
    return Backbone.Collection.extend({
        model: Model,

        selected: function() {
            return this.where({selected: 1});
        },

        pluckSelected: function(attr) {
            return _.map(this.selected(),function(m){
                return m.get(attr);
            });
        }
    });
});