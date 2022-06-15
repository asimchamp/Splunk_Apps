(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Mint = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./src/core');


},{"./src/core":9}],2:[function(require,module,exports){
/*!
 * JavaScript Cookie v2.0.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = encodeURIComponent(String(value));
				value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					cookie = converter && converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init();
}));

},{}],3:[function(require,module,exports){
(function(root, factory) {

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = factory(root, exports);
    }
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      root.Lockr = factory(root, exports);
    });
  } else {
    root.Lockr = factory(root, {});
  }

}(this, function(root, Lockr) {
  'use strict';

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0)
      ? Math.ceil(from)
      : Math.floor(from);
      if (from < 0)
        from += len;

      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }

  Lockr.prefix = "";

  Lockr._getPrefixedKey = function(key, options) {
    options = options || {};

    if (options.noPrefix) {
      return key;
    } else {
      return this.prefix + key;
    }

  };

  Lockr.set = function (key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    try {
      localStorage.setItem(query_key, JSON.stringify({"data": value}));
    } catch (e) {
      if (console) console.warn("Lockr didn't successfully save the '{"+ key +": "+ value +"}' pair, because the localStorage is full.");
    }
  };

  Lockr.get = function (key, missing, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
      value = null;
    }
    if(value === null)
      return missing;
    else
      return (value.data || missing);
  };

  Lockr.sadd = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json;

    var values = Lockr.smembers(key);

    if (values.indexOf(value) > -1) {
      return null;
    }

    try {
      values.push(value);
      json = JSON.stringify({"data": values});
      localStorage.setItem(query_key, json);
    } catch (e) {
      console.log(e);
      if (console) console.warn("Lockr didn't successfully add the "+ value +" to "+ key +" set, because the localStorage is full.");
    }
  };

  Lockr.smembers = function(key, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
      value = null;
    }

    if (value === null)
      return [];
    else
      return (value.data || []);
  };

  Lockr.sismember = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    return Lockr.smembers(key).indexOf(value) > -1;
  };

  Lockr.getAll = function () {
    var keys = Object.keys(localStorage);

    return keys.map(function (key) {
      return Lockr.get(key);
    });
  };

  Lockr.srem = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json,
        index;

    var values = Lockr.smembers(key, value);

    index = values.indexOf(value);

    if (index > -1)
      values.splice(index, 1);

    json = JSON.stringify({"data": values});

    try {
      localStorage.setItem(query_key, json);
    } catch (e) {
      if (console) console.warn("Lockr couldn't remove the "+ value +" from the set "+ key);
    }
  };

  Lockr.rm =  function (key) {
    localStorage.removeItem(key);
  };

  Lockr.flush = function () {
    localStorage.clear();
  };
  return Lockr;

}));

},{}],4:[function(require,module,exports){
/*!
* MinPubSub
* Copyright(c) 2011 Daniel Lamb <daniellmb.com>
* MIT Licensed
*/

(function(d){
	var MinPubSub = {};

	// the topic/subscription hash
	var cache = d.c_ || {}; //check for "c_" cache for unit testing
	
	MinPubSub.publish = function(/* String */ topic, /* Array? */ args){
		// summary: 
		//		Publish some data on a named topic.
		// topic: String
		//		The channel to publish on
		// args: Array?
		//		The data to publish. Each array item is converted into an ordered
		//		arguments on the subscribed functions. 
		//
		// example:
		//		Publish stuff on '/some/topic'. Anything subscribed will be called
		//		with a function signature like: function(a,b,c){ ... }
		//
		//		publish("/some/topic", ["a","b","c"]);
		
		var subs = cache[topic],
			len = subs ? subs.length : 0;

		//can change loop or reverse array if the order matters
		while(len--){
			subs[len].apply(d, args || []);
		}
	};

	MinPubSub.subscribe = function(/* String */ topic, /* Function */ callback){
		// summary:
		//		Register a callback on a named topic.
		// topic: String
		//		The channel to subscribe to
		// callback: Function
		//		The handler event. Anytime something is publish'ed on a 
		//		subscribed channel, the callback will be called with the
		//		published array as ordered arguments.
		//
		// returns: Array
		//		A handle which can be used to unsubscribe this particular subscription.
		//	
		// example:
		//		subscribe("/some/topic", function(a, b, c){ /* handle data */ });

		if(!cache[topic]){
			cache[topic] = [];
		}
		cache[topic].push(callback);
		return [topic, callback]; // Array
	};

	MinPubSub.unsubscribe = function(/* Array */ handle, /* Function? */ callback){
		// summary:
		//		Disconnect a subscribed function for a topic.
		// handle: Array
		//		The return value from a subscribe call.
		// example:
		//		var handle = subscribe("/some/topic", function(){});
		//		unsubscribe(handle);
		
		var subs = cache[callback ? handle : handle[0]],
			callback = callback || handle[1],
			len = subs ? subs.length : 0;
		
		while(len--){
			if(subs[len] === callback){
				subs.splice(len, 1);
			}
		}
	};

	// UMD definition to allow for CommonJS, AMD and legacy window
  if (typeof module === 'object' && typeof module.exports === 'object') {
      // CommonJS, just export
      module.exports = exports = MinPubSub;
  } else if (typeof define === 'function' && define.amd) {
      // AMD support
      define(function () { return MinPubSub; });
  } else if (typeof window === 'object') {
      // If no AMD and we are in the browser, attach to window
      window.publish = MinPubSub.publish;
      window.subscribe = MinPubSub.subscribe;
      window.unsubscribe = MinPubSub.unsubscribe;
  }

})(window);
},{}],5:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
 

  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],6:[function(require,module,exports){
(function (global){
/*!
 * Platform.js v1.3.0 <http://mths.be/platform>
 * Copyright 2010-2014 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object` */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object */
  var oldRoot = root;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Opera regexp */
  var reOpera = /\bOpera/;

  /** Possible global object */
  var thisBinding = this;

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // platform tokens defined at
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '6.4':  '10',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // detect Windows version from platform tokens
    if (pattern && label && /^Win/i.test(os) &&
        (data = data[0/*Opera 9.25 fix*/, /[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // correct character case and cleanup
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object */
    var context = root;

    /** Used to flag when a custom context is provided */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // juggle arguments
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object */
    var nav = context.navigator || {};

    /** Browser user agent string */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope] */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environment */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based)
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]` */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime */
    var data;

    /** The CPU architecture */
    var arch = ua;

    /** Platform description array */
    var description = [];

    /** Platform alpha/beta indicator */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform */
    var useFeatures = ua == userAgent;

    /** The browser/environment version */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important) */
    var layout = getLayout([
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important) */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      'Midori',
      'Nook Browser',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      'Sunrise',
      'Swiftfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important) */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nook',
      'PlayBook',
      'PlayStation 4',
      'PlayStation 3',
      'PlayStation Vita',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation 4': 1, 'PlayStation 3': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable OSes (order is important) */
    var os = getOS([
      'Windows Phone ',
      'Android',
      'CentOS',
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // lookup the manufacturer by product or scan the UA for the manufacturer
        return result || (
          value[product] ||
          value[0/*Opera 9.25 fix*/, /^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // split by forward slash and append product version if needed
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // correct character case and cleanup
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // convert layout to an array so we can add extra details
    layout && (layout = [layout]);

    // detect product names that contain their manufacturer's name
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // clean up Google TV
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // detect simulators
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // detect iOS
    if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // detect Kubuntu
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // detect Android browsers
    else if (manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // detect false positives for Firefox/Safari
    else if (!name || (data = !/\bMinefield\b|\(Android;/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // escape the `/` for Firefox 1
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // clear name of false positives
        name = null;
      }
      // reassign a generic name
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // detect Firefox OS
    if ((data = /\((Mobile|Tablet).*?Firefox\b/i.exec(ua)) && data[1]) {
      os = 'Firefox OS';
      if (!product) {
        product = data[1];
      }
    }
    // detect non-Opera versions (order is important)
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // detect stubborn layout engines
    if (layout == 'iCab' && parseFloat(version) > 3) {
      layout = ['WebKit'];
    } else if (
        layout != 'Trident' &&
        (data =
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident')
        )
    ) {
      layout = [data];
    }
    // detect NetFront on PlayStation
    else if (/\bPlayStation\b(?! Vita\b)/i.test(name) && layout == 'WebKit') {
      layout = ['NetFront'];
    }
    // detect Windows Phone 7 desktop mode
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // detect Windows Phone 8+ desktop mode
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8+';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // detect IE 11 and above
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (!/\bWPDesktop\b/i.test(ua)) {
        if (name) {
          description.push('identifying as ' + name + (version ? ' ' + version : ''));
        }
        name = 'IE';
      }
      version = data[1];
    }
    // detect IE Tech Preview
    else if ((name == 'Chrome' || name != 'IE') && (data = /\bEdge\/([\d.]+)/.exec(ua))) {
      name = 'IE';
      version = data[1];
      layout = ['Trident'];
      description.unshift('platform preview');
    }
    // leverage environment features
    if (useFeatures) {
      // detect server-side environments
      // Rhino has a global function while others have a global object
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
          os || (os = data[0].os || null);
          try {
            data[1] = context.require('ringo/engine').version;
            version = data[1].join('.');
            name = 'RingoJS';
          } catch(e) {
            if (data[0].global.system == context.system) {
              name = 'Narwhal';
            }
          }
        }
        else if (typeof context.process == 'object' && (data = context.process)) {
          name = 'Node.js';
          arch = data.arch;
          os = data.platform;
          version = /[\d.]+/.exec(data.version)[0];
        }
        else if (rhino) {
          name = 'Rhino';
        }
      }
      // detect Adobe AIR
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // detect PhantomJS
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // detect IE compatibility modes
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // we're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      os = os && format(os);
    }
    // detect prerelease phases
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // detect Firefox Mobile
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // obscure Maxthon's unreliable version
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // detect Silk desktop/accelerated modes
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // detect Xbox 360 and Xbox One
    else if (/\bXbox\b/i.test(product)) {
      os = null;
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // add mobile postfix
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // detect IE platform preview
    else if (name == 'IE' && useFeatures && context.external === null) {
      description.unshift('platform preview');
    }
    // detect BlackBerry OS version
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // detect Opera identifying/masking itself as another browser
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && (
          product != 'Wii' && (
            (useFeatures && opera) ||
            (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
            (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
            (name == 'IE' && (
              (os && !/^Win/.test(os) && version > 5.5) ||
              /\bWindows XP\b/.test(os) && version > 8 ||
              version == 8 && !/\bTrident\b/.test(ua)
            ))
          )
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {

      // when "indentifying", the UA contains both Opera and the other browser's name
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // when "masking", the UA contains only the other browser's name
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // detect WebKit Nightly and approximate Chrome/Safari versions
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // correct build for numeric comparison
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // nightly builds are postfixed with a `+`
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // clear incorrect browser versions
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // use the full Chrome version when available
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // detect Blink layout engine
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && name != 'IE') {
        layout = ['Blink'];
      }
      // detect JavaScriptCore
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // add the postfix of ".x" or "+" for approximate versions
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // obscure version for some Safari 1-2 releases
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // detect Opera desktop modes
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // detect Chrome desktop mode
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // strip incorrect OS versions
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // add layout engine
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Sleipnir|Web)/.test(name) && layout[1])) {
      // don't add layout details to description if they are falsey
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // combine contextual information
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // append manufacturer
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // append product
    if (product) {
      description.push((/^on /.test(description[description.length -1]) ? '' : 'on ') + product);
    }
    // parse OS into an object
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // add browser/OS architecture
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // export platform
  // some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module so, through path mapping, it can be aliased
    define(function() {
      return parse();
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Narwhal, Node.js, Rhino -require, or RingoJS
    forOwn(parse(), function(value, key) {
      freeExports[key] = value;
    });
  }
  // in a browser or Rhino
  else {
    root.platform = parse();
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
/*! qwest 1.7.0 (https://github.com/pyrsmk/qwest) */

;(function(context,name,definition){
	if(typeof module!='undefined' && module.exports){
		module.exports=definition;
	}
	else if(typeof define=='function' && define.amd){
		define(definition);
	}
	else{
		context[name]=definition;
	}
}(this,'qwest',function(){

	var win=window,
		doc=document,
		before,
		// Default response type for XDR in auto mode
		defaultXdrResponseType='json',
		// Variables for limit mechanism
		limit=null,
		requests=0,
		request_stack=[],
		// Get XMLHttpRequest object
		getXHR=function(){
				return win.XMLHttpRequest?
						new XMLHttpRequest():
						new ActiveXObject('Microsoft.XMLHTTP');
			},
		// Guess XHR version
		xhr2=(getXHR().responseType===''),

	// Core function
	qwest=function(method,url,data,options,before){

		// Format
		method=method.toUpperCase();
		data=data || null;
		options=options || {};

		// Define variables
		var nativeResponseParsing=false,
			crossOrigin,
			xhr,
			xdr=false,
			timeoutInterval,
			aborted=false,
			attempts=0,
			headers={},
			mimeTypes={
				text: '*/*',
				xml: 'text/xml',
				json: 'application/json',
				post: 'application/x-www-form-urlencoded'
			},
			accept={
				text: '*/*',
				xml: 'application/xml; q=1.0, text/xml; q=0.8, */*; q=0.1',
				json: 'application/json; q=1.0, text/*; q=0.8, */*; q=0.1'
			},
			contentType='Content-Type',
			vars='',
			i,j,
			serialized,
			then_stack=[],
			catch_stack=[],
			complete_stack=[],
			response,
			success,
			error,
			func,

		// Define promises
		promises={
			then:function(func){
				if(options.async){
					then_stack.push(func);
				}
				else if(success){
					func.call(xhr,response);
				}
				return promises;
			},
			'catch':function(func){
				if(options.async){
					catch_stack.push(func);
				}
				else if(error){
					func.call(xhr,response);
				}
				return promises;
			},
			complete:function(func){
				if(options.async){
					complete_stack.push(func);
				}
				else{
					func.call(xhr);
				}
				return promises;
			}
		},
		promises_limit={
			then:function(func){
				request_stack[request_stack.length-1].then.push(func);
				return promises_limit;
			},
			'catch':function(func){
				request_stack[request_stack.length-1]['catch'].push(func);
				return promises_limit;
			},
			complete:function(func){
				request_stack[request_stack.length-1].complete.push(func);
				return promises_limit;
			}
		},

		// Handle the response
		handleResponse=function(){
			// Verify request's state
			// --- https://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
			if(aborted){
				return;
			}
			// Prepare
			var i,req,p,responseType;
			--requests;
			// Clear the timeout
			clearInterval(timeoutInterval);
			// Launch next stacked request
			if(request_stack.length){
				req=request_stack.shift();
				p=qwest(req.method,req.url,req.data,req.options,req.before);
				for(i=0;func=req.then[i];++i){
					p.then(func);
				}
				for(i=0;func=req['catch'][i];++i){
					p['catch'](func);
				}
				for(i=0;func=req.complete[i];++i){
					p.complete(func);
				}
			}
			// Handle response
			try{
				// Init
				var responseText='responseText',
					responseXML='responseXML',
					parseError='parseError';
				// Process response
				if(nativeResponseParsing && 'response' in xhr && xhr.response!==null){
					response=xhr.response;
				}
				else if(options.responseType=='document'){
					var frame=doc.createElement('iframe');
					frame.style.display='none';
					doc.body.appendChild(frame);
					frame.contentDocument.open();
					frame.contentDocument.write(xhr.response);
					frame.contentDocument.close();
					response=frame.contentDocument;
					doc.body.removeChild(frame);
				}
				else{
					// Guess response type
					responseType=options.responseType;
					if(responseType=='auto'){
						if(xdr){
							responseType=defaultXdrResponseType;
						}
						else{
							var ct=xhr.getResponseHeader(contentType) || '';
							if(ct.indexOf(mimeTypes.json)>-1){
								responseType='json';
							}
							else if(ct.indexOf(mimeTypes.xml)>-1){
								responseType='xml';
							}
							else{
								responseType='text';
							}
						}
					}
					// Handle response type
					switch(responseType){
						case 'json':
							try{
								if('JSON' in win){
									response=JSON.parse(xhr[responseText]);
								}
								else{
									response=eval('('+xhr[responseText]+')');
								}
							}
							catch(e){
								throw "Error while parsing JSON body : "+e;
							}
							break;
						case 'xml':
							// Based on jQuery's parseXML() function
							try{
								// Standard
								if(win.DOMParser){
									response=(new DOMParser()).parseFromString(xhr[responseText],'text/xml');
								}
								// IE<9
								else{
									response=new ActiveXObject('Microsoft.XMLDOM');
									response.async='false';
									response.loadXML(xhr[responseText]);
								}
							}
							catch(e){
								response=undefined;
							}
							if(!response || !response.documentElement || response.getElementsByTagName('parsererror').length){
								throw 'Invalid XML';
							}
							break;
						default:
							response=xhr[responseText];
					}
				}
				// Late status code verification to allow data when, per example, a 409 is returned
				// --- https://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
				if('status' in xhr && !/^2|1223/.test(xhr.status)){
					throw xhr.status+' ('+xhr.statusText+')';
				}
				// Execute 'then' stack
				success=true;
				p=response;
				if(options.async){
					for(i=0;func=then_stack[i];++i){
						p=func.call(xhr, p);
					}
				}
			}
			catch(e){
				error=true;
				// Execute 'catch' stack
				if(options.async){
					for(i=0;func=catch_stack[i];++i){
						func.call(xhr, e, response);
					}
				}
			}
			// Execute complete stack
			if(options.async){
				for(i=0;func=complete_stack[i];++i){
					func.call(xhr, response);
				}
			}
		},

		// Handle errors
		handleError= function(e){
			error=true;
			--requests;
			// Clear the timeout
			clearInterval(timeoutInterval);
			// Execute 'catch' stack
			if(options.async){
				for(i=0;func=catch_stack[i];++i){
					func.call(xhr, e, null);
				}
			}
		},

		// Recursively build the query string
		buildData=function(data,key){
			var res=[],
				enc=encodeURIComponent,
				p;
			if(typeof data==='object' && data!=null) {
				for(p in data) {
					if(data.hasOwnProperty(p)) {
						var built=buildData(data[p],key?key+'['+p+']':p);
						if(built!==''){
							res=res.concat(built);
						}
					}
				}
			}
			else if(data!=null && key!=null){
				res.push(enc(key)+'='+enc(data));
			}
			return res.join('&');
		};

		// New request
		++requests;

		if ('retries' in options) {
			if (win.console && console.warn) {
				console.warn('[Qwest] The retries option is deprecated. It indicates total number of requests to attempt. Please use the "attempts" option.');
			}
			options.attempts = options.retries;
		}

		// Normalize options
		options.async='async' in options?!!options.async:true;
		options.cache='cache' in options?!!options.cache:(method!='GET');
		options.dataType='dataType' in options?options.dataType.toLowerCase():'post';
		options.responseType='responseType' in options?options.responseType.toLowerCase():'auto';
		options.user=options.user || '';
		options.password=options.password || '';
		options.withCredentials=!!options.withCredentials;
		options.timeout='timeout' in options?parseInt(options.timeout,10):30000;
		options.attempts='attempts' in options?parseInt(options.attempts,10):1;

		// Guess if we're dealing with a cross-origin request
		i=url.match(/\/\/(.+?)\//);
		crossOrigin=i && i[1]?i[1]!=location.host:false;

		// Prepare data
		if('ArrayBuffer' in win && data instanceof ArrayBuffer){
			options.dataType='arraybuffer';
		}
		else if('Blob' in win && data instanceof Blob){
			options.dataType='blob';
		}
		else if('Document' in win && data instanceof Document){
			options.dataType='document';
		}
		else if('FormData' in win && data instanceof FormData){
			options.dataType='formdata';
		}
		switch(options.dataType){
			case 'json':
				data=JSON.stringify(data);
				break;
			case 'post':
				data=buildData(data);
		}

		// Prepare headers
		if(options.headers){
			var format=function(match,p1,p2){
				return p1+p2.toUpperCase();
			};
			for(i in options.headers){
				headers[i.replace(/(^|-)([^-])/g,format)]=options.headers[i];
			}
		}
		if(!headers[contentType] && method!='GET'){
			if(options.dataType in mimeTypes){
				if(mimeTypes[options.dataType]){
					headers[contentType]=mimeTypes[options.dataType];
				}
			}
		}
		if(!headers.Accept){
			headers.Accept=(options.responseType in accept)?accept[options.responseType]:'*/*';
		}
		if(!crossOrigin && !headers['X-Requested-With']){ // because that header breaks in legacy browsers with CORS
			headers['X-Requested-With']='XMLHttpRequest';
		}

		// Prepare URL
		if(method=='GET' && data){
			vars+=data;
		}
		if(!options.cache){
			if(vars){
				vars+='&';
			}
			vars+='__t='+(+new Date());
		}
		if(vars){
			url+=(/\?/.test(url)?'&':'?')+vars;
		}

		// The limit has been reached, stock the request
		if(limit && requests==limit){
			request_stack.push({
				method	: method,
				url		: url,
				data	: data,
				options	: options,
				before	: before,
				then	: [],
				'catch'	: [],
				complete: []
			});
			return promises_limit;
		}

		// Send the request
		var send=function(){
			// Get XHR object
			xhr=getXHR();
			if(crossOrigin){
				if(!('withCredentials' in xhr) && win.XDomainRequest){
					xhr=new XDomainRequest(); // CORS with IE8/9
					xdr=true;
					if(method!='GET' && method!='POST'){
						method='POST';
					}
				}
			}
			// Open connection
			if(xdr){
				xhr.open(method,url);
			}
			else{
				xhr.open(method,url,options.async,options.user,options.password);
				if(xhr2 && options.async){
					xhr.withCredentials=options.withCredentials;
				}
			}
			// Set headers
			if(!xdr){
				for(var i in headers){
					xhr.setRequestHeader(i,headers[i]);
				}
			}
			// Verify if the response type is supported by the current browser
			if(xhr2 && options.responseType!='document' && options.responseType!='auto'){ // Don't verify for 'document' since we're using an internal routine
				try{
					xhr.responseType=options.responseType;
					nativeResponseParsing=(xhr.responseType==options.responseType);
				}
				catch(e){}
			}
			// Plug response handler
			if(xhr2 || xdr){
				xhr.onload=handleResponse;
				xhr.onerror=handleError;
			}
			else{
				xhr.onreadystatechange=function(){
					if(xhr.readyState==4){
						handleResponse();
					}
				};
			}
			// Override mime type to ensure the response is well parsed
			if(options.responseType!='auto' && 'overrideMimeType' in xhr){
				xhr.overrideMimeType(mimeTypes[options.responseType]);
			}
			// Run 'before' callback
			if(before){
				before.call(xhr);
			}
			// Send request
			if(xdr){
				setTimeout(function(){ // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
					xhr.send(method!='GET'?data:null);
				},0);
			}
			else{
				xhr.send(method!='GET'?data:null);
			}
		};

		// Timeout/attempts
		var timeout=function(){
			timeoutInterval=setTimeout(function(){
				aborted=true;
				xhr.abort();
				if(!options.attempts || ++attempts!=options.attempts){
					aborted=false;
					timeout();
					send();
				}
				else{
					aborted=false;
					error=true;
					response='Timeout ('+url+')';
					if(options.async){
						for(i=0;func=catch_stack[i];++i){
							func.call(xhr,response);
						}
					}
				}
			},options.timeout);
		};

		// Start the request
		timeout();
		send();

		// Return promises
		return promises;

	};

	// Return external qwest object
	var create=function(method){
			return function(url,data,options){
				var b=before;
				before=null;
				return qwest(method,this.base+url,data,options,b);
			};
		},
		obj={
            base: '',
			before: function(callback){
				before=callback;
				return obj;
			},
			get: create('GET'),
			post: create('POST'),
			put: create('PUT'),
			'delete': create('DELETE'),
			xhr2: xhr2,
			limit: function(by){
				limit=by;
			},
			setDefaultXdrResponseType: function(type){
				defaultXdrResponseType=type.toLowerCase();
			}
		};
	return obj;

}()));

},{}],8:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],9:[function(require,module,exports){
'use strict';

var _ = require('underscore');
var platform = require('platform');
var sessions = require('./sessions');
var transactions = require('./transactions');
var extra = require('./extra_data');
var formatters = require('./formatters');
var uuid = require('./lib/uuid');
var cache = require('./lib/cache');
var url_blacklist = require('./lib/url_blacklist');
var factory = require('./lib/dto_factory');

var handlers = require('./handlers');

window.Mint = window.Mint || {};

var mint_uuid = uuid();

var options = {};

//Initiating PartyJS
Mint.initAndStartSession = function(newOptions) {
  var defaults = {
    apiKey: null,
    batteryLevel: 'NA',
    currentView: 'NA',
    msFromStart: 'NA',
    baseURL: 'https://API_KEY.api.splkmobile.com',
    userIdentifier: 'NA',
    appVersionName: 'NA',
    device: window.navigator.platform,
    osVersion: platform.os.toString(),
    collectLogs: true,
    collectNetworkCalls: true,
    collectPageLoads: true,
    production: true,
    silent: false,
    sdkVersion: '4.3',
    carrier: 'NA', 
    connection: 'NA',
    locale: window.navigator.language,
    platform: 'Web',
    browser: platform.name,
    browserVersion: platform.version,
    os: platform.os.family,
    screenOrientation: 'NA',
    transactions: [],
    session_id: null,
    remoteIP: '3.0.0.0',
    packageName: window.location.host,
    protocol: window.location.protocol,
    url: window.location.href,
    current: window.document.location.pathname,
    previous: document.referrer,
    host: window.location.hostname
  };

  //overrides/extends default options. 
  //Only certain options are available to override.
  options = _.extend({}, defaults, _.pick(newOptions, ['apiKey', 'appVersionName', 'userIdentifier', 'baseURL', 'collectLogs', 'collectNetworkCalls', 'production', 'silent', 'packageName']));

  options.session_id = Mint.startSession();

  //if developer opts for collecting console logs
  if (options.collectLogs) {
    handlers.logHandler();
  }
  //if developer opts for collecting networking calls logs
  if (options.collectNetworkCalls) {
    handlers.networkHandler();
  }
  //if developer opts for collecting performance metrics (Views DTO)
  //call the handler after the page completely loads
  if (options.collectPageLoads) {
    if(document.readyState === "complete"){
      handlers.viewHandler();
    } else {
      window.onload = function(){
        handlers.viewHandler();
      };
    }
  }
  //send DTOs that were stored in cache because of any AJAX failure
  cache.retrieve();
};

//handles external ajax calls
Mint.logJSONP = function(xhr, settings){
  var baseURL = "https://" + Mint.getOption('apiKey') + ".api.splkmobile.com";
  if(!settings.url.indexOf(baseURL) > -1){
    handlers.networkHandler(xhr, settings);
  }
};

Mint.getMintUUID = function () {
  return mint_uuid;
};

//sends all the remaining events
Mint.flush = function(){
  factory();
};

Mint.getOption = function (key) {
  return options[key];
};

//public method to set a user identifier
Mint.setUserIdentifier = function (userIdentifier) {
  options.userIdentifier = userIdentifier;
};

//public method to set package name
Mint.setPackageName = function (packageName){
  options.packageName = packageName;
}

//handle remaining DTOs on unload
window.addEventListener('unload', function(event) {
  factory('unload');
});

// Public API assignments
Mint.startSession = sessions.startSession;
Mint.closeSession = sessions.closeSession;
Mint.transactionStart = transactions.transactionStart;
Mint.transactionStop = transactions.transactionStop;
Mint.transactionCancel = transactions.transactionCancel;
Mint.addURLToBlackList = url_blacklist.addURLToBlackList;
Mint.addURLPatternToBlackList = url_blacklist.addURLPatternToBlackList;
Mint.blackListedURLs = url_blacklist.blackListedURLs;
Mint.logEvent = require('./events');
Mint.getExtraData = extra.getExtraData;
Mint.addExtraData = extra.addExtraData;
Mint.clearExtraData = extra.clearExtraData;
Mint.removeExtraData = extra.removeExtraData;
Mint.attachFormatter = formatters.attachFormatter;
Mint.callFormatter = formatters.callFormatter;
Mint.logConsole = require('./logs');

module.exports = Mint;

},{"./events":10,"./extra_data":11,"./formatters":15,"./handlers":22,"./lib/cache":26,"./lib/dto_factory":28,"./lib/url_blacklist":31,"./lib/uuid":32,"./logs":33,"./sessions":34,"./transactions":35,"platform":6,"underscore":8}],10:[function(require,module,exports){
var factory = require('./lib/dto_factory');
var _ = require('underscore');

//log generic events 
//public method called by the user
//Extra data can be passed with this method
var logEvent = function (eventName, logLevel, extraData) {
  var fields = {
    event_name: eventName
  };

  if (logLevel) {
    fields['level'] = logLevel;
  }

  if(_.isObject(extraData)) {
    fields['extraData'] = extraData;
  }

  return factory('event', fields);
};

module.exports = logEvent;


},{"./lib/dto_factory":28,"underscore":8}],11:[function(require,module,exports){
var _ = require('underscore');
var extraData = {};

//appends extra data for all DTOs
var addExtraData = function (key, value) {
  if (!_.isUndefined(key) && _.isUndefined(value)) {
    extraData = _.extend(key, extraData);
  } else {
    extraData[key] = value;
  }

  return extraData;
};

var removeExtraData = function (key) {
  delete extraData[key];
};

var clearExtraData = function (key) {
  extraData = {};
};

var getExtraData = function () {
  return extraData;
};

exports.addExtraData = addExtraData;
exports.getExtraData = getExtraData;
exports.removeExtraData = removeExtraData;
exports.clearExtraData = clearExtraData;


},{"underscore":8}],12:[function(require,module,exports){
var timestamp = require('../lib/timestamp');

//baseFormatter consists of the base fields to be included in DTOs with default values
var baseFormatter = function (type) {
    if(type !== undefined){
      return {
        apiKey: Mint.getOption('apiKey'),
        osVersion: Mint.getOption('osVersion'),
        device: Mint.getOption('device'),
        platform: Mint.getOption('platform'),
        type: type,
        sdkVersion: Mint.getOption('sdkVersion'),
        carrier: Mint.getOption('carrier'),
        connection: Mint.getOption('connection'),
        locale: Mint.getOption('locale'),
        browser: Mint.getOption('browser'),
        browserVersion: Mint.getOption('browserVersion'),
        os: Mint.getOption('os'),
        screenOrientation: Mint.getOption('screenOrientation'),
        session_id: Mint.getOption('session_id'),
        packageName: Mint.getOption('packageName'),
        state: navigator.onLine == true ? 'CONNECTED' : 'DISCONNECTED',
        remoteIP: Mint.getOption('remoteIP'),
        appVersionName: Mint.getOption('appVersionName'),
        userIdentifier: Mint.getOption('userIdentifier'),
        uuid: Mint.getMintUUID(),
        //extraData: Mint.getExtraData(),
        current: Mint.getOption('current'),
        timestamp: timestamp(),
        appVersionCode: 'NA',
        protocol: Mint.getOption('protocol'),
        url: Mint.getOption('url'),
        previous: Mint.getOption('previous'),
        elapsedTime: Mint.getOption('elapsedTime'),
        host: Mint.getOption('host')
      }
    } else {
        return null;
    }
}

module.exports = baseFormatter;


},{"../lib/timestamp":30}],13:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');
var LEVELS = require('./log_levels');

//Formats Event DTO
var eventFormatter = function (fields) {
  //if logLevel was explicitly set 
  if (fields.level) {
    fields.level = LEVELS[fields.level];
  } else {
    fields.level = 'NA';
  }

  // if global extra data is set, it will be appended with the extra data set for Events
  var global_extra_data = Mint.getExtraData();
  if(fields.extraData !== undefined){
  	_.extend(fields.extraData, global_extra_data);
  } else {
  	fields.extraData = global_extra_data;
  }
  fields.appRunningState = 'NA';

  // selects fields only applicable for Events DTO
  var event_fields = ['appVersionName', 'platform', 'connection', 'osVersion', 'packageName', 'appVersionCode', 'userIdentifier', 'locale', 'state', 'apiKey', 'sdkVersion', 'level', 'remoteIP', 'device', 'carrier', 'uuid', 'event_name', 'type', 'timestamp', 'browser', 'browserVersion', 'extraData', 'batteryLevel', 'currentView', 'msFromStart', 'screenOrientation', 'transactions', 'session_id', 'appRunningState'];
  return _.pick(_.extend(fields, baseFormatter('event'), {}), event_fields);
};

module.exports = eventFormatter;


},{"./base_formatter":12,"./log_levels":17,"underscore":8}],14:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');

//Formats gnip DTO
var gnipFormatter = function(data) {
  var global_extra_data = Mint.getExtraData();
  data.extraData = global_extra_data;
  data.appRunningState = 'NA';
  data.fsEncrypted = 'NA';
  data.rooted = false;

  // selects fields only applicable for gnip DTO
  var whitelistedFields = ['session_id', 'ses_duration', 'extraData', 'batteryLevel', 'currentView', 'msFromStart', 'screenOrientation', 'transactions', 'appRunningState'];
  var gnip_fields = ['carrier', 'sdkVersion', 'device', 'locale', 'platform', 'state', 'osVersion', 'appVersionCode', 'remoteIP', 'userIdentifier', 'connection', 'appVersionName', 'uuid', 'session_id', 'packageName', 'apiKey', 'ses_duration', 'type', 'timestamp', 'browser', 'browserVersion', 'extraData', 'batteryLevel', 'currentView', 'msFromStart', 'screenOrientation', 'transactions', 'appRunningState'];
  return _.pick(_.extend(baseFormatter('gnip'), _.pick(data, whitelistedFields)), gnip_fields);
};

module.exports = gnipFormatter;


},{"./base_formatter":12,"underscore":8}],15:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');

var formatters = {
  log: require('./log_formatter'),
  event: require('./event_formatter'),
  network: require('./network_formatter'),
  transaction: require('./transaction_formatter'),
  ping: require('./ping_formatter'),
  gnip: require('./gnip_formatter'),
  view: require('./view_formatter')
};

//calls the appropriate formatter
var callFormatter = function (type, data) {
  if(type && data !== undefined){
    return formatters[type].call(this, data, type)
  } else {
    console.log("Define both type and data as arguments");
    return null;
  }
};

//public method for user to call appropriate formatter
var attachFormatter = function (name, callback) {
  formatters[name] = function (data, type) {
    var response = callback(data)

    return _.extend(response, baseFormatter(type), {})
  };
};

exports.attachFormatter = attachFormatter;
exports.callFormatter = callFormatter


},{"./base_formatter":12,"./event_formatter":13,"./gnip_formatter":14,"./log_formatter":16,"./network_formatter":18,"./ping_formatter":19,"./transaction_formatter":20,"./view_formatter":21,"underscore":8}],16:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');

var LEVELS = require('./log_levels');

//Formats log DTO
var logFormatter = function(log) {
	var global_extra_data = Mint.getExtraData();
	log.extraData = global_extra_data;

	// selects fields only applicable for log DTO
	var log_fields = ['carrier', 'sdkVersion', 'device', 'locale', 'log_name', 'platform', 'state', 'osVersion', 'level', 'remoteIP', 'userIdentifier', 'connection', 'appVersionName', 'appVersionCode', 'uuid', 'apiKey', 'packageName', 'type', 'timestamp', 'browser', 'browserVersion', 'extraData', 'batteryLevel', 'currentView', 'msFromStart', 'screenOrientation', 'session_id', 'transactions'];
  return _.pick(_.extend({
    log_name: log.content,
    level: LEVELS[log.level],
    extraData: log.extraData
  }, baseFormatter('log'), {}), log_fields);
};

module.exports = logFormatter;


},{"./base_formatter":12,"./log_levels":17,"underscore":8}],17:[function(require,module,exports){
//levels assigned to different console statements
module.exports = {
  'error': 60,
  'warn': 50,
  'log': 40,
  'info': 40,
};


},{}],18:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');

//Formats network DTO
var networkFormatter = function(data) {
  var global_extra_data = Mint.getExtraData();
  data.extraData = global_extra_data;
  data.appRunningState = 'NA';

  // select fields only applicable for Network DTO
  var network_fields = ['remoteIP', 'statusCode', 'state', 'protocol', 'failed', 'url', 'requestLength', 'device', 'carrier', 'connection', 'userIdentifier', 'uuid', 'apiKey', 'locale', 'exception', 'packageName', 'osVersion', 'appVersionCode', 'responseLength', 'latency', 'appVersionName', 'platform', 'sdkVersion', 'type', 'timestamp', 'requestLength', 'browser', 'browserVersion', 'extraData', 'batteryLevel', 'currentView', 'msFromStart', 'screenOrientation', 'transactions', 'session_id', 'appRunningState'];
  return _.pick(_.extend(baseFormatter('network'), data), network_fields);
};

module.exports = networkFormatter;



},{"./base_formatter":12,"underscore":8}],19:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');

//formats ping data
var pingFormatter = function(data) {
  var global_extra_data = Mint.getExtraData();
  data.extraData = global_extra_data;
  data.fsEncrypted = 'NA';
  data.rooted = false;

  //selects only fields applicable for ping DTO
  var whitelistedFields = ['session_id', 'ses_duration', 'extraData', 'batteryLevel', 'currentView', 'fsEncrypted', 'msFromStart', 'rooted', 'screenOrientation', 'transactions'];
  var ping_fields = ['carrier', 'sdkVersion', 'device', 'locale', 'platform', 'state', 'osVersion', 'appVersionCode', 'remoteIP', 'userIdentifier', 'connection', 'appVersionName', 'uuid', 'session_id', 'packageName', 'apiKey', 'type', 'timestamp', 'browser', 'browserVersion', 'extraData', 'batteryLevel', 'currentView', 'fsEncrypted', 'msFromStart', 'rooted', 'screenOrientation', 'transactions'];
  return _.pick(_.extend(baseFormatter('ping'), _.pick(data, whitelistedFields)), ping_fields);
};

module.exports = pingFormatter;


},{"./base_formatter":12,"underscore":8}],20:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');

//formats Transaction DTO
var transactionFormatter = function(data) {
  // if global extra data is set, it will be appended with the extra data set for Transactions
  var global_extra_data = Mint.getExtraData();
  if(data.extraData !== undefined){
  	_.extend(data.extraData, global_extra_data);
  } else {
  	data.extraData = global_extra_data;
  }
  if(data.reason === 'undefined'){
  	data.reason = 'NA';
  }
  //selects fields only applicable for Transaction DTO
  var transaction_fields = ['remoteIP', 'tr_duration', 'state', 'transaction_id', 'connection', 'device', 'userIdentifier', 'carrier', 'uuid', 'apiKey', 'locale', 'packageName', 'osVersion', 'appVersionCode', 'reason', 'tr_name', 'appVersionName', 'platform', 'status', 'sdkVersion', 'type', 'timestamp', 'browser', 'browserVersion', 'extraData', 'batteryLevel', 'currentView', 'msFromStart', 'screenOrientation', 'transactions', 'session_id', 'appRunningState'];	
  var whitelistedFields = ['tr_name', 'transaction_id', 'tr_duration', 'reason', 'status', 'extraData'];
  return _.pick(_.extend(baseFormatter(data.tr_type), _.pick(data, whitelistedFields)), transaction_fields);
};

module.exports = transactionFormatter;

},{"./base_formatter":12,"underscore":8}],21:[function(require,module,exports){
var _ = require('underscore');
var baseFormatter = require('./base_formatter');

//Formats view DTO
var viewFormatter = function(data) {
  var global_extra_data = Mint.getExtraData();
  data.extraData = global_extra_data;
  data.appRunningState = 'NA';
  if(Mint.getOption('current') !== undefined){
  	data.currentView = Mint.getOption('current');
  }
  //selects fields only applicable for View DTO
  var view_fields = ['appVersionName', 'platform', 'connection', 'osVersion', 'packageName', 'appVersionCode', 'locale', 'state', 'sdkVersion', 'remoteIP', 'current', 'previous', 'elapsedTime', 'loadTime', 'host', 'domainLookupTime', 'domProcessingTime', 'serverTime', 'device', 'carrier', 'uuid', 'type', 'timestamp', 'browser', 'browserVersion', 'extraData', 'batteryLevel', 'currentView', 'msFromStart', 'screenOrientation', 'transactions', 'session_id', 'apiKey', 'appRunningState', 'userIdentifier'];
  return _.pick(_.extend(baseFormatter('view'), data), view_fields);
};

module.exports = viewFormatter;
},{"./base_formatter":12,"underscore":8}],22:[function(require,module,exports){
exports.logHandler = require('./log_handler');
exports.networkHandler = require('./network_handler');
exports.viewHandler = require('./view_handler');


},{"./log_handler":23,"./network_handler":24,"./view_handler":25}],23:[function(require,module,exports){
//handler for console.log events
var logHandler = function() {
  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;

  console.log = function() {
  	//Calls a public method with the console log statement
    Mint.logConsole(arguments[0], 'log');
    if (!Mint.getOption('silent')) {
      origLog.apply(console, arguments);
    }
  };
};

module.exports = logHandler;

},{}],24:[function(require,module,exports){
var XHR = XMLHttpRequest;
var factory = require('../lib/dto_factory');
var timestamp = require('../lib/timestamp');
var url_blacklist = require('../lib/url_blacklist');

var networkHandler = function (xhr, settings) {
  //handle internal ajax requests when the arguments are not set
  if(xhr === undefined || settings === undefined){
    // Save Original Prototypes
    var open = XHR.prototype.open;
    var send = XHR.prototype.send;

    XHR.prototype.open = function(method, url, async, user, pass) {
      this._method = method;
      this._url = url;
      open.call(this, method, url, async, user, pass);
    };

    XHR.prototype.send = function(data) {
      var self = this;
      var startTime;
      var oldOnReadyStateChange;
      var method = this._method;
      var url = this._url;
      var protocol = !!~url.search('://') ? url.split('://').shift() : window.location.protocol.replace(':', '');
      var summary;
      var baseURL = "https://" + Mint.getOption('apiKey') + ".api.splkmobile.com";
      function onReadyStateChange() {
        //if url is pointing to CDS
        if (url.indexOf(baseURL) > -1) {
          return false;
        }
        //if url is blacklisted
        if (url_blacklist.isURLBlackListed(url) || url_blacklist.isURLPatternBlackListed(url)) {
          return false;
        }
        if (self.readyState == 4) {
          var endTime = timestamp();
          var latency = endTime - startTime;
          var statusCode = self.status;

          var networkCall = {
            method: method,
            protocol: protocol,
            url: url,
            latency: latency,
            responseLength: self.responseText.length,
            requestLength: 'NA'
          };

          if (statusCode < 400) {
            networkCall['failed'] = false;
            networkCall['statusCode'] = statusCode;
            networkCall['exception'] = 'NA';
          } else {
            networkCall['failed'] = true;
            networkCall['statusCode'] = statusCode;
            networkCall['exception'] = self.statusText;
          }
          factory('network', networkCall);
        }


        if (oldOnReadyStateChange) {
          oldOnReadyStateChange();
        }
      }
      if (!this.noIntercept) {
        startTime = timestamp();
        if (this.addEventListener) {
          this.addEventListener("readystatechange", onReadyStateChange, false);
        } else {
          oldOnReadyStateChange = this.onreadystatechange;
          this.onreadystatechange = onReadyStateChange;
        }
      }
      send.call(this, data);
    };
  }

  //handles external AJAX requests (JSONP) when the arguments are defined
   else {
    var method = settings.type;
    var url = settings.url;
    var protocol = settings.url.substr(0, url.indexOf(':'));
    var latency = 'NA';
    var requestLength = 'NA';
    var responseLength = 'NA';
    var statusCode = xhr.status;

    var networkCalls = {
      method: method,
      protocol: protocol,
      url: url,
      latency: latency,
      responseLength: responseLength,
      requestLength: requestLength
    };
  
    if(statusCode < 400){
      networkCalls['failed'] = false;
      networkCalls['statusCode'] = statusCode;
      networkCalls['exception'] = xhr.statusText;
    } else {
      networkCalls['failed'] = true;
      networkCalls['statusCode'] = statusCode;
      networkCalls['exception'] = 'None';
    }
    factory('network', networkCalls);
  }
};

module.exports = networkHandler;

},{"../lib/dto_factory":28,"../lib/timestamp":30,"../lib/url_blacklist":31}],25:[function(require,module,exports){
var factory = require('../lib/dto_factory');
var timestamp = require('../lib/timestamp');
//handler for views DTO
var viewHandler = function() {
    //settimeout to 0 pauses JS execution to let rendering threads catch up
    setTimeout(function(){
        // Performance metrics
        var t = window.performance.timing;
        var loadTime = t.loadEventEnd - t.navigationStart;
        var elapsedTime = t.loadEventEnd - t.unloadEventStart;
        var domainLookupTime = t.domainLookupEnd - t.domainLookupStart;
        var domProcessingTime = t.domComplete - t.domLoading;
        var serverTime = t.responseEnd - t.responseStart;
        
        factory('view', {
        	loadTime: loadTime,
        	domainLookupTime: domainLookupTime,
        	domProcessingTime: domProcessingTime,
        	serverTime: serverTime,
            elapsedTime: elapsedTime
        });
    }, 0);
};

module.exports = viewHandler;

},{"../lib/dto_factory":28,"../lib/timestamp":30}],26:[function(require,module,exports){
var _ = require('underscore');
var Lockr = require('lockr');
var dispatcher = require('./dispatcher');
var queue = [];

var save = function (data) {
  _.each(data, function (dto) {
    queue.push(dto);
  });
  update();
};

var update = function () {
  Lockr.set('mintjs:cache', queue);
};

var retrieve = function () {
  queue = _.union(Lockr.get('mintjs:cache', []), queue);
};

var dispatchCache = function () {
  dispatcher.dispatchData(queue);
  queue = [];
};

exports.save = save;
exports.retrieve = retrieve;


},{"./dispatcher":27,"lockr":3,"underscore":8}],27:[function(require,module,exports){
var _ = require('underscore');
var qwest = require('qwest');
var cache = require('./cache');

var API_VERSION = '1.0';

//sends data to CDS URL
var sendData = function (url, data) {
  var headers = {
    "Content-Type": "application/json;charset=UTF-8",
    "X-Splunk-Mint-Send-CORS": true
    //,"Authorization": "Splunk 914F95E5-21DC-4DD2-8A7F-AD39872240A5"
  }

//Uses a post request. If there is an error, save the data in the cache and try it later on the next page load. See cache.js
  qwest.post(url, data, {dataType: 'text', headers: headers})
       .catch(function () {
         cache.save(data);
       });
};

var bundleDTOs = function (dtos) {
  return _.map(dtos, function (dto) {
    var separator = ["{", parseInt(API_VERSION), dto.type, dto.timestamp].join('^') + "}";
    var dto = _.omit(dto, ['type', 'timestamp']);

    return JSON.stringify(dto) + separator;
  }).join('');
};

//builds URL according to CDS specs
var buildURL = function (dtos) {
  var errors = 0,
      events = 0,
      baseURL = Mint.getOption('baseURL');

  _.each(dtos, function (dto) {
    if (dto.stacktrace || dto.errorHash || dto.klass) {
      errors++;
    } else {
      events++;
    }
  });

  if (baseURL.localeCompare('https://API_KEY.api.splkmobile.com') == 0){
    baseURL = baseURL.replace('API_KEY', Mint.getOption('apiKey'));
    return [baseURL, API_VERSION, Mint.getOption('apiKey'), Mint.getMintUUID(), errors, events].join('/');
  } else {
    return baseURL;
  }
};

var dispatchData = function (dtos) {
  var url = buildURL(dtos);
  var data = bundleDTOs(dtos);

  sendData(url, data);
};

//sends data on window.unload
//Uses sendBeacon because asynchronous POST will not work for window.unload
var sendFinalData = function (dtos) {
  var url = buildURL(dtos);
  var data = bundleDTOs(dtos);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, data);
  } else {
    xhr = new XMLHttpRequest();
    xhr.open('post', url, false);
    xhr.send(data);
  }
};

exports.dispatchData = dispatchData;
exports.bundleDTOs = bundleDTOs;
exports.sendFinalData = sendFinalData;

},{"./cache":26,"qwest":7,"underscore":8}],28:[function(require,module,exports){
var _ = require('underscore');
var formatters = require('../formatters');
var dispatcher = require('./dispatcher');

var dtos = [];

//makes batches of data and forwards to dispatchData method
var forwardData = function (flush) {
	//For flush, dispatch remaining data
	if(flush === 'flush'){
		if(dtos.length > 0){
			dispatcher.dispatchData(dtos);
			dtos = [];
		}
	} 
	//For unload, dispatch remaining data using sendBeacon method 
	else if(flush === 'unload') {
		if(dtos.length > 0){
			dispatcher.sendFinalData(dtos);
			dtos = [];
		}
	} 
	//dispatch as a batch
	else {
	  if (dtos.length > 5) {
	    var data = dtos.splice(0, 5);
	    dispatcher.dispatchData(data);
	  }
	}
};

//formats and packages the DTOs
var factory = function(type, data) {
	if(type === undefined || data === undefined){
	  forwardData('flush');
	} else if(type === 'unload') {
	  forwardData('unload');	
	} else {
	  var dto = formatters.callFormatter(type, data);
	  dtos.push(dto);
	  forwardData('batch');
	  return dto;
	}
};

exports = module.exports = factory;

},{"../formatters":15,"./dispatcher":27,"underscore":8}],29:[function(require,module,exports){
var timestamp = require('./timestamp');
var uuidGenerator = require('node-uuid');

module.exports = function () {
  var time = timestamp().toString();
  time = time.substr(time.length - 4, time.length);
  var sub_uuid = uuidGenerator.v4();
  sub_uuid = sub_uuid.substr(0, 4);
  return sub_uuid.concat(time);
};

},{"./timestamp":30,"node-uuid":5}],30:[function(require,module,exports){
module.exports = function () {
  return Date.now();
};


},{}],31:[function(require,module,exports){
var _ = require('underscore');

var url_blacklist = [];
var pattern_blacklist = [];

//Public method to add specific urls (Ex: http://www.splunk.com/abc/xyz) to blacklist
//Network DTO will not capture the data with these URLs
var addURLToBlackList = function (url) {
  url_blacklist.push(url);

  url_blacklist = _.uniq(url_blacklist);
};

//check if url is blacklisted
var isURLBlackListed = function (url) {
  return (url_blacklist.indexOf(url) > -1);
};

//Public method to add a url pattern (Ex: splunk.com/ab) to blacklist
//Network DTO will not capture the data with these URL patterns
var addURLPatternToBlackList = function (pattern) {
   pattern_blacklist.push(pattern);

   pattern_blacklist = _.uniq(pattern_blacklist);
};

//check if a url pattern is blacklisted
var isURLPatternBlackListed = function (url) {
	var isListed = false;
	_.each(pattern_blacklist, function (pattern){
		if(url.indexOf(pattern) > -1){
			isListed = true;
		}
	});
	return isListed;
};

//public method that returns all the blacklisted urls and url patterns as a string
var blackListedURLs = function () {
	var urls = 'URLs: ';
	if(url_blacklist.length > 0) {
		urls += '[';
		_.each(url_blacklist, function(url){
			urls += url + ', ';
		});
		urls = urls.slice(0, -2) + '], '; 
	} else {
		urls += '[], ';
	}
	urls += 'URL Patterns: ';
	if(pattern_blacklist.length > 0) {
		urls += '[';
		_.each(pattern_blacklist, function(pattern){
			urls += pattern + ', ';
		});
		urls = urls.slice(0, -2) + ']';
	} else {
		urls += '[]';
	}
	
	return urls;
};

exports.addURLToBlackList = addURLToBlackList;
exports.isURLBlackListed = isURLBlackListed;
exports.addURLPatternToBlackList = addURLPatternToBlackList;
exports.isURLPatternBlackListed = isURLPatternBlackListed;
exports.blackListedURLs = blackListedURLs;

},{"underscore":8}],32:[function(require,module,exports){
var uuidGenerator = require('node-uuid');
var Cookies = require('js-cookie');

var generateUUID = function() {
	var uuid;
	if(typeof Cookies.get('mintjs:uuid') === 'undefined'){
		uuid = uuidGenerator.v4();
		Cookies.set('mintjs:uuid', uuid, {expires: 365});
	} else {
		uuid = Cookies.get('mintjs:uuid');
	}
  return uuid;
}

module.exports = generateUUID;


},{"js-cookie":2,"node-uuid":5}],33:[function(require,module,exports){
var factory = require('./lib/dto_factory');

//tracks console log statements
var logConsole = function (content, level) {
  var log = {
    content: content,
    level: level || 'log'
  };

  return factory('log', log);
};

module.exports = logConsole;


},{"./lib/dto_factory":28}],34:[function(require,module,exports){
var session_id = require('./lib/session_id');
var timestamp = require('./lib/timestamp');
var factory = require('./lib/dto_factory');
var Cookies = require('js-cookie');

// startSession is called on every page load. If the user is inactive for the last 30 mins,
// it will close the session using closeSession() and sends a 'gnip' DTO,
// starts a new session and sends a 'ping' DTO
// Session is stored as a cookie 
var startSession = function () {
	if(typeof Cookies.get('session') !== 'undefined'){
		var current_time = timestamp();
		var session = Cookies.getJSON('session');
		session.session_id = decodeURIComponent(session.session_id);
		session.lastActive = decodeURIComponent(session.lastActive);
		session.startTime = decodeURIComponent(session.startTime);
	  	if(current_time - session.lastActive > 1800000){
	  		closeSession();
	  		startSession();
	  	} else {
	  		session.lastActive = current_time;
	  		Cookies.set('session', session); 
	  	}
	} else {
		var session = {};
		session.session_id = session_id();
	  	session.startTime = timestamp();
	  	session.lastActive = session.startTime;
	  	factory('ping', session);
	  	Cookies.set('session', session);
	}
  	return session.session_id;
};

//closes session and sends a 'gnip' DTO
var closeSession = function() {
  	var session = Cookies.getJSON('session');
  	if(typeof session !== 'undefined'){
	  session.ses_duration = session.lastActive - session.startTime;
	  factory('gnip', session);
	  Cookies.remove('session');
	  return session.session_id;
  	}
};

exports.startSession = startSession;
exports.closeSession = closeSession;

},{"./lib/dto_factory":28,"./lib/session_id":29,"./lib/timestamp":30,"js-cookie":2}],35:[function(require,module,exports){
var _  = require('underscore');
var session_id = require('./lib/session_id');
var timestamp = require('./lib/timestamp');
var pubsub = require('minpubsub');
var factory = require('./lib/dto_factory');

var transactions = [];

var Transaction = function(name, extraData) {
  this.tr_name = name;
  this.transaction_id = session_id();
  this._milliStart = timestamp();
  this.tr_type = 'trstart';
  if(extraData){
    this.extraData = extraData;
  }
  sendTransaction(this);
};

Transaction.prototype.stop = function (status, reason) {
  this.status = status;
  this.reason = reason;
  this.tr_duration = timestamp() - this._milliStart;
  this.tr_type = 'trstop';

  sendTransaction(this);
  destroyTransaction(this.transaction_id);
};

var transactionStart = function (name, extraData) {
  var transaction = findTransaction(name);
  if (transaction) {
    return transaction;
  }

  if(extraData){
    var transaction = new Transaction(name, extraData);
  } else {
    var transaction = new Transaction(name);
  }

  transactions.push(transaction);

  return transaction;
};

var transactionStop = function (name, extraData) {
  var transaction = findTransaction(name);

  if (transaction) {
    if(extraData){
      transaction.extraData = extraData;
    }
    transaction.stop('SUCCESS');

    return transaction;
  } else {
    return undefined;
  }
};

var transactionCancel = function (name, reason, extraData) {

  var transaction = findTransaction(name);

  if (transaction) {
    if(_.isObject(extraData)){
      transaction.extraData = extraData;
    }
    transaction.stop('CANCEL', reason);
    return transaction;
  } else {
    return undefined;
  }
};

var sendTransaction = function (transaction) {
  factory('transaction', transaction);
};

var findTransaction = function (name) {
  return _.findWhere(transactions, {tr_name: name});
};

var destroyTransaction = function (id) {
  transactions = _.reject(transactions, function (transaction) {
    return transaction.transaction_id === id;
  });
};

var errorHappened = function (errorHash) {
  _.each(transactions, function (transaction) {
    transaction.stop('FAIL', errorHash);
  });
};

pubsub.subscribe('mintjs:cancel_transaction', errorHappened);

exports.transactionStart = transactionStart;
exports.transactionStop = transactionStop;
exports.transactionCancel = transactionCancel;


},{"./lib/dto_factory":28,"./lib/session_id":29,"./lib/timestamp":30,"minpubsub":4,"underscore":8}]},{},[1])(1)
});