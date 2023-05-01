define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'util/splunkd_utils',
    'app/hue_alerts/models/HueSetup'
], function($, _, Backbone, BaseView, SplunkdUtils, HueSetupModel) {

    var HueLightsCollection = Backbone.Collection.extend({
        url: SplunkdUtils.fullpath('hue/lights'),
        comparator: function(a, b) {
            return parseInt(a.get('id'), 10) - parseInt(b.get('id'), 10);
        }
    });

    return BaseView.extend({
        className: 'hue-lights',
        constructor: function(options) {
            BaseView.prototype.constructor.call(this, {
                model: options.model,
                collection: {
                    lights: new HueLightsCollection()
                }
            });
            this.listenTo(this.collection.lights, 'add reset sort', this.render);

            this.listenTo(this.model.setup, 'change:status', function(model, status) {
                if (status == 'connected') {
                    this.fetchLights();
                }
            })
        },

        fetchLights: function() {
            var lights = this.collection.lights;
            lights.fetch().then(function() {
                lights.sort();
            });
        },

        events: {
            'click .refresh-lights': function(e) {
                e.preventDefault();
                this.fetchLights();
            },
            'click .action-flash': function(e) {
                e.preventDefault();
                var id = $(e.currentTarget).parents('tr').data('light');
                $.post(HueLightsCollection.prototype.url, {
                    action: 'flash',
                    id: id
                });
            },
            'click .action-rename': function(e) {
                e.preventDefault();
                var id = $(e.currentTarget).parents('tr').data('light');
                var newName = prompt("New name");
                if (newName == null) {
                    return;
                }
                $.post(HueLightsCollection.prototype.url, {
                    action: 'rename',
                    id: id,
                    name: newName
                }).then(function() {
                    this.fetchLights();
                }.bind(this))
                    .fail(function() {
                        alert('Error renaming the light');
                    });
            }
        },

        renderRow: function(light) {
            var tr = $('<tr/>').data('light', light.get('id'));

            $('<td class="col-id" />').text(light.get('id')).appendTo(tr);
            $('<td class="col-name" />').text(light.get('name')).appendTo(tr);
            $('<td class="col-status" />').text(light.get('state').reachable ? 'Connected' : 'Not connected').appendTo(tr);
            var actions = $('<td class="col-actions">' +
            '<a class="action-rename">Rename</a> &nbsp;&nbsp;&nbsp;' +
            '<a class="action-flash" title="Make the light flash once, so it is easier to identify"><i class="icon icon-lightning"></i> Flash light</a>' +
            '</td>').appendTo(tr);

            return tr;
        },

        render: function() {
            this.$el.empty();

            $('<a href="#" class="refresh-lights">Refresh</a>').appendTo(this.$el);

            var table = $(
                '<table class="table table-chrome table-striped table-hover">' +
                '<thead><tr>' +
                '<th class="col-id">ID</td>' +
                '<th class="col-name">Name</td>' +
                '<th class="col-status">Status</td>' +
                '<th class="col-actions">&nbsp;</td>' +
                '</thead>' +
                '</table>');
            var tbody = $('<tbody/>').appendTo(table);
            tbody.append(this.collection.lights.map(this.renderRow.bind(this)));
            this.$el.append(table);

            return this;
        }
    });

});