define([
    "jquery",
    "underscore",
    "backbone",
    'controllers/Base'
], function(
    $,
    _,
    Backbone,
    BaseController
){
    return BaseController.extend({
        initialize: function() {
            BaseController.prototype.initialize.apply(this,arguments);
            this.deferreds = this.options.deferreds || {};
            this.mediator = this.options.mediator || new Backbone.Model({});
            this.ready = this.deferreds.ready = $.Deferred();
        },
        start: function() {
            throw Error('Must implement start method');
        }
    });
});