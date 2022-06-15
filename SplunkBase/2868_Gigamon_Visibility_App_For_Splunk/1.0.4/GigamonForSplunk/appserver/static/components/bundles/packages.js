define(function() {
  return {

    // Lazily construct the package hierarchy from class names.
    root: function(classes) {
      var map = {};
      var _ = require("underscore");
      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));

            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }

      _.each(classes,function(d) {
        find(d.name, d);
      });

      return map[""];
    },

    // Return a list of imports for the given array of nodes.
    imports: function(nodes) {
      var map = {},
          imports = [];
 	var _ = require("underscore");
      // Compute a map from name to node.
      _.each(nodes,function(d) {
        map[d.name] = d;
      });

      // For each import, construct a link from the source to target node.
      _.each(nodes,function(d) {
        if (d.imports) _.each(d.imports,function(i) {
	  if ( undefined == map[i]) {
		console.log(d.name + " has an undefined import?");
	  } else {
          	imports.push({source: map[d.name], target: map[i]});
	  }
        });
      });

      return imports;
    }

  };
});
