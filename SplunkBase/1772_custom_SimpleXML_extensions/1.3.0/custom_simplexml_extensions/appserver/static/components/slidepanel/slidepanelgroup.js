//
//   Copyright 2014 by mathias herzog, <mathu at gmx dot ch>
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    require("css!./slidepanelgroup.css");

    var SlidePanelView = require('splunkjs/mvc/basesplunkview').extend({

        events: {
            'click .expand': function(e) {
                var img = $(e.currentTarget);
                var items = img.data('item');
                _(items).each(function(id) {
                  var component = mvc.Components.get(id);
                  if (component) {
                    component.$el.slideToggle(1000);
                    // SVG panels (i.e. bubblechart) need a resize event after toggling
                    component.$el.resize();
                }
                });
                img.attr("class", img.attr("class") == "expand" ? "collaps": "expand");
            },

            'click .collaps': function(e) {
                var img = $(e.currentTarget);
                var items = img.data('item');
                _(items).each(function(id) {
                  var component = mvc.Components.get(id);
                  if (component) {
                    component.$el.slideToggle(1000);
                    // SVG panels (i.e. bubblechart) need a resize event after toggling
                    component.$el.resize();
                }
                });
                img.attr("class", img.attr("class") == "expand" ? "collaps": "expand");
            }
        },
        render: function() {
            this.$('.btn-pill').remove();
            if (this.settings.has('items')) {
                var hide = this.settings.get('hide') || "no"
                var items = this.settings.get('items'), $el = this.$el;
                var first_panel = mvc.Components.get(items[0]);
                var h = $('<h2></h2>');
                var title = this.settings.get("title") || "";
                var img = $('<div> &nbsp; </div>'); 
                img.attr('class', "collaps");
                img.attr('alt', '#' + items[0]).data('item', items);
                img.appendTo($el);
                h.text(title);
                h.appendTo($el);
                if (hide == "yes") {
                  // initially toggle elements with option hide=yes 
                  img.attr('class', "expand");
                  _(items).each(function(id) {
                    var component = mvc.Components.get(id);
                    if (component) {
                      component.$el.hide();
                    }
                  });
                }  
            }
            return this;
        }
    });
    return SlidePanelView;
});
