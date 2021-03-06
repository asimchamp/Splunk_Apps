!function() {
  var d3 = {
    version: "3.5.5"
  };
  var d3_arraySlice = [].slice, d3_array = function(list) {
    return d3_arraySlice.call(list);
  };
  var d3_document = this.document;
  function d3_documentElement(node) {
    return node && (node.ownerDocument || node.document || node).documentElement;
  }
  function d3_window(node) {
    return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
  }
  if (d3_document) {
    try {
      d3_array(d3_document.documentElement.childNodes)[0].nodeType;
    } catch (e) {
      d3_array = function(list) {
        var i = list.length, array = new Array(i);
        while (i--) array[i] = list[i];
        return array;
      };
    }
  }
  if (!Date.now) Date.now = function() {
    return +new Date();
  };
  if (d3_document) {
    try {
      d3_document.createElement("DIV").style.setProperty("opacity", 0, "");
    } catch (error) {
      var d3_element_prototype = this.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = this.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
      d3_element_prototype.setAttribute = function(name, value) {
        d3_element_setAttribute.call(this, name, value + "");
      };
      d3_element_prototype.setAttributeNS = function(space, local, value) {
        d3_element_setAttributeNS.call(this, space, local, value + "");
      };
      d3_style_prototype.setProperty = function(name, value, priority) {
        d3_style_setProperty.call(this, name, value + "", priority);
      };
    }
  }
  d3.ascending = d3_ascending;
  function d3_ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }
  d3.descending = function(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  };
  d3.min = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
    }
    return a;
  };
  d3.max = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
    }
    return a;
  };
  d3.extent = function(array, f) {
    var i = -1, n = array.length, a, b, c;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = c = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = c = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }
    return [ a, c ];
  };
  function d3_number(x) {
    return x === null ? NaN : +x;
  }
  function d3_numeric(x) {
    return !isNaN(x);
  }
  d3.sum = function(array, f) {
    var s = 0, n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = +array[i])) s += a;
    } else {
      while (++i < n) if (d3_numeric(a = +f.call(array, array[i], i))) s += a;
    }
    return s;
  };
  d3.mean = function(array, f) {
    var s = 0, n = array.length, a, i = -1, j = n;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
    } else {
      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) s += a; else --j;
    }
    if (j) return s / j;
  };
  d3.quantile = function(values, p) {
    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
    return e ? v + e * (values[h] - v) : v;
  };
  d3.median = function(array, f) {
    var numbers = [], n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
    } else {
      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) numbers.push(a);
    }
    if (numbers.length) return d3.quantile(numbers.sort(d3_ascending), .5);
  };
  d3.variance = function(array, f) {
    var n = array.length, m = 0, a, d, s = 0, i = -1, j = 0;
    if (arguments.length === 1) {
      while (++i < n) {
        if (d3_numeric(a = d3_number(array[i]))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    } else {
      while (++i < n) {
        if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    }
    if (j > 1) return s / (j - 1);
  };
  d3.deviation = function() {
    var v = d3.variance.apply(this, arguments);
    return v ? Math.sqrt(v) : v;
  };
  function d3_bisector(compare) {
    return {
      left: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
        }
        return lo;
      }
    };
  }
  var d3_bisect = d3_bisector(d3_ascending);
  d3.bisectLeft = d3_bisect.left;
  d3.bisect = d3.bisectRight = d3_bisect.right;
  d3.bisector = function(f) {
    return d3_bisector(f.length === 1 ? function(d, x) {
      return d3_ascending(f(d), x);
    } : f);
  };
  d3.shuffle = function(array, i0, i1) {
    if ((m = arguments.length) < 3) {
      i1 = array.length;
      if (m < 2) i0 = 0;
    }
    var m = i1 - i0, t, i;
    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
    }
    return array;
  };
  d3.permute = function(array, indexes) {
    var i = indexes.length, permutes = new Array(i);
    while (i--) permutes[i] = array[indexes[i]];
    return permutes;
  };
  d3.pairs = function(array) {
    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
    return pairs;
  };
  d3.zip = function() {
    if (!(n = arguments.length)) return [];
    for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m; ) {
      for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n; ) {
        zip[j] = arguments[j][i];
      }
    }
    return zips;
  };
  function d3_zipLength(d) {
    return d.length;
  }
  d3.transpose = function(matrix) {
    return d3.zip.apply(d3, matrix);
  };
  d3.keys = function(map) {
    var keys = [];
    for (var key in map) keys.push(key);
    return keys;
  };
  d3.values = function(map) {
    var values = [];
    for (var key in map) values.push(map[key]);
    return values;
  };
  d3.entries = function(map) {
    var entries = [];
    for (var key in map) entries.push({
      key: key,
      value: map[key]
    });
    return entries;
  };
  d3.merge = function(arrays) {
    var n = arrays.length, m, i = -1, j = 0, merged, array;
    while (++i < n) j += arrays[i].length;
    merged = new Array(j);
    while (--n >= 0) {
      array = arrays[n];
      m = array.length;
      while (--m >= 0) {
        merged[--j] = array[m];
      }
    }
    return merged;
  };
  var abs = Math.abs;
  d3.range = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };
  function d3_range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }
  function d3_class(ctor, properties) {
    for (var key in properties) {
      Object.defineProperty(ctor.prototype, key, {
        value: properties[key],
        enumerable: false
      });
    }
  }
  d3.map = function(object, f) {
    var map = new d3_Map();
    if (object instanceof d3_Map) {
      object.forEach(function(key, value) {
        map.set(key, value);
      });
    } else if (Array.isArray(object)) {
      var i = -1, n = object.length, o;
      if (arguments.length === 1) while (++i < n) map.set(i, object[i]); else while (++i < n) map.set(f.call(object, o = object[i], i), o);
    } else {
      for (var key in object) map.set(key, object[key]);
    }
    return map;
  };
  function d3_Map() {
    this._ = Object.create(null);
  }
  var d3_map_proto = "__proto__", d3_map_zero = "\x00";
  d3_class(d3_Map, {
    has: d3_map_has,
    get: function(key) {
      return this._[d3_map_escape(key)];
    },
    set: function(key, value) {
      return this._[d3_map_escape(key)] = value;
    },
    remove: d3_map_remove,
    keys: d3_map_keys,
    values: function() {
      var values = [];
      for (var key in this._) values.push(this._[key]);
      return values;
    },
    entries: function() {
      var entries = [];
      for (var key in this._) entries.push({
        key: d3_map_unescape(key),
        value: this._[key]
      });
      return entries;
    },
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this._) f.call(this, d3_map_unescape(key), this._[key]);
    }
  });
  function d3_map_escape(key) {
    return (key += "") === d3_map_proto || key[0] === d3_map_zero ? d3_map_zero + key : key;
  }
  function d3_map_unescape(key) {
    return (key += "")[0] === d3_map_zero ? key.slice(1) : key;
  }
  function d3_map_has(key) {
    return d3_map_escape(key) in this._;
  }
  function d3_map_remove(key) {
    return (key = d3_map_escape(key)) in this._ && delete this._[key];
  }
  function d3_map_keys() {
    var keys = [];
    for (var key in this._) keys.push(d3_map_unescape(key));
    return keys;
  }
  function d3_map_size() {
    var size = 0;
    for (var key in this._) ++size;
    return size;
  }
  function d3_map_empty() {
    for (var key in this._) return false;
    return true;
  }
  d3.nest = function() {
    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
    function map(mapType, array, depth) {
      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
          values.push(object);
        } else {
          valuesByKey.set(keyValue, [ object ]);
        }
      }
      if (mapType) {
        object = mapType();
        setter = function(keyValue, values) {
          object.set(keyValue, map(mapType, values, depth));
        };
      } else {
        object = {};
        setter = function(keyValue, values) {
          object[keyValue] = map(mapType, values, depth);
        };
      }
      valuesByKey.forEach(setter);
      return object;
    }
    function entries(map, depth) {
      if (depth >= keys.length) return map;
      var array = [], sortKey = sortKeys[depth++];
      map.forEach(function(key, keyMap) {
        array.push({
          key: key,
          values: entries(keyMap, depth)
        });
      });
      return sortKey ? array.sort(function(a, b) {
        return sortKey(a.key, b.key);
      }) : array;
    }
    nest.map = function(array, mapType) {
      return map(mapType, array, 0);
    };
    nest.entries = function(array) {
      return entries(map(d3.map, array, 0), 0);
    };
    nest.key = function(d) {
      keys.push(d);
      return nest;
    };
    nest.sortKeys = function(order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    };
    nest.sortValues = function(order) {
      sortValues = order;
      return nest;
    };
    nest.rollup = function(f) {
      rollup = f;
      return nest;
    };
    return nest;
  };
  d3.set = function(array) {
    var set = new d3_Set();
    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
    return set;
  };
  function d3_Set() {
    this._ = Object.create(null);
  }
  d3_class(d3_Set, {
    has: d3_map_has,
    add: function(key) {
      this._[d3_map_escape(key += "")] = true;
      return key;
    },
    remove: d3_map_remove,
    values: d3_map_keys,
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this._) f.call(this, d3_map_unescape(key));
    }
  });
  d3.behavior = {};
  function d3_identity(d) {
    return d;
  }
  d3.rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }
  function d3_vendorSymbol(object, name) {
    if (name in object) return name;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
      var prefixName = d3_vendorPrefixes[i] + name;
      if (prefixName in object) return prefixName;
    }
  }
  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
  function d3_noop() {}
  d3.dispatch = function() {
    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    return dispatch;
  };
  function d3_dispatch() {}
  d3_dispatch.prototype.on = function(type, listener) {
    var i = type.indexOf("."), name = "";
    if (i >= 0) {
      name = type.slice(i + 1);
      type = type.slice(0, i);
    }
    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
    if (arguments.length === 2) {
      if (listener == null) for (type in this) {
        if (this.hasOwnProperty(type)) this[type].on(name, null);
      }
      return this;
    }
  };
  function d3_dispatch_event(dispatch) {
    var listeners = [], listenerByName = new d3_Map();
    function event() {
      var z = listeners, i = -1, n = z.length, l;
      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
      return dispatch;
    }
    event.on = function(name, listener) {
      var l = listenerByName.get(name), i;
      if (arguments.length < 2) return l && l.on;
      if (l) {
        l.on = null;
        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
        listenerByName.remove(name);
      }
      if (listener) listeners.push(listenerByName.set(name, {
        on: listener
      }));
      return dispatch;
    };
    return event;
  }
  d3.event = null;
  function d3_eventPreventDefault() {
    d3.event.preventDefault();
  }
  function d3_eventSource() {
    var e = d3.event, s;
    while (s = e.sourceEvent) e = s;
    return e;
  }
  function d3_eventDispatch(target) {
    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    dispatch.of = function(thiz, argumentz) {
      return function(e1) {
        try {
          var e0 = e1.sourceEvent = d3.event;
          e1.target = target;
          d3.event = e1;
          dispatch[e1.type].apply(thiz, argumentz);
        } finally {
          d3.event = e0;
        }
      };
    };
    return dispatch;
  }
  d3.requote = function(s) {
    return s.replace(d3_requote_re, "\\$&");
  };
  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  var d3_subclass = {}.__proto__ ? function(object, prototype) {
    object.__proto__ = prototype;
  } : function(object, prototype) {
    for (var property in prototype) object[property] = prototype[property];
  };
  function d3_selection(groups) {
    d3_subclass(groups, d3_selectionPrototype);
    return groups;
  }
  var d3_select = function(s, n) {
    return n.querySelector(s);
  }, d3_selectAll = function(s, n) {
    return n.querySelectorAll(s);
  }, d3_selectMatches = function(n, s) {
    var d3_selectMatcher = n.matches || n[d3_vendorSymbol(n, "matchesSelector")];
    d3_selectMatches = function(n, s) {
      return d3_selectMatcher.call(n, s);
    };
    return d3_selectMatches(n, s);
  };
  if (typeof Sizzle === "function") {
    d3_select = function(s, n) {
      return Sizzle(s, n)[0] || null;
    };
    d3_selectAll = Sizzle;
    d3_selectMatches = Sizzle.matchesSelector;
  }
  d3.selection = function() {
    return d3.select(d3_document.documentElement);
  };
  var d3_selectionPrototype = d3.selection.prototype = [];
  d3_selectionPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, group, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selector(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_select(selector, this);
    };
  }
  d3_selectionPrototype.selectAll = function(selector) {
    var subgroups = [], subgroup, node;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
          subgroup.parentNode = node;
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selectorAll(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_selectAll(selector, this);
    };
  }
  var d3_nsPrefix = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  d3.ns = {
    prefix: d3_nsPrefix,
    qualify: function(name) {
      var i = name.indexOf(":"), prefix = name;
      if (i >= 0) {
        prefix = name.slice(0, i);
        name = name.slice(i + 1);
      }
      return d3_nsPrefix.hasOwnProperty(prefix) ? {
        space: d3_nsPrefix[prefix],
        local: name
      } : name;
    }
  };
  d3_selectionPrototype.attr = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node();
        name = d3.ns.qualify(name);
        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
      }
      for (value in name) this.each(d3_selection_attr(value, name[value]));
      return this;
    }
    return this.each(d3_selection_attr(name, value));
  };
  function d3_selection_attr(name, value) {
    name = d3.ns.qualify(name);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrConstant() {
      this.setAttribute(name, value);
    }
    function attrConstantNS() {
      this.setAttributeNS(name.space, name.local, value);
    }
    function attrFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
    }
    function attrFunctionNS() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
    }
    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
  }
  function d3_collapse(s) {
    return s.trim().replace(/\s+/g, " ");
  }
  d3_selectionPrototype.classed = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
        if (value = node.classList) {
          while (++i < n) if (!value.contains(name[i])) return false;
        } else {
          value = node.getAttribute("class");
          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
        }
        return true;
      }
      for (value in name) this.each(d3_selection_classed(value, name[value]));
      return this;
    }
    return this.each(d3_selection_classed(name, value));
  };
  function d3_selection_classedRe(name) {
    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
  }
  function d3_selection_classes(name) {
    return (name + "").trim().split(/^|\s+/);
  }
  function d3_selection_classed(name, value) {
    name = d3_selection_classes(name).map(d3_selection_classedName);
    var n = name.length;
    function classedConstant() {
      var i = -1;
      while (++i < n) name[i](this, value);
    }
    function classedFunction() {
      var i = -1, x = value.apply(this, arguments);
      while (++i < n) name[i](this, x);
    }
    return typeof value === "function" ? classedFunction : classedConstant;
  }
  function d3_selection_classedName(name) {
    var re = d3_selection_classedRe(name);
    return function(node, value) {
      if (c = node.classList) return value ? c.add(name) : c.remove(name);
      var c = node.getAttribute("class") || "";
      if (value) {
        re.lastIndex = 0;
        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
      } else {
        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
      }
    };
  }
  d3_selectionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
        return this;
      }
      if (n < 2) {
        var node = this.node();
        return d3_window(node).getComputedStyle(node, null).getPropertyValue(name);
      }
      priority = "";
    }
    return this.each(d3_selection_style(name, value, priority));
  };
  function d3_selection_style(name, value, priority) {
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleConstant() {
      this.style.setProperty(name, value, priority);
    }
    function styleFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
    }
    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
  }
  d3_selectionPrototype.property = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") return this.node()[name];
      for (value in name) this.each(d3_selection_property(value, name[value]));
      return this;
    }
    return this.each(d3_selection_property(name, value));
  };
  function d3_selection_property(name, value) {
    function propertyNull() {
      delete this[name];
    }
    function propertyConstant() {
      this[name] = value;
    }
    function propertyFunction() {
      var x = value.apply(this, arguments);
      if (x == null) delete this[name]; else this[name] = x;
    }
    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
  }
  d3_selectionPrototype.text = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    } : value == null ? function() {
      this.textContent = "";
    } : function() {
      this.textContent = value;
    }) : this.node().textContent;
  };
  d3_selectionPrototype.html = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    } : value == null ? function() {
      this.innerHTML = "";
    } : function() {
      this.innerHTML = value;
    }) : this.node().innerHTML;
  };
  d3_selectionPrototype.append = function(name) {
    name = d3_selection_creator(name);
    return this.select(function() {
      return this.appendChild(name.apply(this, arguments));
    });
  };
  function d3_selection_creator(name) {
    function create() {
      var document = this.ownerDocument, namespace = this.namespaceURI;
      return namespace ? document.createElementNS(namespace, name) : document.createElement(name);
    }
    function createNS() {
      return this.ownerDocument.createElementNS(name.space, name.local);
    }
    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? createNS : create;
  }
  d3_selectionPrototype.insert = function(name, before) {
    name = d3_selection_creator(name);
    before = d3_selection_selector(before);
    return this.select(function() {
      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
    });
  };
  d3_selectionPrototype.remove = function() {
    return this.each(d3_selectionRemove);
  };
  function d3_selectionRemove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  d3_selectionPrototype.data = function(value, key) {
    var i = -1, n = this.length, group, node;
    if (!arguments.length) {
      value = new Array(n = (group = this[0]).length);
      while (++i < n) {
        if (node = group[i]) {
          value[i] = node.__data__;
        }
      }
      return value;
    }
    function bind(group, groupData) {
      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
      if (key) {
        var nodeByKeyValue = new d3_Map(), keyValues = new Array(n), keyValue;
        for (i = -1; ++i < n; ) {
          if (nodeByKeyValue.has(keyValue = key.call(node = group[i], node.__data__, i))) {
            exitNodes[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
          keyValues[i] = keyValue;
        }
        for (i = -1; ++i < m; ) {
          if (!(node = nodeByKeyValue.get(keyValue = key.call(groupData, nodeData = groupData[i], i)))) {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          } else if (node !== true) {
            updateNodes[i] = node;
            node.__data__ = nodeData;
          }
          nodeByKeyValue.set(keyValue, true);
        }
        for (i = -1; ++i < n; ) {
          if (nodeByKeyValue.get(keyValues[i]) !== true) {
            exitNodes[i] = group[i];
          }
        }
      } else {
        for (i = -1; ++i < n0; ) {
          node = group[i];
          nodeData = groupData[i];
          if (node) {
            node.__data__ = nodeData;
            updateNodes[i] = node;
          } else {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
        }
        for (;i < m; ++i) {
          enterNodes[i] = d3_selection_dataNode(groupData[i]);
        }
        for (;i < n; ++i) {
          exitNodes[i] = group[i];
        }
      }
      enterNodes.update = updateNodes;
      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
      enter.push(enterNodes);
      update.push(updateNodes);
      exit.push(exitNodes);
    }
    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
    if (typeof value === "function") {
      while (++i < n) {
        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
      }
    } else {
      while (++i < n) {
        bind(group = this[i], value);
      }
    }
    update.enter = function() {
      return enter;
    };
    update.exit = function() {
      return exit;
    };
    return update;
  };
  function d3_selection_dataNode(data) {
    return {
      __data__: data
    };
  }
  d3_selectionPrototype.datum = function(value) {
    return arguments.length ? this.property("__data__", value) : this.property("__data__");
  };
  d3_selectionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_filter(selector) {
    return function() {
      return d3_selectMatches(this, selector);
    };
  }
  d3_selectionPrototype.order = function() {
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  };
  d3_selectionPrototype.sort = function(comparator) {
    comparator = d3_selection_sortComparator.apply(this, arguments);
    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
    return this.order();
  };
  function d3_selection_sortComparator(comparator) {
    if (!arguments.length) comparator = d3_ascending;
    return function(a, b) {
      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
    };
  }
  d3_selectionPrototype.each = function(callback) {
    return d3_selection_each(this, function(node, i, j) {
      callback.call(node, node.__data__, i, j);
    });
  };
  function d3_selection_each(groups, callback) {
    for (var j = 0, m = groups.length; j < m; j++) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
        if (node = group[i]) callback(node, i, j);
      }
    }
    return groups;
  }
  d3_selectionPrototype.call = function(callback) {
    var args = d3_array(arguments);
    callback.apply(args[0] = this, args);
    return this;
  };
  d3_selectionPrototype.empty = function() {
    return !this.node();
  };
  d3_selectionPrototype.node = function() {
    for (var j = 0, m = this.length; j < m; j++) {
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  };
  d3_selectionPrototype.size = function() {
    var n = 0;
    d3_selection_each(this, function() {
      ++n;
    });
    return n;
  };
  function d3_selection_enter(selection) {
    d3_subclass(selection, d3_selection_enterPrototype);
    return selection;
  }
  var d3_selection_enterPrototype = [];
  d3.selection.enter = d3_selection_enter;
  d3.selection.enter.prototype = d3_selection_enterPrototype;
  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
  d3_selection_enterPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, upgroup, group, node;
    for (var j = -1, m = this.length; ++j < m; ) {
      upgroup = (group = this[j]).update;
      subgroups.push(subgroup = []);
      subgroup.parentNode = group.parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
          subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  d3_selection_enterPrototype.insert = function(name, before) {
    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
    return d3_selectionPrototype.insert.call(this, name, before);
  };
  function d3_selection_enterInsertBefore(enter) {
    var i0, j0;
    return function(d, i, j) {
      var group = enter[j].update, n = group.length, node;
      if (j != j0) j0 = j, i0 = 0;
      if (i >= i0) i0 = i + 1;
      while (!(node = group[i0]) && ++i0 < n) ;
      return node;
    };
  }
  d3.select = function(node) {
    var group;
    if (typeof node === "string") {
      group = [ d3_select(node, d3_document) ];
      group.parentNode = d3_document.documentElement;
    } else {
      group = [ node ];
      group.parentNode = d3_documentElement(node);
    }
    return d3_selection([ group ]);
  };
  d3.selectAll = function(nodes) {
    var group;
    if (typeof nodes === "string") {
      group = d3_array(d3_selectAll(nodes, d3_document));
      group.parentNode = d3_document.documentElement;
    } else {
      group = nodes;
      group.parentNode = null;
    }
    return d3_selection([ group ]);
  };
  d3_selectionPrototype.on = function(type, listener, capture) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof type !== "string") {
        if (n < 2) listener = false;
        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
        return this;
      }
      if (n < 2) return (n = this.node()["__on" + type]) && n._;
      capture = false;
    }
    return this.each(d3_selection_on(type, listener, capture));
  };
  function d3_selection_on(type, listener, capture) {
    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
    if (i > 0) type = type.slice(0, i);
    var filter = d3_selection_onFilters.get(type);
    if (filter) type = filter, wrap = d3_selection_onFilter;
    function onRemove() {
      var l = this[name];
      if (l) {
        this.removeEventListener(type, l, l.$);
        delete this[name];
      }
    }
    function onAdd() {
      var l = wrap(listener, d3_array(arguments));
      onRemove.call(this);
      this.addEventListener(type, this[name] = l, l.$ = capture);
      l._ = listener;
    }
    function removeAll() {
      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
      for (var name in this) {
        if (match = name.match(re)) {
          var l = this[name];
          this.removeEventListener(match[1], l, l.$);
          delete this[name];
        }
      }
    }
    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
  }
  var d3_selection_onFilters = d3.map({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  });
  if (d3_document) {
    d3_selection_onFilters.forEach(function(k) {
      if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
    });
  }
  function d3_selection_onListener(listener, argumentz) {
    return function(e) {
      var o = d3.event;
      d3.event = e;
      argumentz[0] = this.__data__;
      try {
        listener.apply(this, argumentz);
      } finally {
        d3.event = o;
      }
    };
  }
  function d3_selection_onFilter(listener, argumentz) {
    var l = d3_selection_onListener(listener, argumentz);
    return function(e) {
      var target = this, related = e.relatedTarget;
      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
        l.call(target, e);
      }
    };
  }
  var d3_event_dragSelect, d3_event_dragId = 0;
  function d3_event_dragSuppress(node) {
    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window(node)).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
    if (d3_event_dragSelect == null) {
      d3_event_dragSelect = "onselectstart" in node ? false : d3_vendorSymbol(node.style, "userSelect");
    }
    if (d3_event_dragSelect) {
      var style = d3_documentElement(node).style, select = style[d3_event_dragSelect];
      style[d3_event_dragSelect] = "none";
    }
    return function(suppressClick) {
      w.on(name, null);
      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
      if (suppressClick) {
        var off = function() {
          w.on(click, null);
        };
        w.on(click, function() {
          d3_eventPreventDefault();
          off();
        }, true);
        setTimeout(off, 0);
      }
    };
  }
  d3.mouse = function(container) {
    return d3_mousePoint(container, d3_eventSource());
  };
  var d3_mouse_bug44083 = this.navigator && /WebKit/.test(this.navigator.userAgent) ? -1 : 0;
  function d3_mousePoint(container, e) {
    if (e.changedTouches) e = e.changedTouches[0];
    var svg = container.ownerSVGElement || container;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      if (d3_mouse_bug44083 < 0) {
        var window = d3_window(container);
        if (window.scrollX || window.scrollY) {
          svg = d3.select("body").append("svg").style({
            position: "absolute",
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            border: "none"
          }, "important");
          var ctm = svg[0][0].getScreenCTM();
          d3_mouse_bug44083 = !(ctm.f || ctm.e);
          svg.remove();
        }
      }
      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
      point.y = e.clientY;
      point = point.matrixTransform(container.getScreenCTM().inverse());
      return [ point.x, point.y ];
    }
    var rect = container.getBoundingClientRect();
    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
  }
  d3.touch = function(container, touches, identifier) {
    if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
    if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return d3_mousePoint(container, touch);
      }
    }
  };
  d3.behavior.drag = function() {
    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, d3_window, "mousemove", "mouseup"), touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_identity, "touchmove", "touchend");
    function drag() {
      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
    }
    function dragstart(id, position, subject, move, end) {
      return function() {
        var that = this, target = d3.event.target, parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(), dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset, dragSubject = d3.select(subject(target)).on(move + dragName, moved).on(end + dragName, ended), dragRestore = d3_event_dragSuppress(target), position0 = position(parent, dragId);
        if (origin) {
          dragOffset = origin.apply(that, arguments);
          dragOffset = [ dragOffset.x - position0[0], dragOffset.y - position0[1] ];
        } else {
          dragOffset = [ 0, 0 ];
        }
        dispatch({
          type: "dragstart"
        });
        function moved() {
          var position1 = position(parent, dragId), dx, dy;
          if (!position1) return;
          dx = position1[0] - position0[0];
          dy = position1[1] - position0[1];
          dragged |= dx | dy;
          position0 = position1;
          dispatch({
            type: "drag",
            x: position1[0] + dragOffset[0],
            y: position1[1] + dragOffset[1],
            dx: dx,
            dy: dy
          });
        }
        function ended() {
          if (!position(parent, dragId)) return;
          dragSubject.on(move + dragName, null).on(end + dragName, null);
          dragRestore(dragged && d3.event.target === target);
          dispatch({
            type: "dragend"
          });
        }
      };
    }
    drag.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return drag;
    };
    return d3.rebind(drag, event, "on");
  };
  function d3_behavior_dragTouchId() {
    return d3.event.changedTouches[0].identifier;
  }
  d3.touches = function(container, touches) {
    if (arguments.length < 2) touches = d3_eventSource().touches;
    return touches ? d3_array(touches).map(function(touch) {
      var point = d3_mousePoint(container, touch);
      point.identifier = touch.identifier;
      return point;
    }) : [];
  };
  var ?? = 1e-6, ??2 = ?? * ??, ?? = Math.PI, ?? = 2 * ??, ???? = ?? - ??, half?? = ?? / 2, d3_radians = ?? / 180, d3_degrees = 180 / ??;
  function d3_sgn(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }
  function d3_cross2d(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }
  function d3_acos(x) {
    return x > 1 ? 0 : x < -1 ? ?? : Math.acos(x);
  }
  function d3_asin(x) {
    return x > 1 ? half?? : x < -1 ? -half?? : Math.asin(x);
  }
  function d3_sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }
  function d3_cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }
  function d3_tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }
  function d3_haversin(x) {
    return (x = Math.sin(x / 2)) * x;
  }
  var ?? = Math.SQRT2, ??2 = 2, ??4 = 4;
  d3.interpolateZoom = function(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
    var dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ??4 * d2) / (2 * w0 * ??2 * d1), b1 = (w1 * w1 - w0 * w0 - ??4 * d2) / (2 * w1 * ??2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), dr = r1 - r0, S = (dr || Math.log(w1 / w0)) / ??;
    function interpolate(t) {
      var s = t * S;
      if (dr) {
        var coshr0 = d3_cosh(r0), u = w0 / (??2 * d1) * (coshr0 * d3_tanh(?? * s + r0) - d3_sinh(r0));
        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(?? * s + r0) ];
      }
      return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(?? * s) ];
    }
    interpolate.duration = S * 1e3;
    return interpolate;
  };
  d3.behavior.zoom = function() {
    var view = {
      x: 0,
      y: 0,
      k: 1
    }, translate0, center0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, duration = 250, zooming = 0, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
    if (!d3_behavior_zoomWheel) {
      d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
      }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
        return d3.event.wheelDelta;
      }, "mousewheel") : (d3_behavior_zoomDelta = function() {
        return -d3.event.detail;
      }, "MozMousePixelScroll");
    }
    function zoom(g) {
      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
    }
    zoom.event = function(g) {
      g.each(function() {
        var dispatch = event.of(this, arguments), view1 = view;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.zoom", function() {
            view = this.__chart__ || {
              x: 0,
              y: 0,
              k: 1
            };
            zoomstarted(dispatch);
          }).tween("zoom:zoom", function() {
            var dx = size[0], dy = size[1], cx = center0 ? center0[0] : dx / 2, cy = center0 ? center0[1] : dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
            return function(t) {
              var l = i(t), k = dx / l[2];
              this.__chart__ = view = {
                x: cx - l[0] * k,
                y: cy - l[1] * k,
                k: k
              };
              zoomed(dispatch);
            };
          }).each("interrupt.zoom", function() {
            zoomended(dispatch);
          }).each("end.zoom", function() {
            zoomended(dispatch);
          });
        } else {
          this.__chart__ = view;
          zoomstarted(dispatch);
          zoomed(dispatch);
          zoomended(dispatch);
        }
      });
    };
    zoom.translate = function(_) {
      if (!arguments.length) return [ view.x, view.y ];
      view = {
        x: +_[0],
        y: +_[1],
        k: view.k
      };
      rescale();
      return zoom;
    };
    zoom.scale = function(_) {
      if (!arguments.length) return view.k;
      view = {
        x: view.x,
        y: view.y,
        k: +_
      };
      rescale();
      return zoom;
    };
    zoom.scaleExtent = function(_) {
      if (!arguments.length) return scaleExtent;
      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.center = function(_) {
      if (!arguments.length) return center;
      center = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.size = function(_) {
      if (!arguments.length) return size;
      size = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.duration = function(_) {
      if (!arguments.length) return duration;
      duration = +_;
      return zoom;
    };
    zoom.x = function(z) {
      if (!arguments.length) return x1;
      x1 = z;
      x0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    zoom.y = function(z) {
      if (!arguments.length) return y1;
      y1 = z;
      y0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    function location(p) {
      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
    }
    function point(l) {
      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
    }
    function scaleTo(s) {
      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
    }
    function translateTo(p, l) {
      l = point(l);
      view.x += p[0] - l[0];
      view.y += p[1] - l[1];
    }
    function zoomTo(that, p, l, k) {
      that.__chart__ = {
        x: view.x,
        y: view.y,
        k: view.k
      };
      scaleTo(Math.pow(2, k));
      translateTo(center0 = p, l);
      that = d3.select(that);
      if (duration > 0) that = that.transition().duration(duration);
      that.call(zoom.event);
    }
    function rescale() {
      if (x1) x1.domain(x0.range().map(function(x) {
        return (x - view.x) / view.k;
      }).map(x0.invert));
      if (y1) y1.domain(y0.range().map(function(y) {
        return (y - view.y) / view.k;
      }).map(y0.invert));
    }
    function zoomstarted(dispatch) {
      if (!zooming++) dispatch({
        type: "zoomstart"
      });
    }
    function zoomed(dispatch) {
      rescale();
      dispatch({
        type: "zoom",
        scale: view.k,
        translate: [ view.x, view.y ]
      });
    }
    function zoomended(dispatch) {
      if (!--zooming) dispatch({
        type: "zoomend"
      });
      center0 = null;
    }
    function mousedowned() {
      var that = this, target = d3.event.target, dispatch = event.of(that, arguments), dragged = 0, subject = d3.select(d3_window(that)).on(mousemove, moved).on(mouseup, ended), location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress(that);
      d3_selection_interrupt.call(that);
      zoomstarted(dispatch);
      function moved() {
        dragged = 1;
        translateTo(d3.mouse(that), location0);
        zoomed(dispatch);
      }
      function ended() {
        subject.on(mousemove, null).on(mouseup, null);
        dragRestore(dragged && d3.event.target === target);
        zoomended(dispatch);
      }
    }
    function touchstarted() {
      var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0, zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName, touchend = "touchend" + zoomName, targets = [], subject = d3.select(that), dragRestore = d3_event_dragSuppress(that);
      started();
      zoomstarted(dispatch);
      subject.on(mousedown, null).on(touchstart, started);
      function relocate() {
        var touches = d3.touches(that);
        scale0 = view.k;
        touches.forEach(function(t) {
          if (t.identifier in locations0) locations0[t.identifier] = location(t);
        });
        return touches;
      }
      function started() {
        var target = d3.event.target;
        d3.select(target).on(touchmove, moved).on(touchend, ended);
        targets.push(target);
        var changed = d3.event.changedTouches;
        for (var i = 0, n = changed.length; i < n; ++i) {
          locations0[changed[i].identifier] = null;
        }
        var touches = relocate(), now = Date.now();
        if (touches.length === 1) {
          if (now - touchtime < 500) {
            var p = touches[0];
            zoomTo(that, p, locations0[p.identifier], Math.floor(Math.log(view.k) / Math.LN2) + 1);
            d3_eventPreventDefault();
          }
          touchtime = now;
        } else if (touches.length > 1) {
          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
          distance0 = dx * dx + dy * dy;
        }
      }
      function moved() {
        var touches = d3.touches(that), p0, l0, p1, l1;
        d3_selection_interrupt.call(that);
        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
          p1 = touches[i];
          if (l1 = locations0[p1.identifier]) {
            if (l0) break;
            p0 = p1, l0 = l1;
          }
        }
        if (l1) {
          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
          scaleTo(scale1 * scale0);
        }
        touchtime = null;
        translateTo(p0, l0);
        zoomed(dispatch);
      }
      function ended() {
        if (d3.event.touches.length) {
          var changed = d3.event.changedTouches;
          for (var i = 0, n = changed.length; i < n; ++i) {
            delete locations0[changed[i].identifier];
          }
          for (var identifier in locations0) {
            return void relocate();
          }
        }
        d3.selectAll(targets).on(zoomName, null);
        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
        dragRestore();
        zoomended(dispatch);
      }
    }
    function mousewheeled() {
      var dispatch = event.of(this, arguments);
      if (mousewheelTimer) clearTimeout(mousewheelTimer); else translate0 = location(center0 = center || d3.mouse(this)), 
      d3_selection_interrupt.call(this), zoomstarted(dispatch);
      mousewheelTimer = setTimeout(function() {
        mousewheelTimer = null;
        zoomended(dispatch);
      }, 50);
      d3_eventPreventDefault();
      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
      translateTo(center0, translate0);
      zoomed(dispatch);
    }
    function dblclicked() {
      var p = d3.mouse(this), k = Math.log(view.k) / Math.LN2;
      zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
    }
    return d3.rebind(zoom, event, "on");
  };
  var d3_behavior_zoomInfinity = [ 0, Infinity ], d3_behavior_zoomDelta, d3_behavior_zoomWheel;
  d3.color = d3_color;
  function d3_color() {}
  d3_color.prototype.toString = function() {
    return this.rgb() + "";
  };
  d3.hsl = d3_hsl;
  function d3_hsl(h, s, l) {
    return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
  }
  var d3_hslPrototype = d3_hsl.prototype = new d3_color();
  d3_hslPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, this.l / k);
  };
  d3_hslPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, k * this.l);
  };
  d3_hslPrototype.rgb = function() {
    return d3_hsl_rgb(this.h, this.s, this.l);
  };
  function d3_hsl_rgb(h, s, l) {
    var m1, m2;
    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
    l = l < 0 ? 0 : l > 1 ? 1 : l;
    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
    m1 = 2 * l - m2;
    function v(h) {
      if (h > 360) h -= 360; else if (h < 0) h += 360;
      if (h < 60) return m1 + (m2 - m1) * h / 60;
      if (h < 180) return m2;
      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
      return m1;
    }
    function vv(h) {
      return Math.round(v(h) * 255);
    }
    return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
  }
  d3.hcl = d3_hcl;
  function d3_hcl(h, c, l) {
    return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
  }
  var d3_hclPrototype = d3_hcl.prototype = new d3_color();
  d3_hclPrototype.brighter = function(k) {
    return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.darker = function(k) {
    return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.rgb = function() {
    return d3_hcl_lab(this.h, this.c, this.l).rgb();
  };
  function d3_hcl_lab(h, c, l) {
    if (isNaN(h)) h = 0;
    if (isNaN(c)) c = 0;
    return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
  }
  d3.lab = d3_lab;
  function d3_lab(l, a, b) {
    return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.h, l.c, l.l) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
  }
  var d3_lab_K = 18;
  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
  var d3_labPrototype = d3_lab.prototype = new d3_color();
  d3_labPrototype.brighter = function(k) {
    return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.darker = function(k) {
    return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.rgb = function() {
    return d3_lab_rgb(this.l, this.a, this.b);
  };
  function d3_lab_rgb(l, a, b) {
    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
    x = d3_lab_xyz(x) * d3_lab_X;
    y = d3_lab_xyz(y) * d3_lab_Y;
    z = d3_lab_xyz(z) * d3_lab_Z;
    return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
  }
  function d3_lab_hcl(l, a, b) {
    return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
  }
  function d3_lab_xyz(x) {
    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }
  function d3_xyz_lab(x) {
    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }
  function d3_xyz_rgb(r) {
    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
  }
  d3.rgb = d3_rgb;
  function d3_rgb(r, g, b) {
    return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
  }
  function d3_rgbNumber(value) {
    return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
  }
  function d3_rgbString(value) {
    return d3_rgbNumber(value) + "";
  }
  var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
  d3_rgbPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    var r = this.r, g = this.g, b = this.b, i = 30;
    if (!r && !g && !b) return new d3_rgb(i, i, i);
    if (r && r < i) r = i;
    if (g && g < i) g = i;
    if (b && b < i) b = i;
    return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
  };
  d3_rgbPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_rgb(k * this.r, k * this.g, k * this.b);
  };
  d3_rgbPrototype.hsl = function() {
    return d3_rgb_hsl(this.r, this.g, this.b);
  };
  d3_rgbPrototype.toString = function() {
    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
  };
  function d3_rgb_hex(v) {
    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
  }
  function d3_rgb_parse(format, rgb, hsl) {
    var r = 0, g = 0, b = 0, m1, m2, color;
    m1 = /([a-z]+)\((.*)\)/i.exec(format);
    if (m1) {
      m2 = m1[2].split(",");
      switch (m1[1]) {
       case "hsl":
        {
          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
        }

       case "rgb":
        {
          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
        }
      }
    }
    if (color = d3_rgb_names.get(format.toLowerCase())) {
      return rgb(color.r, color.g, color.b);
    }
    if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.slice(1), 16))) {
      if (format.length === 4) {
        r = (color & 3840) >> 4;
        r = r >> 4 | r;
        g = color & 240;
        g = g >> 4 | g;
        b = color & 15;
        b = b << 4 | b;
      } else if (format.length === 7) {
        r = (color & 16711680) >> 16;
        g = (color & 65280) >> 8;
        b = color & 255;
      }
    }
    return rgb(r, g, b);
  }
  function d3_rgb_hsl(r, g, b) {
    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
    if (d) {
      s = l < .5 ? d / (max + min) : d / (2 - max - min);
      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60;
    } else {
      h = NaN;
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new d3_hsl(h, s, l);
  }
  function d3_rgb_lab(r, g, b) {
    r = d3_rgb_xyz(r);
    g = d3_rgb_xyz(g);
    b = d3_rgb_xyz(b);
    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
  }
  function d3_rgb_xyz(r) {
    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
  }
  function d3_rgb_parseNumber(c) {
    var f = parseFloat(c);
    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
  }
  var d3_rgb_names = d3.map({
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  });
  d3_rgb_names.forEach(function(key, value) {
    d3_rgb_names.set(key, d3_rgbNumber(value));
  });
  function d3_functor(v) {
    return typeof v === "function" ? v : function() {
      return v;
    };
  }
  d3.functor = d3_functor;
  d3.xhr = d3_xhrType(d3_identity);
  function d3_xhrType(response) {
    return function(url, mimeType, callback) {
      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
      mimeType = null;
      return d3_xhr(url, mimeType, response, callback);
    };
  }
  function d3_xhr(url, mimeType, response, callback) {
    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
    if (this.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
      request.readyState > 3 && respond();
    };
    function respond() {
      var status = request.status, result;
      if (!status && d3_xhrHasResponse(request) || status >= 200 && status < 300 || status === 304) {
        try {
          result = response.call(xhr, request);
        } catch (e) {
          dispatch.error.call(xhr, e);
          return;
        }
        dispatch.load.call(xhr, result);
      } else {
        dispatch.error.call(xhr, request);
      }
    }
    request.onprogress = function(event) {
      var o = d3.event;
      d3.event = event;
      try {
        dispatch.progress.call(xhr, request);
      } finally {
        d3.event = o;
      }
    };
    xhr.header = function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) return headers[name];
      if (value == null) delete headers[name]; else headers[name] = value + "";
      return xhr;
    };
    xhr.mimeType = function(value) {
      if (!arguments.length) return mimeType;
      mimeType = value == null ? null : value + "";
      return xhr;
    };
    xhr.responseType = function(value) {
      if (!arguments.length) return responseType;
      responseType = value;
      return xhr;
    };
    xhr.response = function(value) {
      response = value;
      return xhr;
    };
    [ "get", "post" ].forEach(function(method) {
      xhr[method] = function() {
        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
      };
    });
    xhr.send = function(method, data, callback) {
      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
      request.open(method, url, true);
      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
      if (responseType != null) request.responseType = responseType;
      if (callback != null) xhr.on("error", callback).on("load", function(request) {
        callback(null, request);
      });
      dispatch.beforesend.call(xhr, request);
      request.send(data == null ? null : data);
      return xhr;
    };
    xhr.abort = function() {
      request.abort();
      return xhr;
    };
    d3.rebind(xhr, dispatch, "on");
    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
  }
  function d3_xhr_fixCallback(callback) {
    return callback.length === 1 ? function(error, request) {
      callback(error == null ? request : null);
    } : callback;
  }
  function d3_xhrHasResponse(request) {
    var type = request.responseType;
    return type && type !== "text" ? request.response : request.responseText;
  }
  d3.dsv = function(delimiter, mimeType) {
    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
    function dsv(url, row, callback) {
      if (arguments.length < 3) callback = row, row = null;
      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
      xhr.row = function(_) {
        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
      };
      return xhr;
    }
    function response(request) {
      return dsv.parse(request.responseText);
    }
    function typedResponse(f) {
      return function(request) {
        return dsv.parse(request.responseText, f);
      };
    }
    dsv.parse = function(text, f) {
      var o;
      return dsv.parseRows(text, function(row, i) {
        if (o) return o(row, i - 1);
        var a = new Function("d", "return {" + row.map(function(name, i) {
          return JSON.stringify(name) + ": d[" + i + "]";
        }).join(",") + "}");
        o = f ? function(row, i) {
          return f(a(row), i);
        } : a;
      });
    };
    dsv.parseRows = function(text, f) {
      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
      function token() {
        if (I >= N) return EOF;
        if (eol) return eol = false, EOL;
        var j = I;
        if (text.charCodeAt(j) === 34) {
          var i = j;
          while (i++ < N) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) break;
              ++i;
            }
          }
          I = i + 2;
          var c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) ++I;
          } else if (c === 10) {
            eol = true;
          }
          return text.slice(j + 1, i).replace(/""/g, '"');
        }
        while (I < N) {
          var c = text.charCodeAt(I++), k = 1;
          if (c === 10) eol = true; else if (c === 13) {
            eol = true;
            if (text.charCodeAt(I) === 10) ++I, ++k;
          } else if (c !== delimiterCode) continue;
          return text.slice(j, I - k);
        }
        return text.slice(j);
      }
      while ((t = token()) !== EOF) {
        var a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && (a = f(a, n++)) == null) continue;
        rows.push(a);
      }
      return rows;
    };
    dsv.format = function(rows) {
      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
      var fieldSet = new d3_Set(), fields = [];
      rows.forEach(function(row) {
        for (var field in row) {
          if (!fieldSet.has(field)) {
            fields.push(fieldSet.add(field));
          }
        }
      });
      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
        return fields.map(function(field) {
          return formatValue(row[field]);
        }).join(delimiter);
      })).join("\n");
    };
    dsv.formatRows = function(rows) {
      return rows.map(formatRow).join("\n");
    };
    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }
    function formatValue(text) {
      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
    }
    return dsv;
  };
  d3.csv = d3.dsv(",", "text/csv");
  d3.tsv = d3.dsv("	", "text/tab-separated-values");
  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_active, d3_timer_frame = this[d3_vendorSymbol(this, "requestAnimationFrame")] || function(callback) {
    setTimeout(callback, 17);
  };
  d3.timer = function(callback, delay, then) {
    var n = arguments.length;
    if (n < 2) delay = 0;
    if (n < 3) then = Date.now();
    var time = then + delay, timer = {
      c: callback,
      t: time,
      f: false,
      n: null
    };
    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
    d3_timer_queueTail = timer;
    if (!d3_timer_interval) {
      d3_timer_timeout = clearTimeout(d3_timer_timeout);
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  };
  function d3_timer_step() {
    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
    if (delay > 24) {
      if (isFinite(delay)) {
        clearTimeout(d3_timer_timeout);
        d3_timer_timeout = setTimeout(d3_timer_step, delay);
      }
      d3_timer_interval = 0;
    } else {
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  }
  d3.timer.flush = function() {
    d3_timer_mark();
    d3_timer_sweep();
  };
  function d3_timer_mark() {
    var now = Date.now();
    d3_timer_active = d3_timer_queueHead;
    while (d3_timer_active) {
      if (now >= d3_timer_active.t) d3_timer_active.f = d3_timer_active.c(now - d3_timer_active.t);
      d3_timer_active = d3_timer_active.n;
    }
    return now;
  }
  function d3_timer_sweep() {
    var t0, t1 = d3_timer_queueHead, time = Infinity;
    while (t1) {
      if (t1.f) {
        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
      } else {
        if (t1.t < time) time = t1.t;
        t1 = (t0 = t1).n;
      }
    }
    d3_timer_queueTail = t0;
    return time;
  }
  function d3_format_precision(x, p) {
    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
  d3.round = function(x, n) {
    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
  };
  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "??", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
  d3.formatPrefix = function(value, precision) {
    var i = 0;
    if (value) {
      if (value < 0) value *= -1;
      if (precision) value = d3.round(value, d3_format_precision(value, precision));
      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
      i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
    }
    return d3_formatPrefixes[8 + i / 3];
  };
  function d3_formatPrefix(d, i) {
    var k = Math.pow(10, abs(8 - i) * 3);
    return {
      scale: i > 8 ? function(d) {
        return d / k;
      } : function(d) {
        return d * k;
      },
      symbol: d
    };
  }
  function d3_locale_numberFormat(locale) {
    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping && locale_thousands ? function(value, width) {
      var i = value.length, t = [], j = 0, g = locale_grouping[0], length = 0;
      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = locale_grouping[j = (j + 1) % locale_grouping.length];
      }
      return t.reverse().join(locale_thousands);
    } : d3_identity;
    return function(specifier) {
      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "-", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false, exponent = true;
      if (precision) precision = +precision.substring(1);
      if (zfill || fill === "0" && align === "=") {
        zfill = fill = "0";
        align = "=";
      }
      switch (type) {
       case "n":
        comma = true;
        type = "g";
        break;

       case "%":
        scale = 100;
        suffix = "%";
        type = "f";
        break;

       case "p":
        scale = 100;
        suffix = "%";
        type = "r";
        break;

       case "b":
       case "o":
       case "x":
       case "X":
        if (symbol === "#") prefix = "0" + type.toLowerCase();

       case "c":
        exponent = false;

       case "d":
        integer = true;
        precision = 0;
        break;

       case "s":
        scale = -1;
        type = "r";
        break;
      }
      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
      if (type == "r" && !precision) type = "g";
      if (precision != null) {
        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
      }
      type = d3_format_types.get(type) || d3_format_typeDefault;
      var zcomma = zfill && comma;
      return function(value) {
        var fullSuffix = suffix;
        if (integer && value % 1) return "";
        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign === "-" ? "" : sign;
        if (scale < 0) {
          var unit = d3.formatPrefix(value, precision);
          value = unit.scale(value);
          fullSuffix = unit.symbol + suffix;
        } else {
          value *= scale;
        }
        value = type(value, precision);
        var i = value.lastIndexOf("."), before, after;
        if (i < 0) {
          var j = exponent ? value.lastIndexOf("e") : -1;
          if (j < 0) before = value, after = ""; else before = value.substring(0, j), after = value.substring(j);
        } else {
          before = value.substring(0, i);
          after = locale_decimal + value.substring(i + 1);
        }
        if (!zfill && comma) before = formatGroup(before, Infinity);
        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
        if (zcomma) before = formatGroup(padding + before, padding.length ? width - after.length : Infinity);
        negative += prefix;
        value = before + after;
        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
      };
    };
  }
  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
  var d3_format_types = d3.map({
    b: function(x) {
      return x.toString(2);
    },
    c: function(x) {
      return String.fromCharCode(x);
    },
    o: function(x) {
      return x.toString(8);
    },
    x: function(x) {
      return x.toString(16);
    },
    X: function(x) {
      return x.toString(16).toUpperCase();
    },
    g: function(x, p) {
      return x.toPrecision(p);
    },
    e: function(x, p) {
      return x.toExponential(p);
    },
    f: function(x, p) {
      return x.toFixed(p);
    },
    r: function(x, p) {
      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
    }
  });
  function d3_format_typeDefault(x) {
    return x + "";
  }
  var d3_time = d3.time = {}, d3_date = Date;
  function d3_date_utc() {
    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
  }
  d3_date_utc.prototype = {
    getDate: function() {
      return this._.getUTCDate();
    },
    getDay: function() {
      return this._.getUTCDay();
    },
    getFullYear: function() {
      return this._.getUTCFullYear();
    },
    getHours: function() {
      return this._.getUTCHours();
    },
    getMilliseconds: function() {
      return this._.getUTCMilliseconds();
    },
    getMinutes: function() {
      return this._.getUTCMinutes();
    },
    getMonth: function() {
      return this._.getUTCMonth();
    },
    getSeconds: function() {
      return this._.getUTCSeconds();
    },
    getTime: function() {
      return this._.getTime();
    },
    getTimezoneOffset: function() {
      return 0;
    },
    valueOf: function() {
      return this._.valueOf();
    },
    setDate: function() {
      d3_time_prototype.setUTCDate.apply(this._, arguments);
    },
    setDay: function() {
      d3_time_prototype.setUTCDay.apply(this._, arguments);
    },
    setFullYear: function() {
      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
    },
    setHours: function() {
      d3_time_prototype.setUTCHours.apply(this._, arguments);
    },
    setMilliseconds: function() {
      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
    },
    setMinutes: function() {
      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
    },
    setMonth: function() {
      d3_time_prototype.setUTCMonth.apply(this._, arguments);
    },
    setSeconds: function() {
      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
    },
    setTime: function() {
      d3_time_prototype.setTime.apply(this._, arguments);
    }
  };
  var d3_time_prototype = Date.prototype;
  function d3_time_interval(local, step, number) {
    function round(date) {
      var d0 = local(date), d1 = offset(d0, 1);
      return date - d0 < d1 - date ? d0 : d1;
    }
    function ceil(date) {
      step(date = local(new d3_date(date - 1)), 1);
      return date;
    }
    function offset(date, k) {
      step(date = new d3_date(+date), k);
      return date;
    }
    function range(t0, t1, dt) {
      var time = ceil(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          if (!(number(time) % dt)) times.push(new Date(+time));
          step(time, 1);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time, 1);
      }
      return times;
    }
    function range_utc(t0, t1, dt) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = t0;
        return range(utc, t1, dt);
      } finally {
        d3_date = Date;
      }
    }
    local.floor = local;
    local.round = round;
    local.ceil = ceil;
    local.offset = offset;
    local.range = range;
    var utc = local.utc = d3_time_interval_utc(local);
    utc.floor = utc;
    utc.round = d3_time_interval_utc(round);
    utc.ceil = d3_time_interval_utc(ceil);
    utc.offset = d3_time_interval_utc(offset);
    utc.range = range_utc;
    return local;
  }
  function d3_time_interval_utc(method) {
    return function(date, k) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = date;
        return method(utc, k)._;
      } finally {
        d3_date = Date;
      }
    };
  }
  d3_time.year = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setMonth(0, 1);
    return date;
  }, function(date, offset) {
    date.setFullYear(date.getFullYear() + offset);
  }, function(date) {
    return date.getFullYear();
  });
  d3_time.years = d3_time.year.range;
  d3_time.years.utc = d3_time.year.utc.range;
  d3_time.day = d3_time_interval(function(date) {
    var day = new d3_date(2e3, 0);
    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
  }, function(date, offset) {
    date.setDate(date.getDate() + offset);
  }, function(date) {
    return date.getDate() - 1;
  });
  d3_time.days = d3_time.day.range;
  d3_time.days.utc = d3_time.day.utc.range;
  d3_time.dayOfYear = function(date) {
    var year = d3_time.year(date);
    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
  };
  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
    i = 7 - i;
    var interval = d3_time[day] = d3_time_interval(function(date) {
      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
      return date;
    }, function(date, offset) {
      date.setDate(date.getDate() + Math.floor(offset) * 7);
    }, function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
    });
    d3_time[day + "s"] = interval.range;
    d3_time[day + "s"].utc = interval.utc.range;
    d3_time[day + "OfYear"] = function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
    };
  });
  d3_time.week = d3_time.sunday;
  d3_time.weeks = d3_time.sunday.range;
  d3_time.weeks.utc = d3_time.sunday.utc.range;
  d3_time.weekOfYear = d3_time.sundayOfYear;
  function d3_locale_timeFormat(locale) {
    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
    function d3_time_format(template) {
      var n = template.length;
      function format(date) {
        var string = [], i = -1, j = 0, c, p, f;
        while (++i < n) {
          if (template.charCodeAt(i) === 37) {
            string.push(template.slice(j, i));
            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(template.slice(j, i));
        return string.join("");
      }
      format.parse = function(string) {
        var d = {
          y: 1900,
          m: 0,
          d: 1,
          H: 0,
          M: 0,
          S: 0,
          L: 0,
          Z: null
        }, i = d3_time_parse(d, template, string, 0);
        if (i != string.length) return null;
        if ("p" in d) d.H = d.H % 12 + d.p * 12;
        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("w" in d && ("W" in d || "U" in d)) {
          date.setFullYear(d.y, 0, 1);
          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
        } else date.setFullYear(d.y, d.m, d.d);
        date.setHours(d.H + (d.Z / 100 | 0), d.M + d.Z % 100, d.S, d.L);
        return localZ ? date._ : date;
      };
      format.toString = function() {
        return template;
      };
      return format;
    }
    function d3_time_parse(date, template, string, j) {
      var c, p, t, i = 0, n = template.length, m = string.length;
      while (i < n) {
        if (j >= m) return -1;
        c = template.charCodeAt(i++);
        if (c === 37) {
          t = template.charAt(i++);
          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
          if (!p || (j = p(date, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    d3_time_format.utc = function(template) {
      var local = d3_time_format(template);
      function format(date) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date();
          utc._ = date;
          return local(utc);
        } finally {
          d3_date = Date;
        }
      }
      format.parse = function(string) {
        try {
          d3_date = d3_date_utc;
          var date = local.parse(string);
          return date && date._;
        } finally {
          d3_date = Date;
        }
      };
      format.toString = local.toString;
      return format;
    };
    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
    locale_periods.forEach(function(p, i) {
      d3_time_periodLookup.set(p.toLowerCase(), i);
    });
    var d3_time_formats = {
      a: function(d) {
        return locale_shortDays[d.getDay()];
      },
      A: function(d) {
        return locale_days[d.getDay()];
      },
      b: function(d) {
        return locale_shortMonths[d.getMonth()];
      },
      B: function(d) {
        return locale_months[d.getMonth()];
      },
      c: d3_time_format(locale_dateTime),
      d: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      e: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      H: function(d, p) {
        return d3_time_formatPad(d.getHours(), p, 2);
      },
      I: function(d, p) {
        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
      },
      j: function(d, p) {
        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
      },
      L: function(d, p) {
        return d3_time_formatPad(d.getMilliseconds(), p, 3);
      },
      m: function(d, p) {
        return d3_time_formatPad(d.getMonth() + 1, p, 2);
      },
      M: function(d, p) {
        return d3_time_formatPad(d.getMinutes(), p, 2);
      },
      p: function(d) {
        return locale_periods[+(d.getHours() >= 12)];
      },
      S: function(d, p) {
        return d3_time_formatPad(d.getSeconds(), p, 2);
      },
      U: function(d, p) {
        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
      },
      w: function(d) {
        return d.getDay();
      },
      W: function(d, p) {
        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
      },
      x: d3_time_format(locale_date),
      X: d3_time_format(locale_time),
      y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
      },
      Y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
      },
      Z: d3_time_zone,
      "%": function() {
        return "%";
      }
    };
    var d3_time_parsers = {
      a: d3_time_parseWeekdayAbbrev,
      A: d3_time_parseWeekday,
      b: d3_time_parseMonthAbbrev,
      B: d3_time_parseMonth,
      c: d3_time_parseLocaleFull,
      d: d3_time_parseDay,
      e: d3_time_parseDay,
      H: d3_time_parseHour24,
      I: d3_time_parseHour24,
      j: d3_time_parseDayOfYear,
      L: d3_time_parseMilliseconds,
      m: d3_time_parseMonthNumber,
      M: d3_time_parseMinutes,
      p: d3_time_parseAmPm,
      S: d3_time_parseSeconds,
      U: d3_time_parseWeekNumberSunday,
      w: d3_time_parseWeekdayNumber,
      W: d3_time_parseWeekNumberMonday,
      x: d3_time_parseLocaleDate,
      X: d3_time_parseLocaleTime,
      y: d3_time_parseYear,
      Y: d3_time_parseFullYear,
      Z: d3_time_parseZone,
      "%": d3_time_parseLiteralPercent
    };
    function d3_time_parseWeekdayAbbrev(date, string, i) {
      d3_time_dayAbbrevRe.lastIndex = 0;
      var n = d3_time_dayAbbrevRe.exec(string.slice(i));
      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseWeekday(date, string, i) {
      d3_time_dayRe.lastIndex = 0;
      var n = d3_time_dayRe.exec(string.slice(i));
      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonthAbbrev(date, string, i) {
      d3_time_monthAbbrevRe.lastIndex = 0;
      var n = d3_time_monthAbbrevRe.exec(string.slice(i));
      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonth(date, string, i) {
      d3_time_monthRe.lastIndex = 0;
      var n = d3_time_monthRe.exec(string.slice(i));
      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseLocaleFull(date, string, i) {
      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
    }
    function d3_time_parseLocaleDate(date, string, i) {
      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
    }
    function d3_time_parseLocaleTime(date, string, i) {
      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
    }
    function d3_time_parseAmPm(date, string, i) {
      var n = d3_time_periodLookup.get(string.slice(i, i += 2).toLowerCase());
      return n == null ? -1 : (date.p = n, i);
    }
    return d3_time_format;
  }
  var d3_time_formatPads = {
    "-": "",
    _: " ",
    "0": "0"
  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
  function d3_time_formatPad(value, fill, width) {
    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function d3_time_formatRe(names) {
    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
  }
  function d3_time_formatLookup(names) {
    var map = new d3_Map(), i = -1, n = names.length;
    while (++i < n) map.set(names[i].toLowerCase(), i);
    return map;
  }
  function d3_time_parseWeekdayNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 1));
    return n ? (date.w = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberSunday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i));
    return n ? (date.U = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberMonday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i));
    return n ? (date.W = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseFullYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 4));
    return n ? (date.y = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
  }
  function d3_time_parseZone(date, string, i) {
    return /^[+-]\d{4}$/.test(string = string.slice(i, i + 5)) ? (date.Z = -string, 
    i + 5) : -1;
  }
  function d3_time_expandYear(d) {
    return d + (d > 68 ? 1900 : 2e3);
  }
  function d3_time_parseMonthNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
  }
  function d3_time_parseDay(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.d = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseDayOfYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
    return n ? (date.j = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseHour24(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.H = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMinutes(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.M = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseSeconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.S = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMilliseconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
    return n ? (date.L = +n[0], i + n[0].length) : -1;
  }
  function d3_time_zone(d) {
    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = abs(z) / 60 | 0, zm = abs(z) % 60;
    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
  }
  function d3_time_parseLiteralPercent(date, string, i) {
    d3_time_percentRe.lastIndex = 0;
    var n = d3_time_percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function d3_time_formatMulti(formats) {
    var n = formats.length, i = -1;
    while (++i < n) formats[i][0] = this(formats[i][0]);
    return function(date) {
      var i = 0, f = formats[i];
      while (!f[1](date)) f = formats[++i];
      return f[0](date);
    };
  }
  d3.locale = function(locale) {
    return {
      numberFormat: d3_locale_numberFormat(locale),
      timeFormat: d3_locale_timeFormat(locale)
    };
  };
  var d3_locale_enUS = d3.locale({
    decimal: ".",
    thousands: ",",
    grouping: [ 3 ],
    currency: [ "$", "" ],
    dateTime: "%a %b %e %X %Y",
    date: "%m/%d/%Y",
    time: "%H:%M:%S",
    periods: [ "AM", "PM" ],
    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
  });
  d3.format = d3_locale_enUS.numberFormat;
  d3.geo = {};
  function d3_adder() {}
  d3_adder.prototype = {
    s: 0,
    t: 0,
    add: function(y) {
      d3_adderSum(y, this.t, d3_adderTemp);
      d3_adderSum(d3_adderTemp.s, this.s, this);
      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
    },
    reset: function() {
      this.s = this.t = 0;
    },
    valueOf: function() {
      return this.s;
    }
  };
  var d3_adderTemp = new d3_adder();
  function d3_adderSum(a, b, o) {
    var x = o.s = a + b, bv = x - a, av = x - bv;
    o.t = a - av + (b - bv);
  }
  d3.geo.stream = function(object, listener) {
    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
      d3_geo_streamObjectType[object.type](object, listener);
    } else {
      d3_geo_streamGeometry(object, listener);
    }
  };
  function d3_geo_streamGeometry(geometry, listener) {
    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
      d3_geo_streamGeometryType[geometry.type](geometry, listener);
    }
  }
  var d3_geo_streamObjectType = {
    Feature: function(feature, listener) {
      d3_geo_streamGeometry(feature.geometry, listener);
    },
    FeatureCollection: function(object, listener) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
    }
  };
  var d3_geo_streamGeometryType = {
    Sphere: function(object, listener) {
      listener.sphere();
    },
    Point: function(object, listener) {
      object = object.coordinates;
      listener.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
    },
    LineString: function(object, listener) {
      d3_geo_streamLine(object.coordinates, listener, 0);
    },
    MultiLineString: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
    },
    Polygon: function(object, listener) {
      d3_geo_streamPolygon(object.coordinates, listener);
    },
    MultiPolygon: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
    },
    GeometryCollection: function(object, listener) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
    }
  };
  function d3_geo_streamLine(coordinates, listener, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    listener.lineStart();
    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
    listener.lineEnd();
  }
  function d3_geo_streamPolygon(coordinates, listener) {
    var i = -1, n = coordinates.length;
    listener.polygonStart();
    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
    listener.polygonEnd();
  }
  d3.geo.area = function(object) {
    d3_geo_areaSum = 0;
    d3.geo.stream(object, d3_geo_area);
    return d3_geo_areaSum;
  };
  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
  var d3_geo_area = {
    sphere: function() {
      d3_geo_areaSum += 4 * ??;
    },
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_areaRingSum.reset();
      d3_geo_area.lineStart = d3_geo_areaRingStart;
    },
    polygonEnd: function() {
      var area = 2 * d3_geo_areaRingSum;
      d3_geo_areaSum += area < 0 ? 4 * ?? + area : area;
      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
    }
  };
  function d3_geo_areaRingStart() {
    var ??00, ??00, ??0, cos??0, sin??0;
    d3_geo_area.point = function(??, ??) {
      d3_geo_area.point = nextPoint;
      ??0 = (??00 = ??) * d3_radians, cos??0 = Math.cos(?? = (??00 = ??) * d3_radians / 2 + ?? / 4), 
      sin??0 = Math.sin(??);
    };
    function nextPoint(??, ??) {
      ?? *= d3_radians;
      ?? = ?? * d3_radians / 2 + ?? / 4;
      var d?? = ?? - ??0, sd?? = d?? >= 0 ? 1 : -1, ad?? = sd?? * d??, cos?? = Math.cos(??), sin?? = Math.sin(??), k = sin??0 * sin??, u = cos??0 * cos?? + k * Math.cos(ad??), v = k * sd?? * Math.sin(ad??);
      d3_geo_areaRingSum.add(Math.atan2(v, u));
      ??0 = ??, cos??0 = cos??, sin??0 = sin??;
    }
    d3_geo_area.lineEnd = function() {
      nextPoint(??00, ??00);
    };
  }
  function d3_geo_cartesian(spherical) {
    var ?? = spherical[0], ?? = spherical[1], cos?? = Math.cos(??);
    return [ cos?? * Math.cos(??), cos?? * Math.sin(??), Math.sin(??) ];
  }
  function d3_geo_cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function d3_geo_cartesianCross(a, b) {
    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
  }
  function d3_geo_cartesianAdd(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
  }
  function d3_geo_cartesianScale(vector, k) {
    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
  }
  function d3_geo_cartesianNormalize(d) {
    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l;
    d[1] /= l;
    d[2] /= l;
  }
  function d3_geo_spherical(cartesian) {
    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
  }
  function d3_geo_sphericalEqual(a, b) {
    return abs(a[0] - b[0]) < ?? && abs(a[1] - b[1]) < ??;
  }
  d3.geo.bounds = function() {
    var ??0, ??0, ??1, ??1, ??_, ??__, ??__, p0, d??Sum, ranges, range;
    var bound = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        bound.point = ringPoint;
        bound.lineStart = ringStart;
        bound.lineEnd = ringEnd;
        d??Sum = 0;
        d3_geo_area.polygonStart();
      },
      polygonEnd: function() {
        d3_geo_area.polygonEnd();
        bound.point = point;
        bound.lineStart = lineStart;
        bound.lineEnd = lineEnd;
        if (d3_geo_areaRingSum < 0) ??0 = -(??1 = 180), ??0 = -(??1 = 90); else if (d??Sum > ??) ??1 = 90; else if (d??Sum < -??) ??0 = -90;
        range[0] = ??0, range[1] = ??1;
      }
    };
    function point(??, ??) {
      ranges.push(range = [ ??0 = ??, ??1 = ?? ]);
      if (?? < ??0) ??0 = ??;
      if (?? > ??1) ??1 = ??;
    }
    function linePoint(??, ??) {
      var p = d3_geo_cartesian([ ?? * d3_radians, ?? * d3_radians ]);
      if (p0) {
        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
        d3_geo_cartesianNormalize(inflection);
        inflection = d3_geo_spherical(inflection);
        var d?? = ?? - ??_, s = d?? > 0 ? 1 : -1, ??i = inflection[0] * d3_degrees * s, antimeridian = abs(d??) > 180;
        if (antimeridian ^ (s * ??_ < ??i && ??i < s * ??)) {
          var ??i = inflection[1] * d3_degrees;
          if (??i > ??1) ??1 = ??i;
        } else if (??i = (??i + 360) % 360 - 180, antimeridian ^ (s * ??_ < ??i && ??i < s * ??)) {
          var ??i = -inflection[1] * d3_degrees;
          if (??i < ??0) ??0 = ??i;
        } else {
          if (?? < ??0) ??0 = ??;
          if (?? > ??1) ??1 = ??;
        }
        if (antimeridian) {
          if (?? < ??_) {
            if (angle(??0, ??) > angle(??0, ??1)) ??1 = ??;
          } else {
            if (angle(??, ??1) > angle(??0, ??1)) ??0 = ??;
          }
        } else {
          if (??1 >= ??0) {
            if (?? < ??0) ??0 = ??;
            if (?? > ??1) ??1 = ??;
          } else {
            if (?? > ??_) {
              if (angle(??0, ??) > angle(??0, ??1)) ??1 = ??;
            } else {
              if (angle(??, ??1) > angle(??0, ??1)) ??0 = ??;
            }
          }
        }
      } else {
        point(??, ??);
      }
      p0 = p, ??_ = ??;
    }
    function lineStart() {
      bound.point = linePoint;
    }
    function lineEnd() {
      range[0] = ??0, range[1] = ??1;
      bound.point = point;
      p0 = null;
    }
    function ringPoint(??, ??) {
      if (p0) {
        var d?? = ?? - ??_;
        d??Sum += abs(d??) > 180 ? d?? + (d?? > 0 ? 360 : -360) : d??;
      } else ??__ = ??, ??__ = ??;
      d3_geo_area.point(??, ??);
      linePoint(??, ??);
    }
    function ringStart() {
      d3_geo_area.lineStart();
    }
    function ringEnd() {
      ringPoint(??__, ??__);
      d3_geo_area.lineEnd();
      if (abs(d??Sum) > ??) ??0 = -(??1 = 180);
      range[0] = ??0, range[1] = ??1;
      p0 = null;
    }
    function angle(??0, ??1) {
      return (??1 -= ??0) < 0 ? ??1 + 360 : ??1;
    }
    function compareRanges(a, b) {
      return a[0] - b[0];
    }
    function withinRange(x, range) {
      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
    }
    return function(feature) {
      ??1 = ??1 = -(??0 = ??0 = Infinity);
      ranges = [];
      d3.geo.stream(feature, bound);
      var n = ranges.length;
      if (n) {
        ranges.sort(compareRanges);
        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
          b = ranges[i];
          if (withinRange(b[0], a) || withinRange(b[1], a)) {
            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
          } else {
            merged.push(a = b);
          }
        }
        var best = -Infinity, d??;
        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
          b = merged[i];
          if ((d?? = angle(a[1], b[0])) > best) best = d??, ??0 = b[0], ??1 = a[1];
        }
      }
      ranges = range = null;
      return ??0 === Infinity || ??0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ ??0, ??0 ], [ ??1, ??1 ] ];
    };
  }();
  d3.geo.centroid = function(object) {
    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
    d3.geo.stream(object, d3_geo_centroid);
    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
    if (m < ??2) {
      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
      if (d3_geo_centroidW1 < ??) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
      m = x * x + y * y + z * z;
      if (m < ??2) return [ NaN, NaN ];
    }
    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
  };
  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
  var d3_geo_centroid = {
    sphere: d3_noop,
    point: d3_geo_centroidPoint,
    lineStart: d3_geo_centroidLineStart,
    lineEnd: d3_geo_centroidLineEnd,
    polygonStart: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
    }
  };
  function d3_geo_centroidPoint(??, ??) {
    ?? *= d3_radians;
    var cos?? = Math.cos(?? *= d3_radians);
    d3_geo_centroidPointXYZ(cos?? * Math.cos(??), cos?? * Math.sin(??), Math.sin(??));
  }
  function d3_geo_centroidPointXYZ(x, y, z) {
    ++d3_geo_centroidW0;
    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
  }
  function d3_geo_centroidLineStart() {
    var x0, y0, z0;
    d3_geo_centroid.point = function(??, ??) {
      ?? *= d3_radians;
      var cos?? = Math.cos(?? *= d3_radians);
      x0 = cos?? * Math.cos(??);
      y0 = cos?? * Math.sin(??);
      z0 = Math.sin(??);
      d3_geo_centroid.point = nextPoint;
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    function nextPoint(??, ??) {
      ?? *= d3_radians;
      var cos?? = Math.cos(?? *= d3_radians), x = cos?? * Math.cos(??), y = cos?? * Math.sin(??), z = Math.sin(??), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_centroidLineEnd() {
    d3_geo_centroid.point = d3_geo_centroidPoint;
  }
  function d3_geo_centroidRingStart() {
    var ??00, ??00, x0, y0, z0;
    d3_geo_centroid.point = function(??, ??) {
      ??00 = ??, ??00 = ??;
      d3_geo_centroid.point = nextPoint;
      ?? *= d3_radians;
      var cos?? = Math.cos(?? *= d3_radians);
      x0 = cos?? * Math.cos(??);
      y0 = cos?? * Math.sin(??);
      z0 = Math.sin(??);
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    d3_geo_centroid.lineEnd = function() {
      nextPoint(??00, ??00);
      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
      d3_geo_centroid.point = d3_geo_centroidPoint;
    };
    function nextPoint(??, ??) {
      ?? *= d3_radians;
      var cos?? = Math.cos(?? *= d3_radians), x = cos?? * Math.cos(??), y = cos?? * Math.sin(??), z = Math.sin(??), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
      d3_geo_centroidX2 += v * cx;
      d3_geo_centroidY2 += v * cy;
      d3_geo_centroidZ2 += v * cz;
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_compose(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }
  function d3_true() {
    return true;
  }
  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
    var subject = [], clip = [];
    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n];
      if (d3_geo_sphericalEqual(p0, p1)) {
        listener.lineStart();
        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
        listener.lineEnd();
        return;
      }
      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
      a.o = b;
      subject.push(a);
      clip.push(b);
      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
      a.o = b;
      subject.push(a);
      clip.push(b);
    });
    clip.sort(compare);
    d3_geo_clipPolygonLinkCircular(subject);
    d3_geo_clipPolygonLinkCircular(clip);
    if (!subject.length) return;
    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
      clip[i].e = entry = !entry;
    }
    var start = subject[0], points, point;
    while (1) {
      var current = start, isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      listener.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, listener);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, listener);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      listener.lineEnd();
    }
  }
  function d3_geo_clipPolygonLinkCircular(array) {
    if (!(n = array.length)) return;
    var n, i = 0, a = array[0], b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }
  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other;
    this.e = entry;
    this.v = false;
    this.n = this.p = null;
  }
  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
    return function(rotate, listener) {
      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = d3.merge(segments);
          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
          if (segments.length) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
          } else if (clipStartInside) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            interpolate(null, null, 1, listener);
            listener.lineEnd();
          }
          if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          listener.polygonStart();
          listener.lineStart();
          interpolate(null, null, 1, listener);
          listener.lineEnd();
          listener.polygonEnd();
        }
      };
      function point(??, ??) {
        var point = rotate(??, ??);
        if (pointVisible(?? = point[0], ?? = point[1])) listener.point(??, ??);
      }
      function pointLine(??, ??) {
        var point = rotate(??, ??);
        line.point(point[0], point[1]);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      var segments;
      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false, polygon, ring;
      function pointRing(??, ??) {
        ring.push([ ??, ?? ]);
        var point = rotate(??, ??);
        ringListener.point(point[0], point[1]);
      }
      function ringStart() {
        ringListener.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringListener.lineEnd();
        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
        ring.pop();
        polygon.push(ring);
        ring = null;
        if (!n) return;
        if (clean & 1) {
          segment = ringSegments[0];
          var n = segment.length - 1, i = -1, point;
          if (n > 0) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            while (++i < n) listener.point((point = segment[i])[0], point[1]);
            listener.lineEnd();
          }
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
      }
      return clip;
    };
  }
  function d3_geo_clipSegmentLength1(segment) {
    return segment.length > 1;
  }
  function d3_geo_clipBufferListener() {
    var lines = [], line;
    return {
      lineStart: function() {
        lines.push(line = []);
      },
      point: function(??, ??) {
        line.push([ ??, ?? ]);
      },
      lineEnd: d3_noop,
      buffer: function() {
        var buffer = lines;
        lines = [];
        line = null;
        return buffer;
      },
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      }
    };
  }
  function d3_geo_clipSort(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - half?? - ?? : half?? - a[1]) - ((b = b.x)[0] < 0 ? b[1] - half?? - ?? : half?? - b[1]);
  }
  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -??, -?? / 2 ]);
  function d3_geo_clipAntimeridianLine(listener) {
    var ??0 = NaN, ??0 = NaN, s??0 = NaN, clean;
    return {
      lineStart: function() {
        listener.lineStart();
        clean = 1;
      },
      point: function(??1, ??1) {
        var s??1 = ??1 > 0 ? ?? : -??, d?? = abs(??1 - ??0);
        if (abs(d?? - ??) < ??) {
          listener.point(??0, ??0 = (??0 + ??1) / 2 > 0 ? half?? : -half??);
          listener.point(s??0, ??0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(s??1, ??0);
          listener.point(??1, ??0);
          clean = 0;
        } else if (s??0 !== s??1 && d?? >= ??) {
          if (abs(??0 - s??0) < ??) ??0 -= s??0 * ??;
          if (abs(??1 - s??1) < ??) ??1 -= s??1 * ??;
          ??0 = d3_geo_clipAntimeridianIntersect(??0, ??0, ??1, ??1);
          listener.point(s??0, ??0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(s??1, ??0);
          clean = 0;
        }
        listener.point(??0 = ??1, ??0 = ??1);
        s??0 = s??1;
      },
      lineEnd: function() {
        listener.lineEnd();
        ??0 = ??0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function d3_geo_clipAntimeridianIntersect(??0, ??0, ??1, ??1) {
    var cos??0, cos??1, sin??0_??1 = Math.sin(??0 - ??1);
    return abs(sin??0_??1) > ?? ? Math.atan((Math.sin(??0) * (cos??1 = Math.cos(??1)) * Math.sin(??1) - Math.sin(??1) * (cos??0 = Math.cos(??0)) * Math.sin(??0)) / (cos??0 * cos??1 * sin??0_??1)) : (??0 + ??1) / 2;
  }
  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
    var ??;
    if (from == null) {
      ?? = direction * half??;
      listener.point(-??, ??);
      listener.point(0, ??);
      listener.point(??, ??);
      listener.point(??, 0);
      listener.point(??, -??);
      listener.point(0, -??);
      listener.point(-??, -??);
      listener.point(-??, 0);
      listener.point(-??, ??);
    } else if (abs(from[0] - to[0]) > ??) {
      var s = from[0] < to[0] ? ?? : -??;
      ?? = direction * s / 2;
      listener.point(-s, ??);
      listener.point(0, ??);
      listener.point(s, ??);
    } else {
      listener.point(to[0], to[1]);
    }
  }
  function d3_geo_pointInPolygon(point, polygon) {
    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
    d3_geo_areaRingSum.reset();
    for (var i = 0, n = polygon.length; i < n; ++i) {
      var ring = polygon[i], m = ring.length;
      if (!m) continue;
      var point0 = ring[0], ??0 = point0[0], ??0 = point0[1] / 2 + ?? / 4, sin??0 = Math.sin(??0), cos??0 = Math.cos(??0), j = 1;
      while (true) {
        if (j === m) j = 0;
        point = ring[j];
        var ?? = point[0], ?? = point[1] / 2 + ?? / 4, sin?? = Math.sin(??), cos?? = Math.cos(??), d?? = ?? - ??0, sd?? = d?? >= 0 ? 1 : -1, ad?? = sd?? * d??, antimeridian = ad?? > ??, k = sin??0 * sin??;
        d3_geo_areaRingSum.add(Math.atan2(k * sd?? * Math.sin(ad??), cos??0 * cos?? + k * Math.cos(ad??)));
        polarAngle += antimeridian ? d?? + sd?? * ?? : d??;
        if (antimeridian ^ ??0 >= meridian ^ ?? >= meridian) {
          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
          d3_geo_cartesianNormalize(arc);
          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
          d3_geo_cartesianNormalize(intersection);
          var ??arc = (antimeridian ^ d?? >= 0 ? -1 : 1) * d3_asin(intersection[2]);
          if (parallel > ??arc || parallel === ??arc && (arc[0] || arc[1])) {
            winding += antimeridian ^ d?? >= 0 ? 1 : -1;
          }
        }
        if (!j++) break;
        ??0 = ??, sin??0 = sin??, cos??0 = cos??, point0 = point;
      }
    }
    return (polarAngle < -?? || polarAngle < ?? && d3_geo_areaRingSum < 0) ^ winding & 1;
  }
  function d3_geo_clipCircle(radius) {
    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ??, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -??, radius - ?? ]);
    function visible(??, ??) {
      return Math.cos(??) * Math.cos(??) > cr;
    }
    function clipLine(listener) {
      var point0, c0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(??, ??) {
          var point1 = [ ??, ?? ], point2, v = visible(??, ??), c = smallRadius ? v ? 0 : code(??, ??) : v ? code(?? + (?? < 0 ? ?? : -??), ??) : 0;
          if (!point0 && (v00 = v0 = v)) listener.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
              point1[0] += ??;
              point1[1] += ??;
              v = visible(point1[0], point1[1]);
            }
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              listener.lineStart();
              point2 = intersect(point1, point0);
              listener.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              listener.point(point2[0], point2[1]);
              listener.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
              } else {
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
              }
            }
          }
          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
            listener.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) listener.lineEnd();
          point0 = null;
        },
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b, two) {
      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return !two && a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
      d3_geo_cartesianAdd(A, B);
      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
      if (t2 < 0) return;
      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
      d3_geo_cartesianAdd(q, A);
      q = d3_geo_spherical(q);
      if (!two) return q;
      var ??0 = a[0], ??1 = b[0], ??0 = a[1], ??1 = b[1], z;
      if (??1 < ??0) z = ??0, ??0 = ??1, ??1 = z;
      var ???? = ??1 - ??0, polar = abs(???? - ??) < ??, meridian = polar || ???? < ??;
      if (!polar && ??1 < ??0) z = ??0, ??0 = ??1, ??1 = z;
      if (meridian ? polar ? ??0 + ??1 > 0 ^ q[1] < (abs(q[0] - ??0) < ?? ? ??0 : ??1) : ??0 <= q[1] && q[1] <= ??1 : ???? > ?? ^ (??0 <= q[0] && q[0] <= ??1)) {
        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
        d3_geo_cartesianAdd(q1, A);
        return [ q, d3_geo_spherical(q1) ];
      }
    }
    function code(??, ??) {
      var r = smallRadius ? radius : ?? - radius, code = 0;
      if (?? < -r) code |= 1; else if (?? > r) code |= 2;
      if (?? < -r) code |= 4; else if (?? > r) code |= 8;
      return code;
    }
  }
  function d3_geom_clipLine(x0, y0, x1, y1) {
    return function(line) {
      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      if (t0 > 0) line.a = {
        x: ax + t0 * dx,
        y: ay + t0 * dy
      };
      if (t1 < 1) line.b = {
        x: ax + t1 * dx,
        y: ay + t1 * dy
      };
      return line;
    };
  }
  var d3_geo_clipExtentMAX = 1e9;
  d3.geo.clipExtent = function() {
    var x0, y0, x1, y1, stream, clip, clipExtent = {
      stream: function(output) {
        if (stream) stream.valid = false;
        stream = clip(output);
        stream.valid = true;
        return stream;
      },
      extent: function(_) {
        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
        if (stream) stream.valid = false, stream = null;
        return clipExtent;
      }
    };
    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
  };
  function d3_geo_clipExtent(x0, y0, x1, y1) {
    return function(listener) {
      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          listener = bufferListener;
          segments = [];
          polygon = [];
          clean = true;
        },
        polygonEnd: function() {
          listener = listener_;
          segments = d3.merge(segments);
          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
          if (inside || visible) {
            listener.polygonStart();
            if (inside) {
              listener.lineStart();
              interpolate(null, null, 1, listener);
              listener.lineEnd();
            }
            if (visible) {
              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
            }
            listener.polygonEnd();
          }
          segments = polygon = ring = null;
        }
      };
      function insidePolygon(p) {
        var wn = 0, n = polygon.length, y = p[1];
        for (var i = 0; i < n; ++i) {
          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
            b = v[j];
            if (a[1] <= y) {
              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
            } else {
              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
            }
            a = b;
          }
        }
        return wn !== 0;
      }
      function interpolate(from, to, direction, listener) {
        var a = 0, a1 = 0;
        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
          do {
            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          } while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          listener.point(to[0], to[1]);
        }
      }
      function pointVisible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }
      function point(x, y) {
        if (pointVisible(x, y)) listener.point(x, y);
      }
      var x__, y__, v__, x_, y_, v_, first, clean;
      function lineStart() {
        clip.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferListener.rejoin();
          segments.push(bufferListener.buffer());
        }
        clip.point = point;
        if (v_) listener.lineEnd();
      }
      function linePoint(x, y) {
        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
        var v = pointVisible(x, y);
        if (polygon) ring.push([ x, y ]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            listener.lineStart();
            listener.point(x, y);
          }
        } else {
          if (v && v_) listener.point(x, y); else {
            var l = {
              a: {
                x: x_,
                y: y_
              },
              b: {
                x: x,
                y: y
              }
            };
            if (clipLine(l)) {
              if (!v_) {
                listener.lineStart();
                listener.point(l.a.x, l.a.y);
              }
              listener.point(l.b.x, l.b.y);
              if (!v) listener.lineEnd();
              clean = false;
            } else if (v) {
              listener.lineStart();
              listener.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }
      return clip;
    };
    function corner(p, direction) {
      return abs(p[0] - x0) < ?? ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ?? ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ?? ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
    }
    function compare(a, b) {
      return comparePoints(a.x, b.x);
    }
    function comparePoints(a, b) {
      var ca = corner(a, 1), cb = corner(b, 1);
      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
    }
  }
  function d3_geo_conic(projectAt) {
    var ??0 = 0, ??1 = ?? / 3, m = d3_geo_projectionMutator(projectAt), p = m(??0, ??1);
    p.parallels = function(_) {
      if (!arguments.length) return [ ??0 / ?? * 180, ??1 / ?? * 180 ];
      return m(??0 = _[0] * ?? / 180, ??1 = _[1] * ?? / 180);
    };
    return p;
  }
  function d3_geo_conicEqualArea(??0, ??1) {
    var sin??0 = Math.sin(??0), n = (sin??0 + Math.sin(??1)) / 2, C = 1 + sin??0 * (2 * n - sin??0), ??0 = Math.sqrt(C) / n;
    function forward(??, ??) {
      var ?? = Math.sqrt(C - 2 * n * Math.sin(??)) / n;
      return [ ?? * Math.sin(?? *= n), ??0 - ?? * Math.cos(??) ];
    }
    forward.invert = function(x, y) {
      var ??0_y = ??0 - y;
      return [ Math.atan2(x, ??0_y) / n, d3_asin((C - (x * x + ??0_y * ??0_y) * n * n) / (2 * n)) ];
    };
    return forward;
  }
  (d3.geo.conicEqualArea = function() {
    return d3_geo_conic(d3_geo_conicEqualArea);
  }).raw = d3_geo_conicEqualArea;
  d3.geo.albers = function() {
    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
  };
  d3.geo.albersUsa = function() {
    var lower48 = d3.geo.albers();
    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
    var point, pointStream = {
      point: function(x, y) {
        point = [ x, y ];
      }
    }, lower48Point, alaskaPoint, hawaiiPoint;
    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      point = null;
      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
      return point;
    }
    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
    };
    albersUsa.stream = function(stream) {
      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
      return {
        point: function(x, y) {
          lower48Stream.point(x, y);
          alaskaStream.point(x, y);
          hawaiiStream.point(x, y);
        },
        sphere: function() {
          lower48Stream.sphere();
          alaskaStream.sphere();
          hawaiiStream.sphere();
        },
        lineStart: function() {
          lower48Stream.lineStart();
          alaskaStream.lineStart();
          hawaiiStream.lineStart();
        },
        lineEnd: function() {
          lower48Stream.lineEnd();
          alaskaStream.lineEnd();
          hawaiiStream.lineEnd();
        },
        polygonStart: function() {
          lower48Stream.polygonStart();
          alaskaStream.polygonStart();
          hawaiiStream.polygonStart();
        },
        polygonEnd: function() {
          lower48Stream.polygonEnd();
          alaskaStream.polygonEnd();
          hawaiiStream.polygonEnd();
        }
      };
    };
    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      return albersUsa;
    };
    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_);
      alaska.scale(_ * .35);
      hawaii.scale(_);
      return albersUsa.translate(lower48.translate());
    };
    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];
      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ??, y + .12 * k + ?? ], [ x - .214 * k - ??, y + .234 * k - ?? ] ]).stream(pointStream).point;
      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ??, y + .166 * k + ?? ], [ x - .115 * k - ??, y + .234 * k - ?? ] ]).stream(pointStream).point;
      return albersUsa;
    };
    return albersUsa.scale(1070);
  };
  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_pathAreaPolygon = 0;
      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
    }
  };
  function d3_geo_pathAreaRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathArea.point = function(x, y) {
      d3_geo_pathArea.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    function nextPoint(x, y) {
      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
      x0 = x, y0 = y;
    }
    d3_geo_pathArea.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
  var d3_geo_pathBounds = {
    point: d3_geo_pathBoundsPoint,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_pathBoundsPoint(x, y) {
    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
  }
  function d3_geo_pathBuffer() {
    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointCircle = d3_geo_pathBufferCircle(_);
        return stream;
      },
      result: function() {
        if (buffer.length) {
          var result = buffer.join("");
          buffer = [];
          return result;
        }
      }
    };
    function point(x, y) {
      buffer.push("M", x, ",", y, pointCircle);
    }
    function pointLineStart(x, y) {
      buffer.push("M", x, ",", y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      buffer.push("L", x, ",", y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      buffer.push("Z");
    }
    return stream;
  }
  function d3_geo_pathBufferCircle(radius) {
    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
  }
  var d3_geo_pathCentroid = {
    point: d3_geo_pathCentroidPoint,
    lineStart: d3_geo_pathCentroidLineStart,
    lineEnd: d3_geo_pathCentroidLineEnd,
    polygonStart: function() {
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
    }
  };
  function d3_geo_pathCentroidPoint(x, y) {
    d3_geo_centroidX0 += x;
    d3_geo_centroidY0 += y;
    ++d3_geo_centroidZ0;
  }
  function d3_geo_pathCentroidLineStart() {
    var x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
  }
  function d3_geo_pathCentroidLineEnd() {
    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
  }
  function d3_geo_pathCentroidRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      z = y0 * x - x0 * y;
      d3_geo_centroidX2 += z * (x0 + x);
      d3_geo_centroidY2 += z * (y0 + y);
      d3_geo_centroidZ2 += z * 3;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
    d3_geo_pathCentroid.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  function d3_geo_pathContext(context) {
    var pointRadius = 4.5;
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointRadius = _;
        return stream;
      },
      result: d3_noop
    };
    function point(x, y) {
      context.moveTo(x + pointRadius, y);
      context.arc(x, y, pointRadius, 0, ??);
    }
    function pointLineStart(x, y) {
      context.moveTo(x, y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      context.lineTo(x, y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      context.closePath();
    }
    return stream;
  }
  function d3_geo_resample(project) {
    var ??2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
    function resample(stream) {
      return (maxDepth ? resampleRecursive : resampleNone)(stream);
    }
    function resampleNone(stream) {
      return d3_geo_transformPoint(stream, function(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      });
    }
    function resampleRecursive(stream) {
      var ??00, ??00, x00, y00, a00, b00, c00, ??0, x0, y0, a0, b0, c0;
      var resample = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resample.lineStart = ringStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resample.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x0 = NaN;
        resample.point = linePoint;
        stream.lineStart();
      }
      function linePoint(??, ??) {
        var c = d3_geo_cartesian([ ??, ?? ]), p = project(??, ??);
        resampleLineTo(x0, y0, ??0, a0, b0, c0, x0 = p[0], y0 = p[1], ??0 = ??, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }
      function lineEnd() {
        resample.point = point;
        stream.lineEnd();
      }
      function ringStart() {
        lineStart();
        resample.point = ringPoint;
        resample.lineEnd = ringEnd;
      }
      function ringPoint(??, ??) {
        linePoint(??00 = ??, ??00 = ??), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resample.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x0, y0, ??0, a0, b0, c0, x00, y00, ??00, a00, b00, c00, maxDepth, stream);
        resample.lineEnd = lineEnd;
        lineEnd();
      }
      return resample;
    }
    function resampleLineTo(x0, y0, ??0, a0, b0, c0, x1, y1, ??1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
      if (d2 > 4 * ??2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), ??2 = Math.asin(c /= m), ??2 = abs(abs(c) - 1) < ?? || abs(??0 - ??1) < ?? ? (??0 + ??1) / 2 : Math.atan2(b, a), p = project(??2, ??2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > ??2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x0, y0, ??0, a0, b0, c0, x2, y2, ??2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, ??2, a, b, c, x1, y1, ??1, a1, b1, c1, depth, stream);
        }
      }
    }
    resample.precision = function(_) {
      if (!arguments.length) return Math.sqrt(??2);
      maxDepth = (??2 = _ * _) > 0 && 16;
      return resample;
    };
    return resample;
  }
  d3.geo.path = function() {
    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
        d3.geo.stream(object, cacheStream);
      }
      return contextStream.result();
    }
    path.area = function(object) {
      d3_geo_pathAreaSum = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathArea));
      return d3_geo_pathAreaSum;
    };
    path.centroid = function(object) {
      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
    };
    path.bounds = function(object) {
      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
    };
    path.projection = function(_) {
      if (!arguments.length) return projection;
      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
      return reset();
    };
    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return reset();
    };
    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };
    function reset() {
      cacheStream = null;
      return path;
    }
    return path.projection(d3.geo.albersUsa()).context(null);
  };
  function d3_geo_pathProjectStream(project) {
    var resample = d3_geo_resample(function(x, y) {
      return project([ x * d3_degrees, y * d3_degrees ]);
    });
    return function(stream) {
      return d3_geo_projectionRadians(resample(stream));
    };
  }
  d3.geo.transform = function(methods) {
    return {
      stream: function(stream) {
        var transform = new d3_geo_transform(stream);
        for (var k in methods) transform[k] = methods[k];
        return transform;
      }
    };
  };
  function d3_geo_transform(stream) {
    this.stream = stream;
  }
  d3_geo_transform.prototype = {
    point: function(x, y) {
      this.stream.point(x, y);
    },
    sphere: function() {
      this.stream.sphere();
    },
    lineStart: function() {
      this.stream.lineStart();
    },
    lineEnd: function() {
      this.stream.lineEnd();
    },
    polygonStart: function() {
      this.stream.polygonStart();
    },
    polygonEnd: function() {
      this.stream.polygonEnd();
    }
  };
  function d3_geo_transformPoint(stream, point) {
    return {
      point: point,
      sphere: function() {
        stream.sphere();
      },
      lineStart: function() {
        stream.lineStart();
      },
      lineEnd: function() {
        stream.lineEnd();
      },
      polygonStart: function() {
        stream.polygonStart();
      },
      polygonEnd: function() {
        stream.polygonEnd();
      }
    };
  }
  d3.geo.projection = d3_geo_projection;
  d3.geo.projectionMutator = d3_geo_projectionMutator;
  function d3_geo_projection(project) {
    return d3_geo_projectionMutator(function() {
      return project;
    })();
  }
  function d3_geo_projectionMutator(projectAt) {
    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
      x = project(x, y);
      return [ x[0] * k + ??x, ??y - x[1] * k ];
    }), k = 150, x = 480, y = 250, ?? = 0, ?? = 0, ???? = 0, ???? = 0, ???? = 0, ??x, ??y, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
    function projection(point) {
      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
      return [ point[0] * k + ??x, ??y - point[1] * k ];
    }
    function invert(point) {
      point = projectRotate.invert((point[0] - ??x) / k, (??y - point[1]) / k);
      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
    }
    projection.stream = function(output) {
      if (stream) stream.valid = false;
      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
      stream.valid = true;
      return stream;
    };
    projection.clipAngle = function(_) {
      if (!arguments.length) return clipAngle;
      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
      return invalidate();
    };
    projection.clipExtent = function(_) {
      if (!arguments.length) return clipExtent;
      clipExtent = _;
      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
      return invalidate();
    };
    projection.scale = function(_) {
      if (!arguments.length) return k;
      k = +_;
      return reset();
    };
    projection.translate = function(_) {
      if (!arguments.length) return [ x, y ];
      x = +_[0];
      y = +_[1];
      return reset();
    };
    projection.center = function(_) {
      if (!arguments.length) return [ ?? * d3_degrees, ?? * d3_degrees ];
      ?? = _[0] % 360 * d3_radians;
      ?? = _[1] % 360 * d3_radians;
      return reset();
    };
    projection.rotate = function(_) {
      if (!arguments.length) return [ ???? * d3_degrees, ???? * d3_degrees, ???? * d3_degrees ];
      ???? = _[0] % 360 * d3_radians;
      ???? = _[1] % 360 * d3_radians;
      ???? = _.length > 2 ? _[2] % 360 * d3_radians : 0;
      return reset();
    };
    d3.rebind(projection, projectResample, "precision");
    function reset() {
      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(????, ????, ????), project);
      var center = project(??, ??);
      ??x = x - center[0] * k;
      ??y = y + center[1] * k;
      return invalidate();
    }
    function invalidate() {
      if (stream) stream.valid = false, stream = null;
      return projection;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return reset();
    };
  }
  function d3_geo_projectionRadians(stream) {
    return d3_geo_transformPoint(stream, function(x, y) {
      stream.point(x * d3_radians, y * d3_radians);
    });
  }
  function d3_geo_equirectangular(??, ??) {
    return [ ??, ?? ];
  }
  (d3.geo.equirectangular = function() {
    return d3_geo_projection(d3_geo_equirectangular);
  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
  d3.geo.rotation = function(rotate) {
    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    }
    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    };
    return forward;
  };
  function d3_geo_identityRotation(??, ??) {
    return [ ?? > ?? ? ?? - ?? : ?? < -?? ? ?? + ?? : ??, ?? ];
  }
  d3_geo_identityRotation.invert = d3_geo_equirectangular;
  function d3_geo_rotation(????, ????, ????) {
    return ???? ? ???? || ???? ? d3_geo_compose(d3_geo_rotation??(????), d3_geo_rotation????(????, ????)) : d3_geo_rotation??(????) : ???? || ???? ? d3_geo_rotation????(????, ????) : d3_geo_identityRotation;
  }
  function d3_geo_forwardRotation??(????) {
    return function(??, ??) {
      return ?? += ????, [ ?? > ?? ? ?? - ?? : ?? < -?? ? ?? + ?? : ??, ?? ];
    };
  }
  function d3_geo_rotation??(????) {
    var rotation = d3_geo_forwardRotation??(????);
    rotation.invert = d3_geo_forwardRotation??(-????);
    return rotation;
  }
  function d3_geo_rotation????(????, ????) {
    var cos???? = Math.cos(????), sin???? = Math.sin(????), cos???? = Math.cos(????), sin???? = Math.sin(????);
    function rotation(??, ??) {
      var cos?? = Math.cos(??), x = Math.cos(??) * cos??, y = Math.sin(??) * cos??, z = Math.sin(??), k = z * cos???? + x * sin????;
      return [ Math.atan2(y * cos???? - k * sin????, x * cos???? - z * sin????), d3_asin(k * cos???? + y * sin????) ];
    }
    rotation.invert = function(??, ??) {
      var cos?? = Math.cos(??), x = Math.cos(??) * cos??, y = Math.sin(??) * cos??, z = Math.sin(??), k = z * cos???? - y * sin????;
      return [ Math.atan2(y * cos???? + z * sin????, x * cos???? + k * sin????), d3_asin(k * cos???? - x * sin????) ];
    };
    return rotation;
  }
  d3.geo.circle = function() {
    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
    function circle() {
      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
      interpolate(null, null, 1, {
        point: function(x, y) {
          ring.push(x = rotate(x, y));
          x[0] *= d3_degrees, x[1] *= d3_degrees;
        }
      });
      return {
        type: "Polygon",
        coordinates: [ ring ]
      };
    }
    circle.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return circle;
    };
    circle.angle = function(x) {
      if (!arguments.length) return angle;
      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
      return circle;
    };
    circle.precision = function(_) {
      if (!arguments.length) return precision;
      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
      return circle;
    };
    return circle.angle(90);
  };
  function d3_geo_circleInterpolate(radius, precision) {
    var cr = Math.cos(radius), sr = Math.sin(radius);
    return function(from, to, direction, listener) {
      var step = direction * precision;
      if (from != null) {
        from = d3_geo_circleAngle(cr, from);
        to = d3_geo_circleAngle(cr, to);
        if (direction > 0 ? from < to : from > to) from += direction * ??;
      } else {
        from = radius + direction * ??;
        to = radius - .5 * step;
      }
      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
      }
    };
  }
  function d3_geo_circleAngle(cr, point) {
    var a = d3_geo_cartesian(point);
    a[0] -= cr;
    d3_geo_cartesianNormalize(a);
    var angle = d3_acos(-a[1]);
    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ??) % (2 * Math.PI);
  }
  d3.geo.distance = function(a, b) {
    var ???? = (b[0] - a[0]) * d3_radians, ??0 = a[1] * d3_radians, ??1 = b[1] * d3_radians, sin???? = Math.sin(????), cos???? = Math.cos(????), sin??0 = Math.sin(??0), cos??0 = Math.cos(??0), sin??1 = Math.sin(??1), cos??1 = Math.cos(??1), t;
    return Math.atan2(Math.sqrt((t = cos??1 * sin????) * t + (t = cos??0 * sin??1 - sin??0 * cos??1 * cos????) * t), sin??0 * sin??1 + cos??0 * cos??1 * cos????);
  };
  d3.geo.graticule = function() {
    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
    function graticule() {
      return {
        type: "MultiLineString",
        coordinates: lines()
      };
    }
    function lines() {
      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
        return abs(x % DX) > ??;
      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
        return abs(y % DY) > ??;
      }).map(y));
    }
    graticule.lines = function() {
      return lines().map(function(coordinates) {
        return {
          type: "LineString",
          coordinates: coordinates
        };
      });
    };
    graticule.outline = function() {
      return {
        type: "Polygon",
        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
      };
    };
    graticule.extent = function(_) {
      if (!arguments.length) return graticule.minorExtent();
      return graticule.majorExtent(_).minorExtent(_);
    };
    graticule.majorExtent = function(_) {
      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
      X0 = +_[0][0], X1 = +_[1][0];
      Y0 = +_[0][1], Y1 = +_[1][1];
      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
      return graticule.precision(precision);
    };
    graticule.minorExtent = function(_) {
      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
      x0 = +_[0][0], x1 = +_[1][0];
      y0 = +_[0][1], y1 = +_[1][1];
      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
      return graticule.precision(precision);
    };
    graticule.step = function(_) {
      if (!arguments.length) return graticule.minorStep();
      return graticule.majorStep(_).minorStep(_);
    };
    graticule.majorStep = function(_) {
      if (!arguments.length) return [ DX, DY ];
      DX = +_[0], DY = +_[1];
      return graticule;
    };
    graticule.minorStep = function(_) {
      if (!arguments.length) return [ dx, dy ];
      dx = +_[0], dy = +_[1];
      return graticule;
    };
    graticule.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = d3_geo_graticuleX(y0, y1, 90);
      y = d3_geo_graticuleY(x0, x1, precision);
      X = d3_geo_graticuleX(Y0, Y1, 90);
      Y = d3_geo_graticuleY(X0, X1, precision);
      return graticule;
    };
    return graticule.majorExtent([ [ -180, -90 + ?? ], [ 180, 90 - ?? ] ]).minorExtent([ [ -180, -80 - ?? ], [ 180, 80 + ?? ] ]);
  };
  function d3_geo_graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - ??, dy).concat(y1);
    return function(x) {
      return y.map(function(y) {
        return [ x, y ];
      });
    };
  }
  function d3_geo_graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - ??, dx).concat(x1);
    return function(y) {
      return x.map(function(x) {
        return [ x, y ];
      });
    };
  }
  function d3_source(d) {
    return d.source;
  }
  function d3_target(d) {
    return d.target;
  }
  d3.geo.greatArc = function() {
    var source = d3_source, source_, target = d3_target, target_;
    function greatArc() {
      return {
        type: "LineString",
        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
      };
    }
    greatArc.distance = function() {
      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
    };
    greatArc.source = function(_) {
      if (!arguments.length) return source;
      source = _, source_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.target = function(_) {
      if (!arguments.length) return target;
      target = _, target_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.precision = function() {
      return arguments.length ? greatArc : 0;
    };
    return greatArc;
  };
  d3.geo.interpolate = function(source, target) {
    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
  };
  function d3_geo_interpolate(x0, y0, x1, y1) {
    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
    var interpolate = d ? function(t) {
      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
    } : function() {
      return [ x0 * d3_degrees, y0 * d3_degrees ];
    };
    interpolate.distance = d;
    return interpolate;
  }
  d3.geo.length = function(object) {
    d3_geo_lengthSum = 0;
    d3.geo.stream(object, d3_geo_length);
    return d3_geo_lengthSum;
  };
  var d3_geo_lengthSum;
  var d3_geo_length = {
    sphere: d3_noop,
    point: d3_noop,
    lineStart: d3_geo_lengthLineStart,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_lengthLineStart() {
    var ??0, sin??0, cos??0;
    d3_geo_length.point = function(??, ??) {
      ??0 = ?? * d3_radians, sin??0 = Math.sin(?? *= d3_radians), cos??0 = Math.cos(??);
      d3_geo_length.point = nextPoint;
    };
    d3_geo_length.lineEnd = function() {
      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
    };
    function nextPoint(??, ??) {
      var sin?? = Math.sin(?? *= d3_radians), cos?? = Math.cos(??), t = abs((?? *= d3_radians) - ??0), cos???? = Math.cos(t);
      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cos?? * Math.sin(t)) * t + (t = cos??0 * sin?? - sin??0 * cos?? * cos????) * t), sin??0 * sin?? + cos??0 * cos?? * cos????);
      ??0 = ??, sin??0 = sin??, cos??0 = cos??;
    }
  }
  function d3_geo_azimuthal(scale, angle) {
    function azimuthal(??, ??) {
      var cos?? = Math.cos(??), cos?? = Math.cos(??), k = scale(cos?? * cos??);
      return [ k * cos?? * Math.sin(??), k * Math.sin(??) ];
    }
    azimuthal.invert = function(x, y) {
      var ?? = Math.sqrt(x * x + y * y), c = angle(??), sinc = Math.sin(c), cosc = Math.cos(c);
      return [ Math.atan2(x * sinc, ?? * cosc), Math.asin(?? && y * sinc / ??) ];
    };
    return azimuthal;
  }
  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cos??cos??) {
    return Math.sqrt(2 / (1 + cos??cos??));
  }, function(??) {
    return 2 * Math.asin(?? / 2);
  });
  (d3.geo.azimuthalEqualArea = function() {
    return d3_geo_projection(d3_geo_azimuthalEqualArea);
  }).raw = d3_geo_azimuthalEqualArea;
  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cos??cos??) {
    var c = Math.acos(cos??cos??);
    return c && c / Math.sin(c);
  }, d3_identity);
  (d3.geo.azimuthalEquidistant = function() {
    return d3_geo_projection(d3_geo_azimuthalEquidistant);
  }).raw = d3_geo_azimuthalEquidistant;
  function d3_geo_conicConformal(??0, ??1) {
    var cos??0 = Math.cos(??0), t = function(??) {
      return Math.tan(?? / 4 + ?? / 2);
    }, n = ??0 === ??1 ? Math.sin(??0) : Math.log(cos??0 / Math.cos(??1)) / Math.log(t(??1) / t(??0)), F = cos??0 * Math.pow(t(??0), n) / n;
    if (!n) return d3_geo_mercator;
    function forward(??, ??) {
      if (F > 0) {
        if (?? < -half?? + ??) ?? = -half?? + ??;
      } else {
        if (?? > half?? - ??) ?? = half?? - ??;
      }
      var ?? = F / Math.pow(t(??), n);
      return [ ?? * Math.sin(n * ??), F - ?? * Math.cos(n * ??) ];
    }
    forward.invert = function(x, y) {
      var ??0_y = F - y, ?? = d3_sgn(n) * Math.sqrt(x * x + ??0_y * ??0_y);
      return [ Math.atan2(x, ??0_y) / n, 2 * Math.atan(Math.pow(F / ??, 1 / n)) - half?? ];
    };
    return forward;
  }
  (d3.geo.conicConformal = function() {
    return d3_geo_conic(d3_geo_conicConformal);
  }).raw = d3_geo_conicConformal;
  function d3_geo_conicEquidistant(??0, ??1) {
    var cos??0 = Math.cos(??0), n = ??0 === ??1 ? Math.sin(??0) : (cos??0 - Math.cos(??1)) / (??1 - ??0), G = cos??0 / n + ??0;
    if (abs(n) < ??) return d3_geo_equirectangular;
    function forward(??, ??) {
      var ?? = G - ??;
      return [ ?? * Math.sin(n * ??), G - ?? * Math.cos(n * ??) ];
    }
    forward.invert = function(x, y) {
      var ??0_y = G - y;
      return [ Math.atan2(x, ??0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ??0_y * ??0_y) ];
    };
    return forward;
  }
  (d3.geo.conicEquidistant = function() {
    return d3_geo_conic(d3_geo_conicEquidistant);
  }).raw = d3_geo_conicEquidistant;
  var d3_geo_gnomonic = d3_geo_azimuthal(function(cos??cos??) {
    return 1 / cos??cos??;
  }, Math.atan);
  (d3.geo.gnomonic = function() {
    return d3_geo_projection(d3_geo_gnomonic);
  }).raw = d3_geo_gnomonic;
  function d3_geo_mercator(??, ??) {
    return [ ??, Math.log(Math.tan(?? / 4 + ?? / 2)) ];
  }
  d3_geo_mercator.invert = function(x, y) {
    return [ x, 2 * Math.atan(Math.exp(y)) - half?? ];
  };
  function d3_geo_mercatorProjection(project) {
    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
    m.scale = function() {
      var v = scale.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.translate = function() {
      var v = translate.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.clipExtent = function(_) {
      var v = clipExtent.apply(m, arguments);
      if (v === m) {
        if (clipAuto = _ == null) {
          var k = ?? * scale(), t = translate();
          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
        }
      } else if (clipAuto) {
        v = null;
      }
      return v;
    };
    return m.clipExtent(null);
  }
  (d3.geo.mercator = function() {
    return d3_geo_mercatorProjection(d3_geo_mercator);
  }).raw = d3_geo_mercator;
  var d3_geo_orthographic = d3_geo_azimuthal(function() {
    return 1;
  }, Math.asin);
  (d3.geo.orthographic = function() {
    return d3_geo_projection(d3_geo_orthographic);
  }).raw = d3_geo_orthographic;
  var d3_geo_stereographic = d3_geo_azimuthal(function(cos??cos??) {
    return 1 / (1 + cos??cos??);
  }, function(??) {
    return 2 * Math.atan(??);
  });
  (d3.geo.stereographic = function() {
    return d3_geo_projection(d3_geo_stereographic);
  }).raw = d3_geo_stereographic;
  function d3_geo_transverseMercator(??, ??) {
    return [ Math.log(Math.tan(?? / 4 + ?? / 2)), -?? ];
  }
  d3_geo_transverseMercator.invert = function(x, y) {
    return [ -y, 2 * Math.atan(Math.exp(x)) - half?? ];
  };
  (d3.geo.transverseMercator = function() {
    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
    projection.center = function(_) {
      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ _[1], -_[0] ]);
    };
    projection.rotate = function(_) {
      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
      [ _[0], _[1], _[2] - 90 ]);
    };
    return rotate([ 0, 0, 90 ]);
  }).raw = d3_geo_transverseMercator;
  d3.geom = {};
  function d3_geom_pointX(d) {
    return d[0];
  }
  function d3_geom_pointY(d) {
    return d[1];
  }
  d3.geom.hull = function(vertices) {
    var x = d3_geom_pointX, y = d3_geom_pointY;
    if (arguments.length) return hull(vertices);
    function hull(data) {
      if (data.length < 3) return [];
      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
      for (i = 0; i < n; i++) {
        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
      }
      points.sort(d3_geom_hullOrder);
      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
      return polygon;
    }
    hull.x = function(_) {
      return arguments.length ? (x = _, hull) : x;
    };
    hull.y = function(_) {
      return arguments.length ? (y = _, hull) : y;
    };
    return hull;
  };
  function d3_geom_hullUpper(points) {
    var n = points.length, hull = [ 0, 1 ], hs = 2;
    for (var i = 2; i < n; i++) {
      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
      hull[hs++] = i;
    }
    return hull.slice(0, hs);
  }
  function d3_geom_hullOrder(a, b) {
    return a[0] - b[0] || a[1] - b[1];
  }
  d3.geom.polygon = function(coordinates) {
    d3_subclass(coordinates, d3_geom_polygonPrototype);
    return coordinates;
  };
  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
  d3_geom_polygonPrototype.area = function() {
    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
    while (++i < n) {
      a = b;
      b = this[i];
      area += a[1] * b[0] - a[0] * b[1];
    }
    return area * .5;
  };
  d3_geom_polygonPrototype.centroid = function(k) {
    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
    if (!arguments.length) k = -1 / (6 * this.area());
    while (++i < n) {
      a = b;
      b = this[i];
      c = a[0] * b[1] - b[0] * a[1];
      x += (a[0] + b[0]) * c;
      y += (a[1] + b[1]) * c;
    }
    return [ x * k, y * k ];
  };
  d3_geom_polygonPrototype.clip = function(subject) {
    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
    while (++i < n) {
      input = subject.slice();
      subject.length = 0;
      b = this[i];
      c = input[(m = input.length - closed) - 1];
      j = -1;
      while (++j < m) {
        d = input[j];
        if (d3_geom_polygonInside(d, a, b)) {
          if (!d3_geom_polygonInside(c, a, b)) {
            subject.push(d3_geom_polygonIntersect(c, d, a, b));
          }
          subject.push(d);
        } else if (d3_geom_polygonInside(c, a, b)) {
          subject.push(d3_geom_polygonIntersect(c, d, a, b));
        }
        c = d;
      }
      if (closed) subject.push(subject[0]);
      a = b;
    }
    return subject;
  };
  function d3_geom_polygonInside(p, a, b) {
    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
  }
  function d3_geom_polygonIntersect(c, d, a, b) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [ x1 + ua * x21, y1 + ua * y21 ];
  }
  function d3_geom_polygonClosed(coordinates) {
    var a = coordinates[0], b = coordinates[coordinates.length - 1];
    return !(a[0] - b[0] || a[1] - b[1]);
  }
  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
  function d3_geom_voronoiBeach() {
    d3_geom_voronoiRedBlackNode(this);
    this.edge = this.site = this.circle = null;
  }
  function d3_geom_voronoiCreateBeach(site) {
    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
    beach.site = site;
    return beach;
  }
  function d3_geom_voronoiDetachBeach(beach) {
    d3_geom_voronoiDetachCircle(beach);
    d3_geom_voronoiBeaches.remove(beach);
    d3_geom_voronoiBeachPool.push(beach);
    d3_geom_voronoiRedBlackNode(beach);
  }
  function d3_geom_voronoiRemoveBeach(beach) {
    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
      x: x,
      y: y
    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
    d3_geom_voronoiDetachBeach(beach);
    var lArc = previous;
    while (lArc.circle && abs(x - lArc.circle.x) < ?? && abs(y - lArc.circle.cy) < ??) {
      previous = lArc.P;
      disappearing.unshift(lArc);
      d3_geom_voronoiDetachBeach(lArc);
      lArc = previous;
    }
    disappearing.unshift(lArc);
    d3_geom_voronoiDetachCircle(lArc);
    var rArc = next;
    while (rArc.circle && abs(x - rArc.circle.x) < ?? && abs(y - rArc.circle.cy) < ??) {
      next = rArc.N;
      disappearing.push(rArc);
      d3_geom_voronoiDetachBeach(rArc);
      rArc = next;
    }
    disappearing.push(rArc);
    d3_geom_voronoiDetachCircle(rArc);
    var nArcs = disappearing.length, iArc;
    for (iArc = 1; iArc < nArcs; ++iArc) {
      rArc = disappearing[iArc];
      lArc = disappearing[iArc - 1];
      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
    }
    lArc = disappearing[0];
    rArc = disappearing[nArcs - 1];
    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiAddBeach(site) {
    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
    while (node) {
      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
      if (dxl > ??) node = node.L; else {
        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
        if (dxr > ??) {
          if (!node.R) {
            lArc = node;
            break;
          }
          node = node.R;
        } else {
          if (dxl > -??) {
            lArc = node.P;
            rArc = node;
          } else if (dxr > -??) {
            lArc = node;
            rArc = node.N;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }
    var newArc = d3_geom_voronoiCreateBeach(site);
    d3_geom_voronoiBeaches.insert(lArc, newArc);
    if (!lArc && !rArc) return;
    if (lArc === rArc) {
      d3_geom_voronoiDetachCircle(lArc);
      rArc = d3_geom_voronoiCreateBeach(lArc.site);
      d3_geom_voronoiBeaches.insert(newArc, rArc);
      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      d3_geom_voronoiAttachCircle(lArc);
      d3_geom_voronoiAttachCircle(rArc);
      return;
    }
    if (!rArc) {
      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      return;
    }
    d3_geom_voronoiDetachCircle(lArc);
    d3_geom_voronoiDetachCircle(rArc);
    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
      x: (cy * hb - by * hc) / d + ax,
      y: (bx * hc - cx * hb) / d + ay
    };
    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
    if (!pby2) return rfocx;
    var lArc = arc.P;
    if (!lArc) return -Infinity;
    site = lArc.site;
    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
    if (!plby2) return lfocx;
    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
    return (rfocx + lfocx) / 2;
  }
  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
    var rArc = arc.N;
    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
    var site = arc.site;
    return site.y === directrix ? site.x : Infinity;
  }
  function d3_geom_voronoiCell(site) {
    this.site = site;
    this.edges = [];
  }
  d3_geom_voronoiCell.prototype.prepare = function() {
    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
    while (iHalfEdge--) {
      edge = halfEdges[iHalfEdge].edge;
      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
    }
    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
    return halfEdges.length;
  };
  function d3_geom_voronoiCloseCells(extent) {
    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
    while (iCell--) {
      cell = cells[iCell];
      if (!cell || !cell.prepare()) continue;
      halfEdges = cell.edges;
      nHalfEdges = halfEdges.length;
      iHalfEdge = 0;
      while (iHalfEdge < nHalfEdges) {
        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
        if (abs(x3 - x2) > ?? || abs(y3 - y2) > ??) {
          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ?? && y1 - y3 > ?? ? {
            x: x0,
            y: abs(x2 - x0) < ?? ? y2 : y1
          } : abs(y3 - y1) < ?? && x1 - x3 > ?? ? {
            x: abs(y2 - y1) < ?? ? x2 : x1,
            y: y1
          } : abs(x3 - x1) < ?? && y3 - y0 > ?? ? {
            x: x1,
            y: abs(x2 - x1) < ?? ? y2 : y0
          } : abs(y3 - y0) < ?? && x3 - x0 > ?? ? {
            x: abs(y2 - y0) < ?? ? x2 : x0,
            y: y0
          } : null), cell.site, null));
          ++nHalfEdges;
        }
      }
    }
  }
  function d3_geom_voronoiHalfEdgeOrder(a, b) {
    return b.angle - a.angle;
  }
  function d3_geom_voronoiCircle() {
    d3_geom_voronoiRedBlackNode(this);
    this.x = this.y = this.arc = this.site = this.cy = null;
  }
  function d3_geom_voronoiAttachCircle(arc) {
    var lArc = arc.P, rArc = arc.N;
    if (!lArc || !rArc) return;
    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
    if (lSite === rSite) return;
    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
    var d = 2 * (ax * cy - ay * cx);
    if (d >= -??2) return;
    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
    circle.arc = arc;
    circle.site = cSite;
    circle.x = x + bx;
    circle.y = cy + Math.sqrt(x * x + y * y);
    circle.cy = cy;
    arc.circle = circle;
    var before = null, node = d3_geom_voronoiCircles._;
    while (node) {
      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
        if (node.L) node = node.L; else {
          before = node.P;
          break;
        }
      } else {
        if (node.R) node = node.R; else {
          before = node;
          break;
        }
      }
    }
    d3_geom_voronoiCircles.insert(before, circle);
    if (!before) d3_geom_voronoiFirstCircle = circle;
  }
  function d3_geom_voronoiDetachCircle(arc) {
    var circle = arc.circle;
    if (circle) {
      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
      d3_geom_voronoiCircles.remove(circle);
      d3_geom_voronoiCirclePool.push(circle);
      d3_geom_voronoiRedBlackNode(circle);
      arc.circle = null;
    }
  }
  function d3_geom_voronoiClipEdges(extent) {
    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
    while (i--) {
      e = edges[i];
      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ?? && abs(e.a.y - e.b.y) < ??) {
        e.a = e.b = null;
        edges.splice(i, 1);
      }
    }
  }
  function d3_geom_voronoiConnectEdge(edge, extent) {
    var vb = edge.b;
    if (vb) return true;
    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
    if (ry === ly) {
      if (fx < x0 || fx >= x1) return;
      if (lx > rx) {
        if (!va) va = {
          x: fx,
          y: y0
        }; else if (va.y >= y1) return;
        vb = {
          x: fx,
          y: y1
        };
      } else {
        if (!va) va = {
          x: fx,
          y: y1
        }; else if (va.y < y0) return;
        vb = {
          x: fx,
          y: y0
        };
      }
    } else {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
      if (fm < -1 || fm > 1) {
        if (lx > rx) {
          if (!va) va = {
            x: (y0 - fb) / fm,
            y: y0
          }; else if (va.y >= y1) return;
          vb = {
            x: (y1 - fb) / fm,
            y: y1
          };
        } else {
          if (!va) va = {
            x: (y1 - fb) / fm,
            y: y1
          }; else if (va.y < y0) return;
          vb = {
            x: (y0 - fb) / fm,
            y: y0
          };
        }
      } else {
        if (ly < ry) {
          if (!va) va = {
            x: x0,
            y: fm * x0 + fb
          }; else if (va.x >= x1) return;
          vb = {
            x: x1,
            y: fm * x1 + fb
          };
        } else {
          if (!va) va = {
            x: x1,
            y: fm * x1 + fb
          }; else if (va.x < x0) return;
          vb = {
            x: x0,
            y: fm * x0 + fb
          };
        }
      }
    }
    edge.a = va;
    edge.b = vb;
    return true;
  }
  function d3_geom_voronoiEdge(lSite, rSite) {
    this.l = lSite;
    this.r = rSite;
    this.a = this.b = null;
  }
  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, rSite);
    d3_geom_voronoiEdges.push(edge);
    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
    return edge;
  }
  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, null);
    edge.a = va;
    edge.b = vb;
    d3_geom_voronoiEdges.push(edge);
    return edge;
  }
  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
    if (!edge.a && !edge.b) {
      edge.a = vertex;
      edge.l = lSite;
      edge.r = rSite;
    } else if (edge.l === rSite) {
      edge.b = vertex;
    } else {
      edge.a = vertex;
    }
  }
  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
    var va = edge.a, vb = edge.b;
    this.edge = edge;
    this.site = lSite;
    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
  }
  d3_geom_voronoiHalfEdge.prototype = {
    start: function() {
      return this.edge.l === this.site ? this.edge.a : this.edge.b;
    },
    end: function() {
      return this.edge.l === this.site ? this.edge.b : this.edge.a;
    }
  };
  function d3_geom_voronoiRedBlackTree() {
    this._ = null;
  }
  function d3_geom_voronoiRedBlackNode(node) {
    node.U = node.C = node.L = node.R = node.P = node.N = null;
  }
  d3_geom_voronoiRedBlackTree.prototype = {
    insert: function(after, node) {
      var parent, grandpa, uncle;
      if (after) {
        node.P = after;
        node.N = after.N;
        if (after.N) after.N.P = node;
        after.N = node;
        if (after.R) {
          after = after.R;
          while (after.L) after = after.L;
          after.L = node;
        } else {
          after.R = node;
        }
        parent = after;
      } else if (this._) {
        after = d3_geom_voronoiRedBlackFirst(this._);
        node.P = null;
        node.N = after;
        after.P = after.L = node;
        parent = after;
      } else {
        node.P = node.N = null;
        this._ = node;
        parent = null;
      }
      node.L = node.R = null;
      node.U = parent;
      node.C = true;
      after = node;
      while (parent && parent.C) {
        grandpa = parent.U;
        if (parent === grandpa.L) {
          uncle = grandpa.R;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.R) {
              d3_geom_voronoiRedBlackRotateLeft(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
          }
        } else {
          uncle = grandpa.L;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.L) {
              d3_geom_voronoiRedBlackRotateRight(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
          }
        }
        parent = after.U;
      }
      this._.C = false;
    },
    remove: function(node) {
      if (node.N) node.N.P = node.P;
      if (node.P) node.P.N = node.N;
      node.N = node.P = null;
      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
      if (parent) {
        if (parent.L === node) parent.L = next; else parent.R = next;
      } else {
        this._ = next;
      }
      if (left && right) {
        red = next.C;
        next.C = node.C;
        next.L = left;
        left.U = next;
        if (next !== right) {
          parent = next.U;
          next.U = node.U;
          node = next.R;
          parent.L = node;
          next.R = right;
          right.U = next;
        } else {
          next.U = parent;
          parent = next;
          node = next.R;
        }
      } else {
        red = node.C;
        node = next;
      }
      if (node) node.U = parent;
      if (red) return;
      if (node && node.C) {
        node.C = false;
        return;
      }
      do {
        if (node === this._) break;
        if (node === parent.L) {
          sibling = parent.R;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            sibling = parent.R;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.R || !sibling.R.C) {
              sibling.L.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateRight(this, sibling);
              sibling = parent.R;
            }
            sibling.C = parent.C;
            parent.C = sibling.R.C = false;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            node = this._;
            break;
          }
        } else {
          sibling = parent.L;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            sibling = parent.L;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.L || !sibling.L.C) {
              sibling.R.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
              sibling = parent.L;
            }
            sibling.C = parent.C;
            parent.C = sibling.L.C = false;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            node = this._;
            break;
          }
        }
        sibling.C = true;
        node = parent;
        parent = parent.U;
      } while (!node.C);
      if (node) node.C = false;
    }
  };
  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
    var p = node, q = node.R, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.R = q.L;
    if (p.R) p.R.U = p;
    q.L = p;
  }
  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
    var p = node, q = node.L, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.L = q.R;
    if (p.L) p.L.U = p;
    q.R = p;
  }
  function d3_geom_voronoiRedBlackFirst(node) {
    while (node.L) node = node.L;
    return node;
  }
  function d3_geom_voronoi(sites, bbox) {
    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
    d3_geom_voronoiEdges = [];
    d3_geom_voronoiCells = new Array(sites.length);
    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
    while (true) {
      circle = d3_geom_voronoiFirstCircle;
      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
        if (site.x !== x0 || site.y !== y0) {
          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
          d3_geom_voronoiAddBeach(site);
          x0 = site.x, y0 = site.y;
        }
        site = sites.pop();
      } else if (circle) {
        d3_geom_voronoiRemoveBeach(circle.arc);
      } else {
        break;
      }
    }
    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
    var diagram = {
      cells: d3_geom_voronoiCells,
      edges: d3_geom_voronoiEdges
    };
    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
    return diagram;
  }
  function d3_geom_voronoiVertexOrder(a, b) {
    return b.y - a.y || b.x - a.x;
  }
  d3.geom.voronoi = function(points) {
    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
    if (points) return voronoi(points);
    function voronoi(data) {
      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
          var s = e.start();
          return [ s.x, s.y ];
        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
        polygon.point = data[i];
      });
      return polygons;
    }
    function sites(data) {
      return data.map(function(d, i) {
        return {
          x: Math.round(fx(d, i) / ??) * ??,
          y: Math.round(fy(d, i) / ??) * ??,
          i: i
        };
      });
    }
    voronoi.links = function(data) {
      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
        return edge.l && edge.r;
      }).map(function(edge) {
        return {
          source: data[edge.l.i],
          target: data[edge.r.i]
        };
      });
    };
    voronoi.triangles = function(data) {
      var triangles = [];
      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
        while (++j < m) {
          e0 = e1;
          s0 = s1;
          e1 = edges[j].edge;
          s1 = e1.l === site ? e1.r : e1.l;
          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
          }
        }
      });
      return triangles;
    };
    voronoi.x = function(_) {
      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
    };
    voronoi.y = function(_) {
      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
    };
    voronoi.clipExtent = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
      return voronoi;
    };
    voronoi.size = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
    };
    return voronoi;
  };
  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
  function d3_geom_voronoiTriangleArea(a, b, c) {
    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
  }
  d3.geom.delaunay = function(vertices) {
    return d3.geom.voronoi().triangles(vertices);
  };
  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
    if (compat = arguments.length) {
      x = d3_geom_quadtreeCompatX;
      y = d3_geom_quadtreeCompatY;
      if (compat === 3) {
        y2 = y1;
        x2 = x1;
        y1 = x1 = 0;
      }
      return quadtree(points);
    }
    function quadtree(data) {
      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
      if (x1 != null) {
        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
      } else {
        x2_ = y2_ = -(x1_ = y1_ = Infinity);
        xs = [], ys = [];
        n = data.length;
        if (compat) for (i = 0; i < n; ++i) {
          d = data[i];
          if (d.x < x1_) x1_ = d.x;
          if (d.y < y1_) y1_ = d.y;
          if (d.x > x2_) x2_ = d.x;
          if (d.y > y2_) y2_ = d.y;
          xs.push(d.x);
          ys.push(d.y);
        } else for (i = 0; i < n; ++i) {
          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
          if (x_ < x1_) x1_ = x_;
          if (y_ < y1_) y1_ = y_;
          if (x_ > x2_) x2_ = x_;
          if (y_ > y2_) y2_ = y_;
          xs.push(x_);
          ys.push(y_);
        }
      }
      var dx = x2_ - x1_, dy = y2_ - y1_;
      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
      function insert(n, d, x, y, x1, y1, x2, y2) {
        if (isNaN(x) || isNaN(y)) return;
        if (n.leaf) {
          var nx = n.x, ny = n.y;
          if (nx != null) {
            if (abs(nx - x) + abs(ny - y) < .01) {
              insertChild(n, d, x, y, x1, y1, x2, y2);
            } else {
              var nPoint = n.point;
              n.x = n.y = n.point = null;
              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
              insertChild(n, d, x, y, x1, y1, x2, y2);
            }
          } else {
            n.x = x, n.y = y, n.point = d;
          }
        } else {
          insertChild(n, d, x, y, x1, y1, x2, y2);
        }
      }
      function insertChild(n, d, x, y, x1, y1, x2, y2) {
        var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym, i = below << 1 | right;
        n.leaf = false;
        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
        if (right) x1 = xm; else x2 = xm;
        if (below) y1 = ym; else y2 = ym;
        insert(n, d, x, y, x1, y1, x2, y2);
      }
      var root = d3_geom_quadtreeNode();
      root.add = function(d) {
        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
      };
      root.visit = function(f) {
        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
      };
      root.find = function(point) {
        return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
      };
      i = -1;
      if (x1 == null) {
        while (++i < n) {
          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
        }
        --i;
      } else data.forEach(root.add);
      xs = ys = data = d = null;
      return root;
    }
    quadtree.x = function(_) {
      return arguments.length ? (x = _, quadtree) : x;
    };
    quadtree.y = function(_) {
      return arguments.length ? (y = _, quadtree) : y;
    };
    quadtree.extent = function(_) {
      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
      y2 = +_[1][1];
      return quadtree;
    };
    quadtree.size = function(_) {
      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
      return quadtree;
    };
    return quadtree;
  };
  function d3_geom_quadtreeCompatX(d) {
    return d.x;
  }
  function d3_geom_quadtreeCompatY(d) {
    return d.y;
  }
  function d3_geom_quadtreeNode() {
    return {
      leaf: true,
      nodes: [],
      point: null,
      x: null,
      y: null
    };
  }
  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
    if (!f(node, x1, y1, x2, y2)) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
    }
  }
  function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
    var minDistance2 = Infinity, closestPoint;
    (function find(node, x1, y1, x2, y2) {
      if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
      if (point = node.point) {
        var point, dx = x - node.x, dy = y - node.y, distance2 = dx * dx + dy * dy;
        if (distance2 < minDistance2) {
          var distance = Math.sqrt(minDistance2 = distance2);
          x0 = x - distance, y0 = y - distance;
          x3 = x + distance, y3 = y + distance;
          closestPoint = point;
        }
      }
      var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym;
      for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
        if (node = children[i & 3]) switch (i & 3) {
         case 0:
          find(node, x1, y1, xm, ym);
          break;

         case 1:
          find(node, xm, y1, x2, ym);
          break;

         case 2:
          find(node, x1, ym, xm, y2);
          break;

         case 3:
          find(node, xm, ym, x2, y2);
          break;
        }
      }
    })(root, x0, y0, x3, y3);
    return closestPoint;
  }
  d3.interpolateRgb = d3_interpolateRgb;
  function d3_interpolateRgb(a, b) {
    a = d3.rgb(a);
    b = d3.rgb(b);
    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
    return function(t) {
      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
    };
  }
  d3.interpolateObject = d3_interpolateObject;
  function d3_interpolateObject(a, b) {
    var i = {}, c = {}, k;
    for (k in a) {
      if (k in b) {
        i[k] = d3_interpolate(a[k], b[k]);
      } else {
        c[k] = a[k];
      }
    }
    for (k in b) {
      if (!(k in a)) {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }
  d3.interpolateNumber = d3_interpolateNumber;
  function d3_interpolateNumber(a, b) {
    a = +a, b = +b;
    return function(t) {
      return a * (1 - t) + b * t;
    };
  }
  d3.interpolateString = d3_interpolateString;
  function d3_interpolateString(a, b) {
    var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm; else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({
          i: i,
          x: d3_interpolateNumber(am, bm)
        });
      }
      bi = d3_interpolate_numberB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? (b = q[0].x, function(t) {
      return b(t) + "";
    }) : function() {
      return b;
    } : (b = q.length, function(t) {
      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    });
  }
  var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
  d3.interpolate = d3_interpolate;
  function d3_interpolate(a, b) {
    var i = d3.interpolators.length, f;
    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
    return f;
  }
  d3.interpolators = [ function(a, b) {
    var t = typeof b;
    return (t === "string" ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
  } ];
  d3.interpolateArray = d3_interpolateArray;
  function d3_interpolateArray(a, b) {
    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
    for (;i < na; ++i) c[i] = a[i];
    for (;i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < n0; ++i) c[i] = x[i](t);
      return c;
    };
  }
  var d3_ease_default = function() {
    return d3_identity;
  };
  var d3_ease = d3.map({
    linear: d3_ease_default,
    poly: d3_ease_poly,
    quad: function() {
      return d3_ease_quad;
    },
    cubic: function() {
      return d3_ease_cubic;
    },
    sin: function() {
      return d3_ease_sin;
    },
    exp: function() {
      return d3_ease_exp;
    },
    circle: function() {
      return d3_ease_circle;
    },
    elastic: d3_ease_elastic,
    back: d3_ease_back,
    bounce: function() {
      return d3_ease_bounce;
    }
  });
  var d3_ease_mode = d3.map({
    "in": d3_identity,
    out: d3_ease_reverse,
    "in-out": d3_ease_reflect,
    "out-in": function(f) {
      return d3_ease_reflect(d3_ease_reverse(f));
    }
  });
  d3.ease = function(name) {
    var i = name.indexOf("-"), t = i >= 0 ? name.slice(0, i) : name, m = i >= 0 ? name.slice(i + 1) : "in";
    t = d3_ease.get(t) || d3_ease_default;
    m = d3_ease_mode.get(m) || d3_identity;
    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
  };
  function d3_ease_clamp(f) {
    return function(t) {
      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
    };
  }
  function d3_ease_reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }
  function d3_ease_reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
    };
  }
  function d3_ease_quad(t) {
    return t * t;
  }
  function d3_ease_cubic(t) {
    return t * t * t;
  }
  function d3_ease_cubicInOut(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var t2 = t * t, t3 = t2 * t;
    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
  }
  function d3_ease_poly(e) {
    return function(t) {
      return Math.pow(t, e);
    };
  }
  function d3_ease_sin(t) {
    return 1 - Math.cos(t * half??);
  }
  function d3_ease_exp(t) {
    return Math.pow(2, 10 * (t - 1));
  }
  function d3_ease_circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  }
  function d3_ease_elastic(a, p) {
    var s;
    if (arguments.length < 2) p = .45;
    if (arguments.length) s = p / ?? * Math.asin(1 / a); else a = 1, s = p / 4;
    return function(t) {
      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * ?? / p);
    };
  }
  function d3_ease_back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }
  function d3_ease_bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }
  d3.interpolateHcl = d3_interpolateHcl;
  function d3_interpolateHcl(a, b) {
    a = d3.hcl(a);
    b = d3.hcl(b);
    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
    };
  }
  d3.interpolateHsl = d3_interpolateHsl;
  function d3_interpolateHsl(a, b) {
    a = d3.hsl(a);
    b = d3.hsl(b);
    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
    };
  }
  d3.interpolateLab = d3_interpolateLab;
  function d3_interpolateLab(a, b) {
    a = d3.lab(a);
    b = d3.lab(b);
    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
    return function(t) {
      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
    };
  }
  d3.interpolateRound = d3_interpolateRound;
  function d3_interpolateRound(a, b) {
    b -= a;
    return function(t) {
      return Math.round(a + b * t);
    };
  }
  d3.transform = function(string) {
    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
    return (d3.transform = function(string) {
      if (string != null) {
        g.setAttribute("transform", string);
        var t = g.transform.baseVal.consolidate();
      }
      return new d3_transform(t ? t.matrix : d3_transformIdentity);
    })(string);
  };
  function d3_transform(m) {
    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
    if (r0[0] * r1[1] < r1[0] * r0[1]) {
      r0[0] *= -1;
      r0[1] *= -1;
      kx *= -1;
      kz *= -1;
    }
    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
    this.translate = [ m.e, m.f ];
    this.scale = [ kx, ky ];
    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
  }
  d3_transform.prototype.toString = function() {
    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
  };
  function d3_transformDot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function d3_transformNormalize(a) {
    var k = Math.sqrt(d3_transformDot(a, a));
    if (k) {
      a[0] /= k;
      a[1] /= k;
    }
    return k;
  }
  function d3_transformCombine(a, b, k) {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
  }
  var d3_transformIdentity = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
  };
  d3.interpolateTransform = d3_interpolateTransform;
  function d3_interpolateTransform(a, b) {
    var s = [], q = [], n, A = d3.transform(a), B = d3.transform(b), ta = A.translate, tb = B.translate, ra = A.rotate, rb = B.rotate, wa = A.skew, wb = B.skew, ka = A.scale, kb = B.scale;
    if (ta[0] != tb[0] || ta[1] != tb[1]) {
      s.push("translate(", null, ",", null, ")");
      q.push({
        i: 1,
        x: d3_interpolateNumber(ta[0], tb[0])
      }, {
        i: 3,
        x: d3_interpolateNumber(ta[1], tb[1])
      });
    } else if (tb[0] || tb[1]) {
      s.push("translate(" + tb + ")");
    } else {
      s.push("");
    }
    if (ra != rb) {
      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
      q.push({
        i: s.push(s.pop() + "rotate(", null, ")") - 2,
        x: d3_interpolateNumber(ra, rb)
      });
    } else if (rb) {
      s.push(s.pop() + "rotate(" + rb + ")");
    }
    if (wa != wb) {
      q.push({
        i: s.push(s.pop() + "skewX(", null, ")") - 2,
        x: d3_interpolateNumber(wa, wb)
      });
    } else if (wb) {
      s.push(s.pop() + "skewX(" + wb + ")");
    }
    if (ka[0] != kb[0] || ka[1] != kb[1]) {
      n = s.push(s.pop() + "scale(", null, ",", null, ")");
      q.push({
        i: n - 4,
        x: d3_interpolateNumber(ka[0], kb[0])
      }, {
        i: n - 2,
        x: d3_interpolateNumber(ka[1], kb[1])
      });
    } else if (kb[0] != 1 || kb[1] != 1) {
      s.push(s.pop() + "scale(" + kb + ")");
    }
    n = q.length;
    return function(t) {
      var i = -1, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  }
  function d3_uninterpolateNumber(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return (x - a) / b;
    };
  }
  function d3_uninterpolateClamp(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return Math.max(0, Math.min(1, (x - a) / b));
    };
  }
  d3.layout = {};
  d3.layout.bundle = function() {
    return function(links) {
      var paths = [], i = -1, n = links.length;
      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
      return paths;
    };
  };
  function d3_layout_bundlePath(link) {
    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
    while (start !== lca) {
      start = start.parent;
      points.push(start);
    }
    var k = points.length;
    while (end !== lca) {
      points.splice(k, 0, end);
      end = end.parent;
    }
    return points;
  }
  function d3_layout_bundleAncestors(node) {
    var ancestors = [], parent = node.parent;
    while (parent != null) {
      ancestors.push(node);
      node = parent;
      parent = parent.parent;
    }
    ancestors.push(node);
    return ancestors;
  }
  function d3_layout_bundleLeastCommonAncestor(a, b) {
    if (a === b) return a;
    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
    while (aNode === bNode) {
      sharedNode = aNode;
      aNode = aNodes.pop();
      bNode = bNodes.pop();
    }
    return sharedNode;
  }
  d3.layout.chord = function() {
    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
    function relayout() {
      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
      chords = [];
      groups = [];
      k = 0, i = -1;
      while (++i < n) {
        x = 0, j = -1;
        while (++j < n) {
          x += matrix[i][j];
        }
        groupSums.push(x);
        subgroupIndex.push(d3.range(n));
        k += x;
      }
      if (sortGroups) {
        groupIndex.sort(function(a, b) {
          return sortGroups(groupSums[a], groupSums[b]);
        });
      }
      if (sortSubgroups) {
        subgroupIndex.forEach(function(d, i) {
          d.sort(function(a, b) {
            return sortSubgroups(matrix[i][a], matrix[i][b]);
          });
        });
      }
      k = (?? - padding * n) / k;
      x = 0, i = -1;
      while (++i < n) {
        x0 = x, j = -1;
        while (++j < n) {
          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
          subgroups[di + "-" + dj] = {
            index: di,
            subindex: dj,
            startAngle: a0,
            endAngle: a1,
            value: v
          };
        }
        groups[di] = {
          index: di,
          startAngle: x0,
          endAngle: x,
          value: (x - x0) / k
        };
        x += padding;
      }
      i = -1;
      while (++i < n) {
        j = i - 1;
        while (++j < n) {
          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
          if (source.value || target.value) {
            chords.push(source.value < target.value ? {
              source: target,
              target: source
            } : {
              source: source,
              target: target
            });
          }
        }
      }
      if (sortChords) resort();
    }
    function resort() {
      chords.sort(function(a, b) {
        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
      });
    }
    chord.matrix = function(x) {
      if (!arguments.length) return matrix;
      n = (matrix = x) && matrix.length;
      chords = groups = null;
      return chord;
    };
    chord.padding = function(x) {
      if (!arguments.length) return padding;
      padding = x;
      chords = groups = null;
      return chord;
    };
    chord.sortGroups = function(x) {
      if (!arguments.length) return sortGroups;
      sortGroups = x;
      chords = groups = null;
      return chord;
    };
    chord.sortSubgroups = function(x) {
      if (!arguments.length) return sortSubgroups;
      sortSubgroups = x;
      chords = null;
      return chord;
    };
    chord.sortChords = function(x) {
      if (!arguments.length) return sortChords;
      sortChords = x;
      if (chords) resort();
      return chord;
    };
    chord.chords = function() {
      if (!chords) relayout();
      return chords;
    };
    chord.groups = function() {
      if (!groups) relayout();
      return groups;
    };
    return chord;
  };
  d3.layout.force = function() {
    var force = {}, event = d3.dispatch("start", "tick", "end"), size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
    function repulse(node) {
      return function(quad, x1, _, x2) {
        if (quad.point !== node) {
          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
          if (dw * dw / theta2 < dn) {
            if (dn < chargeDistance2) {
              var k = quad.charge / dn;
              node.px -= dx * k;
              node.py -= dy * k;
            }
            return true;
          }
          if (quad.point && dn && dn < chargeDistance2) {
            var k = quad.pointCharge / dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
        }
        return !quad.charge;
      };
    }
    force.tick = function() {
      if ((alpha *= .99) < .005) {
        event.end({
          type: "end",
          alpha: alpha = 0
        });
        return true;
      }
      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
      for (i = 0; i < m; ++i) {
        o = links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = x * x + y * y) {
          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight / (t.weight + s.weight));
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }
      if (k = alpha * gravity) {
        x = size[0] / 2;
        y = size[1] / 2;
        i = -1;
        if (k) while (++i < n) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }
      if (charge) {
        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
        i = -1;
        while (++i < n) {
          if (!(o = nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }
      i = -1;
      while (++i < n) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * friction;
          o.y -= (o.py - (o.py = o.y)) * friction;
        }
      }
      event.tick({
        type: "tick",
        alpha: alpha
      });
    };
    force.nodes = function(x) {
      if (!arguments.length) return nodes;
      nodes = x;
      return force;
    };
    force.links = function(x) {
      if (!arguments.length) return links;
      links = x;
      return force;
    };
    force.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return force;
    };
    force.linkDistance = function(x) {
      if (!arguments.length) return linkDistance;
      linkDistance = typeof x === "function" ? x : +x;
      return force;
    };
    force.distance = force.linkDistance;
    force.linkStrength = function(x) {
      if (!arguments.length) return linkStrength;
      linkStrength = typeof x === "function" ? x : +x;
      return force;
    };
    force.friction = function(x) {
      if (!arguments.length) return friction;
      friction = +x;
      return force;
    };
    force.charge = function(x) {
      if (!arguments.length) return charge;
      charge = typeof x === "function" ? x : +x;
      return force;
    };
    force.chargeDistance = function(x) {
      if (!arguments.length) return Math.sqrt(chargeDistance2);
      chargeDistance2 = x * x;
      return force;
    };
    force.gravity = function(x) {
      if (!arguments.length) return gravity;
      gravity = +x;
      return force;
    };
    force.theta = function(x) {
      if (!arguments.length) return Math.sqrt(theta2);
      theta2 = x * x;
      return force;
    };
    force.alpha = function(x) {
      if (!arguments.length) return alpha;
      x = +x;
      if (alpha) {
        if (x > 0) alpha = x; else alpha = 0;
      } else if (x > 0) {
        event.start({
          type: "start",
          alpha: alpha = x
        });
        d3.timer(force.tick);
      }
      return force;
    };
    force.start = function() {
      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
      for (i = 0; i < n; ++i) {
        (o = nodes[i]).index = i;
        o.weight = 0;
      }
      for (i = 0; i < m; ++i) {
        o = links[i];
        if (typeof o.source == "number") o.source = nodes[o.source];
        if (typeof o.target == "number") o.target = nodes[o.target];
        ++o.source.weight;
        ++o.target.weight;
      }
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (isNaN(o.x)) o.x = position("x", w);
        if (isNaN(o.y)) o.y = position("y", h);
        if (isNaN(o.px)) o.px = o.x;
        if (isNaN(o.py)) o.py = o.y;
      }
      distances = [];
      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
      strengths = [];
      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
      charges = [];
      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
      function position(dimension, size) {
        if (!neighbors) {
          neighbors = new Array(n);
          for (j = 0; j < n; ++j) {
            neighbors[j] = [];
          }
          for (j = 0; j < m; ++j) {
            var o = links[j];
            neighbors[o.source.index].push(o.target);
            neighbors[o.target.index].push(o.source);
          }
        }
        var candidates = neighbors[i], j = -1, l = candidates.length, x;
        while (++j < l) if (!isNaN(x = candidates[j][dimension])) return x;
        return Math.random() * size;
      }
      return force.resume();
    };
    force.resume = function() {
      return force.alpha(.1);
    };
    force.stop = function() {
      return force.alpha(0);
    };
    force.drag = function() {
      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
      if (!arguments.length) return drag;
      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
    };
    function dragmove(d) {
      d.px = d3.event.x, d.py = d3.event.y;
      force.resume();
    }
    return d3.rebind(force, event, "on");
  };
  function d3_layout_forceDragstart(d) {
    d.fixed |= 2;
  }
  function d3_layout_forceDragend(d) {
    d.fixed &= ~6;
  }
  function d3_layout_forceMouseover(d) {
    d.fixed |= 4;
    d.px = d.x, d.py = d.y;
  }
  function d3_layout_forceMouseout(d) {
    d.fixed &= ~4;
  }
  function d3_layout_forceAccumulate(quad, alpha, charges) {
    var cx = 0, cy = 0;
    quad.charge = 0;
    if (!quad.leaf) {
      var nodes = quad.nodes, n = nodes.length, i = -1, c;
      while (++i < n) {
        c = nodes[i];
        if (c == null) continue;
        d3_layout_forceAccumulate(c, alpha, charges);
        quad.charge += c.charge;
        cx += c.charge * c.cx;
        cy += c.charge * c.cy;
      }
    }
    if (quad.point) {
      if (!quad.leaf) {
        quad.point.x += Math.random() - .5;
        quad.point.y += Math.random() - .5;
      }
      var k = alpha * charges[quad.point.index];
      quad.charge += quad.pointCharge = k;
      cx += k * quad.point.x;
      cy += k * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  }
  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
  d3.layout.hierarchy = function() {
    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
    function hierarchy(root) {
      var stack = [ root ], nodes = [], node;
      root.depth = 0;
      while ((node = stack.pop()) != null) {
        nodes.push(node);
        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
          var n, childs, child;
          while (--n >= 0) {
            stack.push(child = childs[n]);
            child.parent = node;
            child.depth = node.depth + 1;
          }
          if (value) node.value = 0;
          node.children = childs;
        } else {
          if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
          delete node.children;
        }
      }
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var childs, parent;
        if (sort && (childs = node.children)) childs.sort(sort);
        if (value && (parent = node.parent)) parent.value += node.value;
      });
      return nodes;
    }
    hierarchy.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return hierarchy;
    };
    hierarchy.children = function(x) {
      if (!arguments.length) return children;
      children = x;
      return hierarchy;
    };
    hierarchy.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return hierarchy;
    };
    hierarchy.revalue = function(root) {
      if (value) {
        d3_layout_hierarchyVisitBefore(root, function(node) {
          if (node.children) node.value = 0;
        });
        d3_layout_hierarchyVisitAfter(root, function(node) {
          var parent;
          if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
          if (parent = node.parent) parent.value += node.value;
        });
      }
      return root;
    };
    return hierarchy;
  };
  function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;
    return object;
  }
  function d3_layout_hierarchyVisitBefore(node, callback) {
    var nodes = [ node ];
    while ((node = nodes.pop()) != null) {
      callback(node);
      if ((children = node.children) && (n = children.length)) {
        var n, children;
        while (--n >= 0) nodes.push(children[n]);
      }
    }
  }
  function d3_layout_hierarchyVisitAfter(node, callback) {
    var nodes = [ node ], nodes2 = [];
    while ((node = nodes.pop()) != null) {
      nodes2.push(node);
      if ((children = node.children) && (n = children.length)) {
        var i = -1, n, children;
        while (++i < n) nodes.push(children[i]);
      }
    }
    while ((node = nodes2.pop()) != null) {
      callback(node);
    }
  }
  function d3_layout_hierarchyChildren(d) {
    return d.children;
  }
  function d3_layout_hierarchyValue(d) {
    return d.value;
  }
  function d3_layout_hierarchySort(a, b) {
    return b.value - a.value;
  }
  function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
      return (parent.children || []).map(function(child) {
        return {
          source: parent,
          target: child
        };
      });
    }));
  }
  d3.layout.partition = function() {
    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
    function position(node, x, dx, dy) {
      var children = node.children;
      node.x = x;
      node.y = node.depth * dy;
      node.dx = dx;
      node.dy = dy;
      if (children && (n = children.length)) {
        var i = -1, n, c, d;
        dx = node.value ? dx / node.value : 0;
        while (++i < n) {
          position(c = children[i], x, d = c.value * dx, dy);
          x += d;
        }
      }
    }
    function depth(node) {
      var children = node.children, d = 0;
      if (children && (n = children.length)) {
        var i = -1, n;
        while (++i < n) d = Math.max(d, depth(children[i]));
      }
      return 1 + d;
    }
    function partition(d, i) {
      var nodes = hierarchy.call(this, d, i);
      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
      return nodes;
    }
    partition.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return partition;
    };
    return d3_layout_hierarchyRebind(partition, hierarchy);
  };
  d3.layout.pie = function() {
    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = ??, padAngle = 0;
    function pie(data) {
      var n = data.length, values = data.map(function(d, i) {
        return +value.call(pie, d, i);
      }), a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle), da = (typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a, p = Math.min(Math.abs(da) / n, +(typeof padAngle === "function" ? padAngle.apply(this, arguments) : padAngle)), pa = p * (da < 0 ? -1 : 1), k = (da - n * pa) / d3.sum(values), index = d3.range(n), arcs = [], v;
      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
        return values[j] - values[i];
      } : function(i, j) {
        return sort(data[i], data[j]);
      });
      index.forEach(function(i) {
        arcs[i] = {
          data: data[i],
          value: v = values[i],
          startAngle: a,
          endAngle: a += v * k + pa,
          padAngle: p
        };
      });
      return arcs;
    }
    pie.value = function(_) {
      if (!arguments.length) return value;
      value = _;
      return pie;
    };
    pie.sort = function(_) {
      if (!arguments.length) return sort;
      sort = _;
      return pie;
    };
    pie.startAngle = function(_) {
      if (!arguments.length) return startAngle;
      startAngle = _;
      return pie;
    };
    pie.endAngle = function(_) {
      if (!arguments.length) return endAngle;
      endAngle = _;
      return pie;
    };
    pie.padAngle = function(_) {
      if (!arguments.length) return padAngle;
      padAngle = _;
      return pie;
    };
    return pie;
  };
  var d3_layout_pieSortByValue = {};
  d3.layout.stack = function() {
    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
    function stack(data, index) {
      if (!(n = data.length)) return data;
      var series = data.map(function(d, i) {
        return values.call(stack, d, i);
      });
      var points = series.map(function(d) {
        return d.map(function(v, i) {
          return [ x.call(stack, v, i), y.call(stack, v, i) ];
        });
      });
      var orders = order.call(stack, points, index);
      series = d3.permute(series, orders);
      points = d3.permute(points, orders);
      var offsets = offset.call(stack, points, index);
      var m = series[0].length, n, i, j, o;
      for (j = 0; j < m; ++j) {
        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
        for (i = 1; i < n; ++i) {
          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
        }
      }
      return data;
    }
    stack.values = function(x) {
      if (!arguments.length) return values;
      values = x;
      return stack;
    };
    stack.order = function(x) {
      if (!arguments.length) return order;
      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
      return stack;
    };
    stack.offset = function(x) {
      if (!arguments.length) return offset;
      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
      return stack;
    };
    stack.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      return stack;
    };
    stack.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      return stack;
    };
    stack.out = function(z) {
      if (!arguments.length) return out;
      out = z;
      return stack;
    };
    return stack;
  };
  function d3_layout_stackX(d) {
    return d.x;
  }
  function d3_layout_stackY(d) {
    return d.y;
  }
  function d3_layout_stackOut(d, y0, y) {
    d.y0 = y0;
    d.y = y;
  }
  var d3_layout_stackOrders = d3.map({
    "inside-out": function(data) {
      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
        return max[a] - max[b];
      }), top = 0, bottom = 0, tops = [], bottoms = [];
      for (i = 0; i < n; ++i) {
        j = index[i];
        if (top < bottom) {
          top += sums[j];
          tops.push(j);
        } else {
          bottom += sums[j];
          bottoms.push(j);
        }
      }
      return bottoms.reverse().concat(tops);
    },
    reverse: function(data) {
      return d3.range(data.length).reverse();
    },
    "default": d3_layout_stackOrderDefault
  });
  var d3_layout_stackOffsets = d3.map({
    silhouette: function(data) {
      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o > max) max = o;
        sums.push(o);
      }
      for (j = 0; j < m; ++j) {
        y0[j] = (max - sums[j]) / 2;
      }
      return y0;
    },
    wiggle: function(data) {
      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
      y0[0] = o = o0 = 0;
      for (j = 1; j < m; ++j) {
        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
          }
          s2 += s3 * data[i][j][1];
        }
        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
        if (o < o0) o0 = o;
      }
      for (j = 0; j < m; ++j) y0[j] -= o0;
      return y0;
    },
    expand: function(data) {
      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
      }
      for (j = 0; j < m; ++j) y0[j] = 0;
      return y0;
    },
    zero: d3_layout_stackOffsetZero
  });
  function d3_layout_stackOrderDefault(data) {
    return d3.range(data.length);
  }
  function d3_layout_stackOffsetZero(data) {
    var j = -1, m = data[0].length, y0 = [];
    while (++j < m) y0[j] = 0;
    return y0;
  }
  function d3_layout_stackMaxIndex(array) {
    var i = 1, j = 0, v = array[0][1], k, n = array.length;
    for (;i < n; ++i) {
      if ((k = array[i][1]) > v) {
        j = i;
        v = k;
      }
    }
    return j;
  }
  function d3_layout_stackReduceSum(d) {
    return d.reduce(d3_layout_stackSum, 0);
  }
  function d3_layout_stackSum(p, d) {
    return p + d[1];
  }
  d3.layout.histogram = function() {
    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
    function histogram(data, i) {
      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
      while (++i < m) {
        bin = bins[i] = [];
        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
        bin.y = 0;
      }
      if (m > 0) {
        i = -1;
        while (++i < n) {
          x = values[i];
          if (x >= range[0] && x <= range[1]) {
            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
            bin.y += k;
            bin.push(data[i]);
          }
        }
      }
      return bins;
    }
    histogram.value = function(x) {
      if (!arguments.length) return valuer;
      valuer = x;
      return histogram;
    };
    histogram.range = function(x) {
      if (!arguments.length) return ranger;
      ranger = d3_functor(x);
      return histogram;
    };
    histogram.bins = function(x) {
      if (!arguments.length) return binner;
      binner = typeof x === "number" ? function(range) {
        return d3_layout_histogramBinFixed(range, x);
      } : d3_functor(x);
      return histogram;
    };
    histogram.frequency = function(x) {
      if (!arguments.length) return frequency;
      frequency = !!x;
      return histogram;
    };
    return histogram;
  };
  function d3_layout_histogramBinSturges(range, values) {
    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
  }
  function d3_layout_histogramBinFixed(range, n) {
    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
    while (++x <= n) f[x] = m * x + b;
    return f;
  }
  function d3_layout_histogramRange(values) {
    return [ d3.min(values), d3.max(values) ];
  }
  d3.layout.pack = function() {
    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
    function pack(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
        return radius;
      };
      root.x = root.y = 0;
      d3_layout_hierarchyVisitAfter(root, function(d) {
        d.r = +r(d.value);
      });
      d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
      if (padding) {
        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r += dr;
        });
        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r -= dr;
        });
      }
      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
      return nodes;
    }
    pack.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return pack;
    };
    pack.radius = function(_) {
      if (!arguments.length) return radius;
      radius = _ == null || typeof _ === "function" ? _ : +_;
      return pack;
    };
    pack.padding = function(_) {
      if (!arguments.length) return padding;
      padding = +_;
      return pack;
    };
    return d3_layout_hierarchyRebind(pack, hierarchy);
  };
  function d3_layout_packSort(a, b) {
    return a.value - b.value;
  }
  function d3_layout_packInsert(a, b) {
    var c = a._pack_next;
    a._pack_next = b;
    b._pack_prev = a;
    b._pack_next = c;
    c._pack_prev = b;
  }
  function d3_layout_packSplice(a, b) {
    a._pack_next = b;
    b._pack_prev = a;
  }
  function d3_layout_packIntersects(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
    return .999 * dr * dr > dx * dx + dy * dy;
  }
  function d3_layout_packSiblings(node) {
    if (!(nodes = node.children) || !(n = nodes.length)) return;
    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
    function bound(node) {
      xMin = Math.min(node.x - node.r, xMin);
      xMax = Math.max(node.x + node.r, xMax);
      yMin = Math.min(node.y - node.r, yMin);
      yMax = Math.max(node.y + node.r, yMax);
    }
    nodes.forEach(d3_layout_packLink);
    a = nodes[0];
    a.x = -a.r;
    a.y = 0;
    bound(a);
    if (n > 1) {
      b = nodes[1];
      b.x = b.r;
      b.y = 0;
      bound(b);
      if (n > 2) {
        c = nodes[2];
        d3_layout_packPlace(a, b, c);
        bound(c);
        d3_layout_packInsert(a, c);
        a._pack_prev = c;
        d3_layout_packInsert(c, b);
        b = a._pack_next;
        for (i = 3; i < n; i++) {
          d3_layout_packPlace(a, b, c = nodes[i]);
          var isect = 0, s1 = 1, s2 = 1;
          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
            if (d3_layout_packIntersects(j, c)) {
              isect = 1;
              break;
            }
          }
          if (isect == 1) {
            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
              if (d3_layout_packIntersects(k, c)) {
                break;
              }
            }
          }
          if (isect) {
            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
            i--;
          } else {
            d3_layout_packInsert(a, c);
            b = c;
            bound(c);
          }
        }
      }
    }
    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
    for (i = 0; i < n; i++) {
      c = nodes[i];
      c.x -= cx;
      c.y -= cy;
      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
    }
    node.r = cr;
    nodes.forEach(d3_layout_packUnlink);
  }
  function d3_layout_packLink(node) {
    node._pack_next = node._pack_prev = node;
  }
  function d3_layout_packUnlink(node) {
    delete node._pack_next;
    delete node._pack_prev;
  }
  function d3_layout_packTransform(node, x, y, k) {
    var children = node.children;
    node.x = x += k * node.x;
    node.y = y += k * node.y;
    node.r *= k;
    if (children) {
      var i = -1, n = children.length;
      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
    }
  }
  function d3_layout_packPlace(a, b, c) {
    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
    if (db && (dx || dy)) {
      var da = b.r + c.r, dc = dx * dx + dy * dy;
      da *= da;
      db *= db;
      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
      c.x = a.x + x * dx + y * dy;
      c.y = a.y + x * dy - y * dx;
    } else {
      c.x = a.x + db;
      c.y = a.y;
    }
  }
  d3.layout.tree = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = null;
    function tree(d, i) {
      var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
      d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
      d3_layout_hierarchyVisitBefore(root1, secondWalk);
      if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
        var left = root0, right = root0, bottom = root0;
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
          if (node.depth > bottom.depth) bottom = node;
        });
        var tx = separation(left, right) / 2 - left.x, kx = size[0] / (right.x + separation(right, left) / 2 + tx), ky = size[1] / (bottom.depth || 1);
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          node.x = (node.x + tx) * kx;
          node.y = node.depth * ky;
        });
      }
      return nodes;
    }
    function wrapTree(root0) {
      var root1 = {
        A: null,
        children: [ root0 ]
      }, queue = [ root1 ], node1;
      while ((node1 = queue.pop()) != null) {
        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
          queue.push((children[i] = child = {
            _: children[i],
            parent: node1,
            children: (child = children[i].children) && child.slice() || [],
            A: null,
            a: null,
            z: 0,
            m: 0,
            c: 0,
            s: 0,
            t: null,
            i: i
          }).a = child);
        }
      }
      return root1.children[0];
    }
    function firstWalk(v) {
      var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
      if (children.length) {
        d3_layout_treeShift(v);
        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
        if (w) {
          v.z = w.z + separation(v._, w._);
          v.m = v.z - midpoint;
        } else {
          v.z = midpoint;
        }
      } else if (w) {
        v.z = w.z + separation(v._, w._);
      }
      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
    }
    function secondWalk(v) {
      v._.x = v.z + v.parent.m;
      v.m += v.parent.m;
    }
    function apportion(v, w, ancestor) {
      if (w) {
        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
          vom = d3_layout_treeLeft(vom);
          vop = d3_layout_treeRight(vop);
          vop.a = v;
          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
            sip += shift;
            sop += shift;
          }
          sim += vim.m;
          sip += vip.m;
          som += vom.m;
          sop += vop.m;
        }
        if (vim && !d3_layout_treeRight(vop)) {
          vop.t = vim;
          vop.m += sim - sop;
        }
        if (vip && !d3_layout_treeLeft(vom)) {
          vom.t = vip;
          vom.m += sip - som;
          ancestor = v;
        }
      }
      return ancestor;
    }
    function sizeNode(node) {
      node.x *= size[0];
      node.y = node.depth * size[1];
    }
    tree.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return tree;
    };
    tree.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null ? sizeNode : null;
      return tree;
    };
    tree.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) == null ? null : sizeNode;
      return tree;
    };
    return d3_layout_hierarchyRebind(tree, hierarchy);
  };
  function d3_layout_treeSeparation(a, b) {
    return a.parent == b.parent ? 1 : 2;
  }
  function d3_layout_treeLeft(v) {
    var children = v.children;
    return children.length ? children[0] : v.t;
  }
  function d3_layout_treeRight(v) {
    var children = v.children, n;
    return (n = children.length) ? children[n - 1] : v.t;
  }
  function d3_layout_treeMove(wm, wp, shift) {
    var change = shift / (wp.i - wm.i);
    wp.c -= change;
    wp.s += shift;
    wm.c += change;
    wp.z += shift;
    wp.m += shift;
  }
  function d3_layout_treeShift(v) {
    var shift = 0, change = 0, children = v.children, i = children.length, w;
    while (--i >= 0) {
      w = children[i];
      w.z += shift;
      w.m += shift;
      shift += w.s + (change += w.c);
    }
  }
  function d3_layout_treeAncestor(vim, v, ancestor) {
    return vim.a.parent === v.parent ? vim.a : ancestor;
  }
  d3.layout.cluster = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
    function cluster(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var children = node.children;
        if (children && children.length) {
          node.x = d3_layout_clusterX(children);
          node.y = d3_layout_clusterY(children);
        } else {
          node.x = previousNode ? x += separation(node, previousNode) : 0;
          node.y = 0;
          previousNode = node;
        }
      });
      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
      d3_layout_hierarchyVisitAfter(root, nodeSize ? function(node) {
        node.x = (node.x - root.x) * size[0];
        node.y = (root.y - node.y) * size[1];
      } : function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
      });
      return nodes;
    }
    cluster.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return cluster;
    };
    cluster.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null;
      return cluster;
    };
    cluster.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) != null;
      return cluster;
    };
    return d3_layout_hierarchyRebind(cluster, hierarchy);
  };
  function d3_layout_clusterY(children) {
    return 1 + d3.max(children, function(child) {
      return child.y;
    });
  }
  function d3_layout_clusterX(children) {
    return children.reduce(function(x, child) {
      return x + child.x;
    }, 0) / children.length;
  }
  function d3_layout_clusterLeft(node) {
    var children = node.children;
    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
  }
  function d3_layout_clusterRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
  }
  d3.layout.treemap = function() {
    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
    function scale(children, k) {
      var i = -1, n = children.length, child, area;
      while (++i < n) {
        area = (child = children[i]).value * (k < 0 ? 0 : k);
        child.area = isNaN(area) || area <= 0 ? 0 : area;
      }
    }
    function squarify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while ((n = remaining.length) > 0) {
          row.push(child = remaining[n - 1]);
          row.area += child.area;
          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
            remaining.pop();
            best = score;
          } else {
            row.area -= row.pop().area;
            position(row, u, rect, false);
            u = Math.min(rect.dx, rect.dy);
            row.length = row.area = 0;
            best = Infinity;
          }
        }
        if (row.length) {
          position(row, u, rect, true);
          row.length = row.area = 0;
        }
        children.forEach(squarify);
      }
    }
    function stickify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), remaining = children.slice(), child, row = [];
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while (child = remaining.pop()) {
          row.push(child);
          row.area += child.area;
          if (child.z != null) {
            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
            row.length = row.area = 0;
          }
        }
        children.forEach(stickify);
      }
    }
    function worst(row, u) {
      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
      while (++i < n) {
        if (!(r = row[i].area)) continue;
        if (r < rmin) rmin = r;
        if (r > rmax) rmax = r;
      }
      s *= s;
      u *= u;
      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
    }
    function position(row, u, rect, flush) {
      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
      if (u == rect.dx) {
        if (flush || v > rect.dy) v = rect.dy;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dy = v;
          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
        }
        o.z = true;
        o.dx += rect.x + rect.dx - x;
        rect.y += v;
        rect.dy -= v;
      } else {
        if (flush || v > rect.dx) v = rect.dx;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dx = v;
          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
        }
        o.z = false;
        o.dy += rect.y + rect.dy - y;
        rect.x += v;
        rect.dx -= v;
      }
    }
    function treemap(d) {
      var nodes = stickies || hierarchy(d), root = nodes[0];
      root.x = 0;
      root.y = 0;
      root.dx = size[0];
      root.dy = size[1];
      if (stickies) hierarchy.revalue(root);
      scale([ root ], root.dx * root.dy / root.value);
      (stickies ? stickify : squarify)(root);
      if (sticky) stickies = nodes;
      return nodes;
    }
    treemap.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return treemap;
    };
    treemap.padding = function(x) {
      if (!arguments.length) return padding;
      function padFunction(node) {
        var p = x.call(treemap, node, node.depth);
        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
      }
      function padConstant(node) {
        return d3_layout_treemapPad(node, x);
      }
      var type;
      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
      padConstant) : padConstant;
      return treemap;
    };
    treemap.round = function(x) {
      if (!arguments.length) return round != Number;
      round = x ? Math.round : Number;
      return treemap;
    };
    treemap.sticky = function(x) {
      if (!arguments.length) return sticky;
      sticky = x;
      stickies = null;
      return treemap;
    };
    treemap.ratio = function(x) {
      if (!arguments.length) return ratio;
      ratio = x;
      return treemap;
    };
    treemap.mode = function(x) {
      if (!arguments.length) return mode;
      mode = x + "";
      return treemap;
    };
    return d3_layout_hierarchyRebind(treemap, hierarchy);
  };
  function d3_layout_treemapPadNull(node) {
    return {
      x: node.x,
      y: node.y,
      dx: node.dx,
      dy: node.dy
    };
  }
  function d3_layout_treemapPad(node, padding) {
    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
    if (dx < 0) {
      x += dx / 2;
      dx = 0;
    }
    if (dy < 0) {
      y += dy / 2;
      dy = 0;
    }
    return {
      x: x,
      y: y,
      dx: dx,
      dy: dy
    };
  }
  d3.random = {
    normal: function(??, ??) {
      var n = arguments.length;
      if (n < 2) ?? = 1;
      if (n < 1) ?? = 0;
      return function() {
        var x, y, r;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          r = x * x + y * y;
        } while (!r || r > 1);
        return ?? + ?? * x * Math.sqrt(-2 * Math.log(r) / r);
      };
    },
    logNormal: function() {
      var random = d3.random.normal.apply(d3, arguments);
      return function() {
        return Math.exp(random());
      };
    },
    bates: function(m) {
      var random = d3.random.irwinHall(m);
      return function() {
        return random() / m;
      };
    },
    irwinHall: function(m) {
      return function() {
        for (var s = 0, j = 0; j < m; j++) s += Math.random();
        return s;
      };
    }
  };
  d3.scale = {};
  function d3_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }
  function d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
  }
  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
    return function(x) {
      return i(u(x));
    };
  }
  function d3_scale_nice(domain, nice) {
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
    if (x1 < x0) {
      dx = i0, i0 = i1, i1 = dx;
      dx = x0, x0 = x1, x1 = dx;
    }
    domain[i0] = nice.floor(x0);
    domain[i1] = nice.ceil(x1);
    return domain;
  }
  function d3_scale_niceStep(step) {
    return step ? {
      floor: function(x) {
        return Math.floor(x / step) * step;
      },
      ceil: function(x) {
        return Math.ceil(x / step) * step;
      }
    } : d3_scale_niceIdentity;
  }
  var d3_scale_niceIdentity = {
    floor: d3_identity,
    ceil: d3_identity
  };
  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
    if (domain[k] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++j <= k) {
      u.push(uninterpolate(domain[j - 1], domain[j]));
      i.push(interpolate(range[j - 1], range[j]));
    }
    return function(x) {
      var j = d3.bisect(domain, x, 1, k) - 1;
      return i[j](u[j](x));
    };
  }
  d3.scale.linear = function() {
    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
  };
  function d3_scale_linear(domain, range, interpolate, clamp) {
    var output, input;
    function rescale() {
      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
      output = linear(domain, range, uninterpolate, interpolate);
      input = linear(range, domain, uninterpolate, d3_interpolate);
      return scale;
    }
    function scale(x) {
      return output(x);
    }
    scale.invert = function(y) {
      return input(y);
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(Number);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.rangeRound = function(x) {
      return scale.range(x).interpolate(d3_interpolateRound);
    };
    scale.clamp = function(x) {
      if (!arguments.length) return clamp;
      clamp = x;
      return rescale();
    };
    scale.interpolate = function(x) {
      if (!arguments.length) return interpolate;
      interpolate = x;
      return rescale();
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      d3_scale_linearNice(domain, m);
      return rescale();
    };
    scale.copy = function() {
      return d3_scale_linear(domain, range, interpolate, clamp);
    };
    return rescale();
  }
  function d3_scale_linearRebind(scale, linear) {
    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
  }
  function d3_scale_linearNice(domain, m) {
    return d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
  }
  function d3_scale_linearTickRange(domain, m) {
    if (m == null) m = 10;
    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
    extent[0] = Math.ceil(extent[0] / step) * step;
    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
    extent[2] = step;
    return extent;
  }
  function d3_scale_linearTicks(domain, m) {
    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
  }
  function d3_scale_linearTickFormat(domain, m, format) {
    var range = d3_scale_linearTickRange(domain, m);
    if (format) {
      var match = d3_format_re.exec(format);
      match.shift();
      if (match[8] === "s") {
        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
        match[8] = "f";
        format = d3.format(match.join(""));
        return function(d) {
          return format(prefix.scale(d)) + prefix.symbol;
        };
      }
      if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
      format = match.join("");
    } else {
      format = ",." + d3_scale_linearPrecision(range[2]) + "f";
    }
    return d3.format(format);
  }
  var d3_scale_linearFormatSignificant = {
    s: 1,
    g: 1,
    p: 1,
    r: 1,
    e: 1
  };
  function d3_scale_linearPrecision(value) {
    return -Math.floor(Math.log(value) / Math.LN10 + .01);
  }
  function d3_scale_linearFormatPrecision(type, range) {
    var p = d3_scale_linearPrecision(range[2]);
    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
  }
  d3.scale.log = function() {
    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
  };
  function d3_scale_log(linear, base, positive, domain) {
    function log(x) {
      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
    }
    function pow(x) {
      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
    }
    function scale(x) {
      return linear(log(x));
    }
    scale.invert = function(x) {
      return pow(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      positive = x[0] >= 0;
      linear.domain((domain = x.map(Number)).map(log));
      return scale;
    };
    scale.base = function(_) {
      if (!arguments.length) return base;
      base = +_;
      linear.domain(domain.map(log));
      return scale;
    };
    scale.nice = function() {
      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
      linear.domain(niced);
      domain = niced.map(pow);
      return scale;
    };
    scale.ticks = function() {
      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
      if (isFinite(j - i)) {
        if (positive) {
          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
          ticks.push(pow(i));
        } else {
          ticks.push(pow(i));
          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
        }
        for (i = 0; ticks[i] < u; i++) {}
        for (j = ticks.length; ticks[j - 1] > v; j--) {}
        ticks = ticks.slice(i, j);
      }
      return ticks;
    };
    scale.tickFormat = function(n, format) {
      if (!arguments.length) return d3_scale_logFormat;
      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
      var k = Math.max(.1, n / scale.ticks().length), f = positive ? (e = 1e-12, Math.ceil) : (e = -1e-12, 
      Math.floor), e;
      return function(d) {
        return d / pow(f(log(d) + e)) <= k ? format(d) : "";
      };
    };
    scale.copy = function() {
      return d3_scale_log(linear.copy(), base, positive, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
    floor: function(x) {
      return -Math.ceil(-x);
    },
    ceil: function(x) {
      return -Math.floor(-x);
    }
  };
  d3.scale.pow = function() {
    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
  };
  function d3_scale_pow(linear, exponent, domain) {
    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
    function scale(x) {
      return linear(powp(x));
    }
    scale.invert = function(x) {
      return powb(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      linear.domain((domain = x.map(Number)).map(powp));
      return scale;
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      return scale.domain(d3_scale_linearNice(domain, m));
    };
    scale.exponent = function(x) {
      if (!arguments.length) return exponent;
      powp = d3_scale_powPow(exponent = x);
      powb = d3_scale_powPow(1 / exponent);
      linear.domain(domain.map(powp));
      return scale;
    };
    scale.copy = function() {
      return d3_scale_pow(linear.copy(), exponent, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_scale_powPow(e) {
    return function(x) {
      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
    };
  }
  d3.scale.sqrt = function() {
    return d3.scale.pow().exponent(.5);
  };
  d3.scale.ordinal = function() {
    return d3_scale_ordinal([], {
      t: "range",
      a: [ [] ]
    });
  };
  function d3_scale_ordinal(domain, ranger) {
    var index, range, rangeBand;
    function scale(x) {
      return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
    }
    function steps(start, step) {
      return d3.range(domain.length).map(function(i) {
        return start + step * i;
      });
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = [];
      index = new d3_Map();
      var i = -1, n = x.length, xi;
      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
      return scale[ranger.t].apply(scale, ranger.a);
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      rangeBand = 0;
      ranger = {
        t: "range",
        a: arguments
      };
      return scale;
    };
    scale.rangePoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = (start + stop) / 2, 
      0) : (stop - start) / (domain.length - 1 + padding);
      range = steps(start + step * padding / 2, step);
      rangeBand = 0;
      ranger = {
        t: "rangePoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundPoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = stop = Math.round((start + stop) / 2), 
      0) : (stop - start) / (domain.length - 1 + padding) | 0;
      range = steps(start + Math.round(step * padding / 2 + (stop - start - (domain.length - 1 + padding) * step) / 2), step);
      rangeBand = 0;
      ranger = {
        t: "rangeRoundPoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
      range = steps(start + step * outerPadding, step);
      if (reverse) range.reverse();
      rangeBand = step * (1 - padding);
      ranger = {
        t: "rangeBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding));
      range = steps(start + Math.round((stop - start - (domain.length - padding) * step) / 2), step);
      if (reverse) range.reverse();
      rangeBand = Math.round(step * (1 - padding));
      ranger = {
        t: "rangeRoundBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeBand = function() {
      return rangeBand;
    };
    scale.rangeExtent = function() {
      return d3_scaleExtent(ranger.a[0]);
    };
    scale.copy = function() {
      return d3_scale_ordinal(domain, ranger);
    };
    return scale.domain(domain);
  }
  d3.scale.category10 = function() {
    return d3.scale.ordinal().range(d3_category10);
  };
  d3.scale.category20 = function() {
    return d3.scale.ordinal().range(d3_category20);
  };
  d3.scale.category20b = function() {
    return d3.scale.ordinal().range(d3_category20b);
  };
  d3.scale.category20c = function() {
    return d3.scale.ordinal().range(d3_category20c);
  };
  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
  d3.scale.quantile = function() {
    return d3_scale_quantile([], []);
  };
  function d3_scale_quantile(domain, range) {
    var thresholds;
    function rescale() {
      var k = 0, q = range.length;
      thresholds = [];
      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
      return scale;
    }
    function scale(x) {
      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(d3_number).filter(d3_numeric).sort(d3_ascending);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.quantiles = function() {
      return thresholds;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
    };
    scale.copy = function() {
      return d3_scale_quantile(domain, range);
    };
    return rescale();
  }
  d3.scale.quantize = function() {
    return d3_scale_quantize(0, 1, [ 0, 1 ]);
  };
  function d3_scale_quantize(x0, x1, range) {
    var kx, i;
    function scale(x) {
      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
    }
    function rescale() {
      kx = range.length / (x1 - x0);
      i = range.length - 1;
      return scale;
    }
    scale.domain = function(x) {
      if (!arguments.length) return [ x0, x1 ];
      x0 = +x[0];
      x1 = +x[x.length - 1];
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      y = y < 0 ? NaN : y / kx + x0;
      return [ y, y + 1 / kx ];
    };
    scale.copy = function() {
      return d3_scale_quantize(x0, x1, range);
    };
    return rescale();
  }
  d3.scale.threshold = function() {
    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
  };
  function d3_scale_threshold(domain, range) {
    function scale(x) {
      if (x <= x) return range[d3.bisect(domain, x)];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain;
      domain = _;
      return scale;
    };
    scale.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return scale;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return [ domain[y - 1], domain[y] ];
    };
    scale.copy = function() {
      return d3_scale_threshold(domain, range);
    };
    return scale;
  }
  d3.scale.identity = function() {
    return d3_scale_identity([ 0, 1 ]);
  };
  function d3_scale_identity(domain) {
    function identity(x) {
      return +x;
    }
    identity.invert = identity;
    identity.domain = identity.range = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(identity);
      return identity;
    };
    identity.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    identity.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    identity.copy = function() {
      return d3_scale_identity(domain);
    };
    return identity;
  }
  d3.svg = {};
  function d3_zero() {
    return 0;
  }
  d3.svg.arc = function() {
    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, cornerRadius = d3_zero, padRadius = d3_svg_arcAuto, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle, padAngle = d3_svg_arcPadAngle;
    function arc() {
      var r0 = Math.max(0, +innerRadius.apply(this, arguments)), r1 = Math.max(0, +outerRadius.apply(this, arguments)), a0 = startAngle.apply(this, arguments) - half??, a1 = endAngle.apply(this, arguments) - half??, da = Math.abs(a1 - a0), cw = a0 > a1 ? 0 : 1;
      if (r1 < r0) rc = r1, r1 = r0, r0 = rc;
      if (da >= ????) return circleSegment(r1, cw) + (r0 ? circleSegment(r0, 1 - cw) : "") + "Z";
      var rc, cr, rp, ap, p0 = 0, p1 = 0, x0, y0, x1, y1, x2, y2, x3, y3, path = [];
      if (ap = (+padAngle.apply(this, arguments) || 0) / 2) {
        rp = padRadius === d3_svg_arcAuto ? Math.sqrt(r0 * r0 + r1 * r1) : +padRadius.apply(this, arguments);
        if (!cw) p1 *= -1;
        if (r1) p1 = d3_asin(rp / r1 * Math.sin(ap));
        if (r0) p0 = d3_asin(rp / r0 * Math.sin(ap));
      }
      if (r1) {
        x0 = r1 * Math.cos(a0 + p1);
        y0 = r1 * Math.sin(a0 + p1);
        x1 = r1 * Math.cos(a1 - p1);
        y1 = r1 * Math.sin(a1 - p1);
        var l1 = Math.abs(a1 - a0 - 2 * p1) <= ?? ? 0 : 1;
        if (p1 && d3_svg_arcSweep(x0, y0, x1, y1) === cw ^ l1) {
          var h1 = (a0 + a1) / 2;
          x0 = r1 * Math.cos(h1);
          y0 = r1 * Math.sin(h1);
          x1 = y1 = null;
        }
      } else {
        x0 = y0 = 0;
      }
      if (r0) {
        x2 = r0 * Math.cos(a1 - p0);
        y2 = r0 * Math.sin(a1 - p0);
        x3 = r0 * Math.cos(a0 + p0);
        y3 = r0 * Math.sin(a0 + p0);
        var l0 = Math.abs(a0 - a1 + 2 * p0) <= ?? ? 0 : 1;
        if (p0 && d3_svg_arcSweep(x2, y2, x3, y3) === 1 - cw ^ l0) {
          var h0 = (a0 + a1) / 2;
          x2 = r0 * Math.cos(h0);
          y2 = r0 * Math.sin(h0);
          x3 = y3 = null;
        }
      } else {
        x2 = y2 = 0;
      }
      if ((rc = Math.min(Math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))) > .001) {
        cr = r0 < r1 ^ cw ? 0 : 1;
        var oc = x3 == null ? [ x2, y2 ] : x1 == null ? [ x0, y0 ] : d3_geom_polygonIntersect([ x0, y0 ], [ x3, y3 ], [ x1, y1 ], [ x2, y2 ]), ax = x0 - oc[0], ay = y0 - oc[1], bx = x1 - oc[0], by = y1 - oc[1], kc = 1 / Math.sin(Math.acos((ax * bx + ay * by) / (Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by))) / 2), lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
        if (x1 != null) {
          var rc1 = Math.min(rc, (r1 - lc) / (kc + 1)), t30 = d3_svg_arcCornerTangents(x3 == null ? [ x2, y2 ] : [ x3, y3 ], [ x0, y0 ], r1, rc1, cw), t12 = d3_svg_arcCornerTangents([ x1, y1 ], [ x2, y2 ], r1, rc1, cw);
          if (rc === rc1) {
            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 0,", cr, " ", t30[1], "A", r1, ",", r1, " 0 ", 1 - cw ^ d3_svg_arcSweep(t30[1][0], t30[1][1], t12[1][0], t12[1][1]), ",", cw, " ", t12[1], "A", rc1, ",", rc1, " 0 0,", cr, " ", t12[0]);
          } else {
            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 1,", cr, " ", t12[0]);
          }
        } else {
          path.push("M", x0, ",", y0);
        }
        if (x3 != null) {
          var rc0 = Math.min(rc, (r0 - lc) / (kc - 1)), t03 = d3_svg_arcCornerTangents([ x0, y0 ], [ x3, y3 ], r0, -rc0, cw), t21 = d3_svg_arcCornerTangents([ x2, y2 ], x1 == null ? [ x0, y0 ] : [ x1, y1 ], r0, -rc0, cw);
          if (rc === rc0) {
            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t21[1], "A", r0, ",", r0, " 0 ", cw ^ d3_svg_arcSweep(t21[1][0], t21[1][1], t03[1][0], t03[1][1]), ",", 1 - cw, " ", t03[1], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
          } else {
            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
          }
        } else {
          path.push("L", x2, ",", y2);
        }
      } else {
        path.push("M", x0, ",", y0);
        if (x1 != null) path.push("A", r1, ",", r1, " 0 ", l1, ",", cw, " ", x1, ",", y1);
        path.push("L", x2, ",", y2);
        if (x3 != null) path.push("A", r0, ",", r0, " 0 ", l0, ",", 1 - cw, " ", x3, ",", y3);
      }
      path.push("Z");
      return path.join("");
    }
    function circleSegment(r1, cw) {
      return "M0," + r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + -r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + r1;
    }
    arc.innerRadius = function(v) {
      if (!arguments.length) return innerRadius;
      innerRadius = d3_functor(v);
      return arc;
    };
    arc.outerRadius = function(v) {
      if (!arguments.length) return outerRadius;
      outerRadius = d3_functor(v);
      return arc;
    };
    arc.cornerRadius = function(v) {
      if (!arguments.length) return cornerRadius;
      cornerRadius = d3_functor(v);
      return arc;
    };
    arc.padRadius = function(v) {
      if (!arguments.length) return padRadius;
      padRadius = v == d3_svg_arcAuto ? d3_svg_arcAuto : d3_functor(v);
      return arc;
    };
    arc.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return arc;
    };
    arc.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return arc;
    };
    arc.padAngle = function(v) {
      if (!arguments.length) return padAngle;
      padAngle = d3_functor(v);
      return arc;
    };
    arc.centroid = function() {
      var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - half??;
      return [ Math.cos(a) * r, Math.sin(a) * r ];
    };
    return arc;
  };
  var d3_svg_arcAuto = "auto";
  function d3_svg_arcInnerRadius(d) {
    return d.innerRadius;
  }
  function d3_svg_arcOuterRadius(d) {
    return d.outerRadius;
  }
  function d3_svg_arcStartAngle(d) {
    return d.startAngle;
  }
  function d3_svg_arcEndAngle(d) {
    return d.endAngle;
  }
  function d3_svg_arcPadAngle(d) {
    return d && d.padAngle;
  }
  function d3_svg_arcSweep(x0, y0, x1, y1) {
    return (x0 - x1) * y0 - (y0 - y1) * x0 > 0 ? 0 : 1;
  }
  function d3_svg_arcCornerTangents(p0, p1, r1, rc, cw) {
    var x01 = p0[0] - p1[0], y01 = p0[1] - p1[1], lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x1 = p0[0] + ox, y1 = p0[1] + oy, x2 = p1[0] + ox, y2 = p1[1] + oy, x3 = (x1 + x2) / 2, y3 = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy, r = r1 - rc, D = x1 * y2 - x2 * y1, d = (dy < 0 ? -1 : 1) * Math.sqrt(r * r * d2 - D * D), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x3, dy0 = cy0 - y3, dx1 = cx1 - x3, dy1 = cy1 - y3;
    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
    return [ [ cx0 - ox, cy0 - oy ], [ cx0 * r1 / r, cy0 * r1 / r ] ];
  }
  function d3_svg_line(projection) {
    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
    function line(data) {
      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
      function segment() {
        segments.push("M", interpolate(projection(points), tension));
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
        } else if (points.length) {
          segment();
          points = [];
        }
      }
      if (points.length) segment();
      return segments.length ? segments.join("") : null;
    }
    line.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return line;
    };
    line.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return line;
    };
    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return line;
    };
    line.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      return line;
    };
    line.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return line;
    };
    return line;
  }
  d3.svg.line = function() {
    return d3_svg_line(d3_identity);
  };
  var d3_svg_lineInterpolators = d3.map({
    linear: d3_svg_lineLinear,
    "linear-closed": d3_svg_lineLinearClosed,
    step: d3_svg_lineStep,
    "step-before": d3_svg_lineStepBefore,
    "step-after": d3_svg_lineStepAfter,
    basis: d3_svg_lineBasis,
    "basis-open": d3_svg_lineBasisOpen,
    "basis-closed": d3_svg_lineBasisClosed,
    bundle: d3_svg_lineBundle,
    cardinal: d3_svg_lineCardinal,
    "cardinal-open": d3_svg_lineCardinalOpen,
    "cardinal-closed": d3_svg_lineCardinalClosed,
    monotone: d3_svg_lineMonotone
  });
  d3_svg_lineInterpolators.forEach(function(key, value) {
    value.key = key;
    value.closed = /-closed$/.test(key);
  });
  function d3_svg_lineLinear(points) {
    return points.join("L");
  }
  function d3_svg_lineLinearClosed(points) {
    return d3_svg_lineLinear(points) + "Z";
  }
  function d3_svg_lineStep(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
    if (n > 1) path.push("H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepBefore(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepAfter(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
    return path.join("");
  }
  function d3_svg_lineCardinalOpen(points, tension) {
    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, -1), d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineCardinalClosed(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
  }
  function d3_svg_lineCardinal(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineHermite(points, tangents) {
    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
      return d3_svg_lineLinear(points);
    }
    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
    if (quad) {
      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
      p0 = points[1];
      pi = 2;
    }
    if (tangents.length > 1) {
      t = tangents[1];
      p = points[pi];
      pi++;
      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      for (var i = 2; i < tangents.length; i++, pi++) {
        p = points[pi];
        t = tangents[i];
        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      }
    }
    if (quad) {
      var lp = points[pi];
      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
    }
    return path;
  }
  function d3_svg_lineCardinalTangents(points, tension) {
    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
    while (++i < n) {
      p0 = p1;
      p1 = p2;
      p2 = points[i];
      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
    }
    return tangents;
  }
  function d3_svg_lineBasis(points) {
    if (points.length < 3) return d3_svg_lineLinear(points);
    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    points.push(points[n - 1]);
    while (++i <= n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    points.pop();
    path.push("L", pi);
    return path.join("");
  }
  function d3_svg_lineBasisOpen(points) {
    if (points.length < 4) return d3_svg_lineLinear(points);
    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
    while (++i < 3) {
      pi = points[i];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
    --i;
    while (++i < n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBasisClosed(points) {
    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
    while (++i < 4) {
      pi = points[i % n];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    --i;
    while (++i < m) {
      pi = points[i % n];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBundle(points, tension) {
    var n = points.length - 1;
    if (n) {
      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
      while (++i <= n) {
        p = points[i];
        t = i / n;
        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
      }
    }
    return d3_svg_lineBasis(points);
  }
  function d3_svg_lineDot4(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  }
  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
  function d3_svg_lineBasisBezier(path, x, y) {
    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
  }
  function d3_svg_lineSlope(p0, p1) {
    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
  }
  function d3_svg_lineFiniteDifferences(points) {
    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
    while (++i < j) {
      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
    }
    m[i] = d;
    return m;
  }
  function d3_svg_lineMonotoneTangents(points) {
    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
    while (++i < j) {
      d = d3_svg_lineSlope(points[i], points[i + 1]);
      if (abs(d) < ??) {
        m[i] = m[i + 1] = 0;
      } else {
        a = m[i] / d;
        b = m[i + 1] / d;
        s = a * a + b * b;
        if (s > 9) {
          s = d * 3 / Math.sqrt(s);
          m[i] = s * a;
          m[i + 1] = s * b;
        }
      }
    }
    i = -1;
    while (++i <= j) {
      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
      tangents.push([ s || 0, m[i] * s || 0 ]);
    }
    return tangents;
  }
  function d3_svg_lineMonotone(points) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
  }
  d3.svg.line.radial = function() {
    var line = d3_svg_line(d3_svg_lineRadial);
    line.radius = line.x, delete line.x;
    line.angle = line.y, delete line.y;
    return line;
  };
  function d3_svg_lineRadial(points) {
    var point, i = -1, n = points.length, r, a;
    while (++i < n) {
      point = points[i];
      r = point[0];
      a = point[1] - half??;
      point[0] = r * Math.cos(a);
      point[1] = r * Math.sin(a);
    }
    return points;
  }
  function d3_svg_area(projection) {
    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
    function area(data) {
      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
        return x;
      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
        return y;
      } : d3_functor(y1), x, y;
      function segment() {
        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
        } else if (points0.length) {
          segment();
          points0 = [];
          points1 = [];
        }
      }
      if (points0.length) segment();
      return segments.length ? segments.join("") : null;
    }
    area.x = function(_) {
      if (!arguments.length) return x1;
      x0 = x1 = _;
      return area;
    };
    area.x0 = function(_) {
      if (!arguments.length) return x0;
      x0 = _;
      return area;
    };
    area.x1 = function(_) {
      if (!arguments.length) return x1;
      x1 = _;
      return area;
    };
    area.y = function(_) {
      if (!arguments.length) return y1;
      y0 = y1 = _;
      return area;
    };
    area.y0 = function(_) {
      if (!arguments.length) return y0;
      y0 = _;
      return area;
    };
    area.y1 = function(_) {
      if (!arguments.length) return y1;
      y1 = _;
      return area;
    };
    area.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return area;
    };
    area.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      interpolateReverse = interpolate.reverse || interpolate;
      L = interpolate.closed ? "M" : "L";
      return area;
    };
    area.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return area;
    };
    return area;
  }
  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
  d3.svg.area = function() {
    return d3_svg_area(d3_identity);
  };
  d3.svg.area.radial = function() {
    var area = d3_svg_area(d3_svg_lineRadial);
    area.radius = area.x, delete area.x;
    area.innerRadius = area.x0, delete area.x0;
    area.outerRadius = area.x1, delete area.x1;
    area.angle = area.y, delete area.y;
    area.startAngle = area.y0, delete area.y0;
    area.endAngle = area.y1, delete area.y1;
    return area;
  };
  d3.svg.chord = function() {
    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function chord(d, i) {
      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
    }
    function subgroup(self, f, d, i) {
      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) - half??, a1 = endAngle.call(self, subgroup, i) - half??;
      return {
        r: r,
        a0: a0,
        a1: a1,
        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
      };
    }
    function equals(a, b) {
      return a.a0 == b.a0 && a.a1 == b.a1;
    }
    function arc(r, p, a) {
      return "A" + r + "," + r + " 0 " + +(a > ??) + ",1 " + p;
    }
    function curve(r0, p0, r1, p1) {
      return "Q 0,0 " + p1;
    }
    chord.radius = function(v) {
      if (!arguments.length) return radius;
      radius = d3_functor(v);
      return chord;
    };
    chord.source = function(v) {
      if (!arguments.length) return source;
      source = d3_functor(v);
      return chord;
    };
    chord.target = function(v) {
      if (!arguments.length) return target;
      target = d3_functor(v);
      return chord;
    };
    chord.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return chord;
    };
    chord.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return chord;
    };
    return chord;
  };
  function d3_svg_chordRadius(d) {
    return d.radius;
  }
  d3.svg.diagonal = function() {
    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
    function diagonal(d, i) {
      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
        x: p0.x,
        y: m
      }, {
        x: p3.x,
        y: m
      }, p3 ];
      p = p.map(projection);
      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
    }
    diagonal.source = function(x) {
      if (!arguments.length) return source;
      source = d3_functor(x);
      return diagonal;
    };
    diagonal.target = function(x) {
      if (!arguments.length) return target;
      target = d3_functor(x);
      return diagonal;
    };
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    return diagonal;
  };
  function d3_svg_diagonalProjection(d) {
    return [ d.x, d.y ];
  }
  d3.svg.diagonal.radial = function() {
    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
    diagonal.projection = function(x) {
      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
    };
    return diagonal;
  };
  function d3_svg_diagonalRadialProjection(projection) {
    return function() {
      var d = projection.apply(this, arguments), r = d[0], a = d[1] - half??;
      return [ r * Math.cos(a), r * Math.sin(a) ];
    };
  }
  d3.svg.symbol = function() {
    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
    function symbol(d, i) {
      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
    }
    symbol.type = function(x) {
      if (!arguments.length) return type;
      type = d3_functor(x);
      return symbol;
    };
    symbol.size = function(x) {
      if (!arguments.length) return size;
      size = d3_functor(x);
      return symbol;
    };
    return symbol;
  };
  function d3_svg_symbolSize() {
    return 64;
  }
  function d3_svg_symbolType() {
    return "circle";
  }
  function d3_svg_symbolCircle(size) {
    var r = Math.sqrt(size / ??);
    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
  }
  var d3_svg_symbols = d3.map({
    circle: d3_svg_symbolCircle,
    cross: function(size) {
      var r = Math.sqrt(size / 5) / 2;
      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
    },
    diamond: function(size) {
      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
    },
    square: function(size) {
      var r = Math.sqrt(size) / 2;
      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
    },
    "triangle-down": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
    },
    "triangle-up": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
    }
  });
  d3.svg.symbolTypes = d3_svg_symbols.keys();
  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
  d3_selectionPrototype.transition = function(name) {
    var id = d3_transitionInheritId || ++d3_transitionId, ns = d3_transitionNamespace(name), subgroups = [], subgroup, node, transition = d3_transitionInherit || {
      time: Date.now(),
      ease: d3_ease_cubicInOut,
      delay: 0,
      duration: 250
    };
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) d3_transitionNode(node, i, ns, id, transition);
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_selectionPrototype.interrupt = function(name) {
    return this.each(name == null ? d3_selection_interrupt : d3_selection_interruptNS(d3_transitionNamespace(name)));
  };
  var d3_selection_interrupt = d3_selection_interruptNS(d3_transitionNamespace());
  function d3_selection_interruptNS(ns) {
    return function() {
      var lock, active;
      if ((lock = this[ns]) && (active = lock[lock.active])) {
        if (--lock.count) delete lock[lock.active]; else delete this[ns];
        lock.active += .5;
        active.event && active.event.interrupt.call(this, this.__data__, active.index);
      }
    };
  }
  function d3_transition(groups, ns, id) {
    d3_subclass(groups, d3_transitionPrototype);
    groups.namespace = ns;
    groups.id = id;
    return groups;
  }
  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
  d3_transitionPrototype.call = d3_selectionPrototype.call;
  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
  d3_transitionPrototype.node = d3_selectionPrototype.node;
  d3_transitionPrototype.size = d3_selectionPrototype.size;
  d3.transition = function(selection, name) {
    return selection && selection.transition ? d3_transitionInheritId ? selection.transition(name) : selection : d3.selection().transition(selection);
  };
  d3.transition.prototype = d3_transitionPrototype;
  d3_transitionPrototype.select = function(selector) {
    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnode, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          d3_transitionNode(subnode, i, ns, id, node[ns][id]);
          subgroup.push(subnode);
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_transitionPrototype.selectAll = function(selector) {
    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnodes, node, subnode, transition;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          transition = node[ns][id];
          subnodes = selector.call(node, node.__data__, i, j);
          subgroups.push(subgroup = []);
          for (var k = -1, o = subnodes.length; ++k < o; ) {
            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, ns, id, transition);
            subgroup.push(subnode);
          }
        }
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_transitionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_transition(subgroups, this.namespace, this.id);
  };
  d3_transitionPrototype.tween = function(name, tween) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 2) return this.node()[ns][id].tween.get(name);
    return d3_selection_each(this, tween == null ? function(node) {
      node[ns][id].tween.remove(name);
    } : function(node) {
      node[ns][id].tween.set(name, tween);
    });
  };
  function d3_transition_tween(groups, name, value, tween) {
    var id = groups.id, ns = groups.namespace;
    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
      node[ns][id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
    } : (value = tween(value), function(node) {
      node[ns][id].tween.set(name, value);
    }));
  }
  d3_transitionPrototype.attr = function(nameNS, value) {
    if (arguments.length < 2) {
      for (value in nameNS) this.attr(value, nameNS[value]);
      return this;
    }
    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrTween(b) {
      return b == null ? attrNull : (b += "", function() {
        var a = this.getAttribute(name), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttribute(name, i(t));
        });
      });
    }
    function attrTweenNS(b) {
      return b == null ? attrNullNS : (b += "", function() {
        var a = this.getAttributeNS(name.space, name.local), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttributeNS(name.space, name.local, i(t));
        });
      });
    }
    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.attrTween = function(nameNS, tween) {
    var name = d3.ns.qualify(nameNS);
    function attrTween(d, i) {
      var f = tween.call(this, d, i, this.getAttribute(name));
      return f && function(t) {
        this.setAttribute(name, f(t));
      };
    }
    function attrTweenNS(d, i) {
      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
      return f && function(t) {
        this.setAttributeNS(name.space, name.local, f(t));
      };
    }
    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.style(priority, name[priority], value);
        return this;
      }
      priority = "";
    }
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleString(b) {
      return b == null ? styleNull : (b += "", function() {
        var a = d3_window(this).getComputedStyle(this, null).getPropertyValue(name), i;
        return a !== b && (i = d3_interpolate(a, b), function(t) {
          this.style.setProperty(name, i(t), priority);
        });
      });
    }
    return d3_transition_tween(this, "style." + name, value, styleString);
  };
  d3_transitionPrototype.styleTween = function(name, tween, priority) {
    if (arguments.length < 3) priority = "";
    function styleTween(d, i) {
      var f = tween.call(this, d, i, d3_window(this).getComputedStyle(this, null).getPropertyValue(name));
      return f && function(t) {
        this.style.setProperty(name, f(t), priority);
      };
    }
    return this.tween("style." + name, styleTween);
  };
  d3_transitionPrototype.text = function(value) {
    return d3_transition_tween(this, "text", value, d3_transition_text);
  };
  function d3_transition_text(b) {
    if (b == null) b = "";
    return function() {
      this.textContent = b;
    };
  }
  d3_transitionPrototype.remove = function() {
    var ns = this.namespace;
    return this.each("end.transition", function() {
      var p;
      if (this[ns].count < 2 && (p = this.parentNode)) p.removeChild(this);
    });
  };
  d3_transitionPrototype.ease = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].ease;
    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
    return d3_selection_each(this, function(node) {
      node[ns][id].ease = value;
    });
  };
  d3_transitionPrototype.delay = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].delay;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node[ns][id].delay = +value.call(node, node.__data__, i, j);
    } : (value = +value, function(node) {
      node[ns][id].delay = value;
    }));
  };
  d3_transitionPrototype.duration = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].duration;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node[ns][id].duration = Math.max(1, value.call(node, node.__data__, i, j));
    } : (value = Math.max(1, value), function(node) {
      node[ns][id].duration = value;
    }));
  };
  d3_transitionPrototype.each = function(type, listener) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 2) {
      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
      try {
        d3_transitionInheritId = id;
        d3_selection_each(this, function(node, i, j) {
          d3_transitionInherit = node[ns][id];
          type.call(node, node.__data__, i, j);
        });
      } finally {
        d3_transitionInherit = inherit;
        d3_transitionInheritId = inheritId;
      }
    } else {
      d3_selection_each(this, function(node) {
        var transition = node[ns][id];
        (transition.event || (transition.event = d3.dispatch("start", "end", "interrupt"))).on(type, listener);
      });
    }
    return this;
  };
  d3_transitionPrototype.transition = function() {
    var id0 = this.id, id1 = ++d3_transitionId, ns = this.namespace, subgroups = [], subgroup, group, node, transition;
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if (node = group[i]) {
          transition = node[ns][id0];
          d3_transitionNode(node, i, ns, id1, {
            time: transition.time,
            ease: transition.ease,
            delay: transition.delay + transition.duration,
            duration: transition.duration
          });
        }
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, ns, id1);
  };
  function d3_transitionNamespace(name) {
    return name == null ? "__transition__" : "__transition_" + name + "__";
  }
  function d3_transitionNode(node, i, ns, id, inherit) {
    var lock = node[ns] || (node[ns] = {
      active: 0,
      count: 0
    }), transition = lock[id];
    if (!transition) {
      var time = inherit.time;
      transition = lock[id] = {
        tween: new d3_Map(),
        time: time,
        delay: inherit.delay,
        duration: inherit.duration,
        ease: inherit.ease,
        index: i
      };
      inherit = null;
      ++lock.count;
      d3.timer(function(elapsed) {
        var delay = transition.delay, duration, ease, timer = d3_timer_active, tweened = [];
        timer.t = delay + time;
        if (delay <= elapsed) return start(elapsed - delay);
        timer.c = start;
        function start(elapsed) {
          if (lock.active > id) return stop();
          var active = lock[lock.active];
          if (active) {
            --lock.count;
            delete lock[lock.active];
            active.event && active.event.interrupt.call(node, node.__data__, active.index);
          }
          lock.active = id;
          transition.event && transition.event.start.call(node, node.__data__, i);
          transition.tween.forEach(function(key, value) {
            if (value = value.call(node, node.__data__, i)) {
              tweened.push(value);
            }
          });
          ease = transition.ease;
          duration = transition.duration;
          d3.timer(function() {
            timer.c = tick(elapsed || 1) ? d3_true : tick;
            return 1;
          }, 0, time);
        }
        function tick(elapsed) {
          if (lock.active !== id) return 1;
          var t = elapsed / duration, e = ease(t), n = tweened.length;
          while (n > 0) {
            tweened[--n].call(node, e);
          }
          if (t >= 1) {
            transition.event && transition.event.end.call(node, node.__data__, i);
            return stop();
          }
        }
        function stop() {
          if (--lock.count) delete lock[id]; else delete node[ns];
          return 1;
        }
      }, 0, time);
    }
  }
  d3.svg.axis = function() {
    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
    function axis(g) {
      g.each(function() {
        var g = d3.select(this);
        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ??), tickExit = d3.transition(tick.exit()).style("opacity", ??).remove(), tickUpdate = d3.transition(tick.order()).style("opacity", 1), tickSpacing = Math.max(innerTickSize, 0) + tickPadding, tickTransform;
        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
        d3.transition(path));
        tickEnter.append("line");
        tickEnter.append("text");
        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text"), sign = orient === "top" || orient === "left" ? -1 : 1, x1, x2, y1, y2;
        if (orient === "bottom" || orient === "top") {
          tickTransform = d3_svg_axisX, x1 = "x", y1 = "y", x2 = "x2", y2 = "y2";
          text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
          pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);
        } else {
          tickTransform = d3_svg_axisY, x1 = "y", y1 = "x", x2 = "y2", y2 = "x2";
          text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
          pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
        }
        lineEnter.attr(y2, sign * innerTickSize);
        textEnter.attr(y1, sign * tickSpacing);
        lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
        textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);
        if (scale1.rangeBand) {
          var x = scale1, dx = x.rangeBand() / 2;
          scale0 = scale1 = function(d) {
            return x(d) + dx;
          };
        } else if (scale0.rangeBand) {
          scale0 = scale1;
        } else {
          tickExit.call(tickTransform, scale1, scale0);
        }
        tickEnter.call(tickTransform, scale0, scale1);
        tickUpdate.call(tickTransform, scale1, scale1);
      });
    }
    axis.scale = function(x) {
      if (!arguments.length) return scale;
      scale = x;
      return axis;
    };
    axis.orient = function(x) {
      if (!arguments.length) return orient;
      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
      return axis;
    };
    axis.ticks = function() {
      if (!arguments.length) return tickArguments_;
      tickArguments_ = arguments;
      return axis;
    };
    axis.tickValues = function(x) {
      if (!arguments.length) return tickValues;
      tickValues = x;
      return axis;
    };
    axis.tickFormat = function(x) {
      if (!arguments.length) return tickFormat_;
      tickFormat_ = x;
      return axis;
    };
    axis.tickSize = function(x) {
      var n = arguments.length;
      if (!n) return innerTickSize;
      innerTickSize = +x;
      outerTickSize = +arguments[n - 1];
      return axis;
    };
    axis.innerTickSize = function(x) {
      if (!arguments.length) return innerTickSize;
      innerTickSize = +x;
      return axis;
    };
    axis.outerTickSize = function(x) {
      if (!arguments.length) return outerTickSize;
      outerTickSize = +x;
      return axis;
    };
    axis.tickPadding = function(x) {
      if (!arguments.length) return tickPadding;
      tickPadding = +x;
      return axis;
    };
    axis.tickSubdivide = function() {
      return arguments.length && axis;
    };
    return axis;
  };
  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  };
  function d3_svg_axisX(selection, x0, x1) {
    selection.attr("transform", function(d) {
      var v0 = x0(d);
      return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)";
    });
  }
  function d3_svg_axisY(selection, y0, y1) {
    selection.attr("transform", function(d) {
      var v0 = y0(d);
      return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")";
    });
  }
  d3.svg.brush = function() {
    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
    function brush(g) {
      g.each(function() {
        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
        var background = g.selectAll(".background").data([ 0 ]);
        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
        var resize = g.selectAll(".resize").data(resizes, d3_identity);
        resize.exit().remove();
        resize.enter().append("g").attr("class", function(d) {
          return "resize " + d;
        }).style("cursor", function(d) {
          return d3_svg_brushCursor[d];
        }).append("rect").attr("x", function(d) {
          return /[ew]$/.test(d) ? -3 : null;
        }).attr("y", function(d) {
          return /^[ns]/.test(d) ? -3 : null;
        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
        resize.style("display", brush.empty() ? "none" : null);
        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
        if (x) {
          range = d3_scaleRange(x);
          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
          redrawX(gUpdate);
        }
        if (y) {
          range = d3_scaleRange(y);
          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
          redrawY(gUpdate);
        }
        redraw(gUpdate);
      });
    }
    brush.event = function(g) {
      g.each(function() {
        var event_ = event.of(this, arguments), extent1 = {
          x: xExtent,
          y: yExtent,
          i: xExtentDomain,
          j: yExtentDomain
        }, extent0 = this.__chart__ || extent1;
        this.__chart__ = extent1;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.brush", function() {
            xExtentDomain = extent0.i;
            yExtentDomain = extent0.j;
            xExtent = extent0.x;
            yExtent = extent0.y;
            event_({
              type: "brushstart"
            });
          }).tween("brush:brush", function() {
            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
            xExtentDomain = yExtentDomain = null;
            return function(t) {
              xExtent = extent1.x = xi(t);
              yExtent = extent1.y = yi(t);
              event_({
                type: "brush",
                mode: "resize"
              });
            };
          }).each("end.brush", function() {
            xExtentDomain = extent1.i;
            yExtentDomain = extent1.j;
            event_({
              type: "brush",
              mode: "resize"
            });
            event_({
              type: "brushend"
            });
          });
        } else {
          event_({
            type: "brushstart"
          });
          event_({
            type: "brush",
            mode: "resize"
          });
          event_({
            type: "brushend"
          });
        }
      });
    };
    function redraw(g) {
      g.selectAll(".resize").attr("transform", function(d) {
        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
      });
    }
    function redrawX(g) {
      g.select(".extent").attr("x", xExtent[0]);
      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
    }
    function redrawY(g) {
      g.select(".extent").attr("y", yExtent[0]);
      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
    }
    function brushstart() {
      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(target), center, origin = d3.mouse(target), offset;
      var w = d3.select(d3_window(target)).on("keydown.brush", keydown).on("keyup.brush", keyup);
      if (d3.event.changedTouches) {
        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
      } else {
        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
      }
      g.interrupt().selectAll("*").interrupt();
      if (dragging) {
        origin[0] = xExtent[0] - origin[0];
        origin[1] = yExtent[0] - origin[1];
      } else if (resizing) {
        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
        origin[0] = xExtent[ex];
        origin[1] = yExtent[ey];
      } else if (d3.event.altKey) center = origin.slice();
      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
      d3.select("body").style("cursor", eventTarget.style("cursor"));
      event_({
        type: "brushstart"
      });
      brushmove();
      function keydown() {
        if (d3.event.keyCode == 32) {
          if (!dragging) {
            center = null;
            origin[0] -= xExtent[1];
            origin[1] -= yExtent[1];
            dragging = 2;
          }
          d3_eventPreventDefault();
        }
      }
      function keyup() {
        if (d3.event.keyCode == 32 && dragging == 2) {
          origin[0] += xExtent[1];
          origin[1] += yExtent[1];
          dragging = 0;
          d3_eventPreventDefault();
        }
      }
      function brushmove() {
        var point = d3.mouse(target), moved = false;
        if (offset) {
          point[0] += offset[0];
          point[1] += offset[1];
        }
        if (!dragging) {
          if (d3.event.altKey) {
            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
            origin[0] = xExtent[+(point[0] < center[0])];
            origin[1] = yExtent[+(point[1] < center[1])];
          } else center = null;
        }
        if (resizingX && move1(point, x, 0)) {
          redrawX(g);
          moved = true;
        }
        if (resizingY && move1(point, y, 1)) {
          redrawY(g);
          moved = true;
        }
        if (moved) {
          redraw(g);
          event_({
            type: "brush",
            mode: dragging ? "move" : "resize"
          });
        }
      }
      function move1(point, scale, i) {
        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
        if (dragging) {
          r0 -= position;
          r1 -= size + position;
        }
        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
        if (dragging) {
          max = (min += position) + size;
        } else {
          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
          if (position < min) {
            max = min;
            min = position;
          } else {
            max = position;
          }
        }
        if (extent[0] != min || extent[1] != max) {
          if (i) yExtentDomain = null; else xExtentDomain = null;
          extent[0] = min;
          extent[1] = max;
          return true;
        }
      }
      function brushend() {
        brushmove();
        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
        d3.select("body").style("cursor", null);
        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
        dragRestore();
        event_({
          type: "brushend"
        });
      }
    }
    brush.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.clamp = function(z) {
      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
      return brush;
    };
    brush.extent = function(z) {
      var x0, x1, y0, y1, t;
      if (!arguments.length) {
        if (x) {
          if (xExtentDomain) {
            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
          } else {
            x0 = xExtent[0], x1 = xExtent[1];
            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
            if (x1 < x0) t = x0, x0 = x1, x1 = t;
          }
        }
        if (y) {
          if (yExtentDomain) {
            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
          } else {
            y0 = yExtent[0], y1 = yExtent[1];
            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
            if (y1 < y0) t = y0, y0 = y1, y1 = t;
          }
        }
        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
      }
      if (x) {
        x0 = z[0], x1 = z[1];
        if (y) x0 = x0[0], x1 = x1[0];
        xExtentDomain = [ x0, x1 ];
        if (x.invert) x0 = x(x0), x1 = x(x1);
        if (x1 < x0) t = x0, x0 = x1, x1 = t;
        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
      }
      if (y) {
        y0 = z[0], y1 = z[1];
        if (x) y0 = y0[1], y1 = y1[1];
        yExtentDomain = [ y0, y1 ];
        if (y.invert) y0 = y(y0), y1 = y(y1);
        if (y1 < y0) t = y0, y0 = y1, y1 = t;
        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
      }
      return brush;
    };
    brush.clear = function() {
      if (!brush.empty()) {
        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
        xExtentDomain = yExtentDomain = null;
      }
      return brush;
    };
    brush.empty = function() {
      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
    };
    return d3.rebind(brush, event, "on");
  };
  var d3_svg_brushCursor = {
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };
  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
  var d3_time_formatUtc = d3_time_format.utc;
  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
  function d3_time_formatIsoNative(date) {
    return date.toISOString();
  }
  d3_time_formatIsoNative.parse = function(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  };
  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
  d3_time.second = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 1e3) * 1e3);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
  }, function(date) {
    return date.getSeconds();
  });
  d3_time.seconds = d3_time.second.range;
  d3_time.seconds.utc = d3_time.second.utc.range;
  d3_time.minute = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 6e4) * 6e4);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
  }, function(date) {
    return date.getMinutes();
  });
  d3_time.minutes = d3_time.minute.range;
  d3_time.minutes.utc = d3_time.minute.utc.range;
  d3_time.hour = d3_time_interval(function(date) {
    var timezone = date.getTimezoneOffset() / 60;
    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
  }, function(date) {
    return date.getHours();
  });
  d3_time.hours = d3_time.hour.range;
  d3_time.hours.utc = d3_time.hour.utc.range;
  d3_time.month = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setDate(1);
    return date;
  }, function(date, offset) {
    date.setMonth(date.getMonth() + offset);
  }, function(date) {
    return date.getMonth();
  });
  d3_time.months = d3_time.month.range;
  d3_time.months.utc = d3_time.month.utc.range;
  function d3_time_scale(linear, methods, format) {
    function scale(x) {
      return linear(x);
    }
    scale.invert = function(x) {
      return d3_time_scaleDate(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
      linear.domain(x);
      return scale;
    };
    function tickMethod(extent, count) {
      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
        return d / 31536e6;
      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
    }
    scale.nice = function(interval, skip) {
      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
      if (method) interval = method[0], skip = method[1];
      function skipped(date) {
        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
      }
      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
        floor: function(date) {
          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
          return date;
        },
        ceil: function(date) {
          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
          return date;
        }
      } : interval));
    };
    scale.ticks = function(interval, skip) {
      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
        range: interval
      }, skip ];
      if (method) interval = method[0], skip = method[1];
      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
    };
    scale.tickFormat = function() {
      return format;
    };
    scale.copy = function() {
      return d3_time_scale(linear.copy(), methods, format);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_time_scaleDate(t) {
    return new Date(t);
  }
  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
    return d.getMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getMinutes();
  } ], [ "%I %p", function(d) {
    return d.getHours();
  } ], [ "%a %d", function(d) {
    return d.getDay() && d.getDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getDate() != 1;
  } ], [ "%B", function(d) {
    return d.getMonth();
  } ], [ "%Y", d3_true ] ]);
  var d3_time_scaleMilliseconds = {
    range: function(start, stop, step) {
      return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
    },
    floor: d3_identity,
    ceil: d3_identity
  };
  d3_time_scaleLocalMethods.year = d3_time.year;
  d3_time.scale = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
  };
  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
    return [ m[0].utc, m[1] ];
  });
  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
    return d.getUTCMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getUTCSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getUTCMinutes();
  } ], [ "%I %p", function(d) {
    return d.getUTCHours();
  } ], [ "%a %d", function(d) {
    return d.getUTCDay() && d.getUTCDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getUTCDate() != 1;
  } ], [ "%B", function(d) {
    return d.getUTCMonth();
  } ], [ "%Y", d3_true ] ]);
  d3_time_scaleUtcMethods.year = d3_time.year.utc;
  d3_time.scale.utc = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
  };
  d3.text = d3_xhrType(function(request) {
    return request.responseText;
  });
  d3.json = function(url, callback) {
    return d3_xhr(url, "application/json", d3_json, callback);
  };
  function d3_json(request) {
    return JSON.parse(request.responseText);
  }
  d3.html = function(url, callback) {
    return d3_xhr(url, "text/html", d3_html, callback);
  };
  function d3_html(request) {
    var range = d3_document.createRange();
    range.selectNode(d3_document.body);
    return range.createContextualFragment(request.responseText);
  }
  d3.xml = d3_xhrType(function(request) {
    return request.responseXML;
  });
  if (typeof define === "function" && define.amd) define(d3); else if (typeof module === "object" && module.exports) module.exports = d3;
  this.d3 = d3;
}();!function t(e,r,n){function a(i,s){if(!r[i]){if(!e[i]){var l="function"==typeof require&&require;if(!s&&l)return l(i,!0);if(o)return o(i,!0);var u=new Error("Cannot find module '"+i+"'");throw u.code="MODULE_NOT_FOUND",u}var c=r[i]={exports:{}};e[i][0].call(c.exports,function(t){var r=e[i][1][t];return a(r?r:t)},c,c.exports,t,e,r,n)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<n.length;i++)a(n[i]);return a}({1:[function(e,t,r){function n(e){return this instanceof n?(this.length=0,this.parent=void 0,"number"==typeof e?a(this,e):"string"==typeof e?o(this,e,arguments.length>1?arguments[1]:"utf8"):i(this,e)):arguments.length>1?new n(e,arguments[1]):new n(e)}function a(e,t){if(e=d(e,0>t?0:0|p(t)),!n.TYPED_ARRAY_SUPPORT)for(var r=0;t>r;r++)e[r]=0;return e}function o(e,t,r){("string"!=typeof r||""===r)&&(r="utf8");var n=0|v(t,r);return e=d(e,n),e.write(t,r),e}function i(e,t){if(n.isBuffer(t))return s(e,t);if(X(t))return l(e,t);if(null==t)throw new TypeError("must start with number, buffer, array or string");return"undefined"!=typeof ArrayBuffer&&t.buffer instanceof ArrayBuffer?u(e,t):t.length?c(e,t):f(e,t)}function s(e,t){var r=0|p(t.length);return e=d(e,r),t.copy(e,0,0,r),e}function l(e,t){var r=0|p(t.length);e=d(e,r);for(var n=0;r>n;n+=1)e[n]=255&t[n];return e}function u(e,t){var r=0|p(t.length);e=d(e,r);for(var n=0;r>n;n+=1)e[n]=255&t[n];return e}function c(e,t){var r=0|p(t.length);e=d(e,r);for(var n=0;r>n;n+=1)e[n]=255&t[n];return e}function f(e,t){var r,n=0;"Buffer"===t.type&&X(t.data)&&(r=t.data,n=0|p(r.length)),e=d(e,n);for(var a=0;n>a;a+=1)e[a]=255&r[a];return e}function d(e,t){n.TYPED_ARRAY_SUPPORT?e=n._augment(new Uint8Array(t)):(e.length=t,e._isBuffer=!0);var r=0!==t&&t<=n.poolSize>>>1;return r&&(e.parent=J),e}function p(e){if(e>=G)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+G.toString(16)+" bytes");return 0|e}function h(e,t){if(!(this instanceof h))return new h(e,t);var r=new n(e,t);return delete r.parent,r}function v(e,t){if("string"!=typeof e&&(e=String(e)),0===e.length)return 0;switch(t||"utf8"){case"ascii":case"binary":case"raw":return e.length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*e.length;case"hex":return e.length>>>1;case"utf8":case"utf-8":return q(e).length;case"base64":return U(e).length;default:return e.length}}function g(e,t,r,n){r=Number(r)||0;var a=e.length-r;n?(n=Number(n),n>a&&(n=a)):n=a;var o=t.length;if(o%2!==0)throw new Error("Invalid hex string");n>o/2&&(n=o/2);for(var i=0;n>i;i++){var s=parseInt(t.substr(2*i,2),16);if(isNaN(s))throw new Error("Invalid hex string");e[r+i]=s}return i}function m(e,t,r,n){return V(q(t,e.length-r),e,r,n)}function y(e,t,r,n){return V(D(t),e,r,n)}function x(e,t,r,n){return y(e,t,r,n)}function b(e,t,r,n){return V(U(t),e,r,n)}function w(e,t,r,n){return V(R(t,e.length-r),e,r,n)}function _(e,t,r){return Y.fromByteArray(0===t&&r===e.length?e:e.slice(t,r))}function k(e,t,r){var n="",a="";r=Math.min(e.length,r);for(var o=t;r>o;o++)e[o]<=127?(n+=L(a)+String.fromCharCode(e[o]),a=""):a+="%"+e[o].toString(16);return n+L(a)}function z(e,t,r){var n="";r=Math.min(e.length,r);for(var a=t;r>a;a++)n+=String.fromCharCode(127&e[a]);return n}function A(e,t,r){var n="";r=Math.min(e.length,r);for(var a=t;r>a;a++)n+=String.fromCharCode(e[a]);return n}function j(e,t,r){var n=e.length;(!t||0>t)&&(t=0),(!r||0>r||r>n)&&(r=n);for(var a="",o=t;r>o;o++)a+=P(e[o]);return a}function M(e,t,r){for(var n=e.slice(t,r),a="",o=0;o<n.length;o+=2)a+=String.fromCharCode(n[o]+256*n[o+1]);return a}function E(e,t,r){if(e%1!==0||0>e)throw new RangeError("offset is not uint");if(e+t>r)throw new RangeError("Trying to access beyond buffer length")}function O(e,t,r,a,o,i){if(!n.isBuffer(e))throw new TypeError("buffer must be a Buffer instance");if(t>o||i>t)throw new RangeError("value is out of bounds");if(r+a>e.length)throw new RangeError("index out of range")}function S(e,t,r,n){0>t&&(t=65535+t+1);for(var a=0,o=Math.min(e.length-r,2);o>a;a++)e[r+a]=(t&255<<8*(n?a:1-a))>>>8*(n?a:1-a)}function F(e,t,r,n){0>t&&(t=4294967295+t+1);for(var a=0,o=Math.min(e.length-r,4);o>a;a++)e[r+a]=t>>>8*(n?a:3-a)&255}function T(e,t,r,n,a,o){if(t>a||o>t)throw new RangeError("value is out of bounds");if(r+n>e.length)throw new RangeError("index out of range");if(0>r)throw new RangeError("index out of range")}function B(e,t,r,n,a){return a||T(e,t,r,4,3.4028234663852886e38,-3.4028234663852886e38),H.write(e,t,r,n,23,4),r+4}function C(e,t,r,n,a){return a||T(e,t,r,8,1.7976931348623157e308,-1.7976931348623157e308),H.write(e,t,r,n,52,8),r+8}function I(e){if(e=N(e).replace(Q,""),e.length<2)return"";for(;e.length%4!==0;)e+="=";return e}function N(e){return e.trim?e.trim():e.replace(/^\s+|\s+$/g,"")}function P(e){return 16>e?"0"+e.toString(16):e.toString(16)}function q(e,t){t=t||1/0;for(var r,n=e.length,a=null,o=[],i=0;n>i;i++){if(r=e.charCodeAt(i),r>55295&&57344>r){if(!a){if(r>56319){(t-=3)>-1&&o.push(239,191,189);continue}if(i+1===n){(t-=3)>-1&&o.push(239,191,189);continue}a=r;continue}if(56320>r){(t-=3)>-1&&o.push(239,191,189),a=r;continue}r=a-55296<<10|r-56320|65536,a=null}else a&&((t-=3)>-1&&o.push(239,191,189),a=null);if(128>r){if((t-=1)<0)break;o.push(r)}else if(2048>r){if((t-=2)<0)break;o.push(r>>6|192,63&r|128)}else if(65536>r){if((t-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(2097152>r))throw new Error("Invalid code point");if((t-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return o}function D(e){for(var t=[],r=0;r<e.length;r++)t.push(255&e.charCodeAt(r));return t}function R(e,t){for(var r,n,a,o=[],i=0;i<e.length&&!((t-=2)<0);i++)r=e.charCodeAt(i),n=r>>8,a=r%256,o.push(a),o.push(n);return o}function U(e){return Y.toByteArray(I(e))}function V(e,t,r,n){for(var a=0;n>a&&!(a+r>=t.length||a>=e.length);a++)t[a+r]=e[a];return a}function L(e){try{return decodeURIComponent(e)}catch(t){return String.fromCharCode(65533)}}var Y=e("base64-js"),H=e("ieee754"),X=e("is-array");r.Buffer=n,r.SlowBuffer=h,r.INSPECT_MAX_BYTES=50,n.poolSize=8192;var G=1073741823,J={};n.TYPED_ARRAY_SUPPORT=function(){try{var e=new ArrayBuffer(0),t=new Uint8Array(e);return t.foo=function(){return 42},42===t.foo()&&"function"==typeof t.subarray&&0===new Uint8Array(1).subarray(1,1).byteLength}catch(r){return!1}}(),n.isBuffer=function(e){return!(null==e||!e._isBuffer)},n.compare=function(e,t){if(!n.isBuffer(e)||!n.isBuffer(t))throw new TypeError("Arguments must be Buffers");if(e===t)return 0;for(var r=e.length,a=t.length,o=0,i=Math.min(r,a);i>o&&e[o]===t[o];)++o;return o!==i&&(r=e[o],a=t[o]),a>r?-1:r>a?1:0},n.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},n.concat=function(e,t){if(!X(e))throw new TypeError("list argument must be an Array of Buffers.");if(0===e.length)return new n(0);if(1===e.length)return e[0];var r;if(void 0===t)for(t=0,r=0;r<e.length;r++)t+=e[r].length;var a=new n(t),o=0;for(r=0;r<e.length;r++){var i=e[r];i.copy(a,o),o+=i.length}return a},n.byteLength=v,n.prototype.length=void 0,n.prototype.parent=void 0,n.prototype.toString=function(e,t,r){var n=!1;if(t=0|t,r=void 0===r||r===1/0?this.length:0|r,e||(e="utf8"),0>t&&(t=0),r>this.length&&(r=this.length),t>=r)return"";for(;;)switch(e){case"hex":return j(this,t,r);case"utf8":case"utf-8":return k(this,t,r);case"ascii":return z(this,t,r);case"binary":return A(this,t,r);case"base64":return _(this,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return M(this,t,r);default:if(n)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),n=!0}},n.prototype.equals=function(e){if(!n.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e?!0:0===n.compare(this,e)},n.prototype.inspect=function(){var e="",t=r.INSPECT_MAX_BYTES;return this.length>0&&(e=this.toString("hex",0,t).match(/.{2}/g).join(" "),this.length>t&&(e+=" ... ")),"<Buffer "+e+">"},n.prototype.compare=function(e){if(!n.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e?0:n.compare(this,e)},n.prototype.indexOf=function(e,t){function r(e,t,r){for(var n=-1,a=0;r+a<e.length;a++)if(e[r+a]===t[-1===n?0:a-n]){if(-1===n&&(n=a),a-n+1===t.length)return r+n}else n=-1;return-1}if(t>2147483647?t=2147483647:-2147483648>t&&(t=-2147483648),t>>=0,0===this.length)return-1;if(t>=this.length)return-1;if(0>t&&(t=Math.max(this.length+t,0)),"string"==typeof e)return 0===e.length?-1:String.prototype.indexOf.call(this,e,t);if(n.isBuffer(e))return r(this,e,t);if("number"==typeof e)return n.TYPED_ARRAY_SUPPORT&&"function"===Uint8Array.prototype.indexOf?Uint8Array.prototype.indexOf.call(this,e,t):r(this,[e],t);throw new TypeError("val must be string, number or Buffer")},n.prototype.get=function(e){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(e)},n.prototype.set=function(e,t){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(e,t)},n.prototype.write=function(e,t,r,n){if(void 0===t)n="utf8",r=this.length,t=0;else if(void 0===r&&"string"==typeof t)n=t,r=this.length,t=0;else if(isFinite(t))t=0|t,isFinite(r)?(r=0|r,void 0===n&&(n="utf8")):(n=r,r=void 0);else{var a=n;n=t,t=0|r,r=a}var o=this.length-t;if((void 0===r||r>o)&&(r=o),e.length>0&&(0>r||0>t)||t>this.length)throw new RangeError("attempt to write outside buffer bounds");n||(n="utf8");for(var i=!1;;)switch(n){case"hex":return g(this,e,t,r);case"utf8":case"utf-8":return m(this,e,t,r);case"ascii":return y(this,e,t,r);case"binary":return x(this,e,t,r);case"base64":return b(this,e,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return w(this,e,t,r);default:if(i)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),i=!0}},n.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},n.prototype.slice=function(e,t){var r=this.length;e=~~e,t=void 0===t?r:~~t,0>e?(e+=r,0>e&&(e=0)):e>r&&(e=r),0>t?(t+=r,0>t&&(t=0)):t>r&&(t=r),e>t&&(t=e);var a;if(n.TYPED_ARRAY_SUPPORT)a=n._augment(this.subarray(e,t));else{var o=t-e;a=new n(o,void 0);for(var i=0;o>i;i++)a[i]=this[i+e]}return a.length&&(a.parent=this.parent||this),a},n.prototype.readUIntLE=function(e,t,r){e=0|e,t=0|t,r||E(e,t,this.length);for(var n=this[e],a=1,o=0;++o<t&&(a*=256);)n+=this[e+o]*a;return n},n.prototype.readUIntBE=function(e,t,r){e=0|e,t=0|t,r||E(e,t,this.length);for(var n=this[e+--t],a=1;t>0&&(a*=256);)n+=this[e+--t]*a;return n},n.prototype.readUInt8=function(e,t){return t||E(e,1,this.length),this[e]},n.prototype.readUInt16LE=function(e,t){return t||E(e,2,this.length),this[e]|this[e+1]<<8},n.prototype.readUInt16BE=function(e,t){return t||E(e,2,this.length),this[e]<<8|this[e+1]},n.prototype.readUInt32LE=function(e,t){return t||E(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]},n.prototype.readUInt32BE=function(e,t){return t||E(e,4,this.length),16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},n.prototype.readIntLE=function(e,t,r){e=0|e,t=0|t,r||E(e,t,this.length);for(var n=this[e],a=1,o=0;++o<t&&(a*=256);)n+=this[e+o]*a;return a*=128,n>=a&&(n-=Math.pow(2,8*t)),n},n.prototype.readIntBE=function(e,t,r){e=0|e,t=0|t,r||E(e,t,this.length);for(var n=t,a=1,o=this[e+--n];n>0&&(a*=256);)o+=this[e+--n]*a;return a*=128,o>=a&&(o-=Math.pow(2,8*t)),o},n.prototype.readInt8=function(e,t){return t||E(e,1,this.length),128&this[e]?-1*(255-this[e]+1):this[e]},n.prototype.readInt16LE=function(e,t){t||E(e,2,this.length);var r=this[e]|this[e+1]<<8;return 32768&r?4294901760|r:r},n.prototype.readInt16BE=function(e,t){t||E(e,2,this.length);var r=this[e+1]|this[e]<<8;return 32768&r?4294901760|r:r},n.prototype.readInt32LE=function(e,t){return t||E(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},n.prototype.readInt32BE=function(e,t){return t||E(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},n.prototype.readFloatLE=function(e,t){return t||E(e,4,this.length),H.read(this,e,!0,23,4)},n.prototype.readFloatBE=function(e,t){return t||E(e,4,this.length),H.read(this,e,!1,23,4)},n.prototype.readDoubleLE=function(e,t){return t||E(e,8,this.length),H.read(this,e,!0,52,8)},n.prototype.readDoubleBE=function(e,t){return t||E(e,8,this.length),H.read(this,e,!1,52,8)},n.prototype.writeUIntLE=function(e,t,r,n){e=+e,t=0|t,r=0|r,n||O(this,e,t,r,Math.pow(2,8*r),0);var a=1,o=0;for(this[t]=255&e;++o<r&&(a*=256);)this[t+o]=e/a&255;return t+r},n.prototype.writeUIntBE=function(e,t,r,n){e=+e,t=0|t,r=0|r,n||O(this,e,t,r,Math.pow(2,8*r),0);var a=r-1,o=1;for(this[t+a]=255&e;--a>=0&&(o*=256);)this[t+a]=e/o&255;return t+r},n.prototype.writeUInt8=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,1,255,0),n.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),this[t]=e,t+1},n.prototype.writeUInt16LE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,2,65535,0),n.TYPED_ARRAY_SUPPORT?(this[t]=e,this[t+1]=e>>>8):S(this,e,t,!0),t+2},n.prototype.writeUInt16BE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,2,65535,0),n.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=e):S(this,e,t,!1),t+2},n.prototype.writeUInt32LE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,4,4294967295,0),n.TYPED_ARRAY_SUPPORT?(this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=e):F(this,e,t,!0),t+4},n.prototype.writeUInt32BE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,4,4294967295,0),n.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e):F(this,e,t,!1),t+4},n.prototype.writeIntLE=function(e,t,r,n){if(e=+e,t=0|t,!n){var a=Math.pow(2,8*r-1);O(this,e,t,r,a-1,-a)}var o=0,i=1,s=0>e?1:0;for(this[t]=255&e;++o<r&&(i*=256);)this[t+o]=(e/i>>0)-s&255;return t+r},n.prototype.writeIntBE=function(e,t,r,n){if(e=+e,t=0|t,!n){var a=Math.pow(2,8*r-1);O(this,e,t,r,a-1,-a)}var o=r-1,i=1,s=0>e?1:0;for(this[t+o]=255&e;--o>=0&&(i*=256);)this[t+o]=(e/i>>0)-s&255;return t+r},n.prototype.writeInt8=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,1,127,-128),n.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),0>e&&(e=255+e+1),this[t]=e,t+1},n.prototype.writeInt16LE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,2,32767,-32768),n.TYPED_ARRAY_SUPPORT?(this[t]=e,this[t+1]=e>>>8):S(this,e,t,!0),t+2},n.prototype.writeInt16BE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,2,32767,-32768),n.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=e):S(this,e,t,!1),t+2},n.prototype.writeInt32LE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,4,2147483647,-2147483648),n.TYPED_ARRAY_SUPPORT?(this[t]=e,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24):F(this,e,t,!0),t+4},n.prototype.writeInt32BE=function(e,t,r){return e=+e,t=0|t,r||O(this,e,t,4,2147483647,-2147483648),0>e&&(e=4294967295+e+1),n.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e):F(this,e,t,!1),t+4},n.prototype.writeFloatLE=function(e,t,r){return B(this,e,t,!0,r)},n.prototype.writeFloatBE=function(e,t,r){return B(this,e,t,!1,r)},n.prototype.writeDoubleLE=function(e,t,r){return C(this,e,t,!0,r)},n.prototype.writeDoubleBE=function(e,t,r){return C(this,e,t,!1,r)},n.prototype.copy=function(e,t,r,a){if(r||(r=0),a||0===a||(a=this.length),t>=e.length&&(t=e.length),t||(t=0),a>0&&r>a&&(a=r),a===r)return 0;if(0===e.length||0===this.length)return 0;if(0>t)throw new RangeError("targetStart out of bounds");if(0>r||r>=this.length)throw new RangeError("sourceStart out of bounds");if(0>a)throw new RangeError("sourceEnd out of bounds");a>this.length&&(a=this.length),e.length-t<a-r&&(a=e.length-t+r);var o=a-r;if(1e3>o||!n.TYPED_ARRAY_SUPPORT)for(var i=0;o>i;i++)e[i+t]=this[i+r];else e._set(this.subarray(r,r+o),t);return o},n.prototype.fill=function(e,t,r){if(e||(e=0),t||(t=0),r||(r=this.length),t>r)throw new RangeError("end < start");if(r!==t&&0!==this.length){if(0>t||t>=this.length)throw new RangeError("start out of bounds");if(0>r||r>this.length)throw new RangeError("end out of bounds");var n;if("number"==typeof e)for(n=t;r>n;n++)this[n]=e;else{var a=q(e.toString()),o=a.length;for(n=t;r>n;n++)this[n]=a[n%o]}return this}},n.prototype.toArrayBuffer=function(){if("undefined"!=typeof Uint8Array){if(n.TYPED_ARRAY_SUPPORT)return new n(this).buffer;for(var e=new Uint8Array(this.length),t=0,r=e.length;r>t;t+=1)e[t]=this[t];return e.buffer}throw new TypeError("Buffer.toArrayBuffer not supported in this browser")};var W=n.prototype;n._augment=function(e){return e.constructor=n,e._isBuffer=!0,e._set=e.set,e.get=W.get,e.set=W.set,e.write=W.write,e.toString=W.toString,e.toLocaleString=W.toString,e.toJSON=W.toJSON,e.equals=W.equals,e.compare=W.compare,e.indexOf=W.indexOf,e.copy=W.copy,e.slice=W.slice,e.readUIntLE=W.readUIntLE,e.readUIntBE=W.readUIntBE,e.readUInt8=W.readUInt8,e.readUInt16LE=W.readUInt16LE,e.readUInt16BE=W.readUInt16BE,e.readUInt32LE=W.readUInt32LE,e.readUInt32BE=W.readUInt32BE,e.readIntLE=W.readIntLE,e.readIntBE=W.readIntBE,e.readInt8=W.readInt8,e.readInt16LE=W.readInt16LE,e.readInt16BE=W.readInt16BE,e.readInt32LE=W.readInt32LE,e.readInt32BE=W.readInt32BE,e.readFloatLE=W.readFloatLE,e.readFloatBE=W.readFloatBE,e.readDoubleLE=W.readDoubleLE,e.readDoubleBE=W.readDoubleBE,e.writeUInt8=W.writeUInt8,e.writeUIntLE=W.writeUIntLE,e.writeUIntBE=W.writeUIntBE,e.writeUInt16LE=W.writeUInt16LE,e.writeUInt16BE=W.writeUInt16BE,e.writeUInt32LE=W.writeUInt32LE,e.writeUInt32BE=W.writeUInt32BE,e.writeIntLE=W.writeIntLE,e.writeIntBE=W.writeIntBE,e.writeInt8=W.writeInt8,e.writeInt16LE=W.writeInt16LE,e.writeInt16BE=W.writeInt16BE,e.writeInt32LE=W.writeInt32LE,e.writeInt32BE=W.writeInt32BE,e.writeFloatLE=W.writeFloatLE,e.writeFloatBE=W.writeFloatBE,e.writeDoubleLE=W.writeDoubleLE,e.writeDoubleBE=W.writeDoubleBE,e.fill=W.fill,e.inspect=W.inspect,e.toArrayBuffer=W.toArrayBuffer,e};var Q=/[^+\/0-9A-z\-]/g},{"base64-js":2,ieee754:3,"is-array":4}],2:[function(e,t,r){var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";!function(e){"use strict";function t(e){var t=e.charCodeAt(0);return t===i||t===f?62:t===s||t===d?63:l>t?-1:l+10>t?t-l+26+26:c+26>t?t-c:u+26>t?t-u+26:void 0}function r(e){function r(e){u[f++]=e}var n,a,i,s,l,u;if(e.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var c=e.length;l="="===e.charAt(c-2)?2:"="===e.charAt(c-1)?1:0,u=new o(3*e.length/4-l),i=l>0?e.length-4:e.length;var f=0;for(n=0,a=0;i>n;n+=4,a+=3)s=t(e.charAt(n))<<18|t(e.charAt(n+1))<<12|t(e.charAt(n+2))<<6|t(e.charAt(n+3)),r((16711680&s)>>16),r((65280&s)>>8),r(255&s);return 2===l?(s=t(e.charAt(n))<<2|t(e.charAt(n+1))>>4,r(255&s)):1===l&&(s=t(e.charAt(n))<<10|t(e.charAt(n+1))<<4|t(e.charAt(n+2))>>2,r(s>>8&255),r(255&s)),u}function a(e){function t(e){return n.charAt(e)}function r(e){return t(e>>18&63)+t(e>>12&63)+t(e>>6&63)+t(63&e)}var a,o,i,s=e.length%3,l="";for(a=0,i=e.length-s;i>a;a+=3)o=(e[a]<<16)+(e[a+1]<<8)+e[a+2],l+=r(o);switch(s){case 1:o=e[e.length-1],l+=t(o>>2),l+=t(o<<4&63),l+="==";break;case 2:o=(e[e.length-2]<<8)+e[e.length-1],l+=t(o>>10),l+=t(o>>4&63),l+=t(o<<2&63),l+="="}return l}var o="undefined"!=typeof Uint8Array?Uint8Array:Array,i="+".charCodeAt(0),s="/".charCodeAt(0),l="0".charCodeAt(0),u="a".charCodeAt(0),c="A".charCodeAt(0),f="-".charCodeAt(0),d="_".charCodeAt(0);e.toByteArray=r,e.fromByteArray=a}("undefined"==typeof r?this.base64js={}:r)},{}],3:[function(e,t,r){r.read=function(e,t,r,n,a){var o,i,s=8*a-n-1,l=(1<<s)-1,u=l>>1,c=-7,f=r?a-1:0,d=r?-1:1,p=e[t+f];for(f+=d,o=p&(1<<-c)-1,p>>=-c,c+=s;c>0;o=256*o+e[t+f],f+=d,c-=8);for(i=o&(1<<-c)-1,o>>=-c,c+=n;c>0;i=256*i+e[t+f],f+=d,c-=8);if(0===o)o=1-u;else{if(o===l)return i?0/0:(p?-1:1)*(1/0);i+=Math.pow(2,n),o-=u}return(p?-1:1)*i*Math.pow(2,o-n)},r.write=function(e,t,r,n,a,o){var i,s,l,u=8*o-a-1,c=(1<<u)-1,f=c>>1,d=23===a?Math.pow(2,-24)-Math.pow(2,-77):0,p=n?0:o-1,h=n?1:-1,v=0>t||0===t&&0>1/t?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(s=isNaN(t)?1:0,i=c):(i=Math.floor(Math.log(t)/Math.LN2),t*(l=Math.pow(2,-i))<1&&(i--,l*=2),t+=i+f>=1?d/l:d*Math.pow(2,1-f),t*l>=2&&(i++,l/=2),i+f>=c?(s=0,i=c):i+f>=1?(s=(t*l-1)*Math.pow(2,a),i+=f):(s=t*Math.pow(2,f-1)*Math.pow(2,a),i=0));a>=8;e[r+p]=255&s,p+=h,s/=256,a-=8);for(i=i<<a|s,u+=a;u>0;e[r+p]=255&i,p+=h,i/=256,u-=8);e[r+p-h]|=128*v}},{}],4:[function(e,t,r){var n=Array.isArray,a=Object.prototype.toString;t.exports=n||function(e){return!!e&&"[object Array]"==a.call(e)}},{}],5:[function(e,t,r){t.exports=e("./lib/heap")},{"./lib/heap":6}],6:[function(e,t,r){(function(){var e,n,a,o,i,s,l,u,c,f,d,p,h,v,g;a=Math.floor,f=Math.min,n=function(e,t){return t>e?-1:e>t?1:0},c=function(e,t,r,o,i){var s;if(null==r&&(r=0),null==i&&(i=n),0>r)throw new Error("lo must be non-negative");for(null==o&&(o=e.length);o>r;)s=a((r+o)/2),i(t,e[s])<0?o=s:r=s+1;return[].splice.apply(e,[r,r-r].concat(t)),t},s=function(e,t,r){return null==r&&(r=n),e.push(t),v(e,0,e.length-1,r)},i=function(e,t){var r,a;return null==t&&(t=n),r=e.pop(),e.length?(a=e[0],e[0]=r,g(e,0,t)):a=r,a},u=function(e,t,r){var a;return null==r&&(r=n),a=e[0],e[0]=t,g(e,0,r),a},l=function(e,t,r){var a;return null==r&&(r=n),e.length&&r(e[0],t)<0&&(a=[e[0],t],t=a[0],e[0]=a[1],g(e,0,r)),t},o=function(e,t){var r,o,i,s,l,u;for(null==t&&(t=n),s=function(){u=[];for(var t=0,r=a(e.length/2);r>=0?r>t:t>r;r>=0?t++:t--)u.push(t);return u}.apply(this).reverse(),l=[],o=0,i=s.length;i>o;o++)r=s[o],l.push(g(e,r,t));return l},h=function(e,t,r){var a;return null==r&&(r=n),a=e.indexOf(t),-1!==a?(v(e,0,a,r),g(e,a,r)):void 0},d=function(e,t,r){var a,i,s,u,c;if(null==r&&(r=n),i=e.slice(0,t),!i.length)return i;for(o(i,r),c=e.slice(t),s=0,u=c.length;u>s;s++)a=c[s],l(i,a,r);return i.sort(r).reverse()},p=function(e,t,r){var a,s,l,u,d,p,h,v,g,m;if(null==r&&(r=n),10*t<=e.length){if(u=e.slice(0,t).sort(r),!u.length)return u;for(l=u[u.length-1],v=e.slice(t),d=0,h=v.length;h>d;d++)a=v[d],r(a,l)<0&&(c(u,a,0,null,r),u.pop(),l=u[u.length-1]);return u}for(o(e,r),m=[],s=p=0,g=f(t,e.length);g>=0?g>p:p>g;s=g>=0?++p:--p)m.push(i(e,r));return m},v=function(e,t,r,a){var o,i,s;for(null==a&&(a=n),o=e[r];r>t&&(s=r-1>>1,i=e[s],a(o,i)<0);)e[r]=i,r=s;return e[r]=o},g=function(e,t,r){var a,o,i,s,l;for(null==r&&(r=n),o=e.length,l=t,i=e[t],a=2*t+1;o>a;)s=a+1,o>s&&!(r(e[a],e[s])<0)&&(a=s),e[t]=e[a],t=a,a=2*t+1;return e[t]=i,v(e,l,t,r)},e=function(){function e(e){this.cmp=null!=e?e:n,this.nodes=[]}return e.push=s,e.pop=i,e.replace=u,e.pushpop=l,e.heapify=o,e.updateItem=h,e.nlargest=d,e.nsmallest=p,e.prototype.push=function(e){return s(this.nodes,e,this.cmp)},e.prototype.pop=function(){return i(this.nodes,this.cmp)},e.prototype.peek=function(){return this.nodes[0]},e.prototype.contains=function(e){return-1!==this.nodes.indexOf(e)},e.prototype.replace=function(e){return u(this.nodes,e,this.cmp)},e.prototype.pushpop=function(e){return l(this.nodes,e,this.cmp)},e.prototype.heapify=function(){return o(this.nodes,this.cmp)},e.prototype.updateItem=function(e){return h(this.nodes,e,this.cmp)},e.prototype.clear=function(){return this.nodes=[]},e.prototype.empty=function(){return 0===this.nodes.length},e.prototype.size=function(){return this.nodes.length},e.prototype.clone=function(){var t;return t=new e,t.nodes=this.nodes.slice(0),t},e.prototype.toArray=function(){return this.nodes.slice(0)},e.prototype.insert=e.prototype.push,e.prototype.top=e.prototype.peek,e.prototype.front=e.prototype.peek,e.prototype.has=e.prototype.contains,e.prototype.copy=e.prototype.clone,e}(),function(e,n){return"function"==typeof define&&define.amd?define([],n):"object"==typeof r?t.exports=n():e.Heap=n()}(this,function(){return e})}).call(this)},{}],7:[function(require,module,exports){(function(global){"use strict";var numeric="undefined"==typeof exports?function(){}:exports;"undefined"!=typeof global&&(global.numeric=numeric),numeric.version="1.2.6",numeric.bench=function(e,t){var r,n,a,o;for("undefined"==typeof t&&(t=15),a=.5,r=new Date;;){for(a*=2,o=a;o>3;o-=4)e(),e(),e(),e();for(;o>0;)e(),o--;if(n=new Date,n-r>t)break}for(o=a;o>3;o-=4)e(),e(),e(),e();for(;o>0;)e(),o--;return n=new Date,1e3*(3*a-1)/(n-r)},numeric._myIndexOf=function(e){var t,r=this.length;for(t=0;r>t;++t)if(this[t]===e)return t;return-1},numeric.myIndexOf=Array.prototype.indexOf?Array.prototype.indexOf:numeric._myIndexOf,numeric.Function=Function,numeric.precision=4,numeric.largeArray=50,numeric.prettyPrint=function(e){function t(e){if(0===e)return"0";if(isNaN(e))return"NaN";if(0>e)return"-"+t(-e);if(isFinite(e)){var r=Math.floor(Math.log(e)/Math.log(10)),n=e/Math.pow(10,r),a=n.toPrecision(numeric.precision);return 10===parseFloat(a)&&(r++,n=1,a=n.toPrecision(numeric.precision)),parseFloat(a).toString()+"e"+r.toString()}return"Infinity"}function r(e){var a;if("undefined"==typeof e)return n.push(Array(numeric.precision+8).join(" ")),!1;if("string"==typeof e)return n.push('"'+e+'"'),!1;if("boolean"==typeof e)return n.push(e.toString()),!1;if("number"==typeof e){var o=t(e),i=e.toPrecision(numeric.precision),s=parseFloat(e.toString()).toString(),l=[o,i,s,parseFloat(i).toString(),parseFloat(s).toString()];for(a=1;a<l.length;a++)l[a].length<o.length&&(o=l[a]);return n.push(Array(numeric.precision+8-o.length).join(" ")+o),!1}if(null===e)return n.push("null"),!1;if("function"==typeof e){n.push(e.toString());var u=!1;for(a in e)e.hasOwnProperty(a)&&(n.push(u?",\n":"\n{"),u=!0,n.push(a),n.push(": \n"),r(e[a]));return u&&n.push("}\n"),!0}if(e instanceof Array){if(e.length>numeric.largeArray)return n.push("...Large Array..."),!0;var u=!1;for(n.push("["),a=0;a<e.length;a++)a>0&&(n.push(","),u&&n.push("\n ")),u=r(e[a]);return n.push("]"),!0}n.push("{");var u=!1;for(a in e)e.hasOwnProperty(a)&&(u&&n.push(",\n"),u=!0,n.push(a),n.push(": \n"),r(e[a]));return n.push("}"),!0}var n=[];return r(e),n.join("")},numeric.parseDate=function(e){function t(e){if("string"==typeof e)return Date.parse(e.replace(/-/g,"/"));if(!(e instanceof Array))throw new Error("parseDate: parameter must be arrays of strings");var r,n=[];for(r=0;r<e.length;r++)n[r]=t(e[r]);return n}return t(e)},numeric.parseFloat=function(e){function t(e){if("string"==typeof e)return parseFloat(e);if(!(e instanceof Array))throw new Error("parseFloat: parameter must be arrays of strings");var r,n=[];for(r=0;r<e.length;r++)n[r]=t(e[r]);return n}return t(e)},numeric.parseCSV=function(e){var t,r,n=e.split("\n"),a=[],o=/(([^'",]*)|('[^']*')|("[^"]*")),/g,i=/^\s*(([+-]?[0-9]+(\.[0-9]*)?(e[+-]?[0-9]+)?)|([+-]?[0-9]*(\.[0-9]+)?(e[+-]?[0-9]+)?))\s*$/,s=function(e){return e.substr(0,e.length-1)},l=0;for(r=0;r<n.length;r++){var u,c=(n[r]+",").match(o);if(c.length>0){for(a[l]=[],t=0;t<c.length;t++)u=s(c[t]),a[l][t]=i.test(u)?parseFloat(u):u;l++}}return a},numeric.toCSV=function(e){var t,r,n,a,o,i,s=numeric.dim(e);for(n=s[0],a=s[1],i=[],t=0;n>t;t++){for(o=[],r=0;n>r;r++)o[r]=e[t][r].toString();i[t]=o.join(", ")}return i.join("\n")+"\n"},numeric.getURL=function(e){var t=new XMLHttpRequest;return t.open("GET",e,!1),t.send(),t},numeric.imageURL=function(e){function t(e){var t,r,n,a,o,i,s,l,u=e.length,c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",f="";for(t=0;u>t;t+=3)r=e[t],n=e[t+1],a=e[t+2],o=r>>2,i=((3&r)<<4)+(n>>4),s=((15&n)<<2)+(a>>6),l=63&a,t+1>=u?s=l=64:t+2>=u&&(l=64),f+=c.charAt(o)+c.charAt(i)+c.charAt(s)+c.charAt(l);return f}function r(e,t,r){"undefined"==typeof t&&(t=0),"undefined"==typeof r&&(r=e.length);{var n,a=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],o=-1,i=0;e.length}for(n=t;r>n;n++)i=255&(o^e[n]),o=o>>>8^a[i];return-1^o}var n,a,o,i,s,l,u,c,f,d,p=e[0].length,h=e[0][0].length,v=[137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,h>>24&255,h>>16&255,h>>8&255,255&h,p>>24&255,p>>16&255,p>>8&255,255&p,8,2,0,0,0,-1,-2,-3,-4,-5,-6,-7,-8,73,68,65,84,8,29];for(d=r(v,12,29),v[29]=d>>24&255,v[30]=d>>16&255,v[31]=d>>8&255,v[32]=255&d,n=1,a=0,u=0;p>u;u++){for(v.push(p-1>u?0:1),s=3*h+1+(0===u)&255,l=3*h+1+(0===u)>>8&255,v.push(s),v.push(l),v.push(255&~s),v.push(255&~l),0===u&&v.push(0),c=0;h>c;c++)for(o=0;3>o;o++)s=e[o][u][c],s=s>255?255:0>s?0:Math.round(s),n=(n+s)%65521,a=(a+n)%65521,v.push(s);v.push(0)}return f=(a<<16)+n,v.push(f>>24&255),v.push(f>>16&255),v.push(f>>8&255),v.push(255&f),i=v.length-41,v[33]=i>>24&255,v[34]=i>>16&255,v[35]=i>>8&255,v[36]=255&i,d=r(v,37),v.push(d>>24&255),v.push(d>>16&255),v.push(d>>8&255),v.push(255&d),v.push(0),v.push(0),v.push(0),v.push(0),v.push(73),v.push(69),v.push(78),v.push(68),v.push(174),v.push(66),v.push(96),v.push(130),"data:image/png;base64,"+t(v)},numeric._dim=function(e){for(var t=[];"object"==typeof e;)t.push(e.length),e=e[0];return t},numeric.dim=function(e){var t,r;return"object"==typeof e?(t=e[0],"object"==typeof t?(r=t[0],"object"==typeof r?numeric._dim(e):[e.length,t.length]):[e.length]):[]},numeric.mapreduce=function(e,t){return Function("x","accum","_s","_k",'if(typeof accum === "undefined") accum = '+t+';\nif(typeof x === "number") { var xi = x; '+e+'; return accum; }\nif(typeof _s === "undefined") _s = numeric.dim(x);\nif(typeof _k === "undefined") _k = 0;\nvar _n = _s[_k];\nvar i,xi;\nif(_k < _s.length-1) {\n    for(i=_n-1;i>=0;i--) {\n        accum = arguments.callee(x[i],accum,_s,_k+1);\n    }    return accum;\n}\nfor(i=_n-1;i>=1;i-=2) { \n    xi = x[i];\n    '+e+";\n    xi = x[i-1];\n    "+e+";\n}\nif(i === 0) {\n    xi = x[i];\n    "+e+"\n}\nreturn accum;")},numeric.mapreduce2=function(e,t){return Function("x","var n = x.length;\nvar i,xi;\n"+t+";\nfor(i=n-1;i!==-1;--i) { \n    xi = x[i];\n    "+e+";\n}\nreturn accum;");

},numeric.same=function e(t,r){var n,a;if(!(t instanceof Array&&r instanceof Array))return!1;if(a=t.length,a!==r.length)return!1;for(n=0;a>n;n++)if(t[n]!==r[n]){if("object"!=typeof t[n])return!1;if(!e(t[n],r[n]))return!1}return!0},numeric.rep=function(e,t,r){"undefined"==typeof r&&(r=0);var n,a=e[r],o=Array(a);if(r===e.length-1){for(n=a-2;n>=0;n-=2)o[n+1]=t,o[n]=t;return-1===n&&(o[0]=t),o}for(n=a-1;n>=0;n--)o[n]=numeric.rep(e,t,r+1);return o},numeric.dotMMsmall=function(e,t){var r,n,a,o,i,s,l,u,c,f,d;for(o=e.length,i=t.length,s=t[0].length,l=Array(o),r=o-1;r>=0;r--){for(u=Array(s),c=e[r],a=s-1;a>=0;a--){for(f=c[i-1]*t[i-1][a],n=i-2;n>=1;n-=2)d=n-1,f+=c[n]*t[n][a]+c[d]*t[d][a];0===n&&(f+=c[0]*t[0][a]),u[a]=f}l[r]=u}return l},numeric._getCol=function(e,t,r){var n,a=e.length;for(n=a-1;n>0;--n)r[n]=e[n][t],--n,r[n]=e[n][t];0===n&&(r[0]=e[0][t])},numeric.dotMMbig=function(e,t){var r,n,a,o,i=numeric._getCol,s=t.length,l=Array(s),u=e.length,c=t[0].length,f=new Array(u),d=numeric.dotVV;for(--s,--u,n=u;-1!==n;--n)f[n]=Array(c);for(--c,n=c;-1!==n;--n)for(i(t,n,l),a=u;-1!==a;--a)o=0,r=e[a],f[a][n]=d(r,l);return f},numeric.dotMV=function(e,t){var r,n=e.length,a=(t.length,Array(n)),o=numeric.dotVV;for(r=n-1;r>=0;r--)a[r]=o(e[r],t);return a},numeric.dotVM=function(e,t){var r,n,a,o,i,s,l;for(a=e.length,o=t[0].length,i=Array(o),n=o-1;n>=0;n--){for(s=e[a-1]*t[a-1][n],r=a-2;r>=1;r-=2)l=r-1,s+=e[r]*t[r][n]+e[l]*t[l][n];0===r&&(s+=e[0]*t[0][n]),i[n]=s}return i},numeric.dotVV=function(e,t){var r,n,a=e.length,o=e[a-1]*t[a-1];for(r=a-2;r>=1;r-=2)n=r-1,o+=e[r]*t[r]+e[n]*t[n];return 0===r&&(o+=e[0]*t[0]),o},numeric.dot=function(e,t){var r=numeric.dim;switch(1e3*r(e).length+r(t).length){case 2002:return t.length<10?numeric.dotMMsmall(e,t):numeric.dotMMbig(e,t);case 2001:return numeric.dotMV(e,t);case 1002:return numeric.dotVM(e,t);case 1001:return numeric.dotVV(e,t);case 1e3:return numeric.mulVS(e,t);case 1:return numeric.mulSV(e,t);case 0:return e*t;default:throw new Error("numeric.dot only works on vectors and matrices")}},numeric.diag=function(e){var t,r,n,a,o=e.length,i=Array(o);for(t=o-1;t>=0;t--){for(a=Array(o),r=t+2,n=o-1;n>=r;n-=2)a[n]=0,a[n-1]=0;for(n>t&&(a[n]=0),a[t]=e[t],n=t-1;n>=1;n-=2)a[n]=0,a[n-1]=0;0===n&&(a[0]=0),i[t]=a}return i},numeric.getDiag=function(e){var t,r=Math.min(e.length,e[0].length),n=Array(r);for(t=r-1;t>=1;--t)n[t]=e[t][t],--t,n[t]=e[t][t];return 0===t&&(n[0]=e[0][0]),n},numeric.identity=function(e){return numeric.diag(numeric.rep([e],1))},numeric.pointwise=function(e,t,r){"undefined"==typeof r&&(r="");var n,a,o=[],i=/\[i\]$/,s="",l=!1;for(n=0;n<e.length;n++)i.test(e[n])?(a=e[n].substring(0,e[n].length-3),s=a):a=e[n],"ret"===a&&(l=!0),o.push(a);return o[e.length]="_s",o[e.length+1]="_k",o[e.length+2]='if(typeof _s === "undefined") _s = numeric.dim('+s+');\nif(typeof _k === "undefined") _k = 0;\nvar _n = _s[_k];\nvar i'+(l?"":", ret = Array(_n)")+";\nif(_k < _s.length-1) {\n    for(i=_n-1;i>=0;i--) ret[i] = arguments.callee("+e.join(",")+",_s,_k+1);\n    return ret;\n}\n"+r+"\nfor(i=_n-1;i!==-1;--i) {\n    "+t+"\n}\nreturn ret;",Function.apply(null,o)},numeric.pointwise2=function(e,t,r){"undefined"==typeof r&&(r="");var n,a,o=[],i=/\[i\]$/,s="",l=!1;for(n=0;n<e.length;n++)i.test(e[n])?(a=e[n].substring(0,e[n].length-3),s=a):a=e[n],"ret"===a&&(l=!0),o.push(a);return o[e.length]="var _n = "+s+".length;\nvar i"+(l?"":", ret = Array(_n)")+";\n"+r+"\nfor(i=_n-1;i!==-1;--i) {\n"+t+"\n}\nreturn ret;",Function.apply(null,o)},numeric._biforeach=function t(e,r,n,a,o){if(a===n.length-1)return void o(e,r);var i,s=n[a];for(i=s-1;i>=0;i--)t("object"==typeof e?e[i]:e,"object"==typeof r?r[i]:r,n,a+1,o)},numeric._biforeach2=function r(e,t,n,a,o){if(a===n.length-1)return o(e,t);var i,s=n[a],l=Array(s);for(i=s-1;i>=0;--i)l[i]=r("object"==typeof e?e[i]:e,"object"==typeof t?t[i]:t,n,a+1,o);return l},numeric._foreach=function n(e,t,r,a){if(r===t.length-1)return void a(e);var o,i=t[r];for(o=i-1;o>=0;o--)n(e[o],t,r+1,a)},numeric._foreach2=function a(e,t,r,n){if(r===t.length-1)return n(e);var o,i=t[r],s=Array(i);for(o=i-1;o>=0;o--)s[o]=a(e[o],t,r+1,n);return s},numeric.ops2={add:"+",sub:"-",mul:"*",div:"/",mod:"%",and:"&&",or:"||",eq:"===",neq:"!==",lt:"<",gt:">",leq:"<=",geq:">=",band:"&",bor:"|",bxor:"^",lshift:"<<",rshift:">>",rrshift:">>>"},numeric.opseq={addeq:"+=",subeq:"-=",muleq:"*=",diveq:"/=",modeq:"%=",lshifteq:"<<=",rshifteq:">>=",rrshifteq:">>>=",bandeq:"&=",boreq:"|=",bxoreq:"^="},numeric.mathfuns=["abs","acos","asin","atan","ceil","cos","exp","floor","log","round","sin","sqrt","tan","isNaN","isFinite"],numeric.mathfuns2=["atan2","pow","max","min"],numeric.ops1={neg:"-",not:"!",bnot:"~",clone:""},numeric.mapreducers={any:["if(xi) return true;","var accum = false;"],all:["if(!xi) return false;","var accum = true;"],sum:["accum += xi;","var accum = 0;"],prod:["accum *= xi;","var accum = 1;"],norm2Squared:["accum += xi*xi;","var accum = 0;"],norminf:["accum = max(accum,abs(xi));","var accum = 0, max = Math.max, abs = Math.abs;"],norm1:["accum += abs(xi)","var accum = 0, abs = Math.abs;"],sup:["accum = max(accum,xi);","var accum = -Infinity, max = Math.max;"],inf:["accum = min(accum,xi);","var accum = Infinity, min = Math.min;"]},function(){var e,t;for(e=0;e<numeric.mathfuns2.length;++e)t=numeric.mathfuns2[e],numeric.ops2[t]=t;for(e in numeric.ops2)if(numeric.ops2.hasOwnProperty(e)){t=numeric.ops2[e];var r,n,a="";-1!==numeric.myIndexOf.call(numeric.mathfuns2,e)?(a="var "+t+" = Math."+t+";\n",r=function(e,r,n){return e+" = "+t+"("+r+","+n+")"},n=function(e,r){return e+" = "+t+"("+e+","+r+")"}):(r=function(e,r,n){return e+" = "+r+" "+t+" "+n},n=numeric.opseq.hasOwnProperty(e+"eq")?function(e,r){return e+" "+t+"= "+r}:function(e,r){return e+" = "+e+" "+t+" "+r}),numeric[e+"VV"]=numeric.pointwise2(["x[i]","y[i]"],r("ret[i]","x[i]","y[i]"),a),numeric[e+"SV"]=numeric.pointwise2(["x","y[i]"],r("ret[i]","x","y[i]"),a),numeric[e+"VS"]=numeric.pointwise2(["x[i]","y"],r("ret[i]","x[i]","y"),a),numeric[e]=Function("var n = arguments.length, i, x = arguments[0], y;\nvar VV = numeric."+e+"VV, VS = numeric."+e+"VS, SV = numeric."+e+'SV;\nvar dim = numeric.dim;\nfor(i=1;i!==n;++i) { \n  y = arguments[i];\n  if(typeof x === "object") {\n      if(typeof y === "object") x = numeric._biforeach2(x,y,dim(x),0,VV);\n      else x = numeric._biforeach2(x,y,dim(x),0,VS);\n  } else if(typeof y === "object") x = numeric._biforeach2(x,y,dim(y),0,SV);\n  else '+n("x","y")+"\n}\nreturn x;\n"),numeric[t]=numeric[e],numeric[e+"eqV"]=numeric.pointwise2(["ret[i]","x[i]"],n("ret[i]","x[i]"),a),numeric[e+"eqS"]=numeric.pointwise2(["ret[i]","x"],n("ret[i]","x"),a),numeric[e+"eq"]=Function("var n = arguments.length, i, x = arguments[0], y;\nvar V = numeric."+e+"eqV, S = numeric."+e+'eqS\nvar s = numeric.dim(x);\nfor(i=1;i!==n;++i) { \n  y = arguments[i];\n  if(typeof y === "object") numeric._biforeach(x,y,s,0,V);\n  else numeric._biforeach(x,y,s,0,S);\n}\nreturn x;\n')}for(e=0;e<numeric.mathfuns2.length;++e)t=numeric.mathfuns2[e],delete numeric.ops2[t];for(e=0;e<numeric.mathfuns.length;++e)t=numeric.mathfuns[e],numeric.ops1[t]=t;for(e in numeric.ops1)numeric.ops1.hasOwnProperty(e)&&(a="",t=numeric.ops1[e],-1!==numeric.myIndexOf.call(numeric.mathfuns,e)&&Math.hasOwnProperty(t)&&(a="var "+t+" = Math."+t+";\n"),numeric[e+"eqV"]=numeric.pointwise2(["ret[i]"],"ret[i] = "+t+"(ret[i]);",a),numeric[e+"eq"]=Function("x",'if(typeof x !== "object") return '+t+"x\nvar i;\nvar V = numeric."+e+"eqV;\nvar s = numeric.dim(x);\nnumeric._foreach(x,s,0,V);\nreturn x;\n"),numeric[e+"V"]=numeric.pointwise2(["x[i]"],"ret[i] = "+t+"(x[i]);",a),numeric[e]=Function("x",'if(typeof x !== "object") return '+t+"(x)\nvar i;\nvar V = numeric."+e+"V;\nvar s = numeric.dim(x);\nreturn numeric._foreach2(x,s,0,V);\n"));for(e=0;e<numeric.mathfuns.length;++e)t=numeric.mathfuns[e],delete numeric.ops1[t];for(e in numeric.mapreducers)numeric.mapreducers.hasOwnProperty(e)&&(t=numeric.mapreducers[e],numeric[e+"V"]=numeric.mapreduce2(t[0],t[1]),numeric[e]=Function("x","s","k",t[1]+'if(typeof x !== "object") {    xi = x;\n'+t[0]+';\n    return accum;\n}if(typeof s === "undefined") s = numeric.dim(x);\nif(typeof k === "undefined") k = 0;\nif(k === s.length-1) return numeric.'+e+"V(x);\nvar xi;\nvar n = x.length, i;\nfor(i=n-1;i!==-1;--i) {\n   xi = arguments.callee(x[i]);\n"+t[0]+";\n}\nreturn accum;\n"))}(),numeric.truncVV=numeric.pointwise(["x[i]","y[i]"],"ret[i] = round(x[i]/y[i])*y[i];","var round = Math.round;"),numeric.truncVS=numeric.pointwise(["x[i]","y"],"ret[i] = round(x[i]/y)*y;","var round = Math.round;"),numeric.truncSV=numeric.pointwise(["x","y[i]"],"ret[i] = round(x/y[i])*y[i];","var round = Math.round;"),numeric.trunc=function(e,t){return"object"==typeof e?"object"==typeof t?numeric.truncVV(e,t):numeric.truncVS(e,t):"object"==typeof t?numeric.truncSV(e,t):Math.round(e/t)*t},numeric.inv=function(e){var t,r,n,a,o,i,s,e,l=numeric.dim(e),u=Math.abs,c=l[0],f=l[1],d=numeric.clone(e),p=numeric.identity(c);for(i=0;f>i;++i){var h=-1,v=-1;for(o=i;o!==c;++o)s=u(d[o][i]),s>v&&(h=o,v=s);for(r=d[h],d[h]=d[i],d[i]=r,a=p[h],p[h]=p[i],p[i]=a,e=r[i],s=i;s!==f;++s)r[s]/=e;for(s=f-1;-1!==s;--s)a[s]/=e;for(o=c-1;-1!==o;--o)if(o!==i){for(t=d[o],n=p[o],e=t[i],s=i+1;s!==f;++s)t[s]-=r[s]*e;for(s=f-1;s>0;--s)n[s]-=a[s]*e,--s,n[s]-=a[s]*e;0===s&&(n[0]-=a[0]*e)}}return p},numeric.det=function(e){var t=numeric.dim(e);if(2!==t.length||t[0]!==t[1])throw new Error("numeric: det() only works on square matrices");var r,n,a,o,i,s,l,u,c=t[0],f=1,d=numeric.clone(e);for(n=0;c-1>n;n++){for(a=n,r=n+1;c>r;r++)Math.abs(d[r][n])>Math.abs(d[a][n])&&(a=r);for(a!==n&&(l=d[a],d[a]=d[n],d[n]=l,f*=-1),o=d[n],r=n+1;c>r;r++){for(i=d[r],s=i[n]/o[n],a=n+1;c-1>a;a+=2)u=a+1,i[a]-=o[a]*s,i[u]-=o[u]*s;a!==c&&(i[a]-=o[a]*s)}if(0===o[n])return 0;f*=o[n]}return f*d[n][n]},numeric.transpose=function(e){var t,r,n,a,o,i=e.length,s=e[0].length,l=Array(s);for(r=0;s>r;r++)l[r]=Array(i);for(t=i-1;t>=1;t-=2){for(a=e[t],n=e[t-1],r=s-1;r>=1;--r)o=l[r],o[t]=a[r],o[t-1]=n[r],--r,o=l[r],o[t]=a[r],o[t-1]=n[r];0===r&&(o=l[0],o[t]=a[0],o[t-1]=n[0])}if(0===t){for(n=e[0],r=s-1;r>=1;--r)l[r][0]=n[r],--r,l[r][0]=n[r];0===r&&(l[0][0]=n[0])}return l},numeric.negtranspose=function(e){var t,r,n,a,o,i=e.length,s=e[0].length,l=Array(s);for(r=0;s>r;r++)l[r]=Array(i);for(t=i-1;t>=1;t-=2){for(a=e[t],n=e[t-1],r=s-1;r>=1;--r)o=l[r],o[t]=-a[r],o[t-1]=-n[r],--r,o=l[r],o[t]=-a[r],o[t-1]=-n[r];0===r&&(o=l[0],o[t]=-a[0],o[t-1]=-n[0])}if(0===t){for(n=e[0],r=s-1;r>=1;--r)l[r][0]=-n[r],--r,l[r][0]=-n[r];0===r&&(l[0][0]=-n[0])}return l},numeric._random=function o(e,t){var r,n,a=e[t],i=Array(a);if(t===e.length-1){for(n=Math.random,r=a-1;r>=1;r-=2)i[r]=n(),i[r-1]=n();return 0===r&&(i[0]=n()),i}for(r=a-1;r>=0;r--)i[r]=o(e,t+1);return i},numeric.random=function(e){return numeric._random(e,0)},numeric.norm2=function(e){return Math.sqrt(numeric.norm2Squared(e))},numeric.linspace=function(e,t,r){if("undefined"==typeof r&&(r=Math.max(Math.round(t-e)+1,1)),2>r)return 1===r?[e]:[];var n,a=Array(r);for(r--,n=r;n>=0;n--)a[n]=(n*t+(r-n)*e)/r;return a},numeric.getBlock=function(e,t,r){function n(e,o){var i,s=t[o],l=r[o]-s,u=Array(l);if(o===a.length-1){for(i=l;i>=0;i--)u[i]=e[i+s];return u}for(i=l;i>=0;i--)u[i]=n(e[i+s],o+1);return u}var a=numeric.dim(e);return n(e,0)},numeric.setBlock=function(e,t,r,n){function a(e,n,i){var s,l=t[i],u=r[i]-l;if(i===o.length-1)for(s=u;s>=0;s--)e[s+l]=n[s];for(s=u;s>=0;s--)a(e[s+l],n[s],i+1)}var o=numeric.dim(e);return a(e,n,0),e},numeric.getRange=function(e,t,r){var n,a,o,i,s=t.length,l=r.length,u=Array(s);for(n=s-1;-1!==n;--n)for(u[n]=Array(l),o=u[n],i=e[t[n]],a=l-1;-1!==a;--a)o[a]=i[r[a]];return u},numeric.blockMatrix=function(e){var t=numeric.dim(e);if(t.length<4)return numeric.blockMatrix([e]);var r,n,a,o,i,s=t[0],l=t[1];for(r=0,n=0,a=0;s>a;++a)r+=e[a][0].length;for(o=0;l>o;++o)n+=e[0][o][0].length;var u=Array(r);for(a=0;r>a;++a)u[a]=Array(n);var c,f,d,p,h,v=0;for(a=0;s>a;++a){for(c=n,o=l-1;-1!==o;--o)for(i=e[a][o],c-=i[0].length,d=i.length-1;-1!==d;--d)for(h=i[d],f=u[v+d],p=h.length-1;-1!==p;--p)f[c+p]=h[p];v+=e[a][0].length}return u},numeric.tensor=function(e,t){if("number"==typeof e||"number"==typeof t)return numeric.mul(e,t);var r=numeric.dim(e),n=numeric.dim(t);if(1!==r.length||1!==n.length)throw new Error("numeric: tensor product is only defined for vectors");var a,o,i,s,l=r[0],u=n[0],c=Array(l);for(o=l-1;o>=0;o--){for(a=Array(u),s=e[o],i=u-1;i>=3;--i)a[i]=s*t[i],--i,a[i]=s*t[i],--i,a[i]=s*t[i],--i,a[i]=s*t[i];for(;i>=0;)a[i]=s*t[i],--i;c[o]=a}return c},numeric.T=function(e,t){this.x=e,this.y=t},numeric.t=function(e,t){return new numeric.T(e,t)},numeric.Tbinop=function(e,t,r,n,a){numeric.indexOf;if("string"!=typeof a){var o;a="";for(o in numeric)numeric.hasOwnProperty(o)&&(e.indexOf(o)>=0||t.indexOf(o)>=0||r.indexOf(o)>=0||n.indexOf(o)>=0)&&o.length>1&&(a+="var "+o+" = numeric."+o+";\n")}return Function(["y"],"var x = this;\nif(!(y instanceof numeric.T)) { y = new numeric.T(y); }\n"+a+"\nif(x.y) {  if(y.y) {    return new numeric.T("+n+");\n  }\n  return new numeric.T("+r+");\n}\nif(y.y) {\n  return new numeric.T("+t+");\n}\nreturn new numeric.T("+e+");\n")},numeric.T.prototype.add=numeric.Tbinop("add(x.x,y.x)","add(x.x,y.x),y.y","add(x.x,y.x),x.y","add(x.x,y.x),add(x.y,y.y)"),numeric.T.prototype.sub=numeric.Tbinop("sub(x.x,y.x)","sub(x.x,y.x),neg(y.y)","sub(x.x,y.x),x.y","sub(x.x,y.x),sub(x.y,y.y)"),numeric.T.prototype.mul=numeric.Tbinop("mul(x.x,y.x)","mul(x.x,y.x),mul(x.x,y.y)","mul(x.x,y.x),mul(x.y,y.x)","sub(mul(x.x,y.x),mul(x.y,y.y)),add(mul(x.x,y.y),mul(x.y,y.x))"),numeric.T.prototype.reciprocal=function(){var e=numeric.mul,t=numeric.div;if(this.y){var r=numeric.add(e(this.x,this.x),e(this.y,this.y));return new numeric.T(t(this.x,r),t(numeric.neg(this.y),r))}return new T(t(1,this.x))},numeric.T.prototype.div=function i(e){if(e instanceof numeric.T||(e=new numeric.T(e)),e.y)return this.mul(e.reciprocal());var i=numeric.div;return this.y?new numeric.T(i(this.x,e.x),i(this.y,e.x)):new numeric.T(i(this.x,e.x))},numeric.T.prototype.dot=numeric.Tbinop("dot(x.x,y.x)","dot(x.x,y.x),dot(x.x,y.y)","dot(x.x,y.x),dot(x.y,y.x)","sub(dot(x.x,y.x),dot(x.y,y.y)),add(dot(x.x,y.y),dot(x.y,y.x))"),numeric.T.prototype.transpose=function(){var e=numeric.transpose,t=this.x,r=this.y;return r?new numeric.T(e(t),e(r)):new numeric.T(e(t))},numeric.T.prototype.transjugate=function(){var e=numeric.transpose,t=this.x,r=this.y;return r?new numeric.T(e(t),numeric.negtranspose(r)):new numeric.T(e(t))},numeric.Tunop=function(e,t,r){return"string"!=typeof r&&(r=""),Function("var x = this;\n"+r+"\nif(x.y) {  "+t+";\n}\n"+e+";\n")},numeric.T.prototype.exp=numeric.Tunop("return new numeric.T(ex)","return new numeric.T(mul(cos(x.y),ex),mul(sin(x.y),ex))","var ex = numeric.exp(x.x), cos = numeric.cos, sin = numeric.sin, mul = numeric.mul;"),numeric.T.prototype.conj=numeric.Tunop("return new numeric.T(x.x);","return new numeric.T(x.x,numeric.neg(x.y));"),numeric.T.prototype.neg=numeric.Tunop("return new numeric.T(neg(x.x));","return new numeric.T(neg(x.x),neg(x.y));","var neg = numeric.neg;"),numeric.T.prototype.sin=numeric.Tunop("return new numeric.T(numeric.sin(x.x))","return x.exp().sub(x.neg().exp()).div(new numeric.T(0,2));"),numeric.T.prototype.cos=numeric.Tunop("return new numeric.T(numeric.cos(x.x))","return x.exp().add(x.neg().exp()).div(2);"),numeric.T.prototype.abs=numeric.Tunop("return new numeric.T(numeric.abs(x.x));","return new numeric.T(numeric.sqrt(numeric.add(mul(x.x,x.x),mul(x.y,x.y))));","var mul = numeric.mul;"),numeric.T.prototype.log=numeric.Tunop("return new numeric.T(numeric.log(x.x));","var theta = new numeric.T(numeric.atan2(x.y,x.x)), r = x.abs();\nreturn new numeric.T(numeric.log(r.x),theta.x);"),numeric.T.prototype.norm2=numeric.Tunop("return numeric.norm2(x.x);","var f = numeric.norm2Squared;\nreturn Math.sqrt(f(x.x)+f(x.y));"),numeric.T.prototype.inv=function(){var e=this;if("undefined"==typeof e.y)return new numeric.T(numeric.inv(e.x));var t,r,n,a,o,i,s,l,u,c,f,t,r,n,d,p,h,v,g,m,y,x=e.x.length,b=numeric.identity(x),w=numeric.rep([x,x],0),_=numeric.clone(e.x),k=numeric.clone(e.y);for(t=0;x>t;t++){for(h=_[t][t],v=k[t][t],d=h*h+v*v,n=t,r=t+1;x>r;r++)h=_[r][t],v=k[r][t],p=h*h+v*v,p>d&&(n=r,d=p);for(n!==t&&(y=_[t],_[t]=_[n],_[n]=y,y=k[t],k[t]=k[n],k[n]=y,y=b[t],b[t]=b[n],b[n]=y,y=w[t],w[t]=w[n],w[n]=y),a=_[t],o=k[t],l=b[t],u=w[t],h=a[t],v=o[t],r=t+1;x>r;r++)g=a[r],m=o[r],a[r]=(g*h+m*v)/d,o[r]=(m*h-g*v)/d;for(r=0;x>r;r++)g=l[r],m=u[r],l[r]=(g*h+m*v)/d,u[r]=(m*h-g*v)/d;for(r=t+1;x>r;r++){for(i=_[r],s=k[r],c=b[r],f=w[r],h=i[t],v=s[t],n=t+1;x>n;n++)g=a[n],m=o[n],i[n]-=g*h-m*v,s[n]-=m*h+g*v;for(n=0;x>n;n++)g=l[n],m=u[n],c[n]-=g*h-m*v,f[n]-=m*h+g*v}}for(t=x-1;t>0;t--)for(l=b[t],u=w[t],r=t-1;r>=0;r--)for(c=b[r],f=w[r],h=_[r][t],v=k[r][t],n=x-1;n>=0;n--)g=l[n],m=u[n],c[n]-=h*g-v*m,f[n]-=h*m+v*g;return new numeric.T(b,w)},numeric.T.prototype.get=function(e){var t,r=this.x,n=this.y,a=0,o=e.length;if(n){for(;o>a;)t=e[a],r=r[t],n=n[t],a++;return new numeric.T(r,n)}for(;o>a;)t=e[a],r=r[t],a++;return new numeric.T(r)},numeric.T.prototype.set=function(e,t){var r,n=this.x,a=this.y,o=0,i=e.length,s=t.x,l=t.y;if(0===i)return l?this.y=l:a&&(this.y=void 0),this.x=n,this;if(l){for(a||(a=numeric.rep(numeric.dim(n),0),this.y=a);i-1>o;)r=e[o],n=n[r],a=a[r],o++;return r=e[o],n[r]=s,a[r]=l,this}if(a){for(;i-1>o;)r=e[o],n=n[r],a=a[r],o++;return r=e[o],n[r]=s,a[r]=s instanceof Array?numeric.rep(numeric.dim(s),0):0,this}for(;i-1>o;)r=e[o],n=n[r],o++;return r=e[o],n[r]=s,this},numeric.T.prototype.getRows=function(e,t){var r,n,a=t-e+1,o=Array(a),i=this.x,s=this.y;for(r=e;t>=r;r++)o[r-e]=i[r];if(s){for(n=Array(a),r=e;t>=r;r++)n[r-e]=s[r];return new numeric.T(o,n)}return new numeric.T(o)},numeric.T.prototype.setRows=function(e,t,r){var n,a=this.x,o=this.y,i=r.x,s=r.y;for(n=e;t>=n;n++)a[n]=i[n-e];if(s)for(o||(o=numeric.rep(numeric.dim(a),0),this.y=o),n=e;t>=n;n++)o[n]=s[n-e];else if(o)for(n=e;t>=n;n++)o[n]=numeric.rep([i[n-e].length],0);return this},numeric.T.prototype.getRow=function(e){var t=this.x,r=this.y;return r?new numeric.T(t[e],r[e]):new numeric.T(t[e])},numeric.T.prototype.setRow=function(e,t){var r=this.x,n=this.y,a=t.x,o=t.y;return r[e]=a,o?(n||(n=numeric.rep(numeric.dim(r),0),this.y=n),n[e]=o):n&&(n=numeric.rep([a.length],0)),this},numeric.T.prototype.getBlock=function(e,t){var r=this.x,n=this.y,a=numeric.getBlock;return n?new numeric.T(a(r,e,t),a(n,e,t)):new numeric.T(a(r,e,t))},numeric.T.prototype.setBlock=function(e,t,r){r instanceof numeric.T||(r=new numeric.T(r));var n=this.x,a=this.y,o=numeric.setBlock,i=r.x,s=r.y;return s?(a||(this.y=numeric.rep(numeric.dim(this),0),a=this.y),o(n,e,t,i),o(a,e,t,s),this):(o(n,e,t,i),void(a&&o(a,e,t,numeric.rep(numeric.dim(i),0))))},numeric.T.rep=function(e,t){var r=numeric.T;t instanceof r||(t=new r(t));var n=t.x,a=t.y,o=numeric.rep;return a?new r(o(e,n),o(e,a)):new r(o(e,n))},numeric.T.diag=function s(e){e instanceof numeric.T||(e=new numeric.T(e));var t=e.x,r=e.y,s=numeric.diag;return r?new numeric.T(s(t),s(r)):new numeric.T(s(t))},numeric.T.eig=function(){if(this.y)throw new Error("eig: not implemented for complex matrices.");return numeric.eig(this.x)},numeric.T.identity=function(e){return new numeric.T(numeric.identity(e))},numeric.T.prototype.getDiag=function(){var e=numeric,t=this.x,r=this.y;return r?new e.T(e.getDiag(t),e.getDiag(r)):new e.T(e.getDiag(t))},numeric.house=function(e){var t=numeric.clone(e),r=e[0]>=0?1:-1,n=r*numeric.norm2(e);t[0]+=n;var a=numeric.norm2(t);if(0===a)throw new Error("eig: internal error");return numeric.div(t,a)},numeric.toUpperHessenberg=function(e){var t=numeric.dim(e);if(2!==t.length||t[0]!==t[1])throw new Error("numeric: toUpperHessenberg() only works on square matrices");var r,n,a,o,i,s,l,u,c,f,d=t[0],p=numeric.clone(e),h=numeric.identity(d);for(n=0;d-2>n;n++){for(o=Array(d-n-1),r=n+1;d>r;r++)o[r-n-1]=p[r][n];if(numeric.norm2(o)>0){for(i=numeric.house(o),s=numeric.getBlock(p,[n+1,n],[d-1,d-1]),l=numeric.tensor(i,numeric.dot(i,s)),r=n+1;d>r;r++)for(u=p[r],c=l[r-n-1],a=n;d>a;a++)u[a]-=2*c[a-n];for(s=numeric.getBlock(p,[0,n+1],[d-1,d-1]),l=numeric.tensor(numeric.dot(s,i),i),r=0;d>r;r++)for(u=p[r],c=l[r],a=n+1;d>a;a++)u[a]-=2*c[a-n-1];for(s=Array(d-n-1),r=n+1;d>r;r++)s[r-n-1]=h[r];for(l=numeric.tensor(i,numeric.dot(i,s)),r=n+1;d>r;r++)for(f=h[r],c=l[r-n-1],a=0;d>a;a++)f[a]-=2*c[a]}}return{H:p,Q:h}},numeric.epsilon=2.220446049250313e-16,numeric.QRFrancis=function(e,t){"undefined"==typeof t&&(t=1e4),e=numeric.clone(e);var r,n,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b=(numeric.clone(e),numeric.dim(e)),w=b[0],_=numeric.identity(w);if(3>w)return{Q:_,B:[[0,w-1]]};var k=numeric.epsilon;for(x=0;t>x;x++){for(m=0;w-1>m;m++)if(Math.abs(e[m+1][m])<k*(Math.abs(e[m][m])+Math.abs(e[m+1][m+1]))){var z=numeric.QRFrancis(numeric.getBlock(e,[0,0],[m,m]),t),A=numeric.QRFrancis(numeric.getBlock(e,[m+1,m+1],[w-1,w-1]),t);for(p=Array(m+1),g=0;m>=g;g++)p[g]=_[g];for(h=numeric.dot(z.Q,p),g=0;m>=g;g++)_[g]=h[g];for(p=Array(w-m-1),g=m+1;w>g;g++)p[g-m-1]=_[g];for(h=numeric.dot(A.Q,p),g=m+1;w>g;g++)_[g]=h[g-m-1];return{Q:_,B:z.B.concat(numeric.add(A.B,m+1))}}if(a=e[w-2][w-2],o=e[w-2][w-1],i=e[w-1][w-2],s=e[w-1][w-1],u=a+s,l=a*s-o*i,c=numeric.getBlock(e,[0,0],[2,2]),u*u>=4*l){var j,M;j=.5*(u+Math.sqrt(u*u-4*l)),M=.5*(u-Math.sqrt(u*u-4*l)),c=numeric.add(numeric.sub(numeric.dot(c,c),numeric.mul(c,j+M)),numeric.diag(numeric.rep([3],j*M)))}else c=numeric.add(numeric.sub(numeric.dot(c,c),numeric.mul(c,u)),numeric.diag(numeric.rep([3],l)));for(r=[c[0][0],c[1][0],c[2][0]],n=numeric.house(r),p=[e[0],e[1],e[2]],h=numeric.tensor(n,numeric.dot(n,p)),g=0;3>g;g++)for(d=e[g],v=h[g],y=0;w>y;y++)d[y]-=2*v[y];for(p=numeric.getBlock(e,[0,0],[w-1,2]),h=numeric.tensor(numeric.dot(p,n),n),g=0;w>g;g++)for(d=e[g],v=h[g],y=0;3>y;y++)d[y]-=2*v[y];for(p=[_[0],_[1],_[2]],h=numeric.tensor(n,numeric.dot(n,p)),g=0;3>g;g++)for(f=_[g],v=h[g],y=0;w>y;y++)f[y]-=2*v[y];var E;for(m=0;w-2>m;m++){for(y=m;m+1>=y;y++)if(Math.abs(e[y+1][y])<k*(Math.abs(e[y][y])+Math.abs(e[y+1][y+1]))){var z=numeric.QRFrancis(numeric.getBlock(e,[0,0],[y,y]),t),A=numeric.QRFrancis(numeric.getBlock(e,[y+1,y+1],[w-1,w-1]),t);for(p=Array(y+1),g=0;y>=g;g++)p[g]=_[g];for(h=numeric.dot(z.Q,p),g=0;y>=g;g++)_[g]=h[g];for(p=Array(w-y-1),g=y+1;w>g;g++)p[g-y-1]=_[g];for(h=numeric.dot(A.Q,p),g=y+1;w>g;g++)_[g]=h[g-y-1];return{Q:_,B:z.B.concat(numeric.add(A.B,y+1))}}for(E=Math.min(w-1,m+3),r=Array(E-m),g=m+1;E>=g;g++)r[g-m-1]=e[g][m];for(n=numeric.house(r),p=numeric.getBlock(e,[m+1,m],[E,w-1]),h=numeric.tensor(n,numeric.dot(n,p)),g=m+1;E>=g;g++)for(d=e[g],v=h[g-m-1],y=m;w>y;y++)d[y]-=2*v[y-m];for(p=numeric.getBlock(e,[0,m+1],[w-1,E]),h=numeric.tensor(numeric.dot(p,n),n),g=0;w>g;g++)for(d=e[g],v=h[g],y=m+1;E>=y;y++)d[y]-=2*v[y-m-1];for(p=Array(E-m),g=m+1;E>=g;g++)p[g-m-1]=_[g];for(h=numeric.tensor(n,numeric.dot(n,p)),g=m+1;E>=g;g++)for(f=_[g],v=h[g-m-1],y=0;w>y;y++)f[y]-=2*v[y]}}throw new Error("numeric: eigenvalue iteration does not converge -- increase maxiter?")},numeric.eig=function(e,t){var r,n,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x=numeric.toUpperHessenberg(e),b=numeric.QRFrancis(x.H,t),w=numeric.T,_=e.length,k=b.B,z=numeric.dot(b.Q,numeric.dot(x.H,numeric.transpose(b.Q))),A=new w(numeric.dot(b.Q,x.Q)),j=k.length,M=Math.sqrt;for(n=0;j>n;n++)if(r=k[n][0],r===k[n][1]);else{if(o=r+1,i=z[r][r],s=z[r][o],l=z[o][r],u=z[o][o],0===s&&0===l)continue;c=-i-u,f=i*u-s*l,d=c*c-4*f,d>=0?(p=0>c?-.5*(c-M(d)):-.5*(c+M(d)),m=(i-p)*(i-p)+s*s,y=l*l+(u-p)*(u-p),m>y?(m=M(m),v=(i-p)/m,g=s/m):(y=M(y),v=l/y,g=(u-p)/y),a=new w([[g,-v],[v,g]]),A.setRows(r,o,a.dot(A.getRows(r,o)))):(p=-.5*c,h=.5*M(-d),m=(i-p)*(i-p)+s*s,y=l*l+(u-p)*(u-p),m>y?(m=M(m+h*h),v=(i-p)/m,g=s/m,p=0,h/=m):(y=M(y+h*h),v=l/y,g=(u-p)/y,p=h/y,h=0),a=new w([[g,-v],[v,g]],[[p,h],[h,-p]]),A.setRows(r,o,a.dot(A.getRows(r,o))))}var E=A.dot(e).dot(A.transjugate()),_=e.length,O=numeric.T.identity(_);for(o=0;_>o;o++)if(o>0)for(n=o-1;n>=0;n--){var S=E.get([n,n]),F=E.get([o,o]);numeric.neq(S.x,F.x)||numeric.neq(S.y,F.y)?(p=E.getRow(n).getBlock([n],[o-1]),h=O.getRow(o).getBlock([n],[o-1]),O.set([o,n],E.get([n,o]).neg().sub(p.dot(h)).div(S.sub(F)))):O.setRow(o,O.getRow(n))}for(o=0;_>o;o++)p=O.getRow(o),O.setRow(o,p.div(p.norm2()));return O=O.transpose(),O=A.transjugate().dot(O),{lambda:E.getDiag(),E:O}},numeric.ccsSparse=function(e){var t,r,n,a,o=e.length,i=[];for(n=o-1;-1!==n;--n){r=e[n];for(a in r){for(a=parseInt(a);a>=i.length;)i[i.length]=0;0!==r[a]&&i[a]++}}var t=i.length,s=Array(t+1);for(s[0]=0,n=0;t>n;++n)s[n+1]=s[n]+i[n];var l=Array(s[t]),u=Array(s[t]);for(n=o-1;-1!==n;--n){r=e[n];for(a in r)0!==r[a]&&(i[a]--,l[s[a]+i[a]]=n,u[s[a]+i[a]]=r[a])}return[s,l,u]},numeric.ccsFull=function(e){var t,r,n,a,o=e[0],i=e[1],s=e[2],l=numeric.ccsDim(e),u=l[0],c=l[1],f=numeric.rep([u,c],0);for(t=0;c>t;t++)for(n=o[t],a=o[t+1],r=n;a>r;++r)f[i[r]][t]=s[r];return f},numeric.ccsTSolve=function(e,t,r,n,a){function o(e){var t;if(0===r[e]){for(r[e]=1,t=i[e];t<i[e+1];++t)o(s[t]);a[f]=e,++f}}var i=e[0],s=e[1],l=e[2],u=i.length-1,c=Math.max,f=0;"undefined"==typeof n&&(r=numeric.rep([u],0)),"undefined"==typeof n&&(n=numeric.linspace(0,r.length-1)),"undefined"==typeof a&&(a=[]);var d,p,h,v,g,m,y;for(d=n.length-1;-1!==d;--d)o(n[d]);for(a.length=f,d=a.length-1;-1!==d;--d)r[a[d]]=0;for(d=n.length-1;-1!==d;--d)p=n[d],r[p]=t[p];for(d=a.length-1;-1!==d;--d){for(p=a[d],h=i[p],v=c(i[p+1],h),g=h;g!==v;++g)if(s[g]===p){r[p]/=l[g];break}for(y=r[p],g=h;g!==v;++g)m=s[g],m!==p&&(r[m]-=y*l[g])}return r},numeric.ccsDFS=function(e){this.k=Array(e),this.k1=Array(e),this.j=Array(e)},numeric.ccsDFS.prototype.dfs=function(e,t,r,n,a,o){var i,s,l,u=0,c=a.length,f=this.k,d=this.k1,p=this.j;if(0===n[e])for(n[e]=1,p[0]=e,f[0]=s=t[e],d[0]=l=t[e+1];;)if(s>=l){if(a[c]=p[u],0===u)return;++c,--u,s=f[u],l=d[u]}else i=o[r[s]],0===n[i]?(n[i]=1,f[u]=s,++u,p[u]=i,s=t[i],d[u]=l=t[i+1]):++s},numeric.ccsLPSolve=function(e,t,r,n,a,o,i){var s,l,u,c,f,d,p,h,v,g=e[0],m=e[1],y=e[2],x=(g.length-1,t[0]),b=t[1],w=t[2];for(l=x[a],u=x[a+1],n.length=0,s=l;u>s;++s)i.dfs(o[b[s]],g,m,r,n,o);for(s=n.length-1;-1!==s;--s)r[n[s]]=0;for(s=l;s!==u;++s)c=o[b[s]],r[c]=w[s];for(s=n.length-1;-1!==s;--s){for(c=n[s],f=g[c],d=g[c+1],p=f;d>p;++p)if(o[m[p]]===c){r[c]/=y[p];break}for(v=r[c],p=f;d>p;++p)h=o[m[p]],h!==c&&(r[h]-=v*y[p])}return r},numeric.ccsLUP1=function(e,t){var r,n,a,o,i,s,l,u=e[0].length-1,c=[numeric.rep([u+1],0),[],[]],f=[numeric.rep([u+1],0),[],[]],d=c[0],p=c[1],h=c[2],v=f[0],g=f[1],m=f[2],y=numeric.rep([u],0),x=numeric.rep([u],0),b=numeric.ccsLPSolve,w=(Math.max,Math.abs),_=numeric.linspace(0,u-1),k=numeric.linspace(0,u-1),z=new numeric.ccsDFS(u);for("undefined"==typeof t&&(t=1),r=0;u>r;++r){for(b(c,e,y,x,r,k,z),o=-1,i=-1,n=x.length-1;-1!==n;--n)a=x[n],r>=a||(s=w(y[a]),s>o&&(i=a,o=s));for(w(y[r])<t*o&&(n=_[r],o=_[i],_[r]=o,k[o]=r,_[i]=n,k[n]=i,o=y[r],y[r]=y[i],y[i]=o),o=d[r],i=v[r],l=y[r],p[o]=_[r],h[o]=1,++o,n=x.length-1;-1!==n;--n)a=x[n],s=y[a],x[n]=0,y[a]=0,r>=a?(g[i]=a,m[i]=s,++i):(p[o]=_[a],h[o]=s/l,++o);d[r+1]=o,v[r+1]=i}for(n=p.length-1;-1!==n;--n)p[n]=k[p[n]];return{L:c,U:f,P:_,Pinv:k}},numeric.ccsDFS0=function(e){this.k=Array(e),this.k1=Array(e),this.j=Array(e)},numeric.ccsDFS0.prototype.dfs=function(e,t,r,n,a,o,i){var s,l,u,c=0,f=a.length,d=this.k,p=this.k1,h=this.j;if(0===n[e])for(n[e]=1,h[0]=e,d[0]=l=t[o[e]],p[0]=u=t[o[e]+1];;){if(isNaN(l))throw new Error("Ow!");if(l>=u){if(a[f]=o[h[c]],0===c)return;++f,--c,l=d[c],u=p[c]}else s=r[l],0===n[s]?(n[s]=1,d[c]=l,++c,h[c]=s,s=o[s],l=t[s],p[c]=u=t[s+1]):++l}},numeric.ccsLPSolve0=function(e,t,r,n,a,o,i,s){var l,u,c,f,d,p,h,v,g,m=e[0],y=e[1],x=e[2],b=(m.length-1,t[0]),w=t[1],_=t[2];for(u=b[a],c=b[a+1],n.length=0,l=u;c>l;++l)s.dfs(w[l],m,y,r,n,o,i);for(l=n.length-1;-1!==l;--l)f=n[l],r[i[f]]=0;for(l=u;l!==c;++l)f=w[l],r[f]=_[l];for(l=n.length-1;-1!==l;--l){for(f=n[l],v=i[f],d=m[f],p=m[f+1],h=d;p>h;++h)if(y[h]===v){r[v]/=x[h];break}for(g=r[v],h=d;p>h;++h)r[y[h]]-=g*x[h];r[v]=g}},numeric.ccsLUP0=function(e,t){var r,n,a,o,i,s,l,u=e[0].length-1,c=[numeric.rep([u+1],0),[],[]],f=[numeric.rep([u+1],0),[],[]],d=c[0],p=c[1],h=c[2],v=f[0],g=f[1],m=f[2],y=numeric.rep([u],0),x=numeric.rep([u],0),b=numeric.ccsLPSolve0,w=(Math.max,Math.abs),_=numeric.linspace(0,u-1),k=numeric.linspace(0,u-1),z=new numeric.ccsDFS0(u);for("undefined"==typeof t&&(t=1),r=0;u>r;++r){for(b(c,e,y,x,r,k,_,z),o=-1,i=-1,n=x.length-1;-1!==n;--n)a=x[n],r>=a||(s=w(y[_[a]]),s>o&&(i=a,o=s));for(w(y[_[r]])<t*o&&(n=_[r],o=_[i],_[r]=o,k[o]=r,_[i]=n,k[n]=i),o=d[r],i=v[r],l=y[_[r]],p[o]=_[r],h[o]=1,++o,n=x.length-1;-1!==n;--n)a=x[n],s=y[_[a]],x[n]=0,y[_[a]]=0,r>=a?(g[i]=a,m[i]=s,++i):(p[o]=_[a],h[o]=s/l,++o);d[r+1]=o,v[r+1]=i}for(n=p.length-1;-1!==n;--n)p[n]=k[p[n]];return{L:c,U:f,P:_,Pinv:k}},numeric.ccsLUP=numeric.ccsLUP0,numeric.ccsDim=function(e){return[numeric.sup(e[1])+1,e[0].length-1]},numeric.ccsGetBlock=function(e,t,r){var n=numeric.ccsDim(e),a=n[0],o=n[1];"undefined"==typeof t?t=numeric.linspace(0,a-1):"number"==typeof t&&(t=[t]),"undefined"==typeof r?r=numeric.linspace(0,o-1):"number"==typeof r&&(r=[r]);var i,s,l,u,c,f=t.length,d=r.length,p=numeric.rep([o],0),h=[],v=[],g=[p,h,v],m=e[0],y=e[1],x=e[2],b=numeric.rep([a],0),w=0,_=numeric.rep([a],0);for(s=0;d>s;++s){u=r[s];var k=m[u],z=m[u+1];for(i=k;z>i;++i)l=y[i],_[l]=1,b[l]=x[i];for(i=0;f>i;++i)c=t[i],_[c]&&(h[w]=i,v[w]=b[t[i]],++w);for(i=k;z>i;++i)l=y[i],_[l]=0;p[s+1]=w}return g},numeric.ccsDot=function(e,t){var r,n,a,o,i,s,l,u,c,f,d,p=e[0],h=e[1],v=e[2],g=t[0],m=t[1],y=t[2],x=numeric.ccsDim(e),b=numeric.ccsDim(t),w=x[0],_=(x[1],b[1]),k=numeric.rep([w],0),z=numeric.rep([w],0),A=Array(w),j=numeric.rep([_],0),M=[],E=[],O=[j,M,E];for(a=0;a!==_;++a){for(o=g[a],i=g[a+1],c=0,n=o;i>n;++n)for(f=m[n],d=y[n],s=p[f],l=p[f+1],r=s;l>r;++r)u=h[r],0===z[u]&&(A[c]=u,z[u]=1,c+=1),k[u]=k[u]+v[r]*d;for(o=j[a],i=o+c,j[a+1]=i,n=c-1;-1!==n;--n)d=o+n,r=A[n],M[d]=r,E[d]=k[r],z[r]=0,k[r]=0;j[a+1]=j[a]+c}return O},numeric.ccsLUPSolve=function(e,t){var r=e.L,n=e.U,a=(e.P,t[0]),o=!1;"object"!=typeof a&&(t=[[0,t.length],numeric.linspace(0,t.length-1),t],a=t[0],o=!0);var i,s,l,u,c,f,d=t[1],p=t[2],h=r[0].length-1,v=a.length-1,g=numeric.rep([h],0),m=Array(h),y=numeric.rep([h],0),x=Array(h),b=numeric.rep([v+1],0),w=[],_=[],k=numeric.ccsTSolve,z=0;for(i=0;v>i;++i){for(c=0,l=a[i],u=a[i+1],s=l;u>s;++s)f=e.Pinv[d[s]],x[c]=f,y[f]=p[s],++c;for(x.length=c,k(r,y,g,x,m),s=x.length-1;-1!==s;--s)y[x[s]]=0;if(k(n,g,y,m,x),o)return y;for(s=m.length-1;-1!==s;--s)g[m[s]]=0;for(s=x.length-1;-1!==s;--s)f=x[s],w[z]=f,_[z]=y[f],y[f]=0,++z;b[i+1]=z}return[b,w,_]},numeric.ccsbinop=function(e,t){return"undefined"==typeof t&&(t=""),Function("X","Y","var Xi = X[0], Xj = X[1], Xv = X[2];\nvar Yi = Y[0], Yj = Y[1], Yv = Y[2];\nvar n = Xi.length-1,m = Math.max(numeric.sup(Xj),numeric.sup(Yj))+1;\nvar Zi = numeric.rep([n+1],0), Zj = [], Zv = [];\nvar x = numeric.rep([m],0),y = numeric.rep([m],0);\nvar xk,yk,zk;\nvar i,j,j0,j1,k,p=0;\n"+t+"for(i=0;i<n;++i) {\n  j0 = Xi[i]; j1 = Xi[i+1];\n  for(j=j0;j!==j1;++j) {\n    k = Xj[j];\n    x[k] = 1;\n    Zj[p] = k;\n    ++p;\n  }\n  j0 = Yi[i]; j1 = Yi[i+1];\n  for(j=j0;j!==j1;++j) {\n    k = Yj[j];\n    y[k] = Yv[j];\n    if(x[k] === 0) {\n      Zj[p] = k;\n      ++p;\n    }\n  }\n  Zi[i+1] = p;\n  j0 = Xi[i]; j1 = Xi[i+1];\n  for(j=j0;j!==j1;++j) x[Xj[j]] = Xv[j];\n  j0 = Zi[i]; j1 = Zi[i+1];\n  for(j=j0;j!==j1;++j) {\n    k = Zj[j];\n    xk = x[k];\n    yk = y[k];\n"+e+"\n    Zv[j] = zk;\n  }\n  j0 = Xi[i]; j1 = Xi[i+1];\n  for(j=j0;j!==j1;++j) x[Xj[j]] = 0;\n  j0 = Yi[i]; j1 = Yi[i+1];\n  for(j=j0;j!==j1;++j) y[Yj[j]] = 0;\n}\nreturn [Zi,Zj,Zv];")},function(){var k,A,B,C;for(k in numeric.ops2)A=isFinite(eval("1"+numeric.ops2[k]+"0"))?"[Y[0],Y[1],numeric."+k+"(X,Y[2])]":"NaN",B=isFinite(eval("0"+numeric.ops2[k]+"1"))?"[X[0],X[1],numeric."+k+"(X[2],Y)]":"NaN",C=isFinite(eval("1"+numeric.ops2[k]+"0"))&&isFinite(eval("0"+numeric.ops2[k]+"1"))?"numeric.ccs"+k+"MM(X,Y)":"NaN",numeric["ccs"+k+"MM"]=numeric.ccsbinop("zk = xk "+numeric.ops2[k]+"yk;"),numeric["ccs"+k]=Function("X","Y",'if(typeof X === "number") return '+A+';\nif(typeof Y === "number") return '+B+";\nreturn "+C+";\n");

}(),numeric.ccsScatter=function(e){var t,r=e[0],n=e[1],a=e[2],o=numeric.sup(n)+1,i=r.length,s=numeric.rep([o],0),l=Array(i),u=Array(i),c=numeric.rep([o],0);for(t=0;i>t;++t)c[n[t]]++;for(t=0;o>t;++t)s[t+1]=s[t]+c[t];var f,d,p=s.slice(0);for(t=0;i>t;++t)d=n[t],f=p[d],l[f]=r[t],u[f]=a[t],p[d]=p[d]+1;return[s,l,u]},numeric.ccsGather=function(e){var t,r,n,a,o,i=e[0],s=e[1],l=e[2],u=i.length-1,c=s.length,f=Array(c),d=Array(c),p=Array(c);for(o=0,t=0;u>t;++t)for(n=i[t],a=i[t+1],r=n;r!==a;++r)d[o]=t,f[o]=s[r],p[o]=l[r],++o;return[f,d,p]},numeric.sdim=function l(e,t,r){if("undefined"==typeof t&&(t=[]),"object"!=typeof e)return t;"undefined"==typeof r&&(r=0),r in t||(t[r]=0),e.length>t[r]&&(t[r]=e.length);var n;for(n in e)e.hasOwnProperty(n)&&l(e[n],t,r+1);return t},numeric.sclone=function u(e,t,r){"undefined"==typeof t&&(t=0),"undefined"==typeof r&&(r=numeric.sdim(e).length);var n,a=Array(e.length);if(t===r-1){for(n in e)e.hasOwnProperty(n)&&(a[n]=e[n]);return a}for(n in e)e.hasOwnProperty(n)&&(a[n]=u(e[n],t+1,r));return a},numeric.sdiag=function(e){var t,r,n=e.length,a=Array(n);for(t=n-1;t>=1;t-=2)r=t-1,a[t]=[],a[t][t]=e[t],a[r]=[],a[r][r]=e[r];return 0===t&&(a[0]=[],a[0][0]=e[t]),a},numeric.sidentity=function(e){return numeric.sdiag(numeric.rep([e],1))},numeric.stranspose=function(e){{var t,r,n,a=[];e.length}for(t in e)if(e.hasOwnProperty(t)){n=e[t];for(r in n)n.hasOwnProperty(r)&&("object"!=typeof a[r]&&(a[r]=[]),a[r][t]=n[r])}return a},numeric.sLUP=function(e,t){throw new Error("The function numeric.sLUP had a bug in it and has been removed. Please use the new numeric.ccsLUP function instead.")},numeric.sdotMM=function(e,t){var r,n,a,o,i,s,l,u=e.length,c=(t.length,numeric.stranspose(t)),f=c.length,d=Array(u);for(a=u-1;a>=0;a--){for(l=[],r=e[a],i=f-1;i>=0;i--){s=0,n=c[i];for(o in r)r.hasOwnProperty(o)&&o in n&&(s+=r[o]*n[o]);s&&(l[i]=s)}d[a]=l}return d},numeric.sdotMV=function(e,t){var r,n,a,o,i=e.length,s=Array(i);for(n=i-1;n>=0;n--){r=e[n],o=0;for(a in r)r.hasOwnProperty(a)&&t[a]&&(o+=r[a]*t[a]);o&&(s[n]=o)}return s},numeric.sdotVM=function(e,t){var r,n,a,o,i=[];for(r in e)if(e.hasOwnProperty(r)){a=t[r],o=e[r];for(n in a)a.hasOwnProperty(n)&&(i[n]||(i[n]=0),i[n]+=o*a[n])}return i},numeric.sdotVV=function(e,t){var r,n=0;for(r in e)e[r]&&t[r]&&(n+=e[r]*t[r]);return n},numeric.sdot=function(e,t){var r=numeric.sdim(e).length,n=numeric.sdim(t).length,a=1e3*r+n;switch(a){case 0:return e*t;case 1001:return numeric.sdotVV(e,t);case 2001:return numeric.sdotMV(e,t);case 1002:return numeric.sdotVM(e,t);case 2002:return numeric.sdotMM(e,t);default:throw new Error("numeric.sdot not implemented for tensors of order "+r+" and "+n)}},numeric.sscatter=function(e){var t,r,n,a,o=e[0].length,i=e.length,s=[];for(r=o-1;r>=0;--r)if(e[i-1][r]){for(a=s,n=0;i-2>n;n++)t=e[n][r],a[t]||(a[t]=[]),a=a[t];a[e[n][r]]=e[n+1][r]}return s},numeric.sgather=function c(e,t,r){"undefined"==typeof t&&(t=[]),"undefined"==typeof r&&(r=[]);var n,a,o;n=r.length;for(a in e)if(e.hasOwnProperty(a))if(r[n]=parseInt(a),o=e[a],"number"==typeof o){if(o){if(0===t.length)for(a=n+1;a>=0;--a)t[a]=[];for(a=n;a>=0;--a)t[a].push(r[a]);t[n+1].push(o)}}else c(o,t,r);return r.length>n&&r.pop(),t},numeric.cLU=function(e){var t,r,n,a,o,i,s=e[0],l=e[1],u=e[2],c=s.length,f=0;for(t=0;c>t;t++)s[t]>f&&(f=s[t]);f++;var d,p,h,v=Array(f),g=Array(f),m=numeric.rep([f],1/0),y=numeric.rep([f],-(1/0));for(n=0;c>n;n++)t=s[n],r=l[n],r<m[t]&&(m[t]=r),r>y[t]&&(y[t]=r);for(t=0;f-1>t;t++)y[t]>y[t+1]&&(y[t+1]=y[t]);for(t=f-1;t>=1;t--)m[t]<m[t-1]&&(m[t-1]=m[t]);var x=0,b=0;for(t=0;f>t;t++)g[t]=numeric.rep([y[t]-m[t]+1],0),v[t]=numeric.rep([t-m[t]],0),x+=t-m[t]+1,b+=y[t]-t+1;for(n=0;c>n;n++)t=s[n],g[t][l[n]-m[t]]=u[n];for(t=0;f-1>t;t++)for(a=t-m[t],d=g[t],r=t+1;m[r]<=t&&f>r;r++)if(o=t-m[r],i=y[t]-t,p=g[r],h=p[o]/d[a]){for(n=1;i>=n;n++)p[n+o]-=h*d[n+a];v[r][t-m[r]]=h}var c,w,_,d=[],p=[],k=[],z=[],A=[],j=[];for(c=0,w=0,t=0;f>t;t++){for(a=m[t],o=y[t],_=g[t],r=t;o>=r;r++)_[r-a]&&(d[c]=t,p[c]=r,k[c]=_[r-a],c++);for(_=v[t],r=a;t>r;r++)_[r-a]&&(z[w]=t,A[w]=r,j[w]=_[r-a],w++);z[w]=t,A[w]=t,j[w]=1,w++}return{U:[d,p,k],L:[z,A,j]}},numeric.cLUsolve=function(e,t){var r,n,a=e.L,o=e.U,i=numeric.clone(t),s=a[0],l=a[1],u=a[2],c=o[0],f=o[1],d=o[2],p=c.length,h=(s.length,i.length);for(n=0,r=0;h>r;r++){for(;l[n]<r;)i[r]-=u[n]*i[l[n]],n++;n++}for(n=p-1,r=h-1;r>=0;r--){for(;f[n]>r;)i[r]-=d[n]*i[f[n]],n--;i[r]/=d[n],n--}return i},numeric.cgrid=function(e,t){"number"==typeof e&&(e=[e,e]);var r,n,a,o=numeric.rep(e,-1);if("function"!=typeof t)switch(t){case"L":t=function(t,r){return t>=e[0]/2||r<e[1]/2};break;default:t=function(e,t){return!0}}for(a=0,r=1;r<e[0]-1;r++)for(n=1;n<e[1]-1;n++)t(r,n)&&(o[r][n]=a,a++);return o},numeric.cdelsq=function(e){var t,r,n,a,o,i=[[-1,0],[0,-1],[0,1],[1,0]],s=numeric.dim(e),l=s[0],u=s[1],c=[],f=[],d=[];for(t=1;l-1>t;t++)for(r=1;u-1>r;r++)if(!(e[t][r]<0)){for(n=0;4>n;n++)a=t+i[n][0],o=r+i[n][1],e[a][o]<0||(c.push(e[t][r]),f.push(e[a][o]),d.push(-1));c.push(e[t][r]),f.push(e[t][r]),d.push(4)}return[c,f,d]},numeric.cdotMV=function(e,t){var r,n,a,o=e[0],i=e[1],s=e[2],l=o.length;for(a=0,n=0;l>n;n++)o[n]>a&&(a=o[n]);for(a++,r=numeric.rep([a],0),n=0;l>n;n++)r[o[n]]+=s[n]*t[i[n]];return r},numeric.Spline=function(e,t,r,n,a){this.x=e,this.yl=t,this.yr=r,this.kl=n,this.kr=a},numeric.Spline.prototype._at=function(e,t){var e,r,n,a,o=this.x,i=this.yl,s=this.yr,l=this.kl,u=this.kr,c=numeric.add,f=numeric.sub,d=numeric.mul;r=f(d(l[t],o[t+1]-o[t]),f(s[t+1],i[t])),n=c(d(u[t+1],o[t]-o[t+1]),f(s[t+1],i[t])),a=(e-o[t])/(o[t+1]-o[t]);var p=a*(1-a);return c(c(c(d(1-a,i[t]),d(a,s[t+1])),d(r,p*(1-a))),d(n,p*a))},numeric.Spline.prototype.at=function(e){if("number"==typeof e){var t,r,n,a=this.x,o=a.length,i=Math.floor;for(t=0,r=o-1;r-t>1;)n=i((t+r)/2),a[n]<=e?t=n:r=n;return this._at(e,t)}var s,o=e.length,l=Array(o);for(s=o-1;-1!==s;--s)l[s]=this.at(e[s]);return l},numeric.Spline.prototype.diff=function(){var e,t,r,n=this.x,a=this.yl,o=this.yr,i=this.kl,s=this.kr,l=a.length,u=i,c=s,f=Array(l),d=Array(l),p=numeric.add,h=numeric.mul,v=numeric.div,g=numeric.sub;for(e=l-1;-1!==e;--e)t=n[e+1]-n[e],r=g(o[e+1],a[e]),f[e]=v(p(h(r,6),h(i[e],-4*t),h(s[e+1],-2*t)),t*t),d[e+1]=v(p(h(r,-6),h(i[e],2*t),h(s[e+1],4*t)),t*t);return new numeric.Spline(n,u,c,f,d)},numeric.Spline.prototype.roots=function(){function e(e){return e*e}var t=[],r=this.x,n=this.yl,a=this.yr,o=this.kl,i=this.kr;"number"==typeof n[0]&&(n=[n],a=[a],o=[o],i=[i]);var s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F=n.length,T=r.length-1,t=Array(F),B=Math.sqrt;for(s=0;s!==F;++s){for(c=n[s],f=a[s],d=o[s],p=i[s],h=[],l=0;l!==T;l++){for(l>0&&f[l]*c[l]<0&&h.push(r[l]),_=r[l+1]-r[l],k=r[l],m=c[l],y=f[l+1],v=d[l]/_,g=p[l+1]/_,w=e(v-g+3*(m-y))+12*g*m,x=g+3*m+2*v-3*y,b=3*(g+v+2*(m-y)),0>=w?(A=x/b,z=A>r[l]&&A<r[l+1]?[r[l],A,r[l+1]]:[r[l],r[l+1]]):(A=(x-B(w))/b,j=(x+B(w))/b,z=[r[l]],A>r[l]&&A<r[l+1]&&z.push(A),j>r[l]&&j<r[l+1]&&z.push(j),z.push(r[l+1])),E=z[0],A=this._at(E,l),u=0;u<z.length-1;u++)if(O=z[u+1],j=this._at(O,l),0!==A)if(0===j||A*j>0)E=O,A=j;else{for(var C=0;;){if(S=(A*O-j*E)/(A-j),E>=S||S>=O)break;if(M=this._at(S,l),M*j>0)O=S,j=M,-1===C&&(A*=.5),C=-1;else{if(!(M*A>0))break;E=S,A=M,1===C&&(j*=.5),C=1}}h.push(S),E=z[u+1],A=this._at(E,l)}else h.push(E),E=O,A=j;0===j&&h.push(O)}t[s]=h}return"number"==typeof this.yl[0]?t[0]:t},numeric.spline=function(e,t,r,n){var a,o=e.length,i=[],s=[],l=[],u=numeric.sub,c=numeric.mul,f=numeric.add;for(a=o-2;a>=0;a--)s[a]=e[a+1]-e[a],l[a]=u(t[a+1],t[a]);("string"==typeof r||"string"==typeof n)&&(r=n="periodic");var d=[[],[],[]];switch(typeof r){case"undefined":i[0]=c(3/(s[0]*s[0]),l[0]),d[0].push(0,0),d[1].push(0,1),d[2].push(2/s[0],1/s[0]);break;case"string":i[0]=f(c(3/(s[o-2]*s[o-2]),l[o-2]),c(3/(s[0]*s[0]),l[0])),d[0].push(0,0,0),d[1].push(o-2,0,1),d[2].push(1/s[o-2],2/s[o-2]+2/s[0],1/s[0]);break;default:i[0]=r,d[0].push(0),d[1].push(0),d[2].push(1)}for(a=1;o-1>a;a++)i[a]=f(c(3/(s[a-1]*s[a-1]),l[a-1]),c(3/(s[a]*s[a]),l[a])),d[0].push(a,a,a),d[1].push(a-1,a,a+1),d[2].push(1/s[a-1],2/s[a-1]+2/s[a],1/s[a]);switch(typeof n){case"undefined":i[o-1]=c(3/(s[o-2]*s[o-2]),l[o-2]),d[0].push(o-1,o-1),d[1].push(o-2,o-1),d[2].push(1/s[o-2],2/s[o-2]);break;case"string":d[1][d[1].length-1]=0;break;default:i[o-1]=n,d[0].push(o-1),d[1].push(o-1),d[2].push(1)}i="number"!=typeof i[0]?numeric.transpose(i):[i];var p=Array(i.length);if("string"==typeof r)for(a=p.length-1;-1!==a;--a)p[a]=numeric.ccsLUPSolve(numeric.ccsLUP(numeric.ccsScatter(d)),i[a]),p[a][o-1]=p[a][0];else for(a=p.length-1;-1!==a;--a)p[a]=numeric.cLUsolve(numeric.cLU(d),i[a]);return p="number"==typeof t[0]?p[0]:numeric.transpose(p),new numeric.Spline(e,t,t,p,p)},numeric.fftpow2=function f(e,t){var r=e.length;if(1!==r){var n,a,o=Math.cos,i=Math.sin,s=Array(r/2),l=Array(r/2),u=Array(r/2),c=Array(r/2);for(a=r/2,n=r-1;-1!==n;--n)--a,u[a]=e[n],c[a]=t[n],--n,s[a]=e[n],l[a]=t[n];f(s,l),f(u,c),a=r/2;var d,p,h,v=-6.283185307179586/r;for(n=r-1;-1!==n;--n)--a,-1===a&&(a=r/2-1),d=v*n,p=o(d),h=i(d),e[n]=s[a]+p*u[a]-h*c[a],t[n]=l[a]+p*c[a]+h*u[a]}},numeric._ifftpow2=function d(e,t){var r=e.length;if(1!==r){var n,a,o=Math.cos,i=Math.sin,s=Array(r/2),l=Array(r/2),u=Array(r/2),c=Array(r/2);for(a=r/2,n=r-1;-1!==n;--n)--a,u[a]=e[n],c[a]=t[n],--n,s[a]=e[n],l[a]=t[n];d(s,l),d(u,c),a=r/2;var f,p,h,v=6.283185307179586/r;for(n=r-1;-1!==n;--n)--a,-1===a&&(a=r/2-1),f=v*n,p=o(f),h=i(f),e[n]=s[a]+p*u[a]-h*c[a],t[n]=l[a]+p*c[a]+h*u[a]}},numeric.ifftpow2=function(e,t){numeric._ifftpow2(e,t),numeric.diveq(e,e.length),numeric.diveq(t,t.length)},numeric.convpow2=function(e,t,r,n){numeric.fftpow2(e,t),numeric.fftpow2(r,n);var a,o,i,s,l,u=e.length;for(a=u-1;-1!==a;--a)o=e[a],s=t[a],i=r[a],l=n[a],e[a]=o*i-s*l,t[a]=o*l+s*i;numeric.ifftpow2(e,t)},numeric.T.prototype.fft=function(){{var e,t,r=this.x,n=this.y,a=r.length,o=Math.log,i=o(2),s=Math.ceil(o(2*a-1)/i),l=Math.pow(2,s),u=numeric.rep([l],0),c=numeric.rep([l],0),f=Math.cos,d=Math.sin,p=-3.141592653589793/a,h=numeric.rep([l],0),v=numeric.rep([l],0);Math.floor(a/2)}for(e=0;a>e;e++)h[e]=r[e];if("undefined"!=typeof n)for(e=0;a>e;e++)v[e]=n[e];for(u[0]=1,e=1;l/2>=e;e++)t=p*e*e,u[e]=f(t),c[e]=d(t),u[l-e]=f(t),c[l-e]=d(t);var g=new numeric.T(h,v),m=new numeric.T(u,c);return g=g.mul(m),numeric.convpow2(g.x,g.y,numeric.clone(m.x),numeric.neg(m.y)),g=g.mul(m),g.x.length=a,g.y.length=a,g},numeric.T.prototype.ifft=function(){{var e,t,r=this.x,n=this.y,a=r.length,o=Math.log,i=o(2),s=Math.ceil(o(2*a-1)/i),l=Math.pow(2,s),u=numeric.rep([l],0),c=numeric.rep([l],0),f=Math.cos,d=Math.sin,p=3.141592653589793/a,h=numeric.rep([l],0),v=numeric.rep([l],0);Math.floor(a/2)}for(e=0;a>e;e++)h[e]=r[e];if("undefined"!=typeof n)for(e=0;a>e;e++)v[e]=n[e];for(u[0]=1,e=1;l/2>=e;e++)t=p*e*e,u[e]=f(t),c[e]=d(t),u[l-e]=f(t),c[l-e]=d(t);var g=new numeric.T(h,v),m=new numeric.T(u,c);return g=g.mul(m),numeric.convpow2(g.x,g.y,numeric.clone(m.x),numeric.neg(m.y)),g=g.mul(m),g.x.length=a,g.y.length=a,g.div(a)},numeric.gradient=function(e,t){var r=t.length,n=e(t);if(isNaN(n))throw new Error("gradient: f(x) is a NaN!");var a,o,i,s,l,u,c,f,d,p,h=Math.max,v=numeric.clone(t),g=Array(r),h=(numeric.div,numeric.sub,Math.max),m=.001,y=Math.abs,x=Math.min,b=0;for(a=0;r>a;a++)for(var w=h(1e-6*n,1e-8);;){if(++b,b>20)throw new Error("Numerical gradient fails");if(v[a]=t[a]+w,o=e(v),v[a]=t[a]-w,i=e(v),v[a]=t[a],isNaN(o)||isNaN(i))w/=16;else{if(g[a]=(o-i)/(2*w),l=t[a]-w,u=t[a],c=t[a]+w,f=(o-n)/w,d=(n-i)/w,p=h(y(g[a]),y(n),y(o),y(i),y(l),y(u),y(c),1e-8),s=x(h(y(f-g[a]),y(d-g[a]),y(f-d))/p,w/p),!(s>m))break;w/=16}}return g},numeric.uncmin=function(e,t,r,n,a,o,i){var s=numeric.gradient;"undefined"==typeof i&&(i={}),"undefined"==typeof r&&(r=1e-8),"undefined"==typeof n&&(n=function(t){return s(e,t)}),"undefined"==typeof a&&(a=1e3),t=numeric.clone(t);var l,u,c=t.length,f=e(t);if(isNaN(f))throw new Error("uncmin: f(x0) is a NaN!");var d=Math.max,p=numeric.norm2;r=d(r,numeric.epsilon);var h,v,g,m,y,x,b,w,_,k,z=i.Hinv||numeric.identity(c),A=numeric.dot,j=(numeric.inv,numeric.sub),M=numeric.add,E=numeric.tensor,O=numeric.div,S=numeric.mul,F=numeric.all,T=numeric.isFinite,B=numeric.neg,C=0,I="";for(v=n(t);a>C;){if("function"==typeof o&&o(C,t,f,v,z)){I="Callback returned true";break}if(!F(T(v))){I="Gradient has Infinity or NaN";break}if(h=B(A(z,v)),!F(T(h))){I="Search direction has Infinity or NaN";break}if(k=p(h),r>k){I="Newton step smaller than tol";break}for(_=1,u=A(v,h),y=t;a>C&&!(r>_*k)&&(m=S(h,_),y=M(t,m),l=e(y),l-f>=.1*_*u||isNaN(l));)_*=.5,++C;if(r>_*k){I="Line search step size smaller than tol";break}if(C===a){I="maxit reached during line search";break}g=n(y),x=j(g,v),w=A(x,m),b=A(z,x),z=j(M(z,S((w+A(x,b))/(w*w),E(m,m))),O(M(E(b,m),E(m,b)),w)),t=y,f=l,v=g,++C}return{solution:t,f:f,gradient:v,invHessian:z,iterations:C,message:I}},numeric.Dopri=function(e,t,r,n,a,o,i){this.x=e,this.y=t,this.f=r,this.ymid=n,this.iterations=a,this.events=i,this.message=o},numeric.Dopri.prototype._at=function(e,t){function r(e){return e*e}var n,a,o,i,s,l,e,u,c,f,d,p=this,h=p.x,v=p.y,g=p.f,m=p.ymid,y=(h.length,Math.floor,.5),x=numeric.add,b=numeric.mul,w=numeric.sub;return n=h[t],a=h[t+1],i=v[t],s=v[t+1],u=a-n,o=n+y*u,l=m[t],c=w(g[t],b(i,1/(n-o)+2/(n-a))),f=w(g[t+1],b(s,1/(a-o)+2/(a-n))),d=[r(e-a)*(e-o)/r(n-a)/(n-o),r(e-n)*r(e-a)/r(n-o)/r(a-o),r(e-n)*(e-o)/r(a-n)/(a-o),(e-n)*r(e-a)*(e-o)/r(n-a)/(n-o),(e-a)*r(e-n)*(e-o)/r(n-a)/(a-o)],x(x(x(x(b(i,d[0]),b(l,d[1])),b(s,d[2])),b(c,d[3])),b(f,d[4]))},numeric.Dopri.prototype.at=function(e){var t,r,n,a=Math.floor;if("number"!=typeof e){var o=e.length,i=Array(o);for(t=o-1;-1!==t;--t)i[t]=this.at(e[t]);return i}var s=this.x;for(t=0,r=s.length-1;r-t>1;)n=a(.5*(t+r)),s[n]<=e?t=n:r=n;return this._at(e,t)},numeric.dopri=function(e,t,r,n,a,o,i){"undefined"==typeof a&&(a=1e-6),"undefined"==typeof o&&(o=1e3);var s,l,u,c,f,d,p,h,v,g,m,y,x,b=[e],w=[r],_=[n(e,r)],k=[],z=.2,A=[.075,.225],j=[44/45,-56/15,32/9],M=[19372/6561,-25360/2187,64448/6561,-212/729],E=[9017/3168,-355/33,46732/5247,49/176,-5103/18656],O=[35/384,0,500/1113,125/192,-2187/6784,11/84],S=[.10013431883002395,0,.3918321794184259,-0.02982460176594817,.05893268337240795,-0.04497888809104361,.023904308236133973],F=[.2,.3,.8,8/9,1,1],T=[-71/57600,0,71/16695,-71/1920,17253/339200,-22/525,.025],B=0,C=(t-e)/10,I=0,N=numeric.add,P=numeric.mul,q=(Math.max,Math.min),D=Math.abs,R=numeric.norminf,U=Math.pow,V=numeric.any,L=numeric.lt,Y=numeric.and,H=(numeric.sub,new numeric.Dopri(b,w,_,k,-1,""));for("function"==typeof i&&(m=i(e,r));t>e&&o>I;)if(++I,e+C>t&&(C=t-e),s=n(e+F[0]*C,N(r,P(z*C,_[B]))),l=n(e+F[1]*C,N(N(r,P(A[0]*C,_[B])),P(A[1]*C,s))),u=n(e+F[2]*C,N(N(N(r,P(j[0]*C,_[B])),P(j[1]*C,s)),P(j[2]*C,l))),c=n(e+F[3]*C,N(N(N(N(r,P(M[0]*C,_[B])),P(M[1]*C,s)),P(M[2]*C,l)),P(M[3]*C,u))),f=n(e+F[4]*C,N(N(N(N(N(r,P(E[0]*C,_[B])),P(E[1]*C,s)),P(E[2]*C,l)),P(E[3]*C,u)),P(E[4]*C,c))),v=N(N(N(N(N(r,P(_[B],C*O[0])),P(l,C*O[2])),P(u,C*O[3])),P(c,C*O[4])),P(f,C*O[5])),d=n(e+C,v),p=N(N(N(N(N(P(_[B],C*T[0]),P(l,C*T[2])),P(u,C*T[3])),P(c,C*T[4])),P(f,C*T[5])),P(d,C*T[6])),g="number"==typeof p?D(p):R(p),g>a){if(C=.2*C*U(a/g,.25),e+C===e){H.msg="Step size became too small";break}}else{if(k[B]=N(N(N(N(N(N(r,P(_[B],C*S[0])),P(l,C*S[2])),P(u,C*S[3])),P(c,C*S[4])),P(f,C*S[5])),P(d,C*S[6])),++B,b[B]=e+C,w[B]=v,_[B]=d,"function"==typeof i){var X,G,J=e,W=e+.5*C;if(y=i(W,k[B-1]),x=Y(L(m,0),L(0,y)),V(x)||(J=W,W=e+C,m=y,y=i(W,v),x=Y(L(m,0),L(0,y))),V(x)){for(var Q,K,Z=0,$=1,ee=1;;){if("number"==typeof m)G=(ee*y*J-$*m*W)/(ee*y-$*m);else for(G=W,h=m.length-1;-1!==h;--h)m[h]<0&&y[h]>0&&(G=q(G,(ee*y[h]*J-$*m[h]*W)/(ee*y[h]-$*m[h])));if(J>=G||G>=W)break;X=H._at(G,B-1),K=i(G,X),Q=Y(L(m,0),L(0,K)),V(Q)?(W=G,y=K,x=Q,ee=1,-1===Z?$*=.5:$=1,Z=-1):(J=G,m=K,$=1,1===Z?ee*=.5:ee=1,Z=1)}return v=H._at(.5*(e+G),B-1),H.f[B]=n(G,X),H.x[B]=G,H.y[B]=X,H.ymid[B-1]=v,H.events=x,H.iterations=I,H}}e+=C,r=v,m=y,C=q(.8*C*U(a/g,.25),4*C)}return H.iterations=I,H},numeric.LU=function(e,t){t=t||!1;var r,n,a,o,i,s,l,u,c,f=Math.abs,d=e.length,p=d-1,h=new Array(d);for(t||(e=numeric.clone(e)),a=0;d>a;++a){for(l=a,s=e[a],c=f(s[a]),n=a+1;d>n;++n)o=f(e[n][a]),o>c&&(c=o,l=n);for(h[a]=l,l!=a&&(e[a]=e[l],e[l]=s,s=e[a]),i=s[a],r=a+1;d>r;++r)e[r][a]/=i;for(r=a+1;d>r;++r){for(u=e[r],n=a+1;p>n;++n)u[n]-=u[a]*s[n],++n,u[n]-=u[a]*s[n];n===p&&(u[n]-=u[a]*s[n])}}return{LU:e,P:h}},numeric.LUsolve=function(e,t){var r,n,a,o,i,s=e.LU,l=s.length,u=numeric.clone(t),c=e.P;for(r=l-1;-1!==r;--r)u[r]=t[r];for(r=0;l>r;++r)for(a=c[r],c[r]!==r&&(i=u[r],u[r]=u[a],u[a]=i),o=s[r],n=0;r>n;++n)u[r]-=u[n]*o[n];for(r=l-1;r>=0;--r){for(o=s[r],n=r+1;l>n;++n)u[r]-=u[n]*o[n];u[r]/=o[r]}return u},numeric.solve=function(e,t,r){return numeric.LUsolve(numeric.LU(e,r),t)},numeric.echelonize=function(e){var t,r,n,a,o,i,s,l,u=numeric.dim(e),c=u[0],f=u[1],d=numeric.identity(c),p=Array(c),h=Math.abs,v=numeric.diveq;for(e=numeric.clone(e),t=0;c>t;++t){for(n=0,o=e[t],i=d[t],r=1;f>r;++r)h(o[n])<h(o[r])&&(n=r);for(p[t]=n,v(i,o[n]),v(o,o[n]),r=0;c>r;++r)if(r!==t){for(s=e[r],l=s[n],a=f-1;-1!==a;--a)s[a]-=o[a]*l;for(s=d[r],a=c-1;-1!==a;--a)s[a]-=i[a]*l}}return{I:d,A:e,P:p}},numeric.__solveLP=function(e,t,r,n,a,o,i){var s,l,u,c,f=numeric.sum,d=(numeric.log,numeric.mul),p=numeric.sub,h=numeric.dot,v=numeric.div,g=numeric.add,m=e.length,y=r.length,x=!1,b=0,w=1,_=(numeric.transpose(t),numeric.svd,numeric.transpose),k=(numeric.leq,Math.sqrt),z=Math.abs,A=(numeric.muleq,numeric.norminf,numeric.any,Math.min),j=numeric.all,M=numeric.gt,E=Array(m),O=Array(y),S=(numeric.rep([y],1),numeric.solve),F=p(r,h(t,o)),T=h(e,e);for(u=b;a>u;++u){var B,C;for(B=y-1;-1!==B;--B)O[B]=v(t[B],F[B]);var I=_(O);for(B=m-1;-1!==B;--B)E[B]=f(I[B]);w=.25*z(T/h(e,E));var N=100*k(T/h(E,E));for((!isFinite(w)||w>N)&&(w=N),c=g(e,d(w,E)),l=h(I,O),B=m-1;-1!==B;--B)l[B][B]+=1;C=S(l,v(c,w),!0);var P=v(F,h(t,C)),q=1;for(B=y-1;-1!==B;--B)P[B]<0&&(q=A(q,-.999*P[B]));if(s=p(o,d(C,q)),F=p(r,h(t,s)),!j(M(F,0)))return{solution:o,message:"",iterations:u};if(o=s,n>w)return{solution:s,message:"",iterations:u};if(i){var D=h(e,c),R=h(t,c);for(x=!0,B=y-1;-1!==B;--B)if(D*R[B]<0){x=!1;break}}else x=o[m-1]>=0?!1:!0;if(x)return{solution:s,message:"Unbounded",iterations:u}}return{solution:o,message:"maximum iteration count exceeded",iterations:u}},numeric._solveLP=function(e,t,r,n,a){var o,i=e.length,s=r.length,l=(numeric.sum,numeric.log,numeric.mul,numeric.sub),u=numeric.dot,c=(numeric.div,numeric.add,numeric.rep([i],0).concat([1])),f=numeric.rep([s,1],-1),d=numeric.blockMatrix([[t,f]]),p=r,o=numeric.rep([i],0).concat(Math.max(0,numeric.sup(numeric.neg(r)))+1),h=numeric.__solveLP(c,d,p,n,a,o,!1),v=numeric.clone(h.solution);v.length=i;var g=numeric.inf(l(r,u(t,v)));if(0>g)return{solution:0/0,message:"Infeasible",iterations:h.iterations};var m=numeric.__solveLP(e,t,r,n,a-h.iterations,v,!0);return m.iterations+=h.iterations,m},numeric.solveLP=function(e,t,r,n,a,o,i){if("undefined"==typeof i&&(i=1e3),"undefined"==typeof o&&(o=numeric.epsilon),"undefined"==typeof n)return numeric._solveLP(e,t,r,o,i);var s,l=n.length,u=n[0].length,c=t.length,f=numeric.echelonize(n),d=numeric.rep([u],0),p=f.P,h=[];for(s=p.length-1;-1!==s;--s)d[p[s]]=1;for(s=u-1;-1!==s;--s)0===d[s]&&h.push(s);var v=numeric.getRange,g=numeric.linspace(0,l-1),m=numeric.linspace(0,c-1),y=v(n,g,h),x=v(t,m,p),b=v(t,m,h),w=numeric.dot,_=numeric.sub,k=w(x,f.I),z=_(b,w(k,y)),A=_(r,w(k,a)),j=Array(p.length),M=Array(h.length);for(s=p.length-1;-1!==s;--s)j[s]=e[p[s]];for(s=h.length-1;-1!==s;--s)M[s]=e[h[s]];var E=_(M,w(j,w(f.I,y))),O=numeric._solveLP(E,z,A,o,i),S=O.solution;if(S!==S)return O;var F=w(f.I,_(a,w(y,S))),T=Array(e.length);for(s=p.length-1;-1!==s;--s)T[p[s]]=F[s];for(s=h.length-1;-1!==s;--s)T[h[s]]=S[s];return{solution:T,message:O.message,iterations:O.iterations}},numeric.MPStoLP=function(e){function t(t){throw new Error("MPStoLP: "+t+"\nLine "+r+": "+e[r]+"\nCurrent state: "+s[i]+"\n")}e instanceof String&&e.split("\n");var r,n,a,o,i=0,s=["Initial state","NAME","ROWS","COLUMNS","RHS","BOUNDS","ENDATA"],l=e.length,u=0,c={},f=[],d=0,p={},h=0,v=[],g=[],m=[];for(r=0;l>r;++r){a=e[r];var y=a.match(/\S*/g),x=[];for(n=0;n<y.length;++n)""!==y[n]&&x.push(y[n]);if(0!==x.length){for(n=0;n<s.length&&a.substr(0,s[n].length)!==s[n];++n);if(n<s.length){if(i=n,1===n&&(o=x[1]),6===n)return{name:o,c:v,A:numeric.transpose(g),b:m,rows:c,vars:p}}else switch(i){case 0:case 1:t("Unexpected line");case 2:switch(x[0]){case"N":0===u?u=x[1]:t("Two or more N rows");break;case"L":c[x[1]]=d,f[d]=1,m[d]=0,++d;break;case"G":c[x[1]]=d,f[d]=-1,m[d]=0,++d;break;case"E":c[x[1]]=d,f[d]=0,m[d]=0,++d;break;default:t("Parse error "+numeric.prettyPrint(x))}break;case 3:p.hasOwnProperty(x[0])||(p[x[0]]=h,v[h]=0,g[h]=numeric.rep([d],0),++h);var b=p[x[0]];for(n=1;n<x.length;n+=2)if(x[n]!==u){var w=c[x[n]];g[b][w]=(f[w]<0?-1:1)*parseFloat(x[n+1])}else v[b]=parseFloat(x[n+1]);break;case 4:for(n=1;n<x.length;n+=2)m[c[x[n]]]=(f[c[x[n]]]<0?-1:1)*parseFloat(x[n+1]);break;case 5:break;case 6:t("Internal error")}}}t("Reached end of file without ENDATA")},numeric.seedrandom={pow:Math.pow,random:Math.random},function(e,t,r,n,a,o,i){function s(e){var t,n,a=this,o=e.length,i=0,s=a.i=a.j=a.m=0;for(a.S=[],a.c=[],o||(e=[o++]);r>i;)a.S[i]=i++;for(i=0;r>i;i++)t=a.S[i],s=c(s+t+e[i%o]),n=a.S[s],a.S[i]=n,a.S[s]=t;a.g=function(e){var t=a.S,n=c(a.i+1),o=t[n],i=c(a.j+o),s=t[i];t[n]=s,t[i]=o;for(var l=t[c(o+s)];--e;)n=c(n+1),o=t[n],i=c(i+o),s=t[i],t[n]=s,t[i]=o,l=l*r+t[c(o+s)];return a.i=n,a.j=i,l},a.g(r)}function l(e,t,r,n,a){if(r=[],a=typeof e,t&&"object"==a)for(n in e)if(n.indexOf("S")<5)try{r.push(l(e[n],t-1))}catch(o){}return r.length?r:e+("string"!=a?"\x00":"")}function u(e,t,r,n){for(e+="",r=0,n=0;n<e.length;n++)t[c(n)]=c((r^=19*t[c(n)])+e.charCodeAt(n));e="";for(n in t)e+=String.fromCharCode(t[n]);return e}function c(e){return e&r-1}t.seedrandom=function(c,f){var d,p=[];return c=u(l(f?[c,e]:arguments.length?c:[(new Date).getTime(),e,window],3),p),d=new s(p),u(d.S,e),t.random=function(){for(var e=d.g(n),t=i,s=0;a>e;)e=(e+s)*r,t*=r,s=d.g(1);for(;e>=o;)e/=2,t/=2,s>>>=1;return(e+s)/t},c},i=t.pow(r,n),a=t.pow(2,a),o=2*a,u(t.random(),e)}([],numeric.seedrandom,256,6,52),function(e){function t(e){if("object"!=typeof e)return e;var r,n=[],a=e.length;for(r=0;a>r;r++)n[r+1]=t(e[r]);return n}function r(e){if("object"!=typeof e)return e;var t,n=[],a=e.length;for(t=1;a>t;t++)n[t-1]=r(e[t]);return n}function n(e,t,r){var n,a,o,i,s;for(o=1;r>=o;o+=1){for(e[o][o]=1/e[o][o],s=-e[o][o],n=1;o>n;n+=1)e[n][o]=s*e[n][o];if(i=o+1,i>r)break;for(a=i;r>=a;a+=1)for(s=e[o][a],e[o][a]=0,n=1;o>=n;n+=1)e[n][a]=e[n][a]+s*e[n][o]}}function a(e,t,r,n){var a,o,i,s;for(o=1;r>=o;o+=1){for(s=0,a=1;o>a;a+=1)s+=e[a][o]*n[a];n[o]=(n[o]-s)/e[o][o]}for(i=1;r>=i;i+=1)for(o=r+1-i,n[o]=n[o]/e[o][o],s=-n[o],a=1;o>a;a+=1)n[a]=n[a]+s*e[a][o]}function o(e,t,r,n){var a,o,i,s,l,u;for(o=1;r>=o;o+=1){if(n[1]=o,u=0,i=o-1,1>i){if(u=e[o][o]-u,0>=u)break;e[o][o]=Math.sqrt(u)}else{for(s=1;i>=s;s+=1){for(l=e[s][o],a=1;s>a;a+=1)l-=e[a][o]*e[a][s];l/=e[s][s],e[s][o]=l,u+=l*l}if(u=e[o][o]-u,0>=u)break;e[o][o]=Math.sqrt(u)}n[1]=0}}function i(e,t,r,i,s,l,u,c,f,d,p,h,v,g,m,y){function x(){for(g[1]=g[1]+1,j=B,z=1;d>=z;z+=1){for(j+=1,D=-c[z],A=1;i>=A;A+=1)D+=u[A][z]*s[A];if(Math.abs(D)<G&&(D=0),z>p)m[j]=D;else if(m[j]=-Math.abs(D),D>0){for(A=1;i>=A;A+=1)u[A][z]=-u[A][z];c[z]=-c[z]}}for(z=1;v>=z;z+=1)m[B+h[z]]=0;for(I=0,q=0,z=1;d>=z;z+=1)m[B+z]<q*m[P+z]&&(I=z,q=m[B+z]/m[P+z]);return 0===I?999:0}function b(){for(z=1;i>=z;z+=1){for(D=0,A=1;i>=A;A+=1)D+=e[A][z]*u[A][I];m[z]=D}for(M=S,z=1;i>=z;z+=1)m[M+z]=0;for(A=v+1;i>=A;A+=1)for(z=1;i>=z;z+=1)m[M+z]=m[M+z]+e[z][A]*m[A];for(H=!0,z=v;z>=1;z-=1){for(D=m[z],j=T+z*(z+3)/2,M=j-z,A=z+1;v>=A;A+=1)D-=m[j]*m[F+A],j+=A;if(D/=m[M],m[F+z]=D,h[z]<p)break;if(0>D)break;H=!1,O=z}if(!H)for(R=m[C+O]/m[F+O],z=1;v>=z&&!(h[z]<p)&&!(m[F+z]<0);z+=1)q=m[C+z]/m[F+z],R>q&&(R=q,O=z);for(D=0,z=S+1;S+i>=z;z+=1)D+=m[z]*m[z];if(Math.abs(D)<=G){if(H)return y[1]=1,999;for(z=1;v>=z;z+=1)m[C+z]=m[C+z]-R*m[F+z];return m[C+v+1]=m[C+v+1]+R,700}for(D=0,z=1;i>=z;z+=1)D+=m[S+z]*u[z][I];for(U=-m[B+I]/D,X=!0,H||U>R&&(U=R,X=!1),z=1;i>=z;z+=1)s[z]=s[z]+U*m[S+z],Math.abs(s[z])<G&&(s[z]=0);for(l[1]=l[1]+U*D*(U/2+m[C+v+1]),z=1;v>=z;z+=1)m[C+z]=m[C+z]-U*m[F+z];if(m[C+v+1]=m[C+v+1]+U,!X){for(D=-c[I],A=1;i>=A;A+=1)D+=s[A]*u[A][I];if(I>p)m[B+I]=D;else if(m[B+I]=-Math.abs(D),D>0){for(A=1;i>=A;A+=1)u[A][I]=-u[A][I];c[I]=-c[I]}return 700}for(v+=1,h[v]=I,j=T+(v-1)*v/2+1,z=1;v-1>=z;z+=1)m[j]=m[z],j+=1;if(v===i)m[j]=m[i];else{for(z=i;z>=v+1&&0!==m[z]&&(V=Math.max(Math.abs(m[z-1]),Math.abs(m[z])),L=Math.min(Math.abs(m[z-1]),Math.abs(m[z])),q=m[z-1]>=0?Math.abs(V*Math.sqrt(1+L*L/(V*V))):-Math.abs(V*Math.sqrt(1+L*L/(V*V))),V=m[z-1]/q,L=m[z]/q,1!==V);z-=1)if(0===V)for(m[z-1]=L*q,A=1;i>=A;A+=1)q=e[A][z-1],e[A][z-1]=e[A][z],e[A][z]=q;else for(m[z-1]=q,Y=L/(1+V),A=1;i>=A;A+=1)q=V*e[A][z-1]+L*e[A][z],e[A][z]=Y*(e[A][z-1]+q)-e[A][z],e[A][z-1]=q;m[j]=m[v]}return 0}function w(){if(j=T+O*(O+1)/2+1,M=j+O,0===m[M])return 798;if(V=Math.max(Math.abs(m[M-1]),Math.abs(m[M])),L=Math.min(Math.abs(m[M-1]),Math.abs(m[M])),q=m[M-1]>=0?Math.abs(V*Math.sqrt(1+L*L/(V*V))):-Math.abs(V*Math.sqrt(1+L*L/(V*V))),V=m[M-1]/q,L=m[M]/q,1===V)return 798;if(0===V){for(z=O+1;v>=z;z+=1)q=m[M-1],m[M-1]=m[M],m[M]=q,M+=z;for(z=1;i>=z;z+=1)q=e[z][O],e[z][O]=e[z][O+1],e[z][O+1]=q}else{for(Y=L/(1+V),z=O+1;v>=z;z+=1)q=V*m[M-1]+L*m[M],m[M]=Y*(m[M-1]+q)-m[M],m[M-1]=q,M+=z;for(z=1;i>=z;z+=1)q=V*e[z][O]+L*e[z][O+1],e[z][O+1]=Y*(e[z][O]+q)-e[z][O+1],e[z][O]=q}return 0}function _(){for(M=j-O,z=1;O>=z;z+=1)m[M]=m[j],j+=1,M+=1;return m[C+O]=m[C+O+1],h[O]=h[O+1],O+=1,v>O?797:0}function k(){return m[C+v]=m[C+v+1],m[C+v+1]=0,h[v]=0,v-=1,g[2]=g[2]+1,0}var z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R,U,V,L,Y,H,X,G,J,W,Q;N=Math.min(i,d),j=2*i+N*(N+5)/2+2*d+1,G=1e-60;do G+=G,J=1+.1*G,W=1+.2*G;while(1>=J||1>=W);for(z=1;i>=z;z+=1)m[z]=t[z];for(z=i+1;j>=z;z+=1)m[z]=0;for(z=1;d>=z;z+=1)h[z]=0;if(E=[],0===y[1]){if(o(e,r,i,E),0!==E[1])return void(y[1]=2);a(e,r,i,t),n(e,r,i)}else{for(A=1;i>=A;A+=1)for(s[A]=0,z=1;A>=z;z+=1)s[A]=s[A]+e[z][A]*t[z];for(A=1;i>=A;A+=1)for(t[A]=0,z=A;i>=z;z+=1)t[A]=t[A]+e[A][z]*s[z]}for(l[1]=0,A=1;i>=A;A+=1)for(s[A]=t[A],l[1]=l[1]+m[A]*s[A],m[A]=0,z=A+1;i>=z;z+=1)e[z][A]=0;for(l[1]=-l[1]/2,y[1]=0,S=i,F=S+i,C=F+N,T=C+N+1,B=T+N*(N+1)/2,P=B+d,z=1;d>=z;z+=1){for(D=0,A=1;i>=A;A+=1)D+=u[A][z]*u[A][z];m[P+z]=Math.sqrt(D)}for(v=0,g[1]=0,g[2]=0,Q=0;;){if(Q=x(),999===Q)return;for(;;){if(Q=b(),0===Q)break;if(999===Q)return;if(700===Q)if(O===v)k();else{for(;;)if(w(),Q=_(),797!==Q)break;k()}}}}function s(e,n,a,o,s,l){e=t(e),n=t(n),a=t(a);var u,c,f,d,p,h,v=[],g=[],m=[],y=[],x=[];if(s=s||0,l=l?t(l):[void 0,0],o=o?t(o):[],c=e.length-1,f=a[1].length-1,!o)for(u=1;f>=u;u+=1)o[u]=0;for(u=1;f>=u;u+=1)g[u]=0;for(d=0,p=Math.min(c,f),u=1;c>=u;u+=1)m[u]=0;for(v[1]=0,u=1;2*c+p*(p+5)/2+2*f+1>=u;u+=1)y[u]=0;for(u=1;2>=u;u+=1)x[u]=0;return i(e,n,c,c,m,v,a,o,c,f,s,g,d,x,y,l),h="",1===l[1]&&(h="constraints are inconsistent, no solution!"),2===l[1]&&(h="matrix D in quadratic function is not positive definite!"),{solution:r(m),value:r(v),unconstrained_solution:r(n),iterations:r(x),iact:r(g),message:h}}e.solveQP=s}(numeric),numeric.svd=function(e){function t(e,t){return e=Math.abs(e),t=Math.abs(t),e>t?e*Math.sqrt(1+t*t/e/e):0==t?e:t*Math.sqrt(1+e*e/t/t)}var r,n=numeric.epsilon,a=1e-64/n,o=50,i=0,s=0,l=0,u=0,c=0,f=numeric.clone(e),d=f.length,p=f[0].length;if(p>d)throw"Need more rows than columns";var h=new Array(p),v=new Array(p);for(s=0;p>s;s++)h[s]=v[s]=0;var g=numeric.rep([p,p],0),m=0,y=0,x=0,b=0,w=0,_=0,k=0;for(s=0;p>s;s++){for(h[s]=y,k=0,c=s+1,l=s;d>l;l++)k+=f[l][s]*f[l][s];if(a>=k)y=0;else for(m=f[s][s],y=Math.sqrt(k),m>=0&&(y=-y),x=m*y-k,f[s][s]=m-y,l=c;p>l;l++){for(k=0,u=s;d>u;u++)k+=f[u][s]*f[u][l];for(m=k/x,u=s;d>u;u++)f[u][l]+=m*f[u][s]}for(v[s]=y,k=0,l=c;p>l;l++)k+=f[s][l]*f[s][l];if(a>=k)y=0;else{for(m=f[s][s+1],y=Math.sqrt(k),m>=0&&(y=-y),x=m*y-k,f[s][s+1]=m-y,l=c;p>l;l++)h[l]=f[s][l]/x;for(l=c;d>l;l++){for(k=0,u=c;p>u;u++)k+=f[l][u]*f[s][u];for(u=c;p>u;u++)f[l][u]+=k*h[u]}}w=Math.abs(v[s])+Math.abs(h[s]),w>b&&(b=w)}for(s=p-1;-1!=s;s+=-1){if(0!=y){for(x=y*f[s][s+1],l=c;p>l;l++)g[l][s]=f[s][l]/x;for(l=c;p>l;l++){for(k=0,u=c;p>u;u++)k+=f[s][u]*g[u][l];for(u=c;p>u;u++)g[u][l]+=k*g[u][s]}}for(l=c;p>l;l++)g[s][l]=0,g[l][s]=0;g[s][s]=1,y=h[s],c=s}for(s=p-1;-1!=s;s+=-1){for(c=s+1,y=v[s],l=c;p>l;l++)f[s][l]=0;if(0!=y){for(x=f[s][s]*y,l=c;p>l;l++){for(k=0,u=c;d>u;u++)k+=f[u][s]*f[u][l];for(m=k/x,u=s;d>u;u++)f[u][l]+=m*f[u][s]}for(l=s;d>l;l++)f[l][s]=f[l][s]/y}else for(l=s;d>l;l++)f[l][s]=0;f[s][s]+=1}for(n*=b,u=p-1;-1!=u;u+=-1)for(var z=0;o>z;z++){var A=!1;for(c=u;-1!=c;c+=-1){if(Math.abs(h[c])<=n){A=!0;break}if(Math.abs(v[c-1])<=n)break}if(!A){i=0,k=1;var j=c-1;for(s=c;u+1>s&&(m=k*h[s],h[s]=i*h[s],!(Math.abs(m)<=n));s++)for(y=v[s],x=t(m,y),v[s]=x,i=y/x,k=-m/x,l=0;d>l;l++)w=f[l][j],_=f[l][s],f[l][j]=w*i+_*k,f[l][s]=-w*k+_*i}if(_=v[u],c==u){if(0>_)for(v[u]=-_,l=0;p>l;l++)g[l][u]=-g[l][u];break}if(z>=o-1)throw"Error: no convergence.";for(b=v[c],w=v[u-1],y=h[u-1],x=h[u],m=((w-_)*(w+_)+(y-x)*(y+x))/(2*x*w),y=t(m,1),m=0>m?((b-_)*(b+_)+x*(w/(m-y)-x))/b:((b-_)*(b+_)+x*(w/(m+y)-x))/b,i=1,k=1,s=c+1;u+1>s;s++){for(y=h[s],w=v[s],x=k*y,y=i*y,_=t(m,x),h[s-1]=_,i=m/_,k=x/_,m=b*i+y*k,y=-b*k+y*i,x=w*k,w*=i,l=0;p>l;l++)b=g[l][s-1],_=g[l][s],g[l][s-1]=b*i+_*k,g[l][s]=-b*k+_*i;for(_=t(m,x),v[s-1]=_,i=m/_,k=x/_,m=i*y+k*w,b=-k*y+i*w,l=0;d>l;l++)w=f[l][s-1],_=f[l][s],f[l][s-1]=w*i+_*k,f[l][s]=-w*k+_*i}h[c]=0,h[u]=m,v[u]=b}for(s=0;s<v.length;s++)v[s]<n&&(v[s]=0);for(s=0;p>s;s++)for(l=s-1;l>=0;l--)if(v[l]<v[s]){for(i=v[l],v[l]=v[s],v[s]=i,u=0;u<f.length;u++)r=f[u][s],f[u][s]=f[u][l],f[u][l]=r;for(u=0;u<g.length;u++)r=g[u][s],g[u][s]=g[u][l],g[u][l]=r;s=l}return{U:f,S:v,V:g}}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],8:[function(e,t,r){!function(){"use strict";function e(e,t){var r=e.x-t.x,n=e.y-t.y;return r*r+n*n}function r(e,t,r){var n=t.x,a=t.y,o=r.x-n,i=r.y-a;if(0!==o||0!==i){var s=((e.x-n)*o+(e.y-a)*i)/(o*o+i*i);s>1?(n=r.x,a=r.y):s>0&&(n+=o*s,a+=i*s)}return o=e.x-n,i=e.y-a,o*o+i*i}function n(t,r){for(var n,a=t[0],o=[a],i=1,s=t.length;s>i;i++)n=t[i],e(n,a)>r&&(o.push(n),a=n);return a!==n&&o.push(n),o}function a(e,t){var n,a,o,i,s=e.length,l="undefined"!=typeof Uint8Array?Uint8Array:Array,u=new l(s),c=0,f=s-1,d=[],p=[];for(u[c]=u[f]=1;f;){for(a=0,n=c+1;f>n;n++)o=r(e[n],e[c],e[f]),o>a&&(i=n,a=o);a>t&&(u[i]=1,d.push(c,i,i,f)),f=d.pop(),c=d.pop()}for(n=0;s>n;n++)u[n]&&p.push(e[n]);return p}function o(e,t,r){var o=void 0!==t?t*t:1;return e=r?e:n(e,o),e=a(e,o)}"function"==typeof define&&define.amd?define(function(){return o}):"undefined"!=typeof t?t.exports=o:"undefined"!=typeof self?self.simplify=o:window.simplify=o}()},{}],9:[function(e,t,r){"use strict";function n(e,t,r,n){this.points=e,this.ids=t,this.dimension=n,this.length=r}function a(e){var t,r,a;if(Array.isArray(e)){if(t=e.length,0===t)return new n(null,null,0,0);r=e[0].length,a=i(f.mallocDouble(t*(r+1)),[t,r+1]),l(e,a.hi(t,r))}else{t=e.shape[0],r=e.shape[1];var o=e.dtype;o="int8"===o||"int16"===o||"int32"===o?"int32":"uint8"===o||"uint8_clamped"===o||"buffer"===o||"uint16"===o||"uint32"===o?"uint32":"float32"===o?"float32":"float64",a=i(f.malloc(t*(r+1)),[t,r+1]),u.assign(a.hi(t,r),e)}for(var h=0;t>h;++h)a.set(h,r,h);for(var v=c.malloc([t,r],e.dtype),g=f.mallocInt32(t),m=0,y=v.data,x=a.data,b=(p.log2(p.nextPow2(t)),s.compile(a.order,!0,a.dtype)),w=[a];t>m;){var _=w.shift(),k=_,z=0|k.shape[0];if(z>1){var A,j=p.log2(m+1)%r,M=d.root(z);A=b(k,M,function(e,t){return e.get(j)-t.get(j)});for(var E=v.index(m,0),O=A.offset,h=0;r>h;++h)y[E++]=x[O++];g[m]=x[O],m+=1,w.push(k.hi(M)),z>2&&w.push(k.lo(M+1))}else{for(var O=k.offset,E=v.index(m,0),h=0;r>h;++h)y[E+h]=x[O++];g[m]=x[O],m+=1}}return f.free(a.data),new n(v,g,t,r)}function o(e){var t=e.p,r=e.i;if(t){for(var a=t.length,o=f.mallocFloat64(a),s=0;a>s;++s)o[s]=t[s];for(var l=r.length,u=f.mallocInt32(l),s=0;l>s;++s)u[s]=r[s];var c=a/l|0;return new n(i(o,[l,c]),u,l,c)}return new n(null,null,0,e.d)}t.exports=a,t.exports.deserialize=o;

var i=e("ndarray"),s=e("ndarray-select"),l=e("ndarray-pack"),u=e("ndarray-ops"),c=e("ndarray-scratch"),f=e("typedarray-pool"),d=e("inorder-tree-layout"),p=e("bit-twiddle"),h=e("./lib/heap.js"),v=n.prototype;v.serialize=function(){return this.length>0?{p:Array.prototype.slice.call(this.points.data,0,this.length*this.dimension),i:Array.prototype.slice.call(this.ids,0,this.length)}:{d:this.dimension}},v.range=function(e,t,r){var n=this.length;if(!(1>n)){for(var a=this.dimension,o=0;a>o;++o)if(t[o]<e[o])return;var i,s=this.points,u=this.ids,d=c.malloc([n,2,a]),h=f.mallocInt32(n),v=d.data,g=s.data,m=1,y=0;for(h[0]=0,l(e,d.pick(0,0)),l(t,d.pick(0,1));m>y;){for(var x=h[y],b=p.log2(x+1)%a,w=d.index(y,0,0),_=d.index(y,1,0),k=s.index(x,0),z=!0,o=0;a>o;++o){var A=g[k+o];if(A<v[w+o]||v[_+o]<A){z=!1;break}}if(z&&(i=r(u[x]),void 0!==i))break;var j=g[k+b],M=v[_+b],E=v[w+b];if(j>=E){var O=2*x+1;if(n>O){h[m]=O;for(var S=d.index(m,0,0),o=0;a>o;++o)v[S+o]=v[w+o];for(var F=d.index(m,1,0),o=0;a>o;++o)v[F+o]=v[_+o];v[F+b]=Math.min(M,j),m+=1}}if(M>=j){var T=2*(x+1);if(n>T){h[m]=T;for(var S=d.index(m,0,0),o=0;a>o;++o)v[S+o]=v[w+o];for(var F=d.index(m,1,0),o=0;a>o;++o)v[F+o]=v[_+o];v[S+b]=Math.max(E,j),m+=1}}y+=1}return c.free(d),f.free(h),i}},v.rnn=function(e,t,r){if(!(0>t)){var n=this.length;if(!(1>n)){var a,o=this.dimension,i=this.points,s=this.ids,l=c.malloc([n,o]),u=f.mallocInt32(n),d=l.data,h=i.data,v=1,g=0,m=t*t;u[0]=0;for(var y=0;o>y;++y)l.set(0,y,0);for(;v>g;){for(var x=u[g],b=i.index(x,0),w=0,y=0;o>y;++y)w+=Math.pow(e[y]-h[b+y],2);if(m>=w&&(a=r(s[x]),void 0!==a))break;for(var _=p.log2(x+1)%o,k=0,z=l.index(g,0),y=0;o>y;++y)y!==_&&(k+=d[z+y]);var A=e[_],j=h[b+_],M=d[z+_],E=M,O=M;j>A?O=Math.max(M,Math.pow(j-A,2)):E=Math.max(M,Math.pow(j-A,2));var S=E+k,F=O+k;if(m>=S){var T=2*x+1;if(n>T){u[v]=T;for(var B=l.index(v,0),y=0;o>y;++y)d[B+y]=d[z+y];d[B+_]=E,v+=1}}if(m>=F){var C=2*(x+1);if(n>C){u[v]=C;for(var B=l.index(v,0),y=0;o>y;++y)d[B+y]=d[z+y];d[B+_]=O,v+=1}}g+=1}return c.free(l),f.free(u),a}}},v.nn=function(e,t){var r=this.length;if(1>r)return-1;if("number"==typeof t){if(0>t)return-1}else t=1/0;var n=this.dimension,a=this.points,o=a.data,i=f.mallocFloat64(n),s=new h(r,n+1),l=s.index,u=s.data;l[0]=0;for(var c=0;n>=c;++c)u[c]=0;s.count+=1;for(var d=-1,v=t;s.count>0&&!(u[0]>=v);){for(var g=l[0],m=a.index(g,0),y=0,c=0;n>c;++c)y+=Math.pow(e[c]-o[m+c],2);v>y&&(v=y,d=g);for(var x=p.log2(g+1)%n,b=0,c=0;n>c;++c){var w=u[c+1];c!==x&&(b+=w),i[c]=w}var _=e[x],k=o[m+x],z=i[x],A=z,j=z;k>_?j=Math.max(z,Math.pow(k-_,2)):A=Math.max(z,Math.pow(k-_,2));var M=A+b,E=j+b;if(s.pop(),v>M){var O=2*g+1;if(r>O){var S=s.count;l[S]=O;var F=S*(n+1);u[F]=M;for(var c=1;n>=c;++c)u[F+c]=i[c-1];u[F+x+1]=A,s.push()}}if(v>E){var T=2*(g+1);if(r>T){var S=s.count;l[S]=T;var F=S*(n+1);u[F]=E;for(var c=1;n>=c;++c)u[F+c]=i[c-1];u[F+x+1]=j,s.push()}}}return f.freeFloat64(i),s.dispose(),0>d?-1:this.ids[d]},v.knn=function(e,t,r){if("number"==typeof r){if(0>r)return[]}else r=1/0;var n=this.length;if(1>n)return[];if("number"==typeof t){if(0>=t)return[];t=0|Math.min(t,n)}else t=n;var a=this.ids,o=this.dimension,i=this.points,s=i.data,l=f.mallocFloat64(o),u=new h(t,1),c=u.index,d=u.data,v=new h(n,o+1),g=v.index,m=v.data;g[0]=0;for(var y=0;o>=y;++y)m[y]=0;v.count+=1;for(var x=r;v.count>0&&!(m[0]>=x);){for(var b=g[0],w=i.index(b,0),_=0,y=0;o>y;++y)_+=Math.pow(e[y]-s[w+y],2);if(x>_){u.count>=t&&u.pop();var k=u.count;c[k]=b,d[k]=-_,u.push(),u.count>=t&&(x=-d[0])}for(var z=p.log2(b+1)%o,A=0,y=0;o>y;++y){var j=m[y+1];y!==z&&(A+=j),l[y]=j}var M=e[z],E=s[w+z],O=l[z],S=O,F=O;E>M?F=Math.max(O,Math.pow(E-M,2)):S=Math.max(O,Math.pow(E-M,2));var T=S+A,B=F+A;if(v.pop(),x>T){var C=2*b+1;if(n>C){var I=v.count;g[I]=C;var N=I*(o+1);m[N]=T;for(var y=1;o>=y;++y)m[N+y]=l[y-1];m[N+z+1]=S,v.push()}}if(x>B){var P=2*(b+1);if(n>P){var I=v.count;g[I]=P;var N=I*(o+1);m[N]=B;for(var y=1;o>=y;++y)m[N+y]=l[y-1];m[N+z+1]=F,v.push()}}}f.freeFloat64(l),v.dispose();for(var q=new Array(u.count),a=this.ids,y=u.count-1;y>=0;--y)q[y]=a[c[0]],u.pop();return u.dispose(),q},v.dispose=function(){f.free(this.points.data),f.freeInt32(this.ids),this.points=null,this.ids=null,this.length=0}},{"./lib/heap.js":10,"bit-twiddle":11,"inorder-tree-layout":12,ndarray:30,"ndarray-ops":14,"ndarray-pack":19,"ndarray-scratch":28,"ndarray-select":29,"typedarray-pool":33}],10:[function(e,t,r){"use strict";function n(e){return 1&e?e-1>>1:(e>>1)-1}function a(e,t){this.count=0,this.dataSize=t,this.index=o.mallocInt32(e),this.data=o.mallocFloat64(e*t)}t.exports=a;var o=e("typedarray-pool"),i=a.prototype;i.heapSwap=function(e,t){var r=this.data,n=this.index,a=this.dataSize,o=n[e];n[e]=n[t],n[t]=o;for(var i=a*e,s=a*t,l=0;a>l;++l){var u=r[i];r[i]=r[s],r[s]=u,i+=1,s+=1}},i.heapUp=function(e){for(var t=this.dataSize,r=(this.index,this.data),a=r[t*e];e>0;){var o=n(e);if(o>=0){var i=r[t*o];if(i>a){this.heapSwap(e,o),e=o;continue}}break}},i.heapDown=function(e){for(var t=this.dataSize,r=(this.index,this.data),n=this.count,a=r[t*e];;){var o=a,i=2*e+1,s=2*(e+1),l=e;if(n>i){var u=r[t*i];o>u&&(l=i,o=u)}if(n>s){var c=r[t*s];o>c&&(l=s)}if(l===e)break;this.heapSwap(e,l),e=l}},i.pop=function(){this.count-=1,this.heapSwap(0,this.count),this.heapDown(0)},i.push=function(){this.heapUp(this.count),this.count+=1},i.dispose=function(){o.freeInt32(this.index),o.freeFloat64(this.data)}},{"typedarray-pool":33}],11:[function(e,t,r){"use strict";"use restrict";function n(e){var t=32;return e&=-e,e&&t--,65535&e&&(t-=16),16711935&e&&(t-=8),252645135&e&&(t-=4),858993459&e&&(t-=2),1431655765&e&&(t-=1),t}var a=32;r.INT_BITS=a,r.INT_MAX=2147483647,r.INT_MIN=-1<<a-1,r.sign=function(e){return(e>0)-(0>e)},r.abs=function(e){var t=e>>a-1;return(e^t)-t},r.min=function(e,t){return t^(e^t)&-(t>e)},r.max=function(e,t){return e^(e^t)&-(t>e)},r.isPow2=function(e){return!(e&e-1||!e)},r.log2=function(e){var t,r;return t=(e>65535)<<4,e>>>=t,r=(e>255)<<3,e>>>=r,t|=r,r=(e>15)<<2,e>>>=r,t|=r,r=(e>3)<<1,e>>>=r,t|=r,t|e>>1},r.log10=function(e){return e>=1e9?9:e>=1e8?8:e>=1e7?7:e>=1e6?6:e>=1e5?5:e>=1e4?4:e>=1e3?3:e>=100?2:e>=10?1:0},r.popCount=function(e){return e-=e>>>1&1431655765,e=(858993459&e)+(e>>>2&858993459),16843009*(e+(e>>>4)&252645135)>>>24},r.countTrailingZeros=n,r.nextPow2=function(e){return e+=0===e,--e,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e+1},r.prevPow2=function(e){return e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e-(e>>>1)},r.parity=function(e){return e^=e>>>16,e^=e>>>8,e^=e>>>4,e&=15,27030>>>e&1};var o=new Array(256);!function(e){for(var t=0;256>t;++t){var r=t,n=t,a=7;for(r>>>=1;r;r>>>=1)n<<=1,n|=1&r,--a;e[t]=n<<a&255}}(o),r.reverse=function(e){return o[255&e]<<24|o[e>>>8&255]<<16|o[e>>>16&255]<<8|o[e>>>24&255]},r.interleave2=function(e,t){return e&=65535,e=16711935&(e|e<<8),e=252645135&(e|e<<4),e=858993459&(e|e<<2),e=1431655765&(e|e<<1),t&=65535,t=16711935&(t|t<<8),t=252645135&(t|t<<4),t=858993459&(t|t<<2),t=1431655765&(t|t<<1),e|t<<1},r.deinterleave2=function(e,t){return e=e>>>t&1431655765,e=858993459&(e|e>>>1),e=252645135&(e|e>>>2),e=16711935&(e|e>>>4),e=65535&(e|e>>>16),e<<16>>16},r.interleave3=function(e,t,r){return e&=1023,e=4278190335&(e|e<<16),e=251719695&(e|e<<8),e=3272356035&(e|e<<4),e=1227133513&(e|e<<2),t&=1023,t=4278190335&(t|t<<16),t=251719695&(t|t<<8),t=3272356035&(t|t<<4),t=1227133513&(t|t<<2),e|=t<<1,r&=1023,r=4278190335&(r|r<<16),r=251719695&(r|r<<8),r=3272356035&(r|r<<4),r=1227133513&(r|r<<2),e|r<<2},r.deinterleave3=function(e,t){return e=e>>>t&1227133513,e=3272356035&(e|e>>>2),e=251719695&(e|e>>>4),e=4278190335&(e|e>>>8),e=1023&(e|e>>>16),e<<22>>22},r.nextCombination=function(e){var t=e|e-1;return t+1|(~t&-~t)-1>>>n(e)+1}},{}],12:[function(e,t,r){"use strict";function n(e){var t=(v.nextPow2(e+1)>>>1)-1,r=e-t;return v.nextPow2(r)-1>=t?t:(t>>>1)+r}function a(e){return 0}function o(e){return e-1}function i(e,t){if(0>=e)return 0;var r=n(e);return t>r?i(e-r-1,t-r-1):t===r?v.log2(e):i(r,t)}function s(e,t){return Math.max(t-1,0)}function l(e,t){return Math.min(t+1,e-1)}function u(e,t){if(0>=e)return-1;var r=n(e);if(t>r){var a=u(e-r-1,t-r-1);return 0>a?r:a+r+1}if(t===r)return-1;var a=u(r,t);return 0>a?r:a}function c(e,t){if(0>=e)return 0;var r=n(e);return t>r?c(e-r-1,t-r-1)+r+1:t===r?n(t):c(r,t)}function f(e,t){if(0>=e)return 0;var r=n(e);return t>r?f(e-r-1,t-r-1)+r+1:t===r?n(e-r-1)+r+1:f(r,t)}function d(e,t){return 0===i(e,t)}function p(e,t){e|=0,t|=0;for(var r=0;e>1;){var a=n(e);if(t>a)r+=a+1,e-=a+1,t-=a+1;else{if(t===a)break;e=a}}return r}function h(e,t){e|=0,t|=0;for(var r=0;e>1;){var a=n(e);if(t>a)r+=a+1,e-=a+1,t-=a+1;else{if(t===a){r+=e-1;break}e=a}}return r}var v=e("bit-twiddle");r.root=n,r.begin=a,r.end=o,r.height=i,r.prev=s,r.next=l,r.parent=u,r.left=c,r.right=f,r.leaf=d,r.lo=p,r.hi=h},{"bit-twiddle":13}],13:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],14:[function(e,t,r){"use strict";function n(e){if(!e)return s;for(var t=0;t<e.args.length;++t){var r=e.args[t];e.args[t]=0===t?{name:r,lvalue:!0,rvalue:!!e.rvalue,count:e.count||1}:{name:r,lvalue:!1,rvalue:!0,count:1}}return e.thisVars||(e.thisVars=[]),e.localVars||(e.localVars=[]),e}function a(e){return i({args:e.args,pre:n(e.pre),body:n(e.body),post:n(e.proc),funcName:e.funcName})}function o(e){for(var t=[],r=0;r<e.args.length;++r)t.push("a"+r);var n=new Function("P",["return function ",e.funcName,"_ndarrayops(",t.join(","),") {P(",t.join(","),");return a0}"].join(""));return n(a(e))}var i=e("cwise-compiler"),s={body:"",args:[],thisVars:[],localVars:[]},l={add:"+",sub:"-",mul:"*",div:"/",mod:"%",band:"&",bor:"|",bxor:"^",lshift:"<<",rshift:">>",rrshift:">>>"};!function(){for(var e in l){var t=l[e];r[e]=o({args:["array","array","array"],body:{args:["a","b","c"],body:"a=b"+t+"c"},funcName:e}),r[e+"eq"]=o({args:["array","array"],body:{args:["a","b"],body:"a"+t+"=b"},rvalue:!0,funcName:e+"eq"}),r[e+"s"]=o({args:["array","array","scalar"],body:{args:["a","b","s"],body:"a=b"+t+"s"},funcName:e+"s"}),r[e+"seq"]=o({args:["array","scalar"],body:{args:["a","s"],body:"a"+t+"=s"},rvalue:!0,funcName:e+"seq"})}}();var u={not:"!",bnot:"~",neg:"-",recip:"1.0/"};!function(){for(var e in u){var t=u[e];r[e]=o({args:["array","array"],body:{args:["a","b"],body:"a="+t+"b"},funcName:e}),r[e+"eq"]=o({args:["array"],body:{args:["a"],body:"a="+t+"a"},rvalue:!0,count:2,funcName:e+"eq"})}}();var c={and:"&&",or:"||",eq:"===",neq:"!==",lt:"<",gt:">",leq:"<=",geq:">="};!function(){for(var e in c){var t=c[e];r[e]=o({args:["array","array","array"],body:{args:["a","b","c"],body:"a=b"+t+"c"},funcName:e}),r[e+"s"]=o({args:["array","array","scalar"],body:{args:["a","b","s"],body:"a=b"+t+"s"},funcName:e+"s"}),r[e+"eq"]=o({args:["array","array"],body:{args:["a","b"],body:"a=a"+t+"b"},rvalue:!0,count:2,funcName:e+"eq"}),r[e+"seq"]=o({args:["array","scalar"],body:{args:["a","s"],body:"a=a"+t+"s"},rvalue:!0,count:2,funcName:e+"seq"})}}();var f=["abs","acos","asin","atan","ceil","cos","exp","floor","log","round","sin","sqrt","tan"];!function(){for(var e=0;e<f.length;++e){var t=f[e];r[t]=o({args:["array","array"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b"],body:"a=this_f(b)",thisVars:["this_f"]},funcName:t}),r[t+"eq"]=o({args:["array"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a"],body:"a=this_f(a)",thisVars:["this_f"]},rvalue:!0,count:2,funcName:t+"eq"})}}();var d=["max","min","atan2","pow"];!function(){for(var e=0;e<d.length;++e){var t=d[e];r[t]=o({args:["array","array","array"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b","c"],body:"a=this_f(b,c)",thisVars:["this_f"]},funcName:t}),r[t+"s"]=o({args:["array","array","scalar"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b","c"],body:"a=this_f(b,c)",thisVars:["this_f"]},funcName:t+"s"}),r[t+"eq"]=o({args:["array","array"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b"],body:"a=this_f(a,b)",thisVars:["this_f"]},rvalue:!0,count:2,funcName:t+"eq"}),r[t+"seq"]=o({args:["array","scalar"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b"],body:"a=this_f(a,b)",thisVars:["this_f"]},rvalue:!0,count:2,funcName:t+"seq"})}}();var p=["atan2","pow"];!function(){for(var e=0;e<p.length;++e){var t=p[e];r[t+"op"]=o({args:["array","array","array"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b","c"],body:"a=this_f(c,b)",thisVars:["this_f"]},funcName:t+"op"}),r[t+"ops"]=o({args:["array","array","scalar"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b","c"],body:"a=this_f(c,b)",thisVars:["this_f"]},funcName:t+"ops"}),r[t+"opeq"]=o({args:["array","array"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b"],body:"a=this_f(b,a)",thisVars:["this_f"]},rvalue:!0,count:2,funcName:t+"opeq"}),r[t+"opseq"]=o({args:["array","scalar"],pre:{args:[],body:"this_f=Math."+t,thisVars:["this_f"]},body:{args:["a","b"],body:"a=this_f(b,a)",thisVars:["this_f"]},rvalue:!0,count:2,funcName:t+"opseq"})}}(),r.any=i({args:["array"],pre:s,body:{args:[{name:"a",lvalue:!1,rvalue:!0,count:1}],body:"if(a){return true}",localVars:[],thisVars:[]},post:{args:[],localVars:[],thisVars:[],body:"return false"},funcName:"any"}),r.all=i({args:["array"],pre:s,body:{args:[{name:"x",lvalue:!1,rvalue:!0,count:1}],body:"if(!x){return false}",localVars:[],thisVars:[]},post:{args:[],localVars:[],thisVars:[],body:"return true"},funcName:"all"}),r.sum=i({args:["array"],pre:{args:[],localVars:[],thisVars:["this_s"],body:"this_s=0"},body:{args:[{name:"a",lvalue:!1,rvalue:!0,count:1}],body:"this_s+=a",localVars:[],thisVars:["this_s"]},post:{args:[],localVars:[],thisVars:["this_s"],body:"return this_s"},funcName:"sum"}),r.prod=i({args:["array"],pre:{args:[],localVars:[],thisVars:["this_s"],body:"this_s=1"},body:{args:[{name:"a",lvalue:!1,rvalue:!0,count:1}],body:"this_s*=a",localVars:[],thisVars:["this_s"]},post:{args:[],localVars:[],thisVars:["this_s"],body:"return this_s"},funcName:"prod"}),r.norm2squared=i({args:["array"],pre:{args:[],localVars:[],thisVars:["this_s"],body:"this_s=0"},body:{args:[{name:"a",lvalue:!1,rvalue:!0,count:2}],body:"this_s+=a*a",localVars:[],thisVars:["this_s"]},post:{args:[],localVars:[],thisVars:["this_s"],body:"return this_s"},funcName:"norm2squared"}),r.norm2=i({args:["array"],pre:{args:[],localVars:[],thisVars:["this_s"],body:"this_s=0"},body:{args:[{name:"a",lvalue:!1,rvalue:!0,count:2}],body:"this_s+=a*a",localVars:[],thisVars:["this_s"]},post:{args:[],localVars:[],thisVars:["this_s"],body:"return Math.sqrt(this_s)"},funcName:"norm2"}),r.norminf=i({args:["array"],pre:{args:[],localVars:[],thisVars:["this_s"],body:"this_s=0"},body:{args:[{name:"a",lvalue:!1,rvalue:!0,count:4}],body:"if(-a>this_s){this_s=-a}else if(a>this_s){this_s=a}",localVars:[],thisVars:["this_s"]},post:{args:[],localVars:[],thisVars:["this_s"],body:"return this_s"},funcName:"norminf"}),r.norm1=i({args:["array"],pre:{args:[],localVars:[],thisVars:["this_s"],body:"this_s=0"},body:{args:[{name:"a",lvalue:!1,rvalue:!0,count:3}],body:"this_s+=a<0?-a:a",localVars:[],thisVars:["this_s"]},post:{args:[],localVars:[],thisVars:["this_s"],body:"return this_s"},funcName:"norm1"}),r.sup=i({args:["array"],pre:{body:"this_h=-Infinity",args:[],thisVars:["this_h"],localVars:[]},body:{body:"if(_inline_1_arg0_>this_h)this_h=_inline_1_arg0_",args:[{name:"_inline_1_arg0_",lvalue:!1,rvalue:!0,count:2}],thisVars:["this_h"],localVars:[]},post:{body:"return this_h",args:[],thisVars:["this_h"],localVars:[]}}),r.inf=i({args:["array"],pre:{body:"this_h=Infinity",args:[],thisVars:["this_h"],localVars:[]},body:{body:"if(_inline_1_arg0_<this_h)this_h=_inline_1_arg0_",args:[{name:"_inline_1_arg0_",lvalue:!1,rvalue:!0,count:2}],thisVars:["this_h"],localVars:[]},post:{body:"return this_h",args:[],thisVars:["this_h"],localVars:[]}}),r.argmin=i({args:["index","array","shape"],pre:{body:"{this_v=Infinity;this_i=_inline_0_arg2_.slice(0)}",args:[{name:"_inline_0_arg0_",lvalue:!1,rvalue:!1,count:0},{name:"_inline_0_arg1_",lvalue:!1,rvalue:!1,count:0},{name:"_inline_0_arg2_",lvalue:!1,rvalue:!0,count:1}],thisVars:["this_i","this_v"],localVars:[]},body:{body:"{if(_inline_1_arg1_<this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",args:[{name:"_inline_1_arg0_",lvalue:!1,rvalue:!0,count:2},{name:"_inline_1_arg1_",lvalue:!1,rvalue:!0,count:2}],thisVars:["this_i","this_v"],localVars:["_inline_1_k"]},post:{body:"{return this_i}",args:[],thisVars:["this_i"],localVars:[]}}),r.argmax=i({args:["index","array","shape"],pre:{body:"{this_v=-Infinity;this_i=_inline_0_arg2_.slice(0)}",args:[{name:"_inline_0_arg0_",lvalue:!1,rvalue:!1,count:0},{name:"_inline_0_arg1_",lvalue:!1,rvalue:!1,count:0},{name:"_inline_0_arg2_",lvalue:!1,rvalue:!0,count:1}],thisVars:["this_i","this_v"],localVars:[]},body:{body:"{if(_inline_1_arg1_>this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",args:[{name:"_inline_1_arg0_",lvalue:!1,rvalue:!0,count:2},{name:"_inline_1_arg1_",lvalue:!1,rvalue:!0,count:2}],thisVars:["this_i","this_v"],localVars:["_inline_1_k"]},post:{body:"{return this_i}",args:[],thisVars:["this_i"],localVars:[]}}),r.random=o({args:["array"],pre:{args:[],body:"this_f=Math.random",thisVars:["this_f"]},body:{args:["a"],body:"a=this_f()",thisVars:["this_f"]},funcName:"random"}),r.assign=o({args:["array","array"],body:{args:["a","b"],body:"a=b"},funcName:"assign"}),r.assigns=o({args:["array","scalar"],body:{args:["a","b"],body:"a=b"},funcName:"assigns"}),r.equals=i({args:["array","array"],pre:s,body:{args:[{name:"x",lvalue:!1,rvalue:!0,count:1},{name:"y",lvalue:!1,rvalue:!0,count:1}],body:"if(x!==y){return false}",localVars:[],thisVars:[]},post:{args:[],localVars:[],thisVars:[],body:"return true"},funcName:"equals"})},{"cwise-compiler":15}],15:[function(e,t,r){"use strict";function n(){this.argTypes=[],this.shimArgs=[],this.arrayArgs=[],this.scalarArgs=[],this.offsetArgs=[],this.offsetArgIndex=[],this.indexArgs=[],this.shapeArgs=[],this.funcName="",this.pre=null,this.body=null,this.post=null,this.debug=!1}function a(e){var t=new n;t.pre=e.pre,t.body=e.body,t.post=e.post;var r=e.args.slice(0);t.argTypes=r;for(var a=0;a<r.length;++a){var i=r[a];if("array"===i){if(t.arrayArgs.push(a),t.shimArgs.push("array"+a),a<t.pre.args.length&&t.pre.args[a].count>0)throw new Error("cwise: pre() block may not reference array args");if(a<t.post.args.length&&t.post.args[a].count>0)throw new Error("cwise: post() block may not reference array args")}else if("scalar"===i)t.scalarArgs.push(a),t.shimArgs.push("scalar"+a);else if("index"===i){if(t.indexArgs.push(a),a<t.pre.args.length&&t.pre.args[a].count>0)throw new Error("cwise: pre() block may not reference array index");if(a<t.body.args.length&&t.body.args[a].lvalue)throw new Error("cwise: body() block may not write to array index");if(a<t.post.args.length&&t.post.args[a].count>0)throw new Error("cwise: post() block may not reference array index")}else if("shape"===i){if(t.shapeArgs.push(a),a<t.pre.args.length&&t.pre.args[a].lvalue)throw new Error("cwise: pre() block may not write to array shape");if(a<t.body.args.length&&t.body.args[a].lvalue)throw new Error("cwise: body() block may not write to array shape");if(a<t.post.args.length&&t.post.args[a].lvalue)throw new Error("cwise: post() block may not write to array shape")}else{if("object"!=typeof i||!i.offset)throw new Error("cwise: Unknown argument type "+r[a]);t.argTypes[a]="offset",t.offsetArgs.push({array:i.array,offset:i.offset}),t.offsetArgIndex.push(a)}}if(t.arrayArgs.length<=0)throw new Error("cwise: No array arguments specified");if(t.pre.args.length>r.length)throw new Error("cwise: Too many arguments in pre() block");if(t.body.args.length>r.length)throw new Error("cwise: Too many arguments in body() block");if(t.post.args.length>r.length)throw new Error("cwise: Too many arguments in post() block");return t.debug=!!e.printCode||!!e.debug,t.funcName=e.funcName||"cwise",t.blockSize=e.blockSize||64,o(t)}var o=e("./lib/thunk.js");t.exports=a},{"./lib/thunk.js":17}],16:[function(e,t,r){"use strict";function n(e,t,r){var n,a,o=e.length,i=t.arrayArgs.length,s=t.indexArgs.length>0,l=[],u=[],c=0,f=0;for(n=0;o>n;++n)u.push(["i",n,"=0"].join(""));for(a=0;i>a;++a)for(n=0;o>n;++n)f=c,c=e[n],u.push(0===n?["d",a,"s",n,"=t",a,"p",c].join(""):["d",a,"s",n,"=(t",a,"p",c,"-s",f,"*t",a,"p",f,")"].join(""));for(l.push("var "+u.join(",")),n=o-1;n>=0;--n)c=e[n],l.push(["for(i",n,"=0;i",n,"<s",c,";++i",n,"){"].join(""));for(l.push(r),n=0;o>n;++n){for(f=c,c=e[n],a=0;i>a;++a)l.push(["p",a,"+=d",a,"s",n].join(""));s&&(n>0&&l.push(["index[",f,"]-=s",f].join("")),l.push(["++index[",c,"]"].join(""))),l.push("}")}return l.join("\n")}function a(e,t,r,a){for(var o=t.length,i=r.arrayArgs.length,s=r.blockSize,l=r.indexArgs.length>0,u=[],c=0;i>c;++c)u.push(["var offset",c,"=p",c].join(""));for(var c=e;o>c;++c)u.push(["for(var j"+c+"=SS[",t[c],"]|0;j",c,">0;){"].join("")),u.push(["if(j",c,"<",s,"){"].join("")),u.push(["s",t[c],"=j",c].join("")),u.push(["j",c,"=0"].join("")),u.push(["}else{s",t[c],"=",s].join("")),u.push(["j",c,"-=",s,"}"].join("")),l&&u.push(["index[",t[c],"]=j",c].join(""));for(var c=0;i>c;++c){for(var f=["offset"+c],d=e;o>d;++d)f.push(["j",d,"*t",c,"p",t[d]].join(""));u.push(["p",c,"=(",f.join("+"),")"].join(""))}u.push(n(t,r,a));for(var c=e;o>c;++c)u.push("}");return u.join("\n")}function o(e){for(var t=0,r=e[0].length;r>t;){for(var n=1;n<e.length;++n)if(e[n][t]!==e[0][t])return t;++t}return t}function i(e,t,r){for(var n=e.body,a=[],o=[],i=0;i<e.args.length;++i){var s=e.args[i];if(!(s.count<=0)){var l=new RegExp(s.name,"g"),u="",c=t.arrayArgs.indexOf(i);switch(t.argTypes[i]){case"offset":var f=t.offsetArgIndex.indexOf(i),d=t.offsetArgs[f];c=d.array,u="+q"+f;case"array":u="p"+c+u;var p="l"+i,h="a"+c;1===s.count?"generic"===r[c]?s.lvalue?(a.push(["var ",p,"=",h,".get(",u,")"].join("")),n=n.replace(l,p),o.push([h,".set(",u,",",p,")"].join(""))):n=n.replace(l,[h,".get(",u,")"].join("")):n=n.replace(l,[h,"[",u,"]"].join("")):"generic"===r[c]?(a.push(["var ",p,"=",h,".get(",u,")"].join("")),n=n.replace(l,p),s.lvalue&&o.push([h,".set(",u,",",p,")"].join(""))):(a.push(["var ",p,"=",h,"[",u,"]"].join("")),n=n.replace(l,p),s.lvalue&&o.push([h,"[",u,"]=",p].join("")));break;case"scalar":n=n.replace(l,"Y"+t.scalarArgs.indexOf(i));break;case"index":n=n.replace(l,"index");break;case"shape":n=n.replace(l,"shape")}}}return[a.join("\n"),n,o.join("\n")].join("\n").trim()}function s(e){for(var t=new Array(e.length),r=!0,n=0;n<e.length;++n){var a=e[n],o=a.match(/\d+/);o=o?o[0]:"",t[n]=0===a.charAt(0)?"u"+a.charAt(1)+o:a.charAt(0)+o,n>0&&(r=r&&t[n]===t[n-1])}return r?t[0]:t.join("")}function l(e,t){for(var r=0|t[1].length,l=new Array(e.arrayArgs.length),c=new Array(e.arrayArgs.length),f=["SS"],d=["'use strict'"],p=[],h=0;r>h;++h)p.push(["s",h,"=SS[",h,"]"].join(""));for(var v=0;v<e.arrayArgs.length;++v){f.push("a"+v),f.push("t"+v),f.push("p"+v),c[v]=t[2*v],l[v]=t[2*v+1];for(var h=0;r>h;++h)p.push(["t",v,"p",h,"=t",v,"[",h,"]"].join(""))}for(var v=0;v<e.scalarArgs.length;++v)f.push("Y"+v);if(e.shapeArgs.length>0&&p.push("shape=SS.slice(0)"),e.indexArgs.length>0){for(var g=new Array(r),v=0;r>v;++v)g[v]="0";p.push(["index=[",g.join(","),"]"].join(""))}for(var v=0;v<e.offsetArgs.length;++v){for(var m=e.offsetArgs[v],y=[],h=0;h<m.offset.length;++h)0!==m.offset[h]&&y.push(1===m.offset[h]?["t",m.array,"p",h].join(""):[m.offset[h],"*t",m.array,"p",h].join(""));p.push(0===y.length?"q"+v+"=0":["q",v,"=",y.join("+")].join(""))}var x=u([].concat(e.pre.thisVars).concat(e.body.thisVars).concat(e.post.thisVars));p=p.concat(x),d.push("var "+p.join(","));for(var v=0;v<e.arrayArgs.length;++v)d.push("p"+v+"|=0");e.pre.body.length>3&&d.push(i(e.pre,e,c));var b=i(e.body,e,c),w=o(l);d.push(r>w?a(w,l[0],e,b):n(l[0],e,b)),e.post.body.length>3&&d.push(i(e.post,e,c)),e.debug&&console.log("Generated cwise routine for ",t,":\n\n",d.join("\n"));var _=[e.funcName||"unnamed","_cwise_loop_",l[0].join("s"),"m",w,s(c)].join(""),k=new Function(["function ",_,"(",f.join(","),"){",d.join("\n"),"} return ",_].join(""));return k()}var u=e("uniq");t.exports=l},{uniq:18}],17:[function(e,t,r){"use strict";function n(e){var t=["'use strict'","var CACHED={}"],r=[],n=e.funcName+"_cwise_thunk";t.push(["return function ",n,"(",e.shimArgs.join(","),"){"].join(""));for(var o=[],i=[],s=[["array",e.arrayArgs[0],".shape"].join("")],l=0;l<e.arrayArgs.length;++l){var u=e.arrayArgs[l];r.push(["t",u,"=array",u,".dtype,","r",u,"=array",u,".order"].join("")),o.push("t"+u),o.push("r"+u),i.push("t"+u),i.push("r"+u+".join()"),s.push("array"+u+".data"),s.push("array"+u+".stride"),s.push("array"+u+".offset|0")}for(var l=0;l<e.scalarArgs.length;++l)s.push("scalar"+e.scalarArgs[l]);r.push(["type=[",i.join(","),"].join()"].join("")),r.push("proc=CACHED[type]"),t.push("var "+r.join(",")),t.push(["if(!proc){","CACHED[type]=proc=compile([",o.join(","),"])}","return proc(",s.join(","),")}"].join("")),e.debug&&console.log("Generated thunk:",t.join("\n"));var c=new Function("compile",t.join("\n"));return c(a.bind(void 0,e))}var a=e("./compile.js");t.exports=n},{"./compile.js":16}],18:[function(e,t,r){"use strict";function n(e,t){for(var r=1,n=e.length,a=e[0],o=e[0],i=1;n>i;++i)if(o=a,a=e[i],t(a,o)){if(i===r){r++;continue}e[r++]=a}return e.length=r,e}function a(e){for(var t=1,r=e.length,n=e[0],a=e[0],o=1;r>o;++o,a=n)if(a=n,n=e[o],n!==a){if(o===t){t++;continue}e[t++]=n}return e.length=t,e}function o(e,t,r){return 0===e.length?e:t?(r||e.sort(t),n(e,t)):(r||e.sort(),a(e))}t.exports=o},{}],19:[function(e,t,r){"use strict";var n=e("ndarray"),a=e("./doConvert.js");t.exports=function(e,t){for(var r=[],o=e,i=1;o instanceof Array;)r.push(o.length),i*=o.length,o=o[0];return 0===r.length?n():(t||(t=n(new Float64Array(i),r)),a(t,e),t)}},{"./doConvert.js":20,ndarray:30}],20:[function(e,t,r){t.exports=e("cwise-compiler")({args:["array","scalar","index"],pre:{body:"{}",args:[],thisVars:[],localVars:[]},body:{body:"{\nvar _inline_1_v=_inline_1_arg1_,_inline_1_i\nfor(_inline_1_i=0;_inline_1_i<_inline_1_arg2_.length-1;++_inline_1_i) {\n_inline_1_v=_inline_1_v[_inline_1_arg2_[_inline_1_i]]\n}\n_inline_1_arg0_=_inline_1_v[_inline_1_arg2_[_inline_1_arg2_.length-1]]\n}",args:[{name:"_inline_1_arg0_",lvalue:!0,rvalue:!1,count:1},{name:"_inline_1_arg1_",lvalue:!1,rvalue:!0,count:1},{name:"_inline_1_arg2_",lvalue:!1,rvalue:!0,count:4}],thisVars:[],localVars:["_inline_1_i","_inline_1_v"]},post:{body:"{}",args:[],thisVars:[],localVars:[]},funcName:"convert",blockSize:64})},{"cwise-compiler":21}],21:[function(e,t,r){"use strict";function n(){this.argTypes=[],this.shimArgs=[],this.arrayArgs=[],this.scalarArgs=[],this.offsetArgs=[],this.offsetArgIndex=[],this.indexArgs=[],this.shapeArgs=[],this.funcName="",this.pre=null,this.body=null,this.post=null,this.debug=!1}function a(e){var t=new n;t.pre=e.pre,t.body=e.body,t.post=e.post;var r=e.args.slice(0);t.argTypes=r.slice(0);for(var a=0;a<r.length;++a){var i=r[a];if("array"===i){if(t.arrayArgs.push(a),t.shimArgs.push("array"+a),a<t.pre.args.length&&t.pre.args[a].count>0)throw new Error("cwise: pre() block may not reference array args");if(a<t.post.args.length&&t.post.args[a].count>0)throw new Error("cwise: post() block may not reference array args")}else if("scalar"===i)t.scalarArgs.push(a),t.shimArgs.push("scalar"+a);else if("index"===i){if(t.indexArgs.push(a),a<t.pre.args.length&&t.pre.args[a].count>0)throw new Error("cwise: pre() block may not reference array index");if(a<t.body.args.length&&t.body.args[a].lvalue)throw new Error("cwise: body() block may not write to array index");if(a<t.post.args.length&&t.post.args[a].count>0)throw new Error("cwise: post() block may not reference array index")}else if("shape"===i){if(t.shapeArgs.push(a),a<t.pre.args.length&&t.pre.args[a].lvalue)throw new Error("cwise: pre() block may not write to array shape");if(a<t.body.args.length&&t.body.args[a].lvalue)throw new Error("cwise: body() block may not write to array shape");if(a<t.post.args.length&&t.post.args[a].lvalue)throw new Error("cwise: post() block may not write to array shape")}else{if("object"!=typeof i||!i.offset)throw new Error("cwise: Unknown argument type "+r[a]);t.argTypes[a]="offset",t.offsetArgs.push({array:i.array,offset:i.offset}),t.offsetArgIndex.push(a)}}if(t.arrayArgs.length<=0)throw new Error("cwise: No array arguments specified");if(t.pre.args.length>r.length)throw new Error("cwise: Too many arguments in pre() block");if(t.body.args.length>r.length)throw new Error("cwise: Too many arguments in body() block");if(t.post.args.length>r.length)throw new Error("cwise: Too many arguments in post() block");return t.debug=!!e.printCode||!!e.debug,t.funcName=e.funcName||"cwise",t.blockSize=e.blockSize||64,o(t)}var o=e("./lib/thunk.js");t.exports=a},{"./lib/thunk.js":23}],22:[function(e,t,r){"use strict";function n(e,t,r){var n,a,o=e.length,i=t.arrayArgs.length,s=t.indexArgs.length>0,l=[],u=[],c=0,f=0;for(n=0;o>n;++n)u.push(["i",n,"=0"].join(""));for(a=0;i>a;++a)for(n=0;o>n;++n)f=c,c=e[n],u.push(0===n?["d",a,"s",n,"=t",a,"[",c,"]"].join(""):["d",a,"s",n,"=(t",a,"[",c,"]-s",f,"*t",a,"[",f,"])"].join(""));for(l.push("var "+u.join(",")),n=o-1;n>=0;--n)c=e[n],l.push(["for(i",n,"=0;i",n,"<s",c,";++i",n,"){"].join(""));for(l.push(r),n=0;o>n;++n){for(f=c,c=e[n],a=0;i>a;++a)l.push(["p",a,"+=d",a,"s",n].join(""));s&&(n>0&&l.push(["index[",f,"]-=s",f].join("")),l.push(["++index[",c,"]"].join(""))),l.push("}")}return l.join("\n")}function a(e,t,r,a){for(var o=t.length,i=r.arrayArgs.length,s=r.blockSize,l=r.indexArgs.length>0,u=[],c=0;i>c;++c)u.push(["var offset",c,"=p",c].join(""));for(var c=e;o>c;++c)u.push(["for(var j"+c+"=SS[",t[c],"]|0;j",c,">0;){"].join("")),u.push(["if(j",c,"<",s,"){"].join("")),u.push(["s",t[c],"=j",c].join("")),u.push(["j",c,"=0"].join("")),u.push(["}else{s",t[c],"=",s].join("")),u.push(["j",c,"-=",s,"}"].join("")),l&&u.push(["index[",t[c],"]=j",c].join(""));for(var c=0;i>c;++c){for(var f=["offset"+c],d=e;o>d;++d)f.push(["j",d,"*t",c,"[",t[d],"]"].join(""));u.push(["p",c,"=(",f.join("+"),")"].join(""))}u.push(n(t,r,a));for(var c=e;o>c;++c)u.push("}");return u.join("\n")}function o(e){for(var t=0,r=e[0].length;r>t;){for(var n=1;n<e.length;++n)if(e[n][t]!==e[0][t])return t;++t}return t}function i(e,t,r){for(var n=e.body,a=[],o=[],i=0;i<e.args.length;++i){var s=e.args[i];if(!(s.count<=0)){var l=new RegExp(s.name,"g"),u="",c=t.arrayArgs.indexOf(i);switch(t.argTypes[i]){case"offset":var f=t.offsetArgIndex.indexOf(i),d=t.offsetArgs[f];c=d.array,u="+q"+f;case"array":u="p"+c+u;var p="l"+i,h="a"+c;1===s.count?"generic"===r[c]?s.lvalue?(a.push(["var ",p,"=",h,".get(",u,")"].join("")),n=n.replace(l,p),o.push([h,".set(",u,",",p,")"].join(""))):n=n.replace(l,[h,".get(",u,")"].join("")):n=n.replace(l,[h,"[",u,"]"].join("")):"generic"===r[c]?(a.push(["var ",p,"=",h,".get(",u,")"].join("")),n=n.replace(l,p),s.lvalue&&o.push([h,".set(",u,",",p,")"].join(""))):(a.push(["var ",p,"=",h,"[",u,"]"].join("")),n=n.replace(l,p),s.lvalue&&o.push([h,"[",u,"]=",p].join("")));break;case"scalar":n=n.replace(l,"Y"+t.scalarArgs.indexOf(i));break;case"index":n=n.replace(l,"index");break;case"shape":n=n.replace(l,"shape")}}}return[a.join("\n"),n,o.join("\n")].join("\n").trim()}function s(e){for(var t=new Array(e.length),r=!0,n=0;n<e.length;++n){var a=e[n],o=a.match(/\d+/);o=o?o[0]:"",t[n]=0===a.charAt(0)?"u"+a.charAt(1)+o:a.charAt(0)+o,n>0&&(r=r&&t[n]===t[n-1])}return r?t[0]:t.join("")}function l(e,t){for(var r=0|t[1].length,l=new Array(e.arrayArgs.length),c=new Array(e.arrayArgs.length),f=["SS"],d=["'use strict'"],p=[],h=0;r>h;++h)p.push(["s",h,"=SS[",h,"]"].join(""));for(var v=0;v<e.arrayArgs.length;++v)f.push("a"+v),f.push("t"+v),f.push("p"+v),c[v]=t[2*v],l[v]=t[2*v+1];for(var v=0;v<e.scalarArgs.length;++v)f.push("Y"+v);if(e.shapeArgs.length>0&&p.push("shape=SS.slice(0)"),
e.indexArgs.length>0){for(var g=new Array(r),v=0;r>v;++v)g[v]="0";p.push(["index=[",g.join(","),"]"].join(""))}for(var v=0;v<e.offsetArgs.length;++v){for(var m=e.offsetArgs[v],y=[],h=0;h<m.offset.length;++h)0!==m.offset[h]&&y.push(1===m.offset[h]?["t",m.array,"[",h,"]"].join(""):[m.offset[h],"*t",m.array,"[",h,"]"].join(""));p.push(0===y.length?"q"+v+"=0":["q",v,"=(",y.join("+"),")|0"].join(""))}var x=u([].concat(e.pre.thisVars).concat(e.body.thisVars).concat(e.post.thisVars));p=p.concat(x),d.push("var "+p.join(","));for(var v=0;v<e.arrayArgs.length;++v)d.push("p"+v+"|=0");e.pre.body.length>3&&d.push(i(e.pre,e,c));var b=i(e.body,e,c),w=o(l);d.push(r>w?a(w,l[0],e,b):n(l[0],e,b)),e.post.body.length>3&&d.push(i(e.post,e,c)),e.debug&&console.log("Generated cwise routine for ",t,":\n\n",d.join("\n"));var _=[e.funcName||"unnamed","_cwise_loop_",l[0].join("s"),"m",w,s(c)].join(""),k=new Function(["function ",_,"(",f.join(","),"){",d.join("\n"),"} return ",_].join(""));return k()}var u=e("uniq");t.exports=l},{uniq:24}],23:[function(e,t,r){arguments[4][17][0].apply(r,arguments)},{"./compile.js":22,dup:17}],24:[function(e,t,r){"use strict";function n(e,t){for(var r=1,n=e.length,a=e[0],o=e[0],i=1;n>i;++i)if(o=a,a=e[i],t(a,o)){if(i===r){r++;continue}e[r++]=a}return e.length=r,e}function a(e){for(var t=1,r=e.length,n=e[0],a=e[0],o=1;r>o;++o,a=n)if(a=n,n=e[o],n!==a){if(o===t){t++;continue}e[t++]=n}return e.length=t,e}function o(e,t,r){return 0===e.length?[]:t?(r||e.sort(t),n(e,t)):(r||e.sort(),a(e))}t.exports=o},{}],25:[function(e,t,r){arguments[4][11][0].apply(r,arguments)},{dup:11}],26:[function(e,t,r){"use strict";function n(e,t,r){var a=0|e[r];if(0>=a)return[];var o,i=new Array(a);if(r===e.length-1)for(o=0;a>o;++o)i[o]=t;else for(o=0;a>o;++o)i[o]=n(e,t,r+1);return i}function a(e,t){var r,n;for(r=new Array(e),n=0;e>n;++n)r[n]=t;return r}function o(e,t){switch("undefined"==typeof t&&(t=0),typeof e){case"number":if(e>0)return a(0|e,t);break;case"object":if("number"==typeof e.length)return n(e,t,0)}return[]}t.exports=o},{}],27:[function(e,t,r){(function(t,n){"use strict";function a(e){if(e){var t=e.length||e.byteLength,r=y.log2(t);_[r].push(e)}}function o(e){a(e.buffer)}function i(e){var e=y.nextPow2(e),t=y.log2(e),r=_[t];return r.length>0?r.pop():new ArrayBuffer(e)}function s(e){return new Uint8Array(i(e),0,e)}function l(e){return new Uint16Array(i(2*e),0,e)}function u(e){return new Uint32Array(i(4*e),0,e)}function c(e){return new Int8Array(i(e),0,e)}function f(e){return new Int16Array(i(2*e),0,e)}function d(e){return new Int32Array(i(4*e),0,e)}function p(e){return new Float32Array(i(4*e),0,e)}function h(e){return new Float64Array(i(8*e),0,e)}function v(e){return b?new Uint8ClampedArray(i(e),0,e):s(e)}function g(e){return new DataView(i(e),0,e)}function m(e){e=y.nextPow2(e);var t=y.log2(e),r=k[t];return r.length>0?r.pop():new n(e)}var y=e("bit-twiddle"),x=e("dup");t.__TYPEDARRAY_POOL||(t.__TYPEDARRAY_POOL={UINT8:x([32,0]),UINT16:x([32,0]),UINT32:x([32,0]),INT8:x([32,0]),INT16:x([32,0]),INT32:x([32,0]),FLOAT:x([32,0]),DOUBLE:x([32,0]),DATA:x([32,0]),UINT8C:x([32,0]),BUFFER:x([32,0])});var b="undefined"!=typeof Uint8ClampedArray,w=t.__TYPEDARRAY_POOL;w.UINT8C||(w.UINT8C=x([32,0])),w.BUFFER||(w.BUFFER=x([32,0]));var _=w.DATA,k=w.BUFFER;r.free=function(e){if(n.isBuffer(e))k[y.log2(e.length)].push(e);else{if("[object ArrayBuffer]"!==Object.prototype.toString.call(e)&&(e=e.buffer),!e)return;var t=e.length||e.byteLength,r=0|y.log2(t);_[r].push(e)}},r.freeUint8=r.freeUint16=r.freeUint32=r.freeInt8=r.freeInt16=r.freeInt32=r.freeFloat32=r.freeFloat=r.freeFloat64=r.freeDouble=r.freeUint8Clamped=r.freeDataView=o,r.freeArrayBuffer=a,r.freeBuffer=function(e){k[y.log2(e.length)].push(e)},r.malloc=function(e,t){if(void 0===t||"arraybuffer"===t)return i(e);switch(t){case"uint8":return s(e);case"uint16":return l(e);case"uint32":return u(e);case"int8":return c(e);case"int16":return f(e);case"int32":return d(e);case"float":case"float32":return p(e);case"double":case"float64":return h(e);case"uint8_clamped":return v(e);case"buffer":return m(e);case"data":case"dataview":return g(e);default:return null}return null},r.mallocArrayBuffer=i,r.mallocUint8=s,r.mallocUint16=l,r.mallocUint32=u,r.mallocInt8=c,r.mallocInt16=f,r.mallocInt32=d,r.mallocFloat32=r.mallocFloat=p,r.mallocFloat64=r.mallocDouble=h,r.mallocUint8Clamped=v,r.mallocDataView=g,r.mallocBuffer=m,r.clearCache=function(){for(var e=0;32>e;++e)w.UINT8[e].length=0,w.UINT16[e].length=0,w.UINT32[e].length=0,w.INT8[e].length=0,w.INT16[e].length=0,w.INT32[e].length=0,w.FLOAT[e].length=0,w.DOUBLE[e].length=0,w.UINT8C[e].length=0,_[e].length=0,k[e].length=0}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer)},{"bit-twiddle":25,buffer:1,dup:26}],28:[function(e,t,r){"use strict";function n(e){var t=e.dtype;("generic"===t||"array"===t)&&(t="double");var r=u.malloc(e.size,t),n=s(r,e.shape);return l.assign(n,e),n}function a(e,t){t||(t="double");for(var r=1,n=new Array(e.length),a=e.length-1;a>=0;--a)n[a]=r,r*=e[a];return s(u.malloc(r,t),e,n,0)}function o(e){"generic"!==e.dtype&&"array"!==e.dtype&&u.free(e.data)}function i(e,t){t||(t="double");for(var r=1,n=new Array(e.length),a=e.length-1;a>=0;--a)n[a]=r,r*=e[a];for(var o=u.malloc(r,t),a=0;r>a;++a)o[a]=0;return s(o,e,n,0)}var s=e("ndarray"),l=e("ndarray-ops"),u=e("typedarray-pool");r.clone=n,r.malloc=a,r.free=o,r.zeros=i},{ndarray:30,"ndarray-ops":14,"typedarray-pool":27}],29:[function(e,t,r){"use strict";function n(e){return"s"+e}function a(e){return"t"+e}function o(e){return"u"+e}function i(e){return"v"+e}function s(e){return"i"+e}function l(e){return"p"+e}function u(e){return"x"+e}function c(e){var t=e.slice();return t.splice(e.indexOf(0),1),t.unshift(0),t}function f(e,t,r){function f(r,o,c){if(t)j.push(l(0),".offset=",y,"+",a(e[0]),"*(",o,");",l(1),".offset=",y,"+",a(e[0]),"*(",c,");",r,"=",g,"(",l(0),",",l(1),");");else{j.push(u(0),"=",y,"+",a(0),"*(",o,");",u(1),"=",y,"+",a(0),"*(",c,");"),p>1&&j.push("_cmp:");for(var f=p-1;f>0;--f)j.push("for(",s(f),"=0;",s(f),"<",n(f),";",s(f),"++){");z?j.push(r,"=",m,".get(",u(0),")-",m,".get(",u(1),");"):j.push(r,"=",m,"[",u(0),"]-",m,"[",u(1),"];"),p>1&&j.push("if(",r,")break _cmp;");for(var f=1;p>f;++f)j.push(u(0),"+=",i(f),";",u(1),"+=",i(f),"}")}}function d(t,r){j.push(u(0),"=",y,"+",a(e[0]),"*(",t,");",u(1),"=",y,"+",a(e[0]),"*(",r,");");for(var i=p-1;i>0;--i)j.push("for(",s(e[i]),"=0;",s(e[i]),"<",n(e[i]),";",s(e[i]),"++){");z?j.push(b,"=",m,".get(",u(0),");",m,".set(",u(0),",",m,".get(",u(1),"));",m,".set(",u(1),",",b,");"):j.push(b,"=",m,"[",u(0),"];",m,"[",u(0),"]=",m,"[",u(1),"];",m,"[",u(1),"]=",b,";");for(var i=1;p>i;++i)j.push(u(0),"+=",o(e[i]),";",u(1),"+=",o(e[i]),"}")}e=c(e);var p=e.length,z="generic"===r,A="ndSelect"+r+e.join("_")+"_"+(t?"cmp":"lex"),j=[],M=[h,v];t&&M.push(g);for(var E=[m+"="+h+".data",y+"="+h+".offset|0",x+"=Math.random",b],O=0;2>O;++O)E.push(u(O)+"=0");for(var O=0;p>O;++O)E.push(n(O)+"="+h+".shape["+O+"]|0",a(O)+"="+h+".stride["+O+"]|0",s(O)+"=0");for(var O=1;p>O;++O)p-1>O?E.push(i(O)+"=("+a(O)+"-"+n(O+1)+"*"+a(O+1)+")|0",o(e[O])+"=("+a(e[O])+"-"+n(e[O+1])+"*"+a(e[O+1])+")|0"):E.push(i(O)+"="+a(O),o(e[O])+"="+a(e[O]));if(t)for(var O=0;2>O;++O)E.push(l(O)+"="+h+".pick(0)");E.push(k+"=0",w+"=0",_+"="+n(e[0])+"-1"),j.push("while(",w,"<",_,"){",k,"=(",x,"()*(",_,"-",w,"+1)+",w,")|0;"),d(k,_),j.push(k,"=",w,";","for(",s(0),"=",w,";",s(0),"<",_,";",s(0),"++){"),f(b,s(0),_),j.push("if(",b,"<0){"),d(k,s(0)),j.push(k,"++;"),j.push("}}"),d(k,_),j.push("if(",k,"===",v,"){",w,"=",k,";","break;","}else if(",v,"<",k,"){",_,"=",k,"-1;","}else{",w,"=",k,"+1;","}","}"),t?j.push(l(0),".offset=",y,"+",w,"*",a(0),";","return ",l(0),";"):j.push("return ",h,".pick(",w,");");var S=["'use strict';function ",A,"(",M,"){","var ",E.join(),";",j.join(""),"};return ",A].join(""),F=new Function(S);return F()}function d(e,t,r){var n=e.join()+t+r,a=z[n];return a?a:z[n]=f(e,t,r)}function p(e,t,r){if(t|=0,0===e.dimension||e.shape[0]<=t||0>t)return null;var n=!!r,a=d(e.order,n,e.dtype);return n?a(e,t,r):a(e,t)}t.exports=p,t.exports.compile=d;var h="a",v="K",g="C",m="d",y="o",x="R",b="T",w="L",_="H",k="X",z={}},{}],30:[function(e,t,r){(function(r){function n(e,t){return e[0]-t[0]}function a(){var e,t=this.stride,r=new Array(t.length);for(e=0;e<r.length;++e)r[e]=[Math.abs(t[e]),e];r.sort(n);var a=new Array(r.length);for(e=0;e<a.length;++e)a[e]=r[e][1];return a}function o(e,t){var r=["View",t,"d",e].join("");0>t&&(r="View_Nil"+e);var n="generic"===e;if(-1===t){var o="function "+r+"(a){this.data=a;};var proto="+r+".prototype;proto.dtype='"+e+"';proto.index=function(){return -1};proto.size=0;proto.dimension=-1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function(){return new "+r+"(this.data);};proto.get=proto.set=function(){};proto.pick=function(){return null};return function construct_"+r+"(a){return new "+r+"(a);}",i=new Function(o);return i()}if(0===t){var o="function "+r+"(a,d) {this.data = a;this.offset = d};var proto="+r+".prototype;proto.dtype='"+e+"';proto.index=function(){return this.offset};proto.dimension=0;proto.size=1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function "+r+"_copy() {return new "+r+"(this.data,this.offset)};proto.pick=function "+r+"_pick(){return TrivialArray(this.data);};proto.valueOf=proto.get=function "+r+"_get(){return "+(n?"this.data.get(this.offset)":"this.data[this.offset]")+"};proto.set=function "+r+"_set(v){return "+(n?"this.data.set(this.offset,v)":"this.data[this.offset]=v")+"};return function construct_"+r+"(a,b,c,d){return new "+r+"(a,d)}",i=new Function("TrivialArray",o);return i(d[e][0])}var o=["'use strict'"],s=l(t),c=s.map(function(e){return"i"+e}),f="this.offset+"+s.map(function(e){return"this._stride"+e+"*i"+e}).join("+");o.push("function "+r+"(a,"+s.map(function(e){return"b"+e}).join(",")+","+s.map(function(e){return"c"+e}).join(",")+",d){this.data=a");for(var p=0;t>p;++p)o.push("this._shape"+p+"=b"+p+"|0");for(var p=0;t>p;++p)o.push("this._stride"+p+"=c"+p+"|0");o.push("this.offset=d|0}","var proto="+r+".prototype","proto.dtype='"+e+"'","proto.dimension="+t);var h="VStride"+t+"d"+e,v="VShape"+t+"d"+e,g={stride:h,shape:v};for(var m in g){var y=g[m];o.push("function "+y+"(v) {this._v=v} var aproto="+y+".prototype","aproto.length="+t);for(var x=[],p=0;t>p;++p)x.push(["this._v._",m,p].join(""));o.push("aproto.toJSON=function "+y+"_toJSON(){return ["+x.join(",")+"]}","aproto.valueOf=aproto.toString=function "+y+"_toString(){return ["+x.join(",")+"].join()}");for(var p=0;t>p;++p)o.push("Object.defineProperty(aproto,"+p+",{get:function(){return this._v._"+m+p+"},set:function(v){return this._v._"+m+p+"=v|0},enumerable:true})");for(var p=0;p<u.length;++p)u[p]in Array.prototype&&o.push("aproto."+u[p]+"=Array.prototype."+u[p]);o.push(["Object.defineProperty(proto,'",m,"',{get:function ",y,"_get(){return new ",y,"(this)},set: function ",y,"_set(v){"].join(""));for(var p=0;t>p;++p)o.push("this._"+m+p+"=v["+p+"]|0");o.push("return v}})")}o.push("Object.defineProperty(proto,'size',{get:function "+r+"_size(){return "+s.map(function(e){return"this._shape"+e}).join("*"),"}})"),1===t?o.push("proto.order=[0]"):(o.push("Object.defineProperty(proto,'order',{get:"),4>t?(o.push("function "+r+"_order(){"),2===t?o.push("return (Math.abs(this._stride0)>Math.abs(this._stride1))?[1,0]:[0,1]}})"):3===t&&o.push("var s0=Math.abs(this._stride0),s1=Math.abs(this._stride1),s2=Math.abs(this._stride2);if(s0>s1){if(s1>s2){return [2,1,0];}else if(s0>s2){return [1,2,0];}else{return [1,0,2];}}else if(s0>s2){return [2,0,1];}else if(s2>s1){return [0,1,2];}else{return [0,2,1];}}})")):o.push("ORDER})")),o.push("proto.set=function "+r+"_set("+c.join(",")+",v){"),o.push(n?"return this.data.set("+f+",v)}":"return this.data["+f+"]=v}"),o.push("proto.get=function "+r+"_get("+c.join(",")+"){"),o.push(n?"return this.data.get("+f+")}":"return this.data["+f+"]}"),o.push("proto.index=function "+r+"_index(",c.join(),"){return "+f+"}"),o.push("proto.hi=function "+r+"_hi("+c.join(",")+"){return new "+r+"(this.data,"+s.map(function(e){return["(typeof i",e,"!=='number'||i",e,"<0)?this._shape",e,":i",e,"|0"].join("")}).join(",")+","+s.map(function(e){return"this._stride"+e}).join(",")+",this.offset)}");var b=s.map(function(e){return"a"+e+"=this._shape"+e}),w=s.map(function(e){return"c"+e+"=this._stride"+e});o.push("proto.lo=function "+r+"_lo("+c.join(",")+"){var b=this.offset,d=0,"+b.join(",")+","+w.join(","));for(var p=0;t>p;++p)o.push("if(typeof i"+p+"==='number'&&i"+p+">=0){d=i"+p+"|0;b+=c"+p+"*d;a"+p+"-=d}");o.push("return new "+r+"(this.data,"+s.map(function(e){return"a"+e}).join(",")+","+s.map(function(e){return"c"+e}).join(",")+",b)}"),o.push("proto.step=function "+r+"_step("+c.join(",")+"){var "+s.map(function(e){return"a"+e+"=this._shape"+e}).join(",")+","+s.map(function(e){return"b"+e+"=this._stride"+e}).join(",")+",c=this.offset,d=0,ceil=Math.ceil");for(var p=0;t>p;++p)o.push("if(typeof i"+p+"==='number'){d=i"+p+"|0;if(d<0){c+=b"+p+"*(a"+p+"-1);a"+p+"=ceil(-a"+p+"/d)}else{a"+p+"=ceil(a"+p+"/d)}b"+p+"*=d}");o.push("return new "+r+"(this.data,"+s.map(function(e){return"a"+e}).join(",")+","+s.map(function(e){return"b"+e}).join(",")+",c)}");for(var _=new Array(t),k=new Array(t),p=0;t>p;++p)_[p]="a[i"+p+"]",k[p]="b[i"+p+"]";o.push("proto.transpose=function "+r+"_transpose("+c+"){"+c.map(function(e,t){return e+"=("+e+"===undefined?"+t+":"+e+"|0)"}).join(";"),"var a=this.shape,b=this.stride;return new "+r+"(this.data,"+_.join(",")+","+k.join(",")+",this.offset)}"),o.push("proto.pick=function "+r+"_pick("+c+"){var a=[],b=[],c=this.offset");for(var p=0;t>p;++p)o.push("if(typeof i"+p+"==='number'&&i"+p+">=0){c=(c+this._stride"+p+"*i"+p+")|0}else{a.push(this._shape"+p+");b.push(this._stride"+p+")}");o.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}"),o.push("return function construct_"+r+"(data,shape,stride,offset){return new "+r+"(data,"+s.map(function(e){return"shape["+e+"]"}).join(",")+","+s.map(function(e){return"stride["+e+"]"}).join(",")+",offset)}");var i=new Function("CTOR_LIST","ORDER",o.join("\n"));return i(d[e],a)}function i(e){if(f&&r.isBuffer(e))return"buffer";if(c)switch(Object.prototype.toString.call(e)){case"[object Float64Array]":return"float64";case"[object Float32Array]":return"float32";case"[object Int8Array]":return"int8";case"[object Int16Array]":return"int16";case"[object Int32Array]":return"int32";case"[object Uint8Array]":return"uint8";case"[object Uint16Array]":return"uint16";case"[object Uint32Array]":return"uint32";case"[object Uint8ClampedArray]":return"uint8_clamped"}return Array.isArray(e)?"array":"generic"}function s(e,t,r,n){if(void 0===e){var a=d.array[0];return a([])}"number"==typeof e&&(e=[e]),void 0===t&&(t=[e.length]);var s=t.length;if(void 0===r){r=new Array(s);for(var l=s-1,u=1;l>=0;--l)r[l]=u,u*=t[l]}if(void 0===n){n=0;for(var l=0;s>l;++l)r[l]<0&&(n-=(t[l]-1)*r[l])}for(var c=i(e),f=d[c];f.length<=s+1;)f.push(o(c,f.length-1));var a=f[s+1];return a(e,t,r,n)}var l=e("iota-array"),u=["concat","join","slice","toString","indexOf","lastIndexOf","forEach","every","some","filter","map","reduce","reduceRight"],c="undefined"!=typeof Float64Array,f="undefined"!=typeof r,d={float32:[],float64:[],int8:[],int16:[],int32:[],uint8:[],uint16:[],uint32:[],array:[],uint8_clamped:[],buffer:[],generic:[]};t.exports=s}).call(this,e("buffer").Buffer)},{buffer:1,"iota-array":31}],31:[function(e,t,r){"use strict";function n(e){for(var t=new Array(e),r=0;e>r;++r)t[r]=r;return t}t.exports=n},{}],32:[function(e,t,r){arguments[4][26][0].apply(r,arguments)},{dup:26}],33:[function(e,t,r){arguments[4][27][0].apply(r,arguments)},{"bit-twiddle":11,buffer:1,dup:27}],34:[function(e,t,r){var n;n=e("../color/sort.coffee"),t.exports=function(e,t,r,a,o,i,s){var l,u,c;for(a||(a="asc"),o instanceof Array||(o=[o]),r instanceof Array||(r=[r]),i&&void 0!==s&&"number"!=typeof s&&(s=i.id.nesting.indexOf(s)),c=0,l=0;l<r.length&&(u=r[l],e=i&&e.d3plus&&e.d3plus.sortKeys?e.d3plus.sortKeys[u]:e[u],t=i&&t.d3plus&&t.d3plus.sortKeys?t.d3plus.sortKeys[u]:t[u],c=i&&o.indexOf(u)>=0?n(e,t):t>e?-1:1,0===c&&l!==r.length-1);)l++;return"asc"===a?c:-c}},{"../color/sort.coffee":50}],35:[function(e,t,r){t.exports=function(e,t){var r;return e instanceof Array?(r=void 0===t||null===t?t:t.constructor,e.indexOf(t)>=0||e.indexOf(r)>=0):!1}},{}],36:[function(e,t,r){var n,a;n=e("./comparator.coffee"),a=e("../core/fetch/sort.coffee"),t.exports=function(e,t,r,o,i,s){var l,u,c,f;if(!e||e.length<=1)return e||[];if(i)for(t||(t=i.order.value||i.size.value||i.id.value),r||(r=i.order.sort.value),o||(o=i.color.value||[]),c=0,f=e.length;f>c;c++)l=e[c],l.d3plus||(l.d3plus={}),u="d3plus"in l&&"d3plus"in l.d3plus?l.d3plus:l,l.d3plus.sortKeys=a(i,u,t,o,s);return e.sort(function(e,a){return n(e,a,t,r,o,i,s)})}},{"../core/fetch/sort.coffee":66,"./comparator.coffee":34}],37:[function(e,t,r){t.exports=function(e,t){return void 0===t?e:t===!1?[]:t instanceof Array?t:(e instanceof Array||(e=[]),e.indexOf(t)>=0?e.splice(e.indexOf(t),1):e.push(t),e)}},{}],38:[function(e,t,r){var n;n=function(e){var t,r,a,o;if(o=n.tested,e in o)return o[e];for(r=0,a=!1;r<document.styleSheets.length;){if(t=document.styleSheets[r],t.href&&t.href.indexOf(e)>=0){a=!0;break}r++}return a},n.tested={},t.exports=n},{}],39:[function(e,t,r){t.exports=!1},{}],40:[function(e,t,r){var n,a;n=e("./ie.js"),a=e("./touch.coffee"),t.exports=a?{click:"click",down:"touchstart",up:"touchend",over:"touchstart",out:"touchend",move:"touchmove"}:{click:"click",down:"mousedown",up:"mouseup",over:n?"mouseenter":"mouseover",out:n?"mouseleave":"mouseout",move:"mousemove"}},{"./ie.js":39,"./touch.coffee":44}],41:[function(e,t,r){var n;n=function(){var e;return e="-webkit-transform"in document.body.style?"-webkit-":"-moz-transform"in document.body.style?"-moz-":"-ms-transform"in document.body.style?"-ms-":"-o-transform"in document.body.style?"-o-":"",n=function(){return e},e},t.exports=n},{}],42:[function(e,t,r){t.exports="rtl"===d3.select("html").attr("dir")},{}],43:[function(e,t,r){var n;n=function(){var e,t,r,a,o;return e=document.createElement("p"),e.style.width="100%",e.style.height="200px",t=document.createElement("div"),t.style.position="absolute",t.style.top="0px",t.style.left="0px",t.style.visibility="hidden",t.style.width="200px",t.style.height="150px",t.style.overflow="hidden",t.appendChild(e),document.body.appendChild(t),a=e.offsetWidth,t.style.overflow="scroll",o=e.offsetWidth,a===o&&(o=t.clientWidth),document.body.removeChild(t),r=a-o,n=function(){return r},r},t.exports=n},{}],44:[function(e,t,r){t.exports="ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch?!0:!1},{}],45:[function(e,t,r){t.exports=function(e){var t;return t=d3.hsl(e),t.l>.45&&(t.s>.8&&(t.s=.8),t.l=.45),t.toString()}},{}],46:[function(e,t,r){t.exports=function(e,t){var r;return void 0===t&&(t=.5),r=d3.hsl(e),t=(1-r.l)*t,r.l+=t,r.s-=t,r.toString()}},{}],47:[function(e,t,r){t.exports=function(e,t,r,n){var a,o,i;return r||(r=1),n||(n=1),e=d3.rgb(e),t=d3.rgb(t),i=(r*e.r+n*t.r-r*n*t.r)/(r+n-r*n),o=(r*e.g+n*t.g-r*n*t.g)/(r+n-r*n),a=(r*e.b+n*t.b-r*n*t.b)/(r+n-r*n),d3.rgb(i,o,a).toString()}},{}],48:[function(e,t,r){var n;n=e("./scale.coffee"),t.exports=function(e,t){var r;return r=e||Math.floor(20*Math.random()),(t=t||n)(r)}},{"./scale.coffee":49}],49:[function(e,t,r){t.exports=d3.scale.ordinal().range(["#b22200","#EACE3F","#282F6B","#B35C1E","#224F20","#5F487C","#759143","#419391","#993F88","#e89c89","#ffee8d","#afd5e8","#f7ba77","#a5c697","#c5b5e5","#d1d392","#bbefd0","#e099cf"])},{}],50:[function(e,t,r){t.exports=function(e,t){var r,n;return r=d3.hsl(e),n=d3.hsl(t),e=0===r.s?361:r.h,t=0===n.s?361:n.h,e===t?r.l-n.l:e-t}},{}],51:[function(e,t,r){t.exports=function(e){var t,r,n,a,o;return a=d3.rgb(e),n=a.r,r=a.g,t=a.b,o=(299*n+587*r+114*t)/1e3,o>=128?"#444444":"#f7f7f7"}},{}],52:[function(e,t,r){t.exports=function(e){var t,r,n;return e+="",e=e.replace(RegExp(" ","g"),""),0===e.indexOf("rgb")&&(e=e.split("(")[1].split(")")[0].split(",").slice(0,3).join(",")),0===e.indexOf("hsl")&&(e=e.split(",")[2].split(")")[0]),r=d3.rgb(e).toString(),t=["black","#000","#000000","0%","0,0,0"],n=t.indexOf(e)>=0,"#000000"!==r||n}},{}],53:[function(e,t,r){var n,a,o,i;a=e("../../client/ie.js"),i=e("./wiki.coffee"),n="http://d3plus.org/assets/img/favicon.ico",o=function(e,t,r){r=r||"",a||"undefined"!=typeof InstallTrigger?console.log("[ D3plus ] "+t):0===e.indexOf("group")?window.chrome&&navigator.onLine?console[e]("%c%c "+t,"padding: 3px 10px;line-height: 25px;background-size: 20px;background-position: top left;background-image: url('"+n+"');","font-weight:200;"+r):console[e]("%cD3plus%c "+t,"line-height: 25px;font-weight: 800;color: #b35c1e;margin-left: 0px;","font-weight:200;"+r):console[e]("%c"+t,r+"font-weight:200;")},o.comment=function(e){this("log",e,"color:#aaa;")},o.error=function(e,t){this("groupCollapsed","ERROR: "+e,"font-weight:800;color:#D74B03;"),this.stack(),this.wiki(t),this.groupEnd()},o.group=function(e){this("group",e,"color:#888;")},o.groupCollapsed=function(e){this("groupCollapsed",e,"color:#888;")},o.groupEnd=function(){a||console.groupEnd()},o.log=function(e){this("log",e,"color:#444444;")},o.stack=function(){var e,t,r,n,o,i,s;a||(e=new Error,e.stack&&(i=e.stack.split("\n"),i=i.filter(function(e){return 0!==e.indexOf("Error")&&e.indexOf("d3plus.js:")<0&&e.indexOf("d3plus.min.js:")<0}),i.length&&i[0].length&&(o=window.chrome?"at ":"@",s=i[0].split(o)[1],i=s.split(":"),3===i.length&&i.pop(),t=i.pop(),n=i.join(":").split("/"),n=n[n.length-1],r="line "+t+" of "+n+": "+s,this("log",r,"color:#D74B03;"))))},o.time=function(e){a||console.time(e)},o.timeEnd=function(e){a||console.timeEnd(e)},o.warning=function(e,t){this("groupCollapsed",e,"color:#888;"),this.stack(),this.wiki(t),this.groupEnd()},o.wiki=function(e){e&&(e in i&&(e=d3plus.repo+"wiki/"+i[e]),this("log","documentation: "+e,"color:#aaa;"))},t.exports=o},{"../../client/ie.js":39,"./wiki.coffee":54}],54:[function(e,t,r){t.exports={active:"Segmenting-Data#active",aggs:"Custom-Aggregations",alt:"Alt-Text-Parameters",attrs:"Attribute-Data#axes",axes:"Axis-Parameters",background:"Background",color:"Color-Parameters",container:"Container-Element",coords:"Geography-Data",csv:"CSV-Export",data:"Data-Points",depth:"Visible-Depth",descs:"Value-Definitions",dev:"Verbose-Mode",draw:"Draw",edges:"Edges-List",error:"Custom-Error-Message",focus:"Focus-Element",font:"Font-Styles",footer:"Custom-Footer",format:"Value-Formatting",height:"Height",history:"User-History",hover:"Hover-Element",icon:"Icon-Parameters",id:"Unique-ID",keywords:"Keyword-Parameters",labels:"Data-Labels",legend:"Legend",links:"Link-Styles",margin:"Outer-Margins",messages:"Status-Messages",method:"Methods",nodes:"Node-Positions",open:"Open",order:"Data-Ordering",remove:"Remove",search:"Search-Box",select:"Selecting-Elements#select",selectAll:"Selecting-Elements#selectall",shape:"Data-Shapes",size:"Size-Parameters",temp:"Segmenting-Data#temp",text:"Text-Parameters",time:"Time-Parameters",timeline:"Timeline",timing:"Animation-Timing",title:"Custom-Titles",tooltip:"Tooltip-Parameters",total:"Segmenting-Data#total",type:"Output-Type",ui:"Custom-Interface",width:"Width",x:"Axis-Parameters",y:"Axis-Parameters",zoom:"Zooming"}},{}],55:[function(e,t,r){var n=e("../../util/buckets.coffee"),a=e("../fetch/value.coffee"),o=e("../console/print.coffee");t.exports=function(e){e.dev.value&&o.time("getting color data range");var t=[];if(e.data.pool.forEach(function(r){var n=parseFloat(a(e,r,e.color.value));"number"==typeof n&&!isNaN(n)&&t.indexOf(n)<0&&t.push(n)}),e.dev.value&&o.timeEnd("getting color data range"),t.length>1){if(e.dev.value&&o.time("calculating color scale"),t=d3.extent(t),t[0]<0&&t[1]>0){var r=e.color.range;3==r.length&&(t.push(t[1]),t[1]=0)}else if(t[1]>0&&t[0]>=0){var r=e.color.heatmap;t=n(t,r.length)}else{var r=e.color.range.slice(0);t[0]<0?r.pop():r.shift()}e.color.valueScale=d3.scale.sqrt().domain(t).range(r).interpolate(d3.interpolateRgb),e.dev.value&&o.timeEnd("calculating color scale")}else e.color.valueScale=null}},{"../../util/buckets.coffee":203,"../console/print.coffee":53,"../fetch/value.coffee":68}],56:[function(e,t,r){var n=e("../fetch/value.coffee"),a=e("../console/print.coffee"),o=e("../../object/validate.coffee");t.exports=function(e,t){e.dev.value&&a.time("filtering data");var r=d3.keys(e.data.keys||{});"attrs"in e&&(r=r.concat(d3.keys(e.attrs.keys||{}))),t=t.filter(function(t){var r=n(e,t,e.id.value);return null!==r});var i=e.types[e.type.value].requirements||[];e.data.filters.forEach(function(a){r.indexOf(e[a].value)>=0&&i.indexOf(a)>=0&&(t=t.filter(function(t){var r=n(e,t,e[a].value);return"size"===a?"number"==typeof r:null!==r}))});var s=e.data.solo.length?"solo":"mute";return e.data[s].forEach(function(r){function i(t){var n=e[r][s].value,a=!1;return n.forEach(function(e){"function"==typeof e?a=e(t):e===t&&(a=!0)}),"solo"===s?a:!a}function l(t){if(e[r].nesting){var a=e[r].nesting;o(a)&&(a=d3.values(a));for(var s=0;s<a.length;s++){var l=t.filter(function(t){return i(n(e,t,a[s]))});l.length&&(t=l)}}return t}t=l(t),"id"===r&&("nodes"in e&&e.nodes.value&&(e.dev.value&&a.time("filtering nodes"),e.nodes.restricted=l(e.nodes.value),e.dev.value&&a.timeEnd("filtering nodes")),"edges"in e&&e.edges.value&&(e.dev.value&&a.time("filtering edges"),e.edges.restricted=e.edges.value.filter(function(t){var r=l([t[e.edges.source],t[e.edges.target]]);return 2===r.length}),e.dev.value&&a.timeEnd("filtering edges")))}),e.dev.value&&a.timeEnd("filtering data"),t}},{"../../object/validate.coffee":171,"../console/print.coffee":53,"../fetch/value.coffee":68}],57:[function(e,t,r){var n=e("./nest.js"),a=e("../fetch/value.coffee"),o=e("../console/print.coffee"),i=e("../../util/uniques.coffee");t.exports=function(e){var t;if(e.data.time={values:[]},e.time&&e.time.value){e.dev.value&&(t="analyzing time periods",o.time(t)),e.data.time.values=i(e.data.value,e.time.value,a,e),e.data.time.values.sort(function(e,t){return e-t});var r=[];e.data.time.values.forEach(function(t,n){if(0!==n){var a=e.data.time.values[n-1];r.push(t-a),n===e.data.time.values.length-1&&(e.data.time.total=t-e.data.time.values[0])}}),r=d3.min(r),e.data.time.step=r;var s=["Milliseconds","Seconds","Minutes","Hours","Date","Month","FullYear"],l=[1e3,60,60,24,30,12,1];e.data.time.periods=s;var u=function(t,r,n){return e.data.time.stepDivider||(arr=l.slice(0,n),e.data.time.stepDivider=arr.length?arr.reduce(function(e,t){return e*t}):1),Math.round(Math.floor(r-t)/e.data.time.stepDivider)},c=e.data.time.total;s.forEach(function(t,n){var a="Date"===t?28:l[n];if(!e.data.time.stepType&&(n===s.length-1||Math.round(r)<a)){e.data.time.stepType=t;var o=e.data.time.values[0],i=e.data.time.values[e.data.time.values.length-1];e.data.time.stepIntervals=u(o,i,n)}!e.data.time.totalType&&(n===s.length-1||Math.round(c)<a)&&(e.data.time.totalType=t),r/=a,c/=a}),e.data.time.values.forEach(function(t,r){if(0!==r){var n=e.data.time.values[0];e.data.time.dataSteps.push(u(n,t,s.indexOf(e.data.time.stepType)))}else e.data.time.dataSteps=[0]});var f=e.time.format.value,d=e.format.locale.value,p=[function(e){return e.getMilliseconds()},function(e){return e.getSeconds()},function(e){return e.getMinutes()},function(e){return e.getHours()},function(e){return 1!=e.getDate()},function(e){return e.getMonth()},function(e){return!0}];e.data.time.functions=p;var h=function(e,t,r){if(e===t)return r&&d.timeFormat[e+"Small"]?d.timeFormat[e+"Small"]:d.timeFormat[e];if(s.indexOf(e)>=4||s.indexOf(t)<=3)return d.timeFormat[t+"-"+e];var n;return n="Date"===t?d.timeFormat[t]:d.timeFormat[t+"-Date"],"Hours"===e?n+" "+d.timeFormat[e]:n+" "+d.timeFormat["Hours-"+e]};if(e.data.time.getFormat=h,f)"string"==typeof f?e.data.time.format=d3.locale(d.format).timeFormat(f):"function"==typeof f?e.data.time.format=f:f instanceof Array&&(e.data.time.format=d3.locale(d.format).timeFormat.multi(m)),e.data.time.multiFormat=e.data.time.format;else{for(var v=e.data.time.stepType,g=e.data.time.totalType,m=[],y=s.indexOf(v);y<=s.indexOf(g);y++){var x=y-1<s.indexOf(v)?s[y]:s[y-1],b=s[y]===x&&v!==g,w=h(x,s[y],b);m.push([w,p[y]])}e.data.time.format=d3.locale(d.format).timeFormat(h(v,g)),e.data.time.multiFormat=m.length>1?d3.locale(d.format).timeFormat.multi(m):e.data.time.format}e.data.time.ticks=[];for(var _=d3.min(e.data.time.values),k=d3.max(e.data.time.values),z=0;z<=e.data.time.stepIntervals;z++){var A=new Date(_);A["set"+e.data.time.stepType](A["get"+e.data.time.stepType]()+z),k>=A&&e.data.time.ticks.push(A)}e.dev.value&&o.timeEnd(t)}if(e.dev.value&&(t="nesting data by time and depths",o.time(t)),e.data.nested={},0===e.data.time.values.length)e.data.nested.all={},e.id.nesting.forEach(function(t,r){var a=e.id.nesting.slice(0,r+1);e.data.nested.all[t]=n(e,e.data.value,a)});else{var j=e.data.value.reduce(function(t,r){var n=a(e,r,e.time.value).getTime();return n in t||(t[n]=[]),t[n].push(r),t},{});e.data.time.values.forEach(function(t){var r=t.getTime();e.data.nested[r]={},e.id.nesting.forEach(function(t,a){var o=e.id.nesting.slice(0,a+1);e.data.nested[r][t]=n(e,j[r],o)})})}e.dev.value&&o.timeEnd(t)}},{"../../util/uniques.coffee":209,"../console/print.coffee":53,"../fetch/value.coffee":68,"./nest.js":61}],58:[function(e,t,r){var n;n=e("../fetch/value.coffee"),t.exports=function(e,t,r){var a,o,i,s,l,u,c,f,d,p;if(o=d3.nest(),e.id.grouping.value)for(void 0===r&&(r=e.id.nesting),i=s=0,u=r.length;u>s;i=++s)f=r[i],i<e.depth.value&&!function(t){return o.key(function(r){return n(e,r.d3plus,t)})}(f);for(d=[],l=0,c=t.length;c>l;l++)a=t[l],p=e.size.value?n(e,a,e.size.value):1,p&&"number"==typeof p&&p>0&&(delete a.d3plus.r,delete a.d3plus.x,delete a.d3plus.y,d.push({d3plus:a,id:a[e.id.value],value:p}));return o.entries(d)}},{"../fetch/value.coffee":68}],59:[function(e,t,r){var n,a,o=[].indexOf||function(e){for(var t=0,r=this.length;r>t;t++)if(t in this&&this[t]===e)return t;return-1};n=e("../console/print.coffee"),a=e("../../object/validate.coffee"),t.exports=function(e,t){var r,i,s,l,u,c,f,d,p;if(f=t+" key analysis",e.dev.value&&n.time(f),e[t].keys={},r=function(n){var i,s,l,u,c,f,d;if(n instanceof Array){for(c=[],s=0,u=n.length;u>s;s++)i=n[s],c.push(r(i));return c}if(a(n)){f=[];for(l in n)d=n[l],f.push(0===l.indexOf("d3plus")||o.call(e[t].keys,l)>=0||null===d?void 0:e[t].keys[l]=typeof d);return f}},a(e[t].value)){l=d3.keys(e[t].value).length===e.id.nesting.length,u=e[t].value;for(i in u)if(d=u[i],l&&e.id.nesting.indexOf(i)>=0&&a(d))for(s in d)p=d[s],r(p);else r(d)}else{c=e[t].value;for(i in c)d=c[i],r(d)}return e.dev.value?n.time(f):void 0}},{"../../object/validate.coffee":171,"../console/print.coffee":53}],60:[function(e,t,r){var n,a;n=e("../console/print.coffee"),a=e("../../object/validate.coffee"),t.exports=function(e,t,r){var o,i,s,l;return o=e.dev.value,o&&n.time("loading "+t),l=e[t].url,e[t].filetype.value?i=e[t].filetype.value:(i=l.slice(l.length-5).split("."),i=i.length>1?i[1]:!1,i?("txt"===i&&(i="text"),e[t].filetype.accepted.indexOf(i)<0&&(i="json")):i="json"),(s="dsv"===i?d3.dsv(e[t].delimiter.value,"text/plain"):d3[i])(l,function(s,u){var c,f;if(!s&&u){if("function"==typeof e[t].callback){if(f=e[t].callback(u))if(a(f)&&t in f)for(c in f)c in e&&(e[c].value=f[c]);else e[t].value=f}else e[t].value=u;["json"].indexOf(i)<0&&e[t].value.forEach(function(e){var t;t=[];for(c in e)t.push(isNaN(e[c])?"false"===e[c].toLowerCase()?e[c]=!1:"true"===e[c].toLowerCase()?e[c]=!0:"null"===e[c].toLowerCase()?e[c]=null:"undefined"===e[c].toLowerCase()?e[c]=void 0:void 0:e[c]=parseFloat(e[c]));return t}),e[t].changed=!0,e[t].loaded=!0}else e.error.internal='Could not load data from: "'+l+'"';return o&&n.timeEnd("loading "+t),r()})}},{"../../object/validate.coffee":171,"../console/print.coffee":53}],61:[function(e,t,r){var n=e("../fetch/value.coffee"),a=e("../../object/validate.coffee"),o=e("../../util/uniques.coffee"),i=function(e,t,r){
var a=d3.nest(),i=[],c="temp"in e?["active","temp","total"]:[];r.length?r.forEach(function(t,r){a.key(function(r){return n(e,r,t)})}):a.key(function(e){return!0}),!e.axes||!e.axes.discrete||e.time&&e[e.axes.discrete].value===e.time.value||a.key(function(t){return n(e,t,e[e.axes.discrete].value)});{var f=r.length&&e.id.nesting.indexOf(r[r.length-1])>=0,d=r.length&&f?r.length-1:0;f?e.id.nesting[d]:e.depth.value}a.rollup(function(t){if(1===t.length&&"d3plus"in t[0])return i.push(t[0]),t[0];t=t.reduce(function(e,t){return t.values instanceof Array?e.concat(t.values):(e.push(t),e)},[]);var a={d3plus:{data:{},depth:d}},u=d3.sum(t,function(e){return"d3plus"in e&&e.d3plus.merged?1:0});if(u===t.length)for(var f=0;f<t.length;f++){var p=t[f];a.d3plus.merged||(a.d3plus.merged=[]),a.d3plus.merged=a.d3plus.merged.concat(p.d3plus.merged),p.d3plus.text&&(a.d3plus.text=p.d3plus.text)}for(var h=0;h<c.length;h++){var v=c[h],g=e.aggs&&e.aggs.value[m]?e.aggs.value[m]:"sum";a.d3plus[v]="d3plus"in t[0]&&v in t[0].d3plus?d3.sum(t,function(e){return e.d3plus[v]}):"function"==typeof g?g(t):d3[g](t,function(t){var r="total"===v?1:0;return e[v].value&&(r=n(e,t,e[v].value),"number"!=typeof r&&(r=r?1:0)),r})}for(var m in e.data.keys){if(m in a.d3plus.data)a[m]=a.d3plus[m];else{var y=e.aggs&&e.aggs.value[m]?e.aggs.value[m]:"sum",x=typeof y,b=e.data.keys[m],w=e.id.nesting.indexOf(m)>=0,_="time"in e&&m===e.time.value;if(m in a.d3plus.data&&(a[m]=a.d3plus[m]),"function"===x)a[m]=e.aggs.value[m](t);else if(_)a[m]=l(o(t,m));else if("number"!==b||"string"!==x||w){var k=s(t,m),z=1===k.length?k[0][m]:o(k,m);if(1===k.length)a[m]=z;else if(z&&z.length)z instanceof Array||(z=[z]),a[m]=w&&e.id.nesting.indexOf(m)>d?k:z;else if(w){var A=e.id.nesting.indexOf(m)-1;A>=d&&(!("endPoint"in a.d3plus)||a.d3plus.endPoint>d)&&(a.d3plus.endPoint=d)}}else{var j=t.map(function(e){return e[m]});j=j.filter(function(e){return typeof e===b}),j.length&&(a[m]=d3[y](j))}}m in a&&a[m]instanceof Array&&1===a[m].length&&(a[m]=a[m][0])}for(var M=0;M<r.length;M++){var E=r[M];E in a||(a[E]=n(e,t[0],E))}return i.push(a),a});var p=function(t,n,a){if(t.children){"number"==e.data.keys[r[n]]&&(t.key=parseFloat(t.key)),a[r[n]]=t.key,delete t.key;for(var o in a)t[o]=a[o];n++,t.children.forEach(function(e){p(e,n,a)})}};return a=a.entries(t).map(u).map(function(e){return p(e,0,{}),e}),i},s=function(e,t){function r(e){e instanceof Array?e.forEach(r):a(e)&&t in e&&(e[t]instanceof Array?e[t].forEach(r):n.push(e))}var n=[];return r(e),n},l=function(e){function t(e){for(var n=0;n<e.length;n++){var a=e[n];a&&(a.constructor===Array?t(a):r.push(a))}}var r=[];return t(e),o(r)},u=function(e){return e.values&&e.values.length?(e.children=e.values.map(function(e){return u(e)}),delete e.values,e):e.values?e.values:e};t.exports=i},{"../../object/validate.coffee":171,"../../util/uniques.coffee":209,"../fetch/value.coffee":68}],62:[function(e,t,r){var n=e("../../array/sort.coffee"),a=e("./nest.js"),o=e("../fetch/value.coffee"),i=(e("../fetch/color.coffee"),e("../fetch/text.js"));t.exports=function(e,t,r){var s;if(s=e.size.threshold.value===!1?0:"number"==typeof e.size.threshold.value?e.size.threshold.value:"function"==typeof e.size.threshold.value?e.size.threshold.value(e):"number"==typeof e.types[e.type.value].threshold?e.types[e.type.value].threshold:"function"==typeof e.types[e.type.value].threshold?e.types[e.type.value].threshold(e):.02,"number"==typeof s&&s>0){var l=[],u=0===e.depth.value?0:{},c=[],f=[],d=[],p={},h=d3.nest();r&&h.key(function(t){return o(e,t,r)}),h.rollup(function(t){var n=t.length;e.aggs.value[e.size.value]?"function"==typeof e.aggs.value[e.size.value]?n=e.aggs.value[e.size.value](t):"string"==typeof e.aggs.value[e.size.value]&&(n=d3[e.aggs.value[e.size.value]](t,function(t){return o(e,t,e.size.value)})):n=d3.sum(t,function(t){return o(e,t,e.size.value)});var a=r?o(e,t[0],r):"all";return p[a]=n,n}).entries(t),t.forEach(function(t){var n=o(e,t,e.id.value),a=o(e,t,e.size.value),i=r?o(e,t,r):"all",u=a/p[i]>=s;if(u&&l.indexOf(n)<0&&(l.push(n),e.depth.value)){var c=o(e,t,e.id.nesting[e.depth.value-1]);f.indexOf(c)<0&&f.push(c)}});var v=t.filter(function(t){var r=o(e,t,e.id.value),n=l.indexOf(r)>=0,a=e.depth.value?o(e,t,e.id.nesting[e.depth.value-1]):null;if(null!==a&&f.indexOf(a)<0&&d.indexOf(a)<0&&d.push(a),!n){var i=o(e,t,e.size.value);i>0&&(0===e.depth.value?i>u&&(u=i):(a in u||(u[a]=0),i>u[a]&&(u[a]=i)),c.push(t))}return n});if(c.length>1){c=n(c,e.size.value,"desc",[],e);var g=e.id.nesting.slice(0,e.depth.value);e.types[e.type.value].requirements.indexOf(e.axes.discrete)>=0&&g.push(e[e.axes.discrete].value);var m=a(e,c,g);m.forEach(function(t){var r=e.id.nesting[e.depth.value-1],n=o(e,t,r);if(children=r?c.filter(function(t){return o(e,t,r)===n}):c,children.length>1){e.id.nesting.forEach(function(r,n){if(e.depth.value==n){var a=t[r];t[r]="string"==typeof a?"d3plus_other_"+a:"d3plus_other"}else n>e.depth.value&&delete t[r]}),e.color.value&&"string"===e.color.type&&(t[e.color.value]=0===e.depth.value?e.color.missing:o(e,n,e.color.value,r)),e.icon.value&&(t[e.icon.value]=o(e,n,e.icon.value,r)),n&&(t.d3plus.depth=e.depth.value);var a;0===e.depth.value?(a=e.format.value(e.format.locale.value.ui.values,{key:"threshold",vars:e}),a+=" < "+e.format.value(u,{key:e.size.value,vars:e})):(a=i(e,t,e.depth.value-1),a=a.length?a[0].split(" < ")[0]:e.format.value(e.format.locale.value.ui.values,{key:"threshold",vars:e}),d.indexOf(n)<0&&(a+=" < "+e.format.value(u[n],{key:e.size.value,vars:e}))),d.indexOf(n)<0&&(a+=" ("+e.format.value(100*s,{key:"share",vars:e})+")"),t.d3plus.threshold=u,t.d3plus.merged=children,e.text.value&&(t[e.text.value]=a),t.d3plus.text=a}})}else m=c;return v.concat(m)}return t}},{"../../array/sort.coffee":36,"../fetch/color.coffee":64,"../fetch/text.js":67,"../fetch/value.coffee":68,"./nest.js":61}],63:[function(e,t,r){var n;n=e("../../font/sizes.coffee"),t.exports=function(e,t){var r,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b;if(b=t.values||e.data.time.ticks,g=t.style||{},s=t.limit||e.width.value,m={},c=e.data.time.periods,v=e.data.time.stepType,y=e.data.time.totalType,o=e.data.time.functions,i=e.data.time.getFormat,l=e.format.locale.value.format,e.time.format.value)m.format=e.data.time.format,m.values=b,m.sizes=n(b.map(function(e){return m.format(e)}),g);else for(u=c.indexOf(v);u<=c.indexOf(y);){if(x=b.filter(function(e){var t,r;if(u===c.indexOf(v))return!0;if(t=!0,r=u-1,0>u)return!0;for(;r>=c.indexOf(v)&&t;)t=!o[r](e),r--;return t}),c[u]===y)a=d3.locale(l).timeFormat(i(c[u],y));else{for(f=u,a=[];f<=c.indexOf(y);)d=f-1<c.indexOf(v)?f:f-1,d=c[d],h=c[f]===d&&v!==y,r=i(d,c[f],h),a.push([r,o[f]]),f++;a=d3.locale(l).timeFormat.multi(a)}if(p=n(x.map(function(e){return a(e)}),g),d3.sum(p,function(e){return e.width})<s||u===c.indexOf(y)){m.format=a,m.values=x,m.sizes=p;break}u++}return m}},{"../../font/sizes.coffee":101}],64:[function(e,t,r){var n,a,o,i,s,l,u;n=e("./value.coffee"),i=e("../../color/random.coffee"),l=e("../../color/validate.coffee"),u=e("../../object/validate.coffee"),s=e("../../util/uniques.coffee"),t.exports=function(e,t,r){var i,l,c,f,d,p;if(d=u(t),d&&"d3plus"in t&&"color"in t.d3plus)return t.d3plus.color;if(void 0===r&&(r=e.id.value),"number"==typeof r&&(r=e.id.nesting[r]),e.color.value){for(c=[],f=e.id.nesting.indexOf(r);f>=0;){if(l=e.id.nesting[f],p=s(t,e.color.value,n,e,l),1===p.length&&(p=p[0]),!(p instanceof Array)&&void 0!==p&&null!==p){i=a(e,t,p,r),c.indexOf(i)<0&&c.push(i);break}f--}return 1===c.length?c[0]:e.color.missing}return o(e,t,r)},a=function(e,t,r,n){return r?e.color.valueScale?e.color.valueScale(r):l(r)?r:o(e,r,n):e.color.value&&"function"==typeof e.color.valueScale?e.color.valueScale(0):o(e,t,n)},o=function(e,t,r){return u(t)&&(t=n(e,t,r)),t instanceof Array&&(t=t[0]),i(t,e.color.scale.value)}},{"../../color/random.coffee":48,"../../color/validate.coffee":52,"../../object/validate.coffee":171,"../../util/uniques.coffee":209,"./value.coffee":68}],65:[function(e,t,r){var n=e("../data/filter.js"),a=e("../data/nest.js"),o=e("../console/print.coffee"),i=e("../../string/format.js"),s=e("../../string/list.coffee");t.exports=function(e,t,r){if(!e.data.value)return[];void 0===r&&(r=e.depth.value);var l=e.id.nesting[r];if(!t||t instanceof Array||(t=[t]),!t&&"time"in e){t=[];var u=e.time.solo.value.length?"solo":"mute",c=e.time[u].value;if(c.length){t=[];for(var f=0;f<c.length;f++){var d=c[f];if("function"==typeof d)for(var p=0;p<e.data.time.values.length;p++){var h=e.data.time.values[p].getTime();d(h)&&t.push(h)}else if(d.constructor===Date)t.push(new Date(d).getTime());else{d+="",4===d.length&&parseInt(d)+""===d&&(d+="/01/01");var v=new Date(d);"Invalid Date"!==v&&t.push(v.getTime())}}"mute"===u&&(t=e.data.time.values.filter(function(e){return t.indexOf(e.getTime())<0}))}else t.push("all")}else t=["all"];if(t.indexOf("all")>=0&&e.data.time.values.length){t=e.data.time.values.slice(0);for(var g=0;g<t.length;g++)t[g]=t[g].getTime()}var m=[e.type.value,l,r].concat(e.data.filters).concat(t),y=e.data.solo.length?"solo":"mute",x=d3.keys(e.data.cache),b=e.types[e.type.value].filter||void 0;if(e.data[y].length)for(var w=0;w<e.data[y].length;w++){var _=e.data[y][w],k=e[_][y].value.slice(0);k.unshift(_),m=m.concat(k)}e.axes&&e.axes.discrete&&m.push(e.axes.discrete),m=m.join("_"),e.data.cacheID=m;for(var z=0;z<x.length;z++){var A=x[z].split("_").slice(1).join("_");if(A===m){m=(new Date).getTime()+"_"+m,e.data.cache[m]=e.data.cache[x[z]],delete e.data.cache[x[z]];break}}var j;if(e.data.cache[m])return e.dev.value&&o.comment("data already cached"),j=e.data.cache[m],"function"==typeof b&&(j=b(e,j)),j;var M=[];if(j=[],e.data.value&&e.data.value.length)for(var E=0;E<t.length;E++){var O=t[E];e.data.nested[O]?j=j.concat(e.data.nested[O][l]):M.push(O)}if(0===j.length&&M.length&&!e.error.internal){M.length>1&&(M=d3.extent(M)),M=M.map(function(t){return e.data.time.format(new Date(t))}),M=M.join(" - ");var S=e.format.locale.value.error.dataYear,F=e.format.locale.value.ui.and;M=s(M,F),e.error.internal=i(S,M),e.time.missing=!0}else{if(e.time&&(e.time.missing=!1),t.length>1){var T=!1;if(["x","y"].forEach(function(t){e[t].value===e.time.value&&"discrete"===e[t].scale.value&&(T=!0)}),!T){var B=e.id.nesting.slice(0,r+1);j=a(e,j,B)}}j=j?n(e,j):[],20===x.length&&(x.sort(),delete e.data.cache[x[0]]),m=(new Date).getTime()+"_"+m,e.data.cache[m]=j,"function"==typeof b&&(j=b(e,j)),e.dev.value&&o.comment("storing data in cache")}return j}},{"../../string/format.js":172,"../../string/list.coffee":173,"../console/print.coffee":53,"../data/filter.js":56,"../data/nest.js":61}],66:[function(e,t,r){var n,a,o;o=e("./value.coffee"),n=e("./color.coffee"),a=e("./text.js"),t.exports=function(e,t,r,i,s){var l,u,c,f,d;for(r instanceof Array||(r=[r]),i instanceof Array||(i=[i]),e&&void 0!==s&&"number"!=typeof s&&(s=e.id.nesting.indexOf(s)),f={},l=0,c=r.length;c>l;l++)u=r[l],d=e?i.indexOf(u)>=0?n(e,t,s):u===e.text.value?a(e,t,s):o(e,t,u,s):t[u],d instanceof Array&&(d=d[0]),d="string"==typeof d?d.toLowerCase():d,f[u]=d;return f}},{"./color.coffee":64,"./text.js":67,"./value.coffee":68}],67:[function(e,t,r){var n=e("./value.coffee"),a=e("../../object/validate.coffee"),o=e("../../util/uniques.coffee");t.exports=function(e,t,r){"number"!=typeof r&&(r=e.depth.value);var i,s=e.id.nesting[r];e.text.nesting&&a(e.text.nesting)?i=e.text.nesting[s]?e.text.nesting[s]:e.text.value:(i=[],e.text.value&&r===e.depth.value&&i.push(e.text.value),i.push(s)),i instanceof Array||(i=[i]);var l=[];if(a(t)&&"d3plus"in t&&t.d3plus.text)l.push(t.d3plus.text.toString()),l.push(e.format.value(t.d3plus.text.toString(),{vars:e,data:t}));else{var u=a(t)?t:void 0;u&&t[e.id.value]instanceof Array?t=t[e.id.value]:t instanceof Array||(t=[t]),i.forEach(function(r){var a=o(t,r,n,e,s);a.length&&(a.length>1&&(a=a.filter(function(e){return e instanceof Array||"string"==typeof e&&e.indexOf(" < ")<0})),a=a.map(function(t){return t instanceof Array?(t=t.filter(function(e){return e}),t.map(function(t){return e.format.value(t.toString(),{vars:e,data:u,key:r})})):t?e.format.value(t.toString(),{vars:e,data:u,key:r}):void 0}),1===a.length&&(a=a[0]),l.push(a))})}return l}},{"../../object/validate.coffee":171,"../../util/uniques.coffee":209,"./value.coffee":68}],68:[function(e,t,r){var n,a,o,i,s,l,u,c,f,d;f=e("../../object/validate.coffee"),c=e("../../util/uniques.coffee"),u=function(e,t,r,i){var s,l,u,d;if(l=f(t),"function"==typeof r&&l)return r(t,e);if(l){if(r in t)return t[r];if(s=e.data.cacheID+"_"+i,n(t,s,e),r in t.d3plus.data[s])return t.d3plus.data[s][r];if(i in t)t=t[i];else{if(!(e.id.value in t))return null;if(t=t[e.id.value],i!==r&&(u=o(e,t,i,e.id.value)),null===u&&(u=a(e,t,i,e.id.value)),null===u)return null;t=u}}return t instanceof Array&&!f(t[0])&&(t=c(t)),t instanceof Array&&f(t[0])&&(d=c(t,r),d.length)?d:(d=o(e,t,r,i))?d:d=a(e,t,r,i)},o=function(e,t,r,n){var a;return e.data.viz instanceof Array&&r in e.data.keys&&(a=c(l(e.data.viz,t,n),r)),a&&a.length?a:null},a=function(e,t,r,n){var a,o,i,s;if("attrs"in e&&e.attrs.value&&r in e.attrs.keys)if(a=f(e.attrs.value)&&n in e.attrs.value?e.attrs.value[n]:e.attrs.value,a instanceof Array){if(i=c(l(a,t,n),r),i.length)return i}else if(t instanceof Array){if(a=[function(){var e,r,n;if(o in a){for(n=[],e=0,r=t.length;r>e;e++)o=t[e],n.push(a[o]);return n}}()],a.length&&(s=c(a,r),s.length))return s}else if(t in a)return a[t][r];return null},l=function(e,t,r){return e.filter(t instanceof Array?function(e){return t.indexOf(e[r])>=0}:function(e){return e[r]===t})},n=function(e,t,r){return"d3plus"in e||(e.d3plus={}),"data"in e.d3plus||(e.d3plus.data={}),(r.data.changed||r.attrs&&r.attrs.changed||!(t in e.d3plus.data))&&(e.d3plus.data[t]={}),e},d=function(e,t,r,n,a){var o,i,s,l,u,c,d;if(null===a)return a;c="time"in e&&e.time.value===n,a instanceof Array||(a=[a]);for(s=l=0,u=a.length;u>l;s=++l)d=a[s],c&&null!==d&&d.constructor!==Date&&(d+="",4===d.length&&parseInt(d)+""===d&&(d+="/01/01"),i=new Date(d),"Invalid Date"!==i&&(a[s]=i));return 1===a.length&&(a=a[0]),null===a||!f(t)||"string"!=typeof n||n in t||(o=e.data.cacheID+"_"+r,t.d3plus.data[o][n]=a),a},s=function(e,t,r,n){var a,o,i,s,l;for(l=[],o=0,i=t.length;i>o;o++)a=t[o],f(a)?(s=u(e,a,r,n),l.push(d(e,a,n,r,s))):l.push(a);return"number"!=typeof l[0]&&(l=c(l)),1===l.length?l[0]:l},i=function(e,t,r,n){var a,o;return r?"number"==typeof r?r:(a=f(t),n||(n=e.id.value),a&&t.values instanceof Array?o=s(e,t.values,r,n):a&&t[r]instanceof Array?o=s(e,t[r],r,n):t instanceof Array?o=s(e,t,r,n):(o=u(e,t,r,n),o=d(e,t,n,r,o)),o):null},t.exports=i},{"../../object/validate.coffee":171,"../../util/uniques.coffee":209}],69:[function(e,t,r){t.exports=function(e){var t,r,n;return["div","svg"].indexOf(e)<0&&(e="div"),r={position:"absolute",left:"-9999px",top:"-9999px",visibility:"hidden",display:"block"},t="div"===e?{}:{position:"absolute"},n=d3.select("body").selectAll(e+".d3plus_tester").data([0]),n.enter().append(e).attr("class","d3plus_tester").style(r).attr(t),n}},{}],70:[function(e,t,r){t.exports={dev:{accepted:"{0} is not an accepted value for {1}, please use one of the following: {2}.",deprecated:"the {0} method has been removed, please update your code to use {1}.",noChange:"{0} was not updated because it did not change.",noContainer:"cannot find a container on the page matching {0}.",of:"of",oldStyle:"style properties for {0} have now been embedded directly into .{1}().",sameEdge:"edges cannot link to themselves. automatically removing self-referencing edge {0}.",set:"{0} has been set.",setLong:"{0} has been set to {1}.",setContainer:"please define a container div using .container()"},error:{accepted:"{0} is not an accepted {1} for {2} visualizations, please use one of the following: {3}.",connections:"no connections available for {0}.",data:"no data available",dataYear:"no data available for {0}.",lib:"{0} visualizations require loading the {1} library.",libs:"{0} visualizations require loading the following libraries: {1}.",method:"{0} visualizations require setting the {1} method.",methods:"{0} visualizations require setting the following methods: {1}."},format:{decimal:".",thousands:",",grouping:[3],currency:["$",""],dateTime:"%A, %B %-d, %Y %X",date:"%-m/%-d/%Y",time:"%I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]},lowercase:["a","an","and","as","at","but","by","for","from","if","in","into","near","nor","of","on","onto","or","per","that","the","to","with","via","vs","vs."],message:{data:"analyzing data",draw:"drawing visualization",initializing:"initializing {0}",loading:"loading data",tooltipReset:"resetting tooltips",ui:"updating ui"},method:{active:"active segments",color:"color",depth:"depth",dev:"verbose",focus:"focus",icon:"icon",id:"id",height:"height",labels:"labels",legend:"legend",margin:"margin",messages:"status messages",mode:"mode",mute:"hide",order:"order",search:"search",shape:"shape",size:"size",solo:"isolate",style:"style",temp:"temporary segments",text:"text",time:"time",timeline:"timeline",total:"total segments",type:"type",width:"width",x:"x axis",y:"y axis",zoom:"zoom"},time:["date","day","month","time","year"],timeFormat:{FullYear:"%Y",Month:"%B",MonthSmall:"%b",Date:"%A %-d",DateSmall:"%-d",Hours:"%I %p",Minutes:"%I:%M",Seconds:"%Ss",Milliseconds:"%Lms","FullYear-Month":"%b %Y","FullYear-Date":"%-m/%-d/%Y","Month-Date":"%b %-d","Hours-Minutes":"%I:%M %p","Hours-Seconds":"%I:%M:%S %p","Hours-Milliseconds":"%H:%M:%S.%L","Minutes-Seconds":"%I:%M:%S %p","Minutes-Milliseconds":"%H:%M:%S.%L","Seconds-Milliseconds":"%H:%M:%S.%L"},ui:{and:"and",back:"back",collapse:"click to collapse",error:"error",expand:"click to expand",including:"including",loading:"loading...",more:"{0} more",moreInfo:"click for more info",or:"or",noResults:"no results matching {0}.",primary:"primary connections",share:"share",total:"total",values:"values"},uppercase:["CEO","CEOs","CFO","CFOs","CNC","COO","COOs","CPU","CPUs","GDP","HVAC","ID","IT","R&D","TV","UI"],visualization:{bar:"Bar Chart",box:"Box Plot",bubbles:"Bubbles",chart:"Chart",geo_map:"Geo Map",line:"Line Plot",network:"Network",paths:"Paths",pie:"Pie Chart",rings:"Rings",scatter:"Scatter Plot",stacked:"Stacked Area",table:"Table",tree_map:"Tree Map"}}},{}],71:[function(e,t,r){t.exports={format:{decimal:",",thousands:".",grouping:[3],currency:[""," ???"],dateTime:"%A, %e de %B de %Y, %X",date:"%d/%m/%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["domingo","lunes","martes","mi??rcoles","jueves","viernes","s??bado"],shortDays:["dom","lun","mar","mi??","jue","vie","s??b"],months:["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],shortMonths:["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]},dev:{accepted:"{0} no es un valor aceptado para {1}, por favor utilice uno de los siguientes: {2}.",deprecated:"el m??todo {0} ha sido eliminado, por favor, actualiza tu c??digo para utilizar {1}.",noChange:"{0} no se actualiza porque no cambi??.",noContainer:"no se puede encontrar un contenedor en la p??gina correspondiente a {0}.",of:"de",oldStyle:"propiedades de estilo para {0} ahora se han incorporado directamente en. {1} ().",sameEdge:"los v??nculos no se pueden enlazar con si mismos. eliminando autom??ticamente el v??nculo {0} que se autorreferencia.",set:"{0} se ha establecido.",setLong:"{0} ha sido establecido a {1}.",setContainer:"defina un div contenedor utilizando .container ()"},error:{accepted:"{0} no es un {1} aceptado para visualizaciones de {2}, por favor utilice uno de los siguientes: {3}.",connections:"no hay conexiones disponibles para {0}.",data:"No hay datos disponibles",dataYear:"no hay datos disponibles para {0}.",lib:"{0} visualizaciones requieren cargar las siguientes librer??as: {1}.",libs:"{0} visualizaciones requieren cargar las siguientes librer??as: {1}.",method:"{0} visualizaciones requieren establecer el ??????m??todo {1}.",methods:"{0} visualizaciones requieren establecer los siguientes m??todos: {1}."},lowercase:["una","y","en","pero","en","de","o","el","la","los","las","para","a","con"],method:{active:"segmentos activos",color:"color",depth:"profundidad",dev:"detallado",focus:"foco",icon:"??cono",id:"id",height:"alto",labels:"r??tulo",legend:"leyenda",margin:"margen",messages:"mensajes de estado",mute:"ocultar",order:"orden",search:"b??squeda",shape:"forma",size:"tama??o",solo:"aislar",style:"estilo",temp:"segmentos temporales",text:"texto",time:"tiempo",timeline:"l??nea de tiempo",total:"segmentos totales",type:"tipo",width:"anchura",x:"eje x",y:"eje Y",zoom:"#ERROR!",mode:"modo"},time:["fecha","d??a","mes","hora","a??o"],visualization:{bubbles:"Burbujas",chart:"Tabla",geo_map:"Mapa Geo",line:"L??nea Solar",network:"Red",rings:"Anillos",scatter:"Gr??fico De Dispersi??n",stacked:"??rea Apilada",tree_map:"Mapa de ??rbol",bar:"Gr??fico De Barras",box:"Diagrama de Cajas",paths:"Caminos",pie:"Gr??fico de Pastel",table:"Tabla"},ui:{and:"y",back:"atr??s",collapse:"click para cerrar",error:"error",expand:"haga clic para ampliar",loading:"Cargando ...",more:"{0} m??s",moreInfo:"clic para m??s informaci??n",noResults:"no se encontraron resultados para {0}.",primary:"relaciones principales",share:"porcentaje",total:"total",values:"valores",including:"Incluyendo",or:"o"},message:{data:"analizando los datos",draw:"visualizando",initializing:"inicializando {0}",loading:"cargando datos",tooltipReset:"restableciendo las descripciones emergentes",ui:"actualizando la interfaz de usuario"},uppercase:["CEO","CEOs","CFO","CFOs","CNC","COO","COOs","CPU","CPUs","PIB","HVAC","ID","TI","I&D","TV","UI"]}},{}],72:[function(e,t,r){t.exports={format:{decimal:",",thousands:".",grouping:[3],currency:[""," ???"],dateTime:"%A, le %e %B %Y, %X",date:"%d/%m/%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],shortDays:["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],months:["janvier","f??vrier","mars","avril","mai","juin","juillet","ao??t","septembre","octobre","novembre","d??cembre"],shortMonths:["janv.","f??vr.","mars","avr.","mai","juin","juil.","ao??t","sept.","oct.","nov.","d??c."]},dev:{accepted:"{0} n'est pas une option valide pour {1}, les valeurs possibles sont: {2}.",deprecated:"{0} a ??t?? ??limin?? de la version courante, mettez ?? jour votre code source avec {1}.",noChange:"{0} n'a pas ??t?? mis ?? jour car inchang??.",noContainer:"impossible de trouver un contenant correspondant ?? {0}.",of:"de",oldStyle:"les propri??t??s de {0} ont ??t?? imbriqu??es dans .{1}().",sameEdge:"un arc ne peut pas boucler sur lui m??me. L'auto-r??f??rence est automatiquement ??limin??e {0}.",set:"{0} a ??t?? mis ?? jour.",setLong:"{0} a ??t?? mis ?? jour ?? {1}.",setContainer:"merci de choisir un div qui utilise .container()"},error:{accepted:"{0} n'est pas correct {1} pour {2} visualisations, merci d'utilisez une des options suivantes: {3}.",connections:"Pas de connections disponibles pour {0}.",data:"Pas de donn??es disponibles",dataYear:"Pas de donn??es disponibles pour {0}.",lib:"La visualisation de {0} n??cessite le chargement de la librairie {1}.",libs:"La visualisation de {0} n??cessite le chargement des librairies {1}.",method:"La visualisation du {0} exige la d??finition de {1}.",methods:"La visualisation du {0} exige les d??finitions de {1}."},lowercase:["un","une","de","des","et","mais","les","ou","pour","avec","comme","par","vers","si","dans","pr??s","ni","dessus","que","le","la","via","sinon","alors"],method:{active:"segments actifs",color:"couleur",depth:"profondeur",dev:"verbeux",focus:"focus",icon:"??cone",id:"id",height:"hauteur",labels:"labels",legend:"l??gende",margin:"marge",messages:"messages",mute:"cacher",order:"ordre",search:"recherche",shape:"format",size:"taille",solo:"isoler",style:"style",temp:"segments temporaires",text:"texte",time:"temps",timeline:"ligne temporelle",total:"segments totaux",type:"type",width:"largeur",x:"axe x",y:"axe y",zoom:"zoom",mode:"mode"},time:["ann??e","date","jour","heure","mois"],visualization:{bubbles:"Bulles",chart:"Graphique",geo_map:"Carte",line:"Courbes",network:"R??seau",rings:"Anneaux",scatter:"Nuage de points",stacked:"Aires empil??es",tree_map:"Arbre",bar:"Diagramme en barres",box:"Bo??tes ?? Moustaches",paths:"Chemins",pie:"Camembert",table:"Table"},ui:{and:"et",back:"retour",collapse:"clic pour r??duire",error:"erreur",expand:"clic pour agrandir",loading:"chargement ...",more:"plus {0}",moreInfo:"clic pour plus d'information",noResults:"pas de r??sultat correspondant ?? {0}.",primary:"connections primaires",share:"part",total:"total",values:"valeurs",including:"incluant",or:"ou"},message:{data:"analyse des donn??es",draw:"trac?? en cours",initializing:"Initialisation {0}",loading:"chargement",tooltipReset:"r??initialisation des bulles",ui:"rafraichissement de l'interface"},uppercase:["CEO","CEOs","CFO","CFOs","CNC","COO","COOs","CPU","CPUs","PIB","HVAC","ID","IT","TV","UI"]}},{}],73:[function(e,t,r){t.exports={format:{decimal:",",thousands:".",grouping:[3],currency:[""," ??????."],dateTime:"%A, %e %B %Y ??. %X",date:"%d.%m.%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["????????????","????????????????????","??????????????","??????????","????????????????","??????????","????????????"],shortDays:["??????","??????","??????","??????","??????","??????","??????"],months:["??????????????","????????????????","????????","??????????","??????","????????","????????","????????????","??????????????????","????????????????","??????????????","????????????????"],shortMonths:["??????","??????","??????","??????","??????","??????","??????","??????","??????","??????","??????","??????"]},dev:{accepted:"{0} ???? ?? ????????????????a ?????????????????? ???? {1}, ???? ???????????? ?????????????????? ??????a ???? ???????????????? ??????????????????: {2}.",deprecated:"{0} ?????????? ?? ????????????????????, ???? ???????????? ???????????????? ???? ???????????? ?????? ???? ???? ???? ?????????????? {1}.",noChange:"{0} ???? ?? ??????????????????, ?????????????? ???????????? ??????????????.",noContainer:"???? ??????e ???? ???? ?????????? ?????????????????? ???? ???????????????????? ?????? ???? ?????????????? ???? {0}.",of:"????",oldStyle:"???????????????????? ???? ???????????? ???? {0} ???????? ???? ???????????????? ???????????????? ????. {1} ().",sameEdge:"???????????????? ???? ???????? ???? ?????????? ???????? ???????????? ?????? ????????. ???????????????????? ???? ?????????????????????? ???????????????? ?????? ???? ????????-?????????????????????????? {0}.",set:"{0} ?? ????????????????.",setLong:"{0} ?? ???????????????? ???? {1}.",setContainer:"???? ???????????? ?????????????????????? ?????????????????? div ???????????????????? .container()"},error:{accepted:"{0} ???? ?? ???????????????????? ???? {1} {2} ??????????????????????????, ???? ???????????? ?????????????????? ???????? ???? ????????????????: {3}.",connections:"???? ?? ???????????????? ???? ?????????? {0}.",data:"???????? ????????????????",dataYear:"???????? ???????????????? ???????????????? ???? {0}.",lib:"{0} ???????????????????????? ???????????? ?????????????????? ???? ???????????????????????? {1} .",libs:"{0} ???????????????????????? ???????????? ?????????????????? ???????????????? ????????????????????: {1}.",method:"{0} ???????????????????????? ???????? ?????????????????????? ???? {1} ??????????????.",methods:"{0} ???????????????????????? ???????????? ?????????????????????? ???? ???????????????? ????????????: {1}."},lowercase:["a","??","????","????","????","??????","????","????","????"],method:{active:"?????????????? ????????????????",color:"????????",depth:"??????????????????",dev:"??????????????",focus:"??????????",icon:"??????????",id:"id",height:"????????????",labels:"??????????????",legend:"??????????????",margin:"??????????????",messages:"???????????? ???? ????????????????",mute:"??????????",order:"??????",search:"??????????",shape:"??????????",size:"????????????????",solo:"??????????????????",style:"????????",temp:"???????????????????? ????????????????",text:"??????????",time:"??????????",timeline:"??????????????????",total:"???????????? ????????????????",type:"??????",width:"????????????",x:"x ????????????",y:"???????????? y",zoom:"??????",mode:"??????????"},time:["??????????","??????","??????????","??????????","????????????"],visualization:{bubbles:"????????????????",chart:"????????",geo_map:"?????? ????????",line:"?????????????? ????????????",network:"??????????",rings:"??????????????",scatter:"?????????????????? ????????????",stacked:"???????????????? ????????????????",tree_map:"???????? ???? ?????? ???? ????????",bar:"?????? ????????????",box:"???????????? ????????????",paths:"????????????",pie:"???????? ????????????????",table:"????????????"},ui:{and:"??",back:"??????????",collapse:"???????????? ???? ???? ???? ????????????",error:"????????????",expand:"???????????? ???? ???? ???? ??????????????",loading:"???? ?????????????? ...",more:"{0} ????????????",moreInfo:"???????????????? ???? ???????????? ????????????????????",noResults:"???? ???? ???????????????????? ???????????????????? ???? {0}.",primary:"?????????????? ??????????",share:"????????",total:"????????????????",values:"??????????????????",including:"??????????????????????",or:"??????"},message:{data:"?????????????? ???? ????????????????",draw:"???????????? ???? ??????????????????????????",initializing:"?????????????????????????????? {0}",loading:"???????????????? ???? ??????????????????",tooltipReset:"???????????????????? ???? ??????????????????????????",ui:"?????????????????? ???? ?????????????????????? ??????????????????"},uppercase:["CEO","CEOs","CFO","CFOs","CNC","COO","COOs","CPU","CPUs","GDP","HVAC","ID","IT","R&D","TV","UI"]}},{}],74:[function(e,t,r){t.exports={format:{decimal:",",thousands:".",grouping:[3],currency:["R$",""],dateTime:"%A, %e de %B de %Y. %X",date:"%d/%m/%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["Domingo","Segunda","Ter??a","Quarta","Quinta","Sexta","S??bado"],shortDays:["Dom","Seg","Ter","Qua","Qui","Sex","S??b"],months:["Janeiro","Fevereiro","Mar??o","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],shortMonths:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]},dev:{accepted:"{0} n??o ?? um valor v??lido para {1}, por favor use um dos seguintes procedimentos: {2}.",deprecated:"{0} m??todo foi removido, por favor atualize seu c??digo para utilizar {1}.",noChange:"{0} n??o foi atualizado porque ele n??o mudou.",noContainer:"N??o foi poss??vel encontrar um local na p??gina correspondente a {0}.",of:"de",oldStyle:"propriedades de estilo para {0} j?? foi incorporado diretamente no. {1} ().",sameEdge:"bordas n??o podem vincular a si mesmos. removendo automaticamente borda de auto-refer??ncia {0}.",set:"{0} foi definido.",setLong:"{0} foi definida para {1}.",setContainer:"por favor, defina um div utilizando .container()"},error:{accepted:"{0} n??o ?? um {1} reconhecido para visualiza????es {2}, favor usar um dos seguintes procedimentos: {3}.",connections:"N??o h?? conex??es dispon??veis para {0}.",data:"N??o h?? dados dispon??veis",dataYear:"N??o h?? dados dispon??veis para {0}.",lib:"A visualiza????o {0} necessita que seja carregado a biblioteca {1}.",libs:"A visualiza????o {0} necessita que seja carregado as bibliotecas {1}.",method:"A visualiza????o {0} exige a defini????o do m??todo {1}.",methods:"A visualiza????o {0} exige a defini????o dos m??todos {1}."},lowercase:["um","uma","e","como","em","no","na","mas","por","para","pelo","pela","de","do","da","se","perto","nem","ou","que","o","a","com","v"],method:{active:"segmentos activos",color:"cor",depth:"profundidade",dev:"verboso",focus:"foco",icon:"??cone",id:"identificador",height:"altura",labels:"etiquetas",legend:"legenda",margin:"margem",messages:"mensagens de status",mute:"ocultar",order:"ordenar",search:"pesquisar",shape:"forma",size:"tamanho",solo:"isolar",style:"estilo",temp:"segmentos tempor??rios",text:"texto",time:"tempo",timeline:"linha do tempo",total:"segmentos no total",type:"tipo",width:"largura",x:"eixo x",y:"eixo y",zoom:"zoom",mode:"modo"},time:["data","dia","m??s","hora","ano"],visualization:{bubbles:"Bolhas",chart:"Gr??fico",geo_map:"Mapa",line:"Gr??fico de Linha",network:"Rede",rings:"An??is",scatter:"Dispers??o",stacked:"Evolu????o",tree_map:"Tree Map",bar:"Gr??fico de Barras",box:"Box Plot",paths:"Caminhos",pie:"Pie Chart",table:"Tabela"},ui:{and:"e",back:"voltar",collapse:"Clique para fechar",error:"erro",expand:"clique para expandir",loading:"carregando ...",more:"mais {0}",moreInfo:"Clique para mais informa????es",noResults:"nenhum resultado para {0}.",primary:"conex??es prim??rias",share:"participa????o",total:"total",values:"valores",including:"Incluindo",or:"ou"},message:{data:"analisando dados",draw:"desenhando visualiza????o",initializing:"inicializando {0}",loading:"carregando dados",tooltipReset:"redefinindo as dicas",ui:"atualizando interface"},uppercase:["CEO","CEOs","CFO","CFOs","CNC","COO","COOs","CPU","CPUs","PIB","HVAC","ID","TI","P&D","TV","IU"]}},{}],75:[function(e,t,r){t.exports={format:{decimal:",",thousands:".",grouping:[3],currency:["???",""],dateTime:"%A, %e de %B de %Y. %X",date:"%d/%m/%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["Domingo","Segunda","Ter??a","Quarta","Quinta","Sexta","S??bado"],shortDays:["Dom","Seg","Ter","Qua","Qui","Sex","S??b"],months:["Janeiro","Fevereiro","Mar??o","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
shortMonths:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]},dev:{accepted:"{0} n??o ?? um valor v??lido para {1}, por favor escolha uma das seguintes op????es: {2}.",deprecated:"o m??todo {0} foi removido, por favor atualize o seu c??digo para usar {1}.",noChange:"{0} n??o foi atualizado porque n??o houve modifica????es.",noContainer:"N??o foi poss??vel encontrar um elemento na p??gina correspondente a {0}.",of:"de",oldStyle:"as propriedades de {0} j?? foram inclu??das em .{1}().",sameEdge:"bordas n??o podem vincular a si mesmos. removendo automaticamente borda de auto-refer??ncia {0}.",set:"{0} foi definido.",setLong:"{0} foi alterado para {1}.",setContainer:"por favor indique um elemento div atrav??s do m??todo .container()"},error:{accepted:"{0} n??o ?? uma {1} v??lida para a visualiza????o {2}, por favor escolha uma das seguintes: {3}.",connections:"n??o existem liga????es dispon??veis para {0}.",data:"n??o existem dados dispon??veis",dataYear:"n??o existem dados dispon??veis para {0}.",lib:"a visualiza????o {0} necessita que a biblioteca {1} seja carregada.",libs:"a visualiza????o {0} necessita que as seguintes bibliotecas sejam carregadas: {1}.",method:"A visualiza????o {0} exige a defini????o do m??todo {1}.",methods:"A visualiza????o {0} exige a defini????o dos seguintes m??todos {1}."},lowercase:["um","uma","e","como","em","no","na","mas","por","para","pelo","pela","de","do","da","se","perto","nem","ou","que","o","a","com","v"],method:{active:"segmentos activos",color:"cor",depth:"profundidade",dev:"verboso",focus:"foco",icon:"??cone",id:"identificador",height:"altura",labels:"etiquetas",legend:"legenda",margin:"margem",messages:"estado",order:"ordenar",search:"pesquisar",shape:"forma",size:"tamanho",style:"estilo",temp:"segmentos tempor??rios",text:"texto",time:"tempo",timeline:"linha temporal",total:"segmentos no total",type:"tipo",width:"largura",x:"eixo x",y:"eixo y",zoom:"zoom",mode:"#ERROR!",mute:"ocultar",solo:"isolar"},time:["data","dia","m??s","hora","ano"],visualization:{bubbles:"Bolhas",chart:"Diagrama",geo_map:"Mapa",line:"Gr??fico de Linha",network:"Grafo",rings:"An??is",scatter:"Gr??fico de Dispers??o",stacked:"Gr??fico de ??rea",tree_map:"Tree Map",bar:"Gr??fico de Barras",box:"Diagrama de Caixa e Bigodes",paths:"Caminhos",pie:"Gr??fico de Setores",table:"Tabela"},ui:{and:"e",back:"voltar",collapse:"Clique para colapsar",error:"erro",expand:"clique para expandir",loading:"a carregar ...",more:"mais {0}",moreInfo:"Clique para mais informa????es",noResults:"nenhum resultado para {0}.",primary:"liga????es principais",share:"propor????o",total:"total",values:"valores",including:"Incluindo",or:"ou"},message:{data:"a analisar os dados",draw:"a desenhar a visualiza????o",initializing:"a inicializar {0}",loading:"a carregar os dados",tooltipReset:"a actualizar as caixas de informa????o",ui:"a actualizar o interface"},uppercase:["CEO","CEOs","CFO","CFOs","CNC","COO","COOs","CPU","CPUs","PIB","HVAC","ID","TI","I&D","TV","IU"]}},{}],76:[function(e,t,r){t.exports={format:{decimal:",",thousands:"??",grouping:[3],currency:[""," ??????."],dateTime:"%A, %e %B %Y ??. %X",date:"%d.%m.%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["??????????????????????","??????????????????????","??????????????","??????????","??????????????","??????????????","??????????????"],shortDays:["????","????","????","????","????","????","????"],months:["????????????","??????????????","??????????","????????????","??????","????????","????????","??????????????","????????????????","??????????????","????????????","??????????????"],shortMonths:["??????","??????","??????","??????","??????","??????","??????","??????","??????","??????","??????","??????"]},dev:{accepted:"{0} ???? ?????????????????????? ???????????????? {1}, ????????????????????, ?????????????????????? ???????? ???? ??????????????????: {2}.",deprecated:"?????????? {0} ?????? ????????????, ????????????????????, ???????????????? ?????? ??????, ?????????? ???????????????????????? {1}.",noChange:"{0} ???? ????????????????, ?????????????????? ???? ???? ??????????????????.",noContainer:"???? ???????? ?????????? ?????????????????? ???? ???????????????? ???????????????????????? {0}.",of:"????",oldStyle:"???????????????? ?????????? ?????? {0} ?????? ?? ?????????????????? ?????????? ???????? ?????????????? ?????????????????????????????? ??. {1} ().",sameEdge:"???????? ???? ?????????? ?????????????? ????????. ?????????????????????????? ???????????? ?????????????????????????????? ?????????? {0}.",set:"{0} ?????? ????????????????????.",setLong:"{0} ?????????????????????? ???????????????? {1}.",setContainer:"????????????????????, ???????????????????? ?????????????????? DIV ?? ?????????????? .container ()"},error:{accepted:"{0} ???? ?????????????????????? {1} ?????? {2} ????????????????????????, ????????????????????, ?????????????????????? ???????? ???? ??????????????????: {3}.",connections:"?????? ????????????????????, ?????????????????? ?????? {0}.",data:"???????????? ????????????????????",dataYear:"?????? ???????????? {0}.",lib:"{0} ???????????????????????? ?????????????? ???????????????? {1} ????????????????????.",libs:"{0} ???????????????????????? ?????????????? ???????????????? ?????????????????? ??????????????????: {1}.",method:"{0} ???????????????????????? ?????????????? ?????????????????? {1} ????????????.",methods:"{0} ???????????????????????? ?????????????? ?????????????????? ?????????????????? ??????????????: {1}."},lowercase:["??","??????","??","????","??????","????","???????? ??","??","????????????????","????","????","????","??????","??","??????","??","??","?? ??????????????","????????????","????????????"],method:{active:"???????????????? ????????????????",color:"????????",depth:"??????????????",dev:"????????????????????????",focus:"??????????",icon:"????????????",id:"ID",height:"????????????",labels:"??????????????",legend:"??????????????",margin:"????????",messages:"?????????????????? ?? ??????????????????",mute:"????????????????",order:"??????????????",search:"??????????",shape:"??????????",size:"????????????",solo:"??????????????????????",style:"??????????",temp:"?????????????????? ????????????????",text:"??????????",time:"??????????",timeline:"????????????",total:"?????????? ??????????????????",type:"??????",width:"????????????",x:"?????? ??",y:"?????? Y",zoom:"??????????????",mode:"??????????"},time:["????????","????????","??????????","??????????","??????"],visualization:{bubbles:"????????????",chart:"????????????",geo_map:"?????? ??????????",line:"?????????? ??????????",network:"????????",rings:"????????????",scatter:"?????????????? ??????????",stacked:"?? ?????????????????????? ??????????????",tree_map:"???????????? ??????????",bar:"??????????????????????",box:"?????????????? ??????????",paths:"????????",pie:"???????????????? ??????????????????",table:"????????"},ui:{and:"??",back:"??????????",collapse:"????????????????, ?????????? ????????????????",error:"????????????",expand:"????????????????, ?????????? ????????????????????",loading:"???????????????? ...",more:"{0} ??????????",moreInfo:"?????????????? ?????? ?????????????????? ?????????? ?????????????????? ????????????????????",noResults:"?????? ??????????????????????, ?????????????????????????????? {0}.",primary:"?????????????????? ????????????????????",share:"????????",total:"??????????",values:"????????????????",including:"??????????????",or:"??????"},message:{data:"???????????????????? ????????????",draw:"?????????????? ????????????????????????",initializing:"?????????????????????????? {0}",loading:"???????????????? ????????????",tooltipReset:"?????????? ??????????????????",ui:"???????????????????? ?????????????????????????????????? ????????????????????"},uppercase:["ID"]}},{}],77:[function(e,t,r){t.exports={format:{decimal:".",thousands:",",grouping:[3],currency:["??",""],dateTime:"%A %B %e %Y %X",date:"%Y/%-m/%-d",time:"%H:%M:%S",periods:["??????","??????"],days:["?????????","?????????","?????????","?????????","?????????","?????????","?????????"],shortDays:["?????????","?????????","?????????","?????????","?????????","?????????","?????????"],months:["??????","??????","??????","??????","??????","??????","??????","??????","??????","??????","?????????","?????????"],shortMonths:["??????","??????","??????","??????","??????","??????","??????","??????","??????","??????","?????????","?????????"]},dev:{accepted:"{0}??????{1}???????????????, ????????????????????????:{2}",deprecated:"{0}?????????????????????, ??????????????????????????????{1}",noChange:"{0}????????????, ???????????????????????????",noContainer:"????????????????????????????????????{0}",of:"???",oldStyle:"????????????{0}??????????????????????????????{1}?????????",sameEdge:"????????????????????????????????????????????????????????????{0}???",set:"{0}??????????????????",setLong:"{0}????????????{1}???",setContainer:"?????????()???????????????div??????"},error:{accepted:"{0}??????{2}?????????????????????????????????????????????{1}, ???????????????????????????{3}.",connections:"?????????{0}??????????????????",data:"???????????????",dataYear:"???????????????{0}?????????",lib:"{0}????????????????????????{1}??????",libs:"{0}????????????????????????????????????{1}???",method:"{0}????????????????????????{1}?????????",methods:"{0}???????????????????????????????????????{1}???"},lowercase:["??????","???","???","??????","???...???","???","??????","???","???","???...??????"],method:{active:"?????????",color:"??????",depth:"??????",dev:"??????",focus:"??????",icon:"??????",id:"????????????",height:"??????",labels:"??????",legend:"????????????",margin:"?????????",messages:"????????????",mute:"??????",order:"??????",search:"??????",shape:"??????",size:"??????",solo:"??????",style:"??????",temp:"???????????????",text:"??????",time:"??????",timeline:"?????????",total:"??????",type:"??????",width:"??????",x:"X???",y:"Y???",zoom:"??????",mode:"??????"},time:["???","??????","???","??????","???"],visualization:{bubbles:"??????",chart:"??????",geo_map:"????????????",line:"??????",network:"??????",rings:"??????",scatter:"?????????",stacked:"???????????????",tree_map:"??????",bar:"??????",box:"?????????",paths:"??????",pie:"??????",table:"???"},ui:{and:"???",back:"??????",collapse:"????????????",error:"??????",expand:"???????????????",loading:"?????????...",more:"{0}??????",moreInfo:"????????????????????????",noResults:"??????????????????{0}???",primary:"????????????",share:"??????",total:"???",values:"???",including:"??????",or:"???"},message:{data:"????????????",draw:"???????????????",initializing:"?????????{0}",loading:"????????????",tooltipReset:"??????????????????",ui:"??????UI"},uppercase:["CEO","CEOs","CFO","CFOs","CNC","COO","COOs","CPU","CPUs","GDP","HVAC","ID","??????","????????????","??????"]}},{}],78:[function(e,t,r){t.exports={en_US:e("./languages/en_US.coffee"),es_ES:e("./languages/es_ES.js"),fr_FR:e("./languages/fr_FR.js"),mk_MK:e("./languages/mk_MK.js"),pt_BR:e("./languages/pt_BR.js"),pt_PT:e("./languages/pt_PT.js"),ru_RU:e("./languages/ru_RU.js"),zh_CN:e("./languages/zh_CN.js")}},{"./languages/en_US.coffee":70,"./languages/es_ES.js":71,"./languages/fr_FR.js":72,"./languages/mk_MK.js":73,"./languages/pt_BR.js":74,"./languages/pt_PT.js":75,"./languages/ru_RU.js":76,"./languages/zh_CN.js":77}],79:[function(e,t,r){var n,a,o,i,s,l,u,c,f;a=e("../../util/copy.coffee"),s=e("../console/print.coffee"),l=e("./process/detect.coffee"),u=e("./set.coffee"),c=e("../../string/format.js"),f=e("../../object/validate.coffee"),t.exports=function(e,t){var r,n,s;s=[];for(r in t)n=t[r],e[r]=a(n),e[r].initialized=i(e,e[r],r),s.push(e.self[r]=o(e,r));return s},i=function(e,t,r){var n,a,o,u,d;t.previous=!1,t.changed=!1,t.initialized=!1,"init"in t&&!("value"in t)&&(t.value=t.init(e),delete t.init),"process"in t&&(t.value=l(e,t,t.value));for(d in t)if("deprecates"===d)for(a=t[d]instanceof Array?t[d]:[t[d]],o=0,u=a.length;u>o;o++)n=a[o],e.self[n]=function(t,r){return function(n){var a;return a=e.format.locale.value.dev.deprecated,t="."+t+"()",s.error(c(a,t,"."+r+"()"),r),e.self}}(n,r);else"global"===d?r in e||(e[r]=[]):"value"!==d&&f(t[d])&&i(e,t[d],d);return!0},o=function(e,t){return function(r,a){var o,i,l,u,d,p,h,v;if(o="accepted"in e[t]?e[t].accepted:null,"function"==typeof o&&(o=o(e)),o instanceof Array||(o=[o]),r===Object)return e[t];if(!arguments.length&&o.indexOf(void 0)<0)return"value"in e[t]?e[t].value:e[t];if("style"===t&&"object"==typeof r){v=e.format.locale.value.dev.oldStyle;for(p in r)s.warning(c(v,'"'+p+'"',p),p),e.self[p](r[p])}if("font"===t){"string"==typeof r&&(r={family:r}),h=!0,l=function(e,t,r,n){f(e[r])&&t in e[r]&&(f(e[r][t])?e[r][t].value=e[r][t].process?e[r][t].process(n):n:e[r][t]=n)},i=function(e,t,r){var n;if(f(e)){if(h)for(n in e)l(e,t,n,r);else"font"in e&&l(e,t,"font",r);h=!1;for(n in e)i(e[n],t,r)}};for(u in r)d=r[u],"secondary"!==u&&(f(d)&&(d=d.value),d&&i(e,u,d))}return n(e,t,e,t,r),"function"==typeof a&&(e[t].callback=a),e[t].chainable===!1?e[t].value:e.self}},n=function(e,t,r,a,o){var i,s,l,c;if(["accepted","changed","initialized","previous","process"].indexOf(a)<0)if(c=f(o),l=f(r[a])&&"objectAccess"in r[a]&&r[a].objectAccess===!1,i=!(!c||!l&&("value"in o||d3.keys(o)[0]in r[a])),null===o||!c||i)u(e,t,r,a,o);else if(c)for(s in o)n(e,t,r[a],s,o[s])}},{"../../object/validate.coffee":171,"../../string/format.js":172,"../../util/copy.coffee":206,"../console/print.coffee":53,"./process/detect.coffee":87,"./set.coffee":93}],80:[function(e,t,r){t.exports=function(e){return e||(e=!1),{accepted:[!1,Array,Function,Number,Object,String],callback:{accepted:[!1,Function],value:!1},global:e,process:Array,value:[]}}},{}],81:[function(e,t,r){var n;n=e("../../../client/rtl.coffee"),t.exports=function(e){var t;return t=["left","center","right"],e===!1&&t.unshift(!1),t.indexOf(e)<0&&(e="left"),{accepted:t,process:function(e){return n?"left"===e?"right":"right"===e?"left":e:e},value:e}}},{"../../../client/rtl.coffee":42}],82:[function(e,t,r){t.exports=function(e){var t;return t=["line-through","none","overline","underline"],e===!1&&t.unshift(!1),t.indexOf(e)<0&&(e="none"),{accepted:t,value:e}}},{}],83:[function(e,t,r){var n,a;a=e("../../../font/validate.coffee"),n=["Helvetica Neue","HelveticaNeue","Helvetica","Arial","sans-serif"],t.exports=function(e){return void 0===e&&(e=n),{process:a,value:e}}},{"../../../font/validate.coffee":102}],84:[function(e,t,r){t.exports=function(e){var t;return t=["top","middle","bottom"],e===!1&&t.unshift(!1),t.indexOf(e)<0&&(e="bottom"),{accepted:t,mapping:{top:"0ex",middle:"0.5ex",bottom:"1ex"},process:function(e){return this.text=e,this.mapping[e]},value:e}}},{}],85:[function(e,t,r){t.exports=function(e){var t;return t=["capitalize","lowercase","none","uppercase"],e===!1&&t.unshift(!1),t.indexOf(e)<0&&(e="none"),{accepted:t,value:e}}},{}],86:[function(e,t,r){t.exports=function(e,t,r){var n;return t.history&&t.history.reset(),e.constructor===String?e.indexOf("/")>=0?(r.url=e,[]):(n=d3.selectAll(e),n.size()?n:(e.indexOf(".")>=0&&(r.url=e),[])):e}},{}],87:[function(e,t,r){var n,a;n=e("../../../util/copy.coffee"),a=e("../../../array/update.coffee"),t.exports=function(e,t,r){return t.process===Array?a(n(t.value),r):"object"==typeof t.process&&"string"==typeof r?t.process[r]:"function"==typeof t.process?t.process(r,e,t):r}},{"../../../array/update.coffee":37,"../../../util/copy.coffee":206}],88:[function(e,t,r){var n;n=e("../../../client/css.coffee"),t.exports=function(e,t,r){return e===!1||e.indexOf("fa-")<0||0===e.indexOf("fa-")&&n("font-awesome")?e:r.fallback}},{"../../../client/css.coffee":38}],89:[function(e,t,r){t.exports=function(e,t){var r,n,a,o,i,s,l,u,c,f,d,p,h;if("string"==typeof e){for(e=e.split(" "),r=n=0,i=e.length;i>n;r=++n)h=e[r],e[r]=parseFloat(h,10);e=1===e.length?e[0]:2===e.length?{top:e[0],right:e[1],bottom:e[0],left:e[1]}:3===e.length?{top:e[0],right:e[1],bottom:e[2],left:e[1]}:4===e.length?{top:e[0],right:e[1],bottom:e[2],left:e[3]}:0}if(p=["top","right","bottom","left"],"number"==typeof e)for(a=0,s=p.length;s>a;a++)d=p[a],t[d]=e;else for(o=0,l=p.length;l>o;o++)d=p[o],t[d]=e[d];for(t.css="",f=[],r=c=0,u=p.length;u>c;r=++c)d=p[r],r&&(t.css+=" "),f.push(t.css+=t[d]+"px");return f}},{}],90:[function(e,t,r){var n,a,o,i;n=e("../../array/contains.coffee"),a=e("../../string/format.js"),o=e("../../string/list.coffee"),i=e("../console/print.coffee"),t.exports=function(e,t,r,s,l){var u,c,f,d,p,h,v,g;if("function"==typeof t&&(t=t(e)),t instanceof Array||(t=[t]),c=n(t,r),c===!1&&void 0!==r){for(h=[],g=JSON.stringify(r),"string"!=typeof r&&(g='"'+g+'"'),d=0,p=t.length;p>d;d++)u=t[d],h.push("string"==typeof u?'"'+u+'"':"function"==typeof u?u.toString().split("()")[0].substring(9):void 0===u?"undefined":JSON.stringify(u));h=o(h,e.format.locale.value.ui.or),e.type&&["mode","shape"].indexOf(s)>=0?(v=e.format.locale.value.error.accepted,f=e.format.locale.value.visualization[e.type.value]||e.type.value,i.warning(a(v,g,s,f,h),s)):(v=e.format.locale.value.dev.accepted,i.warning(a(v,g,l,h),s))}return!c}},{"../../array/contains.coffee":35,"../../string/format.js":172,"../../string/list.coffee":173,"../console/print.coffee":53}],91:[function(e,t,r){t.exports=function(e){var t;return t=["auto","optimizeSpeed","crispEdges","geometricPrecision"],t.indexOf(e)>=0||(e="crispEdges"),{accepted:t,value:e}}},{}],92:[function(e,t,r){var n,a;a=e("../../object/validate.coffee"),n=function(e,t){var r;e.changed&&(e.changed=!1),"draw"===t&&(e.frozen=!1,e.update=!0,e.first=!1);for(r in e)r.indexOf("d3plus")<0&&a(e[r])&&n(e[r],r)},t.exports=n},{"../../object/validate.coffee":171}],93:[function(e,t,r){var n,a,o,i,s,l,u,c,f;n=e("../../util/copy.coffee"),a=e("../../util/d3selection.coffee"),f=e("../../object/validate.coffee"),o=e("../../object/merge.coffee"),i=e("../console/print.coffee"),s=e("./process/detect.coffee"),l=e("./rejected.coffee"),u=e("../../string/format.js"),c=e("../../array/update.coffee"),t.exports=function(e,t,r,d,p){var h,v,g,m,y,x,b,w,_,k,z,A,j,M;if(A="value"!==d&&d&&d!==t?'"'+d+'" '+e.format.locale.value.dev.of+" ."+t+"()":"."+t+"()",h="value"===d&&"accepted"in r?r.accepted:f(r[d])&&"accepted"in r[d]?r[d].accepted:[p],!l(e,h,p,t,A)){if(f(r[d])&&"value"in r[d]&&(k=d,r=r[d],d="value"),"value"===d&&"process"in r&&(p=s(e,r,p)),r[d]instanceof Array||r[d]!==p||void 0===p){if(r.changed=!0,r.loaded&&(r.loaded=!1),"history"in e&&"draw"!==t&&(v=n(r),v.method=t,e.history.chain.push(v)),r.previous=r[d],"id"in e&&"value"===d&&"nesting"in r)if("id"!==t){if("object"!=typeof r.nesting&&(r.nesting={}),f(p)){for(x in p)"string"==typeof p[x]&&(p[x]=[p[x]]);r.nesting=o(r.nesting,p),e.id.value in r.nesting||(r.nesting[e.id.value]=p[d3.keys(p)[0]])}else r.nesting[e.id.value]=p instanceof Array?p:[p];r[d]=r.nesting[e.id.value][0]}else p instanceof Array?(r.nesting=p,"depth"in e&&e.depth.value<p.length?r[d]=p[e.depth.value]:(r[d]=p[0],"depth"in e&&(e.depth.value=0))):(r[d]=p,r.nesting=[p],"depth"in e&&(e.depth.value=0));else"depth"===t?(e.depth.value=p>=e.id.nesting.length?e.id.nesting.length-1:0>p?0:p,e.id.value=e.id.nesting[e.depth.value],"object"==typeof e.text.nesting&&(_=e.text.nesting[e.id.value],_&&(e.text.nesting[e.id.value]="string"==typeof _?[_]:_,e.text.value=_ instanceof Array?_[0]:_))):r[d]=f(r[d])&&f(p)?o(r[d],p):p;"value"===d&&r.global&&(y=r[d].length>0,b=k||d,b in e&&(y&&e.data[b].indexOf(t)<0||!y&&e.data[b].indexOf(t)>=0)&&(e.data[b]=c(e.data[b],t))),"value"===d&&r.dataFilter&&e.data&&e.data.filters.indexOf(t)<0&&e.data.filters.push(t),e.dev.value&&r.changed&&void 0!==r[d]&&(w=r[d]instanceof Array&&r[d].length>10,m=a(r[d]),j="function"==typeof r[d],M=w||m||j?null:"string"==typeof r[d]?r[d]:JSON.stringify(r[d]),null!==M&&M.length<260?(z=e.format.locale.value.dev.setLong,i.log(u(z,A,'"'+M+'"'))):(z=e.format.locale.value.dev.set,i.log(u(z,A))))}else z=e.format.locale.value.dev.noChange,e.dev.value&&i.comment(u(z,A));"value"===d&&r.callback&&!r.url&&(g="function"==typeof r.callback?r.callback:r.callback.value,g&&g(p,e.self))}}},{"../../array/update.coffee":37,"../../object/merge.coffee":170,"../../object/validate.coffee":171,"../../string/format.js":172,"../../util/copy.coffee":206,"../../util/d3selection.coffee":207,"../console/print.coffee":53,"./process/detect.coffee":87,"./rejected.coffee":90}],94:[function(e,t,r){var n=e("../console/print.coffee"),a=e("../../string/format.js");t.exports=function(e){if(e.dev.value){var t="analyzing edges list";n.time(t)}var r=e.types[e.type.value].requirements;r instanceof Array||(r=[r]);var o=r.indexOf("nodes")>=0&&!e.nodes.value;if(o){e.nodes.value=[];var i=[];e.nodes.changed=!0}e.edges.value.forEach(function(t){["source","target"].forEach(function(r){var n=typeof t[e.edges[r]];if("object"!==n)if("number"!==n||o)if(o&&i.indexOf(t[e.edges[r]])>=0)t[e.edges[r]]=e.nodes.value.filter(function(n){return n[e.id.value]===t[e.edges[r]]})[0];else{var a={};a[e.id.value]=t[e.edges[r]],t[e.edges[r]]=a}else t[e.edges[r]]=e.nodes.value[t[e.edges[r]]];var s=t[e.edges[r]];o&&i.indexOf(s[e.id.value])<0&&(i.push(s[e.id.value]),e.nodes.value.push(s))}),"keys"in e.data||(e.data.keys={}),e.id.value in e.data.keys||(e.data.keys[e.id.value]=typeof t[e.edges.source][e.id.value])}),e.edges.value=e.edges.value.filter(function(t){var r=t[e.edges.source][e.id.value],o=t[e.edges.target][e.id.value];if(r===o){var i=e.format.locale.value.dev.sameEdge;return n.warning(a(i,'"'+r+'"'),"edges"),!1}return!0}),e.edges.linked=!0,e.dev.value&&n.timeEnd(t)}},{"../../string/format.js":172,"../console/print.coffee":53}],95:[function(e,t,r){var n=e("./hideElement.js");t.exports=function(e){function t(e,t){[].forEach.call(t.attributes,function(t){if(/^data-/.test(t.name)){var r=t.name.substr(5).replace(/-(.)/g,function(e,t){return t.toUpperCase()});e[r]=t.value}}),r.forEach(function(r){null!==t.getAttribute(r)&&(e[r]=t.getAttribute(r))})}var r=[e.color.value,e.icon.value,e.keywords.value,e.alt.value,"style"];e.text.value||e.self.text("text"),r=r.concat(e.id.nesting),e.self.data({element:e.data.value});var a=e.data.element.value.node().tagName.toLowerCase(),o=e.data.element.value.attr("type"),i=[];if("select"===a){var s=e.data.element.value.node().id;s&&e.self.container({id:s}),e.data.element.value.selectAll("option").each(function(r,n){var a={};if(a.text=this.innerHTML,t(a,this),i.push(a),this.selected)for(var n=e.id.nesting.length-1;n>=0;n--){var o=e.id.nesting[n];if(o in a){e.self.focus(a[o]);break}}})}else if("input"===a&&"radio"===o){var l=e.data.element.value.node().getAttribute("name");l&&e.self.container({id:l}),e.data.element.value.each(function(r,a){var o={};t(o,this);var s=o[e.id.value]||this.id||!1;if(s&&isNaN(parseFloat(s))){var l=d3.select("label[for="+s+"]");l.empty()||(o.text=l.html(),l.call(n))}i.push(o),this.checked&&e.self.focus(o[e.id.value])})}!e.focus.value.length&&i.length&&(e.data.element.value.node().selectedIndex=0,e.self.focus(i[0][e.id.value]));var u=d3.select("legend[for="+e.container.id+"]");u.empty()||(e.self.title(u.html()),u.call(n));var c=e.container.value?e.container.value.node().tagName.toLowerCase():!1;return(e.container.value===!1||"body"===c)&&(e.container.value=d3.select(e.data.element.value.node().parentNode)),e.data.element.value.call(n),i}},{"./hideElement.js":96}],96:[function(e,t,r){t.exports=function(e){e.style("position","absolute","important").style("clip","rect(1px 1px 1px 1px)","important").style("clip","rect(1px, 1px, 1px, 1px)","important").style("width","1px","important").style("height","1px","important").style("margin","-1px","important").style("padding","0","important").style("border","0","important").style("overflow","hidden","important")}},{}],97:[function(e,t,r){var n=e("../console/print.coffee");t.exports=function(e){if(e.dev.value){var t="analyzing node positions";n.time(t)}var r=e.nodes.value.filter(function(e){return"number"==typeof e.x&&"number"==typeof e.y}).length;if(r===e.nodes.value.length)e.nodes.positions=!0;else{var a=d3.layout.force().size([e.width.viz,e.height.viz]).nodes(e.nodes.value).links(e.edges.value),o=e.edges.strength.value;o&&a.linkStrength("string"==typeof o?function(e){return e[o]}:o);var i=50,s=.01;a.start();for(var l=i;l>0&&(a.tick(),!(a.alpha()<s));--l);a.stop(),e.nodes.positions=!0}e.dev.value&&n.timeEnd(t)}},{"../console/print.coffee":53}],98:[function(e,t,r){var n;n=e("numeric"),t.exports=function(e,t){var r,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M;for(null==t&&(t={}),null==t.maxDegree&&(t.maxDegree=5),r=e.length,x=Number.MAX_VALUE,s=null,o=function(){var r,n,a;for(a=[],c=r=1,n=t.maxDegree+1;n>=1?n>r:r>n;c=n>=1?++r:--r)a.push(function(){var t,r,n;for(n=[],r=0,t=e.length;t>r;r++)y=e[r],n.push(Math.pow(y[0],c));return n}());return a}(),j=function(){var t,r,n;for(n=[],t=0,r=e.length;r>t;t++)y=e[t],n.push(y[1]);return n}(),d=v=0,w=1<<t.maxDegree;w>=0?w>v:v>w;d=w>=0?++v:--v){for(i=[function(){var e,t,n;for(n=[],b=e=0,t=r;t>=0?t>e:e>t;b=t>=0?++e:--e)n.push(1);return n}()],f=[0],p=m=0,_=t.maxDegree;_>=0?_>m:m>_;p=_>=0?++m:--m)(d&1<<p)>0&&(i.push(o[p]),f.push(p+1));a=n.transpose(i),h=f.length,l=n.dot(n.dot(n.inv(n.dot(i,a)),i),j),M=n.dot(a,l),k=n.sub(j,M),A=n.dot(k,k),z=A/(r-h),g=-.5*r*Math.log(2*Math.PI)-.5*r*Math.log(z)-A/(2*z),u=-2*g+h*(Math.log(r)-Math.log(2*Math.PI)),x>u&&(x=u,s=[f,l,M])}return s}},{numeric:7}],99:[function(e,t,r){var n;n=e("static-kdtree"),t.exports=function(e,t){var r,a,o,i,s,l,u,c,f,d,p,h;return null==t&&(t=10),h=n(e),u=function(){var r,n,a;for(a=[],r=0,n=e.length;n>r;r++)c=e[r],a.push(h.knn(c,t+1).slice(1));return a}(),p=function(t,r){var n,a,o,i,s,l;for(n=e[t],a=e[r],i=0,t=s=0,l=n.length;l>=0?l>s:s>l;t=l>=0?++s:--s)o=n[t]-a[t],i+=o*o;return i},i=function(){var r,n,o;for(o=[],a=r=0,n=e.length;n>=0?n>r:r>n;a=n>=0?++r:--r)o.push(p(a,u[a][t-1]));return o}(),f=function(e,t){return Math.max(p(e,t),i[t])},s=function(e){var r,n,a,o,i;for(o=0,i=u[e],n=0,a=i.length;a>n;n++)r=i[n],o+=f(e,r);return t/o},l=function(){var t,r,n;for(n=[],a=t=0,r=e.length;r>=0?r>t:t>r;a=r>=0?++t:--t)n.push(s(a));return n}(),d=function(){var n,i,s,c,f,d;for(d=[],a=n=0,c=e.length;c>=0?c>n:n>c;a=c>=0?++n:--n){for(r=0,f=u[a],i=0,s=f.length;s>i;i++)o=f[i],r+=l[o];r/=t,d.push([a,r/l[a]])}return d}(),d.sort(function(e,t){return t[1]-e[1]})}},{"static-kdtree":9}],100:[function(e,t,r){t.exports=function(e){var t,r,n;return r=d3.median(e),t=d3.median(e.map(function(e){return Math.abs(e-r)})),n=e.map(function(e,n){return[n,Math.abs(e-r)/t]}),n.sort(function(e,t){return t[1]-e[1]})}},{}],101:[function(e,t,r){var n,a,o;n=e("../core/font/tester.coffee"),t.exports=function(e,t,r){var i,s,l,u;return r||(r={}),l=r.parent||n("svg").append("text"),t=t||{},s=[],e instanceof Array||(e=[e]),u=l.selectAll("tspan").data(e),i={left:"0px",position:"absolute",top:"0px",x:0,y:0},u.enter().append("tspan").text(String).style(t).attr(i).each(function(e){return"function"==typeof r.mod?r.mod(this):void 0}).each(function(e){var t,r,n;return t=d3.select(this).selectAll("tspan"),t.size()?(n=[],t.each(function(){return n.push(o(this))}),n=d3.max(n)):n=o(this),r=a(this),s.push({height:r,text:e,width:n})}),u.remove(),r.parent||l.remove(),s},o=function(e){return e.getComputedTextLength()},a=function(e){return e.offsetHeight||e.getBoundingClientRect().height||e.parentNode.getBBox().height}},{"../core/font/tester.coffee":69}],102:[function(e,t,r){var n,a;n=e("../core/font/tester.coffee"),a=function(e){var t,r,o,i,s,l,u,c,f,d,p,h,v,g;for(e instanceof Array||(e=e.split(",")),s=0,u=e.length;u>s;s++)o=e[s],o.trim();if(i=e.join(", "),t=a.complete,i in t)return t[i];for(p=function(e){return v.append("span").style("font-family",e).style("font-size","32px").style("padding","0px").style("margin","0px").text("abcdefghiABCDEFGHI_!@#$%^&*()_+1234567890")},h=function(e,t){var r,n,a;return r=p(e),n=r.node().offsetWidth,a=t.node().offsetWidth,r.remove(),n!==a},v=n("div"),f=p("monospace"),d=p("sans-serif"),l=0,c=e.length;c>l;l++)if(r=e[l],g=h(r+",monospace",f),g||(g=h(r+",sans-serif",d)),g){g=r;break}return g||(g="sans-serif"),f.remove(),d.remove(),t[i]=g,g},a.complete={},t.exports=a},{"../core/font/tester.coffee":69}],103:[function(e,t,r){var n=e("../array/sort.coffee"),a=e("../core/methods/attach.coffee"),o=e("../core/data/format.js"),i=e("../core/data/keys.coffee"),s=e("../core/data/load.coffee"),l=e("../core/fetch/data.js"),u=e("../client/ie.js"),c=e("../core/methods/reset.coffee"),f=e("../core/console/print.coffee");t.exports=function(){var t={types:{auto:e("./types/auto.js"),button:e("./types/button/button.coffee"),drop:e("./types/drop/drop.coffee"),toggle:e("./types/toggle.js")}};return t.self=function(e){var r=t.data.value instanceof Array&&t.data.value.length>t.data.large;if(t.draw.timing=t.draw.first||r||u?0:t.timing.ui,t.data.value instanceof Array){if(t.dev.value&&f.group('drawing "'+t.type.value+'"'),t.data.changed&&(t.data.cache={},i(t,"data"),o(t)),t.data.viz=l(t),t.data.sort.value&&(t.data.changed||t.order.changed||t.order.sort.changed)&&n(t.data.viz,t.order.value||t.text.value,t.order.sort.value,t.color.value,t),t.focus.value===!1){var a=t.data.element.value;if(a&&"select"===a.node().tagName.toLowerCase()){var d=a.property("selectedIndex");d=0>d?0:d;var p=a.selectAll("option")[0][d],h=p.getAttribute("data-"+t.id.value)||p.getAttribute(t.id.value);h&&(t.focus.value=h)}t.focus.value===!1&&t.data.viz.length&&(t.focus.value=t.data.viz[0][t.id.value]),t.dev.value&&t.focus.value&&f.log('"value" set to "'+t.focus.value+'"')}var v=function(e,r){r="number"!=typeof r?1===t.id.nesting.length?0:t.id.nesting.length-1:r;var n=t.id.nesting[r];return r>0&&(!(n in e)||e[n]instanceof Array)?v(e,r-1):n};if(t.data.changed){"auto"===t.search.value?t.data.viz.length>10?(t.search.enabled=!0,t.dev.value&&f.log("Search enabled.")):(t.search.enabled=!1,t.dev.value&&f.log("Search disabled.")):t.search.enabled=t.search.value;var g=t.data.element.value?t.data.element.value.node().tagName.toLowerCase():"";if(t.data.element.value&&"select"===g){var m=[];for(var y in t.data.nested.all)m=m.concat(t.data.nested.all[y]);options=t.data.element.value.selectAll("option").data(m,function(e){var t=e?v(e):!1;return e&&t in e?e[t]:!1}),options.exit().remove(),options.enter().append("option"),options.each(function(e){var r=v(e),n=r===t.id.value?t.text.value||t.id.value:t.text.nesting!==!0&&r in t.text.nesting?t.text.nesting[r]:r;for(var a in e)"object"!=typeof e[a]&&(a===n&&d3.select(this).html(e[a]),["alt","value"].indexOf(a)>=0?d3.select(this).attr(a,e[a]):d3.select(this).attr("data-"+a,e[a]));this.selected=e[r]===t.focus.value?!0:!1})}}else if(t.focus.changed&&t.data.element.value){var x=t.data.element.value.node().tagName.toLowerCase();if("select"===x)t.data.element.value.selectAll("option").each(function(e){this.selected=e[v(e)]===t.focus.value?!0:!1});else{var x=t.data.element.value.attr("type").toLowerCase();"radio"===x&&t.data.element.value.each(function(e){this.checked=this.value===t.focus.value?!0:!1})}}if("auto"!==t.type.value){if(!t.container.ui){t.container.ui=t.container.value.selectAll("div#d3plus_"+t.type.value+"_"+t.container.id).data(["container"]);var b=t.data.element.value?t.data.element.value[0][0]:null;if(b)if(b.id)b="#"+b.id;else{var w=b.getAttribute(t.id.value)?t.id.value:"data-"+t.id.value;b=b.getAttribute(w)?"["+w+"="+b.getAttribute(w)+"]":null}t.container.ui.enter().insert("div",b).attr("id","d3plus_"+t.type.value+"_"+t.container.id).style("position","relative").style("overflow","visible").style("vertical-align","top")}t.container.ui.style("display",t.ui.display.value),t.container.ui.transition().duration(t.draw.timing).style("margin",t.ui.margin.css);var _=t.container.ui.selectAll("div.d3plus_title").data(t.title.value?[t.title.value]:[]);_.enter().insert("div","#d3plus_"+t.type.value+"_"+t.container.id).attr("class","d3plus_title").style("display","inline-block"),_.style("color",t.font.color).style("font-family",t.font.family.value).style("font-size",t.font.size+"px").style("font-weight",t.font.weight).style("padding",t.ui.padding.css).style("border-color","transparent").style("border-style","solid").style("border-width",t.ui.border+"px").text(String).each(function(e){t.margin.left=this.offsetWidth})}if(t.data.value.length){var k=t.format.locale.value.visualization[t.type.value];t.dev.value&&f.time("drawing "+k),t.types[t.type.value](t),t.dev.value&&f.timeEnd("drawing "+k)}else!t.data.url||t.data.loaded&&!t.data.stream||s(t,"data",t.self.draw);t.dev.value&&f.timeEnd("total draw time"),c(t)}},a(t,{active:e("./methods/active.coffee"),alt:e("./methods/alt.coffee"),color:e("./methods/color.coffee"),config:e("./methods/config.coffee"),container:e("./methods/container.coffee"),data:e("./methods/data.js"),depth:e("./methods/depth.coffee"),dev:e("./methods/dev.coffee"),draw:e("./methods/draw.js"),focus:e("./methods/focus.coffee"),font:e("./methods/font.coffee"),format:e("./methods/format.coffee"),height:e("./methods/height.coffee"),history:e("./methods/history.coffee"),hover:e("./methods/hover.coffee"),icon:e("./methods/icon.coffee"),id:e("./methods/id.coffee"),keywords:e("./methods/keywords.coffee"),margin:e("./methods/margin.coffee"),open:e("./methods/open.coffee"),order:e("./methods/order.coffee"),remove:e("./methods/remove.coffee"),search:e("./methods/search.coffee"),select:e("./methods/select.coffee"),selectAll:e("./methods/selectAll.coffee"),text:e("./methods/text.coffee"),timing:e("./methods/timing.coffee"),title:e("./methods/title.coffee"),type:e("./methods/type.coffee"),ui:e("./methods/ui.coffee"),width:e("./methods/width.coffee")}),t.self}},{"../array/sort.coffee":36,"../client/ie.js":39,"../core/console/print.coffee":53,"../core/data/format.js":57,"../core/data/keys.coffee":59,"../core/data/load.coffee":60,"../core/fetch/data.js":65,"../core/methods/attach.coffee":79,"../core/methods/reset.coffee":92,"./methods/active.coffee":104,"./methods/alt.coffee":105,"./methods/color.coffee":106,"./methods/config.coffee":107,"./methods/container.coffee":108,"./methods/data.js":109,"./methods/depth.coffee":110,"./methods/dev.coffee":111,"./methods/draw.js":112,"./methods/focus.coffee":113,"./methods/font.coffee":114,"./methods/format.coffee":115,"./methods/height.coffee":116,"./methods/history.coffee":117,"./methods/hover.coffee":118,"./methods/icon.coffee":119,"./methods/id.coffee":120,"./methods/keywords.coffee":121,"./methods/margin.coffee":122,"./methods/open.coffee":123,"./methods/order.coffee":124,"./methods/remove.coffee":125,"./methods/search.coffee":126,"./methods/select.coffee":127,"./methods/selectAll.coffee":128,"./methods/text.coffee":129,"./methods/timing.coffee":130,"./methods/title.coffee":131,"./methods/type.coffee":132,"./methods/ui.coffee":133,"./methods/width.coffee":134,"./types/auto.js":135,
"./types/button/button.coffee":136,"./types/drop/drop.coffee":141,"./types/toggle.js":158}],104:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,Array,Function,Number,String],value:!1}},{"../../core/methods/filter.coffee":80}],105:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,Array,Function,Object,String],mute:n(!0),solo:n(!0),value:"alt"}},{"../../core/methods/filter.coffee":80}],106:[function(e,t,r){t.exports={accepted:[String],value:"color"}},{}],107:[function(e,t,r){t.exports={accepted:[Object],objectAccess:!1,process:function(e,t){var r,n;for(r in e)n=e[r],r in t.self&&t.self[r](n);return e},value:{}}},{}],108:[function(e,t,r){var n;n=e("../../util/d3selection.coffee"),t.exports={accepted:[!1,Array,Object,String],element:!1,id:"default",process:function(e){return e===!1?d3.select("body"):n(e)?e:d3.select(e instanceof Array?e[0][0]:e)},value:d3.select("body")}},{"../../util/d3selection.coffee":207}],109:[function(e,t,r){var n=e("../../util/d3selection.coffee"),a=e("../../core/methods/process/data.coffee");t.exports={accepted:[!1,Array,Function,String],delimiter:{accepted:[String],value:"|"},element:{process:function(e,t){var r=!1;return n(e)?r=e:"string"!=typeof e||d3.select(e).empty()||(r=d3.select(e)),r&&t.self.container(d3.select(r.node().parentNode)),r},value:!1},filetype:{accepted:[!1,"json","xml","html","csv","dsv","tsv","txt"],value:!1},filters:[],large:400,mute:[],process:function(e,t){return"default"===t.container.id&&e.length&&t.self.container({id:"default"+e.length}),a(e,t,this)},solo:[],sort:{accepted:[Boolean],value:!1},value:!1}},{"../../core/methods/process/data.coffee":86,"../../util/d3selection.coffee":207}],110:[function(e,t,r){t.exports={accepted:[Number],value:0}},{}],111:[function(e,t,r){t.exports={accepted:[Boolean],value:!1}},{}],112:[function(e,t,r){var n=e("../../util/d3selection.coffee"),a=e("../../core/parse/hideElement.js"),o=e("../../core/parse/element.js"),i=e("../../core/console/print.coffee"),s=e("../../string/format.js");t.exports={accepted:[void 0,Function],first:!0,frozen:!1,process:function(e,t){if(this.initialized===!1)return this.initialized=!0,e;if(!t.data.value||t.data.value instanceof Array&&!n(t.data.value)?t.data.element.value&&t.data.element.value.call(a):t.data.value=o(t),void 0===e&&"function"==typeof this.value&&(e=this.value),t.container.value===!1){var r=t.format.locale.value.dev.setContainer;i.warning(r,"container")}else if(t.container.value.empty()){var r=t.format.locale.value.dev.noContainer;i.warning(s(r,'"'+t.container.value+'"'),"container")}else t.dev.value&&i.time("total draw time"),t.container.value.call(t.self);if("function"==typeof e&&t.history.chain.length){var l={};changes.forEach(function(e){var t=e.method;delete e.method,l[t]=e}),e(l),t.history.chain=[]}return e},update:!0,value:void 0}},{"../../core/console/print.coffee":53,"../../core/parse/element.js":95,"../../core/parse/hideElement.js":96,"../../string/format.js":172,"../../util/d3selection.coffee":207}],113:[function(e,t,r){t.exports={accepted:[!1,Number,String],deprecates:"highlight",process:function(e,t){var r,n,a,o,i,s,l,u,c,f;if(n=t.data.element.value,n&&["string","number"].indexOf(typeof e)>=0)if(a=n.node().tagName.toLowerCase(),o=n.attr("type"),"select"===a)for(f=n.selectAll("option"),i=s=0,u=f.length;u>s;i=++s)r=f[i],r&&r[t.id.value]===e&&(n.node().selectedIndex=i);else if("input"===a&&"radio"===o)for(l=0,c=n.length;c>l;l++)r=n[l],this.checked=r&&r[t.id.value]===e;return e},value:!1}},{}],114:[function(e,t,r){var n,a,o,i;o=e("../../core/methods/font/family.coffee"),n=e("../../core/methods/font/align.coffee"),a=e("../../core/methods/font/decoration.coffee"),i=e("../../core/methods/font/transform.coffee"),t.exports={align:n(),color:"#444444",decoration:a(),family:o(),secondary:{align:n(),color:"#444444",decoration:a(),family:o(),size:12,spacing:0,transform:i(),weight:200},size:12,spacing:0,transform:i(),weight:200}},{"../../core/methods/font/align.coffee":81,"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],115:[function(e,t,r){var n,a,o,i;n=e("../../number/format.coffee"),a=e("../../core/locale/locale.coffee"),o=e("../../object/merge.coffee"),i=e("../../string/title.coffee"),t.exports={accepted:[Function,String],affixes:{accepted:[Object],objectAccess:!1,value:{}},deprecates:["number_format","text_format"],locale:{accepted:function(){return d3.keys(a)},process:function(e){var t,r;return t="en_US",r=a[t],e!==t&&(r=o(r,a[e])),this.language=e,r},value:"en_US"},number:{accepted:[!1,Function],value:!1},process:function(e,t){if("string"==typeof e)t.self.format({locale:e});else if("function"==typeof e)return e;return this.value},text:{accepted:[!1,Function],value:!1},value:function(e,t){var r,a,o;return t||(t={}),o=t.vars||{},o.time&&o.time.value&&t.key===o.time.value?(a=e.constructor===Date?e:new Date(e),o.data.time.format(a)):"number"==typeof e?(r=this.number.value||n)(e,t):"string"==typeof e?(r=this.text.value||i)(e,t):JSON.stringify(e)}}},{"../../core/locale/locale.coffee":78,"../../number/format.coffee":169,"../../object/merge.coffee":170,"../../string/title.coffee":175}],116:[function(e,t,r){t.exports={accepted:[!1,Number],max:600,secondary:!1,value:!1}},{}],117:[function(e,t,r){t.exports={back:function(){return this.states.length?this.states.pop()():void 0},chain:[],reset:function(){var e;for(e=[];this.states.length;)e.push(this.states.pop()());return e},states:[]}},{}],118:[function(e,t,r){t.exports={accepted:[Boolean,Number,String],value:!1}},{}],119:[function(e,t,r){var n;n=e("../../core/methods/process/icon.coffee"),t.exports={accepted:[!1,Array,Function,Object,String],back:{accepted:[!1,String],fallback:"&#x276e;",opacity:1,process:n,rotate:0,value:"fa-angle-left"},button:{accepted:[!1,String],fallback:!1,opacity:1,process:n,rotate:0,value:!1},drop:{accepted:[!1,String],fallback:"&#x276f;",opacity:1,process:n,rotate:0,value:"fa-angle-down"},next:{accepted:[!1,String],fallback:"&#x276f;",opacity:1,process:n,rotate:0,value:"fa-angle-right"},select:{accepted:[!1,String],fallback:"&#x2713;",opacity:1,process:n,rotate:0,value:"fa-check"},style:{accepted:[Object,String],value:"default"},value:"icon"}},{"../../core/methods/process/icon.coffee":88}],120:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[Array,String],dataFilter:!0,mute:n(!0),nesting:["value"],solo:n(!0),value:"value"}},{"../../core/methods/filter.coffee":80}],121:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,Array,Function,Object,String],mute:n(!0),solo:n(!0),value:"keywords"}},{"../../core/methods/filter.coffee":80}],122:[function(e,t,r){var n;n=e("../../core/methods/process/margin.coffee"),t.exports={accepted:[Number,Object,String],process:function(e){var t;return void 0===e&&(e=this.value),t=e,n(e,this),t},value:0}},{"../../core/methods/process/margin.coffee":89}],123:[function(e,t,r){t.exports={accepted:[Boolean],flipped:{accepted:[Boolean],value:!1},value:!1}},{}],124:[function(e,t,r){t.exports={accepted:[!1,Function,String],sort:{accepted:["asc","desc"],deprecates:["sort"],value:"asc"},value:!1}},{}],125:[function(e,t,r){t.exports={accepted:void 0,process:function(e,t){this.initialized&&t.container.value.remove()},value:void 0}},{}],126:[function(e,t,r){t.exports={accepted:["auto",Boolean],process:function(e){return"Boolean"==typeof e&&(this.enabled=e),e},term:"",value:"auto"}},{}],127:[function(e,t,r){t.exports={accepted:[String],chainable:!1,process:function(e,t){var r;return r=t.container.value,r&&e?r.select(e):e},value:void 0}},{}],128:[function(e,t,r){t.exports={accepted:[String],chainable:!1,process:function(e,t){var r;return r=t.container.value,r&&e?r.selectAll(e):e},value:void 0}},{}],129:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,String],nesting:!0,mute:n(!0),solo:n(!0),secondary:{accepted:[!1,String],nesting:!0,value:!1},value:!1}},{"../../core/methods/filter.coffee":80}],130:[function(e,t,r){t.exports={mouseevents:60,ui:200}},{}],131:[function(e,t,r){var n,a,o,i;n=e("../../core/methods/font/decoration.coffee"),a=e("../../core/methods/font/family.coffee"),i=e("../../core/methods/font/transform.coffee"),o=e("../../string/strip.js"),t.exports={accepted:[!1,Function,String],font:{align:"center",color:"#444444",decoration:n(),family:a(),size:16,transform:i(),weight:400},link:!1,process:function(e,t){var r;return 0===t.container.id.indexOf("default")&&e&&(r=o(e).toLowerCase(),t.self.container({id:r})),e},value:!1}},{"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85,"../../string/strip.js":174}],132:[function(e,t,r){t.exports={accepted:function(e){return d3.keys(e.types)},value:"auto"}},{}],133:[function(e,t,r){var n,a,o,i,s;o=e("../../core/methods/font/family.coffee"),n=e("../../core/methods/font/align.coffee"),a=e("../../core/methods/font/decoration.coffee"),i=e("../../core/methods/process/margin.coffee"),s=e("../../core/methods/font/transform.coffee"),t.exports={align:n("center"),border:1,color:{primary:{process:function(e,t){var r;return r=this.value,t.ui.color.secondary.value||(t.ui.color.secondary.value=d3.rgb(r).darker(.75).toString()),e},value:"#ffffff"},secondary:{value:!1}},display:{acceped:["block","inline-block"],value:"inline-block"},font:{align:n("center"),color:"#444",decoration:a(),family:o(),size:11,transform:s(),weight:200},margin:{process:function(e){var t;return void 0===e&&(e=this.value),t=e,i(e,this),t},value:5},padding:{process:function(e){var t;return void 0===e&&(e=this.value),t=e,i(e,this),t},value:5}}},{"../../core/methods/font/align.coffee":81,"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85,"../../core/methods/process/margin.coffee":89}],134:[function(e,t,r){t.exports={accepted:[!1,Number],secondary:!1,value:!1}},{}],135:[function(e,t,r){t.exports=function(e){var t=e.data.value.length;1===t?e.self.type("button").draw():5>t?e.self.type("toggle").draw():e.self.type("drop").draw()}},{}],136:[function(e,t,r){t.exports=function(t){var r,n,a,o,i,s,l,u;return s=e("../../../core/console/print.coffee"),a=e("./functions/color.coffee"),o=e("./functions/icons.js"),i=e("./functions/mouseevents.coffee"),l=e("./functions/style.js"),r=t.container.ui.selectAll("div.d3plus_node").data(t.data.viz,function(e){return e[t.id.value]}),t.dev.value&&s.time("enter"),r.enter().append("div").attr("class","d3plus_node").call(a,t).call(l,t).call(o,t).call(i,t),t.dev.value&&s.timeEnd("enter"),t.draw.update||t.draw.timing?(t.dev.value&&s.time("ordering"),r.order(),t.dev.value&&s.timeEnd("ordering"),u=r):(n=[t.focus.previous,t.focus.value,t.hover.previous,t.hover.value].filter(function(e){return e}),u=r.filter(function(e){return n.indexOf(e[t.id.value])>=0})),t.dev.value&&s.time("update"),t.draw.timing?u.transition().duration(t.draw.timing).call(a,t).call(l,t):u.call(a,t).call(l,t),u.call(o,t).call(i,t),t.dev.value&&s.timeEnd("update"),r.exit().remove()}},{"../../../core/console/print.coffee":53,"./functions/color.coffee":137,"./functions/icons.js":138,"./functions/mouseevents.coffee":139,"./functions/style.js":140}],137:[function(e,t,r){t.exports=function(t,r){var n,a,o;return n=e("../../../../color/legible.coffee"),a=e("../../../../color/lighter.coffee"),o=e("../../../../color/text.coffee"),t.style("background-color",function(e){var t;return t=r.focus.value===e[r.id.value]?r.ui.color.secondary.value:r.ui.color.primary.value,r.hover.value===e[r.id.value]&&(t=d3.rgb(t).darker(.15).toString()),t}).style("color",function(e){var t,a,i;return i=r.focus.value===e[r.id.value]?.75:1,a=e[r.icon.value]&&r.data.viz.length<r.data.large,t=!a&&e[r.color.value]?n(e[r.color.value]):o(d3.select(this).style("background-color")),t=d3.rgb(t),"rgba("+t.r+","+t.g+","+t.b+","+i+")"}).style("border-color",r.ui.color.secondary.value)}},{"../../../../color/legible.coffee":45,"../../../../color/lighter.coffee":46,"../../../../color/text.coffee":51}],138:[function(e,t,r){var n=e("../../../../client/prefix.coffee"),a=e("../../../../client/rtl.coffee");t.exports=function(e,t){var r="right"===t.font.align.value&&!a||a&&"right"===t.font.align.value;e.each(function(e,o){var i=["label"];e[t.icon.value]&&t.data.viz.length<=t.data.large&&i.push("icon");var s=t.icon.button.value;e[t.id.value]===t.focus.value&&t.icon.select.value?(s=t.icon.select.value,i.push("selected")):s&&e.d3plus.icon!==!1&&i.push("selected");var l=0,u=d3.select(this).selectAll("div.d3plus_button_element").data(i,function(e){return e});u.enter().append("div").style("display",function(e){return"label"===e?"block":"absolute"}),u.order().attr("class",function(e){var t="";return"selected"===e&&0===s.indexOf("fa-")&&(t=" fa "+s),"d3plus_button_element d3plus_button_"+e+t}).html(function(r){if("label"===r){var n=t.text.value&&t.text.value in e&&!(e[t.text.value]instanceof Array)?t.text.value:t.id.value;return t.format.value(e[n])}return"selected"===r&&s.indexOf("fa-")<0?s:""}).style("background-image",function(r){return"icon"===r?"url('"+e[t.icon.value]+"')":"none"}).style("background-color",function(r){return"icon"===r&&"knockout"===e.style?e[t.color.value]||t.ui.color.primary.value:"transparent"}).style("background-size","100%").style("text-align",function(e){return"label"===e?t.font.align.value:"center"}).style("position",function(e){return"label"==e?"static":"absolute"}).style("width",function(e){return"label"===e?"auto":(l=t.height.value?t.height.value-(t.ui.padding.top+t.ui.padding.bottom)-2*t.ui.border:t.font.size+t.ui.border,l+"px")}).style("height",function(e){return"icon"===e?l+"px":"auto"}).style("margin-top",function(e){if("label"===e)return"0px";if(this.offsetHeight||this.getBoundingClientRect().height)var r=this.offsetHeight||this.getBoundingClientRect().height;else if("selected"===e)var r=t.font.size;else var r=l;return-r/2+"px"}).style("top",function(e){return"label"===e?"auto":"50%"}).style("left",function(e){return"icon"===e&&!r||"selected"===e&&r?t.ui.padding.left+"px":"auto"}).style("right",function(e){return"icon"===e&&r||"selected"===e&&!r?t.ui.padding.right+"px":"auto"}).style(n()+"transition",function(e){return"selected"===e?t.draw.timing/1e3+"s":"none"}).style(n()+"transform",function(e){var r="selected"===e?t.icon.select.rotate:"none";return"string"==typeof r?r:"rotate("+r+"deg)"}).style("opacity",function(e){return"selected"===e?t.icon.select.opacity:1}),u.exit().remove();var c=d3.select(this).selectAll(".d3plus_button_label");if(l>0){var f=t.ui.padding;f=3===i.length?f.top+"px "+(2*f.right+l)+"px "+f.bottom+"px "+(2*f.left+l)+"px":i.indexOf("icon")>=0&&!a||i.indexOf("selected")>=0&&a?f.top+"px "+f.right+"px "+f.bottom+"px "+(2*f.left+l)+"px":f.top+"px "+(2*f.right+l)+"px "+f.bottom+"px "+f.left+"px",c.style("padding",f)}else c.style("padding",t.ui.padding.css);if("number"==typeof t.width.value){var d=t.width.value;d-=parseFloat(c.style("padding-left"),10),d-=parseFloat(c.style("padding-right"),10),d-=2*t.ui.border,d+="px"}else var d="auto";c.style("width",d)})}},{"../../../../client/prefix.coffee":41,"../../../../client/rtl.coffee":42}],139:[function(e,t,r){t.exports=function(t,r,n){var a,o;return n=e("./color.coffee"),a=e("../../../../client/pointer.coffee"),o=e("../../../../client/ie.js"),t.on(a.over,function(e,t){return r.self.hover(e[r.id.value]),o||!r.draw.timing?d3.select(this).style("cursor","pointer").call(n,r):d3.select(this).style("cursor","pointer").transition().duration(r.timing.mouseevents).call(n,r)}).on(a.out,function(e){return r.self.hover(!1),o||!r.draw.timing?d3.select(this).style("cursor","auto").call(n,r):d3.select(this).style("cursor","auto").transition().duration(r.timing.mouseevents).call(n,r)}).on(a.click,function(e){return r.self.focus(e[r.id.value]).draw()})}},{"../../../../client/ie.js":39,"../../../../client/pointer.coffee":40,"./color.coffee":137}],140:[function(e,t,r){t.exports=function(e,t){e.style("position","relative").style("margin",t.ui.margin.css).style("display",t.ui.display.value).style("border-style","solid").style("border-width",t.ui.border+"px").style("font-family",t.font.family.value).style("font-size",t.font.size+"px").style("font-weight",t.font.weight).style("letter-spacing",t.font.spacing+"px")}},{}],141:[function(e,t,r){t.exports=function(t){var r,n,a,o,i,s,l,u,c,f,d;return a=e("./functions/element.coffee"),o=e("./functions/keyboard.coffee"),d=e("./functions/window.js"),f=e("./functions/width.js"),r=e("./functions/button.js"),l=e("./functions/selector.js"),u=e("./functions/title.js"),s=e("./functions/search.js"),i=e("./functions/list.js"),n=e("./functions/data.js"),c=e("./functions/update.js"),t.margin.top=0,t.margin.title=0,a(t),o(t),d(t),f(t),r(t),l(t),u(t),s(t),i(t),n(t),c(t)}},{"./functions/button.js":144,"./functions/data.js":145,"./functions/element.coffee":146,"./functions/keyboard.coffee":149,"./functions/list.js":150,"./functions/search.js":152,"./functions/selector.js":153,"./functions/title.js":154,"./functions/update.js":155,"./functions/width.js":156,"./functions/window.js":157}],142:[function(e,t,r){t.exports=function(e,t,r){var n=[],r=r||e.active.value;if(r instanceof Array)for(var a=0;a<r.length;a++)n.push(this(e,t,r[a]));else{var o=typeof r;n.push("number"===o?e.depth.value===r:"function"===o?r(t):t===r)}return n.indexOf(!0)>=0}},{}],143:[function(e,t,r){var n=e("../../../../core/console/print.coffee");t.exports=function(e){e.dev.value&&n.time("rotating arrow");var t="&#x276f;"===e.icon.drop.value?90:0;if(e.open.value!=e.open.flipped.value)var r=180+t;else var r=t;e.container.button.icon({select:{opacity:e.open.value?.5:1,rotate:r}}).draw(),e.dev.value&&n.timeEnd("rotating arrow")}},{"../../../../core/console/print.coffee":53}],144:[function(e,t,r){var n=e("../../../../util/copy.coffee"),a=e("../../../../client/pointer.coffee"),o=e("../../../form.js"),i=e("../../../../core/console/print.coffee");t.exports=function(e){if("button"in e.container||(e.dev.value&&i.time("creating main button"),e.container.button=o().container(e.container.ui).type("button").ui({margin:0}),e.dev.value&&i.timeEnd("creating main button")),e.focus.changed||e.data.changed||e.depth.changed){var t=e.depth.value,r=n(e.data.value.filter(function(r){for(var n=!1,a=0;a<e.id.nesting.length;a++){var o=e.id.nesting[a];if(n=o in r&&r[o]===e.focus.value){t=a;break}}return n})[0]);r||(r=e.container.button.data()[0]||e.data.viz[0]),e.container.button.data([r]).id(e.id.nesting).depth(t)}var s=e.hover.value===!0?e.focus.value:!1;e.container.button.draw({update:e.draw.update}).focus("").font(e.font).hover(s).icon({button:e.icon.drop.value,select:e.icon.drop.value,value:e.icon.value}).text(e.text.value).timing({ui:e.draw.timing}).ui({color:e.ui.color,padding:e.ui.padding.css}).width(e.width.value).draw();var l=e.container.button.container(Object).ui;e.margin.top+=l.node().offsetHeight||l.node().getBoundingClientRect().height,l.on(a.click,function(){e.self.open(!e.open.value).draw()})}},{"../../../../client/pointer.coffee":40,"../../../../core/console/print.coffee":53,"../../../../util/copy.coffee":206,"../../../form.js":103}],145:[function(e,t,r){var n=e("../../../../string/format.js"),a=e("../../../../string/strip.js");t.exports=function(e){if(e.data.url&&!e.data.loaded){var t={};t[e.text.value||e.id.value]=e.format.value(e.format.locale.value.ui.loading),e.data.filtered=[t],e.data.changed="loading"!==e.data.lastFilter,e.data.lastFilter="loading"}else if(e.open.value)if(e.search.term){var r=a(e.search.term).split("_"),o=[e.id.value,e.text.value,e.alt.value,e.keywords.value];o=o.filter(function(e){return e}),r=r.filter(function(e){return""!==e});var i=[],s=[],l=[],u=[];if(e.id.nesting.forEach(function(t){u=u.concat(e.data.nested.all[t])}),u.forEach(function(t){var n=!1;o.forEach(function(o){if(!n&&o in t&&"string"==typeof t[o]){var u=t[o].toLowerCase();if([e.text.value,e.id.value].indexOf(o)>=0&&0===u.indexOf(e.search.term))i.push(t),n=!0;else if(u.indexOf(e.search.term)>=0)s.push(t),n=!0;else{var c=a(u).split("_");for(var f in c){if(n)break;for(var d in r)if(0===c[f].indexOf(r[d])){l.push(t),n=!0;break}}}}})}),e.data.filtered=d3.merge([i,s,l]),e.data.filtered.forEach(function(e,t){e.d3plus_order=t}),e.data.changed=!0,e.data.lastFilter="search",0===e.data.filtered.length){var c={},f=e.format.value(e.format.locale.value.ui.noResults);c[e.text.value||e.id.value]=n(f,'"'+e.search.term+'"'),e.data.filtered=[c]}}else e.data.filtered=e.data.viz,e.data.changed="viz"!==e.data.lastFilter,e.data.lastFilter="viz",e.id.nesting.length>1&&e.depth.value<e.id.nesting.length-1&&(e.data.filtered=e.data.filtered.filter(function(t){return"endPoint"in t.d3plus&&t.d3plus.endPoint===e.depth.value&&(t.d3plus.icon=!1),!0}),e.data.changed="depth"!==e.data.lastFilter,e.data.lastFilter="depth");else e.data.filtered=[]}},{"../../../../string/format.js":172,"../../../../string/strip.js":174}],146:[function(e,t,r){t.exports=function(e){return e.data.element.value?(e.data.element.value.on("focus."+e.container.id,function(){return e.self.hover(!0).draw()}),e.data.element.value.on("blur."+e.container.id,function(){var t;return t=e.search.enabled?d3.event.relatedTarget!==e.container.value.select("input").node():!0,t?e.self.open(!1).hover(!1).draw():void 0}),e.data.element.value.on("change."+e.container.id,function(){return e.self.focus(this.value).draw()}),e.data.element.value.on("keydown.cancel_"+e.container.id,function(){return 9!==d3.event.keyCode?d3.event.preventDefault():void 0})):void 0}},{}],147:[function(e,t,r){t.exports=function(e){var t=e.height.secondary,r=e.container.button.container().node().getBoundingClientRect(),n=window.innerHeight-r.bottom-2*e.ui.border-e.ui.margin.top-e.ui.margin.bottom-e.ui.padding.top-e.ui.padding.bottom;n<3*r.height&&(n=r.top-10,e.self.open({flipped:!0})),"number"!=typeof t&&(t=n),t>e.height.max&&(t=e.height.max),e.self.height({secondary:t})}},{}],148:[function(e,t,r){var n,a,o,i;n=e("./active.js"),a=e("../../../../util/copy.coffee"),o=e("../../../form.js"),i=e("../../../../core/console/print.coffee"),t.exports=function(e){var t,r,s;e.open.value&&(e.dev.value&&i.time("updating list items"),"items"in e.container||(e.container.items=o().container(e.container.list).type("button").ui({border:0,display:"block",margin:0}).width(!1)),r=e.draw.timing?e.data.large:1,s=a(e.order),s.value=e.search.term.length?"d3plus_order":e.order.value,t=e.depth.value===e.id.nesting.length-1,(e.focus.changed||e.container.items.focus()===!1)&&e.container.items.focus(e.focus.value,function(t){var r,a,o,i;a=e.data.filtered.filter(function(r){return r[e.id.value]===t})[0],e.depth.value<e.id.nesting.length-1&&e.id.nesting[e.depth.value+1]in a?(o=e.depth.value,i=e.id.solo.value,e.history.states.push(function(){return e.self.depth(o).id({solo:i}).draw()}),e.self.depth(e.depth.value+1).id({solo:[t]}).draw()):(e.depth.changed||e.self.open(!1),r=t!==e.focus.value,r&&e.active.value&&(r=n(e,t)),r&&e.self.focus(t).draw())}),e.data.changed&&e.container.items.data({large:r,value:e.data.filtered}),e.container.items.active(e.active.value).data({sort:e.data.sort.value}).draw({update:e.draw.update}).font(e.font.secondary).hover(e.hover.value).id(e.id.value).icon({button:t?!1:e.icon.next,select:t?e.icon.select:!1,value:e.icon.value}).order(s).text(e.text.secondary.value||e.text.value).timing({ui:e.draw.timing}).ui({color:{primary:1===e.id.nesting.length?e.ui.color.primary.value:e.ui.color.secondary.value,secondary:e.ui.color.secondary.value},padding:e.ui.padding.css}).draw(),e.dev.value&&i.timeEnd("updating list items"))}},{"../../../../core/console/print.coffee":53,"../../../../util/copy.coffee":206,"../../../form.js":103,"./active.js":142}],149:[function(e,t,r){t.exports=function(e){return d3.select(window).on("keydown."+e.container.id,function(){var t,r,n,a,o,i,s,l,u,c,f,d,p;if(u=d3.event.keyCode,e.open.value||e.hover.value===!0){for(f=e.hover.value===!0?"focus":"hover",s=!1,d=e.data.filtered,i=l=0,c=d.length;c>l;i=++l)if(t=d[i],t[e.id.value]===e[f].value){s=i;break}if(9===u&&e.open.value&&(!e.search.enabled||e.search.enabled&&!d3.event.shiftKey))return e.self.open(!1).hover(!1).draw();if([38,40].indexOf(u)>=0)return s===!1?s=0:38===u?e.open.value&&(0>=s?s=e.data.filtered.length-1:s-=1):40===u&&e.open.value&&(s>=e.data.filtered.length-1?s=0:s+=1),o="boolean"!=typeof e.hover.value?e.data.filtered[s][e.id.value]:e.focus.value,e.self.hover(o).open(!0).draw();if(13===u)return"boolean"!=typeof e.hover.value?(r=e.data.filtered.filter(function(t){return t[e.id.value]===e.hover.value})[0],n=e.depth.value,n<e.id.nesting.length-1&&e.id.nesting[n+1]in r?(p=e.id.solo.value,a=function(){return e.self.depth(n).id({solo:p}).draw()},e.history.states.push(a),e.self.depth(e.depth.value+1).id({solo:[e.hover.value]}).draw()):e.self.focus(e.hover.value).hover(!0).draw()):e.self.hover(e.focus.value).open(!0).draw();if(27===u){if(e.open.value)return e.self.open(!1).hover(!0).draw();if(e.hover.value===!0)return e.self.hover(!1).draw()}}})}},{}],150:[function(e,t,r){var n=e("../../../../core/console/print.coffee");t.exports=function(e){e.dev.value&&n.time("populating list"),e.container.list=e.container.selector.selectAll("div.d3plus_drop_list").data(["list"]),e.container.list.enter().append("div").attr("class","d3plus_drop_list").attr("id","d3plus_drop_list_"+e.container.id).style("overflow-y","auto").style("overflow-x","hidden"),e.dev.value&&n.timeEnd("populating list")}},{"../../../../core/console/print.coffee":53}],151:[function(e,t,r){var n=e("../../../../core/console/print.coffee");t.exports=function(e){if(e.open.value){e.dev.value&&n.time("calculating height");var t=!1;if("none"==e.container.selector.style("display"))var t=!0;t&&e.container.selector.style("display","block");var r=e.container.selector.style("height"),a=e.container.selector.property("scrollTop"),o=e.container.list.style("max-height"),i=e.container.list.property("scrollTop");e.container.selector.style("height","auto"),e.container.list.style("max-height","200000px"),e.container.listHeight=parseFloat(e.container.selector.style("height"),10),e.container.list.style("max-height",o).property("scrollTop",i),e.container.selector.style("height",r).property("scrollTop",a);var s=!1;if(e.container.listHeight>e.height.secondary&&(e.container.listHeight=e.height.secondary,s=!0),t&&e.container.selector.style("display","none"),e.dev.value&&n.timeEnd("calculating height"),s){e.dev.value&&n.time("calculating scroll position");var l=e.container.list.select("div").selectAll("div.d3plus_node"),u=l[0][0],c="boolean"!=typeof e.hover.value?e.hover.value:e.focus.value;l.each(function(t,r){t[e.id.value]===c&&(u=this)});var t=!1;"none"===e.container.selector.style("display")&&(t=!0,e.container.selector.style("display","block"));var f=u.offsetTop,d=u.offsetHeight||u.getBoundingClientRect().height,p=e.container.list.property("scrollTop");t&&e.container.selector.style("display","none"),t||e.data.changed||e.depth.changed?e.container.listScroll=f:(e.container.listScroll=p,p>f?e.container.listScroll=f:f+d>p+e.height.secondary-e.search.height&&(e.container.listScroll=f-(e.height.secondary-d-e.search.height))),e.dev.value&&n.timeEnd("calculating scroll position")}else e.container.listScroll=0}else e.container.listScroll=e.container.list.property("scrollTop"),e.container.listHeight=0}},{"../../../../core/console/print.coffee":53}],152:[function(e,t,r){var n=e("../../../../client/prefix.coffee"),a=e("../../../../core/console/print.coffee");t.exports=function(t){function r(e){e.style("padding",t.ui.padding.css).style("display","block").style("background-color",d3.rgb(t.ui.color.primary.value).darker(.15).toString())}function o(e){var r=t.width.secondary-2*t.ui.padding.left-2*t.ui.padding.right+2*t.ui.border;e.style("padding",t.ui.padding.left/2+t.ui.padding.right/2+"px").style("width",r+"px").style("border-width","0px").style("font-family",t.font.secondary.family.value).style("font-size",t.font.secondary.size+"px").style("font-weight",t.font.secondary.weight).style("text-align",t.font.secondary.align).style("outline","none").style(n()+"border-radius","0").attr("placeholder",t.format.value(t.format.locale.value.method.search))}t.dev.value&&a.time("creating search");var i=e("./data.js"),s=e("./items.coffee"),l=e("./update.js");t.container.search=t.container.selector.selectAll("div.d3plus_drop_search").data(t.search.enabled?["search"]:[]),t.draw.timing?(t.container.search.transition().duration(t.draw.timing).call(r),t.container.search.select("input").transition().duration(t.draw.timing).call(o)):(t.container.search.call(r),t.container.search.select("input").call(o)),t.container.search.enter().insert("div","#d3plus_drop_list_"+t.container.id).attr("class","d3plus_drop_search").attr("id","d3plus_drop_search_"+t.container.id).call(r).append("input").attr("id","d3plus_drop_input_"+t.container.id).style("-webkit-appearance","none").call(o),t.container.search.select("input").on("keyup."+t.container.id,function(e){var r=this.value;t.search.term!==r&&(t.search.term=r,i(t),s(t),l(t))}),t.container.search.exit().remove();var u=t.container.selector.style("display");t.container.selector.style("display","block"),t.search.height=t.search.enabled?t.container.search.node().offsetHeight||t.container.search.node().getBoundingClientRect().height:0,t.container.selector.style("display",u),t.search.enabled&&(t.margin.title+=t.search.height),t.dev.value&&a.timeEnd("creating search")}},{"../../../../client/prefix.coffee":41,"../../../../core/console/print.coffee":53,"./data.js":145,"./items.coffee":148,"./update.js":155}],153:[function(e,t,r){t.exports=function(e){e.container.selector=e.container.ui.selectAll("div.d3plus_drop_selector").data(["selector"]),e.container.selector.enter().append("div").attr("class","d3plus_drop_selector").style("position","absolute").style("top","0px").style("z-index","-1").style("overflow","hidden"),e.container.selector.style("padding",e.ui.border+"px")}},{}],154:[function(e,t,r){var n=e("../../../../client/pointer.coffee"),a=e("../../../../color/lighter.coffee"),o=e("../../../../core/console/print.coffee"),i=e("../../../../color/text.coffee");t.exports=function(e){function t(t){t.style("padding",e.ui.padding.css).style("display","block").style("background-color",e.ui.color.secondary.value).style("font-family",e.font.secondary.family.value).style("font-size",e.font.secondary.size+"px").style("font-weight",e.font.secondary.weight).style("text-align",e.font.secondary.align).style("color",i(e.ui.color.secondary.value))}function r(t){if(!t.empty()){var r=0===e.icon.back.value.indexOf("fa-")?" fa "+e.icon.back.value:"";r="d3plus_drop_back"+r;var n=0===e.icon.back.value.indexOf("fa-")?"":e.icon.back.value;t.style("position","absolute").attr("class",r).style("top",e.ui.padding.top+e.font.secondary.size/2/2.5+"px").html(n)}}function s(t){var r=u?e.focus.value:e.format.locale.value.ui.back;t.text(e.format.value(r)).style("padding","0px "+(e.ui.padding.left+e.ui.padding.right)+"px")}if(e.open.value){e.dev.value&&o.time("creating title and back button");var l=1===e.id.solo.value.length&&e.depth.value>0,u=l,c=e.container.button.data(Object).viz[0];u=!0;for(var f=0;f<e.id.nesting.length;f++){var d=e.id.nesting[f];if(d in c&&c[d]===e.focus.value){u=!1;break}}e.container.title=e.container.selector.selectAll("div.d3plus_drop_title").data(l?["title"]:[]),e.draw.timing?(e.container.title.transition().duration(e.draw.timing).call(t),e.container.title.select("div.d3plus_drop_title_text").transition().duration(e.draw.timing).call(s)):(e.container.title.call(t),e.container.title.select("div.d3plus_drop_title_text").call(s)),e.container.title.select("span.d3plus_drop_back").call(r);var p=e.container.title.enter().insert("div","#d3plus_drop_list_"+e.container.id).attr("class","d3plus_drop_title").attr("id","d3plus_drop_title_"+e.container.id).call(t);

p.append("span").attr("id","d3plus_drop_back_"+e.container.id).attr("class","d3plus_drop_back").call(r),p.append("div").attr("id","d3plus_drop_title_text_"+e.container.id).attr("class","d3plus_drop_title_text").call(s),e.container.title.on(n.over,function(t,r){var n=a(e.ui.color.secondary.value);d3.select(this).style("cursor","pointer").transition().duration(e.timing.mouseevents).style("background-color",n).style("color",i(n))}).on(n.out,function(t){var r=e.ui.color.secondary.value;d3.select(this).style("cursor","auto").transition().duration(e.timing.mouseevents).style("background-color",r).style("color",i(r))}).on(n.click,function(t){e.history.back()}),e.container.title.exit().remove(),l&&(e.margin.title+=e.container.title.node().offsetHeight||e.container.title.node().getBoundingClientRect().height),e.dev.value&&o.timeEnd("creating title and back button")}}},{"../../../../client/pointer.coffee":40,"../../../../color/lighter.coffee":46,"../../../../color/text.coffee":51,"../../../../core/console/print.coffee":53}],155:[function(e,t,r){var n=e("./items.coffee"),a=e("./height.js"),o=e("../../../../core/console/print.coffee"),i=e("./scroll.js"),s=e("./arrow.js");t.exports=function(e){function t(t){var r=e.open.flipped.value;t.style("top",function(){return r?"auto":e.margin.top-e.ui.border+"px"}).style("bottom",function(){return r?e.margin.top+e.ui.border+"px":"auto"})}function r(r){r.style("left",function(){return"left"===e.font.align.value?e.margin.left+"px":"center"===e.font.align.value?e.margin.left-(e.width.secondary-e.width.value)/2+"px":"auto"}).style("right",function(){return"right"===e.font.align.value?"0px":"auto"}).style("height",e.container.listHeight+"px").style("padding",e.ui.border+"px").style("background-color",e.ui.color.secondary.value).style("z-index",function(){return e.open.value?"9999":"-1"}).style("width",e.width.secondary-2*e.ui.border+"px").style("opacity",e.open.value?1:0).call(t)}function l(r){r.style("display",e.open.value?null:"none").call(t),e.search.enabled&&e.open.value&&e.container.selector.select("div.d3plus_drop_search input").node().focus()}function u(e){return function(){var t=d3.interpolateNumber(this.scrollTop,e);return function(e){this.scrollTop=t(e)}}}e.draw.timing?e.container.ui.transition().duration(e.draw.timing).each("start",function(){e.open.value&&d3.select(this).style("z-index",9999)}).style("margin",e.ui.margin.css).each("end",function(){e.open.value||d3.select(this).style("z-index","auto")}):e.container.ui.style("margin",e.ui.margin.css).style("z-index",function(){return e.open.value?9999:"auto"}),n(e),a(e),i(e),s(e),e.dev.value&&o.time("drawing list");var c=e.open.value?e.height.secondary-e.margin.title:0;e.draw.timing?(e.container.selector.transition().duration(e.draw.timing).each("start",function(){d3.select(this).style("display",e.open.value?"block":null)}).call(r).each("end",function(){d3.select(this).transition().duration(e.draw.timing).call(l)}),e.container.list.transition().duration(e.draw.timing).style("width",e.width.secondary-2*e.ui.border+"px").style("max-height",c+"px").tween("scroll",u(e.container.listScroll))):(e.container.selector.call(r).call(l),e.container.list.style("width",e.width.secondary-2*e.ui.border+"px").style("max-height",c+"px").property("scrollTop",e.container.listScroll)),e.dev.value&&o.timeEnd("drawing list")}},{"../../../../core/console/print.coffee":53,"./arrow.js":143,"./height.js":147,"./items.coffee":148,"./scroll.js":151}],156:[function(e,t,r){var n=e("../../../../util/copy.coffee"),a=e("../../../../core/font/tester.coffee"),o=e("../../../form.js"),i=e("../../../../core/console/print.coffee"),s=e("../../../../object/validate.coffee");t.exports=function(e){function t(t){var n="primary"===t?"value":t,s="value"===n?e.icon.drop.value:e.icon.select.value||e.icon.drop.value,l="value"===n?e.text.value:e.text.secondary.value||e.text.value,u="value"===n?e.font:e.font.secondary;e.dev.value&&i.time("calculating "+t+" width");var c=o().container(a()).data({large:9999,value:r}).draw({update:!1}).font(u).icon({button:s,value:e.icon.value}).id(e.id.value).timing({ui:0}).text(l||e.id.value).type("button").ui({border:"primary"===t?e.ui.border:0,display:"inline-block",margin:0,padding:e.ui.padding.css}).width(!1).draw(),f=[];c.selectAll("div.d3plus_node").each(function(e){f.push(this.offsetWidth+1)}).remove();var d={};d[n]=d3.max(f),e.self.width(d),e.dev.value&&i.timeEnd("calculating "+t+" width")}var r=[];for(var l in e.data.nested.all){var u=e.data.nested.all[l],c=s(e.text.nesting)&&l in e.text.nesting?e.text.nesting[l][0]:l;[e.id.value,e.text.value].indexOf(c)<0&&(u=n(u),u.forEach(function(t){t[e.text.value||e.id.value]=t[c]})),r=r.concat(u)}"number"!=typeof e.width.value&&t("primary"),"number"!=typeof e.width.secondary&&(e.text.secondary.value&&e.text.value!==e.text.secondary.value?t("secondary"):e.self.width({secondary:e.width.value}))}},{"../../../../core/console/print.coffee":53,"../../../../core/font/tester.coffee":69,"../../../../object/validate.coffee":171,"../../../../util/copy.coffee":206,"../../../form.js":103}],157:[function(e,t,r){var n=e("../../../../util/child.coffee"),a=function(e,t){if(void 0===t)var t=window;d3.select(t).on("click."+e.container.id,function(){var t=d3.event.target||d3.event.toElement,r=t.parentNode;r&&["d3plus_node","d3plus_drop_title"].indexOf(r.className)>=0&&(t=r.parentNode),t&&r&&!n(e.container.ui,t)&&(e.open.value||e.hover.value)&&e.self.open(!1).hover(!1).draw()});try{var r=window.parent.location.host===window.location.host}catch(o){var r=!1}r&&t.self!==window.top&&a(e,t.parent)};t.exports=a},{"../../../../util/child.coffee":204}],158:[function(e,t,r){var n=e("../form.js");t.exports=function(e){"buttons"in e.container||(e.container.buttons=n().container(e.container.ui).type("button"));var t=e.data.viz.length,r=e.width.value?e.width.value/t:!1,a=e.container.ui.selectAll("div.d3plus_toggle").data(e.data.viz,function(t){return t[e.id.value]});a.enter().append("div").attr("class","d3plus_toggle").style("display","inline-block").style("vertical-align","top"),a.order().each(function(t){"form"in t.d3plus||(t.d3plus.form=n().container(d3.select(this)));var a=e.id.nesting.length>e.depth.value?e.id.nesting[e.depth.value+1]:e.id.value;t[a]instanceof Array?t.d3plus.form.container({id:e.container.id+"_"+t[e.id.value]}).data(t[a]).id(e.id.nesting.slice(1)).type("drop"):t.d3plus.form.data([t]).id(e.id.value).type("button"),t.d3plus.form.color(e.color).focus(e.focus.value,function(t){t!==e.focus.value&&e.self.focus(t).draw()}).hover(e.hover.value).icon({select:!1,value:e.icon.value}).font(e.font).format(e.format).order(e.order).text(e.text.value).ui({border:e.ui.border,color:e.ui.color,display:"inline-block",margin:0,padding:e.ui.padding.css}).width(r).draw()}),e.data.element.value&&e.data.element.value.on("focus."+e.container.id,function(){e.self.focus(this.value).hover(this.value).draw()}).on("blur."+e.container.id,function(){e.self.hover(!1).draw()})}},{"../form.js":103}],159:[function(e,t,r){var n,a,o,i,s,l,u,c,f,d,p,h;l=e("../core/console/print.coffee"),p=e("simplify-js"),t.exports=function(e,t){var r,a,i,u,c,d,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R,U,V,L,Y,H,X,G,J,W,Q,K,Z,$,ee,te,re,ne,ae,oe,ie,se,le,ue,ce,fe,de,pe,he,ve,ge,me,ye,xe,be,we;if(e.length<3)return l.error("polygon has to have at least 3 points"),null;if(_=[],g=.5,c=5,null==t&&(t={}),null==t.maxAspectRatio&&(t.maxAspectRatio=15),null==t.minWidth&&(t.minWidth=0),null==t.minHeight&&(t.minHeight=0),null==t.tolerance&&(t.tolerance=.02),null==t.nTries&&(t.nTries=20),null!=t.angle&&(t.angle instanceof Array?d=t.angle:"number"==typeof t.angle?d=[t.angle]:"string"!=typeof t.angle||isNaN(t.angle)||(d=[Number(t.angle)])),null==d&&(d=d3.range(-90,90+c,c)),null!=t.aspectRatio&&(t.aspectRatio instanceof Array?m=t.aspectRatio:"number"==typeof t.aspectRatio?m=[t.aspectRatio]:"string"!=typeof t.aspectRatio||isNaN(t.aspectRatio)||(m=[Number(t.aspectRatio)])),null!=t.origin&&t.origin instanceof Array&&(Q=t.origin[0]instanceof Array?t.origin:[t.origin]),v=Math.abs(d3.geom.polygon(e).area()),0===v)return l.error("polygon has 0 area"),null;if(ne=d3.extent(e,function(e){return e[0]}),H=ne[0],R=ne[1],ae=d3.extent(e,function(e){return e[1]}),X=ae[0],U=ae[1],me=Math.min(R-H,U-X)*t.tolerance,ge=function(){var t,r,n;for(n=[],t=0,r=e.length;r>t;t++)K=e[t],n.push({x:K[0],y:K[1]});return n}(),me>0&&(ge=p(ge,me),e=function(){var e,t,r;for(r=[],e=0,t=ge.length;t>e;e++)K=ge[e],r.push([K.x,K.y]);return r}()),t.vdebug&&_.push({type:"simplify",poly:e}),oe=d3.extent(e,function(e){return e[0]}),H=oe[0],R=oe[1],ie=d3.extent(e,function(e){return e[1]}),X=ie[0],U=ie[1],y=[[H,X],[R,X],[R,U],[H,U]],se=[R-H,U-X],b=se[0],x=se[1],xe=Math.min(b,x)/50,null==Q)for(Q=[],w=d3.geom.polygon(e).centroid(),o(w,e)&&Q.push(w);Q.length<t.nTries;)he=Math.random()*b+H,ve=Math.random()*x+X,pe=[he,ve],o(pe,e)&&Q.push(pe);for(t.vdebug&&_.push({type:"origins",points:Q}),I=0,q=null,j=0,S=d.length;S>j;j++)for(i=d[j],u=-i*Math.PI/180,t.vdebug&&_.push({type:"angle",angle:i}),z=M=0,F=Q.length;F>M;z=++M)for(J=Q[z],le=n(e,J,u),$=le[0],te=le[1],ue=n(e,J,u+Math.PI/2),Z=ue[0],ee=ue[1],G=[],null!=$&&null!=te&&G.push([($[0]+te[0])/2,($[1]+te[1])/2]),null!=Z&&null!=ee&&G.push([(Z[0]+ee[0])/2,(Z[1]+ee[1])/2]),t.vdebug&&_.push({type:"modifOrigin",idx:z,p1W:$,p2W:te,p1H:Z,p2H:ee,modifOrigins:G}),E=0,T=G.length;T>E;E++)if(W=G[E],t.vdebug&&_.push({type:"origin",cx:W[0],cy:W[1]}),ce=n(e,W,u),$=ce[0],te=ce[1],null!==$&&null!==te&&(Y=Math.min(h(W,$),h(W,te)),D=2*Math.sqrt(Y),fe=n(e,W,u+Math.PI/2),Z=fe[0],ee=fe[1],null!==Z&&null!==ee&&(L=Math.min(h(W,Z),h(W,ee)),P=2*Math.sqrt(L),!(I>D*P))))for(null!=m?a=m:(V=Math.max(1,t.minWidth/P,I/(P*P)),N=Math.min(t.maxAspectRatio,D/t.minHeight,D*D/I),a=d3.range(V,N+g,g)),C=0,B=a.length;B>C;C++)if(r=a[C],O=Math.max(t.minWidth,Math.sqrt(I*r)),de=Math.min(D,P*r),!(I>de*P))for(de-O>=xe&&t.vdebug&&_.push({type:"aRatio",aRatio:r});de-O>=xe;)ye=(O+de)/2,k=ye/r,be=W[0],we=W[1],re=[[be-ye/2,we-k/2],[be+ye/2,we-k/2],[be+ye/2,we+k/2],[be-ye/2,we+k/2]],re=f(re,u,W),s(re,e)?(A=!0,I=ye*k,q={cx:be,cy:we,width:ye,height:k,angle:i},O=ye):(A=!1,de=ye),t.vdebug&&_.push({type:"rectangle",cx:be,cy:we,width:ye,height:k,areaFraction:ye*k/v,angle:i,insidePoly:A});return[q,I,_]},h=function(e,t){var r,n;return r=t[0]-e[0],n=t[1]-e[1],r*r+n*n},u=function(e,t,r){var n,a,o,i,s;return s=t[1]<r[1]?[t,r]:[r,t],n=s[0],a=s[1],(e[1]===a[1]||e[1]===n[1])&&(e[1]+=Number.MIN_VALUE),e[1]>a[1]||e[1]<n[1]?!1:e[0]>n[0]&&e[0]>a[0]?!1:e[0]<n[0]&&e[0]<a[0]?!0:(o=(a[1]-n[1])/(a[0]-n[0]),i=(e[1]-n[1])/(e[0]-n[0]),i>o)},o=function(e,t){var r,n,a,o,i;for(o=-1,i=t.length,n=t[i-1],a=0;++o<i;)r=n,n=t[o],u(e,r,n)&&a++;return a%2!==0},i=function(e,t,r){var n,a,o;return n=1e-9,a=e[0],o=e[1],a<Math.min(t[0],r[0])-n||a>Math.max(t[0],r[0])+n||o<Math.min(t[1],r[1])-n||o>Math.max(t[1],r[1])+n?!1:!0},a=function(e,t,r,n){var a,o,i,s,l,u,c,f,d,p;return f=1e-9,s=e[0]-t[0],u=e[1]-t[1],l=r[0]-n[0],c=r[1]-n[1],i=s*c-u*l,Math.abs(i)<f?null:(a=e[0]*t[1]-e[1]*t[0],o=r[0]*n[1]-r[1]*n[0],d=(a*l-o*s)/i,p=(a*c-o*u)/i,[d,p])},d=function(e,t,r,n){var o;return o=a(e,t,r,n),null==o?!1:i(o,e,t)&&i(o,r,n)},s=function(e,t){var r,n,a,i,s,l,u,c;for(s=-1,u=e.length,c=t.length,a=e[u-1];++s<u;)for(r=a,a=e[s],l=-1,i=t[c-1];++l<c;)if(n=i,i=t[l],d(r,a,n,i))return!1;return o(e[0],t)},c=function(e,t,r){var n,a,o,i;return null==r&&(r=[0,0]),o=e[0]-r[0],i=e[1]-r[1],n=Math.cos(t),a=Math.sin(t),[n*o-a*i+r[0],a*o+n*i+r[1]]},f=function(e,t,r){var n,a,o,i;for(i=[],n=0,a=e.length;a>n;n++)o=e[n],i.push(c(o,t,r));return i},n=function(e,t,r){var n,o,s,l,u,c,f,d,p,v,g,m,y,x,b;for(u=1e-9,t=[t[0]+u*Math.cos(r),t[1]+u*Math.sin(r)],x=t[0],b=t[1],m=[x+Math.cos(r),b+Math.sin(r)],f=0,Math.abs(m[0]-x)<u&&(f=1),c=-1,v=e.length,o=e[v-1],d=Number.MAX_VALUE,p=Number.MAX_VALUE,s=null,l=null;++c<v;)n=o,o=e[c],g=a(t,m,n,o),null!=g&&i(g,n,o)&&(y=h(t,g),g[f]<t[f]?d>y&&(d=y,s=g):g[f]>t[f]&&p>y&&(p=y,l=g));return[s,l]}},{"../core/console/print.coffee":53,"simplify-js":8}],160:[function(e,t,r){t.exports=function(e,t,r){var n,a,o,i;return a={x:0,y:0},0>e&&(e=2*Math.PI+e),"square"===r?(o=45*(Math.PI/180),e<=Math.PI?e<Math.PI/2?o>e?(a.x+=t,i=Math.tan(e)*t,a.y+=i):(a.y+=t,n=t/Math.tan(e),a.x+=n):e<Math.PI-o?(a.y+=t,n=t/Math.tan(Math.PI-e),a.x-=n):(a.x-=t,i=Math.tan(Math.PI-e)*t,a.y+=i):e<3*Math.PI/2?e<o+Math.PI?(a.x-=t,i=Math.tan(e-Math.PI)*t,a.y-=i):(a.y-=t,n=t/Math.tan(e-Math.PI),a.x-=n):e<2*Math.PI-o?(a.y-=t,n=t/Math.tan(2*Math.PI-e),a.x+=n):(a.x+=t,i=Math.tan(2*Math.PI-e)*t,a.y-=i)):(a.x+=t*Math.cos(e),a.y+=t*Math.sin(e)),a}},{}],161:[function(e,t,r){var n;n=e("../geom/offset.coffee"),t.exports=function(e){var t,r,a,o,i,s,l,u,c,f,d,p,h,v,g,m;for(e=e.slice(1).slice(0,-1).split(/L|A/),f=[],a=0,i=e.length;i>a;a++)if(c=e[a],c=c.split(" "),1===c.length)f.push(c[0].split(",").map(function(e){return parseFloat(e)}));else{for(d=f[f.length-1],o=c.pop().split(",").map(function(e){return parseFloat(e)}),p=parseFloat(c.shift().split(",")[0]),m=Math.sqrt(Math.pow(o[0]-d[0],2)+Math.pow(o[1]-d[1],2)),t=Math.acos((p*p+p*p-m*m)/(2*p*p)),u="1"===c[1].split(",")[0],u&&(t=2*Math.PI-t),s=t/(2*Math.PI)*p*Math.PI*2,h=s/5,v=Math.atan2(-d[1],-d[0])-Math.PI,g=t/h,r=g;t>r;)l=n(v+r,p),f.push([l.x,l.y]),r+=g;f.push(o)}return f}},{"../geom/offset.coffee":160}],162:[function(e,t,r){var n,a,o;n={},"undefined"!=typeof window&&(window.d3plus=n),t.exports=n,n.version="1.7.4 - Viridian",n.repo="https://github.com/alexandersimoes/d3plus/",n.array={comparator:e("./array/comparator.coffee"),contains:e("./array/contains.coffee"),sort:e("./array/sort.coffee"),update:e("./array/update.coffee")},n.client={css:e("./client/css.coffee"),ie:e("./client/ie.js"),pointer:e("./client/pointer.coffee"),prefix:e("./client/prefix.coffee"),rtl:e("./client/rtl.coffee"),scrollbar:e("./client/scrollbar.coffee"),touch:e("./client/touch.coffee")},n.color={legible:e("./color/legible.coffee"),lighter:e("./color/lighter.coffee"),mix:e("./color/mix.coffee"),random:e("./color/random.coffee"),scale:e("./color/scale.coffee"),sort:e("./color/sort.coffee"),text:e("./color/text.coffee"),validate:e("./color/validate.coffee")},n.data={bestRegress:e("./data/bestRegress.coffee"),lof:e("./data/lof.coffee"),mad:e("./data/mad.coffee")},n.font={sizes:e("./font/sizes.coffee"),validate:e("./font/validate.coffee")},n.form=e("./form/form.js"),n.geom={largestRect:e("./geom/largestRect.coffee"),offset:e("./geom/offset.coffee"),path2poly:e("./geom/path2poly.coffee")},n.network={cluster:e("./network/cluster.coffee"),distance:e("./network/distance.coffee"),normalize:e("./network/normalize.coffee"),shortestPath:e("./network/shortestPath.coffee"),smallestGap:e("./network/smallestGap.coffee"),subgraph:e("./network/subgraph.coffee")},n.number={format:e("./number/format.coffee")},n.object={merge:e("./object/merge.coffee"),validate:e("./object/validate.coffee")},n.string={format:e("./string/format.js"),list:e("./string/list.coffee"),strip:e("./string/strip.js"),title:e("./string/title.coffee")},n.textwrap=e("./textwrap/textwrap.coffee"),n.tooltip={create:e("./tooltip/create.js"),move:e("./tooltip/move.coffee"),remove:e("./tooltip/remove.coffee")},n.util={buckets:e("./util/buckets.coffee"),child:e("./util/child.coffee"),closest:e("./util/closest.coffee"),copy:e("./util/copy.coffee"),d3selection:e("./util/d3selection.coffee"),dataurl:e("./util/dataURL.coffee"),uniques:e("./util/uniques.coffee")},n.viz=e("./viz/viz.coffee"),o=e("./client/css.coffee"),a=e("./core/console/print.coffee"),o("d3plus.css")&&a.warning("d3plus.css has been deprecated, you do not need to load this file.",n.repo+"releases/tag/v1.4.0")},{"./array/comparator.coffee":34,"./array/contains.coffee":35,"./array/sort.coffee":36,"./array/update.coffee":37,"./client/css.coffee":38,"./client/ie.js":39,"./client/pointer.coffee":40,"./client/prefix.coffee":41,"./client/rtl.coffee":42,"./client/scrollbar.coffee":43,"./client/touch.coffee":44,"./color/legible.coffee":45,"./color/lighter.coffee":46,"./color/mix.coffee":47,"./color/random.coffee":48,"./color/scale.coffee":49,"./color/sort.coffee":50,"./color/text.coffee":51,"./color/validate.coffee":52,"./core/console/print.coffee":53,"./data/bestRegress.coffee":98,"./data/lof.coffee":99,"./data/mad.coffee":100,"./font/sizes.coffee":101,"./font/validate.coffee":102,"./form/form.js":103,"./geom/largestRect.coffee":159,"./geom/offset.coffee":160,"./geom/path2poly.coffee":161,"./network/cluster.coffee":163,"./network/distance.coffee":164,"./network/normalize.coffee":165,"./network/shortestPath.coffee":166,"./network/smallestGap.coffee":167,"./network/subgraph.coffee":168,"./number/format.coffee":169,"./object/merge.coffee":170,"./object/validate.coffee":171,"./string/format.js":172,"./string/list.coffee":173,"./string/strip.js":174,"./string/title.coffee":175,"./textwrap/textwrap.coffee":199,"./tooltip/create.js":200,"./tooltip/move.coffee":201,"./tooltip/remove.coffee":202,"./util/buckets.coffee":203,"./util/child.coffee":204,"./util/closest.coffee":205,"./util/copy.coffee":206,"./util/d3selection.coffee":207,"./util/dataURL.coffee":208,"./util/uniques.coffee":209,"./viz/viz.coffee":324}],163:[function(e,t,r){var n;n=e("./normalize.coffee"),t.exports=function(e,t){var r,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C;if(v=[],null==t&&(t={}),(null==t.nodes||"object"!=typeof t.nodes)&&(F=n(e,t),e=F[0],t=F[1],null===t))return null;d=t.distance,E=t.nodeid,C=t.startpoint,h=t.endpoint,O=t.nodes,S={};for(m in O)S[m]={node:O[m].node,degree:0};for(z=0,k={},g=0,w=e.length;w>g;g++)p=e[g],a=E(C(p)),o=E(h(p)),a in k||(k[a]={}),o in k||(k[o]={}),o in k[a]||(k[a][o]=0,k[o][a]=0,z++,S[a].degree+=1,S[o].degree+=1);u={},r=0;for(m in S)M=S[m],u[m]={score:M.degree/(2*z),nodes:[m]};for(a in k)for(o in k[a])k[a][o]=1/(2*z)-S[a].degree*S[o].degree/(4*z*z);for(y=0;1e3>y;){f=-1,A=void 0,j=void 0;for(a in k)for(o in k[a])k[a][o]>f&&(f=k[a][o],A=a,j=o);if(0>f)break;for(b in k[A])b!==j&&(b in k[j]?k[j][b]+=k[A][b]:k[j][b]=k[A][b]-2*u[j].score*u[b].score,k[b][j]=k[j][b]),delete k[b][A];for(b in k[j])b in k[A]||b===j||(k[j][b]-=2*u[A].score*u[b].score,k[b][j]=k[j][b]);for(T=u[A].nodes,x=0,_=T.length;_>x;x++)M=T[x],u[j].nodes.push(M);u[j].score+=u[A].score,t.vdebug&&v.push({type:"merge",father:j,child:A,nodes:u[j].nodes}),delete u[A],delete k[A],r+=f,y++}return l=function(){var e;e=[];for(i in u)c=u[i],e.push([i,c.nodes.length]);return e}(),l.sort(function(e,t){return t[1]-e[1]}),B=function(){var e,t,r;for(r=[],e=0,t=l.length;t>e;e++)s=l[e],r.push(u[s[0]].nodes);return r}(),[B,v]}},{"./normalize.coffee":165}],164:[function(e,t,r){t.exports=function(e,t){var r,n;return e instanceof Array||(e=[e.x,e.y]),t instanceof Array||(t=[t.x,t.y]),r=Math.abs(e[0]-t[0]),n=Math.abs(e[1]-t[1]),Math.sqrt(r*r+n*n)}},{}],165:[function(e,t,r){var n;n=e("../core/console/print.coffee"),t.exports=function(e,t){var r,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B;if(S=t.source,T=t.target,i=t.directed,s=t.distance,j=t.nodeid,F=t.startpoint,c=t.endpoint,r=t.K,B=t.vdebug,i||(i=!1),null==r&&(r=1),null==j?j=function(e){return e}:"string"==typeof j&&(j=function(e){return function(t){return t[e]}}(j)),null!=S&&"object"==typeof S&&(S=j(S)),null!=T&&"object"==typeof T&&(T=j(T)),null==F?F=function(e){return e.source}:"string"==typeof F&&(F=function(e){return function(t){return t[e]}}(F)),null==c?c=function(e){return e.target}:"string"==typeof c&&(c=function(e){return function(t){return t[e]}}(c)),null==s)s=function(e){return 1};else if("number"==typeof s)s=function(e){return function(t){return e}}(s);else if("string"==typeof s)s=function(e){return function(t){return t[e]}}(s);else if(s instanceof Array){for(u={},d=m=0,b=e.length;b>m;d=++m)l=e[d],a=j(F(l)),o=j(c(l)),u[a+"_"+o]=s[d];s=function(e){return a=j(F(e)),o=j(c(e)),u[a+"_"+o]}}for(M={},y=0,w=e.length;w>y;y++){for(l=e[y],z=F(l),A=c(l),v=j(z),g=j(A),E=[z,A],x=0,_=E.length;_>x;x++)k=E[x],p=j(k),p in M||(M[p]={node:k,outedges:[]});M[v].outedges.push(l),i||M[g].outedges.push(l)}return f=null,0===e.length?f="The length of edges is 0":0>r?f="K can not have negative value":null==s(e[0])?f="Check the distance function/attribute":null==F(e[0])?f="Check the startpoint function/attribute":null==c(e[0])?f="Check the endpoint function/attribute":(h=j(F(e[0])),null==h||"string"!=(O=typeof h)&&"number"!==O?f="Check the nodeid function/attribute":null==S||S in M?null==T||T in M||(f="The target is not in the graph"):f="The source is not in the graph"),null!=f?(n.error(f),null):[e,{source:S,target:T,directed:i,distance:s,nodeid:j,startpoint:F,endpoint:c,K:r,nodes:M,vdebug:B}]}},{"../core/console/print.coffee":53}],166:[function(e,t,r){var n,a;n=e("heap"),a=e("./normalize.coffee"),t.exports=function(e,t,r){var o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B;if(null==r&&(r={}),r.source=t,(null==r.nodes||"object"!=typeof r.nodes)&&(A=a(e,r),e=A[0],r=A[1],null===r))return null;t=r.source,F=r.target,u=r.directed,c=r.distance,_=r.nodeid,S=r.startpoint,d=r.endpoint,o=r.K,k=r.nodes;for(g in k)w=k[g],w.count=0;for(h=new n(function(e,t){return e.distance-t.distance}),B={},null==F&&(B[t]=!0),h.push({edge:null,target:t,distance:0}),b=0,O=[];!h.empty()&&(b=Math.max(b,h.size()),z=h.pop(),T=z.target,k[T].count++,null==F?O.push(z):T===F&&O.push(z),O.length!==o);)if(k[T].count<=o)for(j=k[T].outedges,v=0,y=j.length;y>v;v++){if(f=j[v],i=_(S(f)),l=_(d(f)),u||l!==T||(M=[l,i],i=M[0],l=M[1]),null==F){if(B[l])continue;B[l]=!0}s=z.distance+c(f),h.push({edge:f,previous:z,target:l,distance:s})}for(p=function(t){for(e=[];null!=t.edge;)e.push(t.edge),t=t.previous;return e.reverse()},m=0,x=O.length;x>m;m++)E=O[m],null!=F&&(delete E.target,E.edges=p(E)),delete E.edge,delete E.previous;return O}},{"./normalize.coffee":165,heap:5}],167:[function(e,t,r){var n;n=e("./distance.coffee"),t.exports=function(e,t){var r,a;return t||(t={}),r=[],a=d3.geom.quadtree().x(function(e){return t.accessor?t.accessor(e)[0]:e[0]}).y(function(e){return t.accessor?t.accessor(e)[1]:e[1]}),a(e).visit(function(e){var a,o,i,s,l,u,c,f;if(!e.leaf)for(c=e.nodes,a=0,i=c.length;i>a;a++)if(l=c[a],l&&l.point)if(t.origin)r.push(n(l,t));else for(f=e.nodes,o=0,s=f.length;s>o;o++)u=f[o],u&&u.point&&u.point!==l.point&&r.push(n(l,u));return!1}),t.all?r.sort(function(e,t){return e-t}):d3.min(r)}},{"./distance.coffee":164}],168:[function(e,t,r){var n;n=e("./normalize.coffee"),t.exports=function(e,t,r){var a,o,i,s,l,u,c,f,d,p,h,v;return null==r&&(r={}),r.source=t,null!=r.nodes&&"object"==typeof r.nodes||(p=n(e,r),e=p[0],r=p[1],null!==r)?(t=r.source,i=r.directed,s=r.distance,f=r.nodeid,h=r.startpoint,u=r.endpoint,a=r.K,d=r.nodes,v={},v[t]=!0,o=function(e,t){var r,n,l,c,p,g,m,y,x;for(m=d[e].outedges,x=[],c=0,p=m.length;p>c;c++)l=m[c],r=f(h(l)),n=f(u(l)),i||n!==e||(y=[n,r],r=y[0],n=y[1]),n in v?x.push(void 0):(g=t+s(l),a>=g?(v[n]=!0,x.push(o(n,g))):x.push(void 0));return x},o(t,0),{nodes:function(){var e;e=[];for(c in v)e.push(d[c].node);return e}(),edges:function(){var t,r,n;for(n=[],t=0,r=e.length;r>t;t++)l=e[t],f(h(l))in v&&f(u(l))in v&&n.push(l);return n}()}):null}},{"./normalize.coffee":165}],169:[function(e,t,r){var n;n=e("../core/locale/languages/en_US.coffee"),t.exports=function(e,t){var r,a,o,i,s,l,u,c,f,d,p,h;return t||(t={}),l="locale"in t?t.locale:n,d=l.time.slice(),a=d3.locale(l.format),t||(t={}),p=t.vars||{},o=t.key,i="labels"in t?t.labels:!0,s=e.toString().split(".")[0].length,p.time&&p.time.value&&d.push(p.time.value),"string"==typeof o&&d.indexOf(o.toLowerCase())>=0?u=e:"share"===o?(u=0===e?0:e>=100?a.numberFormat(",f")(e):e>99?a.numberFormat(".3g")(e):a.numberFormat(".2g")(e),u+="%"):10>e&&e>-10?(s=e.toString().split("."),c=1,s.length>1&&(c=d3.min([parseFloat(s[1]).toString().length,2]),e>-1&&1>e||(h=s[1].length-parseFloat(s[1]).toString().length,c+=1+h)),u=a.numberFormat("."+c+"g")(e)):s>3?(f=d3.formatPrefix(e).symbol,f=f.replace("G","B"),e=d3.formatPrefix(e).scale(e),e=a.numberFormat(".3g")(e),e=e.replace(l.format.decimal,"."),e=parseFloat(e)+"",e=e.replace(".",l.format.decimal),u=e+f):u=3===s?a.numberFormat(",f")(e):0===e?0:e===parseInt(e,10)?a.numberFormat(".2")(e):a.numberFormat(".3g")(e),i&&o&&"format"in p&&o in p.format.affixes.value?(r=p.format.affixes.value[o],r[0]+u+r[1]):u}},{"../core/locale/languages/en_US.coffee":70}],170:[function(e,t,r){var n,a;n=e("../util/d3selection.coffee"),a=e("./validate.coffee"),t.exports=function(e,t){var r,o;return r=function(e,t,o){var i,s,l;s=[];for(i in e)l=e[i],"undefined"!=typeof l?!o&&a(l)?("object"!=typeof t[i]&&(t[i]={}),s.push(r(l,t[i],0===i.indexOf("d3plus")))):s.push(!n(l)&&l instanceof Array?t[i]=l.slice(0):t[i]=l):s.push(void 0);return s},o={},e&&r(e,o),t&&r(t,o),o}},{"../util/d3selection.coffee":207,"./validate.coffee":171}],171:[function(e,t,r){t.exports=function(e){return e&&e.constructor===Object}},{}],172:[function(e,t,r){t.exports=function(){var e=Array.prototype.slice.call(arguments),t=e.shift();return t.unkeyed_index=0,t.replace(/\{(\w*)\}/g,function(r,n){if(""===n&&(n=t.unkeyed_index,t.unkeyed_index++),n==+n)return"undefined"!==e[n]?e[n]:r;for(var a=0;a<e.length;a++)if("object"==typeof e[a]&&"undefined"!=typeof e[a][n])return e[a][n];return r}.bind(t))}},{}],173:[function(e,t,r){var n,a;n=e("./format.js"),a=e("../core/locale/languages/en_US.coffee").ui,t.exports=function(e,t,r,o){var i;return e instanceof Array?(e=e.slice(0),t||(t=a.and),o||(o=a.moreText),2===e.length?e.join(" "+t+" "):(r&&e.length>r&&(i=e.length-r+1,e=e.slice(0,r-1),e[r-1]=n(o,i)),e.length>1&&(e[e.length-1]=t+" "+e[e.length-1]),e.join(", "))):e}},{"../core/locale/languages/en_US.coffee":70,"./format.js":172}],174:[function(e,t,r){t.exports=function(e){var t=["!","@","#","$","%","^","&","*","(",")","[","]","{","}",".",",","/","\\","|","'",'"',";",":","<",">","?","=","+"],r=[[/[\300-\306]/g,"A"],[/[\340-\346]/g,"a"],[/[\310-\313]/g,"E"],[/[\350-\353]/g,"e"],[/[\314-\317]/g,"I"],[/[\354-\357]/g,"i"],[/[\322-\330]/g,"O"],[/[\362-\370]/g,"o"],[/[\331-\334]/g,"U"],[/[\371-\374]/g,"u"],[/[\321]/g,"N"],[/[\361]/g,"n"],[/[\307]/g,"C"],[/[\347]/g,"c"]];return e+="",""+e.replace(/[^A-Za-z0-9\-_]/g,function(e){if(" "===e)return"_";if(t.indexOf(e)>=0)return"";for(var n=e,a=0;a<r.length;a++)if(new RegExp(r[a][0]).test(e)){n=r[a][1];break}return n})}},{}],175:[function(e,t,r){var n;n=e("../core/locale/languages/en_US.coffee"),t.exports=function(e,t){var r,a,o,i,s;return e?(t||(t={}),o=t.key,"."===e.charAt(e.length-1)?e.charAt(0).toUpperCase()+e.substr(1):(i="locale"in this?this.locale.value:n,s=i.lowercase.map(function(e){return e.toLowerCase()}),a=i.uppercase,a=a.concat(a.map(function(e){return e+"s"})),r=a.map(function(e){return e.toLowerCase()}),e.replace(/[^\s!-#%-\x2A,-\/:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]*/g,function(t,n){var o,i;return t?(o=r.indexOf(t.toLowerCase()),i=o>=0?a[o]:s.indexOf(t.toLowerCase())>=0&&0!==n&&n!==e.length-1?t.toLowerCase():t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()):""}))):""}},{"../core/locale/languages/en_US.coffee":70}],176:[function(e,t,r){var n,a;n=e("./foreign.coffee"),a=e("./tspan.coffee"),t.exports=function(e){e.text.html.value?n(e):a(e)}},{"./foreign.coffee":177,"./tspan.coffee":180}],177:[function(e,t,r){t.exports=function(e){var t,r,n,a,o;o=e.container.value,n=o.attr("font-family")||o.style("font-family"),t=e.align.value||o.attr("text-anchor")||o.style("text-anchor"),r=o.attr("fill")||o.style("fill"),a=o.attr("opacity")||o.style("opacity"),t="end"===t?"right":"middle"===t?"center":"left",d3.select(o.node().parentNode).append("foreignObject").attr("width",e.width.value+"px").attr("height",e.height.value+"px").attr("x","0px").attr("y","0px").append("xhtml:div").style("font-family",n).style("font-size",e.size.value[1]+"px").style("color",r).style("text-align",t).style("opacity",a).text(e.text.current)}},{}],178:[function(e,t,r){t.exports=function(e){var t,r,n,a,o,i,s,l,u,c;return r=e.container.value,a=r.node().previousElementSibling,i=a?a.tagName.toLowerCase():"",a&&(a=d3.select(a)),e.container.x=e.x.value||parseFloat(r.attr("x"),10),e.container.y=e.y.value||parseFloat(r.attr("y"),10),a&&(e.shape.accepted.indexOf(i)>=0&&e.self.shape(i),"rect"===i?(u=parseFloat(a.attr("x"),10)||0,c=parseFloat(a.attr("y"),10)||0,e.padding.value===!1&&(t=Math.abs(u-e.container.x),t&&e.self.padding(t)),e.container.x||(e.container.x=u+e.padding.value),e.container.y||(e.container.y=c+e.padding.value),e.width.value||(l=parseFloat(a.attr("width")),e.self.width(l)),e.height.value||(n=parseFloat(a.attr("height")),e.self.height(n))):"circle"===i?(o=parseFloat(a.attr("r"),10),u=parseFloat(a.attr("cx"),10)||0,u-=o,c=parseFloat(a.attr("cy"),10)||0,c-=o,e.padding.value===!1&&(t=Math.abs(u-e.container.x),t&&e.self.padding(t)),e.container.x||(e.container.x=u+e.padding.value),e.container.y||(e.container.y=c+e.padding.value),e.width.value||e.self.width(2*o,10),e.height.value||e.self.height(2*o,10)):(e.width.value||e.self.width(500),e.height.value||e.self.height(500))),e.container.x||(e.container.x=0),e.container.y||(e.container.y=0),e.width.inner=e.width.value-2*e.padding.value,e.height.inner=e.height.value-2*e.padding.value,s=r.attr("font-size")||r.style("font-size"),s=parseFloat(s,10),e.container.fontSize=s,e.container.dy=parseFloat(r.attr("dy"),10),e.size.value?void 0:e.self.size(e.resize.value?[4,80]:[s/2,s])}},{}],179:[function(e,t,r){t.exports=function(e){var t;return e.text.value||(t=e.container.value.text(),t&&(t.indexOf("tspan")>=0&&(t.replace(/\<\/tspan\>\<tspan\>/g," "),t.replace(/\<\/tspan\>/g,""),t.replace(/\<tspan\>/g,"")),t=t.replace(/(\r\n|\n|\r)/gm,""),t=t.replace(/^\s+|\s+$/g,""),e.self.text(t))),e.text.phrases=e.text.value instanceof Array?e.text.value.filter(function(e){return["string","number"].indexOf(typeof e)>=0}):[e.text.value+""],e.align.value?void 0:e.container.align=e.container.value.style("text-anchor")||e.container.value.attr("text-anchor")}},{}],180:[function(e,t,r){t.exports=function(e){var t,r,n,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F;return d=function(t,a){var o;return t||(t=""),o=!v||a?e.container.value.append("tspan"):e.container.value.insert("tspan","tspan"),o.attr("x",O+"px").attr("dx",r+"px").attr("dy",n+"px").style("baseline-shift","0%").attr("dominant-baseline","alphabetic").text(t)},f=-90===e.rotate.value||90===e.rotate.value,j=f?e.height.inner:e.width.inner,s=f?e.width.inner:e.height.inner,t="circle"===e.shape.value?"middle":e.align.value||e.container.align||"start",r="end"===t?j:"middle"===t?j/2:0,A=e.valign.value||"top",O=e.container.x,o=e.resize.value?e.size.value[1]:e.container.fontSize||e.size.value[0],n=e.container.dy||1.1*o,_=null,h=null,M=null,v=!1,F=0,"circle"===e.shape.value&&("middle"===A?F=s/n%1*n/2:"end"===A&&(F=s/n%1*n)),e.container.value.attr("text-anchor",t).attr("font-size",o+"px").style("font-size",o+"px").attr("x",e.container.x).attr("y",e.container.y),
z=function(){return _.remove(),v?(l++,_=e.container.value.select("tspan")):(l--,_=d3.select(e.container.value.node().lastChild)),_.empty()?void 0:(M=_.text().match(/[^\s-]+-?/g),a())},u=function(){var t;return"circle"===e.shape.value?(t=(l-1)*n+F,t>s/2&&(t+=n),2*Math.sqrt(t*(2*(j/2)-t))):j},a=function(){var t,r;return M&&M.length?(r=M.pop(),t=r.charAt(r.length-1),1===r.length&&e.text.split.value.indexOf(r)>=0?a():(e.text.split.value.indexOf(t)>=0&&(r=r.substr(0,r.length-1)),_.text(M.join(" ")+" "+r+"..."),_.node().getComputedTextLength()>u()?a():void 0)):z()},p=function(t){var r,n,a;return r=_.text(),v?(a=e.text.current.charAt(e.text.current.length-h.length-1),n=" "===a?" ":"",h=t+n+h,_.text(t+n+r)):(a=e.text.current.charAt(h.length),n=" "===a?" ":"",h+=n+t,_.text(r+n+t)),_.node().getComputedTextLength()>u()?(_.text(r),_=d(t),v?l--:l++):void 0},w=1,l=null,c=null,E=function(){var t,r,a,o,i;for(e.container.value.selectAll("tspan").remove(),e.container.value.html(""),M=e.text.words.slice(0),v&&M.reverse(),h=M[0],_=d(M.shift(),!0),l=w,t=0,r=M.length;r>t;t++){if(i=M[t],l*n>s){z();break}for(p(i),o=!0;o;)a=e.text.current.charAt(h.length+1),o=e.text.split.value.indexOf(a)>=0,o&&p(a)}return l*n>s&&z(),c=Math.abs(l-w)+1},E(),c=l,"circle"===e.shape.value&&(b=s-c*n,b>n&&("middle"===A?(w=(b/n/2>>0)+1,E()):"bottom"===A&&(v=!0,w=s/n>>0,E()))),"top"===A?S=0:(i=c*n,S="middle"===A?s/2-i/2:s-i),S-=.2*n,k="translate(0,"+S+")",180===e.rotate.value||-180===e.rotate.value?(y=e.container.x+j/2,x=e.container.y+s/2):(g=e.rotate.value<0?j:s,y=e.container.x+g/2,x=e.container.y+g/2),m="rotate("+e.rotate.value+", "+y+", "+x+")",e.container.value.attr("transform",m+k)}},{}],181:[function(e,t,r){var n,a,o,i;n=e("./flow.coffee"),a=e("../../font/sizes.coffee"),i=function(e){var t;e.text.phrases.length&&(e.text.current=e.text.phrases.shift()+"",e.text.words=e.text.current.match(e.text["break"]),t=e.text.current.charAt(0),t!==e.text.words[0].charAt(0)&&(e.text.words[0]=t+e.text.words[0]),e.container.value.text(""),e.resize.value?o(e):n(e))},t.exports=i,o=function(e){var t,r,o,s,l,u,c,f,d,p,h,v,g,m,y,x,b;for(b=[],c=0;c<e.text.words.length;)t=c===e.text.words.length-1?"":" ",b.push(e.text.words[c]+t),c++;p=-90===e.rotate.value||90===e.rotate.value,y=p?e.height.inner:e.width.inner,l=p?e.width.inner:e.height.inner,h=Math.floor(e.size.value[1]),f="circle"===e.shape.value?.75*y:y,g=a(b,{"font-size":h+"px",parent:e.container.value}),d=d3.max(g,function(e){return e.width}),r=1.165+y/l*.11,m=d3.sum(g,function(t){var r;return r=e.container.dy||1.2*h,t.width*r})*r,s="circle"===e.shape.value?Math.PI*Math.pow(y/2,2):f*l,(d>f||m>s)&&(o=Math.sqrt(s/m),x=f/d,v=d3.min([o,x]),h=d3.max([e.size.value[0],Math.floor(h*v)])),u=Math.floor(.8*l),h>u&&(h=u),d*(h/e.size.value[1])<=f?(h!==e.size.value[1]&&e.self.size([e.size.value[0],h]),n(e)):i(e)}},{"../../font/sizes.coffee":101,"./flow.coffee":176}],182:[function(e,t,r){t.exports={accepted:[!1,"start","middle","end","left","center","right"],process:function(e){var t;return t=["left","center","right"].indexOf(e),t>=0&&(e=this.accepted[t+1]),e},value:!1}},{}],183:[function(e,t,r){t.exports={accepted:[Object],objectAccess:!1,process:function(e,t){var r,n;for(r in e)n=e[r],r in t.self&&t.self[r](n);return e},value:{}}},{}],184:[function(e,t,r){var n;n=e("../../util/d3selection.coffee"),t.exports={accepted:[!1,Array,Object,String],element:!1,id:"default",process:function(e){return e===!1?!1:n(e)?e:d3.select(e instanceof Array?e[0][0]:e)},value:!1}},{"../../util/d3selection.coffee":207}],185:[function(e,t,r){t.exports={accepted:[Boolean],value:!1}},{}],186:[function(e,t,r){var n,a;n=e("../../core/console/print.coffee"),a=e("../../string/format.js"),t.exports={accepted:[void 0],process:function(e,t){var r;return this.initialized===!1?e:(t.container.value===!1?(r=t.format.locale.value.dev.setContainer,n.warning(r,"container")):t.container.value.empty()?(r=t.format.locale.value.dev.noContainer,n.warning(a(r,'"'+t.container.value+'"'),"container")):(t.dev.value&&n.time("total draw time"),t.container.value.call(t.self)),e)},value:void 0}},{"../../core/console/print.coffee":53,"../../string/format.js":172}],187:[function(e,t,r){var n,a;n=e("../../core/locale/locale.coffee"),a=e("../../object/merge.coffee"),t.exports={accepted:[Function,String],locale:{accepted:function(){return d3.keys(n)},process:function(e){var t,r;return t="en_US",r=n[t],e!==t&&(r=a(r,n[e])),this.language=e,r},value:"en_US"},process:function(e,t){if(this.initialized&&"string"==typeof e)t.self.format({locale:e});else if("function"==typeof e)return e;return this.value},value:"en_US"}},{"../../core/locale/locale.coffee":78,"../../object/merge.coffee":170}],188:[function(e,t,r){t.exports={accepted:[!1,Number],value:!1}},{}],189:[function(e,t,r){t.exports={accepted:[!1,Number],value:!1}},{}],190:[function(e,t,r){t.exports={accepted:[Boolean],value:!1}},{}],191:[function(e,t,r){t.exports={accepted:[-180,-90,0,90,180],value:0}},{}],192:[function(e,t,r){t.exports={accepted:["circle","square"],value:!1}},{}],193:[function(e,t,r){t.exports={accepted:[Array,!1],value:!1}},{}],194:[function(e,t,r){t.exports={accepted:[!1,Array,Number,String],html:{accepted:[Boolean],value:!1},init:function(e){var t;return t=this.split.value,this["break"]=new RegExp("[^\\s\\"+t.join("\\")+"]+\\"+t.join("?\\")+"?","g"),!1},split:{accepted:[Array],value:["-","/",";",":","&"]}}},{}],195:[function(e,t,r){t.exports={accepted:[!1,"top","middle","bottom"],value:!1}},{}],196:[function(e,t,r){t.exports={accepted:[!1,Number],value:!1}},{}],197:[function(e,t,r){t.exports={accepted:[!1,Number],value:!1}},{}],198:[function(e,t,r){t.exports={accepted:[!1,Number],value:!1}},{}],199:[function(e,t,r){var n,a,o,i,s;n=e("../core/methods/attach.coffee"),o=e("./helpers/parseSize.coffee"),a=e("../core/console/print.coffee"),i=e("./helpers/parseText.coffee"),s=e("./helpers/wrap.coffee"),t.exports=function(){var t;return t={self:function(e){return e.each(function(){o(t),t.size.value[0]<=t.height.inner?(i(t),s(t)):t.container.value.html(""),t.dev.value&&a.timeEnd("total draw time")}),t.self}},n(t,{align:e("./methods/align.coffee"),config:e("./methods/config.coffee"),container:e("./methods/container.coffee"),dev:e("./methods/dev.coffee"),draw:e("./methods/draw.coffee"),format:e("./methods/format.coffee"),height:e("./methods/height.coffee"),padding:e("./methods/padding.coffee"),resize:e("./methods/resize.coffee"),rotate:e("./methods/rotate.coffee"),text:e("./methods/text.coffee"),shape:e("./methods/shape.coffee"),size:e("./methods/size.coffee"),valign:e("./methods/valign.coffee"),width:e("./methods/width.coffee"),x:e("./methods/x.coffee"),y:e("./methods/y.coffee")}),t.self}},{"../core/console/print.coffee":53,"../core/methods/attach.coffee":79,"./helpers/parseSize.coffee":178,"./helpers/parseText.coffee":179,"./helpers/wrap.coffee":181,"./methods/align.coffee":182,"./methods/config.coffee":183,"./methods/container.coffee":184,"./methods/dev.coffee":185,"./methods/draw.coffee":186,"./methods/format.coffee":187,"./methods/height.coffee":188,"./methods/padding.coffee":189,"./methods/resize.coffee":190,"./methods/rotate.coffee":191,"./methods/shape.coffee":192,"./methods/size.coffee":193,"./methods/text.coffee":194,"./methods/valign.coffee":195,"./methods/width.coffee":196,"./methods/x.coffee":197,"./methods/y.coffee":198}],200:[function(e,t,r){function n(){d3.selectAll("div.d3plus_tooltip_data_desc").style("height","0px"),d3.selectAll("div.d3plus_tooltip_data_help").style("background-color","#ccc")}var a=e("../core/locale/languages/en_US.coffee"),o=e("../client/pointer.coffee"),i=e("../color/legible.coffee"),s=e("./move.coffee"),l=e("../client/prefix.coffee"),u=e("../client/rtl.coffee"),c=e("./remove.coffee"),f=e("../string/list.coffee"),d=e("../color/text.coffee");t.exports=function(e){var t=e.fullscreen?250:200,r=l();e.width=e.width||t,e.max_width=e.max_width||386,e.id=e.id||"default",e.size=e.fullscreen||e.html?"large":"small",e.offset=e.offset||0,e.arrow_offset=e.arrow?8:0,e.x=e.x||0,e.y=e.y||0,e.parent=e.parent||d3.select("body"),e.curtain=e.curtain||"#fff",e.curtainopacity=e.curtainopacity||.8,e.background=e.background||"#fff",e.fontcolor=e.fontcolor||"#444",e.fontfamily=e.fontfamily||"sans-serif",e.fontweight=e.fontweight||"normal",e.fontsize=e.fontsize||"12px",e.style=e.style||"default",e.zindex="small"==e.size?2e3:500,e.locale=e.locale||a;var p=e.parent?e.parent.node().offsetHeight||e.parent.node().getBoundingClientRect().height:0;if(e.iconsize||(e.iconsize="small"==e.size?22:50),e.limit=e.parent.node()===document.body?[window.innerWidth+window.scrollX,window.innerHeight+window.scrollY]:[parseFloat(e.parent.style("width"),10),parseFloat(e.parent.style("height"),10)],e.title instanceof Array){var h=e.locale.ui.and,v=e.locale.ui.more;e.title=f(e.title,h,3,v)}if(c(e.id),e.anchor={},e.fullscreen)e.anchor.x="center",e.anchor.y="center",e.x=e.parent?e.parent.node().offsetWidth/2:window.innerWidth/2,e.y=e.parent?p/2:window.innerHeight/2;else if(e.align){var g=e.align.split(" ");e.anchor.y=g[0],e.anchor.x=g[1]?g[1]:"center"}else e.anchor.x="center",e.anchor.y="top";var m=e.width-30;if(e.fullscreen){e.parent.append("div").attr("id","d3plus_tooltip_curtain_"+e.id).attr("class","d3plus_tooltip_curtain").style("background-color",e.curtain).style("opacity",e.curtainopacity).style("position","absolute").style("z-index",499).style("top","0px").style("right","0px").style("bottom","0px").style("left","0px").on(o.click,function(){c(e.id)})}var y=e.parent.append("div").datum(e).attr("id","d3plus_tooltip_id_"+e.id).attr("class","d3plus_tooltip d3plus_tooltip_"+e.size).style("color",e.fontcolor).style("font-family",e.fontfamily).style("font-weight",e.fontweight).style("font-size",e.fontsize+"px").style(r+"box-shadow","0px 1px 3px rgba(0, 0, 0, 0.25)").style("position","absolute").on(o.out,n);e.max_height&&y.style("max-height",e.max_height+"px"),e.fixed?(y.style("z-index",500),e.mouseevents=!0):y.style("z-index",2e3);var x=y.append("div").datum(e).attr("class","d3plus_tooltip_container").style("background-color",e.background).style("padding","6px");if(e.fullscreen&&e.html){w=e.parent?.75*e.parent.node().offsetWidth:.75*window.innerWidth,C=e.parent?.75*p:.75*window.innerHeight,x.style("width",w+"px").style("height",C+"px");var b=x.append("div").attr("class","d3plus_tooltip_body").style("padding-right","6px").style("display","inline-block").style("z-index",1).style("width",e.width+"px")}else{if("auto"==e.width){var w="auto";x.style("max-width",e.max_width+"px")}else var w=e.width-14+"px";var b=x.style("width",w)}if(e.title||e.icon)var _=b.append("div").attr("class","d3plus_tooltip_header").style("position","relative").style("z-index",1);if(e.fullscreen){y.append("div").attr("class","d3plus_tooltip_close").style("background-color",e.color).style("color",d(e.color)).style("position","absolute").style(r+"box-shadow","0 1px 3px rgba(0, 0, 0, 0.25)").style("font-size","20px").style("height","18px").style("line-height","14px").style("text-align","center").style("right","16px").style("top","-10px").style("width","18px").style("z-index",10).html("&times;").on(o.over,function(){d3.select(this).style("cursor","pointer").style(r+"box-shadow","0 1px 3px rgba(0, 0, 0, 0.5)")}).on(o.out,function(){d3.select(this).style("cursor","auto").style(r+"box-shadow","0 1px 3px rgba(0, 0, 0, 0.25)")}).on(o.click,function(){c(e.id)})}if(e.mouseevents){if(e.mouseevents!==!0){var k=d3.select(e.mouseevents).on(o.out),z=function(){var t=d3.event.toElement||d3.event.relatedTarget;if(t)var r="string"==typeof t.className?t.className:t.className.baseVal,a=0==r.indexOf("d3plus_tooltip");else var a=!1;t&&(A(y.node(),t)||A(e.mouseevents,t)||a)||(k(d3.select(e.mouseevents).datum()),n(),d3.select(e.mouseevents).on(o.out,k))},A=function(e,t){for(var r=t.parentNode;null!==r;){if(r==e)return!0;r=r.parentNode}return!1};d3.select(e.mouseevents).on(o.out,z),y.on(o.out,z);var j=d3.select(e.mouseevents).on(o.move);j&&y.on(o.move,j)}}else y.style("pointer-events","none");if(e.arrow){y.append("div").attr("class","d3plus_tooltip_arrow").style("background-color",e.background).style(r+"box-shadow","0px 1px 3px rgba(0, 0, 0, 0.25)").style("position","absolute").style("bottom","-5px").style("height","10px").style("left","50%").style("margin-left","-5px").style("width","10px").style(r+"transform","rotate(45deg)").style("z-index",-1)}if(e.icon){var M=_.append("div").attr("class","d3plus_tooltip_icon").style("width",e.iconsize+"px").style("height",e.iconsize+"px").style("z-index",1).style("background-position","50%").style("background-size","100%").style("background-image","url("+e.icon+")").style("display","inline-block").style("margin","0px 3px 3px 0px");"knockout"==e.style&&M.style("background-color",e.color),m-=M.node().offsetWidth}if(e.title){var E=e.max_width-6;e.icon&&(E-=e.iconsize+6),E+="px";{_.append("div").attr("class","d3plus_tooltip_title").style("max-width",E).style("color",e.icon?e.fontcolor:i(e.color)).style("vertical-align","top").style("width",m+"px").style("display","inline-block").style("overflow","hidden").style("text-overflow","ellipsis").style("word-wrap","break-word").style("z-index",1).style("font-size","large"===e.size?"18px":"16px").style("line-height","large"===e.size?"20px":"17px").style("padding","large"===e.size?"3px 6px":"3px").text(e.title)}}if(e.description){b.append("div").attr("class","d3plus_tooltip_description").style("font-size","12px").style("padding","6px").text(e.description)}if(e.data||e.html&&!e.fullscreen)var O=b.append("div").attr("class","d3plus_tooltip_data_container").style("overflow-y","auto").style("z-index",-1);if(e.data){var S=0,F={},T=null;e.data.forEach(function(t,a){t.group&&T!=t.group&&(T=t.group,O.append("div").attr("class","d3plus_tooltip_data_title").style("font-size","12px").style("font-weight","bold").style("padding","6px 3px 0px 3px").text(t.group));var s=O.append("div").attr("class","d3plus_tooltip_data_block").style("font-size","12px").style("padding","3px 6px").style("position","relative").datum(t);t.highlight===!0?s.style("color",i(e.color)):(t.allColors||t.highlight!==e.color)&&s.style("color",i(t.highlight));var c=s.append("div").attr("class","d3plus_tooltip_data_name").style("display","inline-block").html(t.name).on(o.out,function(){d3.event.stopPropagation()});if(t.link&&c.style("cursor","pointer").on(o.click,t.link),t.value instanceof Array){var f=e.locale.ui.and,d=e.locale.ui.more;t.value=list(t.value,f,3,d)}var p=s.append("div").attr("class","d3plus_tooltip_data_value").style("display","block").style("position","absolute").style("text-align","right").style("top","3px").html(t.value).on(o.out,function(){d3.event.stopPropagation()});if(u?p.style("left","6px"):p.style("right","6px"),e.mouseevents&&t.desc){var h=s.append("div").attr("class","d3plus_tooltip_data_desc").style("color","#888").style("overflow","hidden").style(r+"transition","height 0.5s").style("width","85%").text(t.desc).on(o.out,function(){d3.event.stopPropagation()}),v=h.node().offsetHeight||h.node().getBoundingClientRect().height;h.style("height","0px");var g=c.append("div").attr("class","d3plus_tooltip_data_help").style("background-color","#ccc").style(r+"border-radius","5px").style("color","#fff").style("cursor","pointer").style("display","inline-block").style("font-size","8px").style("font-weight","bold").style("height","10px").style("margin","3px 0px 0px 3px").style("padding-right","1px").style("text-align","center").style("width","10px").style("vertical-align","top").style(l+"transition","background-color 0.5s").text("?").on(o.over,function(){var e=d3.select(this.parentNode.parentNode).style("color");d3.select(this).style("background-color",e),h.style("height",v+"px")}).on(o.out,function(){d3.event.stopPropagation()});c.style("cursor","pointer").on(o.over,function(){n();var e=d3.select(this.parentNode).style("color");g.style("background-color",e),h.style("height",v+"px")}),s.on(o.out,function(){d3.event.stopPropagation(),n()})}var m=parseFloat(p.style("width"),10);m>e.width/2&&(m=e.width/2),m>S&&(S=m),a!=e.data.length-1&&(t.group&&t.group==e.data[a+1].group||!t.group&&!e.data[a+1].group)&&O.append("div").attr("class","d3plus_tooltip_data_seperator").style("background-color","#ddd").style("display","block").style("height","1px").style("margin","0px 3px")}),O.selectAll(".d3plus_tooltip_data_name").style("width",function(){var e=parseFloat(d3.select(this.parentNode).style("width"),10);return e-S-30+"px"}),O.selectAll(".d3plus_tooltip_data_value").style("width",S+"px").each(function(e){var t=parseFloat(d3.select(this).style("height"),10);F[e.name]=t}),O.selectAll(".d3plus_tooltip_data_name").style("min-height",function(e){return F[e.name]+"px"})}e.html&&!e.fullscreen&&(O.append("div").html(e.html),e.js&&e.js(x));var B=b.append("div").attr("class","d3plus_tooltip_footer").style("font-size","10px").style("position","relative").style("text-align","center");if(e.footer&&B.html(e.footer),e.height=y.node().offsetHeight||y.node().getBoundingClientRect().height,e.html&&e.fullscreen){var C=e.height-12,w=y.node().offsetWidth-e.width-44;x.append("div").attr("class","d3plus_tooltip_html").style("width",w+"px").style("height",C+"px").style("display","inline-block").style("vertical-align","top").style("overflow-y","auto").style("padding","0px 12px").style("position","absolute").html(e.html),e.js&&e.js(x)}if(e.width=y.node().offsetWidth,"center"!=e.anchor.y?e.height+=e.arrow_offset:e.width+=e.arrow_offset,e.data||!e.fullscreen&&e.html){if(e.fullscreen)var C=e.height;else var I=e.fixed?p-e.y-10:p-10,C=e.height<I?e.height:I;C-=parseFloat(x.style("padding-top"),10),C-=parseFloat(x.style("padding-bottom"),10),_&&(C-=_.node().offsetHeight||_.node().getBoundingClientRect().height,C-=parseFloat(_.style("padding-top"),10),C-=parseFloat(_.style("padding-bottom"),10)),B&&(C-=B.node().offsetHeight||B.node().getBoundingClientRect().height,C-=parseFloat(B.style("padding-top"),10),C-=parseFloat(B.style("padding-bottom"),10)),O.style("max-height",C+"px")}e.height=y.node().offsetHeight||y.node().getBoundingClientRect().height,s(e.x,e.y,e.id)}},{"../client/pointer.coffee":40,"../client/prefix.coffee":41,"../client/rtl.coffee":42,"../color/legible.coffee":45,"../color/text.coffee":51,"../core/locale/languages/en_US.coffee":70,"../string/list.coffee":173,"./move.coffee":201,"./remove.coffee":202}],201:[function(e,t,r){var n;t.exports=function(e,t,r){var a,o,i;return r||(r="default"),i=d3.select("div#d3plus_tooltip_id_"+r),i.node()&&(a=i.datum(),a.cx=e,a.cy=t,a.fixed||(o="body"===a.parent.node().tagName.toLowerCase()?[window.scrollX,window.scrollY]:[0,0],"center"!==a.anchor.y?("right"===a.anchor.x?a.x=a.cx-a.arrow_offset-4:"center"===a.anchor.x?a.x=a.cx-a.width/2:"left"===a.anchor.x&&(a.x=a.cx-a.width+a.arrow_offset+2),"bottom"===a.anchor.y?a.flip=a.cy+a.height+a.offset<=a.limit[1]:"top"===a.anchor.y&&(a.flip=a.cy-a.height-a.offset<o[1]),a.y=a.flip?a.cy+a.offset+a.arrow_offset:a.cy-a.height-a.offset-a.arrow_offset):(a.y=a.cy-a.height/2,"right"===a.anchor.x?a.flip=a.cx+a.width+a.offset<=a.limit[0]:"left"===a.anchor.x&&(a.flip=a.cx-a.width-a.offset<o[0]),"center"===a.anchor.x?(a.flip=!1,a.x=a.cx-a.width/2):a.x=a.flip?a.cx+a.offset+a.arrow_offset:a.cx-a.width-a.offset),a.x<o[0]?a.x=o[0]:a.x+a.width>a.limit[0]&&(a.x=a.limit[0]-a.width),a.y<o[1]?a.y=o[1]:a.y+a.height>a.limit[1]&&(a.y=a.limit[1]-a.height)),i.style("top",a.y+"px").style("left",a.x+"px"),a.arrow&&i.selectAll(".d3plus_tooltip_arrow").call(n)),i},n=function(e){return e.style("bottom",function(e){return"center"===e.anchor.y||e.flip?"auto":"-5px"}).style("right",function(e){return"center"!==e.anchor.y||e.flip?"auto":"-5px"}).style("top",function(e){return"center"!==e.anchor.y&&e.flip?"-5px":"center"===e.anchor.y?"50%":"auto"}).style("left",function(e){return"center"===e.anchor.y&&e.flip?"-5px":"center"!==e.anchor.y?"50%":"auto"}).style("margin-left",function(e){var t;return"center"===e.anchor.y?"auto":(t="right"===e.anchor.x?-e.width/2+e.arrow_offset/2:"left"===e.anchor.x?e.width/2-2*e.arrow_offset-5:-5,e.cx-e.width/2-5<t?(t=e.cx-e.width/2-5,t<2-e.width/2&&(t=2-e.width/2)):-(e.limit[0]-e.cx-e.width/2+5)>t&&(t=-(e.limit[0]-e.cx-e.width/2+5),t>e.width/2-11&&(t=e.width/2-11)),t+"px")}).style("margin-top",function(e){var t;return"center"!==e.anchor.y?"auto":(t="bottom"===e.anchor.y?-e.height/2+e.arrow_offset/2-1:"top"===e.anchor.y?e.height/2-2*e.arrow_offset-2:-9,e.cy-e.height/2-e.arrow_offset<t?(t=e.cy-e.height/2-e.arrow_offset,t<4-e.height/2&&(t=4-e.height/2)):-(e.limit[1]-e.cy-e.height/2+e.arrow_offset)>t&&(t=-(e.limit[1]-e.cy-e.height/2+e.arrow_offset),t>e.height/2-22&&(t=e.height/2-22)),t+"px")})}},{}],202:[function(e,t,r){t.exports=function(e){return e?(d3.selectAll("div#d3plus_tooltip_curtain_"+e).remove(),d3.selectAll("div#d3plus_tooltip_id_"+e).remove()):(d3.selectAll("div.d3plus_tooltip_curtain").remove(),d3.selectAll("div.d3plus_tooltip").remove())}},{}],203:[function(e,t,r){t.exports=function(e,t){var r,n;return r=[],n=1/(t-1)*(e[1]-e[0]),d3.range(e[0],e[1]+n,n)}},{}],204:[function(e,t,r){var n;n=e("./d3selection.coffee"),t.exports=function(e,t){var r;if(!e||!t)return!1;for(n(e)&&(e=e.node()),n(e)&&(t=t.node()),r=t.parentNode;null!==r;){if(r===e)return!0;r=r.parentNode}return!1}},{"./d3selection.coffee":207}],205:[function(e,t,r){t.exports=function(e,t){var r;return r=e[0],e.forEach(function(e){return Math.abs(t-e)<Math.abs(t-r)?r=e:void 0}),r}},{}],206:[function(e,t,r){var n,a,o;a=e("../object/merge.coffee"),o=e("../object/validate.coffee"),n=function(e){var t;return o(e)?a(e):e instanceof Array?(t=[],e.forEach(function(e){return t.push(n(e))}),t):e},t.exports=n},{"../object/merge.coffee":170,"../object/validate.coffee":171}],207:[function(e,t,r){var n;n=e("../client/ie.js"),t.exports=function(e){return n?"object"==typeof e&&e instanceof Array&&"size"in e&&"select"in e:e instanceof d3.selection}},{"../client/ie.js":39}],208:[function(e,t,r){t.exports=function(e,t){var r;r=new Image,r.src=e,r.crossOrigin="Anonymous",r.onload=function(){var e,r;e=document.createElement("canvas"),e.width=this.width,e.height=this.height,r=e.getContext("2d"),r.drawImage(this,0,0),t.call(this,e.toDataURL("image/png")),e=null}}},{}],209:[function(e,t,r){var n,a;n=e("../object/validate.coffee"),a=function(e,t,r,o,i){var s,l,u,c,f,d,p,h,v,g,m,y,x,b;if(void 0===e)return[];if(o&&void 0===i&&(i=o.id.value),e instanceof Array||(e=[e]),g=[],void 0===t)return e.reduce(function(e,t){var r;return r=JSON.stringify(t),g.indexOf(r)<0&&(e.indexOf(t)<0&&e.push(t),g.push(r)),e},[]);if(b=[],s=function(e){var t;return void 0!==e&&null!==e&&(t=JSON.stringify(e),g.indexOf(t)<0)?(b.push(e),g.push(t)):void 0},"function"==typeof r&&o)for(u=0,d=e.length;d>u;u++)for(l=e[u],x=a(r(o,l,t,i)),c=0,p=x.length;p>c;c++)y=x[c],s(y);else if("function"==typeof t)for(f=0,h=e.length;h>f;f++)l=e[f],x=t(l),s(x);else for(m=0,v=e.length;v>m;m++)l=e[m],n(l)&&(x=l[t],s(x));return b.sort(function(e,t){return e-t})},t.exports=a},{"../object/validate.coffee":171}],210:[function(e,t,r){t.exports=function(e){var t,r,n,a,o;for(e.container.value.style("position",function(){var e,t;return e=d3.select(this).style("position"),t=["absolute","fixed"].indexOf(e)>=0,t?e:"relative"}).html(""),a=["width","height"],r=0,n=a.length;n>r;r++)o=a[r],e[o].value||(t=function(r){var n,a;return void 0===r.tagName||["BODY","HTML"].indexOf(r.tagName)>=0?(a=window["inner"+o.charAt(0).toUpperCase()+o.slice(1)],n=document!==r?d3.select(r):!1,n&&("width"===o?(a-=parseFloat(n.style("margin-left"),10),a-=parseFloat(n.style("margin-right"),10),a-=parseFloat(n.style("padding-left"),10),a-=parseFloat(n.style("padding-right"),10)):(a-=parseFloat(n.style("margin-top"),10),a-=parseFloat(n.style("margin-bottom"),10),a-=parseFloat(n.style("padding-top"),10),a-=parseFloat(n.style("padding-bottom"),10))),e[o].value=20>=a?e[o].small:a):(a=parseFloat(d3.select(r).style(o),10),"number"==typeof a&&a>0?e[o].value=a:"BODY"!==r.tagName?t(r.parentNode):void 0)},t(e.container.value.node()),1===d3.selectAll("body > *:not(script)").size()&&d3.select("body").style("overflow","hidden"));e.container.value.style("width",e.width.value+"px").style("height",e.height.value+"px")}},{}],211:[function(e,t,r){var n=e("../../core/data/format.js"),a=e("../../core/data/color.js"),o=e("../../core/data/keys.coffee"),i=e("../../core/data/load.coffee"),s=e("./ui/drawer.js"),l=e("./ui/legend.js"),u=e("./ui/timeline.coffee"),c=e("./errorCheck.js"),f=e("../../core/fetch/data.js"),d=e("./finish.js"),p=e("./focus/tooltip.coffee"),h=e("./focus/viz.js"),v=e("./ui/history.coffee"),g=e("../../core/parse/edges.js"),m=e("../../core/parse/nodes.js"),y=e("../../core/console/print.coffee"),x=e("../../tooltip/remove.coffee"),b=e("./types/run.coffee"),w=e("./shapes/draw.js"),_=e("../../string/format.js"),k=e("./svg/enter.js"),z=e("./svg/update.js"),A=e("./ui/titles.js"),j=e("../../object/validate.coffee");t.exports=function(e){var t=[],r=e.type.value,M=e.format.locale.value,E=M.message.ui,O=M.message.draw,S=["data","attrs","coords","nodes","edges"];if(S.forEach(function(r){e.error.value||e[r].loaded||!e[r].url||t.push({"function":function(e,t){i(e,r,t)},message:M.message.loading,wait:!0})}),e.draw.update){var F=M.visualization[r]||r,T=e.types[r].setup||!1,B=e.types[r].requirements||[],C=_(M.message.initializing,F),I=M.message.data;B instanceof Array||(B=[B]),F=F.toLowerCase(),e.error.value||"function"!=typeof T||t.push({"function":function(e){if(e.dev.value){var t="running "+F+" setup";y.time(t)}T(e),e.dev.value&&y.timeEnd(t)},message:C}),e.container.changed&&t.push({"function":k,message:C}),r in e.g.apps||t.push({"function":function(e){if(e.dev.value){var t="creating "+F+" group";y.time(t)}e.g.apps[r]=e.g.app.selectAll("g#"+r).data([r]),e.g.apps[r].enter().append("g").attr("id",r).attr("opacity",0),e.dev.value&&y.timeEnd(t)},message:C}),e.data.changed&&t.push({"function":function(e){e.data.cache={},delete e.nodes.restricted,delete e.edges.restricted,o(e,"data")},message:I}),e.attrs.changed&&t.push({"function":function(e){o(e,"attrs")},message:I}),t.push({"function":function(e){if(!e.color.type||e.color.changed||e.data.changed||e.attrs.changed||e.id.changed||e.depth.changed||e.time.fixed.value&&(e.time.solo.changed||e.time.mute.changed)){if(e.color.valueScale=!1,e.dev.value){var t="checking color type";y.time(t)}if(e.color.type=!1,e.color.value){var r=e.color.value;j(r)&&(r=r[e.id.value]?r[e.id.value]:r[d3.keys(r)[0]]),e.data.keys&&r in e.data.keys?e.color.type=e.data.keys[r]:e.attrs.keys&&r in e.attrs.keys&&(e.color.type=e.attrs.keys[r])}else e.data.keys&&(e.color.type=e.data.keys[e.id.value]);e.dev.value&&y.timeEnd(t)}},message:I}),B.indexOf("edges")>=0&&e.edges.value&&(!e.edges.linked||e.edges.changed)&&t.push({"function":g,message:I}),B.indexOf("nodes")>=0&&e.edges.value&&(!e.nodes.positions||e.nodes.changed)&&t.push({"function":m,message:I}),(e.data.changed||e.time.changed||e.time.format.changed||e.id.changed||e.x.scale.changed&&[e.x.scale.value,e.x.scale.previous].indexOf("discrete")>=0||e.y.scale.changed&&[e.y.scale.value,e.y.scale.previous].indexOf("discrete")>=0)&&t.push({"function":n,message:I}),e.error.value||t.push({"function":function(e){var t=e.time.fixed.value?null:["all"];if(e.dev.value){var r=t?"fetching pool data":"fetching data";y.time(r)}e.data.pool=f(e,t),e.dev.value&&y.timeEnd(r),t?(e.dev.value&&y.time("fetching data for current year"),e.data.viz=f(e),e.dev.value&&y.timeEnd("fetching data for current year")):e.data.viz=e.data.pool,e.draw.timing=e.data.viz.length<e.data.large?e.timing.transitions:0},message:I}),e.error.value||t.push({check:function(e){return e.color.value&&"number"===e.color.type&&e.color.valueScale===!1},"function":a,message:I})}return t.push({"function":function(e){if(e.dev.value){var t=e.format.locale.value.message.tooltipReset;y.time(t)}e.type.previous&&r!==e.type.previous&&x(e.type.previous),x(r),e.dev.value&&y.timeEnd(t)},message:E}),e.error.value||t.push({"function":c,message:E}),t.push({"function":function(e){if(e.margin.process(),A(e),!e.error.value)if(e.draw.update)s(e),u(e),l(e);else{e.dev.value&&y.time("calculating margins");var t=e.container.value.select("div#d3plus_drawer").node().offsetHeight||e.container.value.select("div#d3plus_drawer").node().getBoundingClientRect().height,r=e.g.timeline.node().getBBox();r=e.timeline.value?r.height+e.ui.padding:0;var n=e.g.legend.node().getBBox();n=e.legend.value?n.height+e.ui.padding:0,e.margin.bottom+=t+r+n,e.dev.value&&y.timeEnd("calculating margins")}v(e),e.height.viz-=e.margin.top+e.margin.bottom,e.width.viz-=e.margin.left+e.margin.right},message:E}),e.error.value||t.push({"function":p,message:E}),t.push({"function":z,message:O}),!e.error.value&&e.draw.update&&t.push({"function":[b,w],message:O}),t.push({"function":[h,d],message:O}),t}},{"../../core/console/print.coffee":53,"../../core/data/color.js":55,"../../core/data/format.js":57,"../../core/data/keys.coffee":59,"../../core/data/load.coffee":60,"../../core/fetch/data.js":65,"../../core/parse/edges.js":94,"../../core/parse/nodes.js":97,"../../object/validate.coffee":171,"../../string/format.js":172,"../../tooltip/remove.coffee":202,"./errorCheck.js":212,"./finish.js":213,"./focus/tooltip.coffee":214,"./focus/viz.js":215,"./shapes/draw.js":224,"./svg/enter.js":235,"./svg/update.js":236,"./types/run.coffee":239,"./ui/drawer.js":240,"./ui/history.coffee":241,"./ui/legend.js":242,"./ui/timeline.coffee":244,"./ui/titles.js":245}],212:[function(e,t,r){var n=e("../../core/fetch/text.js"),a=e("../../core/console/print.coffee"),o=e("../../core/methods/rejected.coffee"),i=e("../../string/format.js"),s=e("../../string/list.coffee");t.exports=function(e){e.dev.value&&a.time("checking for errors");var t=["id"],r=e.types[e.type.value].requirements;r&&(r instanceof Array?t=t.concat(e.types[e.type.value].requirements):t.push(r));var l=[];if(t.forEach(function(t){if("string"==typeof t)e[t].value||l.push('"'+t+'"');else if("function"==typeof t){var r=t(e);!r.status&&r.text&&l.push('"'+r.text+'"')}}),l.length>1){var u=e.format.locale.value.error.methods,c=e.format.locale.value.visualization[e.type.value]||e.type.value,f=e.format.locale.value.ui.and;l=s(l,f),e.error.internal=i(u,c,l)}else if(1===l.length){var u=e.format.locale.value.error.method,c=e.format.locale.value.visualization[e.type.value]||e.type.value;e.error.internal=i(u,c,l[0])}if(!e.error.internal&&t.indexOf("edges")>=0&&t.indexOf("focus")>=0){var d=e.edges.connections(e.focus.value[0],e.id.value);if(0==d.length){var p=n(e,e.focus.value[0],e.depth.value),u=e.format.locale.value.error.connections;e.error.internal=i(u,'"'+p+'"')}}var t=["d3"];e.types[e.type.value].libs&&(t=t.concat(e.types[e.type.value].libs));var l=[];if(t.forEach(function(e){window[e]||l.push('"'+e+'"')}),l.length>1){var u=e.format.locale.value.error.libs,c=e.format.locale.value.visualization[e.type.value],f=e.format.locale.value.ui.and;l=s(l,f),e.error.internal=i(u,c,l)}else if(1===l.length){var u=e.format.locale.value.error.lib,c=e.format.locale.value.visualization[e.type.value];e.error.internal=i(u,c,l[0])}var h=e.shape.accepted(e);h instanceof Array||(h=[h]);var v=e.shape.value;if((!v||o(e,h,v,"shape"))&&e.self.shape(h[0]),"modes"in e.types[e.type.value]){var g=e.types[e.type.value].modes;g instanceof Array||(g=[g]);var m=e.type.mode.value;(!m||o(e,g,m,"mode"))&&e.self.type({mode:g[0]})}e.dev.value&&a.timeEnd("checking for errors")}},{"../../core/console/print.coffee":53,"../../core/fetch/text.js":67,"../../core/methods/rejected.coffee":90,"../../string/format.js":172,"../../string/list.coffee":173}],213:[function(e,t,r){var n=e("./shapes/edges.js"),a=e("./ui/message.js"),o=e("../../core/methods/reset.coffee"),i=e("../../core/console/print.coffee"),s=e("./shapes/labels.js"),l=e("../../string/title.coffee"),u=e("./zoom/bounds.coffee"),c=e("./zoom/labels.coffee"),f=e("./zoom/mouse.coffee");t.exports=function(e){if(!e.error.value){var t=e.zoom.viewport||e.zoom.bounds;e.types[e.type.value].zoom&&e.zoom.value&&t?(e.dev.value&&i.time("calculating zoom"),
e.draw.first||e.zoom.reset?u(e,t,0):(e.type.changed||e.focus.changed||e.height.changed||e.width.changed||e.nodes.changed||e.legend.changed||e.timeline.changed||e.ui.changed)&&u(e,t),e.dev.value&&i.timeEnd("calculating zoom")):(e.zoom.bounds=[[0,0],[e.width.viz,e.height.viz]],e.zoom.scale=1,u(e))}var r=e.zoom.size?e.zoom.size.width:e.width.viz,d=e.zoom.size?e.zoom.size.height:e.height.viz,p=e.zoom.bounds?e.zoom.bounds[0][0]:0,h=e.zoom.bounds?e.zoom.bounds[0][1]:0;if(e.g.overlay.attr("width",r).attr("height",d).attr("x",p).attr("y",h),e.error.value||(e.draw.update?(n(e),s(e,"data"),e.edges.label&&setTimeout(function(){s(e,"edges")},e.draw.timing+200)):e.types[e.type.value].zoom&&e.zoom.value&&e.draw.timing&&setTimeout(function(){c(e)},e.draw.timing)),!e.error.value){var v=e.types[e.type.value].requirements||[];v instanceof Array||(v=[v]);var g=v.indexOf("data")>=0;e.error.internal||e.data.viz&&e.returned.nodes.length||!g||(e.error.internal=e.format.locale.value.error.data)}var m=e.type.previous;if(m&&e.type.value!=m&&e.g.apps[m]&&(e.dev.value&&i.time('hiding "'+m+'"'),e.draw.timing?e.g.apps[m].transition().duration(e.draw.timing).attr("opacity",0):e.g.apps[m].attr("opacity",0),e.dev.value&&i.timeEnd()),!e.error.value){var y=g&&0===e.data.viz.length||e.error.internal||e.error.value?0:e.focus.value.length&&e.types[e.type.value].zoom&&e.zoom.value?1-e.tooltip.curtain.opacity:1,x=e.draw.timing;e.group.transition().duration(x).attr("opacity",y),e.g.data.transition().duration(x).attr("opacity",y),e.g.edges.transition().duration(x).attr("opacity",y)}e.error.value?a(e,e.error.value):e.error.internal?(e.error.internal=l(e.error.internal),i.warning(e.error.internal),a(e,e.error.internal),e.error.internal=null):a(e),setTimeout(function(){o(e),e.types[e.type.value].zoom&&e.zoom.value?(e.g.zoom.datum(e).call(e.zoom.behavior.on("zoom",f)),e.zoom.scroll.value||e.g.zoom.on("mousewheel.zoom",null).on("MozMousePixelScroll.zoom",null).on("wheel.zoom",null),e.zoom.click.value||e.g.zoom.on("dblclick.zoom",null),e.zoom.pan.value||e.g.zoom.on("mousedown.zoom",null).on("mousemove.zoom",null)):e.g.zoom.call(e.zoom.behavior.on("zoom",null)).on("dblclick.zoom",null).on("mousedown.zoom",null).on("mousemove.zoom",null).on("mousewheel.zoom",null).on("MozMousePixelScroll.zoom",null).on("touchstart.zoom",null).on("wheel.zoom",null)},e.draw.timing)}},{"../../core/console/print.coffee":53,"../../core/methods/reset.coffee":92,"../../string/title.coffee":175,"./shapes/edges.js":225,"./shapes/labels.js":227,"./ui/message.js":243,"./zoom/bounds.coffee":246,"./zoom/labels.coffee":248,"./zoom/mouse.coffee":249}],214:[function(e,t,r){var n,a,o,i;n=e("../tooltip/create.js"),a=e("../../../core/fetch/value.coffee"),o=e("../../../core/console/print.coffee"),i=e("../../../tooltip/remove.coffee"),t.exports=function(e){var t,r,s;r=e.focus,!e.error.internal&&1===r.value.length&&r.value.length&&!e.small&&r.tooltip.value?(e.dev.value&&o.time("drawing focus tooltip"),t=e.data.pool.filter(function(t){return a(e,t,e.id.value)===r.value[0]}),t.length>=1?t=t[0]:(t={},t[e.id.value]=r.value[0]),s=e.labels.padding,n({anchor:"top left",arrow:!1,data:t,fullscreen:!1,id:"visualization_focus",length:"long",maxheight:e.height.viz-2*s,mouseevents:!0,offset:0,vars:e,width:e.tooltip.large,x:e.width.value-e.margin.right-s,y:e.margin.top+s}),e.width.viz-=e.tooltip.large+2*s,e.dev.value&&o.timeEnd("drawing focus tooltip")):i("visualization_focus")}},{"../../../core/console/print.coffee":53,"../../../core/fetch/value.coffee":68,"../../../tooltip/remove.coffee":202,"../tooltip/create.js":237}],215:[function(t,r,n){var a=t("../../../client/pointer.coffee"),o=t("../../../client/ie.js"),i=t("../../../core/fetch/value.coffee"),s=t("../../../core/console/print.coffee"),l=t("../../../util/uniques.coffee");r.exports=function(t){if(t.g.edge_focus.selectAll("g").remove(),t.g.data_focus.selectAll("g").remove(),t.focus.value.length&&t.types[t.type.value].zoom&&t.zoom.value){t.dev.value&&s.time("drawing focus elements");var r=t.g.edges.selectAll("g");if(r.size()>0){r.each(function(e){var r=e[t.edges.source][t.id.value],n=e[t.edges.target][t.id.value];if(r==t.focus.value[0]||n==t.focus.value[0]){var a=t.g.edge_focus.node().appendChild(this.cloneNode(!0));d3.select(a).datum(e).attr("opacity",1).selectAll("line, path").datum(e)}});var n=t.edges.arrows.value;t.g.edge_focus.selectAll("line, path").attr("vector-effect","non-scaling-stroke").style("stroke",t.color.focus).style("stroke-width",function(){return o&&t.types[t.type.value].zoom?0:t.edges.size.value?d3.select(this).style("stroke-width"):2*t.data.stroke.width}).attr("marker-start",function(e){var r=t.edges.arrows.direction.value;if("bucket"in e.d3plus)var a="_"+e.d3plus.bucket;else var a="";return"source"==r&&n?"url(#d3plus_edge_marker_focus"+a+")":"none"}).attr("marker-end",function(e){var r=t.edges.arrows.direction.value;if("bucket"in e.d3plus)var a="_"+e.d3plus.bucket;else var a="";return"target"==r&&n?"url(#d3plus_edge_marker_focus"+a+")":"none"}),t.g.edge_focus.selectAll("text").style("fill",t.color.focus)}var u=l(t.edges.connections(t.focus.value[0],t.id.value,!0),t.id.value,i,t);u.push(t.focus.value[0]);{var c=[],f=[],d=[0],p=[0];t.g.data.selectAll("g").each(function(r){if(u.indexOf(r[t.id.value])>=0){var n=t.g.data_focus.node().appendChild(this.cloneNode(!0)),n=d3.select(n).datum(r).attr("opacity",1);"coordinates"==t.shape.value?t.zoom.viewport=t.path.bounds(t.zoom.coords[r.d3plus.id]):"d3plus"in r&&("x"in r.d3plus&&c.push(r.d3plus.x),"y"in r.d3plus&&f.push(r.d3plus.y),"r"in r.d3plus?(d.push(r.d3plus.r),p.push(r.d3plus.r)):("width"in r.d3plus&&d.push(r.d3plus.width/2),"height"in r.d3plus&&p.push(r.d3plus.height/2)));for(e in a){var o=d3.select(this).on(a[e]);o&&n.on(a[e],o)}}})}if(c.length&&f.length){var h=d3.extent(c),v=d3.extent(f),g=d3.max(d),m=d3.max(p);t.zoom.viewport=[[h[0]-g,v[0]-m],[h[1]+g,v[1]+m]]}t.g.data_focus.selectAll("path").style("stroke-width",o&&t.types[t.type.value].zoom?0:2*t.data.stroke.width),t.dev.value&&s.timeEnd("drawing focus elements")}else t.zoom.viewport=!1}},{"../../../client/ie.js":39,"../../../client/pointer.coffee":40,"../../../core/console/print.coffee":53,"../../../core/fetch/value.coffee":68,"../../../util/uniques.coffee":209}],216:[function(e,t,r){var n,a,o,i;i=e("./style.coffee"),a=e("../../../geom/largestRect.coffee"),o=e("../../../geom/path2poly.coffee"),n={start:{},end:{}},t.exports=function(e,t,r,s){var l,u,c,f;l=d3.svg.arc().innerRadius(0).outerRadius(function(e){return e.d3plus.r}).startAngle(function(e){return e.d3plus.startAngle}).endAngle(function(e){return e.d3plus.endAngle}),c=function(t){var r,n;return e.labels.value&&(t.d3plus.label?t.d3plus_label=t.d3plus.label:(r=o(l(t)),n=a(r,{angle:0}),n[0]?t.d3plus_label={w:n[0].width,h:n[0].height,x:n[0].cx,y:n[0].cy}:delete t.d3plus_label)),[t]},e.draw.timing?(f=d3.svg.arc().innerRadius(0).outerRadius(function(e){return e.d3plus.r}).startAngle(function(e){return void 0===n.start[e.d3plus.id]&&(n.start[e.d3plus.id]=0),isNaN(n.start[e.d3plus.id])&&(n.start[e.d3plus.id]=e.d3plus.startAngle),n.start[e.d3plus.id]}).endAngle(function(e){return void 0===n.end[e.d3plus.id]&&(n.end[e.d3plus.id]=0),isNaN(n.end[e.d3plus.id])&&(n.end[e.d3plus.id]=e.d3plus.endAngle),n.end[e.d3plus.id]}),u=function(e,t){return e.attrTween("d",function(e){var r,a,o,i;return void 0===t?(i=e.d3plus.startAngle,r=e.d3plus.endAngle):0===t&&(i=0,r=0),o=d3.interpolate(n.start[e.d3plus.id],i),a=d3.interpolate(n.end[e.d3plus.id],r),function(t){return n.start[e.d3plus.id]=o(t),n.end[e.d3plus.id]=a(t),f(e)}})},r.append("path").attr("class","d3plus_data").call(i,e).attr("d",f),t.selectAll("path.d3plus_data").data(c).transition().duration(e.draw.timing).call(i,e).call(u),s.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(u,0)):(r.append("path").attr("class","d3plus_data"),t.selectAll("path.d3plus_data").data(c).call(i,e).attr("d",l))}},{"../../../geom/largestRect.coffee":159,"../../../geom/path2poly.coffee":161,"./style.coffee":231}],217:[function(e,t,r){var n=e("../../../core/fetch/text.js"),a=e("../../../font/sizes.coffee"),o=e("../../../geom/largestRect.coffee"),i=e("./style.coffee");t.exports=function(e,t,r,s){var l=d3.svg.area().x(function(e){return e.d3plus.x}).y0(function(e){return e.d3plus.y0}).y1(function(e){return e.d3plus.y}).interpolate(e.shape.interpolate.value),u=d3.svg.area().x(function(e){return e.d3plus.x}).y0(function(e){return e.d3plus.y0}).y1(function(e){return e.d3plus.y0}).interpolate(e.shape.interpolate.value);r.append("path").attr("class","d3plus_data").attr("d",function(e){return u(e.values)}).call(i,e);var c={"font-weight":e.labels.font.weight,"font-family":e.labels.font.family.value};t.selectAll("path.d3plus_data").data(function(t){if(e.labels.value&&t.values.length>1){var r=d3.max(t.values,function(e){return e.d3plus.y0-e.d3plus.y}),i=!1;if(r>e.labels.font.size){var s=[],l=[],u=n(e,t);t.values.forEach(function(e){s.push([e.d3plus.x,e.d3plus.y]),l.push([e.d3plus.x,e.d3plus.y0])}),s=s.concat(l.reverse());var f=null;if(u.length){var d=a(u[0],c);f=d[0].width/d[0].height}i=o(s,{angle:d3.range(-70,71,1),aspectRatio:f,tolerance:0})}if(i&&i[0]){var p={w:~~i[0].width,h:~~i[0].height,x:~~i[0].cx,y:~~i[0].cy,angle:-1*i[0].angle,padding:2,names:u};p.translate=0!==i[0].angle?{x:p.x,y:p.y}:!1,p.w>=10&&p.h>=10&&(t.d3plus_label=p)}}return[t]}),e.draw.timing?t.selectAll("path.d3plus_data").transition().duration(e.draw.timing).attr("d",function(e){return l(e.values)}).call(i,e):t.selectAll("path.d3plus_data").attr("d",function(e){return l(e.values)}).call(i,e)}},{"../../../core/fetch/text.js":67,"../../../font/sizes.coffee":101,"../../../geom/largestRect.coffee":159,"./style.coffee":231}],218:[function(e,t,r){var n=(e("../../../core/fetch/text.js"),e("../../../geom/largestRect.coffee"),e("./style.coffee"));t.exports=function(e,t,r,a){function o(e){e.attr("transform","scale(1)")}function i(e){e.attr("transform",function(e){var t=Math.min(e.d3plus.width,e.d3plus.height),r=Math.floor(t/16);return"scale("+r+")"})}r.append("path").attr("class","d3plus_data").attr("d","M5-6.844L3.594-5.407L-2,0.188l-1.594-1.594L-5-2.844L-7.844,0l1.438,1.406l3,3L-2,5.843l1.406-1.438l7-7L7.844-4L5-6.844z").call(o).call(n,e),t.selectAll("path.d3plus_data").data(function(e){return[e]}),e.draw.timing?t.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(i).call(n,e):t.selectAll("path.d3plus_data").call(i).call(n,e)}},{"../../../core/fetch/text.js":67,"../../../geom/largestRect.coffee":159,"./style.coffee":231}],219:[function(e,t,r){var n,a,o,i;a=e("../../../core/fetch/value.coffee"),n=e("../../../core/fetch/color.coffee"),o=e("../../../color/lighter.coffee"),i=e("./segments.coffee"),t.exports=function(e,t,r){var a,s,l,u;return s=e.d3plus.shape||t.shape.value,"line"===t.shape.value&&"circle"!==s?"none":"area"===t.shape.value||"active"===s||"line"===t.shape.value?n(t,e):"temp"===s?r?n(t,e):"url(#d3plus_hatch_"+e.d3plus.id+")":e.d3plus["static"]?o(n(t,e),.75):(a=i(t,e,"active"),l=i(t,e,"temp"),u=i(t,e,"total"),!t.active.value&&!t.temp.value||a===!0||a&&u&&a>=u&&!l||a&&!u?n(t,e):t.active.spotlight.value?"#eee":o(n(t,e),.75))}},{"../../../color/lighter.coffee":46,"../../../core/fetch/color.coffee":64,"../../../core/fetch/value.coffee":68,"./segments.coffee":230}],220:[function(e,t,r){var n,a,o,i,s,l,u,c;n=e("../../../util/copy.coffee"),a=e("../../../network/distance.coffee"),o=e("../../../core/fetch/text.js"),i=e("../../../font/sizes.coffee"),l=e("../../../geom/largestRect.coffee"),u=e("../../../geom/path2poly.coffee"),c=e("./style.coffee"),s={},t.exports=function(e,t,r,f){var d,p;return d=d3.geo[e.coords.projection.value]().center(e.coords.center),e.zoom.scale||(e.zoom.scale=1),e.zoom.area=1/e.zoom.scale/e.zoom.scale,e.path=d3.geo.path().projection(d),r.append("path").attr("id",function(e){return e.id}).attr("class","d3plus_data").attr("d",e.path).call(c,e),e.draw.timing?t.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(c,e):t.selectAll("path.d3plus_data").call(c,e),p=e.old_height!==e.height.viz||e.height.changed||e.old_width!==e.width.viz||e.width.changed,e.old_height=e.height.viz,e.old_width=e.width.viz,e.coords.changed||p||e.coords.mute.changed||e.coords.solo.changed||e.type.changed?(e.zoom.bounds=null,e.zoom.reset=!0,e.zoom.coords={},t.each(function(t){var r,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S;if(t.geometry.coordinates.length>1){for(m=[],c=[],r=0,S=n(t),b=n(t),t.geometry.coordinates=t.geometry.coordinates.filter(function(t,n){var a;return S.geometry.coordinates=[t],a=e.path.area(S),a>0?(c.push(a),a>r&&(b.geometry.coordinates=[t],r=a),!0):!1}),p=e.path.centroid(b),j=n(t),M=t.geometry.coordinates,y=x=0,w=M.length;w>x;y=++x)d=M[y],S.geometry.coordinates=[d],m.push(a(e.path.centroid(S),p));g=m.reduce(function(e,t,r){return t&&e.push(c[r]/t),e},[]),v=d3.quantile(g,e.coords.threshold.value),j.geometry.coordinates=j.geometry.coordinates.filter(function(e,t){var r,n;return n=m[t],r=c[t],0===n||r/n>v}),h=b.geometry.coordinates[0],h&&"MultiPolygon"===b.geometry.type&&(h=h[0],b.geometry.coordinates[0]=h,b.geometry.type="Polygon")}else j=t,b=t,h=t.geometry.coordinates[0];return e.zoom.coords[t.d3plus.id]=j,f=e.path.bounds(j),_=o(e,t),delete t.d3plus_label,h&&_.length&&(k=u(e.path(b)),O={"font-weight":e.labels.font.weight,"font-family":e.labels.font.family.value},z=null,1===_[0].split(" ").length&&(E=i(_[0],O)[0],z=E.width/E.height),A=l(k,{angle:0,aspectRatio:z}),A&&(A=A[0],t.d3plus_label={anchor:"middle",valign:"center",h:A.height,w:A.width,x:A.cx,y:A.cy,names:_})),s[t.id]=t.d3plus_label,e.zoom.bounds?(e.zoom.bounds[0][0]>f[0][0]&&(e.zoom.bounds[0][0]=f[0][0]),e.zoom.bounds[0][1]>f[0][1]&&(e.zoom.bounds[0][1]=f[0][1]),e.zoom.bounds[1][0]<f[1][0]&&(e.zoom.bounds[1][0]=f[1][0]),e.zoom.bounds[1][1]<f[1][1]?e.zoom.bounds[1][1]=f[1][1]:void 0):e.zoom.bounds=f})):e.focus.value.length?void 0:(e.zoom.viewport=!1,t.each(function(e){return e.d3plus_label=s[e.id]}))}},{"../../../core/fetch/text.js":67,"../../../font/sizes.coffee":101,"../../../geom/largestRect.coffee":159,"../../../geom/path2poly.coffee":161,"../../../network/distance.coffee":164,"../../../util/copy.coffee":206,"./style.coffee":231}],221:[function(e,t,r){var n=e("./style.coffee");t.exports=function(e,t,r,a){function o(e){e.attr("d",d3.svg.symbol().type("cross").size(10))}function i(e){e.attr("d",d3.svg.symbol().type("cross").size(function(e){var t=Math.min(e.d3plus.width,e.d3plus.height);return d3.scale.pow().exponent(2)(t/2)}))}r.append("path").attr("class","d3plus_data").call(o).call(n,e),t.selectAll("path.d3plus_data").data(function(e){return[e]}),e.draw.timing?t.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(i).call(n,e):t.selectAll("path.d3plus_data").call(i).call(n,e)}},{"./style.coffee":231}],222:[function(e,t,r){var n=e("./style.coffee");t.exports=function(e,t,r,a){function o(e){e.attr("d",d3.svg.symbol().type("diamond").size(10))}function i(e){e.attr("d",d3.svg.symbol().type("diamond").size(function(e){var t=Math.min(e.d3plus.width,e.d3plus.height);return d3.scale.pow().exponent(2)(t/2)}))}r.append("path").attr("class","d3plus_data").call(o).call(n,e),t.selectAll("path.d3plus_data").data(function(e){return[e]}),e.draw.timing?t.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(i).call(n,e):t.selectAll("path.d3plus_data").call(i).call(n,e)}},{"./style.coffee":231}],223:[function(e,t,r){var n=e("./style.coffee");t.exports=function(e,t,r,a){function o(t,r,n,a){if(!r)var r=0;if("number"!=typeof n)var n=void 0;if("number"!=typeof a)var a=void 0;t.attrTween("d",function(t){if(void 0==n)var o=t.d3plus.r?t.d3plus.r:d3.max([t.d3plus.width,t.d3plus.height]);else var o=n;if(void 0==a)var i=t.d3plus.segments[t.d3plus.shape];else var i=a;e.arcs[t.d3plus.shape][t.d3plus.id]||(e.arcs[t.d3plus.shape][t.d3plus.id]={r:0},e.arcs[t.d3plus.shape][t.d3plus.id].a=2*Math.PI);var l=d3.interpolate(e.arcs[t.d3plus.shape][t.d3plus.id].r,o+r),u=d3.interpolate(e.arcs[t.d3plus.shape][t.d3plus.id].a,i);return function(r){return e.arcs[t.d3plus.shape][t.d3plus.id].r=l(r),e.arcs[t.d3plus.shape][t.d3plus.id].a=u(r),s(t)}})}function i(e){return e.d3plus.label?e.d3plus_label=e.d3plus.label:delete e.d3plus_label,[e]}e.arcs||(e.arcs={donut:{},active:{},temp:{}});var s=d3.svg.arc().startAngle(0).endAngle(function(t){var r=e.arcs[t.d3plus.shape][t.d3plus.id].a;return r>2*Math.PI?2*Math.PI:r}).innerRadius(function(t){if(t.d3plus["static"])return 0;var r=e.arcs[t.d3plus.shape][t.d3plus.id].r;return r*e.data.donut.size}).outerRadius(function(t){return e.arcs[t.d3plus.shape][t.d3plus.id].r});e.draw.timing?(a.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(o,0,0).each("end",function(t){delete e.arcs[t.d3plus.shape][t.d3plus.id]}),t.selectAll("path.d3plus_data").data(i).transition().duration(e.draw.timing).call(o).call(n,e),r.append("path").attr("class","d3plus_data").transition().duration(0).call(o,0,0).call(n,e).transition().duration(e.draw.timing).call(o).call(n,e)):(a.selectAll("path.d3plus_data").each(function(t){delete e.arcs[t.d3plus.shape][t.d3plus.id]}),r.append("path").attr("class","d3plus_data"),t.selectAll("path.d3plus_data").data(i).call(o).call(n,e))}},{"./style.coffee":231}],224:[function(e,t,r){var n=e("../../../util/child.coffee"),a=e("../../../util/closest.coffee"),o=e("../tooltip/create.js"),i=e("../../../client/pointer.coffee"),s=e("../../../core/fetch/value.coffee"),l=e("../../../core/fetch/color.coffee"),u=e("../../../core/fetch/text.js"),c=e("../../../color/legible.coffee"),f=e("../../../core/console/print.coffee"),d=e("../../../tooltip/remove.coffee"),p=e("./segments.coffee"),h=e("./fill.js"),v=e("../../../string/strip.js"),g=e("../../../client/touch.coffee"),m=e("../zoom/propagation.coffee"),y=e("../../../util/uniques.coffee"),x=e("../../../object/validate.coffee"),b=e("../zoom/direction.coffee"),w={arc:e("./arc.coffee"),area:e("./area.js"),check:e("./check.js"),coordinates:e("./coordinates.coffee"),cross:e("./cross.js"),diamond:e("./diamond.js"),donut:e("./donut.js"),line:e("./line.js"),rect:e("./rect.coffee"),triangle_down:e("./triangle_down.js"),triangle_up:e("./triangle_up.js"),whisker:e("./whisker.coffee")};t.exports=function(e){function t(t){if(!t.d3plus.id){t.d3plus.id="";for(var r=0;r<=e.depth.value;r++)t.d3plus.id+=s(e,t,e.id.nesting[r])+"_";t.d3plus.id+=O,["x","y"].forEach(function(r){if("discrete"==e[r].scale.value){var n=s(e,t,e[r].value);n.constructor===Date&&(n=n.getTime()),t.d3plus.id+="_"+n}}),t.d3plus.id=v(t.d3plus.id)}return t}function r(t,r){var n=e.types[e.type.value].scale,a=1;n&&(x[n]&&e.shape.value in n?a=n[e.shape.value]:"function"==typeof n?a=n(e,e.shape.value):"number"==typeof n&&(a=n)),a=r?a:1,t.attr("transform",function(e){if(["line","area","coordinates"].indexOf(O)<0){var t=e.d3plus.x||0,r=e.d3plus.y||0;return"translate("+t+","+r+")scale("+a+")"}return"scale("+a+")"})}function _(t){if(t&&e.g.edges.selectAll("g").size()>0){e.g.edge_hover.selectAll("*").remove(),e.g.edges.selectAll("g").each(function(r){var n=t[e.id.value],a=r[e.edges.source][e.id.value],o=r[e.edges.target][e.id.value];if(a==n||o==n){var i=e.g.edge_hover.node().appendChild(this.cloneNode(!0));d3.select(i).datum(r).attr("opacity",1).selectAll("line, path").datum(r)}});var r=e.edges.arrows.value;e.g.edge_hover.attr("opacity",0).selectAll("line, path").style("stroke",e.color.primary).style("stroke-width",function(){return e.edges.size.value?d3.select(this).style("stroke-width"):2*e.data.stroke.width}).attr("marker-start",function(t){var n=e.edges.arrows.direction.value;if("bucket"in t.d3plus)var a="_"+t.d3plus.bucket;else var a="";return"source"==n&&r?"url(#d3plus_edge_marker_highlight"+a+")":"none"}).attr("marker-end",function(t){var n=e.edges.arrows.direction.value;if("bucket"in t.d3plus)var a="_"+t.d3plus.bucket;else var a="";return"target"==n&&r?"url(#d3plus_edge_marker_highlight"+a+")":"none"}),e.g.edge_hover.selectAll("text").style("fill",e.color.primary),e.draw.timing?(e.g.edge_hover.transition().duration(e.timing.mouseevents).attr("opacity",1),e.g.edges.transition().duration(e.timing.mouseevents).attr("opacity",.5)):e.g.edge_hover.attr("opacity",1)}else e.draw.timing?(e.g.edge_hover.transition().duration(e.timing.mouseevents).attr("opacity",0).transition().selectAll("*").remove(),e.g.edges.transition().duration(e.timing.mouseevents).attr("opacity",1)):e.g.edge_hover.selectAll("*").remove()}var k=e.returned.nodes||[],z=e.returned.edges||[];e.draw.timing=k.length<e.data.large&&z.length<e.edges.large?e.timing.transitions:0;var A={arc:"arc",area:"area",check:"check",circle:"rect",coordinates:"coordinates",cross:"cross",donut:"donut",diamond:"diamond",line:"line",plus:"cross",rect:"rect",square:"rect",triangle_down:"triangle_down",triangle:"triangle_up",triangle_up:"triangle_up",whisker:"whisker"},j={};k.forEach(function(t){var r=t.d3plus&&t.d3plus.shape?t.d3plus.shape:e.shape.value;r in A&&(t.d3plus&&(t.d3plus.shape=r),r=A[r],j[r]||(j[r]=[]),j[r].push(t))});for(var M in A)if(!(A[M]in j)||0===d3.keys(j).length){var E=e.g.data.selectAll("g.d3plus_"+A[M]);e.draw.timing?E.transition().duration(e.draw.timing).attr("opacity",0).remove():E.remove()}for(var O in j){var S=e.g.data.selectAll("g.d3plus_"+O).data(j[O],function(r){if(r.d3plus||(r.d3plus={}),"coordinates"===O)return r.d3plus.id=r.id,r.id;if(!r.d3plus.id)if(r.values)r.values.forEach(function(e){e=t(e),e.d3plus.shape="circle"}),r.d3plus.id=r.key;else if(r=t(r),!r.d3plus.segments){r.d3plus.segments={donut:2*Math.PI};var n=p(e,r,"active"),a=p(e,r,"temp"),o=p(e,r,"total");o&&(r.d3plus.segments.active=n?n/o*2*Math.PI:0,r.d3plus.segments.temp=a?a/o*2*Math.PI+r.d3plus.segments.active:0)}return r.d3plus?r.d3plus.id:!1});if(e.draw.timing)var F=S.exit().transition().duration(e.draw.timing).attr("opacity",0).remove();else var F=S.exit().remove();e.draw.timing?S.transition().duration(e.draw.timing).call(r):S.call(r);var T=e.draw.timing?0:1,B=S.enter().append("g").attr("class","d3plus_"+O).attr("opacity",T).call(r);e.draw.timing&&B.transition().duration(e.draw.timing).attr("opacity",1),S.order(),e.dev.value&&f.time('drawing "'+O+'" shapes'),w[O](e,S,B,F,r),e.dev.value&&f.timeEnd('drawing "'+O+'" shapes'),["rect","donut"].indexOf(O)>=0&&e.types[e.type.value].fill&&(e.dev.value&&f.time('filling "'+O+'" shapes'),h(e,S,B,F,r),e.dev.value&&f.timeEnd('filling "'+O+'" shapes'))}if(_(),!g&&e.tooltip.value)e.g.data.selectAll("g").on(i.over,function(t){if(!(e.draw.frozen||t.d3plus&&t.d3plus["static"])){if(d3.select(this).style("cursor","pointer").transition().duration(e.timing.mouseevents).call(r,!0),d3.select(this).selectAll(".d3plus_data").transition().duration(e.timing.mouseevents).attr("opacity",1),e.covered=!1,t.values&&e.axes.discrete){var n="x"===e.axes.discrete?0:1,s=d3.mouse(e.container.value.node())[n],l=y(t.values,function(t){return t.d3plus[e.axes.discrete]}),u=a(l,s);t.d3plus_data=t.values[l.indexOf(u)],t.d3plus=t.values[l.indexOf(u)].d3plus}var c=t.d3plus_data?t.d3plus_data:t;o({vars:e,data:c}),"function"==typeof e.mouse?e.mouse(t.d3plus_data||t,e):e.mouse[i.over]&&e.mouse[i.over](t.d3plus_data||t,e),_(t)}}).on(i.move,function(t){if(!(e.draw.frozen||t.d3plus&&t.d3plus["static"])){{e.types[e.type.value].tooltip||"follow"}if(t.values&&e.axes.discrete){var r="x"===e.axes.discrete?0:1,n=d3.mouse(e.container.value.node())[r],s=y(t.values,function(t){return t.d3plus[e.axes.discrete]}),l=a(s,n);t.d3plus_data=t.values[s.indexOf(l)],t.d3plus=t.values[s.indexOf(l)].d3plus}var u=t.d3plus_data?t.d3plus_data:t;o({vars:e,data:u}),"function"==typeof e.mouse?e.mouse(t.d3plus_data||t,e):e.mouse[i.move]&&e.mouse[i.move](t.d3plus_data||t,e)}}).on(i.out,function(t){var a=n(this,d3.event.toElement);a||e.draw.frozen||t.d3plus&&t.d3plus["static"]||(d3.select(this).transition().duration(e.timing.mouseevents).call(r),d3.select(this).selectAll(".d3plus_data").transition().duration(e.timing.mouseevents).attr("opacity",e.data.opacity),e.covered||d(e.type.value),"function"==typeof e.mouse?e.mouse(t.d3plus_data||t,e):e.mouse[i.out]&&e.mouse[i.out](t.d3plus_data||t,e),_())});else{var C=function(){m(e,d3.event)};e.g.data.selectAll("g").on(i.over,C).on(i.move,C).on(i.out,C)}e.g.data.selectAll("g").on(i.click,function(t){if(!(d3.event.defaultPrevented||e.draw.frozen||t.d3plus&&t.d3plus["static"])){"function"==typeof e.mouse?e.mouse(t.d3plus_data||t,e):e.mouse[i.out]?e.mouse[i.out](t.d3plus_data||t,e):e.mouse[i.click]&&e.mouse[i.click](t.d3plus_data||t,e);var n=b(t.d3plus_data||t,e),a=e.id.solo.value,f=u(e,t)[0],p=c(l(e,t)),h=e.title.sub.value||!1,v=e.title.sub.font.color,g=e.title.total.font.color;if(t.d3plus.threshold&&t.d3plus.merged&&e.zoom.value)e.history.states.push(function(){e.self.id({solo:a}).title({sub:{font:{color:v},value:h},total:{font:{color:g}}}).draw()}),e.self.id({solo:a.concat(y(t.d3plus.merged,e.id.value,s,e))}).title({sub:{font:{color:p},value:f},total:{font:{color:p}}}).draw();else if(1===n&&e.zoom.value){var m=s(e,t.d3plus_data||t,e.id.value);e.history.states.push(function(){e.self.depth(e.depth.value-1).id({solo:a}).title({sub:{font:{color:v},value:h},total:{font:{color:g}}}).draw()}),e.self.depth(e.depth.value+1).id({solo:a.concat(m)}).title({sub:{font:{color:p},value:f},total:{font:{color:p}}}).draw()}else if(-1===n&&e.zoom.value&&e.history.states.length&&!e.tooltip.value["long"])e.history.back();else if(e.types[e.type.value].zoom&&e.zoom.value)_(),d3.select(this).transition().duration(e.timing.mouseevents).call(r),d3.select(this).selectAll(".d3plus_data").transition().duration(e.timing.mouseevents).attr("opacity",e.data.opacity),d(e.type.value),e.draw.update=!1,t&&t[e.id.value]!=e.focus.value[0]?e.self.focus(t[e.id.value]).draw():e.self.focus(!1).draw();else if(e.types[e.type.value].requirements.indexOf("focus")<0){_();var x=t.d3plus_data?t.d3plus_data:t;o({vars:e,data:x})}}})}},{"../../../client/pointer.coffee":40,"../../../client/touch.coffee":44,"../../../color/legible.coffee":45,"../../../core/console/print.coffee":53,"../../../core/fetch/color.coffee":64,"../../../core/fetch/text.js":67,"../../../core/fetch/value.coffee":68,"../../../object/validate.coffee":171,"../../../string/strip.js":174,"../../../tooltip/remove.coffee":202,"../../../util/child.coffee":204,"../../../util/closest.coffee":205,"../../../util/uniques.coffee":209,"../tooltip/create.js":237,"../zoom/direction.coffee":247,"../zoom/propagation.coffee":250,"./arc.coffee":216,"./area.js":217,"./check.js":218,"./coordinates.coffee":220,"./cross.js":221,"./diamond.js":222,"./donut.js":223,"./fill.js":226,"./line.js":228,"./rect.coffee":229,"./segments.coffee":230,"./triangle_down.js":232,"./triangle_up.js":233,"./whisker.coffee":234}],225:[function(e,t,r){var n=e("../../../util/buckets.coffee"),a=e("../../../geom/offset.coffee");t.exports=function(e){function t(t){t.attr("opacity",0).style("stroke-width",0).style("stroke",e.background.value).style("fill","none")}function r(t){var r=e.edges.arrows.value;t.attr("opacity",function(t){return"number"===h?p:"function"===h?p(t,e):v(t[p])}).style("stroke-width",function(t){return e.edges.scale(t[e.edges.size.value])}).style("stroke",e.edges.color).attr("marker-start",function(t){var n=e.edges.arrows.direction.value;if("bucket"in t.d3plus)var a="_"+t.d3plus.bucket;else var a="";return"source"==n&&r?"url(#d3plus_edge_marker_default"+a+")":"none"}).attr("marker-end",function(t){var n=e.edges.arrows.direction.value;if("bucket"in t.d3plus)var a="_"+t.d3plus.bucket;else var a="";return"target"==n&&r?"url(#d3plus_edge_marker_default"+a+")":"none"}).attr("vector-effect","non-scaling-stroke").attr("pointer-events","none")}function o(t){t.attr("x1",function(t){return t[e.edges.source].d3plus.edges[t[e.edges.target][e.id.value]].x}).attr("y1",function(t){return t[e.edges.source].d3plus.edges[t[e.edges.target][e.id.value]].y}).attr("x2",function(t){return t[e.edges.target].d3plus.edges[t[e.edges.source][e.id.value]].x}).attr("y2",function(t){return t[e.edges.target].d3plus.edges[t[e.edges.source][e.id.value]].y})}function i(e){e.attr("d",function(e){return g(e.d3plus.spline)})}function s(t){if(delete t.d3plus_label,e.g.edges.selectAll("line, path").size()<e.edges.large&&e.edges.label&&t[e.edges.label]){if("spline"in t.d3plus)var r=this.getTotalLength(),n=this.getPointAtLength(r/2),a=this.getPointAtLength(r/2-.1*r),o=this.getPointAtLength(r/2+.1*r),i=Math.atan2(o.y-a.y,o.x-a.x),s=i*(180/Math.PI),l=(this.parentNode.getBBox(),.8*r),u=n.x,c=n.y;else var f=(this.getBBox(),t[e.edges.source]),d=t[e.edges.target],p={x:f.d3plus.edges[d[e.id.value]].x,y:f.d3plus.edges[d[e.id.value]].y},h={x:d.d3plus.edges[f[e.id.value]].x,y:d.d3plus.edges[f[e.id.value]].y},v=h.x-p.x,g=h.y-p.y,n={x:h.x-v/2,y:h.y-g/2},i=Math.atan2(g,v),s=i*(180/Math.PI),r=Math.sqrt(v*v+g*g),l=r,u=n.x,c=n.y;l+=2*e.labels.padding;var m=0;e.edges.arrows.value&&(m="number"==typeof e.edges.arrows.value?e.edges.arrows.value:8,m/=e.zoom.behavior.scaleExtent()[1],l-=2*m),(-90>s||s>90)&&(s-=180),l*e.zoom.behavior.scaleExtent()[0]>20&&(t.d3plus_label={x:u,y:c,translate:{x:u,y:c},w:l,h:15+2*e.labels.padding,angle:s,anchor:"middle",valign:"center",color:e.edges.color,resize:!1,names:[e.format.value(t[e.edges.label])],background:1})}}var l=e.returned.edges||[],u=e.zoom.behavior.scaleExtent()[0];if("string"==typeof e.edges.size.value){var c=d3.extent(l,function(t){return t[e.edges.size.value]}),f=2*d3.min(e.returned.nodes||[],function(e){return e.d3plus.r})*e.edges.size.scale;e.edges.scale=d3.scale.sqrt().domain(c).range([e.edges.size.min,f*u])}else{var d="number"==typeof e.edges.size.value?e.edges.size.value:e.edges.size.min;e.edges.scale=function(){return d}}var p=e.edges.opacity.value,h=typeof p;if(e.edges.opacity.changed&&"string"===h)var v=e.edges.opacity.scale.value.domain(d3.extent(l,function(e){return e[p]})).range([e.edges.opacity.min.value,1]);var g=d3.svg.line().interpolate(e.edges.interpolate.value),m=e.edges.arrows.value?"string"==typeof e.edges.size.value?["default_0","default_1","default_2","highlight_0","highlight_1","highlight_2","focus_0","focus_1","focus_2"]:["default","highlight","focus"]:[];if("string"==typeof e.edges.size.value)for(var y=n(e.edges.scale.range(),4),x=[],b=0;3>b;b++)x.push(y[b+1]+(y[1]-y[0])*(b+2)*2);else var w="number"==typeof e.edges.arrows.value?e.edges.arrows.value:8,x="number"==typeof e.edges.size.value?e.edges.size.value/w:w;var _=e.defs.selectAll(".d3plus_edge_marker").data(m,String),k=function(t){t.attr("d",function(t){var r=t.split("_");if(2==r.length&&e.edges.scale){r=parseInt(r[1]);var n=x[r]}else var n=x;return"target"==e.edges.arrows.direction.value?"M 0,-"+n/2+" L "+.85*n+",0 L 0,"+n/2+" L 0,-"+n/2:"M 0,-"+n/2+" L -"+.85*n+",0 L 0,"+n/2+" L 0,-"+n/2}).attr("fill",function(t){var r=t.split("_")[0];return"default"==r?e.edges.color:"focus"==r?e.color.focus:e.color.primary}).attr("transform","scale("+1/u+")")};e.draw.timing?(_.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),_.select("path").transition().duration(e.draw.timing).attr("opacity",1).call(k)):(_.exit().remove(),_.select("path").attr("opacity",1).call(k));var z=e.draw.timing?0:1,A=_.enter().append("marker").attr("id",function(e){return"d3plus_edge_marker_"+e}).attr("class","d3plus_edge_marker").attr("orient","auto").attr("markerUnits","userSpaceOnUse").style("overflow","visible").append("path").attr("opacity",z).attr("vector-effect","non-scaling-stroke").call(k);e.draw.timing&&A.transition().duration(e.draw.timing).attr("opacity",1);var j="string"==typeof e.edges.size.value?n(e.edges.scale.domain(),4):null,M=e.edges.arrows.direction.value,E=l.filter(function(t){if(t.d3plus||(t.d3plus={}),t.d3plus.id="edge_"+t[e.edges.source][e.id.value]+"_"+t[e.edges.target][e.id.value],t.d3plus.spline!==!0){if(j){var r=t[e.edges.size.value];t.d3plus.bucket=r<j[1]?0:r<j[2]?1:2;var n=.85*x[t.d3plus.bucket]/u}else{delete t.d3plus.bucket;var n=.85*x/u}var o=t[e.edges.source],i=t[e.edges.target];if(!o.d3plus||!i.d3plus)return!1;var s=Math.atan2(o.d3plus.y-i.d3plus.y,o.d3plus.x-i.d3plus.x),l=Math.atan2(i.d3plus.y-o.d3plus.y,i.d3plus.x-o.d3plus.x),c="source"==M&&e.edges.arrows.value?o.d3plus.r+n:o.d3plus.r,f="target"==M&&e.edges.arrows.value?i.d3plus.r+n:i.d3plus.r,d=a(s,c,e.shape.value),p=a(l,f,e.shape.value);

return"edges"in o.d3plus||(o.d3plus.edges={}),o.d3plus.edges[i[e.id.value]]={x:o.d3plus.x-d.x,y:o.d3plus.y-d.y},"edges"in i.d3plus||(i.d3plus.edges={}),i.d3plus.edges[o[e.id.value]]={x:i.d3plus.x-p.x,y:i.d3plus.y-p.y},!0}return!1}),O=e.g.edges.selectAll("g.d3plus_edge_line").data(E,function(e){return e.d3plus.id}),S=l.filter(function(t){if(t.d3plus.spline){if(j){var r=t[e.edges.size.value];t.d3plus.bucket=r<j[1]?0:r<j[2]?1:2;var n=.85*x[t.d3plus.bucket]/u}else{delete t.d3plus.bucket;var n=.85*x/u}var o=t[e.edges.source],i=t[e.edges.target],s=o.d3plus.edges?o.d3plus.edges[i[e.id.value]]||{}:{},l=i.d3plus.edges?i.d3plus.edges[o[e.id.value]]||{}:{},c=e.edges.arrows.value&&"source"==M?n:0,f=e.edges.arrows.value&&"target"==M?n:0,d=.1,p=o.d3plus.x>i.d3plus.x?1-d:1+d,h=o.d3plus.x>i.d3plus.x?1+d:1-d,v="number"==typeof s.angle?s.angle:Math.atan2(o.d3plus.y-i.d3plus.y,o.d3plus.x-i.d3plus.x)*p,g=a(v,o.d3plus.r+c,e.shape.value),m="number"==typeof l.angle?l.angle:Math.atan2(i.d3plus.y-o.d3plus.y,i.d3plus.x-o.d3plus.x)*h,y=a(m,i.d3plus.r+f,e.shape.value),b=[o.d3plus.x-g.x,o.d3plus.y-g.y],w=s.offset?a(v,s.offset):!1,_=w?[b[0]-w.x,b[1]-w.y]:b,k=[i.d3plus.x-y.x,i.d3plus.y-y.y],z=l.offset?a(m,l.offset):!1,A=z?[k[0]-z.x,k[1]-z.y]:k,E=A[0]-_[0],O=A[1]-_[1],S="number"==typeof s.radius?s.radius:Math.sqrt(E*E+O*O)/4,F="number"==typeof l.radius?l.radius:Math.sqrt(E*E+O*O)/4,T=a(v,S-o.d3plus.r-2*c),B=a(m,F-i.d3plus.r-2*f);t.d3plus.spline=[b,k];var C=Math.abs(Math.atan2(o.d3plus.y-i.d3plus.y,o.d3plus.x-i.d3plus.x)).toFixed(5),I=Math.abs(v).toFixed(5),N=Math.abs(m-Math.PI).toFixed(5);return(I!==N||[I,N].indexOf(C)<0)&&(t.d3plus.spline.splice(1,0,[_[0]-T.x,_[1]-T.y],[A[0]-B.x,A[1]-B.y]),w&&t.d3plus.spline.splice(1,0,_),z&&t.d3plus.spline.splice(t.d3plus.spline.length-1,0,A)),!0}return!1}),F=e.g.edges.selectAll("g.d3plus_edge_path").data(S,function(e){return e.d3plus.id});e.draw.timing?(O.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),F.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),O.selectAll("text.d3plus_label, rect.d3plus_label_bg").transition().duration(e.draw.timing/2).attr("opacity",0).remove(),F.selectAll("text.d3plus_label, rect.d3plus_label_bg").transition().duration(e.draw.timing/2).attr("opacity",0).remove(),O.selectAll("line").data(function(e){return[e]}).transition().duration(e.draw.timing).call(o).call(r).each("end",s),F.selectAll("path").data(function(e){return[e]}).transition().duration(e.draw.timing).call(i).call(r).each("end",s),O.enter().append("g").attr("class","d3plus_edge_line").append("line").call(o).call(t).transition().duration(e.draw.timing).call(r).each("end",s),F.enter().append("g").attr("class","d3plus_edge_path").append("path").call(i).call(t).transition().duration(e.draw.timing).call(r).each("end",s)):(O.exit().remove(),F.exit().remove(),O.selectAll("text.d3plus_label, rect.d3plus_label_bg").remove(),F.selectAll("text.d3plus_label, rect.d3plus_label_bg").remove(),O.selectAll("line").data(function(e){return[e]}).call(o).call(r).call(s),F.selectAll("path").data(function(e){return[e]}).call(i).call(r).call(s),O.enter().append("g").attr("class","d3plus_edge_line").append("line").call(o).call(t).call(r).call(s),F.enter().append("g").attr("class","d3plus_edge_path").append("path").call(i).call(t).call(r).call(s))}},{"../../../geom/offset.coffee":160,"../../../util/buckets.coffee":203}],226:[function(e,t,r){var n=e("../../../util/copy.coffee"),a=e("../../../core/fetch/color.coffee"),o=(e("../../../core/fetch/value.coffee"),e("./segments.coffee")),i=e("./style.coffee");t.exports=function(e,t,r,s){function l(e){e.attr("x",0).attr("y",0).attr("width",0).attr("height",0)}function u(t,r){r||(r=0),t.attr("x",function(e){var t=e.d3plus.r?2*e.d3plus.r:e.d3plus.width;return-t/2-r/2}).attr("y",function(e){var t=e.d3plus.r?2*e.d3plus.r:e.d3plus.height;return-t/2-r/2}).attr("width",function(e){var t=e.d3plus.r?2*e.d3plus.r:e.d3plus.width;return t+r}).attr("height",function(e){var t=e.d3plus.r?2*e.d3plus.r:e.d3plus.height;return t+r}).attr("rx",function(t){var n=t.d3plus.r?2*t.d3plus.r:t.d3plus.width,a=["circle","donut"].indexOf(e.shape.value)>=0;return a?(n+r)/2:0}).attr("ry",function(t){var n=t.d3plus.r?2*t.d3plus.r:t.d3plus.height,a=["circle","donut"].indexOf(e.shape.value)>=0;return a?(n+r)/2:0}).attr("shape-rendering",function(t){return["square"].indexOf(e.shape.value)>=0?e.shape.rendering.value:"auto"})}function c(t,r,n,a){r||(r=0),"number"!=typeof n&&(n=void 0),"number"!=typeof a&&(a=void 0),t.attrTween("d",function(t){if(void 0===n)var o=t.d3plus.r?t.d3plus.r:d3.max([t.d3plus.width,t.d3plus.height]);else var o=n;if(void 0===a)var i=t.d3plus.segments[t.d3plus.shape];else var i=a;e.arcs[t.d3plus.shape][t.d3plus.id]||(e.arcs[t.d3plus.shape][t.d3plus.id]={r:0},e.arcs[t.d3plus.shape][t.d3plus.id].a="donut"===t.d3plus.shape?2*Math.PI:0);var s=d3.interpolate(e.arcs[t.d3plus.shape][t.d3plus.id].r,o+r),l=d3.interpolate(e.arcs[t.d3plus.shape][t.d3plus.id].a,i);return function(r){return e.arcs[t.d3plus.shape][t.d3plus.id].r=s(r),e.arcs[t.d3plus.shape][t.d3plus.id].a=l(r),f(t)}})}e.arcs||(e.arcs={donut:{},active:{},temp:{}});var f=d3.svg.arc().startAngle(0).endAngle(function(t){var r=e.arcs[t.d3plus.shape][t.d3plus.id].a;return r>2*Math.PI?2*Math.PI:r}).innerRadius(function(t){if(t.d3plus["static"]||"donut"!==e.shape.value)return 0;var r=e.arcs[t.d3plus.shape][t.d3plus.id].r;return r*e.data.donut.size}).outerRadius(function(t){var r=e.arcs[t.d3plus.shape][t.d3plus.id].r;return"donut"===e.shape.value?r:2*r});t.each(function(t){function r(t){t.attr("stroke",h).attr("stroke-width",1).attr("shape-rendering",e.shape.rendering.value)}var s=o(e,t,"active"),f=o(e,t,"temp"),d=o(e,t,"total"),p=d3.select(this),h=a(e,t),v=[],g=[];if(d&&e.types[e.type.value].fill){if(f){var m=n(t);m.d3plus.shape="temp",v.push(m),g=["temp"]}if(s&&(d>s||f)){var m=n(t);m.d3plus.shape="active",v.push(m)}}var y=e.defs.selectAll("pattern#d3plus_hatch_"+t.d3plus.id).data(g);e.draw.timing?(y.selectAll("rect").transition().duration(e.draw.timing).style("fill",h),y.selectAll("line").transition().duration(e.draw.timing).style("stroke",h)):(y.selectAll("rect").style("fill",h),y.selectAll("line").style("stroke",h));var x=y.enter().append("pattern").attr("id","d3plus_hatch_"+t.d3plus.id).attr("patternUnits","userSpaceOnUse").attr("x","0").attr("y","0").attr("width","10").attr("height","10").append("g");x.append("rect").attr("x","0").attr("y","0").attr("width","10").attr("height","10").attr("fill",h).attr("fill-opacity",.25),x.append("line").attr("x1","0").attr("x2","10").attr("y1","0").attr("y2","10").call(r),x.append("line").attr("x1","-1").attr("x2","1").attr("y1","9").attr("y2","11").call(r),x.append("line").attr("x1","9").attr("x2","11").attr("y1","-1").attr("y2","1").call(r);var b=v.length?[t]:[],w=p.selectAll("#d3plus_clip_"+t.d3plus.id).data(b);w.enter().insert("clipPath",".d3plus_mouse").attr("id","d3plus_clip_"+t.d3plus.id).append("rect").attr("class","d3plus_clipping").call(l),e.draw.timing?(w.selectAll("rect").transition().duration(e.draw.timing).call(u),w.exit().transition().delay(e.draw.timing).remove()):(w.selectAll("rect").call(u),w.exit().remove());var _=p.selectAll("path.d3plus_fill").data(v);_.transition().duration(e.draw.timing).call(i,e).call(c),_.enter().insert("path","rect.d3plus_mouse").attr("class","d3plus_fill").attr("clip-path","url(#d3plus_clip_"+t.d3plus.id+")").transition().duration(0).call(i,e).call(c,0,void 0,0).transition().duration(e.draw.timing).call(c).call(i,e),_.exit().transition().duration(e.draw.timing).call(c,0,void 0,0).remove()})}},{"../../../core/fetch/color.coffee":64,"../../../core/fetch/value.coffee":68,"../../../util/copy.coffee":206,"./segments.coffee":230,"./style.coffee":231}],227:[function(e,t,r){var n=e("../../../util/copy.coffee"),a=e("../../../core/fetch/text.js"),o=e("../../../core/fetch/value.coffee"),i=e("../../../color/mix.coffee"),s=e("../../../core/console/print.coffee"),l=(e("../../../client/rtl.coffee"),e("./segments.coffee")),u=e("./color.coffee"),c=e("../../../string/list.coffee"),f=e("../../../color/text.coffee"),d=e("../../../textwrap/textwrap.coffee");t.exports=function(e,t){var r=e.types[e.type.value].zoom?e.zoom.behavior.scaleExtent():[1,1],p=e.g[t].selectAll("g"),h=function(t){t.attr("opacity",function(t){var n=parseFloat(d3.select(this).attr("font-size"),10);return t.visible=n*(e.zoom.scale/r[1])>=2,t.visible?1:0})};if(remove=function(t){e.draw.timing?t.transition().duration(e.draw.timing).attr("opacity",0).remove():t.remove()},style=function(t){var n="bottom"===e.labels.valign.value?"top":"bottom";t.attr("font-weight",e.labels.font.weight).attr("font-family",e.labels.font.family.value).attr("pointer-events",function(e){return e.mouse?"auto":"none"}).attr("fill",function(t){if(t.color)return t.color;var r=u(t.parent,e),n=f(r),a=t.text?.15:1;return i(r,n,.2,a)}).each(function(t){if(t.resize instanceof Array){t.resize[0],t.resize[1]}var a=t.resize,o=!0;if(t.text){a instanceof Array||(a=[9,50],o=t.resize);var i=t.y-t.h*r[1]/2+t.padding/2;"bottom"===n&&(i+=t.h*r[1]/2),d().align("center").container(d3.select(this)).height(t.h*r[1]/2).padding(t.padding/2).resize(o).size(a).text(e.format.value(100*t.text,{key:"share",vars:e})).width(t.w*r[1]).valign(n).x(t.x-t.w*r[1]/2+t.padding/2).y(i).draw()}else{t.resize instanceof Array||(a=[7,40*(r[1]/r[0])],o=t.resize);var s="bottom"===e.labels.valign.value?t.share:0;d().align(t.anchor||e.labels.align.value).container(d3.select(this)).height(t.h*r[1]-t.share).padding(t.padding/2).resize(o).size(a).shape(t.shape||"square").text(t.names).valign(e.labels.valign.value).width(t.w*r[1]).x(t.x-t.w*r[1]/2+t.padding/2).y(t.y-t.h*r[1]/2+t.padding/2+s).draw()}}).attr("transform",function(e){var t=d3.select(this).attr("transform")||"",n=e.angle||0,a=e.translate&&e.translate.x?e.translate.x:0,o=e.translate&&e.translate.y?e.translate.y:0;return t.length&&(t=t.split(")").slice(-3).join(")")),"rotate("+n+","+a+","+o+")scale("+1/r[1]+")translate("+(e.x*r[1]-e.x)+","+(e.y*r[1]-e.y)+")"+t})},"edges"===t||e.labels.value){if(e.dev.value){var v="drawing "+t+" labels";s.time(v)}p.each(function(t){function i(t){var n="string"==typeof u.background?u.background:"none"===e.background.value?"#ffffff":e.background.value,a="string"==typeof u.background?u.background:n,o=u.angle||0,i=u.translate?M.x+M.width/2:0,s=u.translate?M.y+M.height/2:0,l="scale("+1/r[1]+")rotate("+o+","+i+","+s+")";t.attr("fill",a).attr(M).attr("transform",l)}var s=t.d3plus&&"label"in t.d3plus&&!t.d3plus.label,u=t.d3plus_label||null,f=t.d3plus_share,d=t.d3plus.text?t.d3plus.text:u&&u.names?u.names:e.labels.text.value?o(e,t,e.labels.text.value):a(e,t),p=u&&"group"in u?u.group:d3.select(this),v=0,g=e.types[e.type.value].fill;if(d instanceof Array||(d=[d]),u)if(["line","area"].indexOf(e.shape.value)>=0)var m=!0;else if(t&&"d3plus"in t)var y=l(e,t,"active"),x=l(e,t,"temp"),b=l(e,t,"total"),m=!x&&!y||y>=b||!y&&x>=b;if(s||!(u&&u.force||m)&&g)delete t.d3plus_label,d3.select(this).selectAll("text#d3plus_label_"+t.d3plus.id+", rect#d3plus_label_bg_"+t.d3plus.id).call(remove),e.g.labels.selectAll("text#d3plus_label_"+t.d3plus.id+", rect#d3plus_label_bg_"+t.d3plus.id).call(remove);else{if(f&&t.d3plus.share&&f.w-2*e.labels.padding>=10&&f.h-2*e.labels.padding>=10&&"middle"!=e.labels.valign.value){f.resize=e.labels.resize.value===!1?!1:f&&"resize"in f?f.resize:!0,f.padding=e.labels.padding,f.text=t.d3plus.share,f.parent=t;var w=p.selectAll("text#d3plus_share_"+t.d3plus.id).data([f],function(e){return e.w+""+e.h+e.text});e.draw.timing&&1===e.zoom.scale?(w.transition().duration(e.draw.timing/2).call(style),w.enter().append("text").attr("id","d3plus_share_"+t.d3plus.id).attr("class","d3plus_share").attr("opacity",0).call(style).transition().duration(e.draw.timing/2).delay(e.draw.timing/2).attr("opacity",1)):(w.attr("opacity",1).call(style),w.enter().append("text").attr("id","d3plus_share_"+t.d3plus.id).attr("class","d3plus_share").attr("opacity",1).call(style)),v=w.node().getBBox().height+e.labels.padding,w.exit().call(remove)}else p.selectAll("text.d3plus_share").call(remove);if(u&&(u.resize=e.labels.resize.value===!1?!1:u&&"resize"in u?u.resize:!0,u.padding="number"==typeof u.padding?u.padding:e.labels.padding),u&&u.w*r[1]-u.padding>=20&&u.h*r[1]-u.padding>=10&&d.length){for(var _=e.format.locale.value.ui.and,k=e.format.locale.value.ui.more,z=0;z<d.length;z++)d[z]instanceof Array&&(d[z]=c(d[z],_,3,k));u.names=d,u.share=v,u.parent=t;var w=p.selectAll("text#d3plus_label_"+t.d3plus.id).data([u],function(e){return e?e.w+"_"+e.h+"_"+e.x+"_"+e.y+"_"+e.names.join("_"):!1}),A=u.resize?void 0:e.labels.font.size*r[0]+"px";if(e.draw.timing&&1===e.zoom.scale?(w.transition().duration(e.draw.timing/2).call(style).call(h),w.enter().append("text").attr("font-size",A).attr("id","d3plus_label_"+t.d3plus.id).attr("class","d3plus_label").attr("opacity",0).call(style).transition().duration(e.draw.timing/2).delay(e.draw.timing/2).call(h)):(w.attr("opacity",1).call(style).call(h),w.enter().append("text").attr("font-size",A).attr("id","d3plus_label_"+t.d3plus.id).attr("class","d3plus_label").call(style).call(h)),w.exit().call(remove),0===w.size()||0===w.selectAll("tspan").size())delete t.d3plus_label,d3.select(this).selectAll("text#d3plus_label_"+t.d3plus.id+", rect#d3plus_label_bg_"+t.d3plus.id).call(remove),e.g.labels.selectAll("text#d3plus_label_"+t.d3plus.id+", rect#d3plus_label_bg_"+t.d3plus.id).call(remove);else{if(u.background){var j=["background"],M=n(w.node().getBBox());M.width+=e.labels.padding*r[0],M.height+=e.labels.padding*r[0],M.x-=e.labels.padding*r[0]/2,M.y-=e.labels.padding*r[0]/2;var E=w.attr("transform").split(")");M.y+=parseFloat(E[E.length-2].split(",")[1])}else var j=[],M={};var O=p.selectAll("rect#d3plus_label_bg_"+t.d3plus.id).data(j),S="number"==typeof u.background?u.background:"string"==typeof u.background?1:.6;e.draw.timing?(O.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),O.transition().duration(e.draw.timing).attr("opacity",S).call(i),O.enter().insert("rect",".d3plus_label").attr("id","d3plus_label_bg_"+t.d3plus.id).attr("class","d3plus_label_bg").attr("opacity",0).call(i).transition().duration(e.draw.timing).attr("opacity",S)):(O.exit().remove(),O.enter().insert("rect",".d3plus_label").attr("id","d3plus_label_bg_"+t.d3plus.id).attr("class","d3plus_label_bg"),O.attr("opacity",S).call(i))}}else delete t.d3plus_label,d3.select(this).selectAll("text#d3plus_label_"+t.d3plus.id+", rect#d3plus_label_bg_"+t.d3plus.id).call(remove),e.g.labels.selectAll("text#d3plus_label_"+t.d3plus.id+", rect#d3plus_label_bg_"+t.d3plus.id).call(remove)}}),e.dev.value&&s.timeEnd(v)}else{if(e.dev.value){var v="removing "+t+" labels";s.time(v)}p.selectAll("text.d3plus_label, rect.d3plus_label_bg").call(remove),e.g.labels.selectAll("text.d3plus_label, rect.d3plus_label_bg").call(remove),e.dev.value&&s.timeEnd(v)}}},{"../../../client/rtl.coffee":42,"../../../color/mix.coffee":47,"../../../color/text.coffee":51,"../../../core/console/print.coffee":53,"../../../core/fetch/text.js":67,"../../../core/fetch/value.coffee":68,"../../../string/list.coffee":173,"../../../textwrap/textwrap.coffee":199,"../../../util/copy.coffee":206,"./color.coffee":219,"./segments.coffee":230}],228:[function(e,t,r){function n(e){e.attr("x",function(e){return e.d3plus.x}).attr("y",function(e){return e.d3plus.y}).attr("width",0).attr("height",0)}function a(e,t){void 0===t&&(t=0),e.attr("x",function(e){var r=e.d3plus.r?2*e.d3plus.r:e.d3plus.width;return e.d3plus.x-(r/2+t/2)}).attr("y",function(e){var r=e.d3plus.r?2*e.d3plus.r:e.d3plus.height;return e.d3plus.y-(r/2+t/2)}).attr("width",function(e){var r=e.d3plus.r?2*e.d3plus.r:e.d3plus.width;return r+t}).attr("height",function(e){var r=e.d3plus.r?2*e.d3plus.r:e.d3plus.height;return r+t}).attr("rx",function(e){var r=e.d3plus.r?2*e.d3plus.r:e.d3plus.width;return(r+t)/2}).attr("ry",function(e){var r=e.d3plus.r?2*e.d3plus.r:e.d3plus.height;return(r+t)/2})}function o(e,t,r,n){var o=e.draw.timing?e.timing.mouseevents:0,i=n?r*n:r;o?(d3.select(t.parentNode).selectAll("path.d3plus_line").transition().duration(o).style("stroke-width",i),d3.select(t.parentNode).selectAll("rect").transition().duration(o).style("stroke-width",r).call(a,n)):(d3.select(t.parentNode).selectAll("path.d3plus_line").style("stroke-width",i),d3.select(t.parentNode).selectAll("rect").style("stroke-width",r).call(a,n))}var i=e("../../../util/copy.coffee"),s=e("../../../util/closest.coffee"),l=e("../../../client/pointer.coffee"),u=e("./style.coffee"),c=e("../../../core/fetch/value.coffee");t.exports=function(e,t,r,f){var d=d3.svg.line().x(function(e){return e.d3plus.x}).y(function(e){return e.d3plus.y}).interpolate(e.shape.interpolate.value),p=2*e.data.stroke.width,h=15>p?15:p,v=e[e.axes.discrete],g=v.ticks.values.map(function(e){return e.constructor===Date?e.getTime():e});t.each(function(t){var r=!1,f=[],m=[],y=i(t),x=d3.select(this);y.values=[],y.segment_key=y.key,t.values.forEach(function(n,a,o){var l=c(e,n,v.value);l.constructor===Date&&(l=l.getTime());var u=g.indexOf(s(g,l));r===!1||r===u-1?(y.values.push(n),y.segment_key+="_"+u):(y.values.length>1?f.push(y):m.push(y.values[0]),y=i(t),y.values=[n]),a===o.length-1&&(y.values.length>1?f.push(y):m.push(y.values[0])),r=u});var b=x.selectAll("path.d3plus_line").data(f,function(e){return e.d3plus||(e.d3plus={}),e.d3plus.shape="line",e.segment_key}),w=x.selectAll("rect.d3plus_anchor").data(m,function(t){return t.d3plus||(t.d3plus={}),t.d3plus.r=2*e.data.stroke.width,t.d3plus.id});e.draw.timing?(b.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),b.transition().duration(e.draw.timing).attr("d",function(e){return d(e.values)}).call(u,e),b.enter().append("path").attr("class","d3plus_line").style("stroke-linecap","round").attr("d",function(e){return d(e.values)}).call(u,e).attr("opacity",0).transition().duration(e.draw.timing).attr("opacity",1),w.enter().append("rect").attr("class","d3plus_anchor").attr("id",function(e){return e.d3plus.id}).call(n).call(u,e),w.transition().duration(e.draw.timing).call(a).call(u,e),w.exit().transition().duration(e.draw.timing).call(n).remove()):(b.exit().remove(),b.enter().append("path").attr("class","d3plus_line").style("stroke-linecap","round"),b.attr("d",function(e){return d(e.values)}).call(u,e),w.enter().append("rect").attr("class","d3plus_anchor").attr("id",function(e){return e.d3plus.id}),w.exit().remove(),w.call(a).call(u,e));var _=x.selectAll("path.d3plus_mouse").data(f,function(e){return e.segment_key});_.enter().append("path").attr("class","d3plus_mouse").attr("d",function(e){return d(e.values)}).style("stroke","black").style("stroke-width",h).style("fill","none").style("stroke-linecap","round").attr("opacity",0),_.on(l.over,function(t){e.draw.frozen||o(e,this,p,2)}).on(l.out,function(t){e.draw.frozen||o(e,this,p,0)}),e.draw.timing?_.transition().duration(e.draw.timing).attr("d",function(e){return d(e.values)}).style("stroke-width",h):_.attr("d",function(e){return d(e.values)}).style("stroke-width",h),_.exit().remove()})}},{"../../../client/pointer.coffee":40,"../../../core/fetch/value.coffee":68,"../../../util/closest.coffee":205,"../../../util/copy.coffee":206,"./style.coffee":231}],229:[function(e,t,r){var n;n=e("./style.coffee"),t.exports=function(e,t,r,a){var o,i,s;return o=function(t){var r,n;return e.labels.value&&!t.d3plus.label?(n=t.d3plus.r?2*t.d3plus.r:t.d3plus.width,r=t.d3plus.r?2*t.d3plus.r:t.d3plus.height,t.d3plus_label={w:n,h:r,x:0,y:0},t.d3plus_share={w:n,h:r,x:0,y:0},t.d3plus_label.shape="circle"===t.d3plus.shape?"circle":"square"):t.d3plus.label?t.d3plus_label=t.d3plus.label:delete t.d3plus_label,[t]},i=function(e){return e.attr("x",function(e){return e.d3plus.init&&"x"in e.d3plus.init?e.d3plus.init.x:e.d3plus.init&&"width"in e.d3plus.init?-e.d3plus.width/2:0}).attr("y",function(e){return e.d3plus.init&&"y"in e.d3plus.init?e.d3plus.init.y:e.d3plus.init&&"height"in e.d3plus.init?-e.d3plus.height/2:0}).attr("width",function(e){return e.d3plus.init&&"width"in e.d3plus.init?e.d3plus.init.width:0}).attr("height",function(e){return e.d3plus.init&&"height"in e.d3plus.init?e.d3plus.init.height:0})},s=function(t){return t.attr("x",function(e){var t;return t=e.d3plus.r?2*e.d3plus.r:e.d3plus.width,-t/2}).attr("y",function(e){var t;return t=e.d3plus.r?2*e.d3plus.r:e.d3plus.height,-t/2}).attr("width",function(e){return e.d3plus.r?2*e.d3plus.r:e.d3plus.width}).attr("height",function(e){return e.d3plus.r?2*e.d3plus.r:e.d3plus.height}).attr("rx",function(e){var t,r;return t="circle"===e.d3plus.shape,r=e.d3plus.r?2*e.d3plus.r:e.d3plus.width,t?(r+2)/2:0}).attr("ry",function(e){var t,r;return r="circle"===e.d3plus.shape,t=e.d3plus.r?2*e.d3plus.r:e.d3plus.height,r?(t+2)/2:0}).attr("transform",function(e){return"rotate"in e.d3plus?"rotate("+e.d3plus.rotate+")":""}).attr("shape-rendering",function(t){return"square"!==t.d3plus.shape||"rotate"in t.d3plus?"auto":e.shape.rendering.value})},e.draw.timing?(r.append("rect").attr("class","d3plus_data").call(i).call(n,e),t.selectAll("rect.d3plus_data").data(o).transition().duration(e.draw.timing).call(s).call(n,e),a.selectAll("rect.d3plus_data").transition().duration(e.draw.timing).call(i)):(r.append("rect").attr("class","d3plus_data"),t.selectAll("rect.d3plus_data").data(o).call(s).call(n,e))}},{"./style.coffee":231}],230:[function(e,t,r){var n;n=e("../../../core/fetch/value.coffee"),t.exports=function(e,t,r){var a;return a=e[r].value,a?r in t.d3plus?t.d3plus[r]:n(e,t,a):t.d3plus[r]}},{"../../../core/fetch/value.coffee":68}],231:[function(e,t,r){var n,a;n=e("./color.coffee"),a=e("../../../client/ie.js"),t.exports=function(e,t){return e.attr("fill",function(e){return e.d3plus&&e.d3plus.spline?"none":n(e,t)}).style("stroke",function(e){var r;return e.d3plus&&e.d3plus.stroke?e.d3plus.stroke:(r=e.values?n(e.values[0],t):n(e,t,!0),d3.rgb(r).darker(.6))}).style("stroke-width",function(e){var r;return a&&t.types[t.type.value].zoom?0:(r="line"===e.d3plus.shape?2:1,t.data.stroke.width*r)}).attr("opacity",t.data.opacity).attr("vector-effect","non-scaling-stroke")}},{"../../../client/ie.js":39,"./color.coffee":219}],232:[function(e,t,r){var n=e("./style.coffee");t.exports=function(e,t,r,a){function o(e){e.attr("d",d3.svg.symbol().type("triangle-down").size(10))}function i(e){e.attr("d",d3.svg.symbol().type("triangle-down").size(function(e){var t=Math.min(e.d3plus.width,e.d3plus.height);return d3.scale.pow().exponent(2)(t/2)}))}r.append("path").attr("class","d3plus_data").call(o).call(n,e),t.selectAll("path.d3plus_data").data(function(e){return[e]}),e.draw.timing?t.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(i).call(n,e):t.selectAll("path.d3plus_data").call(i).call(n,e)}},{"./style.coffee":231}],233:[function(e,t,r){var n=e("./style.coffee");t.exports=function(e,t,r,a){function o(e){e.attr("d",d3.svg.symbol().type("triangle-up").size(10))}function i(e){e.attr("d",d3.svg.symbol().type("triangle-up").size(function(e){var t=Math.min(e.d3plus.width,e.d3plus.height);return d3.scale.pow().exponent(2)(t/2)}))}r.append("path").attr("class","d3plus_data").call(o).call(n,e),t.selectAll("path.d3plus_data").data(function(e){return[e]}),e.draw.timing?t.selectAll("path.d3plus_data").transition().duration(e.draw.timing).call(i).call(n,e):t.selectAll("path.d3plus_data").call(i).call(n,e)}},{"./style.coffee":231}],234:[function(e,t,r){t.exports=function(e,t,r,n){var a,o,i,s,l,u,c,f,d;o=function(e){return e.d3plus.text?e.d3plus_label={w:f,h:f,x:0,y:0,background:"#fff",resize:!1,angle:["left","right"].indexOf(e.d3plus.position)>=0?90:0}:e.d3plus.label?e.d3plus_label=e.d3plus.label:delete e.d3plus_label,[e]},d=function(t){return t.style("stroke-width",e.data.stroke.width).style("stroke","#444").attr("fill","none").attr("shape-rendering",e.shape.rendering.value)},i=function(e){return e.attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",0)},c=function(e){return e.attr("x1",function(e){var t,r,n;return["top","bottom"].indexOf(e.d3plus.position)>=0?0:(t=e.d3plus.offset||0,r=e.d3plus.width||0,n=0>t?-r:r,n+t)}).attr("x2",function(e){return["top","bottom"].indexOf(e.d3plus.position)>=0?0:e.d3plus.offset||0}).attr("y1",function(e){var t,r,n;return["left","right"].indexOf(e.d3plus.position)>=0?0:(r=e.d3plus.offset||0,t=e.d3plus.height||0,n=0>r?-t:t,n+r)}).attr("y2",function(e){return["left","right"].indexOf(e.d3plus.position)>=0?0:e.d3plus.offset||0}).attr("marker-start","url(#d3plus_whisker_marker)")},s=e.defs.selectAll("#d3plus_whisker_marker").data([0]),s.enter().append("marker").attr("id","d3plus_whisker_marker").attr("markerUnits","userSpaceOnUse").style("overflow","visible").append("line"),a=t.datum(),a?(u=a.d3plus.position,l=["top","bottom"].indexOf(u)>=0?"horizontal":"vertical",f="horizontal"===l?a.d3plus.width:a.d3plus.height):(l="horizontal",f=0),s.select("line").attr("x1","horizontal"===l?-f/2:0).attr("x2","horizontal"===l?f/2:0).attr("y1","vertical"===l?-f/2:0).attr("y2","vertical"===l?f/2:0).call(d).style("stroke-width",2*e.data.stroke.width),e.draw.timing?(r.append("line").attr("class","d3plus_data").call(d).call(i),t.selectAll("line.d3plus_data").data(o).transition().duration(e.draw.timing).call(d).call(c),n.selectAll("line.d3plus_data").transition().duration(e.draw.timing).call(i)):(r.append("line").attr("class","d3plus_data"),t.selectAll("line.d3plus_data").data(o).call(d).call(c))}},{}],235:[function(e,t,r){var n=e("../../../client/pointer.coffee"),a=e("../../../client/prefix.coffee"),o=e("../../../core/console/print.coffee"),i=e("../../../client/touch.coffee"),s=e("../zoom/propagation.coffee");t.exports=function(e){e.dev.value&&o.time("creating SVG elements"),e.svg=e.container.value.selectAll("svg#d3plus").data([0]),e.svg.enter().insert("svg","#d3plus_message").attr("id","d3plus").attr("width",e.width.value).attr("height",e.height.value).attr("xmlns","http://www.w3.org/2000/svg").attr("xmlns:xmlns:xlink","http://www.w3.org/1999/xlink"),e.g.bg=e.svg.selectAll("rect#bg").data(["bg"]),e.g.bg.enter().append("rect").attr("id","bg").attr("fill",e.background.value).attr("width",e.width.value).attr("height",e.height.value),e.g.timeline=e.svg.selectAll("g#timeline").data(["timeline"]),e.g.timeline.enter().append("g").attr("id","timeline").attr("transform","translate(0,"+e.height.value+")"),e.g.legend=e.svg.selectAll("g#key").data(["key"]),e.g.legend.enter().append("g").attr("id","key").attr("transform","translate(0,"+e.height.value+")"),e.g.footer=e.svg.selectAll("g#footer").data(["footer"]),e.g.footer.enter().append("g").attr("id","footer").attr("transform","translate(0,"+e.height.value+")");var t="clipping_"+e.container.id;if(e.g.clipping=e.svg.selectAll("#clipping").data(["clipping"]),e.g.clipping.enter().append("clipPath").attr("id",t).append("rect").attr("width",e.width.viz).attr("height",e.height.viz),e.g.container=e.svg.selectAll("g#container").data(["container"]),e.g.container.enter().append("g").attr("id","container").attr("clip-path","url(#"+t+")").attr("transform","translate("+e.margin.left+","+e.margin.top+")"),e.g.zoom=e.g.container.selectAll("g#zoom").data(["zoom"]),e.g.zoom.enter().append("g").attr("id","zoom"),e.g.viz=e.g.zoom.selectAll("g#d3plus_viz").data(["d3plus_viz"]),e.g.viz.enter().append("g").attr("id","d3plus_viz"),e.g.overlay=e.g.viz.selectAll("rect#d3plus_overlay").data([{id:"d3plus_overlay"}]),e.g.overlay.enter().append("rect").attr("id","d3plus_overlay").attr("width",e.width.value).attr("height",e.height.value).attr("opacity",0),i){var r=function(){s(e,d3.event)};e.g.overlay.on(n.over,r).on(n.move,r).on(n.out,r)}else e.g.overlay.on(n.move,function(t){e.types[e.type.value].zoom&&e.zoom.pan.value&&e.zoom.behavior.scaleExtent()[0]<e.zoom.scale?d3.select(this).style("cursor",a()+"grab"):d3.select(this).style("cursor","auto")}).on(n.up,function(t){e.types[e.type.value].zoom&&e.zoom.pan.value&&e.zoom.behavior.scaleExtent()[0]<e.zoom.scale?d3.select(this).style("cursor",a()+"grab"):d3.select(this).style("cursor","auto")}).on(n.down,function(t){e.types[e.type.value].zoom&&e.zoom.pan.value&&e.zoom.behavior.scaleExtent()[0]<e.zoom.scale?d3.select(this).style("cursor",a()+"grabbing"):d3.select(this).style("cursor","auto")});e.g.app=e.g.viz.selectAll("g#app").data(["app"]),e.g.app.enter().append("g").attr("id","app"),e.g.edges=e.g.viz.selectAll("g#edges").data(["edges"]),e.g.edges.enter().append("g").attr("id","edges").attr("opacity",0),e.g.edge_focus=e.g.viz.selectAll("g#focus").data(["focus"]),e.g.edge_focus.enter().append("g").attr("id","focus"),e.g.edge_hover=e.g.viz.selectAll("g#edge_hover").data(["edge_hover"]),e.g.edge_hover.enter().append("g").attr("id","edge_hover").attr("opacity",0),e.g.data=e.g.viz.selectAll("g#data").data(["data"]),e.g.data.enter().append("g").attr("id","data").attr("opacity",0),e.g.data_focus=e.g.viz.selectAll("g#data_focus").data(["data_focus"]),e.g.data_focus.enter().append("g").attr("id","data_focus"),e.g.labels=e.g.viz.selectAll("g#d3plus_labels").data(["d3plus_labels"]),e.g.labels.enter().append("g").attr("id","d3plus_labels"),e.defs=e.svg.selectAll("defs").data(["defs"]),e.defs.enter().append("defs"),e.dev.value&&o.timeEnd("creating SVG elements")}},{"../../../client/pointer.coffee":40,"../../../client/prefix.coffee":41,"../../../client/touch.coffee":44,"../../../core/console/print.coffee":53,"../zoom/propagation.coffee":250}],236:[function(e,t,r){var n=e("../../../core/console/print.coffee");t.exports=function(e){e.dev.value&&n.time("updating SVG elements"),e.draw.timing?(e.container.value.transition().duration(e.draw.timing).style("width",e.width.value+"px").style("height",e.height.value+"px"),e.svg.transition().duration(e.draw.timing).attr("width",e.width.value).attr("height",e.height.value),e.g.bg.transition().duration(e.draw.timing).attr("width",e.width.value).attr("height",e.height.value),e.g.clipping.select("rect").transition().duration(e.draw.timing).attr("width",e.width.viz).attr("height",e.height.viz),e.g.container.transition().duration(e.draw.timing).attr("transform","translate("+e.margin.left+","+e.margin.top+")")):(e.container.value.style("width",e.width.value+"px").style("height",e.height.value+"px"),e.svg.attr("width",e.width.value).attr("height",e.height.value),e.g.bg.attr("width",e.width.value).attr("height",e.height.value),e.g.clipping.select("rect").attr("width",e.width.viz).attr("height",e.height.viz),e.g.container.attr("transform","translate("+e.margin.left+","+e.margin.top+")")),e.dev.value&&n.timeEnd("updating SVG elements")}},{"../../../core/console/print.coffee":53}],237:[function(e,t,r){var n=e("../../../array/sort.coffee"),a=e("../../../tooltip/create.js"),o=e("../../../core/data/nest.js"),i=e("./data.js"),s=e("../../../core/fetch/color.coffee"),l=e("../../../core/fetch/text.js"),u=e("../../../core/fetch/value.coffee"),c=e("../../../object/merge.coffee"),f=e("../../../tooltip/remove.coffee"),d=e("../shapes/segments.coffee"),p=e("../../../util/uniques.coffee"),h=e("../../../object/validate.coffee"),v=e("../zoom/direction.coffee");t.exports=function(e){function t(t){function v(e){return"string"==typeof r[e].value?r[e].value:r.format.locale.value.method[e]}var b,A="depth"in e?e.depth:m,j={},M=r.id.nesting[A+1]in g?A+1:A,T=r.id.nesting[M],B="merged"in g.d3plus?g.d3plus.merged:g[T];B instanceof Array||(B=[B]);var C=u(r,g,r.size.value);if(r.tooltip.children.value){if(B=B.slice(0),B.length>1&&h(B[0])&&(B=o(r,B,[T])),r.size.value&&h(B[0])){var I=[],N=B.filter(function(e){var t=u(r,e,r.size.value);return null===t||"d3plus"in e&&e.d3plus.merged?void I.push(e):!0});n(N,r.size.value,"desc",[],r),B=N.concat(I)}var P="short"===z?3:r.data.large,q=B.length,D=d3.min([q,P]);b={values:[]};for(var R=0;D>R&&B.length;R++){var U=B.shift(),V=l(r,U,M)[0],L=h(U)?u(r,U,T,M):U;if(L!==g[r.id.nesting[A]]&&V&&!b[V]){var Y=h(U)?u(r,U,r.size.value,T):null,H=s(r,U,T);b[V]=!Y||Y instanceof Array?"":r.format.value(Y,{key:r.size.value,vars:r,data:U});var X={};X[V]=b[V],b.values.push(X),H&&(b.d3plus_colors||(b.d3plus_colors={}),
b.d3plus_colors[V]=H)}else R--}q>D&&(b.d3plusMore=q-D)}g.d3plus.tooltip&&(j=c(j,g.d3plus.tooltip)),r.tooltip.size.value&&(C&&"number"!=typeof r.size.value&&(j[v("size")]=C),r.axes.opposite&&r[r.axes.opposite].value!==r.size.value&&(j[v(r.axes.opposite)]=u(r,g,r[r.axes.opposite].value)),r.color.valueScale&&(j[v("color")]=u(r,g,r.color.value)));var G=d(r,g,"active"),J=d(r,g,"temp"),W=d(r,g,"total");"number"==typeof G&&G>0&&W&&(j[v("active")]=G+"/"+W+" ("+r.format.value(G/W*100,{key:"share",vars:r,data:g})+")"),"number"==typeof J&&J>0&&W&&(j[v("temp")]=J+"/"+W+" ("+r.format.value(J/W*100,{key:"share",vars:r,data:g})+")"),r.tooltip.share.value&&g.d3plus.share&&(j.share=r.format.value(100*g.d3plus.share,{key:"share",vars:r,data:g}));var M="depth"in e?e.depth:m,Q=e.title||l(r,g,M)[0],K=p(g,r.icon.value,u,r,r.id.nesting[M]),Z=i(r,g,z,j,b,M);if(K=1===K.length&&"string"==typeof K[0]?K[0]:!1,Z.length>0||E||!g.d3plus_label&&"short"==z&&Q||g.d3plus_label&&(!("visible"in g.d3plus_label)||"visible"in g.d3plus_label&&g.d3plus_label.visible===!1)){Q||(Q=L);var M="d3plus"in g&&"merged"in g.d3plus?m-1:"depth"in e?e.depth:m;if(0>M&&(M=0),M=r.id.nesting[M],"string"==typeof r.icon.style.value)var $=r.icon.style.value;else if("object"==typeof r.icon.style.value&&r.icon.style.value[M])var $=r.icon.style.value[M];else var $="default";if(e.width)var ee=e.width;else if(_||0!=Z.length)var ee=r.tooltip.small;else var ee="auto";var te="long"!==e.length?d3.select("body"):r.container.value;!e.description&&g&&r.tooltip.sub.value&&(e.description=u(r,g,r.tooltip.sub.value)),a({align:k,arrow:x,locale:r.format.locale.value,background:r.tooltip.background,curtain:r.tooltip.curtain.color,curtainopacity:r.tooltip.curtain.opacity,fontcolor:r.tooltip.font.color,fontfamily:r.tooltip.font.family.value,fontsize:r.tooltip.font.size,fontweight:r.tooltip.font.weight,data:Z,color:s(r,g),allColors:!0,footer:e.footer===!1?e.footer:E,fullscreen:_,html:t,js:e.js,icon:K,id:w,max_height:e.maxheight,max_width:r.tooltip.small,mouseevents:y,offset:F,parent:te,style:$,title:Q,description:e.description,width:ee,x:O,y:S})}else f(w)}"d3plus"in e.data||(e.data.d3plus={});var r=e.vars,g=e.data,m="d3plus"in g&&"depth"in g.d3plus?g.d3plus.depth:r.depth.value,y=(e.ex,e.mouseevents?e.mouseevents:!1),x="arrow"in e?e.arrow:!0,b=u(r,g,r.id.value),w=e.id||r.type.value;if(!d3.event||"click"!=d3.event.type||!r.tooltip.html.value&&!r.tooltip.value["long"]||"fullscreen"in e){var _=!1,k=e.anchor||r.tooltip.anchor,z=e.length||"short",A=v(g,r);if(-1===A){var j=r.id.nesting[m-1];u(r,b,j)}if(1===A&&r.zoom.value)var M=r.format.value(r.format.locale.value.ui.expand);else if(-1===A&&r.zoom.value&&r.history.states.length&&!r.tooltip.value["long"])var M=r.format.value(r.format.locale.value.ui.collapse);else if(r.small||"short"!=z||!r.tooltip.html.value&&!r.tooltip.value["long"]||1===r.focus.value.length&&r.focus.value[0]==b)if("long"==z)var M=r.footer.value||"";else var M="";else var M=r.format.locale.value.ui.moreInfo;var E=M.length?r.format.value(M,{key:"footer",vars:r}):!1}else{var _=!0,x=!1,y=!0,z="long",E=r.footer.value;r.covered=!0}if("x"in e)var O=e.x;else if("static"===r.types[r.type.value].tooltip){var O=g.d3plus.x;r.zoom.translate&&r.zoom.scale&&(O=r.zoom.translate[0]+O*r.zoom.scale),O+=r.margin.left,"long"!==e.length&&(S+=window.scrollX,O+=r.container.value.node().getBoundingClientRect().left,O+=parseFloat(r.container.value.style("padding-left"),10))}else var O=d3.mouse(d3.select("html").node())[0];if("y"in e)var S=e.y;else if("static"==r.types[r.type.value].tooltip){var S=g.d3plus.y;r.zoom.translate&&r.zoom.scale&&(S=r.zoom.translate[1]+S*r.zoom.scale),S+=r.margin.top,"long"!==e.length&&(S+=window.scrollY,S+=r.container.value.node().getBoundingClientRect().top,S+=parseFloat(r.container.value.style("padding-top"),10))}else var S=d3.mouse(d3.select("html").node())[1];if("offset"in e)var F=e.offset;else if("static"==r.types[r.type.value].tooltip){var F=g.d3plus.r?g.d3plus.r:g.d3plus.height/2;r.zoom.scale&&(F*=r.zoom.scale)}else var F=3;if(_||"long"===e.length)if("string"==typeof r.tooltip.html.value)t(r.tooltip.html.value);else if("function"==typeof r.tooltip.html.value)t(r.tooltip.html.value(b));else if(r.tooltip.html.value&&"object"==typeof r.tooltip.html.value&&r.tooltip.html.value.url){var T=r.tooltip.html.value.url;"function"==typeof T&&(T=T(b)),d3.json(T,function(e){var n=r.tooltip.html.value.callback?r.tooltip.html.value.callback(e):e;t(n)})}else t(e.html);else t(e.html)}},{"../../../array/sort.coffee":36,"../../../core/data/nest.js":61,"../../../core/fetch/color.coffee":64,"../../../core/fetch/text.js":67,"../../../core/fetch/value.coffee":68,"../../../object/merge.coffee":170,"../../../object/validate.coffee":171,"../../../tooltip/create.js":200,"../../../tooltip/remove.coffee":202,"../../../util/uniques.coffee":209,"../shapes/segments.coffee":230,"../zoom/direction.coffee":247,"./data.js":238}],238:[function(e,t,r){var n=e("../../../util/copy.coffee"),a=e("../../../core/fetch/value.coffee"),o=e("../../../core/fetch/color.coffee"),i=e("../../../core/fetch/text.js"),s=e("../../../color/legible.coffee"),l=e("../../../object/merge.coffee"),u=e("../../../client/prefix.coffee"),c=e("../../../string/format.js"),f=e("../../../object/validate.coffee");t.exports=function(e,t,r,d,p,h){function v(r,n){if(e.attrs.value[n])var o=n;else var o=null;n&&(n=e.format.value(n));var i=m[r]||a(e,t,r,o);if(f(i))w.push({name:e.format.value(r),value:e.format.value(i.value,{key:i.key,vars:e}),group:n});else if(null!=i&&"undefined"!=i&&!(i instanceof Array)&&("string"==typeof i&&i.indexOf("d3plus_other")<0||"string"!=typeof i)){var s=e.format.value(e.format.locale.value.ui[r]?e.format.locale.value.ui[r]:r),l=x.indexOf(r)>=0;i instanceof Array?i.forEach(function(n){n=e.format.value(n,{key:r,vars:e,data:t})}):i=e.format.value(i,{key:r,vars:e,data:t});var u={name:s,value:i,highlight:l,group:n};if(e.descs.value)if("function"==typeof e.descs.value){var c=e.descs.value(r);"string"==typeof c&&(u.desc=c)}else r in e.descs.value&&(u.desc=e.descs.value[r]);w.push(u)}}if(e.small)return[];if(!r)var r="long";if("long"==r)var g="short";else var g="long";var m={};if(d&&"string"==typeof d)d=[d];else if(d&&"object"==typeof d){m=l(m,d);var d=[];for(var y in m)d.push(y)}else if(!d)var d=[];var x=[];if(e.tooltip.value instanceof Array)var b=e.tooltip.value;else if("string"==typeof e.tooltip.value)var b=[e.tooltip.value];else{if(e.tooltip.value[e.id.nesting[h]])var b=e.tooltip.value[e.id.nesting[h]];else var b=e.tooltip.value;b instanceof Array||(b=b[r]?b[r]:b[g]?[]:l({"":[]},b)),"string"==typeof b?b=[b]:b instanceof Array||(b=l({"":[]},b))}var w=[];if(b.constructor===Array&&(b={"":b}),e.id.nesting.length&&h<e.id.nesting.length-1){var b=n(b);e.id.nesting.forEach(function(e,t){t>h&&b[e]&&delete b[e]})}for(var _ in b){b[_].constructor!==Array&&(b[_]=[b[_]]);for(var k=d.length;k>0;k--)b[_].indexOf(d[k-1])>=0&&d.splice(k-1,1)}if(e.tooltip.value["long"]&&"object"==typeof e.tooltip.value["long"]){for(var _ in e.tooltip.value["long"])for(var k=d.length;k>0;k--){var z=d[k-1];e.tooltip.value["long"][_].indexOf(z)>=0&&(b[_]||(b[_]=[]),b[_].push(z),d.splice(k-1,1))}}d.length&&(b[""]||(b[""]=[]),b[""]=b[""].concat(d));for(var _ in b)b[_].forEach(function(e){v(e,_)});if(p){var A=e.format.locale.value.ui.including,j=p.d3plus_colors;p.values.forEach(function(t){var r=d3.keys(t)[0];w.push({group:e.format.value(A),highlight:j&&j[r]?j[r]:!1,name:r,value:t[r]})}),p.d3plusMore&&w.push({group:e.format.value(A),highlight:!0,name:c(e.format.locale.value.ui.more,p.d3plusMore),value:""})}if(e.tooltip.connections.value&&"long"===r){var M=e.edges.connections(t[e.id.value],e.id.value,!0);M.length&&M.forEach(function(t){var r=e.data.viz.filter(function(r){return r[e.id.value]===t[e.id.value]}),r=r.length?r[0]:t,n=i(e,r)[0],a=o(e,r),l=e.tooltip.font.size,c="square"==e.shape.value?0:l;styles=["background-color: "+a,"border-color: "+s(a),"border-style: solid","border-width: "+e.data.stroke.width+"px","display: inline-block","height: "+l+"px","left: 0px","position: absolute","width: "+l+"px","top: 0px",u()+"border-radius: "+c+"px"],node="<div style='"+styles.join("; ")+";'></div>";var f=function(){e.self.focus([r[e.id.value]]).draw()};w.push({group:e.format.value(e.format.locale.value.ui.primary),highlight:!1,link:f,name:"<div id='d3plustooltipfocuslink_"+r[e.id.value]+"' class='d3plus_tooltip_focus_link' style='position:relative;padding-left:"+1.5*l+"px;'>"+node+n+"</div>"})})}return w}},{"../../../client/prefix.coffee":41,"../../../color/legible.coffee":45,"../../../core/fetch/color.coffee":64,"../../../core/fetch/text.js":67,"../../../core/fetch/value.coffee":68,"../../../object/merge.coffee":170,"../../../object/validate.coffee":171,"../../../string/format.js":172,"../../../util/copy.coffee":206}],239:[function(e,t,r){var n;n=e("../../../core/console/print.coffee"),t.exports=function(e){var t,r,a,o,i,s,l,u,c,f;if(e.group=e.g.apps[e.type.value],e.mouse={},f=e.types[e.type.value],u=f.requirements||[],a=u.indexOf("data")>=0,o=!a||a&&e.data.viz.length,!e.error.internal&&o){for(t=e.format.locale.value.visualization[e.type.value],e.dev.value&&n.time("running "+t),l=e.data.viz,i=0,s=l.length;s>i;i++)r=l[i],r.d3plus&&(delete r.d3plus.shape,delete r.d3plus.label,delete r.d3plus.rotate,delete r.d3plus.share);c=f(e),e.dev.value&&n.timeEnd("running "+t)}else c=null;e.returned={nodes:[],edges:null},c instanceof Array?e.returned.nodes=c:c&&(c.nodes&&(e.returned.nodes=c.nodes),c.edges&&(e.returned.edges=c.edges))}},{"../../../core/console/print.coffee":53}],240:[function(e,t,r){var n=e("../../../util/copy.coffee"),a=e("../../../form/form.js"),o=e("../../../core/console/print.coffee"),i=e("../../../object/validate.coffee");t.exports=function(e){var t=e.ui.value&&e.ui.value.length,r=e.ui.position.value;e.dev.value&&t&&o.time("drawing custom UI elements");var s=e.container.value.selectAll("div#d3plus_drawer").data(["d3plus_drawer"]);s.enter().append("div").attr("id","d3plus_drawer");var l={};e.ui.position.accepted.forEach(function(t){l[t]=t==r?e.margin.bottom+"px":"auto"}),s.style("text-align",e.ui.align.value).style("position","absolute").style("width",e.width.value-2*e.ui.padding+"px").style("height","auto").style(l);var u=s.selectAll("div.d3plus_drawer_ui").data(t?e.ui.value:[],function(e){return e.method||!1});u.enter().append("div").attr("class","d3plus_drawer_ui").style("padding",e.ui.padding+"px").style("display","inline-block").each(function(t){var r,n,o=d3.select(this);"string"==typeof t.method&&t.method in e?(r=e[t.method].value,n=function(r){r!==e[t.method].value&&e.self[t.method](r).draw()}):(r=t.value[0],i(r)&&(r=r[d3.keys(r)[0]]),"function"==typeof t.method&&(n=function(r){t.method(r,e.self)})),t.form=a().container(o).data({sort:!1}).focus(r,n).id("id").text("text")}),u.each(function(t){var r,a=[];t.label?r=t.label:"string"==typeof t.method&&t.method in e&&(r=e.format.locale.value.method[t.method]||t.method),t.value.forEach(function(t){var r={};i(t)?(r.id=t[d3.keys(t)[0]],r.text=e.format.value(d3.keys(t)[0])):(r.id=t,r.text=e.format.value(t)),a.push(r)});var o=n(e.ui.font);o.align=n(e.font.align),o.secondary=n(o),t.form.data(a).font(o).format(e.format.locale.language).title(e.format.value(r)).type(t.type||"auto").ui({align:e.ui.align.value,padding:e.ui.padding,margin:0}).width(t.width||!1).draw()}),u.exit().remove();var c=s.node().offsetHeight||s.node().getBoundingClientRect().height;c&&(e.margin[r]+=c),e.dev.value&&t&&o.timeEnd("drawing custom UI elements")}},{"../../../core/console/print.coffee":53,"../../../form/form.js":103,"../../../object/validate.coffee":171,"../../../util/copy.coffee":206}],241:[function(e,t,r){var n,a,o,i;n=e("../../../client/pointer.coffee"),a=e("../../../color/lighter.coffee"),o=e("../../../core/console/print.coffee"),i=e("../../../client/css.coffee"),t.exports=function(e){var t,r,s,l,u,c,f,d,p,h,v,g,m,y,x;return!e.small&&e.history.states.length>0?(e.dev.value&&o.time("drawing back button"),t=e.container.value.selectAll("div#d3plus_back_button").data(["d3plus_back_button"]).style("position","relative").style("z-index",1900),p=e.title.sub.font.size,r=e.title.sub.font.color,u=e.title.sub.font.family.value,x=e.title.sub.font.weight,d=e.title.sub.padding,g=!1,e.title.sub.value&&["start","left"].indexOf(e.title.sub.font.align)<0?g="sub":e.title.total.value&&["start","left"].indexOf(e.title.total.font.align)<0?g="total":e.title.value&&["start","left"].indexOf(e.title.font.align)<0&&(g="title"),g?(h=function(e){var t;return t=e.attr("transform").split(","),t=t[t.length-1],parseFloat(t.substring(0,t.length-1))},m=e.svg.select(".d3plus_title."+g),y=h(m)+h(m.select("text"))):(y=e.margin.top-e.title.padding,f=p+2*d,e.margin.top+=f),s=parseFloat(e.container.value.style("padding-top"),10),y+=s,s=parseFloat(e.container.value.style("padding-left"),10),c=e.margin.left+p/2+s,v=function(e){return e.style("position","absolute").style("left",c+"px").style("top",y+"px").style("color",r).style("font-family",u).style("font-weight",x).style("font-size",p+"px")},l=t.enter().append("div").attr("id","d3plus_back_button").style("opacity",0).call(v).html(function(){var t;return t=i("font-awesome")?"<i class='fa fa-angle-left' style='margin-top:2px;margin-right:4px;'></i>":"&laquo; ",t+e.format.value(e.format.locale.value.ui.back)}),t.on(n.over,function(){return!e.small&&e.history.states.length>0?d3.select(this).style("cursor","pointer").transition().duration(e.timing.mouseevents).style("color",a(r,.25)):void 0}).on(n.out,function(){return!e.small&&e.history.states.length>0?d3.select(this).style("cursor","auto").transition().duration(e.timing.mouseevents).style("color",r):void 0}).on(n.click,function(){return e.history.back()}).transition().duration(e.draw.timing).style("opacity",1).call(v),e.dev.value?o.timeEnd("drawing back button"):void 0):e.container.value.selectAll("div#d3plus_back_button").transition().duration(e.draw.timing).style("opacity",0).remove()}},{"../../../client/css.coffee":38,"../../../client/pointer.coffee":40,"../../../color/lighter.coffee":46,"../../../core/console/print.coffee":53}],242:[function(e,t,r){var n=e("../../../array/sort.coffee"),a=e("../../../util/buckets.coffee"),o=e("../../../util/copy.coffee"),i=e("../tooltip/create.js"),s=e("../../../core/data/nest.js"),l=e("../../../util/dataURL.coffee"),u=e("../../../client/pointer.coffee"),c=e("../../../core/fetch/value.coffee"),f=e("../../../core/fetch/color.coffee"),d=e("../../../core/fetch/text.js"),p=e("../../../core/console/print.coffee"),h=e("../../../tooltip/remove.coffee"),v=e("../../../color/text.coffee"),g=e("../../../util/uniques.coffee"),m=e("../../../string/strip.js"),y=e("../../../textwrap/textwrap.coffee"),x=e("../../../client/touch.coffee"),b=e("../../../object/validate.coffee");t.exports=function(e){function t(t){t.attr("transform",function(t,r){var n=T+r*(e.ui.padding+_);return"translate("+n+","+e.ui.padding+")"})}function r(t){t.attr("width",_).attr("height",_).attr("fill",function(t){d3.select(this.parentNode).select("text").remove();var r=g(t,e.icon.value,c,e,D),n=f(e,t,D);if(e.legend.icons.value&&1===r.length&&"string"==typeof r[0]){r=r[0];var a,o=m(r+"_"+n),i=e.icon.style.value,s=e.defs.selectAll("pattern#"+o).data([o]);a="string"==typeof i?e.icon.style.value:b(i)&&i[D]?i[D]:"default",n="knockout"==a?n:"none",s.select("rect").transition().duration(e.draw.timing).attr("fill",n).attr("width",_).attr("height",_),s.select("image").transition().duration(e.draw.timing).attr("width",_).attr("height",_);var u=s.enter().append("pattern").attr("id",o).attr("width",_).attr("height",_);return u.append("rect").attr("fill",n).attr("width",_).attr("height",_),u.append("image").attr("xlink:href",r).attr("width",_).attr("height",_).each(function(e){0===r.indexOf("/")||r.indexOf(window.location.hostname)>=0?l(r,function(e){s.select("image").attr("xlink:href",e)}):s.select("image").attr("xlink:href",r)}),"url(#"+o+")"}var p;if(p=e.legend.text.value?[c(e,t,e.legend.text.value,q)]:d(e,t,q),1===p.length&&!(p[0]instanceof Array)&&p[0].length){var h=d3.select(this.parentNode).append("text");h.attr("font-size",e.legend.font.size+"px").attr("font-weight",e.legend.font.weight).attr("font-family",e.legend.font.family.value).attr("fill",v(n)).attr("x",0).attr("y",0).each(function(t){y().align("middle").container(d3.select(this)).height(_).padding(e.ui.padding).resize(e.labels.resize.value).text(p[0]).width(_).valign("middle").draw()}),h.select("tspan").empty()&&h.remove()}return n})}var w=!0,_=0;if(!e.error.internal&&e.color.value&&!e.small&&e.legend.value)if(e.color.valueScale)if(e.color.valueScale){e.dev.value&&p.time("drawing color scale"),e.g.legend.selectAll("g.d3plus_color").transition().duration(e.draw.timing).attr("opacity",0).remove();var k=e.color.valueScale.domain(),z=e.color.valueScale.range();k.length<=2&&(k=a(k,6));var A=e.g.legend.selectAll("g.d3plus_scale").data(["scale"]);A.enter().append("g").attr("class","d3plus_scale").attr("opacity",0);var j=A.selectAll("#d3plus_legend_heatmap").data(["heatmap"]);j.enter().append("linearGradient").attr("id","d3plus_legend_heatmap").attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%").attr("spreadMethod","pad");var M=j.selectAll("stop").data(d3.range(0,z.length));M.enter().append("stop").attr("stop-opacity",1),M.attr("offset",function(e){return Math.round(e/(z.length-1)*100)+"%"}).attr("stop-color",function(e){return z[e]}),M.exit().remove();var E=A.selectAll("rect#gradient").data(["gradient"]);E.enter().append("rect").attr("id","gradient").attr("x",function(t){return"middle"==e.legend.align?e.width.value/2:"end"==e.legend.align?e.width.value:0}).attr("y",e.ui.padding).attr("width",0).attr("height",e.legend.gradient.height).attr("stroke",e.legend.font.color).attr("stroke-width",1).style("fill","url(#d3plus_legend_heatmap)");var O=A.selectAll("text.d3plus_tick").data(d3.range(0,k.length));O.enter().append("text").attr("class","d3plus_tick").attr("x",function(t){return"middle"==e.legend.align?e.width.value/2:"end"==e.legend.align?e.width.value:0}).attr("y",function(t){return this.getBBox().height+e.legend.gradient.height+2*e.ui.padding});var S=0;O.order().attr("font-weight",e.legend.font.weight).attr("font-family",e.legend.font.family.value).attr("font-size",e.legend.font.size+"px").style("text-anchor",e.legend.font.align).attr("fill",e.legend.font.color).text(function(t){return e.format.value(k[t],{key:key,vars:e})}).attr("y",function(t){return this.getBBox().height+e.legend.gradient.height+2*e.ui.padding}).each(function(e){var t=this.offsetWidth;t>S&&(S=t)}),S+=2*e.labels.padding;var F=S*(k.length-1);if(F+S<e.width.value){F+S<e.width.value/2&&(F=e.width.value/2,S=F/k.length,F-=S);var T;T="start"==e.legend.align?e.ui.padding:"end"==e.legend.align?e.width.value-e.ui.padding-F:e.width.value/2-F/2,O.transition().duration(e.draw.timing).attr("x",function(e){return T+S*e}),O.exit().transition().duration(e.draw.timing).attr("opacity",0).remove();var B=A.selectAll("rect.d3plus_tick").data(d3.range(0,k.length));B.enter().append("rect").attr("class","d3plus_tick").attr("x",function(t){return"middle"==e.legend.align?e.width.value/2:"end"==e.legend.align?e.width.value:0}).attr("y",e.ui.padding).attr("width",0).attr("height",e.ui.padding+e.legend.gradient.height).attr("fill",e.legend.font.color),B.transition().duration(e.draw.timing).attr("x",function(e){var t=0===e?1:0;return T+S*e-t}).attr("y",e.ui.padding).attr("width",1).attr("height",e.ui.padding+e.legend.gradient.height).attr("fill",e.legend.font.color),B.exit().transition().duration(e.draw.timing).attr("width",0).remove(),E.transition().duration(e.draw.timing).attr("x",function(t){return"middle"==e.legend.align?e.width.value/2-F/2:"end"==e.legend.align?e.width.value-F-e.ui.padding:e.ui.padding}).attr("y",e.ui.padding).attr("width",F).attr("height",e.legend.gradient.height),A.transition().duration(e.draw.timing).attr("opacity",1),e.dev.value&&p.timeEnd("drawing color scale")}else w=!1}else w=!1;else{e.dev.value&&p.time("grouping data by colors");var C;if(e.nodes.value&&e.types[e.type.value].requirements.indexOf("nodes")>=0){if(C=o(e.nodes.restriced||e.nodes.value),e.data.viz.length)for(var I=0;I<C.length;I++){var N=e.data.viz.filter(function(t){return t[e.id.value]===C[I][e.id.value]});N.length&&(C[I]=N[0])}}else C=e.data.viz;var P=function(t){return f(e,t,q)},q=0,D=e.id.value,R=e.id.nesting.indexOf(e.color.value);if(R>=0)q=R,D=e.id.nesting[R];else for(var U=0;U<=e.depth.value;U++){q=U,D=e.id.nesting[U];var V=g(C,function(t){return c(e,t,D)}),L=g(C,P);if(V.length>=L.length&&L.length>1)break}var Y=[e.color.value],z=s(e,C,Y,[]);e.dev.value&&p.timeEnd("grouping data by color");var H=e.width.value;_=e.legend.size;var F=_*z.length+e.ui.padding*(z.length+1);if(_ instanceof Array){e.dev.value&&p.time("calculating legend size");for(var I=_[1];I>=_[0];I--)if(F=I*z.length+e.ui.padding*(z.length+1),H>=F){_=I;break}e.dev.value&&p.timeEnd("calculating legend size")}else"number"!=typeof _&&_!==!1&&(_=30);if(F>H||1==z.length)w=!1;else{F-=2*e.ui.padding,e.dev.value&&p.time("sorting legend");var X=e[e.legend.order.value].value;n(z,X,e.legend.order.sort.value,e.color.value,e,q),e.dev.value&&p.timeEnd("sorting legend"),e.dev.value&&p.time("drawing legend");var T;T="start"==e.legend.align?e.ui.padding:"end"==e.legend.align?H-e.ui.padding-F:H/2-F/2,e.g.legend.selectAll("g.d3plus_scale").transition().duration(e.draw.timing).attr("opacity",0).remove();var G={},J=e.g.legend.selectAll("g.d3plus_color").data(z,function(t){var r=f(e,t,D);return r in G||(G[r]=-1),G[r]++,G[r]+"_"+r});J.enter().append("g").attr("class","d3plus_color").attr("opacity",0).call(t).append("rect").attr("class","d3plus_color").call(r),J.order().transition().duration(e.draw.timing).call(t).attr("opacity",1).selectAll("rect.d3plus_color").call(r),J.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),!x&&e.legend.tooltip.value&&J.on(u.over,function(t,r){d3.select(this).style("cursor","pointer");var n,a,o=this.getBoundingClientRect(),s=o.left+_/2+window.scrollX,l=o.top+_/2+window.scrollY+5,f=c(e,t,D),p=e.id.nesting.indexOf(D),h=p>=0?d(e,t,p)[0]:e.format.value(c(e,t,e.color.value,D),{key:e.color.value,vars:e,data:t});if(e.legend.filters.value&&!(f instanceof Array)){n="<div style='text-align:center;'>";var v=e.format.locale.value;n+="<div class='mute'>"+e.format.value(v.method.mute)+"</div>",n+="<div class='solo'>"+e.format.value(v.method.solo)+"</div>",n+="</div>",a=function(t){var r={border:"1px solid #ccc",display:"inline-block",margin:"1px 2px",padding:"3px 5px"};t.select(".mute").style(r).on(u.over,function(){d3.select(this).style("cursor","pointer")}).on(u.click,function(){var t=e.id.mute.value;e.history.states.push(function(){e.self.id({mute:t}).draw()}),e.self.id({mute:f}).draw()}),t.select(".solo").style(r).on(u.over,function(){d3.select(this).style("cursor","pointer")}).on(u.click,function(){var t=e.id.solo.value;e.history.states.push(function(){e.self.id({solo:t}).draw()}),e.self.id({solo:f}).draw()})}}i({data:t,html:n,js:a,depth:q,footer:!1,vars:e,x:s,y:l,mouseevents:this,title:h,offset:.4*_})}).on(u.out,function(t){h(e.type.value)}),e.dev.value&&p.timeEnd("drawing legend")}}else w=!1;if(e.legend.value&&key&&w){if(e.dev.value&&p.time("positioning legend"),_)var W=_+e.ui.padding;else var Q=e.g.legend.node().getBBox(),W=Q.height+Q.y;0===e.margin.bottom&&(e.margin.bottom+=e.ui.padding),e.margin.bottom+=W,e.g.legend.transition().duration(e.draw.timing).attr("transform","translate(0,"+(e.height.value-e.margin.bottom)+")"),e.dev.value&&p.timeEnd("positioning legend")}else e.dev.value&&p.time("hiding legend"),e.g.legend.transition().duration(e.draw.timing).attr("transform","translate(0,"+e.height.value+")"),e.dev.value&&p.timeEnd("hiding legend")}},{"../../../array/sort.coffee":36,"../../../client/pointer.coffee":40,"../../../client/touch.coffee":44,"../../../color/text.coffee":51,"../../../core/console/print.coffee":53,"../../../core/data/nest.js":61,"../../../core/fetch/color.coffee":64,"../../../core/fetch/text.js":67,"../../../core/fetch/value.coffee":68,"../../../object/validate.coffee":171,"../../../string/strip.js":174,"../../../textwrap/textwrap.coffee":199,"../../../tooltip/remove.coffee":202,"../../../util/buckets.coffee":203,"../../../util/copy.coffee":206,"../../../util/dataURL.coffee":208,"../../../util/uniques.coffee":209,"../tooltip/create.js":237}],243:[function(e,t,r){var n=e("../../../client/pointer.coffee");t.exports=function(e,t){function r(t){t.style(o).style("position","absolute").style("background","white").style("text-align","center").style("left",function(){return"center"==i?"50%":"0px"}).style("width",function(){return"center"==i?"auto":e.width.value+"px"}).style("margin-left",function(){return"center"==i?-(this.offsetWidth/2)+"px":"0px"}).style("top",function(){return"center"==i?"50%":"top"==i?"0px":"auto"}).style("bottom",function(){return"bottom"==i?"0px":"auto"}).style("margin-top",function(){if("large"==a){var e=this.offsetHeight||this.getBoundingClientRect().height;return-e/2+"px"}return"0px"})}t=e.messages.value?t:null;var a=e.messages.style.value||(t===e.error.internal?"large":e.messages.style.backup);if("large"===a)var o=e.messages,i="center";else{if(e.footer.value)var o=e.footer;else if(e.title.value)var o=e.title;else if(e.title.sub.value)var o=e.title.sub;else if(e.title.total.value)var o=e.title.total;else var o=e.title.sub;var i=o.position}var o={color:o.font.color,"font-family":o.font.family.value,"font-weight":o.font.weight,"font-size":o.font.size+"px",padding:o.padding+"px"};e.g.message=e.container.value.selectAll("div#d3plus_message").data(["message"]);var s=e.g.message.enter().append("div").attr("id","d3plus_message").attr("opacity",0);s.append("div").attr("class","d3plus_message_text").style("display","block"),e.g.message.select(".d3plus_message_text").text(t?t:e.g.message.text());var l=navigator.onLine,u=75,c=e.g.message.selectAll(".d3plus_message_branding").data(e.messages.branding.value&&"center"===i?[0]:[]);c.enter().append("div").attr("class","d3plus_message_branding").style("margin-top","15px").style("padding-top","0px").style("display","block").style("font-size","11px").style("background-size",u+"px").style("background-position","center 10px").style("background-repeat","no-repeat").style("cursor","pointer").on(n.click,function(){window.open("http://www.d3plus.org/","_blank")}),c.text(l?"Powered by:":"Powered by D3plus").style("background-color",l?"white":"transparent").style("background-image",l?"url('http://d3plus.org/assets/img/d3plus-icon.png')":"none").style("min-width",l?u+"px":"auto").style("height",l?u+"px":"auto"),c.exit().remove(),e.g.message.style("display",t?"inline-block":"none").call(r).style("opacity",t?1:0)}},{"../../../client/pointer.coffee":40}],244:[function(e,t,r){var n,a,o,i,s,l,u,c,f,d;n=e("../../../util/closest.coffee"),a=e("../../../client/css.coffee"),i=e("../../../font/sizes.coffee"),o=e("../../../client/pointer.coffee"),s=e("../../../color/mix.coffee"),u=e("../../../client/prefix.coffee"),c=e("../../../core/console/print.coffee"),f=e("../../../color/text.coffee"),d=e("../../../core/data/time.coffee"),l=!1,t.exports=function(e){var t,r,i,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R,U,V,L,Y,H,X,G,J,W,Q,K,Z,$,ee,te,re,ne,ae,oe;if(!e.timeline.value||e.error.internal&&e.data.missing||e.small||!e.data.time||!(e.data.time.values.length>1))return e.g.timeline.transition().duration(e.draw.timing).attr("transform","translate(0,"+e.height.value+")");if(e.dev.value&&c.time("drawing timeline"),Y={"font-weight":e.ui.font.weight,"font-family":e.ui.font.family.value,"font-size":e.ui.font.size+"px","text-anchor":"middle"},oe=e.data.time.ticks.map(function(e){return new Date(e)}),W=d(e,{values:oe,style:Y}),ee=W.values.map(Number),J=W.format,e.time.solo.value.length)for(w=d3.extent(e.time.solo.value),b=_=0,A=w.length;A>_;b=++_)m=w[b],m.constructor!==Date&&(m+="",4===m.length&&parseInt(m)+""===m&&(m+="/01/01"),m=new Date(m),w[b]=m);else w=d3.extent(oe);if(ae=oe.slice(),re=d3.max(W.sizes.map(function(e){return e.height})),k=~~d3.max(W.sizes.map(function(e){return e.width}))+1,k+=2*e.ui.padding,K=re+2*e.ui.padding,$=k*oe.length,N=K,t=e.width.value-2*e.ui.padding,e.timeline.play.value&&(t-=N+e.ui.padding),ee.length<oe.length||t<k*ee.length){for(O=k,k=(t-k)/oe.length,$=k*oe.length,Z=1,X=~~(O/($/ee.length))+1;X<ee.length-1&&(ee.length-1)%X!==0;)X++;ee=ee.filter(function(e,t){return t%X===0})}else Z=0,M=new Date(oe[0]),R=e.data.time.stepType,M["set"+R](M["get"+R]()+oe.length),ae.push(M);return q=new Date(w[0]),q=n(ae,q),y=new Date(w[1]),Z||y["set"+e.data.time.stepType](y["get"+e.data.time.stepType]()+1),y=n(ae,y),ne=ae.map(Number),E=ne.indexOf(+q),j=ne.indexOf(+y),p=[q,y],D="start"===e.timeline.align?e.ui.padding:"end"===e.timeline.align?e.width.value-e.ui.padding-$:e.width.value/2-$/2,e.timeline.play.value&&(D+=(N+e.ui.padding)/2),U=function(){return clearInterval(l),l=!1,F.call(T,"icon")},v=function(){var e,t,r;if(null!==d3.event.sourceEvent){if(l&&U(),p=i.extent(),r=n(ae,p[0]),t=n(ae,p[1]),r===t&&(E=ne.indexOf(+r),r<p[0]||0===E?t=ae[E+1]:r=ae[E-1]),E=ne.indexOf(+r),j=ne.indexOf(+t),j-E>=1)e=[r,t];else if(E+1<=oe.length)e=[r,ae[E+1]];else{for(e=[r],b=1;1>=b;)E+b<=oe.length?e.push(ae[E+b]):e.unshift(ae[E-(E+b-oe.length)]),b++;e=[e[0],e[e.length-1]]}return p=e,V.attr("fill",L),d3.select(this).call(i.extent(e))}},P=function(){var t;return j-E===oe.length-Z?t=[]:(t=ne.filter(function(e,t){return t>=E&&j+Z>t}),t=t.map(function(e){return new Date(e)})),I(),e.self.time({solo:t}).draw()},g=function(){var t,r,a,o;return null!==d3.event.sourceEvent&&(e.time.solo.value.length?(o=d3.extent(e.time.solo.value),a=ne.indexOf(+n(ae,o[0])),r=ne.indexOf(+n(ae,o[1])),t=a!==E||r!==j):t=j-E!==oe.length-Z,t)?P():void 0},S=e.g.timeline.selectAll("rect.d3plus_timeline_play").data(e.timeline.play.value?[0]:[]),C=function(t){return t.attr("width",N+1).attr("height",K+1).attr("fill",e.ui.color.primary.value).attr("stroke",e.ui.color.primary.value).attr("stroke-width",1).attr("x",D-N-1-e.ui.padding).attr("y",e.ui.padding)},S.enter().append("rect").attr("class","d3plus_timeline_play").attr("shape-rendering","crispEdges").attr("opacity",0).call(C),S.transition().duration(e.draw.timing).call(C),S.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),F=e.g.timeline.selectAll("text.d3plus_timeline_playIcon").data(e.timeline.play.value?[0]:[]),T=function(t,r){var n;return r=e.timeline.play[r],a("font-awesome")?(r=r.awesome,n="FontAwesome"):(r=r.fallback,n="inherit"),t.style("font-family",n).text(r)},B=function(t){var r;return r=K/2+e.ui.padding+1,t.attr("fill",f(e.ui.color.primary.value)).attr(Y).attr("x",D-(N-1)/2-e.ui.padding).attr("y",r).attr("dy","0.5ex").call(T,l?"pause":"icon")},F.enter().append("text").attr("class","d3plus_timeline_playIcon").call(B).style("pointer-events","none").attr("opacity",0),F.call(B).transition().duration(e.draw.timing).attr("opacity",1),F.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),I=function(){return j-E===oe.length-Z?(S.on(o.hover,null).on(o.click,null).transition().duration(e.draw.timing).attr("opacity",.3),F.transition().duration(e.draw.timing).attr("opacity",.3)):(S.on(o.over,function(){return d3.select(this).style("cursor","pointer")}).on(o.out,function(){return d3.select(this).style("cursor","auto")}).on(o.click,function(){return l?U():(F.call(T,"pause"),j===oe.length?(j-=E,E=0):(E++,j++),P(),l=setInterval(function(){return j===oe.length-Z?U():(E++,j++,P())},e.timeline.play.timing.value))}).transition().duration(e.draw.timing).attr("opacity",1),F.transition().duration(e.draw.timing).attr("opacity",1))},I(),L=function(t){var r,n,a;return n=Z?t<=p[1]:t<p[1],t>=p[0]&&n?(a=1,r=f(e.ui.color.secondary.value)):(a=.5,r=f(e.ui.color.primary.value)),r=d3.rgb(r),"rgba("+r.r+","+r.g+","+r.b+","+a+")"},r=e.g.timeline.selectAll("rect.d3plus_timeline_background").data(["background"]),r.enter().append("rect").attr("class","d3plus_timeline_background").attr("shape-rendering","crispEdges").attr("width",$+2).attr("height",K+2).attr("fill",e.ui.color.primary.value).attr("x",D-1).attr("y",e.ui.padding),
r.transition().duration(e.draw.timing).attr("width",$+2).attr("height",K+2).attr("fill",e.ui.color.primary.value).attr("x",D-1).attr("y",e.ui.padding),G=e.g.timeline.selectAll("g#ticks").data(["ticks"]),G.enter().append("g").attr("id","ticks").attr("transform","translate("+e.width.value/2+","+e.ui.padding+")"),h=e.g.timeline.selectAll("g#brush").data(["brush"]),h.enter().append("g").attr("id","brush"),z=e.g.timeline.selectAll("g#labels").data(["labels"]),z.enter().append("g").attr("id","labels"),V=z.selectAll("text").data(oe,function(e,t){return t}),V.enter().append("text").attr("y",0).attr("dy","0.5ex").attr("x",0),te=d3.time.scale().domain(d3.extent(ae)).rangeRound([0,$]),V.order().attr(Y).text(function(e,t){return ee.indexOf(+e)>=0?J(e):""}).attr("opacity",function(t,r){return e.data.time.dataSteps.indexOf(r)>=0?1:.4}).attr("fill",L).attr("transform",function(t,r){var n,a;return n=D+te(t),Z||(n+=k/2),a=K/2+e.ui.padding+1,Z&&(a+=K),"translate("+Math.round(n)+","+Math.round(a)+")"}),V.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),i=d3.svg.brush().x(te).extent(p).on("brush",v).on("brushend",g),H=e.axes.discrete&&e[e.axes.discrete].value===e.time.value?e[e.axes.discrete].ticks.color:e.x.ticks.color,G.attr("transform","translate("+D+","+e.ui.padding+")").transition().duration(e.draw.timing).call(d3.svg.axis().scale(te).orient("top").ticks(function(){return ae}).tickFormat("").tickSize(-K).tickPadding(0)).selectAll("line").attr("stroke-width",1).attr("shape-rendering","crispEdges").attr("stroke",function(t){return ee.indexOf(+t)>=0?H:s(H,e.background.value,.4,1)}),G.selectAll("path").attr("fill","none"),h.attr("transform","translate("+D+","+e.ui.padding+")").attr("opacity",1).call(i),V.attr("pointer-events","none"),h.selectAll("rect.background").attr("fill","none").style("visibility","visible").attr("height",K).attr("shape-rendering","crispEdges").on(o.move,function(){var t;return t=e.timeline.hover.value,["grab","grabbing"].indexOf(t)>=0&&(t=u()+t),d3.select(this).style("cursor",t)}),h.selectAll("rect.extent").attr("opacity",.75).attr("height",K).attr("fill",e.ui.color.secondary.value).attr("shape-rendering","crispEdges").on(o.move,function(){var t;return t=e.timeline.hover.value,["grab","grabbing"].indexOf(t)>=0&&(t=u()+t),d3.select(this).style("cursor",t)}),e.timeline.handles.value?(x=h.selectAll("g.resize").selectAll("rect.d3plus_handle").data(["d3plus_handle"]),x.enter().insert("rect","rect").attr("class","d3plus_handle"),x.attr("fill",e.timeline.handles.color).attr("transform",function(t){var r;return r="resize e"===this.parentNode.className.baseVal?-e.timeline.handles.size:0,"translate("+r+",0)"}).attr("width",e.timeline.handles.size).style("visibility","visible").attr("shape-rendering","crispEdges").attr("opacity",e.timeline.handles.opacity),h.selectAll("g.resize").selectAll("rect").attr("height",K)):h.selectAll("g.resize").remove(),Q=e.g.timeline.node().getBBox(),0===e.margin.bottom&&(e.margin.bottom+=e.ui.padding),e.margin.bottom+=Q.height+Q.y,e.g.timeline.transition().duration(e.draw.timing).attr("transform","translate(0,"+Math.round(e.height.value-e.margin.bottom-e.ui.padding/2)+")"),e.margin.bottom+=e.ui.padding,e.dev.value?c.time("drawing timeline"):void 0}},{"../../../client/css.coffee":38,"../../../client/pointer.coffee":40,"../../../client/prefix.coffee":41,"../../../color/mix.coffee":47,"../../../color/text.coffee":51,"../../../core/console/print.coffee":53,"../../../core/data/time.coffee":63,"../../../font/sizes.coffee":101,"../../../util/closest.coffee":205}],245:[function(e,t,r){var n=e("../../../client/pointer.coffee"),a=e("../../../core/fetch/value.coffee"),o=e("../../../core/console/print.coffee"),i=e("../../../client/rtl.coffee"),s=e("../../../textwrap/textwrap.coffee");t.exports=function(e){function t(t){t.attr("font-size",function(e){return e.style.font.size}).attr("fill",function(t){return t.link?e.links.font.color:t.style.font.color}).attr("font-family",function(t){return t.link?e.links.font.family.value:t.style.font.family.value}).attr("font-weight",function(t){return t.link?e.links.font.weight:t.style.font.weight}).style("text-decoration",function(t){return t.link?e.links.font.decoration.value:t.style.font.decoration.value}).style("text-transform",function(t){return t.link?e.links.font.transform.value:t.style.font.transform.value})}function r(e){var t=e.style.font.align;return"center"==t?"middle":"left"==t&&!i||"right"==t&&i?"start":"left"==t&&i||"right"==t&&!i?"end":t}var l=e.size.value?e.size.value:"number"===e.color.type?e.color.value:!1;if(e.data.viz&&e.title.total.value&&!e.small)if(l){e.dev.value&&o.time("calculating total value");var u=e.data.pool;e.focus.value.length&&(u=e.data.viz.filter(function(t){return t[e.id.value]==e.focus.value[0]}));var c,f=e.aggs.value[l]||"sum";if(f.constructor===Function?c=f(u):(u=u.reduce(function(t,r){var n=a(e,r,l);return n instanceof Array?t=t.concat(n):t.push(n),t},[]),c=d3[f](u)),(0===c||null===c||void 0===c)&&(c=!1),"number"==typeof c){var d="";if(e.data.mute.length||e.data.solo.length||e.focus.value.length){var p=d3.sum(e.data.value,function(t){if(e.time.solo.value.length>0)var r=e.time.solo.value.indexOf(a(e,t,e.time.value))>=0;else if(e.time.mute.value.length>0)var r=e.time.solo.value.indexOf(a(e,t,e.time.value))<0;else var r=!0;return r?a(e,t,l):void 0});if(p>c){var d=c/p*100,h=e.format.value(p,{key:e.size.value,vars:e});d=" ("+e.format.value(d,{key:"share",vars:e})+" of "+h+")"}}c=e.format.value(c,{key:e.size.value,vars:e});var v=e.title.total.value,g=v.prefix||e.format.value(e.format.locale.value.ui.total)+": ";c=g+c,v.suffix?c+=v.suffix:null,c+=d}e.dev.value&&o.timeEnd("calculating total value")}else var c=!1;else var c=!1;var m=[];if(e.footer.value&&m.push({link:e.footer.link,style:e.footer,type:"footer",value:e.footer.value}),!e.small){if(e.title.value){var y=e.title.value;"function"==typeof y&&(y=y(e.self)),m.push({link:e.title.link,style:e.title,type:"title",value:y})}if(e.title.sub.value){var y=e.title.sub.value;"function"==typeof y&&(y=y(e.self)),m.push({link:e.title.sub.link,style:e.title.sub,type:"sub",value:y})}e.title.total.value&&c&&m.push({link:e.title.total.link,style:e.title.total,type:"total",value:c})}e.dev.value&&o.time("drawing titles");var x=e.svg.selectAll("g.d3plus_title").data(m,function(e){return e.type}),b=e.title.width||e.width.value-e.margin.left-e.margin.right;x.enter().append("g").attr("class",function(e){return"d3plus_title "+e.type}).attr("opacity",0).append("text").call(t),x.each(function(n){var a=d3.select(this).select("text").call(t),o=r(n);s().align(o).container(a).height(e.height.value/8).size(!1).text(n.value).width(b).draw(),n.y=e.margin[n.style.position],e.margin[n.style.position]+=this.getBBox().height+2*n.style.padding}).on(n.over,function(t){t.link&&d3.select(this).transition().duration(e.timing.mouseevents).style("cursor","pointer").select("text").attr("fill",e.links.hover.color).attr("font-family",e.links.hover.family.value).attr("font-weight",e.links.hover.weight).style("text-decoration",e.links.hover.decoration.value).style("text-transform",e.links.hover.transform.value)}).on(n.out,function(r){r.link&&d3.select(this).transition().duration(e.timing.mouseevents).style("cursor","auto").select("text").call(t)}).on(n.click,function(e){if(e.link){var t="/"!=e.link.charAt(0)?"_blank":"_self";window.open(e.link,t)}}).attr("opacity",1).attr("transform",function(t){var n=t.style.position,a="top"==n?0+t.y:e.height.value-t.y;"bottom"==n?a-=this.getBBox().height+t.style.padding:a+=t.style.padding;var o=r(t);if("start"===o)var i=e.margin.left+e.title.padding;else{{d3.select(this).select("text").node().getBBox().width}i="middle"===o?e.width.value/2-b/2:e.width.value-b-e.margin.right-e.title.padding}return"translate("+i+","+a+")"}),x.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),e.margin.top>0&&(e.margin.top+=e.title.padding),e.margin.bottom>0&&(e.margin.bottom+=e.title.padding);var w=e.title.height;w&&e.margin[e.title.position]<w&&(e.margin[e.title.position]=w),e.dev.value&&o.timeEnd("drawing titles")}},{"../../../client/pointer.coffee":40,"../../../client/rtl.coffee":42,"../../../core/console/print.coffee":53,"../../../core/fetch/value.coffee":68,"../../../textwrap/textwrap.coffee":199}],246:[function(e,t,r){var n,a;n=e("./labels.coffee"),a=e("./transform.coffee"),t.exports=function(e,t,r){var o,i,s,l,u,c,f,d,p;return t||(t=e.zoom.bounds),"number"!=typeof r&&(r=e.timing.transitions),e.zoom.size={height:t[1][1]-t[0][1],width:t[1][0]-t[0][0]},p=e.types[e.type.value],s=e.coords.fit.value,o="auto"===s||p.requirements.indexOf("coords")<0?d3.max([e.zoom.size.width/e.width.viz,e.zoom.size.height/e.height.viz]):e.zoom.size[s]/e["app_"+s],u=d3.min([e.width.viz,e.height.viz]),c=p.zoom?2*e.coords.padding:0,f=(u-c)/u/o,i=e.zoom.behavior.scaleExtent(),(i[0]===i[1]||t===e.zoom.bounds)&&e.zoom.behavior.scaleExtent([f,16*f]),l=e.zoom.behavior.scaleExtent()[1],f>l&&(f=l),e.zoom.scale=f,d=[e.width.viz/2-e.zoom.size.width*f/2-t[0][0]*f,e.height.viz/2-e.zoom.size.height*f/2-t[0][1]*f],e.zoom.translate=d,e.zoom.behavior.translate(d).scale(f),e.zoom.size={height:e.zoom.bounds[1][1]-e.zoom.bounds[0][1],width:e.zoom.bounds[1][0]-e.zoom.bounds[0][0]},e.zoom.reset=!1,n(e),a(e,r)}},{"./labels.coffee":248,"./transform.coffee":251}],247:[function(e,t,r){t.exports=function(e,t){var r,n,a;return n=t.id.nesting.length-1,r=t.depth.value,a=t.id.nesting[t.depth.value+1],t.types[t.type.value].nesting===!1?0:(e.d3plus.merged||a in e&&n>r)&&(!e||a in e)?1:r!==n&&(!e||a in e)||!t.small&&t.tooltip.html.value?0:-1}},{}],248:[function(e,t,r){var n;n=e("../../../core/console/print.coffee"),t.exports=function(e){var t,r;return e.dev.value&&n.time("determining label visibility"),r=e.zoom.behavior.scaleExtent(),t=function(t){return t.attr("opacity",function(t){var n;return t||(t={}),n=parseFloat(d3.select(this).attr("font-size"),10),t.visible=n*(e.zoom.scale/r[1])>=2,t.visible?1:0})},e.draw.timing?e.g.viz.selectAll("text.d3plus_label").transition().duration(e.draw.timing).call(t):e.g.viz.selectAll("text.d3plus_label").call(t),e.dev.value?n.timeEnd("determining label visibility"):void 0}},{"../../../core/console/print.coffee":53}],249:[function(e,t,r){var n,a;n=e("./labels.coffee"),a=e("./transform.coffee"),t.exports=function(e){var t,r,o,i,s,l,u,c,f,d,p;return r=d3.event.sourceEvent?d3.event.sourceEvent.type:null,s=d3.event.translate,i=d3.event.scale,o=e.zoom.bounds,c=(e.width.viz-e.zoom.size.width*i)/2,u=c>0?c:0,l=c>0?e.width.viz-c:e.width.viz,p=(e.height.viz-e.zoom.size.height*i)/2,d=p>0?p:0,f=p>0?e.height.viz-p:e.height.viz,s[0]+o[0][0]*i>u?s[0]=-o[0][0]*i+u:s[0]+o[1][0]*i<l&&(s[0]=l-o[1][0]*i),s[1]+o[0][1]*i>d?s[1]=-o[0][1]*i+d:s[1]+o[1][1]*i<f&&(s[1]=f-o[1][1]*i),e.zoom.behavior.translate(s).scale(i),e.zoom.translate=s,e.zoom.scale=i,"wheel"===r?(t=e.draw.timing?100:250,clearTimeout(e.zoom.wheel),e.zoom.wheel=setTimeout(function(){return n(e)},t)):n(e),"dblclick"===r?a(e,e.timing.transitions):a(e,0)}},{"./labels.coffee":248,"./transform.coffee":251}],250:[function(e,t,r){t.exports=function(e,t){var r,n,a,o;n=e.zoom,t||(t=d3.event),o=n.scale>n.behavior.scaleExtent()[0],r=e.types[e.type.value].zoom&&n.value&&n.scroll.value,a=t.touches&&t.touches.length>1&&r,a||o||t.stopPropagation()}},{}],251:[function(e,t,r){t.exports=function(e,t){var r;return"number"!=typeof t&&(t=e.timing.transitions),r="translate("+e.zoom.translate+")",r+="scale("+e.zoom.scale+")",t?e.g.viz.transition().duration(t).attr("transform",r):e.g.viz.attr("transform",r)}},{}],252:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,Function,Object,String],deprecates:"active_var",mute:n(!0),solo:n(!0),spotlight:{accepted:[Boolean],deprecates:"spotlight",value:!1},value:!1}},{"../../core/methods/filter.coffee":80}],253:[function(e,t,r){t.exports={accepted:[Object],deprecated:"nesting_aggs",objectAccess:!1,value:{}}},{}],254:[function(e,t,r){var n;n=e("../../core/methods/process/data.coffee"),t.exports={accepted:[!1,Array,Object,String],delimiter:{accepted:String,value:"|"},filetype:{accepted:[!1,"json","xml","html","csv","dsv","tsv","txt"],value:!1},keys:{},process:n,value:!1}},{"../../core/methods/process/data.coffee":86}],255:[function(e,t,r){var n;n=e("../../core/methods/rendering.coffee"),t.exports={background:{color:"#fafafa",rendering:n(),stroke:{color:"#ccc",width:1}},mirror:{accepted:[Boolean],deprecates:["mirror_axis","mirror_axes"],value:!1}}},{"../../core/methods/rendering.coffee":91}],256:[function(e,t,r){t.exports={accepted:[String],value:"#ffffff"}},{}],257:[function(e,t,r){var n,a;n=e("../../core/methods/filter.coffee"),a=e("../../color/scale.coffee"),t.exports={accepted:[!1,Array,Function,Object,String],deprecates:"color_var",focus:"#444444",heatmap:["#282F6B","#419391","#AFD5E8","#EACE3F","#B35C1E","#B22200"],missing:"#eeeeee",mute:n(!0),primary:"#d74b03",range:["#B22200","#FFEE8D","#759143"],scale:{accepted:[Array,Function,"d3plus","category10","category20","category20b","category20c"],process:function(e){return e instanceof Array?d3.scale.ordinal().range(e):"d3plus"===e?a:"string"==typeof e?d3.scale[e]():e},value:"d3plus"},solo:n(!0),secondary:"#e5b3bb",value:!1}},{"../../color/scale.coffee":49,"../../core/methods/filter.coffee":80}],258:[function(e,t,r){t.exports={accepted:[Array,Function,String],index:{accepted:[Boolean],value:!0},process:function(e,t){return"string"==typeof e&&(e=[e]),e},value:!1}},{}],259:[function(e,t,r){t.exports={accepted:[Object],objectAccess:!1,process:function(e,t){var r,n;for(r in e)n=e[r],r in t.self&&t.self[r](n);return e},value:{}}},{}],260:[function(e,t,r){var n;n=e("../../util/d3selection.coffee"),t.exports={accepted:[!1,Array,Object,String],id:"default",process:function(e){return e===!1?!1:n(e)?e:d3.select(e instanceof Array?e[0][0]:e)},value:!1}},{"../../util/d3selection.coffee":207}],261:[function(e,t,r){var n,a;n=e("../../core/methods/filter.coffee"),a=e("../../core/methods/process/data.coffee"),t.exports={accepted:[!1,Array,Function,Object,String],center:[0,0],filetype:{accepted:["json"],value:"json"},fit:{accepted:["auto","height","width"],value:"auto"},mute:n(!1),padding:20,process:a,projection:{accepted:["mercator","equirectangular"],value:"mercator"},solo:n(!1),threshold:{accepted:[Number],value:.9},value:!1}},{"../../core/methods/filter.coffee":80,"../../core/methods/process/data.coffee":86}],262:[function(e,t,r){var n,a,o;n=e("../../core/fetch/value.coffee"),a=e("../../client/ie.js"),o=e("../../string/strip.js"),t.exports={accepted:[void 0,!0,Array,String],chainable:!1,data:[],process:function(e,t){var r,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R;if(void 0===t.returned)return[];if(e=e||t.cols.value,e instanceof Array?l=e:"string"==typeof e&&(l=[e]),c=[],D=[],t.title.value?(q=t.title.value,"function"==typeof q&&(q=q(t.self)),q=o(q),E=250,q=q.substr(0,E)):q="D3plus Visualization Data",e===!0)for(l=d3.keys(t.data.keys),c.push(l),C=t.data.value,v=0,y=C.length;y>v;v++){for(f=C[v],P=[],g=0,x=l.length;x>g;g++)i=l[g],R=f[i],"string"===t.data.keys[i]&&(R='"'+R+'"'),P.push(R);c.push(P)}else{for(l||(l=[t.id.value],t.time.value&&l.push(t.time.value),t.size.value&&l.push(t.size.value),t.text.value&&l.push(t.text.value)),m=0,b=l.length;b>m;m++)i=l[m],D.push(t.format.value(i));for(c.push(D),I=t.returned.nodes,M=0,w=I.length;w>M;M++)if(S=I[M],null!=S.values&&S.values instanceof Array)for(N=S.values,O=0,_=N.length;_>O;O++){for(R=N[O],P=[],F=0,k=l.length;k>F;F++)s=l[F],R=n(t,R,s),"string"==typeof R&&(R='"'+R+'"'),P.push(R);c.push(P)}else{for(P=[],T=0,z=l.length;z>T;T++)s=l[T],P.push(n(t,S,s));c.push(P)}}for(u="data:text/csv;charset=utf-8,",h=B=0,A=c.length;A>B;h=++B)i=c[h],d=i.join(","),u+=h<c.length?d+"\n":d;return a?(r=new Blob([u],{type:"text/csv;charset=utf-8;"}),navigator.msSaveBlob(r,q+".csv")):(p=encodeURI(u),j=document.createElement("a"),j.setAttribute("href",p),j.setAttribute("download",q+".csv"),j.click()),this.data=c,l},value:void 0}},{"../../client/ie.js":39,"../../core/fetch/value.coffee":68,"../../string/strip.js":174}],263:[function(e,t,r){var n;n=e("../../core/methods/process/data.coffee"),t.exports={accepted:[!1,Array,Function,String],cache:{},delimiter:{accepted:[String],value:"|"},donut:{size:.35},filetype:{accepted:[!1,"json","xml","html","csv","dsv","tsv","txt"],value:!1},filters:[],keys:{},mute:[],large:400,opacity:.9,padding:{accepted:[Number],value:1},process:function(e,t){return"default"===t.container.id&&e.length&&t.self.container({id:"default"+e.length}),n(e,t,this)},solo:[],stroke:{width:1},value:!1}},{"../../core/methods/process/data.coffee":86}],264:[function(e,t,r){t.exports={accepted:[Function,Number],value:0}},{}],265:[function(e,t,r){t.exports={accepted:[!1,Function,Object],value:!1}},{}],266:[function(e,t,r){t.exports={accepted:[Boolean],value:!1}},{}],267:[function(e,t,r){var n=e("../../core/console/print.coffee"),a=e("../../string/format.js");t.exports={accepted:[void 0,Function],first:!0,frozen:!1,process:function(e,t){if(this.initialized===!1)return this.initialized=!0,e;if(void 0===e&&"function"==typeof this.value&&(e=this.value),t.container.value===!1){var r=t.format.locale.value.dev.setContainer;n.warning(r,"container")}else if(t.container.value.empty()){var r=t.format.locale.value.dev.noContainer;n.warning(a(r,'"'+t.container.value+'"'),"container")}else t.dev.value&&n.time("total draw time"),t.container.value.call(t.self);if("function"==typeof e&&t.history.chain.length){var o={};changes.forEach(function(e){var t=e.method;delete e.method,o[t]=e}),e(o),t.history.chain=[]}return e},update:!0,value:void 0}},{"../../core/console/print.coffee":53,"../../string/format.js":172}],268:[function(e,t,r){var n=e("../../core/methods/process/data.coffee");t.exports={accepted:[!1,Array,Function,String],arrows:{accepted:[Boolean,Number],direction:{accepted:["source","target"],value:"target"},value:!1},color:"#d0d0d0",connections:function(e,t,r){var n=this;if(!n.value)return[];if(!t)var t="id";var a=n.restricted||n.value,o=[];if(!e)return a;var i=a.filter(function(a){var i=!1;return a[n.source][t]==e?(i=!0,r&&o.push(a[n.target])):a[n.target][t]==e&&(i=!0,r&&o.push(a[n.source])),i});return r?o:i},delimiter:{accepted:[String],value:"|"},filetype:{accepted:[!1,"json","xml","html","csv","dsv","tsv","txt"],value:!1},interpolate:{accepted:["basis","cardinal","linear","monotone","step"],value:"basis"},label:!1,large:100,limit:{accepted:[!1,Function,Number],value:!1},opacity:{accepted:[Function,Number,String],min:{accepted:[Number],value:.25},scale:{accepted:[Function],value:d3.scale.linear()},value:1},process:n,size:{accepted:[!1,Number,String],min:1,scale:.5,value:!1},source:"source",strength:{accepted:[!1,Function,Number,String],value:!1},target:"target",value:!1}},{"../../core/methods/process/data.coffee":86}],269:[function(e,t,r){t.exports={accepted:[Boolean,String],value:!1}},{}],270:[function(e,t,r){t.exports={accepted:[!1,Array,Function,Number,String],deprecates:"highlight",process:function(e){return e===!1?[]:e instanceof Array?e:[e]},tooltip:{accepted:[Boolean],value:!0},value:[]}},{}],271:[function(e,t,r){var n,a,o,i;n=e("../../core/methods/font/align.coffee"),a=e("../../core/methods/font/decoration.coffee"),o=e("../../core/methods/font/family.coffee"),i=e("../../core/methods/font/transform.coffee"),t.exports={align:n(),color:"#444444",decoration:a(),family:o(),secondary:{align:n(),color:"#444444",decoration:a(),family:o(),size:12,spacing:0,transform:i(),weight:200},size:12,spacing:0,transform:i(),weight:200}},{"../../core/methods/font/align.coffee":81,"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],272:[function(e,t,r){var n,a,o;a=e("../../core/methods/font/family.coffee"),n=e("../../core/methods/font/decoration.coffee"),o=e("../../core/methods/font/transform.coffee"),t.exports={accepted:[!1,Number,String],font:{align:"center",color:"#444",decoration:n(),family:a(),size:11,transform:o(),weight:200},link:!1,padding:0,position:"bottom",value:!1}},{"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],273:[function(e,t,r){var n,a,o,i;n=e("../../number/format.coffee"),a=e("../../core/locale/locale.coffee"),o=e("../../object/merge.coffee"),i=e("../../string/title.coffee"),t.exports={accepted:[Function,String],affixes:{accepted:[Object],objectAccess:!1,value:{}},deprecates:["number_format","text_format"],locale:{accepted:function(){return d3.keys(a)},process:function(e){var t,r;return t="en_US",r=a[t],e!==t&&(r=o(r,a[e])),this.language=e,r},value:"en_US"},number:{accepted:[!1,Function],value:!1},process:function(e,t){if("string"==typeof e)t.self.format({locale:e});else if("function"==typeof e)return e;return this.value},text:{accepted:[!1,Function],value:!1},value:function(e,t){var r,a,o;return t||(t={}),t.locale||(t.locale=this.locale.value),o=t.vars||{},o.time&&o.time.value&&t.key===o.time.value?(a=e.constructor===Date?e:new Date(e),o.data.time.format(a)):"number"==typeof e?(r=this.number.value||n)(e,t):"string"==typeof e?(r=this.text.value||i)(e,t):JSON.stringify(e)}}},{"../../core/locale/locale.coffee":78,"../../number/format.coffee":169,"../../object/merge.coffee":170,"../../string/title.coffee":175}],274:[function(e,t,r){t.exports={accepted:[!1,Number],max:600,secondary:!1,small:200,value:!1}},{}],275:[function(e,t,r){var n,a,o,i,s,l,u;n=e("../../../core/methods/font/align.coffee"),a=e("../../../core/methods/font/decoration.coffee"),o=e("../../../core/methods/font/family.coffee"),i=e("../../../core/methods/filter.coffee"),s=e("../../../core/methods/font/position.coffee"),l=e("../../../core/methods/rendering.coffee"),u=e("../../../core/methods/font/transform.coffee"),t.exports=function(e){return{accepted:[Array,Boolean,Function,Object,String],affixes:{accepted:[Boolean],separator:{accepted:[Boolean,Array],value:!0},value:!1},axis:{accepted:[Boolean],color:"#444",font:{color:!1,decoration:a(!1),family:o(""),size:!1,transform:u(!1),weight:!1},rendering:l(),value:!0},dataFilter:!0,deprecates:[e+"axis",e+"axis_val",e+"axis_var"],domain:{accepted:[!1,Array],value:!1},grid:{accepted:[Boolean],color:"#ccc",rendering:l(),value:!0},label:{accepted:[Boolean,String],fetch:function(t){return this.value===!0?t.format.value(t[e].value,{key:e,vars:t}):this.value},font:{color:"#444",decoration:a(),family:o(),size:12,transform:u(),weight:200},padding:3,value:!0},lines:{accept:[!1,Array,Number,Object],dasharray:{accepted:[Array,String],process:function(e){return e instanceof Array&&(e=e.filter(function(e){return!isNaN(e)}),e=e.length?e.join(", "):"none"),e},value:"10, 10"},color:"#888",font:{align:n("right"),color:"#444",background:{accepted:[Boolean],value:!0},decoration:a(),family:o(),padding:{accepted:[Number],value:10},position:s("middle"),size:12,transform:u(),weight:200},process:Array,rendering:l(),width:1,value:[]},mouse:{accept:[Boolean],dasharray:{accepted:[Array,String],process:function(e){return e instanceof Array&&(e=e.filter(function(e){return!isNaN(e)}),e=e.length?e.join(", "):"none"),e},value:"none"},rendering:l(),width:2,value:!0},mute:i(!0),padding:{accepted:[Number],value:.1},range:{accepted:[!1,Array],value:!1},scale:{accepted:["linear","log","discrete","share"],deprecates:["layout","unique_axis",e+"axis_scale"],process:function(t,r){var n,a,o,i;for(o=["log","discrete","share"],n=0,a=o.length;a>n;n++)i=o[n],i===t?r.axes[i]=e:r.axes[i]===e&&(r.axes[i]=!1);return"discrete"===t&&(r.axes.opposite="x"===e?"y":"x"),t},value:"linear"},solo:i(!0),stacked:{accepted:[Boolean],process:function(t,r){return t||r.axes.stacked!==e?t&&(r.axes.stacked=e):r.axes.stacked=!1,t},value:!1},ticks:{color:"#ccc",font:{color:"#666",decoration:a(),family:o(),size:10,transform:u(),weight:200},rendering:l(),size:10,width:1},value:!1,zerofill:{accepted:[Boolean],value:!1}}}},{"../../../core/methods/filter.coffee":80,"../../../core/methods/font/align.coffee":81,"../../../core/methods/font/decoration.coffee":82,"../../../core/methods/font/family.coffee":83,"../../../core/methods/font/position.coffee":84,"../../../core/methods/font/transform.coffee":85,"../../../core/methods/rendering.coffee":91}],276:[function(e,t,r){t.exports={accepted:[Boolean],back:function(){return this.states.length?this.states.pop()():void 0},chain:[],reset:function(){var e;for(e=[];this.states.length;)e.push(this.states.pop()());return e},states:[],value:!0}},{}],277:[function(e,t,r){var n;n=e("../../core/methods/process/icon.coffee"),t.exports={accepted:[!1,Array,Function,Object,String],back:{accepted:[!1,String],fallback:"&#x276e;",opacity:1,process:n,rotate:0,value:"fa-angle-left"},deprecates:"icon_var",style:{accepted:[Object,String],deprecates:"icon_style",value:"default"},value:!1}},{"../../core/methods/process/icon.coffee":88}],278:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[Array,String],dataFilter:!0,deprecates:["id_var","nesting"],grouping:{accepted:[Boolean],value:!0},mute:n(!0),nesting:["id"],solo:n(!0),value:"id"}},{"../../core/methods/filter.coffee":80}],279:[function(e,t,r){var n,a,o;n=e("../../core/methods/font/decoration.coffee"),a=e("../../core/methods/font/family.coffee"),o=e("../../core/methods/font/transform.coffee"),t.exports={accepted:[Boolean],align:{accepted:["start","middle","end","left","center","right"],process:function(e){var t;return t=["left","center","right"].indexOf(e),t>=0&&(e=this.accepted[t]),e},value:"middle"},font:{decoration:n(),family:a(),size:11,transform:o(),weight:200},padding:7,resize:{accepted:[Boolean],value:!0},text:{accepted:[!1,Function,String],value:!1},segments:2,valign:{accepted:[!1,"top","middle","bottom"],value:"middle"},value:!0}},{"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],280:[function(e,t,r){var n;n=e("../../core/methods/font/family.coffee"),t.exports={accepted:[Boolean],align:"middle",filters:{accepted:[Boolean],value:!1},font:{align:"middle",color:"#444444",family:n(),size:10,weight:200},gradient:{height:10},icons:{accepted:[Boolean],value:!0},order:{accepted:["color","id","size","text"],sort:{accepted:["asc","desc"],value:"asc"},value:"color"},size:[8,30],tooltip:{accepted:[Boolean],value:!0},text:{accepted:[!1,Function,String],value:!1},value:!0}},{"../../core/methods/font/family.coffee":83}],281:[function(e,t,r){var n,a,o;n=e("../../core/methods/font/decoration.coffee"),a=e("../../core/methods/font/family.coffee"),o=e("../../core/methods/font/transform.coffee"),t.exports={font:{color:"#444444",decoration:n(),family:a(),transform:o(),weight:200},hover:{color:"#444444",decoration:n(),family:a(),transform:o(),weight:200}}},{"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],282:[function(e,t,r){var n;n=e("../../core/methods/process/margin.coffee"),t.exports={accepted:[Number,Object,String],process:function(e){var t;return void 0===e&&(e=this.value),t=e,n(e,this),t},value:0}},{"../../core/methods/process/margin.coffee":89}],283:[function(e,t,r){var n,a,o;n=e("../../core/methods/font/decoration.coffee"),a=e("../../core/methods/font/family.coffee"),o=e("../../core/methods/font/transform.coffee"),t.exports={accepted:[Boolean,String],branding:{accepted:[Boolean],value:!1},font:{color:"#444",decoration:n(),family:a(),size:16,transform:o(),weight:200},padding:5,style:{accepted:[!1,"small","large"],value:!1},value:!0}},{"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],284:[function(e,t,r){var n;n=e("../../core/methods/process/data.coffee"),t.exports={accepted:[!1,Array,Function,String],delimiter:{accepted:[String],value:"|"},filetype:{accepted:[!1,"json","xml","html","csv","dsv","tsv","txt"],value:!1},overlap:.6,process:n,value:!1}},{"../../core/methods/process/data.coffee":86}],285:[function(e,t,r){t.exports={accepted:[Boolean,Function,String],agg:{accepted:[!1,Function,"sum","min","max","mean","median"],value:!1},deprecates:["sort"],sort:{accepted:["asc","desc"],value:"desc"},value:!1}},{}],286:[function(e,t,r){var n;n=e("../../core/methods/rendering.coffee"),t.exports={accepted:function(e){var t;return t=e.types[e.type.value].shapes,!t||t instanceof Array||(t=[t]),t.length?t:["square"]},interpolate:{accepted:["basis","basis-open","cardinal","cardinal-open","linear","monotone","step","step-before","step-after"],deprecates:"stack_type",value:"linear"},rendering:n(),value:!1}},{"../../core/methods/rendering.coffee":91}],287:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,Function,Number,Object,String],dataFilter:!0,deprecates:["value","value_var"],mute:n(!0),scale:{accepted:[Function],deprecates:"size_scale",max:{accepted:[Function,Number],value:function(e){return Math.floor(d3.max([d3.min([e.width.viz,e.height.viz])/15,6]))}},min:{accepted:[Function,Number],value:3},value:d3.scale.sqrt()},solo:n(!0),threshold:{accepted:[Boolean,Function,Number],value:!1},value:!1}},{"../../core/methods/filter.coffee":80}],288:[function(e,t,r){t.exports={value:!1}},{}],289:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,Function,Object,String],deprecates:["else_var","else"],mute:n(!0),solo:n(!0),value:!1}},{"../../core/methods/filter.coffee":80}],290:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[Array,Boolean,Function,Object,String],deprecates:["name_array","text_var"],nesting:!0,mute:n(!0),solo:n(!0),value:!1}},{"../../core/methods/filter.coffee":80}],291:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[Array,Boolean,Function,Object,String],dataFilter:!0,deprecates:["year","year_var"],fixed:{accepted:[Boolean],deprecates:["static_axis","static_axes"],value:!0},format:{accepted:[!1,Array,Function,String],value:!1},mute:n(!1),solo:n(!1),value:!1}},{"../../core/methods/filter.coffee":80}],292:[function(e,t,r){t.exports={accepted:[Boolean],align:"middle",hover:{accepted:["all-scroll","col-resize","crosshair","default","grab","grabbing","move","pointer"],value:"pointer"},handles:{accepted:[Boolean],color:"#666",opacity:1,size:3,stroke:"#666",value:!0},height:{accepted:[Number],value:23},play:{accepted:[Boolean],icon:{accepted:[!1,String],awesome:"???",fallback:"???"},pause:{accepted:[!1,String],awesome:"???",fallback:"??????"},timing:{accepted:[Number],value:1500},value:!0},value:!0}},{}],293:[function(e,t,r){t.exports={mouseevents:60,transitions:600,ui:200}},{}],294:[function(e,t,r){var n,a,o,i;n=e("../../core/methods/font/decoration.coffee"),a=e("../../core/methods/font/family.coffee"),i=e("../../core/methods/font/transform.coffee"),o=e("../../string/strip.js"),t.exports={accepted:[!1,Function,String],font:{align:"center",color:"#444444",decoration:n(),family:a(),size:16,transform:i(),weight:400},height:!1,link:!1,padding:2,position:"top",process:function(e,t){var r;return 0===t.container.id.indexOf("default")&&e&&(r=o(e).toLowerCase(),t.self.container({id:r})),e},sub:{accepted:[!1,Function,String],deprecates:"sub_title",font:{align:"center",color:"#444444",decoration:n(),family:a(),size:12,transform:i(),weight:200},link:!1,padding:1,position:"top",value:!1},total:{accepted:[Boolean,Object],deprecates:"total_bar",font:{align:"center",color:"#444444",decoration:n(),family:a(),size:12,transform:i(),weight:200,value:!1},link:!1,padding:1,position:"top",value:!1},width:!1,value:!1}},{"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85,"../../string/strip.js":174}],295:[function(e,t,r){var n,a;n=e("../../core/methods/font/family.coffee"),a=e("../../core/methods/font/transform.coffee"),t.exports={accepted:[Boolean,Array,Function,Object,String],
anchor:"top center",background:"#ffffff",children:{accepted:[Boolean],value:!0},connections:{accepted:[Boolean],value:!0},curtain:{color:"#ffffff",opacity:.8},deprecates:"tooltip_info",extent:{accepted:[Boolean],value:!0},font:{color:"#444",family:n(),size:12,transform:a(),weight:200},html:{accepted:[!1,Function,Object,String],deprecates:"click_function",value:!1},iqr:{accepted:[Boolean],value:!0},large:250,share:{accepted:[Boolean],value:!0},size:{accepted:[Boolean],value:!0},small:225,sub:{accepted:[!1,Function,String],value:!1},value:!0}},{"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],296:[function(e,t,r){var n;n=e("../../core/methods/filter.coffee"),t.exports={accepted:[!1,Function,Object,String],deprecates:["total_var"],mute:n(!0),solo:n(!0),value:!1}},{"../../core/methods/filter.coffee":80}],297:[function(e,t,r){t.exports={accepted:function(e){return d3.keys(e.types)},mode:{accepted:function(e){return e.types[e.type.value].modes||[!1]},value:!1},value:"tree_map"}},{}],298:[function(e,t,r){var n,a,o,i;o=e("../../core/methods/font/family.coffee"),n=e("../../core/methods/font/align.coffee"),a=e("../../core/methods/font/decoration.coffee"),i=e("../../core/methods/font/transform.coffee"),t.exports={accepted:[Array,Boolean],align:n("center"),border:1,color:{primary:{process:function(e,t){var r;return r=this.value,t.ui.color.secondary.value||(t.ui.color.secondary.value=d3.rgb(r).darker(.75).toString()),e},value:"#ffffff"},secondary:{value:!1}},display:{acceped:["block","inline-block"],value:"inline-block"},font:{align:"center",color:"#444",decoration:a(),family:o(),size:11,transform:i(),weight:200},margin:5,padding:5,position:{accepted:["top","right","bottom","left"],value:"bottom"},value:!1}},{"../../core/methods/font/align.coffee":81,"../../core/methods/font/decoration.coffee":82,"../../core/methods/font/family.coffee":83,"../../core/methods/font/transform.coffee":85}],299:[function(e,t,r){t.exports={accepted:[!1,Number],secondary:!1,small:200,value:!1}},{}],300:[function(e,t,r){t.exports={accepted:[Boolean],behavior:d3.behavior.zoom().scaleExtent([1,1]).duration(0),click:{accepted:[Boolean],value:!0},pan:{accepted:[Boolean],value:!0},scroll:{accepted:[Boolean],deprecates:"scroll_zoom",value:!0},value:!0}},{}],301:[function(e,t,r){var n,a,o,i,s,l,u=[].indexOf||function(e){for(var t=0,r=this.length;r>t;t++)if(t in this&&this[t]===e)return t;return-1};a=e("../../core/fetch/value.coffee"),o=e("./helpers/graph/draw.coffee"),i=e("./helpers/graph/nest.coffee"),s=e("./helpers/graph/stack.coffee"),l=e("../../util/uniques.coffee"),n=function(e){var t,r,n,i,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P;if(f=e.axes.discrete,v="x"===f?"height":"width",I="x"===f?"width":"height",E=e.axes.opposite,n="x"===f?"left":"top",A="x"===f?"top":"left",o(e,{buffer:!0,zero:e.axes.opposite}),h=e.x.domain.viz.concat(e.y.domain.viz),h.indexOf(void 0)>=0)return[];for(z=e.data.viz,e.axes.stacked&&s(e,z),B=e.axes[I]/e[e.axes.discrete].ticks.values.length,O=e[e.axes.discrete].padding.value,1>O&&(O*=B),2*O>B&&(O=.1*B),_=B-2*O,e.axes.stacked||(F=e[f].value,u.call(e.id.nesting,F)>=0?(t=d3.nest().key(function(t){return a(e,t,e[f].value)}).entries(z),p=d3.max(t,function(e){return e.values.length})):(t=l(z,e.id.value,a,e),p=t.length),_/=p,j=B/2-_/2-O,N=d3.scale.linear().domain([0,p-1]).range([-j,j])),c=[],P=0,g=m=0,x=z.length;x>m;g=++m)for(S=z[g],k=e.axes.stacked?0:N(g%p),T=S.values,y=0,b=T.length;b>y;y++){if(i=T[y],e.axes.stacked)C=i.d3plus[E],r=i.d3plus[E+"0"];else{if(M=a(e,i,e[E].value),0===M)continue;"log"===e[E].scale.value&&(P=0>M?-1:1),C=e[E].scale.viz(M),r=e[E].scale.viz(P)}d=a(e,i,e[f].value),i.d3plus[f]=e[f].scale.viz(d),i.d3plus[f]+=e.axes.margin[n]+k,w=r-C,i.d3plus[E]=r-w/2,e.axes.stacked||(i.d3plus[E]+=e.axes.margin[A]),i.d3plus[I]=_,i.d3plus[v]=Math.abs(w),i.d3plus.init={},i.d3plus.init[E]=e[E].scale.viz(P),i.d3plus.init[E]-=i.d3plus[E],i.d3plus.init[E]+=e.axes.margin[A],i.d3plus.init[I]=i.d3plus[I],i.d3plus.label=!1,c.push(i)}return c},n.filter=function(e,t){return i(e,t)},n.requirements=["data","x","y"],n.setup=function(e){var t,r,n;return e.axes.discrete||(t=e.time.value===e.y.value?"y":"x",e.self[t]({scale:"discrete"})),n=e[e.axes.opposite],r=e.size,!n.value&&r.value||r.changed&&r.previous===n.value?e.self[e.axes.opposite](r.value):!r.value&&n.value||n.changed&&n.previous===r.value?e.self.size(n.value):void 0},n.shapes=["square"],t.exports=n},{"../../core/fetch/value.coffee":68,"../../util/uniques.coffee":209,"./helpers/graph/draw.coffee":307,"./helpers/graph/nest.coffee":313,"./helpers/graph/stack.coffee":314}],302:[function(e,t,r){var n,a,o,i,s;a=e("../../core/fetch/value.coffee"),o=e("./helpers/graph/draw.coffee"),i=e("../../string/strip.js"),s=e("../../util/uniques.coffee"),n=function(e){var t,r,n,l,u,c,f,d,p,h,v,g,m;return o(e,{buffer:!0,mouse:!0}),n=e.x.domain.viz.concat(e.y.domain.viz),n.indexOf(void 0)>=0?[]:(r=e.axes.discrete,h=e.axes.opposite,t="x"===r?e.axes.margin.left:e.axes.margin.top,p="x"===h?e.axes.margin.left:e.axes.margin.top,l="x"===r?"height":"width",m="x"===r?"width":"height",g=e.axes[m]/e[r].ticks.values.length,g=d3.min([g-2*e.labels.padding,100]),f=e.type.mode.value,f instanceof Array||(f=[f,f]),c=function(t){var r,n,o;n={};for(r in e.data.keys)o=s(t,r,a,e),n[r]=1===o.length?o[0]:o;return n},d=!1,u=[],v=[],d3.nest().key(function(t){return a(e,t,e[r].value)}).rollup(function(n){var o,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R,U,V,L,Y,H,X,G,J;for(q=e[h].scale.viz,X=n.map(function(t){return a(e,t,e[h].value)}),X.sort(function(e,t){return e-t}),Y=s(X),z=d3.quantile(X,.25),T=d3.quantile(X,.5),D=d3.quantile(X,.75),R={},"tukey"===f[1]?(j=z-D,U=D-1.5*j,V="top tukey"):"extent"===f[1]?(U=d3.max(X),V="maximum"):"number"==typeof f[1]&&(U=d3.quantile(X,(100-f[1])/100),V=f[1]+" percentile"),U=d3.min([d3.max(X),U]),e.tooltip.extent.value&&(R[V]={key:e[h].value,value:U}),e.tooltip.iqr.value&&(R["third quartile"]={key:e[h].value,value:D},R.median={key:e[h].value,value:T},R["first quartile"]={key:e[h].value,value:z}),"tukey"===f[0]?(j=z-D,o=z+1.5*j,y="bottom tukey"):"extent"===f[0]?(o=d3.min(X),y="minimum"):"number"==typeof f[0]&&(o=d3.quantile(X,f[0]/100),y=f[0]+" percentile"),o=d3.max([d3.min(X),o]),e.tooltip.extent.value&&(R[y]={key:e[h].value,value:o}),b=[],x=[],L=[],P=[],A=0,S=n.length;S>A;A++)w=n[A],H=a(e,w,e[h].value),H>=z&&D>=H?b.push(w):H>=o&&z>H?x.push(w):U>=H&&H>D?L.push(w):P.push(w);for(E=a(e,n[0],e[r].value),G=e[r].scale.viz(E),G+=t,O=e.format.value(E,{key:e[r].value,vars:e}),E.constructor===Date&&(E=E.getTime()),E=i(E),b=c(b),b.d3plus={color:"white",id:"box_"+E,init:{},label:!1,shape:"square",stroke:"#444",text:"Interquartile Range for "+O},b.d3plus[m]=g,b.d3plus.init[m]=g,b.d3plus[l]=Math.abs(q(z)-q(D)),b.d3plus[r]=G,J=d3.min([q(z),q(D)])+b.d3plus[l]/2,J+=p,b.d3plus[h]=J,b.d3plus.tooltip=R,v.push(b),C={d3plus:{id:"median_line_"+E,position:"height"===l?"top":"right",shape:"whisker","static":!0}},N=e.format.value(T,{key:e[h].value,vars:e}),O={background:"#fff",names:[N],padding:0,resize:!1,x:0,y:0},_=Math.abs(q(T)-q(z)),k=Math.abs(q(T)-q(D)),I=2*d3.min([_,k]),B=2*e.data.stroke.width+2*e.labels.padding,O["width"===m?"w":"h"]=g-B,O["width"===l?"w":"h"]=I-B,C.d3plus.label=O,C.d3plus[m]=g,C.d3plus[r]=G,C.d3plus[h]=q(T)+p,v.push(C),x=c(x),x.d3plus={id:"bottom_whisker_line_"+E,offset:b.d3plus[l]/2,position:"height"===l?"bottom":"left",shape:"whisker","static":!0},"x"===h&&(x.d3plus.offset*=-1),x.d3plus[l]=Math.abs(q(o)-q(z)),x.d3plus[m]=g,x.d3plus[r]=G,x.d3plus[h]=J,v.push(x),L=c(L),L.d3plus={id:"top_whisker_line_"+E,offset:b.d3plus[l]/2,position:"height"===l?"top":"right",shape:"whisker","static":!0},"y"===h&&(L.d3plus.offset*=-1),L.d3plus[l]=Math.abs(q(U)-q(D)),L.d3plus[m]=g,L.d3plus[r]=G,L.d3plus[h]=J,v.push(L),M=0,F=P.length;F>M;M++)w=P[M],w.d3plus[r]=G,w.d3plus[h]=q(a(e,w,e.y.value)),w.d3plus[h]+=p,w.d3plus.r=4,w.d3plus.shape=e.shape.value;return d=!P.length&&U-o===0,u.push(T),v=v.concat(P),n}).entries(e.data.viz),d&&1===s(u).length?[]:v)},n.modes=["tukey","extent",Array,Number],n.requirements=["data","x","y"],n.shapes=["circle","check","cross","diamond","square","triangle","triangle_up","triangle_down"],n.setup=function(e){var t;return e.axes.discrete?void 0:(t=e.time.value===e.y.value?"y":"x",e.self[t]({scale:"discrete"}))},t.exports=n},{"../../core/fetch/value.coffee":68,"../../string/strip.js":174,"../../util/uniques.coffee":209,"./helpers/graph/draw.coffee":307}],303:[function(e,t,r){var n,a,o,i,s,l,u;n=e("../../array/sort.coffee"),s=e("../../core/fetch/value.coffee"),o=e("../../core/fetch/color.coffee"),i=e("../../core/fetch/text.js"),u=e("../../color/legible.coffee"),l=e("../../core/data/group.coffee"),a=function(e){var t,r,a,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R,U;if(m=l(e,e.data.viz),m=n(m,null,null,null,e),d=m.length,4>d?(a=d,S=1):(F=e.width.viz/e.height.viz,a=Math.ceil(Math.sqrt(d*F)),S=Math.ceil(Math.sqrt(d/F))),d>0)for(;(S-1)*a>=d;)S--;for(r=e.width.viz/a,t=e.height.viz/S,e.size.value?(v=d3.min(e.data.viz,function(t){return s(e,t,e.size.value,e.id.value,"min")}),h=d3.max(e.data.viz,function(t){return s(e,t,e.size.value,e.id.value)}),p=[v,h]):p=[0,0],E=5,B=d3.min([r,t])/2-2*E,_=e.labels.value&&!e.small&&B>=40?d3.max([20,d3.min([.25*B,50])]):0,B-=_,C=d3.min([B,e.size.scale.min.value]),T=e.size.scale.value.domain(p).rangeRound([C,B]),M=d3.layout.pack().children(function(e){return e.values}).padding(E).radius(function(e){return T(e)}).size([r-2*E,t-2*E-_]).value(function(e){return e.value}),f=[],O=0,y=x=0,k=m.length;k>x;y=++x){for(c=m[y],N=M.nodes(c),q=r*y%e.width.viz,U=t*O,b=0,z=N.length;z>b;b++)I=N[b],I.children?(j={d3plus:{}},j[e.id.value]=I.key):j=I.d3plus,j.d3plus.depth=e.id.grouping.value?I.depth:e.depth.value,j.d3plus.x=I.x,j.d3plus.xOffset=q,j.d3plus.y=I.y,j.d3plus.yOffset=U+_,j.d3plus.r=I.r,f.push(j);(y+1)%a===0&&O++}for(g=B/d3.max(f,function(e){return e.d3plus.r}),P=M.size()[0]/2,R=M.size()[1]/2,w=0,A=f.length;A>w;w++)c=f[w],c.d3plus.x=(c.d3plus.x-P)*g+P+c.d3plus.xOffset,c.d3plus.y=(c.d3plus.y-R)*g+R+c.d3plus.yOffset,c.d3plus.r=c.d3plus.r*g,delete c.d3plus.xOffset,delete c.d3plus.yOffset,c.d3plus["static"]=c.d3plus.depth<e.depth.value&&e.id.grouping.value,!_||0!==c.d3plus.depth&&e.id.grouping.value!==!1?delete c.d3plus.label:(c.d3plus.text=i(e,c[e.id.value],c.d3plus.depth),D=_>3*e.labels.padding?e.labels.padding:0,c.d3plus.label={x:0,y:-(B+D+_/2),w:2*B,h:_-D,padding:0,resize:!0,color:u(o(e,c,c.d3plus.depth)),force:!0});return f.sort(function(e,t){return e.d3plus.depth-t.d3plus.depth})},a.fill=!0,a.requirements=["data"],a.scale=1.05,a.shapes=["circle","donut"],t.exports=a},{"../../array/sort.coffee":36,"../../color/legible.coffee":45,"../../core/data/group.coffee":58,"../../core/fetch/color.coffee":64,"../../core/fetch/text.js":67,"../../core/fetch/value.coffee":68}],304:[function(e,t,r){var n,a;a=e("../../../core/console/print.coffee"),n=function(e){var t,r;r={circle:"scatter",donut:"scatter",line:"line",square:"scatter",area:"stacked"},t=r[e.shape.value],a.warning('The "chart" visualization type has been deprecated and will be removed in version 2.0. Please use the "'+t+'" visualization type.'),e.self.type(t).draw()},n.shapes=["circle","donut","line","square","area"],t.exports=n},{"../../../core/console/print.coffee":53}],305:[function(e,t,r){var n;n=function(e){var t,r,n,a,o,i;return topojson.presimplify(e.coords.value),t=e.coords.value,n=d3.keys(t.objects)[0],i=topojson.feature(t,t.objects[n]),r=i.features,o=e.coords.solo.value,a=e.coords.mute.value,r=r.filter(function(t){return t[e.id.value]=t.id,o.length?o.indexOf(t.id)>=0:a.length?a.indexOf(t.id)<0:!0})},n.libs=["topojson"],n.nesting=!1,n.requirements=["coords"],n.scale=1,n.shapes=["coordinates"],n.zoom=!0,t.exports=n},{}],306:[function(e,t,r){var n,a,o;n=e("../../../../core/fetch/color.coffee"),a=e("../../../../color/legible.coffee"),o=e("../../../../core/console/print.coffee"),t.exports=function(e){var t,r,i,s,l,u,c,f,d,p,h;for(t=e.axes,s=t.stacked?[]:e.data.viz,h=2*s.length>e.data.large?0:e.draw.timing,f=function(r,o){return"y"===o?r.attr("x1",-2).attr("x2",-8).attr("y1",function(e){return e.d3plus.y-t.margin.top}).attr("y2",function(e){return e.d3plus.y-t.margin.top}):r.attr("x1",function(e){return e.d3plus.x-t.margin.left}).attr("x2",function(e){return e.d3plus.x-t.margin.left}).attr("y1",t.height+2).attr("y2",t.height+8),r.style("stroke",function(t){return a(n(e,t))}).style("stroke-width",e.data.stroke.width).attr("shape-rendering",e.shape.rendering.value)},e.dev.value&&o.time("creating axis tick groups"),p=e.group.select("g#d3plus_graph_plane").selectAll("g.d3plus_data_tick").data(s,function(r){var n;return n=t.discrete?"_"+r.d3plus[t.discrete]:"","tick_"+r[e.id.value]+"_"+r.d3plus.depth+n}),p.enter().append("g").attr("class","d3plus_data_tick").attr("opacity",0),e.dev.value&&o.timeEnd("creating axis tick groups"),c=["x","y"],l=0,u=c.length;u>l;l++)r=c[l],e.dev.value&&h&&o.time("creating "+r+" ticks"),i=h&&r!==t.discrete?s:[],d=p.selectAll("line.d3plus_data_"+r).data(i,function(t){return"tick_"+t[e.id.value]+"_"+t.d3plus.depth}),e.dev.value&&h&&o.timeEnd("creating "+r+" ticks"),e.dev.value&&h&&o.time("styling "+r+" ticks"),h>0?d.transition().duration(h).call(f,r):d.call(f,r),d.enter().append("line").attr("class","d3plus_data_"+r).call(f,r),e.dev.value&&h&&o.timeEnd("styling "+r+" ticks");h>0?(p.transition().duration(h).attr("opacity",1),p.exit().transition().duration(h).attr("opacity",0).remove()):(p.attr("opacity",1),p.exit().remove())}},{"../../../../color/legible.coffee":45,"../../../../core/console/print.coffee":53,"../../../../core/fetch/color.coffee":64}],307:[function(e,t,r){var n,a,o,i;n=e("./includes/axes.coffee"),a=e("./includes/svg.coffee"),o=e("./includes/mouse.coffee"),i=e("./includes/plot.coffee"),t.exports=function(e,t){void 0===t&&(t={}),n(e,t),i(e,t),a(e,t),e.mouse=t.mouse===!0?o:!1}},{"./includes/axes.coffee":308,"./includes/mouse.coffee":310,"./includes/plot.coffee":311,"./includes/svg.coffee":312}],308:[function(e,t,r){var n,a,o,i,s,l,u,c,f,d,p,h;n=e("../../../../../array/sort.coffee"),i=e("./buffer.coffee"),o=e("../../../../../util/buckets.coffee"),l=e("../../../../../core/fetch/data.js"),u=e("../../../../../core/fetch/value.coffee"),d=e("../../../../../core/console/print.coffee"),h=e("../../../../../util/uniques.coffee"),t.exports=function(e,t){var r,n,o,l,v,g,m,y,x,b,w,_;for(o=s(e),(o||!e.axes.dataset)&&(e.axes.dataset=c(e)),e.axes.scale=t.buffer&&t.buffer!==!0?p(e,t.buffer):!1,r=e.width.viz>e.height.viz?["y","x"]:["x","y"],v=0,m=r.length;m>v;v++)n=r[v],x="x"===n?"y":"x",w=e.order.changed||e.order.sort.changed||e.order.value===!0&&e[x].changed,(!e[n].ticks.values||o||w)&&(e.dev.value&&d.time("calculating "+n+" axis"),e[n].reset=!0,e[n].ticks.values=!1,n===e.axes.discrete&&e[n].value!==e.time.value&&(e[n].ticks.values=h(e.axes.dataset,e[n].value,u,e)),_=[!0,n].indexOf(t.zero)>0?!0:!1,b=a(e,n,_),"y"===n&&(b=b.reverse()),e[n].scale.viz=f(e,n,b),e[n].domain.viz=b,e.dev.value&&d.timeEnd("calculating "+n+" axis"));if(e.axes.mirror.value&&(l=d3.extent(e.y.domain.viz.concat(e.x.domain.viz)),e.x.domain.viz=l,e.x.scale.viz.domain(l),l=l.slice().reverse(),e.y.domain.viz=l,e.y.scale.viz.domain(l)),t.buffer)for(g=0,y=r.length;y>g;g++)n=r[g],n!==e.axes.discrete&&i(e,n,t.buffer)},s=function(e){var t,r,n,a,o,i,s,l,u,c,f,d,p;if(r=e.time.fixed.value&&(e.time.solo.changed||e.time.mute.changed),r||(r=e.id.solo.changed||e.id.mute.changed),r)return r;for(n=["data","time","id","depth","type","x","y"],a=0,l=n.length;l>a;a++)if(i=n[a],e[i].changed){r=!0;break}if(r)return r;for(p=["mute","range","scale","solo","stacked","zerofill"],f=["x","y"],o=0,u=f.length;u>o;o++)for(t=f[o],s=0,c=p.length;c>s;s++)if(d=p[s],e[t][d].changed){r=!0;break}return r},c=function(e){var t,r;return e.time.fixed.value?e.data.viz:(r=d3.range(0,e.id.nesting.length),d3.merge([function(){var n,a,o;for(o=[],n=0,a=r.length;a>n;n++)t=r[n],o.push(l(e,"all",t));return o}()]))},a=function(e,t,r,a){var o,i,s,l,c,f,d,p,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I;if(A="x"===t?"y":"x",e[t].range.value&&2===e[t].range.value.length)return e[t].range.value.slice();if("share"===e[t].scale.value)return e[t].ticks.values=d3.range(0,1.1,.1),[0,1];if(e[t].stacked.value){for(T=[],j=e.axes.dataset,v=0,x=j.length;x>v;v++)d=j[v],d.values?T=T.concat(d.values):T.push(d);return c=d3.nest().key(function(t){return u(e,t,e[A].value)}).rollup(function(r){var n,a;return a=d3.sum(r,function(r){var n;return n=u(e,r,e[t].value),n>0?n:0}),n=d3.sum(r,function(r){var n;return n=u(e,r,e[t].value),0>n?n:0}),[n,a]}).entries(T),I=d3.merge(c.map(function(e){return e.values})),d3.extent(I)}if(e[t].value===e.time.value)return e.time.solo.value.length?d3.extent(e.time.solo.value).map(function(e){return e.constructor!==Date?(e+="",4===e.length&&parseInt(e)+""===e&&(e+="/01/01"),new Date(e)):e}):d3.extent(e.data.time.ticks);for(I=[],M=e.axes.dataset,g=0,b=M.length;b>g;g++)d=M[g],C=u(e,d,e[t].value),C instanceof Array?I=I.concat(C):I.push(C);if("string"==typeof I[0]){if(F=e.order.value===!0?e[A].value:e.order.value){for(S=e.order.sort.value,o=e.order.agg.value||e.aggs.value[F]||"max",i=typeof o,f=I.reduce(function(e,t){return e[t]=[],e},{}),E=e.axes.dataset,y=0,w=E.length;w>y;y++)if(d=E[y],d.values)for(O=d.values,k=0,_=O.length;_>k;k++)B=O[k],p=u(e,B,e[t].value),f[p].push(u(e,B,F));else p=u(e,d,e[t].value),f[p].push(u(e,d,F));for(m in f)B=f[m],"string"===i?f[m]=d3[o](B):"function"===i&&(f[m]=o(B,F));return f=n(d3.entries(f),"value",S),f=f.reduce(function(e,t){return e.push(t.key),e},[])}return h(I)}return I.sort(function(e,t){return e-t}),"log"===e[t].scale.value&&(0===I[0]&&(I[0]=1),0===I[I.length-1]&&(I[I.length-1]=-1)),r&&(l=I.every(function(e){return e>0}),s=I.every(function(e){return 0>e}),(l||s)&&(z=l?1:-1,I.push("log"===e[t].scale.value?z:0))),d3.extent(I)},f=function(e,t,r){var n,a,i;return a="x"===t?e.width.viz:e.height.viz,i=e[t].scale.value,["discrete","share"].indexOf(i)>=0&&(i="linear"),"string"==typeof r[0]?(i="ordinal",n=o([0,a],r.length)):n=[0,a],d3.scale[i]().domain(r).range(n)},p=function(e,t){var r,n,a;return t===!0&&(t="size"),t in e&&(t=e[t].value),a=e.size.scale.min.value,"function"==typeof a&&(a=a(e)),n=e.size.scale.max.value,"function"==typeof n&&(n=n(e)),t===!1?e.size.scale.value.rangeRound([n,n]):"number"==typeof t?e.size.scale.value.rangeRound([t,t]):t?(e.dev.value&&d.time("calculating buffer scale"),r=d3.extent(e.axes.dataset,function(r){var n;return n=u(e,r,t),n?n:0}),r[0]===r[1]&&(a=n),e.dev.value&&d.timeEnd("calculating buffer scale"),e.size.scale.value.domain(r).rangeRound([a,n])):void 0}},{"../../../../../array/sort.coffee":36,"../../../../../core/console/print.coffee":53,"../../../../../core/fetch/data.js":65,"../../../../../core/fetch/value.coffee":68,"../../../../../util/buckets.coffee":203,"../../../../../util/uniques.coffee":209,"./buffer.coffee":309}],309:[function(e,t,r){var n,a;n=e("../../../../../util/buckets.coffee"),a=e("../../../../../util/closest.coffee"),t.exports=function(e,t,r){var o,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T;if("share"!==e[t].scale.value&&!e[t].range.value&&e[t].reset){if(t===e.axes.discrete){if(d=e[t].scale.viz.domain(),"string"==typeof d[0]){for(g=d.length;g>=0;)d.splice(g,0,"d3plus_buffer_"+g),g--;return k=e[t].scale.viz.range(),k=n(d3.extent(k),d.length),e[t].scale.viz.domain(d).range(k)}return"y"===t&&(d=d.slice().reverse()),1===e[t].ticks.values.length?e[t].value===e.time.value&&1!==e.data.time.ticks.length?(l=a(e.data.time.ticks,d[0]),M=e.data.time.ticks.indexOf(l),M>0?d[0]=e.data.time.ticks[M-1]:(c=e.data.time.ticks[M+1]-l,d[0]=new Date(l.getTime()-c)),M<e.data.time.ticks.length-1?d[1]=e.data.time.ticks[M+1]:(c=l-e.data.time.ticks[M-1],d[1]=new Date(l.getTime()+c))):(d[0]-=1,d[1]+=1):e.axes.scale?(f=Math.abs(d[1]-d[0]),o=f/(e[t].ticks.values.length-1),o/=2,z=e[t].scale.viz.range()[1],w=1.5*e.axes.scale.range()[1],v=e[t].scale.viz.invert(-w),h=e[t].scale.viz.invert(z+w),d[0]-o<v?(d[0]=d[0]-o,d[1]=d[1]+o):(d=[v,h],"y"===t&&(d=d.reverse()),p=e[t].scale.viz.domain(),p=p[1]-p[0],p||(d[0]-=1,d[1]+=1))):(f=Math.abs(d[1]-d[0]),o=f/(e[t].ticks.values.length-1),o/=2,d[0]=d[0]-o,d[1]=d[1]+o),"y"===t&&(d=d.reverse()),e[t].scale.viz.domain(d)}if("x"===r&&"x"===t||"y"===r&&"y"===t||r===!0)return d=e[t].scale.viz.domain(),s=d[0]>=0&&d[1]>=0,i=d[0]<=0&&d[1]<=0,"log"===e[t].scale.value?(T=s?1:-1,s&&"y"===t&&(d=d.slice().reverse()),x=Math.pow(10,parseInt(Math.abs(d[0])).toString().length-1)*T,y=d[0]%x,m=y,y&&.1>=m/x&&(m+=x*T),b=0===y?x:m,d[0]-=b,0===d[0]&&(d[0]=T),S=Math.pow(10,parseInt(Math.abs(d[1])).toString().length-1)*T,O=d[1]%S,E=Math.abs(S-O),O&&.1>=E/S&&(E+=S*T),F=0===O?S:E,d[1]+=F,0===d[1]&&(d[1]=T),s&&"y"===t&&(d=d.reverse())):(T=0,"y"===t&&(d=d.slice().reverse()),j=d.filter(function(e){return e.constructor===String}),o=.05*Math.abs(d[1]-d[0])||1,j.length||(d[0]=d[0]-o,d[1]=d[1]+o,(s&&d[0]<T||i&&d[0]>T)&&(d[0]=T),(s&&d[1]<T||i&&d[1]>T)&&(d[1]=T)),"y"===t&&(d=d.reverse())),e[t].scale.viz.domain(d);if(e.axes.scale)return u=!1,e.axes.mirror.value&&(_="y"===t?"x":"y",u=e[_].scale.viz,A=e.width.viz>e.height.viz?"x":"y"),t===A&&u?d=u.domain().slice().reverse():(z=e[t].scale.viz.range()[1],w=e.axes.scale.range()[1],v=e[t].scale.viz.invert(1.5*-w),h=e[t].scale.viz.invert(z+1.5*w),d=[v,h],"y"===t&&(d=d.reverse()),p=e[t].scale.viz.domain(),p=p[1]-p[0],p||(d[0]-=1,d[1]+=1),"y"===t&&(d=d.reverse())),e[t].scale.viz.domain(d)}}},{"../../../../../util/buckets.coffee":203,"../../../../../util/closest.coffee":205}],310:[function(e,t,r){var n,a,o,i,s;n=e("../../../../../util/copy.coffee"),a=e("../../../../../client/pointer.coffee"),o=e("../../../../../core/fetch/color.coffee"),i=e("../../../../../core/fetch/value.coffee"),s=e("../../../../../color/legible.coffee"),t.exports=function(e,t){var r,n,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k;return r=d3.event.type===a.click&&(t.tooltip.value["long"]||t.tooltip.html.value),l=[a.over,a.move].indexOf(d3.event.type)>=0,_=e.d3plus.x,k=e.d3plus.y,v=e.d3plus.r||0,y=t.types[t.type.value].scale||1,v*=y,u=t.axes,w=t.draw.timing?t.timing.mouseevents:0,!r&&l?(n=s(o(t,e)),c=["x","y"].filter(function(r){var n;return n=i(t,e,t[r].value),!(n instanceof Array)&&r!==t.axes.stacked&&t[r].mouse.value&&r!==t.axes.discrete})):c=[],f=function(e){return e.attr("x1",function(e){return"x"===e?_:_-v}).attr("y1",function(e){return"y"===e?k:k+v}).attr("x2",function(e){return"x"===e?_:_-v}).attr("y2",function(e){return"y"===e?k:k+v}).attr("opacity",0)},d=function(e){return e.style("stroke",function(e){return"area"===t.shape.value?"white":n}).attr("stroke-dasharray",function(e){return t[e].mouse.dasharray.value}).attr("shape-rendering",function(e){return t[e].mouse.rendering.value}).style("stroke-width",function(e){return t[e].mouse.width})},p=function(r){return r.attr("x1",function(e){return"x"===e?_:_-v}).attr("y1",function(e){return"y"===e?k:k+v}).attr("x2",function(r){return"x"===r?_:e.d3plus.x0||u.margin.left-t[r].ticks.size}).attr("y2",function(r){return"y"===r?k:e.d3plus.y0||u.height+u.margin.top+t[r].ticks.size}).style("opacity",1)},h=t.g.labels.selectAll("line.d3plus_mouse_axis_label").data(c),w?(h.enter().append("line").attr("class","d3plus_mouse_axis_label").attr("pointer-events","none").call(f).call(d),h.transition().duration(w).call(p).call(d),h.exit().transition().duration(w).call(f).remove()):(h.call(p).call(d),h.enter().append("line").attr("class","d3plus_mouse_axis_label").attr("pointer-events","none").call(f).call(d),h.exit().remove()),x=function(r){return r.attr("font-size",function(e){return t[e].ticks.font.size+"px"}).attr("fill",function(e){return t[e].ticks.font.color}).attr("font-family",function(e){return t[e].ticks.font.family.value}).attr("font-weight",function(e){return t[e].ticks.font.weight}).attr("x",function(e){return"x"===e?_:u.margin.left-5-t[e].ticks.size}).attr("y",function(r){return"y"===r?k:e.d3plus.y0?e.d3plus.y+(e.d3plus.y0-e.d3plus.y)/2+u.margin.top-6:u.height+u.margin.top+5+t[r].ticks.size}).attr("fill","area"===t.shape.value?"white":n)},b=t.g.labels.selectAll("text.d3plus_mouse_axis_label").data(c),b.enter().append("text").attr("class","d3plus_mouse_axis_label").attr("id",function(e){return e+"_d3plusmouseaxislabel"}).attr("dy",function(e){return"y"===e?.35*t[e].ticks.font.size:t[e].ticks.font.size}).style("text-anchor",function(e){return"y"===e?"end":"middle"}).attr("opacity",0).attr("pointer-events","none").call(x),b.text(function(r){var n,a;return n=t.axes.stacked||r,a=i(t,e,t[n].value),t.format.value(a,{key:t[n].value,vars:t,labels:t[n].affixes.value})}),w?(b.transition().duration(w).delay(w).attr("opacity",1).call(x),b.exit().transition().duration(w).attr("opacity",0).remove()):(b.attr("opacity",1).call(x),b.exit().remove()),g=function(r){var a;return a=function(e){return d3.select("text#"+e+"_d3plusmouseaxislabel").node().getBBox()},r.attr("x",function(e){var r;return r=a(e).width,"x"===e?_-r/2-5:u.margin.left-t[e].ticks.size-r-10}).attr("y",function(r){var n;return n=a(r).height/2+5,"y"===r?k-n:e.d3plus.y0?e.d3plus.y+(e.d3plus.y0-e.d3plus.y)/2+u.margin.top-n:u.height+u.margin.top+t[r].ticks.size}).attr("width",function(e){return a(e).width+10}).attr("height",function(e){return a(e).height+10}).style("stroke","area"===t.shape.value?"transparent":n).attr("fill","area"===t.shape.value?n:t.background.value).attr("shape-rendering",function(e){return t[e].mouse.rendering.value}).style("stroke-width",function(e){return t[e].mouse.width})},m=t.g.labels.selectAll("rect.d3plus_mouse_axis_label").data(c),w?(m.enter().insert("rect","text.d3plus_mouse_axis_label").attr("class","d3plus_mouse_axis_label").attr("pointer-events","none").attr("opacity",0).call(g),m.transition().duration(w).delay(w).attr("opacity",1).call(g),m.exit().transition().duration(w).attr("opacity",0).remove()):(m.attr("opacity",1).call(g),m.enter().insert("rect","text.d3plus_mouse_axis_label").attr("class","d3plus_mouse_axis_label").attr("pointer-events","none").call(g),m.exit().remove())}},{"../../../../../client/pointer.coffee":40,"../../../../../color/legible.coffee":45,"../../../../../core/fetch/color.coffee":64,"../../../../../core/fetch/value.coffee":68,"../../../../../util/copy.coffee":206}],311:[function(e,t,r){var n,a,o,i,s,l,u,c,f,d,p,h;n=e("../../../../../util/buckets.coffee"),a=e("./buffer.coffee"),i=e("../../../../../core/fetch/value.coffee"),s=e("../../../../../font/sizes.coffee"),d=e("../../../../../textwrap/textwrap.coffee"),p=e("../../../../../core/data/time.coffee"),h=e("../../../../../util/uniques.coffee"),t.exports=function(e,t){var r,n,s,l,f,d,h,v,g,m,y,x,b,w,_,k,z;for(e.axes.margin=c(e),e.axes.height=e.height.viz,e.axes.width=e.width.viz,r=e.width.viz>e.height.viz?["y","x"]:["x","y"],f=0,h=r.length;h>f;f++){if(n=r[f],e[n].ticks.values===!1)if(e[n].value===e.time.value){for(_=e.time.solo.value,_=_.length?_.map(function(e){return e.constructor!==Date&&(e+="",4===e.length&&parseInt(e)+""===e&&(e+="/01/01"),e=new Date(e)),e}):e.data.time.values,l=d3.extent(_),x=e.data.time.stepType,_=[l[0]],w=l[0];w<l[1];)g=new Date(w),w=new Date(g["set"+x](g["get"+x]()+1)),_.push(w);e[n].ticks.values=_}else e[n].ticks.values=e[n].scale.viz.ticks();e[n].ticks.values.length||(z=i(e,e.data.viz,e[n].value),z instanceof Array||(z=[z]),e[n].ticks.values=z),m="x"===n?"y":"x",(1===e[n].ticks.values.length||t.buffer&&t.buffer!==m&&n===e.axes.discrete&&e[n].reset===!0)&&a(e,n,t.buffer),e[n].reset=!1,e[n].value===e.time.value?(s={"font-family":e[n].ticks.font.family.value,"font-weight":e[n].ticks.font.weight,"font-size":e[n].ticks.font.size+"px"},k=p(e,{values:e[n].ticks.values,limit:e.width.viz,style:s}),e[n].ticks.visible=k.values.map(Number),e[n].ticks.format=k.format):"log"===e[n].scale.value?(_=e[n].ticks.values,b=_.filter(function(e){return"1"===Math.abs(e).toString().charAt(0)}),e[n].ticks.visible=b.length<3?_:b):e[n].ticks.visible=e[n].ticks.values}for(e.small||u(e),y=["x","y"],d=0,v=y.length;v>d;d++)n=y[d],e[n].axis.svg=o(e,n)},c=function(e){return e.small?{top:0,right:0,bottom:0,left:0}:{top:10,right:10,bottom:10,left:10}},u=function(e){var t,r,a,o,i,u,c,f,p,h,v,g,m,y,x,b,w,_,k,z;return c=e.x.scale.viz.domain(),b=e.y.scale.viz.domain(),y={"font-size":e.y.ticks.font.size+"px","font-family":e.y.ticks.font.family.value,"font-weight":e.y.ticks.font.weight},z=e.y.ticks.visible,"log"===e.y.scale.value?k=z.map(function(e){return l(e)}):"share"===e.y.scale.value?k=z.map(function(t){return e.format.value(100*t,{key:"share",vars:e})}):e.y.value===e.time.value?k=z.map(function(t,r){return e.y.ticks.format(new Date(t))}):("string"==typeof z[0]&&(z=e.y.scale.viz.domain().filter(function(e){return 0!==e.indexOf("d3plus_buffer_")})),k=z.map(function(t){return e.format.value(t,{key:e.y.value,vars:e,labels:e.y.affixes.value})})),x=d3.max(s(k,y),function(e){return e.width}),x=Math.ceil(x+e.labels.padding),e.axes.margin.left+=x,w=e.y.label.fetch(e),w?(_={"font-family":e.y.label.font.family.value,"font-weight":e.y.label.font.weight,"font-size":e.y.label.font.size+"px"},e.y.label.height=s([w],_)[0].height):e.y.label.height=0,e.y.label.value&&(e.axes.margin.left+=e.y.label.height,e.axes.margin.left+=2*e.y.label.padding),e.axes.width-=e.axes.margin.left+e.axes.margin.right,e.x.scale.viz.range(n([0,e.axes.width],c.length)),o={"font-size":e.x.ticks.font.size+"px","font-family":e.x.ticks.font.family.value,"font-weight":e.x.ticks.font.weight},m=e.x.ticks.visible,"log"===e.x.scale.value?g=m.map(function(e){return l(e)}):"share"===e.x.scale.value?g=m.map(function(t){return e.format.value(100*t,{key:"share",vars:e})}):e.x.value===e.time.value?g=m.map(function(t,r){return e.x.ticks.format(new Date(t))}):("string"==typeof m[0]&&(m=e.x.scale.viz.domain().filter(function(e){return 0!==e.indexOf("d3plus_buffer_")})),g=m.map(function(t){return e.format.value(t,{key:e.x.value,vars:e,labels:e.x.affixes.value})})),v=s(g,o),u=d3.max(v,function(e){return e.width}),i=d3.max(v,function(e){return e.height}),1===m.length?h=e.axes.width:(h=e.x.scale.viz(m[1])-e.x.scale.viz(m[0]),h=Math.abs(h)),u>h&&g.join("").indexOf(" ")>0?(e.x.ticks.wrap=!0,v=s(g,o,{mod:function(t){return d().container(d3.select(t)).height(e.axes.height/2).width(h).draw()}}),u=d3.max(v,function(e){return e.width}),i=d3.max(v,function(e){return e.height})):e.x.ticks.wrap=!1,e.x.ticks.hidden=!1,e.x.ticks.baseline="auto",h>=u?e.x.ticks.rotate=0:u<e.axes.height/2?(v=s(g,o,{mod:function(t){return d().container(d3.select(t)).width(e.axes.height/2).height(h).draw()}}),i=d3.max(v,function(e){return e.width}),u=d3.max(v,function(e){return e.height}),e.x.ticks.rotate=-90):(u=0,i=0),u&&i||(e.x.ticks.hidden=!0,e.x.ticks.rotate=0),u=Math.ceil(u),i=Math.ceil(i),u++,i++,e.x.ticks.maxHeight=i,e.x.ticks.maxWidth=u,e.axes.margin.bottom+=i+e.labels.padding,t=e.x.ticks.visible[e.x.ticks.visible.length-1],r=e.x.scale.viz(t),r+=u/2+e.axes.margin.left,r>e.width.value&&(a=r-e.width.value+e.axes.margin.right,e.axes.width-=a,e.axes.margin.right+=a),f=e.x.label.fetch(e),f?(p={"font-family":e.x.label.font.family.value,"font-weight":e.x.label.font.weight,"font-size":e.x.label.font.size+"px"},e.x.label.height=s([f],p)[0].height):e.x.label.height=0,e.x.label.value&&(e.axes.margin.bottom+=e.x.label.height,e.axes.margin.bottom+=2*e.x.label.padding),e.axes.height-=e.axes.margin.top+e.axes.margin.bottom,e.x.scale.viz.range(n([0,e.axes.width],c.length)),e.y.scale.viz.range(n([0,e.axes.height],b.length))},o=function(e,t){return d3.svg.axis().tickSize(e[t].ticks.size).tickPadding(5).orient("x"===t?"bottom":"left").scale(e[t].scale.viz).tickValues(e[t].ticks.values).tickFormat(function(r,n){var a,o;return e[t].ticks.hidden?null:(o=e[t].scale.value,a=r.constructor===Date?+r:r,e[t].ticks.visible.indexOf(a)>=0?"share"===o?e.format.value(100*r,{key:"share",vars:e,labels:e[t].affixes.value}):r.constructor===Date?e[t].ticks.format(r):"log"===o?l(r):e.format.value(r,{key:e[t].value,vars:e,labels:e[t].affixes.value}):null)})},f="???????????????????????????",l=function(e){
var t,r,n;return r=Math.round(Math.log(Math.abs(e))/Math.LN10),n=Math.abs(e).toString().charAt(0),t="10 "+(r+"").split("").map(function(e){return f[e]}).join(""),"1"!==n&&(t=n+" x "+t),0>e?"-"+t:t}},{"../../../../../core/data/time.coffee":63,"../../../../../core/fetch/value.coffee":68,"../../../../../font/sizes.coffee":101,"../../../../../textwrap/textwrap.coffee":199,"../../../../../util/buckets.coffee":203,"../../../../../util/uniques.coffee":209,"./buffer.coffee":309}],312:[function(e,t,r){var n,a,o;n=e("../../../../../color/mix.coffee"),a=e("../../../../../textwrap/textwrap.coffee"),o=e("../../../../../object/validate.coffee"),t.exports=function(e){var t,r,i,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R,U,V,L,Y,H,X,G,J,W,Q,K,Z,$,ee,te,re;if(p=e.x.domain.viz.concat(e.y.domain.viz),p.indexOf(void 0)>=0)return null;for(c={width:e.axes.width,height:e.axes.height,fill:e.axes.background.color,stroke:e.axes.background.stroke.color,"stroke-width":e.axes.background.stroke.width,"shape-rendering":e.axes.background.rendering.value},r={left:"start",center:"middle",right:"end"},s=e.small?[]:[0],J=function(t,r){return t.attr("x1",function(t){return"x"===r?e.x.scale.viz(t):0}).attr("x2",function(t){return"x"===r?e.x.scale.viz(t):e.axes.width}).attr("y1",function(t){return"y"===r?e.y.scale.viz(t):0}).attr("y2",function(t){return"y"===r?e.y.scale.viz(t):e.axes.height})},W=function(t,r,a){var o,i;return o=a?e[r].grid.color:e[r].ticks.color,i="log"===e[r].scale.value,t.attr("stroke",function(t){var s;return 0===t?e[r].axis.color:(t.constructor===Date&&(t=+t),s=e[r].ticks.visible.indexOf(t)>=0,!s||i&&"1"!==Math.abs(t).toString().charAt(0)?a?n(o,e.axes.background.color,.4,1):n(o,e.background.value,.4,1):o)}).attr("stroke-width",e[r].ticks.width).attr("shape-rendering",e[r].ticks.rendering.value)},h=function(t,r,n){var a;return a=0===r?"axis":"ticks",r=e[t][a].font[n],r&&(r.length||"number"==typeof r)?r:e[t].ticks.font[n]},G=function(t,r){var a;return a="log"===e[r].scale.value,t.attr("font-size",function(e){return h(r,e,"size")+"px"}).attr("fill",function(t){var o;return o=h(r,t,"color"),a&&"1"!==Math.abs(t).toString().charAt(0)?n(o,e.background.value,.4,1):o}).attr("font-family",function(e){return h(r,e,"family").value}).attr("font-weight",function(e){return h(r,e,"weight")})},F=function(t,r){var n,a;return n="x"===r?"height":"width",a="x"===r?"y":"x",t.attr(a+"1",0).attr(a+"2",e.axes[n]).attr(r+"1",function(e){return e.coords.line}).attr(r+"2",function(e){return e.coords.line}).attr("stroke",function(t){return t.color||e[r].lines.color}).attr("stroke-width",e[r].lines.width).attr("shape-rendering",e[r].lines.rendering.value).attr("stroke-dasharray",e[r].lines.dasharray.value)},E=function(t,n){var a;return a="x"===n?"y":"x",t.attr(a,function(e){return e.coords.text[a]+"px"}).attr(n,function(e){return e.coords.text[n]+"px"}).attr("dy",e[n].lines.font.position.value).attr("text-anchor",r[e[n].lines.font.align.value]).attr("transform",function(e){return e.transform}).attr("font-size",e[n].lines.font.size+"px").attr("fill",function(t){return t.color||e[n].lines.color}).attr("font-family",e[n].lines.font.family.value).attr("font-weight",e[n].lines.font.weight)},N="translate("+e.axes.margin.left+","+e.axes.margin.top+")",I=e.group.selectAll("g#d3plus_graph_plane").data([0]),I.transition().duration(e.draw.timing).attr("transform",N),I.enter().append("g").attr("id","d3plus_graph_plane").attr("transform",N),u=I.selectAll("rect#d3plus_graph_background").data([0]),u.transition().duration(e.draw.timing).attr(c),u.enter().append("rect").attr("id","d3plus_graph_background").attr("x",0).attr("y",0).attr(c),C=I.selectAll("path#d3plus_graph_mirror").data([0]),C.enter().append("path").attr("id","d3plus_graph_mirror").attr("fill","#000").attr("fill-opacity",.03).attr("stroke-width",1).attr("stroke","#ccc").attr("stroke-dasharray","10,10").attr("opacity",0),C.transition().duration(e.draw.timing).attr("opacity",function(){return e.axes.mirror.value?1:0}).attr("d",function(){var e,t;return t=c.width,e=c.height,"M "+t+" "+e+" L 0 "+e+" L "+t+" 0 Z"}),V=0!==e.x.ticks.rotate,$=function(t){var r;return r=t.attr("transform","translate(0,"+e.axes.height+")").call(e.x.axis.svg.scale(e.x.scale.viz)).selectAll("g.tick"),r.selectAll("line").attr("y2",function(t){var r;return t.constructor===Date&&(t=+t),r=d3.select(this).attr("y2"),e.x.ticks.visible.indexOf(t)>=0?r:r/2}),r.select("text").attr("dy","").style("text-anchor",V?"end":"middle").call(G,"x").each("end",function(t){return t.constructor===Date&&(t=+t),!e.x.ticks.hidden&&e.x.ticks.visible.indexOf(t)>=0?a().container(d3.select(this)).rotate(e.x.ticks.rotate).valign(V?"middle":"top").width(e.x.ticks.maxWidth).height(e.x.ticks.maxHeight).padding(0).x(-e.x.ticks.maxWidth/2).draw():void 0})},K=I.selectAll("g#d3plus_graph_xticks").data(s),K.transition().duration(e.draw.timing).call($),K.selectAll("line").transition().duration(e.draw.timing).call(W,"x"),Z=K.enter().append("g").attr("id","d3plus_graph_xticks").transition().duration(0).call($),Z.selectAll("path").attr("fill","none"),Z.selectAll("line").call(W,"x"),K.exit().transition().duration(e.data.timing).attr("opacity",0).remove(),re=function(t){var r;return r=t.call(e.y.axis.svg.scale(e.y.scale.viz)).selectAll("g.tick"),r.selectAll("line").attr("y2",function(t){var r;return t.constructor===Date&&(t=+t),r=d3.select(this).attr("y2"),e.x.ticks.visible.indexOf(t)>=0?r:r/2}),r.select("text").call(G,"y")},ee=I.selectAll("g#d3plus_graph_yticks").data(s),ee.transition().duration(e.draw.timing).call(re),ee.selectAll("line").transition().duration(e.draw.timing).call(W,"y"),te=ee.enter().append("g").attr("id","d3plus_graph_yticks").call(re),te.selectAll("path").attr("fill","none"),te.selectAll("line").call(W,"y"),ee.exit().transition().duration(e.data.timing).attr("opacity",0).remove(),_=function(t,r){return t.attr("x","x"===r?e.width.viz/2:-(e.axes.height/2+e.axes.margin.top)).attr("y","x"===r?e.height.viz-e[r].label.height/2-e[r].label.padding:e[r].label.height/2+e[r].label.padding).attr("transform","y"===r?"rotate(-90)":null).attr("font-family",e[r].label.font.family.value).attr("font-weight",e[r].label.font.weight).attr("font-size",e[r].label.font.size+"px").attr("fill",e[r].label.font.color).style("text-anchor","middle").attr("dominant-baseline","central")},R=["x","y"],m=0,k=R.length;k>m;m++)i=R[m],e[i].grid.value?g=e[i].ticks.values:(g=[],e[i].ticks.values.indexOf(0)>=0&&e[i].axis.value&&(g=[0])),v=I.selectAll("g#d3plus_graph_"+i+"grid").data([0]),v.enter().append("g").attr("id","d3plus_graph_"+i+"grid"),T=v.selectAll("line").data(g,function(e,t){return e.constructor===Date?e.getTime():e}),T.transition().duration(e.draw.timing).call(J,i).call(W,i,!0),T.enter().append("line").style("opacity",0).call(J,i).call(W,i,!0).transition().duration(e.draw.timing).delay(e.draw.timing/2).style("opacity",1),T.exit().transition().duration(e.draw.timing/2).style("opacity",0).remove(),l=e[i].label.fetch(e),w=s&&l?[0]:[],t=e.format.affixes.value[e[i].value],l&&!e[i].affixes.value&&t&&(L=e[i].affixes.separator.value,L===!0?L=["[","]"]:L===!1&&(L=["",""]),l+=" "+L[0]+t[0]+" "+t[1]+L[1]),b=e.group.selectAll("text#d3plus_graph_"+i+"label").data(w),b.text(l).transition().duration(e.draw.timing).call(_,i),b.enter().append("text").attr("id","d3plus_graph_"+i+"label").text(l).call(_,i),b.exit().transition().duration(e.data.timing).attr("opacity",0).remove();for(U=["x","y"],y=0,z=U.length;z>y;y++){for(i=U[y],O=I.selectAll("g#d3plus_graph_"+i+"_userlines").data([0]),O.enter().append("g").attr("id","d3plus_graph_"+i+"_userlines"),d=e[i].scale.viz.domain(),"y"===i&&(d=d.slice().reverse()),Y=[],M=[],Q=e[i].lines.value||[],x=0,A=Q.length;A>x;x++)j=Q[x],f=o(j)?j.position:j,isNaN(f)||(f=parseFloat(f),f>d[0]&&f<d[1]&&(f=o(j)?j:{position:f},f.coords={line:e[i].scale.viz(f.position)},M.push(f),f.text&&(f.axis=i,f.padding=.5*e[i].lines.font.padding.value,f.align=e[i].lines.font.align.value,P=e[i].lines.font.position.text,H="middle"===P?0:2*f.padding,"top"===P&&(H=-H),"x"===i?(X="left"===f.align?e.axes.height:"center"===f.align?e.axes.height/2:0,"left"===f.align&&(X-=2*f.padding),"right"===f.align&&(X+=2*f.padding)):(X="left"===f.align?0:"center"===f.align?e.axes.width/2:e.axes.width,"right"===f.align&&(X-=2*f.padding),"left"===f.align&&(X+=2*f.padding)),f.coords.text={},f.coords.text["x"===i?"y":"x"]=X,f.coords.text[i]=e[i].scale.viz(f.position)+H,f.transform="x"===i?"rotate(-90,"+f.coords.text.x+","+f.coords.text.y+")":null,Y.push(f))));T=O.selectAll("line.d3plus_graph_"+i+"line").data(M,function(e){return e.position}),T.enter().append("line").attr("class","d3plus_graph_"+i+"line").attr("opacity",0).call(F,i),T.transition().duration(e.draw.timing).attr("opacity",1).call(F,i),T.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),B=O.selectAll("text.d3plus_graph_"+i+"line_text").data(Y,function(e){return e.position}),B.enter().append("text").attr("class","d3plus_graph_"+i+"line_text").attr("id",function(e){var t;return t=e.position+"",t=t.replace("-","neg"),t=t.replace(".","p"),"d3plus_graph_"+i+"line_text_"+t}).attr("opacity",0).call(E,i),B.text(function(e){return e.text}).transition().duration(e.draw.timing).attr("opacity",1).call(E,i),B.exit().transition().duration(e.draw.timing).attr("opacity",0).remove(),D=function(t){var r;return r=function(e){var t;return t=e.position+"",t=t.replace("-","neg"),t=t.replace(".","p"),I.select("text#d3plus_graph_"+e.axis+"line_text_"+t).node().getBBox()},t.attr("x",function(e){return r(e).x-e.padding}).attr("y",function(e){return r(e).y-e.padding}).attr("transform",function(e){return e.transform}).attr("width",function(e){return r(e).width+2*e.padding}).attr("height",function(e){return r(e).height+2*e.padding}).attr("fill",e.axes.background.color)},q=e[i].lines.font.background.value?Y:[],S=O.selectAll("rect.d3plus_graph_"+i+"line_rect").data(q,function(e){return e.position}),S.enter().insert("rect","text.d3plus_graph_"+i+"line_text").attr("class","d3plus_graph_"+i+"line_rect").attr("pointer-events","none").attr("opacity",0).call(D),S.transition().delay(e.draw.timing).each("end",function(t){return d3.select(this).transition().duration(e.draw.timing).attr("opacity",1).call(D)}),S.exit().transition().duration(e.draw.timing).attr("opacity",0).remove()}}},{"../../../../../color/mix.coffee":47,"../../../../../object/validate.coffee":171,"../../../../../textwrap/textwrap.coffee":199}],313:[function(e,t,r){var n,a,o;n=e("../../../../core/fetch/value.coffee"),a=e("../../../../string/strip.js"),o=e("../../../../util/uniques.coffee"),t.exports=function(e,t){var r,i,s,l,u,c;return t||(t=e.data.viz),r=e[e.axes.discrete],s=e[e.axes.opposite],c=r.value===e.time.value,c?(u=e.data.time.ticks,i=e.time.solo.value.length?"solo":"mute",e.time[i].value.length&&(l=e.time[i].value.slice().map(function(e){return e.constructor!==Date&&(e+="",4===e.length&&parseInt(e)+""===e&&(e+="/01/01"),e=new Date(e)),+e}),u=u.filter(function(e){return"solo"===i?l.indexOf(+e)>=0:l.indexOf(+e)<0}))):u=r.ticks.values?r.ticks.values:o(t,r.value,n,e),d3.nest().key(function(t){var r,o,i,s,l,u;for(l="nesting",s=e.id.nesting.slice(0,e.depth.value+1),o=0,i=s.length;i>o;o++)r=s[o],u=n(e,t,r),u instanceof Array&&(u=u.join("_")),l+="_"+a(u);return l}).rollup(function(t){var a,l,f,d,p,h,v,g,m,y,x,b;if(a=o(t,r.value,n,e),b=a.length&&a[0].constructor===Date,b&&(a=a.map(Number)),r.zerofill.value)for(l="log"===r.scale.value?s.scale.viz.domain().every(function(e){return 0>e})?-1:1:0,f=d=0,h=u.length;h>d;f=++d)if(x=u[f],y=c?+x:x,a.indexOf(y)<0){for(g={d3plus:{}},m=e.id.nesting,p=0,v=m.length;v>p;p++)i=m[p],i in t[0]&&(g[i]=t[0][i]);g[r.value]=x,g[s.value]=0,g[s.value]=l,t.splice(f,0,g)}return"string"==typeof t[0][r.value]?t:t.sort(function(t,a){var o,i,l,u,c;return o=n(e,t,r.value),l=n(e,a,r.value),(c=o-l)?c:(i=n(e,t,s.value),u=n(e,a,s.value),i-u)})}).entries(t)}},{"../../../../core/fetch/value.coffee":68,"../../../../string/strip.js":174,"../../../../util/uniques.coffee":209}],314:[function(e,t,r){var n;n=e("../../../../core/fetch/value.coffee"),t.exports=function(e,t){var r,a,o,i,s,l,u,c,f,d,p,h,v,g,m,y,x;for(m=e.axes.stacked,a=e[m].scale.viz(0),v=e[m].scale.value,p="x"===m?"y":"x",u="y"===m?e.axes.margin.top:e.axes.margin.left,d="share"===v?"expand":"zero",g=d3.layout.stack().values(function(e){return e.values}).offset(d).x(function(e){return e.d3plus[p]}).y(function(t){return a-e[m].scale.viz(n(e,t,e[m].value))}).out(function(t,r,o){var i,s;return s=n(e,t,e[m].value),i=0>s,"share"===v?(t.d3plus[m+"0"]=(1-r)*a,t.d3plus[m]=t.d3plus[m+"0"]-o*a):(t.d3plus[m+"0"]=a-r,t.d3plus[m]=t.d3plus[m+"0"]-o),t.d3plus[m]+=u,t.d3plus[m+"0"]+=u}),h=[],f=[],o=0,s=t.length;s>o;o++)if(r=t[o],x=n(e,r,e[m].value),x instanceof Array){for(c=!0,i=0,l=x.length;l>i;i++)if(y=x[i],y>=0){c=!1;break}c?f.push(r):h.push(r)}else x>=0&&h.push(r),0>x&&f.push(r);return h.length||f.length?(h.length&&(h=g(h)),f.length&&(f=g(f)),h.concat(f)):g(t)}},{"../../../../core/fetch/value.coffee":68}],315:[function(e,t,r){var n,a,o,i,s;n=e("../../core/fetch/value.coffee"),a=e("./helpers/graph/draw.coffee"),i=e("./helpers/graph/nest.coffee"),s=e("./helpers/graph/stack.coffee"),o=function(e){var t,r,o,i,l,u,c,f,d;if(a(e,{buffer:e.axes.opposite,mouse:!0}),o=e.x.domain.viz.concat(e.y.domain.viz),o.indexOf(void 0)>=0)return[];for(r=e.data.viz,i=0,u=r.length;u>i;i++)for(f=r[i],d=f.values,l=0,c=d.length;c>l;l++)t=d[l],t.d3plus.x=e.x.scale.viz(n(e,t,e.x.value)),t.d3plus.x+=e.axes.margin.left,t.d3plus.y=e.y.scale.viz(n(e,t,e.y.value)),t.d3plus.y+=e.axes.margin.top;return e.axes.stacked?s(e,r):r},o.filter=function(e,t){return i(e,t)},o.requirements=["data","x","y"],o.setup=function(e){var t,r,n;e.axes.discrete||(t=e.time.value===e.y.value?"y":"x",e.self[t]({scale:"discrete"})),n=e[e.axes.opposite],r=e.size,!n.value&&r.value||r.changed&&r.previous===n.value?e.self[e.axes.opposite](r.value):(!r.value&&n.value||n.changed&&n.previous===r.value)&&e.self.size(n.value)},o.shapes=["line"],o.tooltip="static",t.exports=o},{"../../core/fetch/value.coffee":68,"./helpers/graph/draw.coffee":307,"./helpers/graph/nest.coffee":313,"./helpers/graph/stack.coffee":314}],316:[function(e,t,r){var n=e("../../network/smallestGap.coffee"),a=e("../../core/fetch/value.coffee"),o=function(e){var t=e.nodes.restricted||e.nodes.value,r=e.edges.restricted||e.edges.value,o=d3.extent(t,function(e){return e.x}),i=d3.extent(t,function(e){return e.y}),s=[1,1];if("number"==typeof e.size.value?s=[e.size.value,e.size.value]:e.size.value&&(s=d3.extent(t,function(t){var r=a(e,t,e.size.value);return 0===r?null:r})),"undefined"==typeof s[0]&&(s=[1,1]),"number"==typeof e.size.value)var l=e.size.value,u=e.size.value;else{var l=n(t,{accessor:function(e){return[e.x,e.y]}}),c=l/2,f=e.size.value?e.nodes.overlap:.4;if(l*=f,e.edges.arrows.value&&(l=.5*l),s[0]===s[1]){var u=c;l=c}else{var d=o[1]+1.1*l-(o[0]-1.1*l),p=i[1]+1.1*l-(i[0]-1.1*l),h=d/p,v=e.width.viz/e.height.viz;if(v>h)var g=e.height.viz/p;else var g=e.width.viz/d;var u=.25*l;2>u*g&&(u=2/g)}}var m=e.size.scale.value.domain(s).range([u,l]);e.zoom.bounds=[[o[0]-1.1*l,i[0]-1.1*l],[o[1]+1.1*l,i[1]+1.1*l]];var y=[],x={};return t.forEach(function(t){var r=e.data.viz.filter(function(r){return r[e.id.value]==t[e.id.value]})[0],n=r||{};n[e.id.value]=t[e.id.value],n.d3plus={},n.d3plus.x=t.x,n.d3plus.y=t.y;var o=a(e,n,e.size.value);n.d3plus.r=o?m(o):m.range()[0],x[n[e.id.value]]={x:n.d3plus.x,y:n.d3plus.y,r:n.d3plus.r},y.push(n)}),y.sort(function(e,t){return t.d3plus.r-e.d3plus.r}),r.forEach(function(t,r){t.d3plus&&delete t.d3plus.spline,t[e.edges.source].d3plus={};var n=x[t[e.edges.source][e.id.value]];t[e.edges.source].d3plus.r=n.r,t[e.edges.source].d3plus.x=n.x,t[e.edges.source].d3plus.y=n.y,t[e.edges.target].d3plus={};var a=x[t[e.edges.target][e.id.value]];t[e.edges.target].d3plus.r=a.r,t[e.edges.target].d3plus.x=a.x,t[e.edges.target].d3plus.y=a.y}),{nodes:y,edges:r}};o.nesting=!1,o.requirements=["nodes","edges"],o.scale=1.05,o.shapes=["circle","square","donut"],o.tooltip="static",o.zoom=!0,t.exports=o},{"../../core/fetch/value.coffee":68,"../../network/smallestGap.coffee":167}],317:[function(e,t,r){var n,a,o,i,s=[].indexOf||function(e){for(var t=0,r=this.length;r>t;t++)if(t in this&&this[t]===e)return t;return-1};a=e("../../network/shortestPath.coffee"),n=e("../../core/fetch/value.coffee"),o=e("../../util/uniques.coffee"),i=function(e){var t,r,a,o,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z,A,j,M,E,O,S,F,T,B,C,I,N,P,q,D,R,U,V,L,Y,H,X,G,J,W,Q,K,Z,$,ee,te,re,ne,ae,oe,ie,se,le,ue,ce,fe,de;for(h=[],H={},H[e.focus.value[0]]=0,H[e.focus.value[1]]=0,X={all:[[e.focus.value[0]],[e.focus.value[1]]]},Q=i.paths,Y=m=0,k=Q.length;k>m;Y=++m)for(L=Q[Y],h=h.concat(L.edges),_=e.focus.value[0],X[Y]=[_],K=L.edges,p=y=0,z=K.length;z>y;p=++y)d=K[p],d[e.edges.source]=e.data.viz.filter(function(t){return d[e.edges.source][e.id.value]===t[e.id.value]})[0],d[e.edges.target]=e.data.viz.filter(function(t){return d[e.edges.target][e.id.value]===t[e.id.value]})[0],P=d[e.edges.source][e.id.value]===_?"target":"source",q=d[e.edges[P]][e.id.value],void 0===H[q]&&(H[q]=Y),X[Y].push(q),_=q;oe=0;for(Y in X)if(L=X[Y],"all"!==Y){for(I=0,v=x=0,A=L.length;A>x;v=++x)if(g=L[v],0!==v&&v!==L.length-1&&H[g]===parseFloat(Y)){for(I=1,G=L[v-1],N=L[v+1],J=null,D=null,Z=X.all,u=F=0,j=Z.length;j>F;u=++F)l=Z[u],s.call(l,G)>=0&&(J=u),s.call(l,N)>=0&&(D=u);null!==J&&null===D?J+1===X.all.length-1?X.all.splice(J+1,0,[g]):X.all[J+1].push(g):D-J===1?X.all.splice(D,0,[g]):D-J>1&&X.all[D-1].push(g)}oe+=I}for(ae=Math.floor(e.height.viz/oe),de=[],v=0;oe>v;)v%2===0?de.push(v):de.unshift(v),v++;for(b=e.size.value&&!e.small?30:0,fe=d3.scale.ordinal().domain(de).range(d3.range(ae/2-b,e.height.viz+ae/2-b,(e.height.viz-ae)/(oe-1))),f=X.all.length,c=Math.floor(e.width.viz/f),ue=d3.scale.linear().domain([0,f-1]).rangeRound([c/2,e.width.viz-c/2]),B=5,T=.4*d3.min([c,ae-b]),se=d3.extent(e.data.viz,function(t){var r;return r=n(e,t,e.size.value),r||0}),ie=e.size.scale.value.domain(se).rangeRound([B,T]),$=e.data.viz,C=0,M=$.length;M>C;C++){for(R=$[C],null==R.d3plus&&(R.d3plus={}),ee=X.all,u=U=0,E=ee.length;E>U;u=++U)l=ee[u],te=R[e.id.value],s.call(l,te)>=0&&(R.d3plus.x=ue(u));R.d3plus.y=fe(H[R[e.id.value]]),e.size.value?(le=n(e,R,e.size.value),R.d3plus.r=le?ie(le):B):R.d3plus.r=T,R.d3plus.r<.1*c&&!e.small?R.d3plus.label={x:0,y:R.d3plus.r+2*e.labels.padding,w:.6*c,h:b+T-R.d3plus.r,resize:!1}:delete R.d3plus.label}for(re=i.paths,Y=V=0,O=re.length;O>V;Y=++V)for(L=re[Y],_=e.focus.value[0],ne=L.edges,p=W=0,S=ne.length;S>W;p=++W)d=ne[p],P=d[e.edges.source][e.id.value]===_?"target":"source",w="target"===P?"source":"target",q=d[e.edges[P]][e.id.value],H[_]!==H[q]?(d.d3plus={spline:!0},null==(t=d[e.edges.source]).d3plus&&(t.d3plus={}),null==(r=d[e.edges.source].d3plus).edges&&(r.edges={}),null==(a=d[e.edges.target]).d3plus&&(a.d3plus={}),null==(o=d[e.edges.target].d3plus).edges&&(o.edges={}),ce=d[P].d3plus.x-d[w].d3plus.x,d[w].d3plus.edges[d[P][e.id.value]]={angle:Math.PI,radius:c/2},d[P].d3plus.edges[d[w][e.id.value]]={angle:0,radius:c/2,offset:ce-c}):delete d.d3plus,_=q;return{nodes:e.data.viz,edges:h}},i.filter=function(e,t){var r,s,l,u,c,f,d,p,h,v,g,m,y,x,b,w,_,k,z;for(u=e.edges.filtered||e.edges.value,i.paths=a(u,e.focus.value[0],{target:e.focus.value[1],distance:e.edges.size.value||void 0,nodeid:e.id.value,startpoint:e.edges.source,endpoint:e.edges.target,K:e.edges.limit.value||5}),i.nodes=[],r=[],b=i.paths,d=0,v=b.length;v>d;d++)for(x=b[d],w=x.edges,p=0,g=w.length;g>p;p++)l=w[p],k=l[e.edges.source],z=l[e.edges.target],r.indexOf(k[e.id.value])<0&&(i.nodes.push(k),r.push(k[e.id.value])),r.indexOf(z[e.id.value])<0&&(i.nodes.push(z),r.push(z[e.id.value]));for(f=o(i.nodes,e.id.value,n,e),_=[],h=0,m=f.length;m>h;h++)c=f[h],s=t.filter(function(t){return t[e.id.value]===c}),s[0]?_.push(s[0]):(y={d3plus:{}},y[e.id.value]=c,_.push(y));return _},i.nesting=!1,i.requirements=[function(e){return{status:2===e.focus.value.length,text:e.format.locale.value.method.focus+" x 2"}},"edges"],i.scale=1,i.shapes=["circle","square","donut"],i.tooltip="static",t.exports=i},{"../../core/fetch/value.coffee":68,"../../network/shortestPath.coffee":166,"../../util/uniques.coffee":209}],318:[function(e,t,r){var n,a,o,i,s,l;n=e("../../array/comparator.coffee"),a=e("../../core/data/threshold.js"),o=e("../../core/fetch/value.coffee"),i=e("../../core/data/group.coffee"),s={},l=function(e){var t,r,a,l,u,c,f,d,p;for(f=d3.layout.pie().value(function(e){return e.value}).sort(function(t,r){var a,i;return e.order.value?n(t.d3plus,r.d3plus,[e.order.value],e.order.sort.value,[],e):(a=o(e,t.d3plus,e.id.value),void 0===s[a]&&(s[a]=t.value),i=o(e,r.d3plus,e.id.value),void 0===s[i]&&(s[i]=r.value),s[i]<s[a]?-1:1)}),r=i(e,e.data.viz,[]),c=f(r),p=[],d=d3.min([e.width.viz,e.height.viz])/2-2*e.labels.padding,a=0,u=c.length;u>a;a++)t=c[a],l=t.data.d3plus,l.d3plus.startAngle=t.startAngle,l.d3plus.endAngle=t.endAngle,l.d3plus.r=d,l.d3plus.x=e.width.viz/2,l.d3plus.y=e.height.viz/2,p.push(l);return p},l.filter=a,l.requirements=["data","size"],l.shapes=["arc"],l.threshold=function(e){return 1600/(e.width.viz*e.height.viz)},t.exports=l},{"../../array/comparator.coffee":34,"../../core/data/group.coffee":58,"../../core/data/threshold.js":62,"../../core/fetch/value.coffee":68}],319:[function(e,t,r){var n=e("../../array/sort.coffee"),o=e("../../client/pointer.coffee"),i=e("../../core/fetch/value.coffee"),s=e("../../core/fetch/color.coffee"),l=e("../../color/legible.coffee"),u=e("../../tooltip/remove.coffee"),c=e("../../network/smallestGap.coffee"),f=e("../../util/uniques.coffee"),d=function(e){var t=d3.min([e.height.viz,e.width.viz])/2,r=e.small||!e.labels.value?(t-2*e.labels.padding)/2:t/3,d=e.small||!e.labels.value?1.4*r:r,p=2*r,h=[],v=[],g=e.data.viz.filter(function(t){return t[e.id.value]===e.focus.value[0]})[0];g||(g={d3plus:{}},g[e.id.value]=e.focus.value[0]),g.d3plus.x=e.width.viz/2,g.d3plus.y=e.height.viz/2,g.d3plus.r=.65*d;var m=[],y=[e.focus.value[0]];e.edges.connections(e.focus.value[0],e.id.value).forEach(function(t){var r=t[e.edges.source][e.id.value]==e.focus.value[0]?t[e.edges.target]:t[e.edges.source],n=e.data.viz.filter(function(t){return t[e.id.value]===r[e.id.value]})[0];n||(n={d3plus:{}},n[e.id.value]=r[e.id.value]),n.d3plus.edges=e.edges.connections(n[e.id.value],e.id.value).filter(function(t){return t[e.edges.source][e.id.value]!=e.focus.value[0]&&t[e.edges.target][e.id.value]!=e.focus.value[0]}),n.d3plus.edge=t,y.push(n[e.id.value]),m.push(n)});var x=e.order.value||e.color.value||e.size.value||e.id.value;m.sort(function(t,r){var a=t.d3plus.edges.length-r.d3plus.edges.length;return a?a:n([t,r],x,e.order.sort.value,e.color.value||[],e)}),"number"==typeof e.edges.limit.value?m=m.slice(0,e.edges.limit.value):"function"==typeof e.edges.limit.value&&(m=e.edges.limit.value(m));var b=[],w=0;m.forEach(function(t){var r=t[e.id.value];t.d3plus.edges=t.d3plus.edges.filter(function(t){var n=t[e.edges.source][e.id.value],a=t[e.edges.target][e.id.value];return y.indexOf(n)<0&&a==r||y.indexOf(a)<0&&n==r}),w+=t.d3plus.edges.length||1,t.d3plus.edges.forEach(function(t){var n=t[e.edges.source],a=t[e.edges.target],o=a[e.id.value]==r?n:a;y.push(o[e.id.value])})}),n(m,x,e.order.sort.value,e.color.value||[],e);var _=0,k=2*Math.PI,z=0;m.forEach(function(t,r){var o=t.d3plus.edges.length||1,i=k/w*o;0==r&&(z=s,_-=i/2);var s=_+i/2;s-=k/4,t.d3plus.radians=s,t.d3plus.x=e.width.viz/2+d*Math.cos(s),t.d3plus.y=e.height.viz/2+d*Math.sin(s),_+=i,t.d3plus.edges.sort(function(r,a){var r=r[e.edges.source][e.id.value]==t[e.id.value]?r[e.edges.target]:r[e.edges.source],a=a[e.edges.source][e.id.value]==t[e.id.value]?a[e.edges.target]:a[e.edges.source];return n([r,a],x,e.order.sort.value,e.color.value||[],e)}),t.d3plus.edges.forEach(function(r,n){var i=r[e.edges.source][e.id.value]==t[e.id.value]?r[e.edges.target]:r[e.edges.source],l=k/w,u=e.data.viz.filter(function(t){return t[e.id.value]===i[e.id.value]})[0];u||(u={d3plus:{}},u[e.id.value]=i[e.id.value]),a=s-l*o/2+l/2+l*n,u.d3plus.radians=a,u.d3plus.x=e.width.viz/2+p*Math.cos(a),u.d3plus.y=e.height.viz/2+p*Math.sin(a),b.push(u)})});var A=c(m,{accessor:function(e){return[e.d3plus.x,e.d3plus.y]}}),j=c(b,{accessor:function(e){return[e.d3plus.x,e.d3plus.y]}});if(A||(A=r/2),j||(j=r/4),8>A/2-4)var M=d3.min([A/2,8]);else var M=A/2-4;if(4>j/2-4)var E=d3.min([j/2,4]);else var E=j/2-4;E>r/10&&(E=r/10),E>M&&E>10&&(E=.75*M),M>1.5*E&&(M=1.5*E),M=Math.floor(M),E=Math.floor(E);var O=f(m,e.id.value,i,e);O=O.concat(f(b,e.id.value,i,e)),O.push(e.focus.value[0]);var S=e.data.viz.filter(function(t){return O.indexOf(t[e.id.value])>=0});if(e.size.value){var F=d3.extent(S,function(t){return i(e,t,e.size.value)});F[0]==F[1]&&(F[0]=0);var t=d3.scale.linear().domain(F).rangeRound([3,d3.min([M,E])]),T=i(e,g,e.size.value);g.d3plus.r=t(T)}else{var t=d3.scale.linear().domain([1,2]).rangeRound([M,E]);e.edges.label&&(g.d3plus.r=1.5*t(1))}return b.forEach(function(r){r.d3plus.ring=2;var n=e.size.value?i(e,r,e.size.value):2;r.d3plus.r=t(n)}),m.forEach(function(r){r.d3plus.ring=1;var n=e.size.value?i(e,r,e.size.value):1;r.d3plus.r=t(n)}),v=[g].concat(m).concat(b),m.forEach(function(t,n){var a=[e.edges.source,e.edges.target],o=t.d3plus.edge;a.forEach(function(t){o[t]=v.filter(function(r){return r[e.id.value]==o[t][e.id.value]})[0]}),delete o.d3plus,h.push(o),e.edges.connections(t[e.id.value],e.id.value).forEach(function(n){var a=n[e.edges.source][e.id.value]==t[e.id.value]?n[e.edges.target]:n[e.edges.source];if(a[e.id.value]!=g[e.id.value]){var o=b.filter(function(t){return t[e.id.value]==a[e.id.value]})[0];if(o);else{o=m.filter(function(t){return t[e.id.value]==a[e.id.value]})[0]}if(o){n.d3plus={spline:!0,translate:{x:e.width.viz/2,y:e.height.viz/2}};var i=[e.edges.source,e.edges.target];i.forEach(function(a,i){n[a]=v.filter(function(t){return t[e.id.value]==n[a][e.id.value]})[0],void 0===n[a].d3plus.edges&&(n[a].d3plus.edges={});var s=0===i?n[e.edges.target][e.id.value]:n[e.edges.source][e.id.value];n[a].d3plus.edges[s]=n[a][e.id.value]==t[e.id.value]?{angle:t.d3plus.radians+Math.PI,radius:r/2}:{angle:o.d3plus.radians,radius:r/2}}),h.push(n)}}})}),v.forEach(function(t){if(!e.small&&e.labels.value)if(t[e.id.value]!=e.focus.value[0]){t.d3plus.rotate=t.d3plus.radians*(180/Math.PI);var n=t.d3plus.rotate,a=r-3*e.labels.padding-t.d3plus.r;if(-90>n||n>90){n-=180;var o=-(t.d3plus.r+a/2+e.labels.padding),i="end"}else var o=t.d3plus.r+a/2+e.labels.padding,i="start";var u=m.indexOf(t)>=0?!0:!1,c=1==t.d3plus.ring?A:j;t.d3plus.label={x:o,y:0,w:a,h:c,angle:n,anchor:i,valign:"center",color:l(s(e,t)),resize:[8,e.labels.font.size],background:u,mouse:!0}}else if(e.size.value||e.edges.label){var c=d-2*t.d3plus.r-2*e.labels.padding;t.d3plus.label={x:0,y:t.d3plus.r+c/2,w:d,h:c,color:l(s(e,t)),resize:[10,40],background:!0,mouse:!0}}else delete t.d3plus.rotate,delete t.d3plus.label;else delete t.d3plus.rotate,delete t.d3plus.label}),e.mouse[o.click]=function(t){t[e.id.value]!=e.focus.value[0]&&(u(e.type.value),e.self.focus(t[e.id.value]).draw())},{edges:h,nodes:v,data:S}};d.filter=function(e,t){var r=e.edges.connections(e.focus.value[0],e.id.value,!0),n=[];r.forEach(function(t){n=n.concat(e.edges.connections(t[e.id.value],e.id.value,!0))});var a=r.concat(n),o=f(a,e.id.value,i,e),s=[];return o.forEach(function(r){var n=t.filter(function(t){return t[e.id.value]==r})[0];if(n)s.push(n);else{var a={d3plus:{}};a[e.id.value]=r,s.push(a)}}),s},d.nesting=!1,d.scale=1,d.shapes=["circle","square","donut"],d.requirements=["edges","focus"],d.tooltip="static",t.exports=d},{"../../array/sort.coffee":36,"../../client/pointer.coffee":40,"../../color/legible.coffee":45,"../../core/fetch/color.coffee":64,"../../core/fetch/value.coffee":68,"../../network/smallestGap.coffee":167,"../../tooltip/remove.coffee":202,"../../util/uniques.coffee":209}],320:[function(e,t,r){var n,a,o,i,s,l;n=e("../../core/fetch/value.coffee"),a=e("./helpers/graph/draw.coffee"),o=e("../../core/console/print.coffee"),s=e("../../array/sort.coffee"),l=e("./helpers/graph/dataTicks.coffee"),i=function(e){var t,r,o,i,u;if(a(e,{buffer:"size",mouse:!0}),r=e.x.domain.viz.concat(e.y.domain.viz),r.indexOf(void 0)>=0)return[];for(u=e.data.viz,o=0,i=u.length;i>o;o++)t=u[o],t.d3plus.x=e.x.scale.viz(n(e,t,e.x.value)),t.d3plus.x+=e.axes.margin.left,t.d3plus.y=e.y.scale.viz(n(e,t,e.y.value)),t.d3plus.y+=e.axes.margin.top,t.d3plus.r=e.axes.scale("number"!=typeof e.size.value&&e.size.value?n(e,t,e.size.value):0);return l(e),s(e.data.viz,e.order.value||e.size.value||e.id.value,"desc"===e.order.sort.value?"asc":"desc",e.color.value||[],e)},i.fill=!0,i.requirements=["data","x","y"],i.scale=1.1,i.setup=function(e){return e.time.value&&!e.axes.discrete&&(e.time.value===e.x.value&&e.self.x({scale:"discrete"}),e.time.value===e.y.value)?e.self.y({scale:"discrete"}):void 0},i.shapes=["circle","square","donut"],i.tooltip="static",t.exports=i},{"../../array/sort.coffee":36,"../../core/console/print.coffee":53,"../../core/fetch/value.coffee":68,"./helpers/graph/dataTicks.coffee":306,"./helpers/graph/draw.coffee":307}],321:[function(e,t,r){var n,a,o,i,s,l,u,c;n=e("../../util/closest.coffee"),a=e("../../core/fetch/value.coffee"),o=e("./helpers/graph/draw.coffee"),i=e("./helpers/graph/nest.coffee"),s=e("../../array/sort.coffee"),l=e("./helpers/graph/stack.coffee"),c=e("../../core/data/threshold.js"),u=function(e){var t,r,n,i,u,c,f,d,p,h,v;if(o(e,{buffer:e.axes.opposite}),i=e.x.domain.viz.concat(e.y.domain.viz),i.indexOf(void 0)>=0)return[];for(r=s(e.data.viz,null,null,null,e),n=e[e.axes.discrete],p=e[e.axes.opposite],u=0,f=r.length;f>u;u++)for(h=r[u],h.d3plus||(h.d3plus={}),v=h.values,c=0,d=v.length;d>c;c++)t=v[c],t.d3plus||(t.d3plus={}),t.d3plus.x=n.scale.viz(a(e,t,n.value)),t.d3plus.x+=e.axes.margin.left,t.d3plus.y=p.scale.viz(a(e,t,p.value)),t.d3plus.y+=e.axes.margin.top,t.d3plus.merged instanceof Array&&(h.d3plus.merged||(h.d3plus.merged=[]),h.d3plus.merged=h.d3plus.merged.concat(t.d3plus.merged)),t.d3plus.text&&!h.d3plus.text&&(h.d3plus.text=t.d3plus.text);return l(e,r)},u.filter=function(e,t){return i(e,c(e,t,e[e.axes.discrete].value))},u.requirements=["data","x","y"],u.setup=function(e){var t,r,n;e.axes.discrete||(t=e.time.value===e.y.value?"y":"x",e.self[t]({scale:"discrete"})),e[e.axes.discrete].zerofill.value||e.self[e.axes.discrete]({zerofill:!0}),e[e.axes.opposite].stacked.value||e.self[e.axes.opposite]({stacked:!0}),n=e[e.axes.opposite],r=e.size,!n.value&&r.value||r.changed&&r.previous===n.value?e.self[e.axes.opposite](r.value):(!r.value&&n.value||n.changed&&n.previous===r.value)&&e.self.size(n.value)},u.shapes=["area"],u.threshold=function(e){return 20/e.height.viz},u.tooltip="static",t.exports=u},{"../../array/sort.coffee":36,"../../core/data/threshold.js":62,"../../core/fetch/value.coffee":68,"../../util/closest.coffee":205,"./helpers/graph/draw.coffee":307,"./helpers/graph/nest.coffee":313,"./helpers/graph/stack.coffee":314}],322:[function(e,t,r){var n=e("../../core/fetch/value.coffee"),a=e("../../util/uniques.coffee"),o=e("../../util/copy.coffee"),i=e("../../color/random.coffee"),s=function(e){var t=a(e.data.viz,e.id.value,n,e),r=a(e.cols.value);r.indexOf("label")<0&&e.cols.index.value&&r.unshift("label");var s=e.height.viz/(t.length+1),l=e.width.viz/r.length;e.group.selectAll("rect").data([0]).enter().append("rect").attr("class","background").attr("height",e.height.viz).attr("width",e.width.viz).style("fill",e.color.missing);var u=e.group.selectAll("line.horiz").data(e.data.viz);u.enter().append("line").attr("class","horiz"),u.attr("x1",0).attr("y1",function(e,t){return s*t+s}).attr("x2",e.width.viz).attr("y2",function(e,t){return s*t+s}).style("fill","#fff").style("stroke","#fff"),u.exit().remove();var c=e.group.selectAll("line.vert").data(r);c.enter().append("line").attr("class","vert"),c.attr("x1",function(e,t){return l*t+l}).attr("y1",0).attr("x2",function(e,t){return l*t+l}).attr("y2",e.height.viz).style("fill","#fff").style("stroke","#fff"),
c.exit().remove();var f=[],d={};return r.forEach(function(t,r){var n={d3plus:{x:l*r+l/2,y:s/2,width:l,height:s,id:"d3p_header_"+t.toString().replace(/ /g,"_"),shape:"square",color:"#fff",text:t}};if(t==e.id.value&&(n.d3plus.color="#fff"),"label"==t&&(n.d3plus.label=!1,n.d3plus.color="#fff",n.d3plus.stroke="#fff"),f.push(n),"number"==e.data.keys[t]){var a=d3.extent(e.data.viz,function(e){return e[t]});a[0]==a[1]&&(a=[a[0]-1,a[1]]),d[t]=d3.scale.linear().domain(a).range([e.color.missing,i(t)])}else"boolean"==e.data.keys[t]&&(d[t]=function(r){return r?i(t):e.color.missing})}),e.data.viz.forEach(function(t,n){n+=1,r.forEach(function(r,a){var i=o(t);i.d3plus.id="d3p_"+i[e.id.value].toString().replace(/ /g,"_")+"_"+r,i.d3plus.x=l*a+l/2,i.d3plus.y=s*n+s/2,i.d3plus.width=l,i.d3plus.height=s,"label"==r&&(i.d3plus.shape="square",i.d3plus.color="#fff",f.push(i)),d3.keys(t).indexOf(r)>=0&&r in t&&(d[r]&&(i.d3plus.color=d[r](i[r])),i.d3plus.text=i[r],"boolean"==e.data.keys[r]?i.d3plus.label=!1:"string"==e.data.keys[r]&&(i.d3plus.color=e.color.missing,i.d3plus.stroke="#fff",i.d3plus.shape="square"),f.push(i))})}),f};s.shapes=["check","cross","diamond","square","triangle","triangle_up","triangle_down"],s.requirements=["data","cols"],t.exports=s},{"../../color/random.coffee":48,"../../core/fetch/value.coffee":68,"../../util/copy.coffee":206,"../../util/uniques.coffee":209}],323:[function(e,t,r){var n,a,o,i;n=e("../../core/data/threshold.js"),a=e("../../core/data/group.coffee"),o=e("../../object/merge.coffee"),i=function(e){var t,r,n,i,s,l,u;if(n=a(e,e.data.viz),r=d3.layout.treemap().mode(e.type.mode.value).round(!0).size([e.width.viz,e.height.viz]).children(function(e){return e.values}).padding(e.data.padding.value).sort(function(e,t){var r;return r=e.value-t.value,0===r?e.id<t.id:r}).nodes({name:"root",values:n}).filter(function(e){return!e.values&&e.area}),r.length){for(u=r[0];u.parent;)u=u.parent;for(l=[],i=0,s=r.length;s>i;i++)t=r[i],t.d3plus.d3plus=o(t.d3plus.d3plus,{x:t.x+t.dx/2,y:t.y+t.dy/2,width:t.dx,height:t.dy,share:t.value/u.value}),l.push(t.d3plus)}return l},i.filter=n,i.modes=["squarify","slice","dice","slice-dice"],i.requirements=["data","size"],i.shapes=["square"],i.threshold=function(e){return 1600/(e.width.viz*e.height.viz)},t.exports=i},{"../../core/data/group.coffee":58,"../../core/data/threshold.js":62,"../../object/merge.coffee":170}],324:[function(e,t,r){var n,a,o,i,s,l,u;n=e("../core/methods/attach.coffee"),a=e("./methods/helpers/axis.coffee"),i=e("./helpers/ui/message.js"),s=e("./helpers/drawSteps.js"),l=e("../core/console/print.coffee"),o=e("./helpers/container.coffee"),u=e("../object/validate.coffee"),t.exports=function(){var t;return t={g:{apps:{}},types:{bar:e("./types/bar.coffee"),bubbles:e("./types/bubbles.coffee"),box:e("./types/box.coffee"),chart:e("./types/deprecated/chart.coffee"),geo_map:e("./types/geo_map.coffee"),line:e("./types/line.coffee"),network:e("./types/network.js"),paths:e("./types/paths.coffee"),pie:e("./types/pie.coffee"),rings:e("./types/rings.js"),scatter:e("./types/scatter.coffee"),stacked:e("./types/stacked.coffee"),table:e("./types/table.js"),tree_map:e("./types/tree_map.coffee")}},t.self=function(e){return e.each(function(){var e,r,n,a,u,c,f;t.draw.frozen=!0,t.error.internal=null,"timing"in t.draw||(t.draw.timing=t.timing.transitions),t.error.value&&(t.draw.timing=0),t.container.changed&&o(t),c=t.width.value<=t.width.small,u=t.height.value<=t.height.small,t.small=c||u,t.width.viz=t.width.value,t.height.viz=t.height.value,e=!1,r=function(){f.length?a():t.dev.value&&(l.groupEnd(),l.timeEnd("total draw time"),l.log("\n"))},n=function(e,n){n=n||"function",e[n]instanceof Array?e[n].forEach(function(e){e(t,r)}):"function"==typeof e[n]&&e[n](t,r),e.wait||r()},a=function(){var a,o,s,u;u=f.shift(),s=t.g.message&&e===u.message,o="check"in u?u.check:!0,"function"==typeof o&&(o=o(t)),o?s?n(u):(t.dev.value&&(e!==!1&&l.groupEnd(),l.group(u.message)),"string"==typeof t.messages.value?(e=t.messages.value,a=t.messages.value):(e=u.message,a=t.format.value(u.message)),t.draw.update?(i(t,a),t.error.value?n(u):setTimeout(function(){return n(u)},10)):n(u)):"otherwise"in u?t.error.value?n(u,"otherwise"):setTimeout(function(){return n(u,"otherwise")},10):r()},t.messages.style.backup=t.group&&"1"===t.group.attr("opacity")?"small":"large",f=s(t),a()}),t.self},n(t,{active:e("./methods/active.coffee"),aggs:e("./methods/aggs.coffee"),attrs:e("./methods/attrs.coffee"),axes:e("./methods/axes.coffee"),background:e("./methods/background.coffee"),color:e("./methods/color.coffee"),cols:e("./methods/cols.js"),config:e("./methods/config.coffee"),container:e("./methods/container.coffee"),coords:e("./methods/coords.coffee"),csv:e("./methods/csv.coffee"),data:e("./methods/data.coffee"),depth:e("./methods/depth.coffee"),descs:e("./methods/descs.coffee"),dev:e("./methods/dev.coffee"),draw:e("./methods/draw.js"),edges:e("./methods/edges.js"),error:e("./methods/error.coffee"),focus:e("./methods/focus.coffee"),font:e("./methods/font.coffee"),footer:e("./methods/footer.coffee"),format:e("./methods/format.coffee"),height:e("./methods/height.coffee"),history:e("./methods/history.coffee"),icon:e("./methods/icon.coffee"),id:e("./methods/id.coffee"),labels:e("./methods/labels.coffee"),legend:e("./methods/legend.coffee"),links:e("./methods/links.coffee"),margin:e("./methods/margin.coffee"),messages:e("./methods/messages.coffee"),nodes:e("./methods/nodes.coffee"),order:e("./methods/order.coffee"),shape:e("./methods/shape.coffee"),size:e("./methods/size.coffee"),style:e("./methods/style.coffee"),temp:e("./methods/temp.coffee"),text:e("./methods/text.coffee"),time:e("./methods/time.coffee"),timeline:e("./methods/timeline.coffee"),timing:e("./methods/timing.coffee"),title:e("./methods/title.coffee"),tooltip:e("./methods/tooltip.coffee"),total:e("./methods/total.coffee"),type:e("./methods/type.coffee"),ui:e("./methods/ui.coffee"),width:e("./methods/width.coffee"),x:a("x"),y:a("y"),zoom:e("./methods/zoom.js")}),t.self}},{"../core/console/print.coffee":53,"../core/methods/attach.coffee":79,"../object/validate.coffee":171,"./helpers/container.coffee":210,"./helpers/drawSteps.js":211,"./helpers/ui/message.js":243,"./methods/active.coffee":252,"./methods/aggs.coffee":253,"./methods/attrs.coffee":254,"./methods/axes.coffee":255,"./methods/background.coffee":256,"./methods/color.coffee":257,"./methods/cols.js":258,"./methods/config.coffee":259,"./methods/container.coffee":260,"./methods/coords.coffee":261,"./methods/csv.coffee":262,"./methods/data.coffee":263,"./methods/depth.coffee":264,"./methods/descs.coffee":265,"./methods/dev.coffee":266,"./methods/draw.js":267,"./methods/edges.js":268,"./methods/error.coffee":269,"./methods/focus.coffee":270,"./methods/font.coffee":271,"./methods/footer.coffee":272,"./methods/format.coffee":273,"./methods/height.coffee":274,"./methods/helpers/axis.coffee":275,"./methods/history.coffee":276,"./methods/icon.coffee":277,"./methods/id.coffee":278,"./methods/labels.coffee":279,"./methods/legend.coffee":280,"./methods/links.coffee":281,"./methods/margin.coffee":282,"./methods/messages.coffee":283,"./methods/nodes.coffee":284,"./methods/order.coffee":285,"./methods/shape.coffee":286,"./methods/size.coffee":287,"./methods/style.coffee":288,"./methods/temp.coffee":289,"./methods/text.coffee":290,"./methods/time.coffee":291,"./methods/timeline.coffee":292,"./methods/timing.coffee":293,"./methods/title.coffee":294,"./methods/tooltip.coffee":295,"./methods/total.coffee":296,"./methods/type.coffee":297,"./methods/ui.coffee":298,"./methods/width.coffee":299,"./methods/zoom.js":300,"./types/bar.coffee":301,"./types/box.coffee":302,"./types/bubbles.coffee":303,"./types/deprecated/chart.coffee":304,"./types/geo_map.coffee":305,"./types/line.coffee":315,"./types/network.js":316,"./types/paths.coffee":317,"./types/pie.coffee":318,"./types/rings.js":319,"./types/scatter.coffee":320,"./types/stacked.coffee":321,"./types/table.js":322,"./types/tree_map.coffee":323}]},{},[162]);