define([
    "jquery",
    "underscore",
    "backbone",
    "splunkjs/mvc/simplesplunkview",
    "views/Base",
    "app/contrib/text!app/templates/shared/single.template.html"
], function(
    $,
    _,
    Backbone,
    SimpleSplunkView,
    BaseView,
    SingleMessageTemplate
){

    return SimpleSplunkView.extend({
        template: SingleMessageTemplate,
        className: "single-message",
        output_mode: "json_rows",
        options: {
            data: "preview",
            //This will be your main search manager that is hooked into your rendering
            managerid: undefined,
            //Custom stuff should be defined here for clarity
            title: undefined,
            afterLabel: undefined,
            fieldName: undefined,
            multivalue: false
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
                    rows: [[]]
                };
            }
            
             if (this.options.multivalue) {
                 // DEBUG ONLY
                 //window.res = resultsModel.data().rows;
                 var column = resultsModel.data().rows[0][this.options.fieldIdx];
                 return column;
            } else {
                return resultsModel.data().rows;
            }
        },

        renderView: function () {
            var templateData = {value: this._data, afterLabel: this.options.afterLabel};
            this.$el.html(this.compiledTemplate(templateData));

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

