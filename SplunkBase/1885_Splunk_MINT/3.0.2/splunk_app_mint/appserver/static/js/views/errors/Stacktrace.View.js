define([
    "jquery",
    "underscore",
    "backbone",
    "views/Base",
    "views/shared/FlashMessages",
    "app/contrib/text!app/templates/errors/stacktrace.template.html",
    "util/splunkd_utils",
    "splunk.util",
    'app/utils',
], function(
    $,
    _,
    Backbone,
    BaseView,
    FlashMessagesView,
    StacktraceTemplate,
    splunkdUtils,
    splunkUtils,
    utils
){
    // Remove leading line item indices, and split stacktrace line to [library, line]
    // Example 1 (original stacktrace): line='0   CrashProbeiOS 0x91e8c 0x8c000 + 24204'
    // output=['CrashProbeiOS', '0x91e8c 0x8c000 + 24204']
    // Example 2 (symbolicated stacktrace): line='CoreFoundation CFStringCreateMutable (in CoreFoundation) + 153'
    // output=['CoreFoundation', 'CFStringCreateMutable (in CoreFoundation) + 153']
    var formatStacktraceLine = function(line) {
        var match;
        if (line) {
            line = line.replace(/\d+\s+/, '');
            match = line.match(/^(\S+)\s(.*)/);
        }

        if (match) {
            return match.slice(1);
        } else {
            return line;
        }
    };

    return BaseView.extend({

        template: StacktraceTemplate,
    
        /**
          * @param {Object} options {
          *     model: {
          *         errorEvent: <Backbone.Model>,
          *         stacktrace: <Backbone.Model>,
          *         symbolicatedStacktrace: <app/models/SymbolicatedStacktrace.Model>,
          *     }
          * }
          */
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.flashMessages = new FlashMessagesView({
                model: {
                    symbolicatedStacktrace: this.model.symbolicatedStacktrace
                }
            });

            this.currentThread = 0;

            this.flashMsgHelper = this.children.flashMessages.flashMsgHelper;

        },

        events: {
          'click #threads li': 'onClickThread'
        },
    
        startListening: function() {
            this.listenTo(this.model.stacktrace, 'change:stacktrace', function(model, stacktrace, options) {
                this.flashMsgHelper.removeGeneralMessage(this.cid);
                if (!stacktrace || _.isEmpty(stacktrace)) {
                    this._displayWaitingDataInfo();
                }
                // Initial thread displayed is crashed thread or default to thread 0
                this.currentThread = this.model.errorEvent.get('threadCrashed') || 0;
                this.render();
            });

            // Add warning message if symbolicated stacktrace is partial after
            // sync:symbolicate event (upon /symbolicate endpoint call)
            // Note: sync event occurs as well (upon KVStore fetch) but is not acted upon here
            this.listenTo(this.model.symbolicatedStacktrace, 'sync:symbolicate', function(model, resp, options){
                if (!model.get('complete')) {
                    this._displayPartialResponseWarning();
                }
            });
        },

        _displayWaitingDataInfo: function() {
            this.flashMsgHelper.removeGeneralMessage(this.cid);
            this.flashMsgHelper.addGeneralMessage(this.cid, {
                type: splunkdUtils.INFO,
                html: _("Waiting for data...").t()
            });
        },

        _displayPartialResponseWarning: function() {
            this.flashMsgHelper.removeGeneralMessage(this.cid);
            this.flashMsgHelper.addGeneralMessage(this.cid, {
                type: splunkdUtils.WARNING,
                html: splunkUtils.sprintf(
                    _("<span>Missing dSYM for buildUuid=%s. " +
                      "Follow instructions " +
                      "<a target='_blank' href='http://docs.splunk.com/Documentation/MintIOSSDK/latest/DevGuide/Requirementsandinstallation'>here</a> " +
                      "on how to setup your iOS SDK." +
                      "</span>").t(),
                    _.escape(this.model.errorEvent.get('buildUuid'))
                )
            });
        },

        getSelectedStacktrace: function () {
            var stacktrace = this.model.stacktrace.get('stacktrace') || {};

            if (!_.isEmpty(stacktrace)) {
                return stacktrace[this.currentThread];
            } else {
                return [];
            }
        },

        onClickThread: function (ev) {
            var newThread = $(ev.currentTarget).data('thread');
            if (newThread != this.currentThread) {
                this.currentThread = newThread;
                this.render();
            }
        },

        getThreads: function () {
            var stacktrace = this.model.stacktrace.get('stacktrace') || {};

            if (!_.isEmpty(stacktrace)) {
                return _.keys(stacktrace);
            } else {
                return [];
            }
        },

        render: function () {
            var platform = this.model.errorEvent.get('platform'),
                stacktrace = this.getSelectedStacktrace(),
                threads = this.getThreads();

            if (!utils.isAndroid(platform)) {
                stacktrace = _.map(stacktrace, function(line) {
                    return formatStacktraceLine(line);
                });
            }

            //if (_.isEmpty(stacktrace)) {
            //    this._displayWaitingDataInfo();
            //}

            this.$el.html(this.compiledTemplate({
                stacktrace: stacktrace,
                threads: threads,
                currentThread: this.currentThread
            }));

            this.$('.notifications').html(this.children.flashMessages.render().el);

            this.didChangeThread = false;
            return this;
        }
    });
});

