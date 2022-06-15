define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone) {

    var TabsView = Backbone.View.extend({
        initialize: function() {
            this.listenTo(this.model, 'change:tab', this.render);
        },
        events: {
            'click li': function(e) {
                e.preventDefault();
                var item = $(e.currentTarget);
                if (item.is('.disabled')) {
                    return;
                }
                var classNames = item.attr('class').split(/\s+/);
                var tab = _.filter(classNames, function(cls) {return cls.indexOf('tab-') === 0; })[0];
                this.model.set('tab', tab);
            }
        },
        render: function() {
            this.$('li').removeClass('active');
            this.$('li.' + this.model.get('tab')).addClass('active');
            return this;
        }
    });

    return TabsView;
});