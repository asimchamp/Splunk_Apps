define([
    "jquery",
    "underscore",
    "backbone",
    'app/views/shared/ChecklistItem.View',
    'app/views/Base.View'
], function(
    $,
    _,
    Backbone,
    ItemView,
    BaseView
){
    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            if (this.options.iconFormatter) {
                this.iconFormatter = this.options.iconFormatter;
            }

            this.collection.on('add', this.renderOne, this);
            this.collection.on('reset', this.renderAll, this);
        },
        iconFormatter: function() {
          return [];
        },
        renderAll: function() {
            this.$el.empty();
            //this.$el.html("<ul></ul>");
            this.collection.each(this.renderOne,this);
        },
        renderOne: function (model) {
            var icons = this.iconFormatter(model);

            var view = new ItemView({icons: icons, model: model});
            this.$el.append(view.render().el);
        },
        render: function() {
            if( this.collection.length >= 1) {
                this.renderAll();
            }
            return this;
        },
        toggle: function(value) {
            this.$el.toggle(value);
        }
    });
});
