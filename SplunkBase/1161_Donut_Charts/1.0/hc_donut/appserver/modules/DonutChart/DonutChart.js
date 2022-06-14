/*
 * Splunk wrapper for highcharts.com javascript Donut Chart
 * by Ron Naken (ron@splunk.com)
 * 
 */
Splunk.Module.DonutChart = $.klass(Splunk.Module.DispatchingModule, {

    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.resultsContainer = this.container;
        this.palette = this.getParam('palette', '');
	if (this.palette == '') {
	    this.palette = Highcharts.getOptions().colors;
	} else {
	    this.palette = this.palette.split(',');
	}
    },

    onJobDone: function(event) {
        this.getResults();
    },

    getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();
        var search = context.get("search");
        var sid = search.job.getSearchId();

        if (!sid) this.logger.error(this.moduleType, "Assertion Failed.");

        params.sid = sid;
        return params;
    },
    
    renderResults: function($super, results) {

        if(!results) {
	    this.resultsContainer.html('No content available.');
            return;
        }

	var categories = [];
	var subs = [];
	var vals = [];
	var subtotals = [];
	var count = 0;
	var total = 0.0;
	for (var key in results) {
	    categories[count] = key;
	    vals[count] = results[key]['data'].split(',');
	    subtotals[count] = 0.0;
	    for (var i = 0; i < vals[count].length; i++) {
		    subtotals[count] += parseFloat(vals[count][i]);
		    total += parseFloat(vals[count][i]);
	    }
	    subs[count] = results[key]['categories'].split(',');
	    count++;
	}
	
	for (var i = 0; i < count; i++) {
	    for (var x = 0; x < vals[i].length; x++) {
		vals[i][x] = parseFloat(parseFloat(vals[i][x] / total * 100).toFixed(2));
	    }
	}

	var colors = this.palette;
	data = [];
	for (var i = 0; i < count; i++) {
	    data[i] = {
		y : parseFloat(parseFloat(subtotals[i] / total * 100).toFixed(2)),				// % of pie
		drilldown : {		    
		    data : vals[i],
		    categories : subs[i],
		    color : colors[i]
		},
		color : colors[i]
	    }
	}

	// Build the data arrays
	var browserData = [];
	var versionsData = [];
	for (var i = 0; i < data.length; i++) {

		// add browser data
		browserData.push({
			name: categories[i],
			y: data[i].y,
			color: data[i].color
		});

		// add version data
		for (var j = 0; j < data[i].drilldown.data.length; j++) {
			var brightness = 0.2 - (j / data[i].drilldown.data.length) / 5 ;
			versionsData.push({
				name: data[i].drilldown.categories[j],
				y: data[i].drilldown.data[j],
				color: Highcharts.Color(data[i].color).brighten(brightness).get()
			});
		}
	}

	// Create the chart
	chart = new Highcharts.Chart({
		chart: {
			renderTo: document.getElementById('DonutChartID'),

			type: 'pie'
		},
		title: {
			text: ''
		},
		yAxis: {
			title: {
				text: 'y-axis title'
			}
		},
		plotOptions: {
			pie: {
				shadow: false
			}
		},
		tooltip: {
			formatter: function() {
				return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
			}
		},
		series: [{
			name: 'series name',
			data: browserData,
			size: '50%',
			dataLabels: {
				formatter: function() {
					return this.y > 5 ? this.point.name : null;
				},
				color: 'white',
				distance: -30
			}
		}, {
			name: 'categories',
			data: versionsData,
			innerSize: '50%',
			dataLabels: {
				formatter: function() {
					// display only if larger than 1
					return this.y > 1 ? '<b>'+ this.point.name +':</b> '+ this.y +'%'  : null;
				}
			}
		}]
        });
    }
});
