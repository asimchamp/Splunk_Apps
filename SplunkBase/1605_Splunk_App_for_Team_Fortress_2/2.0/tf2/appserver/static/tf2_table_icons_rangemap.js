require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {

    // Translations from rangemap results to CSS class
    var ICONS = {
        sniper_rifle: 'sniper_rifle',
        minigun: 'minigun',
	tf_projectile_rocket: 'tf_projectile_rocket',
	flamethrower: 'flamethrower',
	tf_weapon_flamethrower: 'flamethrower',
	scattergun: 'scattergun',
	shotgun_primary: 'shotgun_primary',
	obj_sentrygun: 'obj_sentrygun1',
	obj_sentrygun1: 'obj_sentrygun1',
	obj_sentrygun2: 'obj_sentrygun2',
	obj_sentrygun3: 'obj_sentrygun3',        
	bottle: 'bottle',
	deflect_rocket: 'deflect_rocket',
	pistol_scout: 'pistol',
	tf_projectile_pipe: 'tf_projectile_pipe',	
	tf_projectile_pipe_remote: 'tf_projectile_pipe',
	low: 'check-circle'
    };

    var RangeMapIconRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Only use the cell renderer for the range field
            return cell.field === 'weapon';
        },
        render: function($td, cell) {
            var icon = 'question';
            // Fetch the icon for the value
            if (ICONS.hasOwnProperty(cell.value)) {
                icon = ICONS[cell.value];
            }
            // Create the icon element and add it to the table cell
                $td.addClass('icon').html(_.template('<div class="myicon <%- icon%> title="<%- weapon %>"></div>', {
		icon: icon,
                weapon: cell.value
            }));
        }
    });

    mvc.Components.get('table1').getVisualization(function(tableView){
        // Register custom cell renderer
        tableView.table.addCellRenderer(new RangeMapIconRenderer());
        // Force the table to re-render
        tableView.table.render();
    });

});
