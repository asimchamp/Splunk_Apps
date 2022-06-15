define([
    'jquery',
    'underscore',
    'backbone',
    'app/collections/Base.Collection',
    'app/models/Project.Model'
], function(
    $,
    _,
    Backbone,
    BaseCollection,
    Model
) {
    return BaseCollection.extend({
        url: 'mint/projects',
        model: Model,

        initialize: function(models,options) {
            BaseCollection.prototype.initialize.apply(this, arguments);

            options = options || {};

            if(options.controller) { this.controller = options.controller;}
        },

        findByName: function(name) {
            if (!name) return void 0;
            return this.find(function(model) {
                return (model.entry.get('name') === name);
            });
        }
    });
});