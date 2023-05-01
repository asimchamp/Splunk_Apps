define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'util/splunkd_utils',
    'app/hue_alerts/models/HueSetup'
], function($, _, Backbone, BaseView, SplunkdUtils, HueSetupModel) {

    var HueDiscoverCollection = Backbone.Collection.extend({
        url: SplunkdUtils.fullpath('hue/discover')
    });

    return BaseView.extend({
        className: 'bridge-status',
        constructor: function(options) {
            BaseView.prototype.constructor.call(this, {
                model: options.model,
                collection: {
                    bridges: new HueDiscoverCollection()
                }
            });
            this.listenTo(this.model.state, 'change', this.render);
            this.listenTo(this.model.setup, 'change', this.render);
            this.fetchStatus();
        },

        fetchStatus: function() {
            var state = this.model.state;
            state.set('loading-state', true);
            this.model.setup.fetch().then(function() {
                state.set('loading-state', false);
            });
        },

        fetchDiscoveredBridges: function() {
            var state = this.model.state;
            state.set('discovery-attempted', true);
            state.set('loading-discovery', true);
            this.collection.bridges.fetch().always(function() {
                state.set('loading-discovery', false);
            });
        },

        attemptRegistration: function(bridge, attemptsLeft) {
            var self = this;
            var state = this.model.state;
            state.set({
                registration: bridge
            });
            HueSetupModel.register(bridge)
                .then(function() {
                    state.set('registration', false);
                    self.fetchStatus();
                }).fail(function(xhr) {
                    if (xhr.responseJSON && xhr.responseJSON.code == 101 && attemptsLeft > 0) {
                        state.set('registrationMessage', 'Please press the CONNECT button');
                        state.set('registrationAttempts', attemptsLeft);
                        setTimeout(function() {
                            self.attemptRegistration(bridge, attemptsLeft - 1);
                        }, 1000);
                    } else {
                        alert('Registration failed: ' + (xhr.responseJSON && xhr.responseJSON.error || "unknown error"));
                        state.set('registration', false);
                    }
                });
        },

        events: {
            'click .bridge-reset': function(e) {
                e.preventDefault();
                var state = this.model.state;

                if (state.has('cur-action')) {
                    return;
                }

                if (!confirm("Sure?")) {
                    return;
                }

                var self = this;
                state.set('cur-action', 'reset');
                HueSetupModel.reset().then(function() {
                    state.unset('cur-action');
                    self.fetchStatus();
                }).fail(function() {
                    alert('Error resetting');
                });
            },
            'click .bridge-discover': function(e) {
                e.preventDefault();
                if (!this.model.state.get('loading-discovery')) {
                    this.fetchDiscoveredBridges();
                }
            },
            'click .bridge-register': function(e) {
                e.preventDefault();
                var button = $(e.currentTarget);
                if (!this.model.state.get('registration')) {
                    this.model.state.set({
                        registrationAttempts: 0,
                        registrationMessage: '',
                        registration: true
                    });
                    this.attemptRegistration(button.data('bridge'), 30);
                }
            }
        },

        renderLoading: function() {
            this.$el.html('<h2>Gathering bridge status</h2>');
        },

        renderConnected: function() {
            this.$el.html(
                '<div class="connected">' +
                '<h2><i class="icon icon-check"></i> Bridge is connected</h2>' +
                '<div class="bridge-info-ip">IP: ' + _.escape(this.model.setup.get('ip')) + '</div>' +
                '<div class="bridge-info-id">ID: ' + _.escape(this.model.setup.get('id')) + '</div>' +
                '<a class="bridge-reset" href="#">Reset</a>' +
                '</div>'
            );
        },

        renderNotConfigured: function() {
            this.$el.empty();
            var state = this.model.state;
            $('<h2></h2>').text(state.get('discovery-attempted') ? 'Connect to HUE bridge...' : 'Bridge is not configured').appendTo(this.$el);

            if (state.get('loading-discovery')) {
                $('<i>Looking for bridges...</i>').appendTo(this.el);
            } else {
                var items = this.collection.bridges.map(function(model) {
                    return $('<li class="bridge"></li>')
                        .text(model.get('ip') + ' (ID: ' + model.get('id') + ') ')
                        .append($('<button class="bridge-register">Connect</button>').data('bridge', model.toJSON()));
                });

                if (state.get('discovery-attempted') && !items.length) {
                    $('<div class="error">No bridges found on the local network</div>').appendTo(this.$el);
                }

                $('<ul class="discovered-bridges"></ul>').append(items).appendTo(this.$el);

                $('<button class="bridge-discover"></button>')
                    .text(state.get('discovery-attempted') ? 'Refresh' : 'Find Hue bridges on the local network')
                    .appendTo(this.el);
            }
        },

        renderRegistration: function() {
            var state = this.model.state;
            this.$el.html('<h2>Registering bridge...</h2>');

            $('<div/>').text(state.get('registrationMessage')).appendTo(this.$el);
            $('<div/>').text(state.get('registrationAttempts')).appendTo(this.$el);
        },

        renderDebug: function() {
            this.$el.empty();

            $('<pre></pre>').text(JSON.stringify(this.model.setup.toJSON(), null, 2)).appendTo(this.$el);
        },

        debouncedRender: _.debounce(function() {
            if (this.model.state.get('loading-state')) {
                this.renderLoading();
            } else if (this.model.state.get('registration')) {
                this.renderRegistration();
            } else {
                var status = this.model.setup.get('status');
                if (status == 'not_configured') {
                    this.renderNotConfigured();
                } else if (status == 'connected') {
                    this.renderConnected();
                } else {
                    this.renderDebug();
                }
            }
        }),

        render: function() {
            this.debouncedRender();
            return this;
        }
    });

});