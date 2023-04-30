Splunk.Module.ChassisSelector = $.klass(Splunk.Module, 
{
    STATISTICS_TARGET_PARAM:'statisticsTarget',
	CHASSIS:'chassis',
	
    initialize: function($super, container) 
	{
        $super(container);
		this.resultsContainer = this.container;
		$( document ).ready( this.onReady(this));
	},
	
	onChange: function(event) 
	{
		var selectedChassis = $('#chassis').find(":selected").text();
		if(selectedChassis == null || selectedChassis == "None")
		{
			return;
		}
		
		var context = this.getContext()
		
		context.set(this.CHASSIS, selectedChassis);
		context.set(this.STATISTICS_TARGET_PARAM,this.getStatisticsTarget());
			
		this.pushContextToChildren(context);
    },
	
	onReady: function(event) 
	{
	    this.getResults();	       
	},
	
	getResultsCompleteHandler: function($super, xhr, textStatus) 
	{	
		$super(xhr, textStatus);	
		$('#chassis', this.container).bind('change', this.onChange.bind(this));	
	},
	
	getStatisticsTarget: function()
	{
		return this._params[this.STATISTICS_TARGET_PARAM];
	},
})