import _ from 'underscore';
import Backbone from 'backbone';
import prettify from '../../contrib/prettify.js';
import themeUtils from '../../theme_utils.js';
import '../../code_theme.css';

var isDarkTheme = themeUtils.getCurrentTheme() === 'dark';

var CodeView = Backbone.View.extend({
    options: {
        stripI18n: true
    },
    initialize: function() {
        this.listenTo(this.model, 'change:content', this.render, this);
    },
    getContent: function() {
        var content = this.model.get('content');
        if (content && this.options.stripI18n) {
            content = this.stripInjectedI18n(content);
        }
        return content;
    },
    stripInjectedI18n: function(source) {
        var lines = source.split(/\r\n|\r|\n/);
        var i = 0, start = 0;
        while (i < lines.length) {
            if (lines[i].indexOf('i18n_register') === 0) {
                i++;
                while (!lines[i]) {
                    i++;
                }
                start = i;
                break;
            }
            i++;
        }
        return lines.slice(start).join('\n');
    },
    render: function() {
        this.$el.html(this.template({
            content: this.getContent(),
            lang: this.model.get('lang'),
            isDarkTheme: isDarkTheme
        }));
        this.$el.attr({ 'class': 'tab-pane', 'id': this.model.get('id') });
        prettify(function() {}, this.el);
        return this;
    },
    template: _.template(
        '<pre class="prettyprint linenums <% if(isDarkTheme) { %>dark <% }%><% if(lang) { %>lang-<%-lang%><% } %>">' +
                  '<code class="<% if(isDarkTheme) { %>dark <% }%>"><%- content %></code>' +
                '</pre>'
    )
});

export default CodeView;