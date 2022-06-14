// This library must be compiled to "visualization.js" as AMD format. Splunk is hardcoded to
// autoload visualization.js and visualization.css in /js/helpers/viz/ExternalVisualizations.es

import $ from 'jquery';
import _ from 'underscore';
import SplunkVisualizationBase from 'api/SplunkVisualizationBase';

// Note that the export here will be loaded by AMD-require so you must take care to ensure it is
// returning the actual class and not a `{ default: <class> }`. ES6-to-AMD conversion often/always
// exports an `esModuleInterop` system in order to preserve named and default exports consistently.
// To work around this, we're using Babel to convert ES6>CJS>(plugin-add-module-exports) and then
// webpack does emits the AMD code.

// To simplify you could use AMD directly i.e `define([], function() { return viz })` but AMD is a
// mostly forgotten format so this syntax may confuse/slow down your team. It's also confusing since
// it looks like RequireJS... which is what Splunk actually needs (sorry). I recommend avoiding
// RJS-ish syntax since webpack has no idea about RJS and it'll cause headaches; use `requirejs()`
// instead of `require()` to be explicit.

// P.S: You might be tempted to add a CJS-style `module.exports =` after your ES6 imports to avoid
// needing the Babel plugin, but it'll throw at runtime since it's a read-only property in ES6.

export default SplunkVisualizationBase.extend({
    className: 'tagcloud-viz',
    initialize: function() {
        SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
        // Save this.$el for convenience
        this.$el = $(this.el);
        // Add a css selector class
        this.$el.addClass('splunk-tag-cloud').addClass('tagcloud-viz');
    },
    getInitialDataParams: function() {
        return ({
            outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
            count: 200
        });
    },
    updateView: function(data, config) {
        var labelField = config['display.visualizations.custom.simple_xml_examples.tagcloud.labelField'];
        var valueField = config['display.visualizations.custom.simple_xml_examples.tagcloud.valueField'];
        var minFontSize = parseFloat(config['display.visualizations.custom.simple_xml_examples.tagcloud.minFontSize']);
        var maxFontSize = parseFloat(config['display.visualizations.custom.simple_xml_examples.tagcloud.maxFontSize']);

        // Clear the current view
        var el = this.$el.empty().css('line-height', Math.ceil(maxFontSize * 0.55) + 'px');
        var minMagnitude = Infinity, maxMagnitude = -Infinity;

        var fieldNames = _.pluck(data.fields, 'name');
        var labelFieldIdx = fieldNames.indexOf(labelField);
        var valueFieldIdx = fieldNames.indexOf(valueField);
        _(data.rows).chain().map(function(result) {
        // Extract and convert the magnitude field value
            var magnitude = parseFloat(result[valueFieldIdx]);
            // Find the maximum and minimum of the magnitude field values
            minMagnitude = magnitude < minMagnitude ? magnitude : minMagnitude;
            maxMagnitude = magnitude > maxMagnitude ? magnitude : maxMagnitude;
            return {
                label: result[labelFieldIdx],
                magnitude: magnitude
            };
        }).each(function(result) {
        // Calculate relative size of each tag
            var size = minFontSize + ((result.magnitude - minMagnitude) / maxMagnitude * (maxFontSize - minFontSize));
            // Render the tag
            $('<a class="link" href="#" /> ').text(result.label + ' ').css({
                'font-size': size
            }).appendTo(el).click(function(e) {
            // register drilldown handler
                e.preventDefault();
                var payload = {
                    action: SplunkVisualizationBase.FIELD_VALUE_DRILLDOWN,
                    data: {}
                };
                payload.data[labelField] = $.trim($(e.target).text());
                this.drilldown(payload);
            }.bind(this));
        }, this);
    }
});
