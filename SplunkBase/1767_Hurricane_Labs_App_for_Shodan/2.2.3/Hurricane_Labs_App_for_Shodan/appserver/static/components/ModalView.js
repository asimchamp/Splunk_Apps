define([
	'underscore',
	'backbone',
    'jquery',
    'splunkjs/mvc',
    ], function(_, Backbone, $, mvc) {

        var modalTemplate = "<div id=\"pivotModal\" class=\"modal\">" +
                       "<div class=\"modal-header\"><h3><%- title %></h3><button class=\"close\">Close</button></div>" +
                       "<div class=\"modal-body\">"+
                       "<label for=\"critical\">Critical*</label>"+
					   "<select name=\"critical\"  class=\"input\" id=\"critical_i\">" +
					   "<option value=\"True\">True</option>" +
					   "<option value=\"False\">False</option>" +
					   "</select>" +
                       "<label for=\"ipAddress\">IP Address or Subnet*</label>" +
					   "<input type=\"text\" id=\"ipAddress_i\" class=\"input\" name=\"ipAddress\"/>" +
                       "<label for=\"description\">Description</label>"+
                       "<textarea id=\"description_i\" style=\"width: 96%; display: block; height: 100px;\"></textarea></div>" +
                       "<div class=\"modal-footer\">" +
                       "<button id=\"submitData\" class=\"btn btn-primary\" style=\"display: block; margin: 0 11px;\">Update</button></div>" +
                       "</div>" +
                       "<div class=\"modal-backdrop\"></div>";

        var ModalView = Backbone.View.extend({
    
            defaults: {
               title: 'Not set'
            },        
    
            initialize: function(options) {
                this.options = options;
                this.options = _.extend({}, this.defaults, this.options);
                this.childViews = [];
				this.eventBus = this.options.eventBus;
                this.object = this.options['object']['0'];
				if(this.object["title"] != null) {
					this.title = this.object["title"];
				}
                this.critical = this.object["row.Is Critical?"];
				this.description = this.object["row.Description"];
				this.ip_address = this.object["row.IP Address"];
				this._key = this.object["row.key"];
				this.mode = this.options.mode;
                this.template = _.template(modalTemplate);
            },
            
            events: {
               'click .close': 'close',
               'click .modal-backdrop': 'close',
               'click #submitData': 'submitData'
            },
    
            render: function() {
				if(this.ip_address == "") {
					var data = { title : this.title };
				} else {
                	var data = { title : this.ip_address }
				}
                this.$el.html(this.template(data));
                return this;
            },
    
            show: function() {
                $(document.body).append(this.render().el);

                $(this.el).find('#critical_i').val(this.critical);
                $(this.el).find('#description_i').val(this.description);
                $(this.el).find('#ipAddress_i').val(this.ip_address);
                
                $(this.el).find('.modal').css({
                    width:'30%',
                    height:'auto',
                    left: '35%',
                    'margin-left': '0',
                    'max-height':'100%'
                });
                
            },

            submitData: function() {

                var tokens = mvc.Components.get('submitted');
                var critical= $(this.el).find('#critical_i').val();
                var description = $(this.el).find('#description_i').val();
				var ipAddress = $(this.el).find('#ipAddress_i').val();
				var has_errors = false;
				var error_message = "";

				$(".input-error").remove();
                $(".input").each(function() { $(this).removeClass("red-border"); });

				if(critical === '' || critical === null) {
				    error_message = "You must select a value from the dropdown";
				    var error_span = "<span class=\"error\">" + error_message + "</span>";
				    $("#critical_i").addClass("red-border");
				    $("<span class=\"input-error\">" + error_message + "</span>").insertAfter("#critical_i");
				    has_errors = true;
                }
				if(ipAddress === '') {
				    error_message = "You must provide an IP or Subnet.";
				    var error_span = "<span class=\"error\">" + error_message + "</span>";
				    $("#ipAddress_i").addClass("red-border");
				    $("<span class=\"input-error\">" + error_message + "</span>").insertAfter("#ipAddress_i");
				    has_errors = true;
                }
				if(has_errors) {
				    return;
                }
				tokens.unset('critical_add_tok');
				tokens.unset('description_add_tok');
				tokens.unset('ip_address_add_tok');
				tokens.unset('critical_update_tok');
				tokens.unset('description_update_tok');
				tokens.unset('ip_address_update_tok');
				var key = this._key;
				if(this.mode == 'New') {
					tokens.set('key_tok', key);
					tokens.set('critical_add_tok', critical);
					tokens.set('description_add_tok', description);
					tokens.set('ip_address_add_tok', ipAddress);
					this.eventBus.trigger("add:row");
				} else if(this.mode == 'Edit') {
					tokens.set('key_tok_update', key);
					tokens.set('critical_update_tok', critical);
					tokens.set('description_update_tok', description);
					tokens.set('ip_address_update_tok', ipAddress);
					this.eventBus.trigger("update:row");
				}
                this.close();
            },
    
            close: function() {
               this.unbind();
               this.remove();
               _.each(this.childViews, function(childView) {
                   
                   childView.unbind();
                   childView.remove();
                   
               });
            }
    
        });
        
        return ModalView;

});

