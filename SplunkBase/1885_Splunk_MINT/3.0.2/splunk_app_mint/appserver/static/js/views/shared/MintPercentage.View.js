define([
    "jquery",
    "underscore",
    "backbone",
    "splunkjs/mvc/simplesplunkview",
    "views/Base",
    "app/contrib/text!app/templates/shared/percentage.template.html"
], function(
    $,
    _,
    Backbone,
    SimpleSplunkView,
    BaseView,
    PercentageTemplate
){

    return SimpleSplunkView.extend({
        template: PercentageTemplate,
        className: "boilerplate",
        output_mode: "json_rows",
        options: {
            data: "preview",
            //This will be your main search manager that is hooked into your rendering
            managerid: undefined,
            //Custom stuff should be defined here for clarity
            x_field: undefined,
            errorPage: undefined,
            title: undefined,
            subtitle: undefined,
            colors: ['#20B5CB', '#fab440', '#137CC0','#E2712B']
        },

        initialize: function (options) {
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            options = options || {};

            this.options = _.extend({}, options, this.options);

            if (this.template) {
                this.compiledTemplate = this.compileTemplate(this.template);
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
            var data_type = this.data_types[this.output_mode];
            var data = resultsModel.data();
            //override to return fields as well, thus our data looks like: {fields: [fieldname1, fieldname2, ...], rows: [row1_array, row2_array, ...]}
            //
            return this.formatData({
                rows: data[data_type],
                fields: data.fields,
                parse_error: false
            });
        },

        formatData: function (data) {
            var colors = this.options.colors;
            return _.map(data.rows, function (row, idx) {
                return {
                    name: row[0],
                    value: row[1],
                    color: colors[idx]
                };
            });
        },

        renderView: function () {
            this.$el.html(this.compiledTemplate({results: this._data}));

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

