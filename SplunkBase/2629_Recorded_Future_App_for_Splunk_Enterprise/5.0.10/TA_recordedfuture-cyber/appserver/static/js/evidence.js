require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'views/shared/results_table/renderers/BaseCellRenderer',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, BaseCellRenderer) {
    function erowrenderer(erowin){
	var eparts = erowin.split(':', 2);
        var n = erowin.substring(2).indexOf(':');
        var evidenceString = erowin.substring(n+3);
        var criticality = Number(eparts[0]);
	var criticalityColors = { 
	    1: '#cccccc', 
	    2: '#ffce00', 
	    3: '#ff6b00',
	    default: '#cf0a2c'
	};
	var color = criticalityColors[criticality] || criticalityColors.default;
	var erow = '<div class="evidence-row"><span class="evidence-criticality" style="color: '+color+';">\u25cf </span> <span class="evidence-rule" style="font-weight: bold;">' + eparts[1] + ':</span> <span class="evidence-string">' + evidenceString + '</span></div>';
	return erow;
    };
    function erowprocessor(result, value){
	return result + erowrenderer(value);
    };
    function erender(values){
        if (typeof values === 'string'){
	    return '<div class="evidence-row-wrapper">' + erowrenderer(values) + '</div>';
        } else {
            return '<div class="evidence-row-wrapper">' + values.reduce(erowprocessor, '') + '</div>';
        }
    }
    var EvidenceCellRenderer = BaseCellRenderer.extend({
	canRender: function(cell) {
	    return (cell.field === 'Evidence');
	},
	render: function($td, cell) {
	    $td.addClass('evidence-cell').html(erender(cell.value));
	}
    });
    mvc.Components.get('etable').getVisualization(function(tableView) {
	tableView.addCellRenderer(new EvidenceCellRenderer());
    });
});
