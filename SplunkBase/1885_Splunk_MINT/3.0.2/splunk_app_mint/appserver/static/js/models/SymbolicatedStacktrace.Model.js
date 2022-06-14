define([
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'app/shared/kvstore',
    'validation/ValidationMixin',
    'splunk.config'
], function(
    $,
    _,
    Backbone,
    BaseModel,
    KVStore,
    ValidationMixin,
    splunkConfig
) {

    var SYMBOLICATOR_ENDPOINT = 'custom/splunk_app_mint/mint_symbolicator/<app>/symbolicate';

    var SymbolicatedStacktraceModel = KVStore.Model.extend({

        collectionName: 'symbolicated_stacktraces',

        defaults: {
            complete: false,
            stacktrace: '',
            affected_method: ''
        },
        
        initialize: function(attributes, options){
            KVStore.Model.prototype.initialize.apply(this, arguments);

            this.initializeAssociated();

            this.symbolicatorURL = '/' +
                encodeURIComponent(splunkConfig.LOCALE || 'en-US') + '/' +
                SYMBOLICATOR_ENDPOINT.replace('<app>', encodeURIComponent(this.namespace.app));

            this.validation = {
                'complete': {
                    oneOf: [true, false],
                    msg: _('complete flag must be set to true or false.').t()
                }
            };

            this.requestPayload.validation = {
                'errorHash': { required: true, minLength: 1 },
                'threadCrashed': { required: false, minLength: 1 },
                'stacktrace': { required: true, minLength: 1 },
                'buildUuid': { required: true, minLength: 1 },
                'architecture': { required: true, minLength: 1 },
                'packageName': { required: true, minLength: 1 },
                'osVersion': { required: true, minLength: 1 },
                'apiKey': { required: true, minLength: 1 },
                'where': { required: true, minLength: 1 }
            };

            // Validity listeners a la BaseModel but restricted to symbolication
            this.on('sync:symbolicate', this._onsync, this);
            this.on('error:symbolicate', this._onerror, this);
            this.on('validated', this._rebroadcastValidation, this);
        },

        initializeAssociated: function() {
            this.associated = this.associated || {};

            this.requestPayload = this.requestPayload || new BaseModel();
            this.associated.requestPayload = this.requestPayload;

            this.error = this.error || new Backbone.Model();
            this.associated.error = this.error;
        },

        setSymbolicatePayload: function(errorEvent) {
            var attrs = _.pick(errorEvent, _.keys(this.requestPayload.validation));
            this.requestPayload.set(attrs);
        },

        symbolicate: function(options) {
            options = options ? _.clone(options) : {};

            var params = {}, model = this;

            // Required validation of requestPayload
            if (!this.requestPayload.isValid(true)) {
                // TODO: update error object and/or rebroadcast validation for flash messages
                console.error('[SymbolicatedStacktrace:symbolicate] Must set error data before symbolication');
                return false;
            }

            // Check if symbolicaton already done unless user forced
            if (this.get('complete') && !options.force) {
                console.warn('[SymbolicatedStacktrace:symbolicate] Current stacktrace already symbolicated');
                return false;
            }

            $.extend(true, params, options, {
                url: this.symbolicatorURL,
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(this.requestPayload.toJSON())
            });

            var success = params.success;
            params.success = function(resp, textStatus, jqXHR) {
                // Set attributes including stacktrace
                if (!model.set(model.parse(resp, options), options)) return false;
                // Set complete if 200 status. Anything else is considered incomplete
                var complete = (jqXHR.status === 200) ? true : false;
                model.set('complete', complete);
                if (success) success(model, resp, options);
                model.trigger('sync:symbolicate', model, resp, options);
            };

            var error = params.error;
            params.error = function(resp) {
                // TODO: update error object and/or rebroadcast validation for flash messages
                if (error) error(model, resp, options);
                model.trigger('error:symbolicate', model, resp, options);
            };

            var xhr = options.xhr = $.ajax(params);
            model.trigger('request:symbolicate', model, xhr, options);
            return xhr;
        }
    });

    _.extend(SymbolicatedStacktraceModel.prototype, ValidationMixin);
    // Selective mixin of some methods from BaseModel
    _.extend(SymbolicatedStacktraceModel.prototype, _.pick(BaseModel.prototype,
        ['clearErrors', '_rebroadcastValidation', '_onerror', '_onsync', 'parseSplunkDMessages',
         'clear', 'clone']
    ));

    return SymbolicatedStacktraceModel;
});

