define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone) {

    var FeatureTableRowView = Backbone.View.extend({

        template: '\
            <td style="color: <%- color %>">⬤</td>\
            <td>\
                <div contenteditable="<%= edit %>" class="<%= cellClassName %>"><%= featureId %></div> \
            </td>\
            <td class="actions"> \
                <a class="action edit" href="#">  <i title="edit" class="glyphicon glyphicon-pencil"></i><!--edit--></a> \
                <a class="action delete" href="#"><i title="delete" class="glyphicon glyphicon-remove"></i><!--delete--></a> \
                <a class="action save" href="#">save</a> \
            </td>',
        tagName: "tr",

        events: {
            "keyup .edit-mode": "handleKey",
            "blur .feature-name": "save",
            "click .action.delete": "delete",
            "click .action.edit": "edit",
            "click .action.save": "persist"
        },

        initialize: function(options) {
            _.bindAll(this, "render", "delete", "_destroy", "focus", "save", "edit", "persist");
            FeatureTableRowView.__super__.initialize.apply(this, arguments);
            this.model.on("destroy", this._destroy);

            this.listenTo(this.model, 'change:edit', function(model, edit) {
                var layer = model.get('layer');
                if (edit) {
                    layer.editing.enable();
                } else {
                    layer.editing.disable();
                }
            });

            this.model.on("change", this.render);
        },

        _destroy: function() {
            this.model.off("destroy");
            this.remove();
        },

        delete: function() {
            this.model.destroy();
        },

        edit: function() {
            if (this.model.get('edit')) {
                this.model.set('edit', false);
            } else {
                this.model.set({
                    "edit": true
                });
                this.focus();

                var layer = this.model.get('layer');
                this.model.trigger("bounds:change", layer.getBounds());
            }
        },

        focus: function() {
            if (this.model.get('edit')) {
                var el = this.$el.find(".edit-mode");

                // select contents of contenteditable
                var range = document.createRange();
                range.selectNodeContents(el.get(0));
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                // set focus on field
                el.focus();
            }
            return this;
        },

        handleKey: function(e) {
            var charCode = e.which || e.keyCode;

            // saving on enter
            if (charCode == 13) { // enter key
                e.preventDefault();
                this.persist();
            } else if (charCode == 27) {
                this.delete();
            }
        },

        save: function(e) {
            this.persist();
        },

        persist: function() {
            var newAttrs = {
                persist: true,
                edit: false
            };
            var featureId = this.$el.find(".edit-mode").text();
            if (featureId) {
                newAttrs.featureId = featureId;
            }
            this.model.set(newAttrs);
        },

        render: function() {
            var rowTemplate = _.template(this.template);

            var data = this.model.toJSON();
            data.cellClassName = "feature-name";
            if (data.persist) {
                data.cellClassName += " persist";
            }
            if (data.edit) {
                data.cellClassName += " edit-mode";
                this.$el.addClass("edit-mode");
            } else {
                this.$el.removeClass("edit-mode");
            }

            var html = rowTemplate(data);
            this.$el.html(html);
            return this;
        }
    });

    return FeatureTableRowView;
});

