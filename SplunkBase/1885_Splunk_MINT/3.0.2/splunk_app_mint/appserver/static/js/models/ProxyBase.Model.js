define([
    'jquery',
    'underscore',
    'backbone',
    'models/SplunkDBase',
    'splunk.util'
], function(
    $,
    _,
    Backbone,
    SplunkDBase
) {
    return SplunkDBase.extend({
        initialize: function(attributes, options){
            // set app data before parent initialize so proxy options are available for associated entities
            this.setAppData(options);
            // preserve original URL to avoid duplicating proxy URL
            this._url = this._url || this.url;

            SplunkDBase.prototype.initialize.call(this, attributes, options);
        },

        setAppData: function(options) {
            options = options || {};
            this.appData = options.appData || this.appData || (this.collection && this.collection.appData);
        },

        sync: function(method, model, options){
            if(method === 'create'){
                // Create calls need the proxy too
                // create uses the url since the id isn't available yet
                this.url = this._getProxyUrl(this.appData) + "/" + this._url;
            } else {
                // This forces the base model to use the proxy,
                // since the base model uses the id to build the URL
                model.set(this.idAttribute, this._getId());
            }

            return SplunkDBase.prototype.sync.apply(this, arguments);
        },

        parse: function(resp, options){
            this.setAppData(options);
            // preserve original URL to avoid duplicating proxy URL
            this._url = this._url || this.url;

            resp = SplunkDBase.prototype.parse.call(this, resp, options);

            // canonical id must be proxified
            resp.id = this._getId();
            this.acl.set(this.acl.idAttribute, resp.id + '/acl');
            return resp;
        },

        _getProxyUrl: function(appData){
            return Splunk.util.make_url([
                "custom",
                appData.proxy || appData.app,
                "proxy",
                "servicesNS",
                appData.owner,
                appData.app
            ].join('/'));
        },

        _getId: function(){
            // proxifying canonical id
            return this._getProxyUrl(this.appData) + "/" + this._url + '/' + (this.get('name') || this.entry.get('name'));
        },

        _getFullUrl: function(){
            return this._getId();
        }

    });
});

