define([
    'jquery',
    'underscore',
    'backbone',
    'collections/SplunkDsBase',
    'splunk.util'
], function(
    $,
    _,
    Backbone,
    SplunkDsBase
) {
    return SplunkDsBase.extend({

        initialize: function(models, options){
            SplunkDsBase.prototype.initialize.call(this, models, options);

            var appData = {
                app: '-',
                owner: 'nobody'
            };

            this.options = options || {};

            if(options && options.appData) {
                appData = this.appData = options.appData;
            }

            this.proxyUrl = Splunk.util.make_url([
                "custom",
                appData.app,
                "proxy",
                "servicesNS",
                appData.owner,
                appData.app
            ].join('/'));

            this.url = this.proxyUrl+"/"+this.url;
        }
    });
});

