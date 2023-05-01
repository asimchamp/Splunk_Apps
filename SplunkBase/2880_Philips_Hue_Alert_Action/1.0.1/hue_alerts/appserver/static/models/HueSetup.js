define([
    'jquery',
    'underscore',
    'backbone',
    'util/splunkd_utils',
], function($, _, Backbone, SplunkdUtils) {

    var HueSetupModel = Backbone.Model.extend({
        url: SplunkdUtils.fullpath('hue/reg')
    }, {
        reset: function() {
            return $.post(HueSetupModel.prototype.url, {action: 'reset'});
        },
        register: function(bridge) {
            return $.post(HueSetupModel.prototype.url, _.extend({action: 'register'}, bridge));
        }
    });

    return HueSetupModel;
});
