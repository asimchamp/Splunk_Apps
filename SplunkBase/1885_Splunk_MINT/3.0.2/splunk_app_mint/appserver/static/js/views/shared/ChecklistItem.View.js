define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/shared/SyntheticCheckboxControl.View',
    'app/views/Base.View'
], function(
    $,
    _,
    Backbone,
    SyntheticCheckboxControl,
    BaseView
){
    return BaseView.extend({

        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            var name = this.model.get('name');
            var icons = this.options.icons;
            var view = new SyntheticCheckboxControl({
                model: this.model,
                modelAttribute: 'selected',
                icons: icons,
                label: name,
                value: name
            });

            this.$el.html(view.render().el);
            return this;
        }
    });
});
