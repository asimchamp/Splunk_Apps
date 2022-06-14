define([
    "jquery",
    "underscore",
    "splunkjs/mvc/mvc",
    "js_charting/helpers/DataSet",
    "splunkjs/mvc/messages",
    "splunkjs/mvc/simplesplunkview",
    "views/Base",
    "app/contrib/text!app/templates/top_view.template.html"
], function(
    $,
    _,
    mvc,
    DataSet,
    Messages,
    SimpleSplunkView,
    BaseView,
    TopViewTemplate
){

  /* Custom Chart View for Splunksense dashboard */
  return SimpleSplunkView.extend({
      template: TopViewTemplate,
      className: "boilerplate",
      output_mode: "json_rows",
      resultOptions: { output_time_format: "%s.%Q" },
      options: {
          data: "preview",
          //This will be your main search manager that is hooked into your rendering
          managerid: undefined,
          //Custom stuff should be defined here for clarity
          x_field: undefined,
          errorPage: undefined,
          title: undefined,
          subtitle: undefined
      },
      initialize: function (options) {
          SimpleSplunkView.prototype.initialize.apply(this, arguments);

          options = options || {};

          this.options = _.extend({}, options, this.options);

          if (this.template) {
              this.compiledTemplate = this.compileTemplate(this.template);
          }
          this.options.model.on('change:active', this.changeClass, this);
      },

      changeClass: function () {
          if (this.options.model.get('active')) {
              this.$el.parent().addClass('active');
          }
      },

      compileTemplate: BaseView.prototype.compileTemplate,

      formatResults: function(resultsModel) {
          if (!resultsModel) {
              return {fields: [],
                  rows: [[]],
                  parse_error: true
              };
          }

          // First try the legacy one, and if it isn't there, use the real one.
          var data_type = this.data_types[this.outputMode];
          var data = resultsModel.data();
          //override to return fields as well, thus our data looks like: {fields: [fieldname1, fieldname2, ...], rows: [row1_array, row2_array, ...]}
          //
          return this.formatData({
              rows: data[data_type],
              parse_error: false
          });
      },
      activate: function () {
          this.listenTo(this.options.model, 'change:selected', this);
      },
      formatData: function(data) {
          return {
              name: data.rows[0][0],
              percent: data.rows[0][1],
              title: this.options.title,
              subtitle: this.options.subtitle
          };
      },
      renderView: function () {
          this.$el.html(this.compiledTemplate(this._data));

          this.changeClass();

          return this.$el;
      },
      createView: function() {
          return this.renderView();
      },
      updateView: function() {
          return this.renderView();
      }
  });
});
