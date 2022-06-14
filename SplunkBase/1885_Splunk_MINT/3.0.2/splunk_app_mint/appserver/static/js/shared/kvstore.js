/**
 * @file KVStore library.
 */
define(function(require, exports, module) {
'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var mvcUtils = require('splunkjs/mvc/utils');
var splunkdUtils = require('util/splunkd_utils');

var defaultOwner = 'nobody';

/**
 * KVStore Model and Collection Backbone extended classes.
 * @exports kvstore
 * @requires jquery
 * @requires underscore
 * @requires backbone
 * @requires splunkjs/mvc/utils
 * @requires util/splunkd_utils
 */
exports = {};

function getDefaultNamespace() {
  return {
    owner: defaultOwner,
    app: mvcUtils.getCurrentApp()
  };
}

function constructUrl(collectionName, namespace) {
  namespace = namespace || {};
  return splunkdUtils.fullpath(
      'storage/collections/data/' + encodeURI(collectionName), 
      {
        owner: namespace.owner || defaultOwner,
        app: namespace.app || mvcUtils.getCurrentApp()
      });
}

exports.Model = Backbone.Model.extend(
  /** @lends module:kvstore~Model.prototype */
  {
    defaults: {
      _user: 'nobody'
    },

    /**
     * KVStore collection name.
     * @type {string}
     * @abstract
     * @default
     */
    collectionName: null,

    /**
     * Splunk namespace { owner: 'x', app: 'y' }.
     * @type {(object|function)}
     * @default function returns namespace { owner: 'nobody', app: '{current application}' }
     */
    namespace: getDefaultNamespace,

    /** 
     * Constructs backbone model compatible with KVStore REST API.
     * @constructs
     * @augments Backbone.Model
     * @param {object}  [attributes]  see {@link http://backbonejs.org/#Model-constructor|Backbone.Model.prototype.constructor}
     * @param {object}  [options]     see {@link http://backbonejs.org/#Model-constructor|Backbone.Model.prototype.constructor},
     *                                you may specify namespace {app: 'x', owner: 'y'} as an option
     * @example
     * // Define Model class for specific collection
     * var MyModel = kvstore.Model.extend({
     *     collectionName: 'mycollection'
     *   });
     *
     * // Save model
     * var model = new MyModel({ name: 'Model name' });
     * model.save()
     *   .done(function() {
     *     console.log('Model saved, key = ' + model.id);
     *   });
     * 
     * // Load model with specific id
     * var model = new MyModel({ id: '5447fb752dbbb628d0224132' });
     * model.fetch()
     *   .done(function() {
     *     console.log('Model loaded, name = ' + model.get('name'));
     *   });
     *
     * // Destroy model with specific id
     * var model = new MyModel({ id: '5447fb752dbbb628d0224132' });
     * model.destroy()
     *   .done(function() {
     *     console.log('Model delete from server);
     *   });
     *
     * // Save new model with custom key
     * var model = new MyModel({ name: 'Model name', _key: 'model1' });
     * model.save()
     *   .done(function() {
     *     console.log('Model saved, key = ' + model.id);
     *   });
     */
    initialize: function(attributes, options) {
      if (options) {
        var namespace = options.namespace;
        if (options.collection && options.collection.namespace) {
          namespace = _.extend(namespace || {}, options.collection.namespace);
        }
        if (!_.isUndefined(namespace)) {
          this.namespace = _.clone(namespace);
          if (!_.isUndefined(this.namespace.owner)) {
            this.set('_user', this.namespace.owner);
          }
        }
      }
      return Backbone.Model.prototype.initialize.apply(this, arguments);
    },

    parse: function(resp, options) {
      // Convert from server-side representation with KV Store objectId in _key field
      // into standard Backbone model representation where objectId is model.id
      if (resp && resp._key) {
        resp[this.idAttribute] = resp._key;
        delete resp._key;
      }
      return resp;
    },

    sync: function(method, model, options) {
      options = options ? $.extend(true, {}, options) : {};

      // Read, Update, Delete require an entity id
      if (method != 'create') {
        if (!this.id) {
          return $.Deferred().reject(null, null, new Error('Cannot sync model without id'));
        }
      }
      // After Create succeeds, if creating with custom key, ensure key is
      // exclusively represented as model.id for simplicity & backbone-consistency
      if (method == 'create' && model.has('_key')) {
        // Override previously-overriden success handler to ensure _key attribute is removed
        var success = options.success;
        options.success = function(resp) {
          model.unset('_key');
          if (success) success(resp);
        };
      }

      // Update occurs via POST (not PUT) as expected by KVStore
      if (method == 'update') { options.type = 'POST'; }

      // Delete returns empty response which is not valid JSON, so set dataType to text instead
      if (method == 'delete') { options.dataType ='text'; }

      return Backbone.sync.call(this, method, model, options);
    },

    /**
     * Overrides {@link http://backbonejs.org/#Model-urlRoot|Backbone.Model.prototype.urlRoot} method.
     * @method
     * @return {string} url to KVStore collection constructed using 
     *                  {@link module:kvstore~Model#collectionName|collectionName} and 
     *                  {@link module:kvstore~Model#namespace|namespace}
     */
    urlRoot: function() {
      return constructUrl(this.collectionName, _.result(this, 'namespace'));
    }
  }
);


exports.Collection = Backbone.Collection.extend(
  /** @lends module:kvstore~Collection.prototype */
  {
    /**
     * KVStore collection name.
     * @type {string}
     * @abstract
     * @default
     */
    collectionName: null,

    /**
     * Splunk namespace { owner: 'x', app: 'y' }.
     * @type {(object|function)}
     * @default function returns namespace { owner: 'nobody', app: '{current application}' }
     */
    namespace: getDefaultNamespace,

    /** 
     * Constructs backbone collection compatible with KVStore REST API.
     * @constructs 
     * @augments Backbone.Collection
     * @param {array}   [models]    see {@link http://backbonejs.org/#Collection-constructor|Backbone Collection constructor}
     * @param {object}  [options]   see {@link http://backbonejs.org/#Collection-constructor|Backbone Collection constructor},
     *                              you may specify namespace {app: 'x', owner: 'y'} as an option
     * @example
     * // Define Model and Collection for specific collection
     * var MyModel = kvstore.Model.extend({
     *     collectionName: 'mycollection'
     *   });
     * var MyCollection = kvstore.Collection.extend({
     *     collectionName: 'mycollection',
     *     model: MyModel
     *   });
     *
     * // Fetch collection with parameters
     * var collection = new MyCollection();
     * collection.fetch({
     *      data: $.param({
     *        skip: 10,
     *        limit: 10,
     *        sort: 'name',
     *        query: JSON.stringify({ name: { '$gte': 'A' } })
     *      })
     *   })
     *   .done(function() {
     *     console.log('Collection loaded, length = ' + collection.length);
     *   });
     */
    initialize: function(models, options) {
      if (options) {
        if (!_.isUndefined(options.namespace)) {
          this.namespace = _.clone(options.namespace);
        }
      }
      return Backbone.Collection.prototype.initialize.apply(this, arguments);
    },

    /**
     * Overrides {@link http://backbonejs.org/#Collection-url}.
     * @return {string} url to KVStore collection constructed using 
     *                  {@link module:kvstore~Collection#collectionName|collectionName} and 
     *                  {@link module:kvstore~Collection#namespace|namespace}
     */
    url: function() {
      return constructUrl(this.collectionName, _.result(this, 'namespace'));
    }
  }
);


return exports;

});