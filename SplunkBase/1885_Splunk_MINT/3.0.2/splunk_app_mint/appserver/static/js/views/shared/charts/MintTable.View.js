define([
  "splunkjs/mvc/tableview"
], function(
  SplunkTableView
){

  /* Custom Chart View for Splunksense dashboard */
  var MintTableView = SplunkTableView.extend({
    initialize: function (options) {
      SplunkTableView.prototype.initialize.apply(this, arguments);
      options = options || {};

      this.classicUrl  = options.classicUrl;

      this.on("click", this.onDrilldown);
    },
    onDrilldown: function (event) {
       this.trigger('table:drilldown', event);
    }
  });

  return MintTableView;
});

