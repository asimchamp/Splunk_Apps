define([
    'underscore', 'jquery', 'backbone',
], function(_, $, Backbone) {

    var LookupDialogView = Backbone.View.extend({

        template: ' \
            <div class="input-group"> \
                <span class="input-group-addon" id="geo_addon">geo_</span> \
                <input type="text" class="form-control" id="input-lookup_name" placeholder="Lookup Name" aria-describedby="geo_addon"> \
            </div> \
        ',

        events: {
            "keyup #input-lookup_name": "handleKey"
        },

        initialize: function(options) {
            this.bind("ok", this.ok);
            this.bind("cancel", this.cancel);
            _.bindAll(this, "ok", "cancel", "handleKey");
        },

        handleKey: function(e) {
            var charCode = e.which || e.keyCode;

            // saving on enter
            if (charCode == 13) { // enter key
                e.preventDefault();
                this.ok();
            } else if (charCode == 27) {
                this.cancel();
            }
        },

        ok: function() {
            var name = this.$el.find("#input-lookup_name").val();
            if (!name) {
                alert("please set the lookup name");
                return;
            }
            this.model.set({
                "name": name
            });
        },

        cancel: function() {
            this.model.destroy();
        },

        render: function() {
            this.$el.html(this.template);
            this.$el.find("#input-lookup_name").focus();
            return this;
        }
    });

    return LookupDialogView;
});

