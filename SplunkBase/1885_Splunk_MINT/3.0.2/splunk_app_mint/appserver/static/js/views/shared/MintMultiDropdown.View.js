define([
    "jquery",
    "underscore",
    "splunkjs/mvc/multidropdownview",
], function(
    $,
    _,
    MultiDropdownView
){

  return MultiDropdownView.extend({
    val: function (newValue) {
      if (_.isArray(newValue)) {
        if (newValue.length > 1 && !!~_.indexOf(newValue, '*')) {
          newValue = _.without(newValue, '*');
        } else if(newValue.length === 0) {
          newValue = ["*"];
        }
      }

      return MultiDropdownView.prototype.val.apply(this, arguments);
    },
    _onValueChange: function(ctx, value, options) {
      this.render();
      this.updateSelectedLabel(value);
      this.trigger('change', this.val(), this);
      this._unbindEvent();
    },
    _unbindEvent: function () {
      $('.select2-container li.select2-search-choice')
        .filter(function () {
          return $('div', this).text() === "All";
        })
        .each(function () {
          $('.select2-search-choice-close', this)
            .off('click')
            .off('dblclick')
            .css('opacity', '.5')
            .css('cursor', 'default');
        });
    },
    updateDomVal: function() {
      MultiDropdownView.prototype.updateDomVal.apply(this, arguments);
      this._unbindEvent();
    },
    updateView: function(viz, data) {
      var controlValue = this.valueIsList ? this.settings.get("value") || [] : [this.settings.get("value")];

      if (controlValue.length === 1 && !!~_.indexOf(controlValue, '*')) {
        data.push({label: "All", value: "*"});
      }

      return MultiDropdownView.prototype.updateView.apply(this, arguments);
    }
  });

});

