define([
    'underscore',
    'jquery',
    'backbone',
    'views/Base'

], function(_, $, Backbone, BaseView) {

    var LookupDialogView = BaseView.extend({
        className: 'load-lookup-dialog',

        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'add remove reset', this.render);
        },
        events: {
            'click .load-lookup': function(e) {
                var selected = $(e.currentTarget);
                console.log(selected.data('lookup'));
                this.model.set({
                    "selected": selected.data('lookup')
                });
            }
        },
        render: function() {
            this.$el.empty();
            var list = $('<ul/>');
            var items = this.collection.map(function(model) {
                var item = $('<li />');
                $('<a class="load-lookup" />')
                    .data('lookup', model.get('name'))
                    .text("geo_" + model.get('name'))
                    .appendTo(item);
                return item;
            });
            list.append(items);
            this.$el.append(list);
            return this;
        }
    });

    return LookupDialogView;
});

