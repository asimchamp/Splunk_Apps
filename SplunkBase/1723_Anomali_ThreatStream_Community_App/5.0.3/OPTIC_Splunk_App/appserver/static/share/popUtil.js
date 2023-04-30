

define([
    	'underscore',
    	'splunkjs/mvc',
    	'jquery',
    	'splunkjs/mvc/tableview',
    	'splunkjs/mvc/simplesplunkview',
    	'views/Base',
        'views/shared/Modal'
    ],
	function(_, mvc, $, TableView, SimpleSplunkView, Base, Modal) {

	//ts util
	var tsUtil = {};
	var PopDialog = Modal.extend({
		className: Modal.CLASS_NAME, // + " " + Modal.CLASS_MODAL_WIDE,
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);
            this.content = options.content || "";
            this.title = options.title || "";
            this._buttons = options.buttons;
        },

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).append(this.title);
            this.$(Modal.BODY_SELECTOR).html( this.content);
            this.$(Modal.FOOTER_SELECTOR).append('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>');
            //button
            var buttons = this._buttons;
            if(buttons) {
    			for(var i = 0; i < buttons.length; i++) {
    				var btn = buttons[i];
    				this.$(Modal.FOOTER_SELECTOR).append(btn);
    			}
    		}
            return this;
        }
    });
	//pop util
	tsUtil.showInfo = function(title, info, width) {
		var dialog = this.createDialog(title, info, null, width);
		dialog.show();
		return dialog;
	}

	tsUtil.createDialog = function(title, info, buttons, width) {
		var dialog = new PopDialog({
			title: title,
			content: info,
			buttons: buttons
		})
		if(width) {
			dialog.$el.css("width", width + "px");
			var mleft = 0 - parseInt(width/2);
			dialog.$el.css("margin-left", mleft + "px");
		}
		var modalWrapper = $('<div class="splunk-components">').appendTo("body").append(dialog.render().el);
	    dialog.once('hidden', function() {
	        modalWrapper.remove();
	    }, this);
		return dialog;
	}

	//test pop
	//tsUtil.showInfo("title", "info");
	return tsUtil;
});



