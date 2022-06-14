define([
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'app/shared/kvstore',
    'splunk.config'
], function(
    $,
    _,
    Backbone,
    BaseModel,
    KVStore,
    splunkConfig
) {

    var PartyJSLegalModel = KVStore.Model.extend({

        collectionName: 'partyjs_settings',
        
        initialize: function(attributes, options){
            KVStore.Model.prototype.initialize.apply(this, arguments);

        },       
       
    });

   
    return PartyJSLegalModel;
});

