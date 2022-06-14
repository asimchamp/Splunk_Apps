Splunk.Module.IdSelector = $.klass(Splunk.Module, 
{ 
    TOKEN_CHASSIS_PARAM : 'tokenChassis',
	TOKEN_ID_PARAM : 'tokenId',
	INTENTION_CHASSIS_PARAM : 'intentionChassis',
	INTENTION_CHASSIS_ID : 'intentionId',
	STATISTICS_TARGET_PARAM:'statisticsTarget',
	CHASSIS:'chassis',
	
    initialize: function($super, container) 
	{
        $super(container);
		this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
		this.resultsContainer = this.container;	
	},
	
	
	onContextChange: function() 
	{
	   this.getResults();   
	},
	
	getResultParams: function($super) 
	{
		var context = this.getContext();
        var params = $super();
		
        params[this.CHASSIS] = context.get(this.CHASSIS);
		params[this.STATISTICS_TARGET_PARAM] = context.get(this.STATISTICS_TARGET_PARAM);
		
        return params;
    },
	
	onChange: function(event) 
	{
		this.initiateSearch();	    
    },
	
	initiateSearch:function()
	{
		var selectedPort = $('#ports').find(":selected").val();
		
		var context = this.getContext()
		
		var selectedChassis = context.get(this.CHASSIS);
		
		if (!selectedPort  || !selectedChassis )
		{
			return ;
		}
		
		var tokenChassis = this.getToken(this.TOKEN_CHASSIS_PARAM);
		var tokenId = this.getToken(this.TOKEN_ID_PARAM);
		var intentionChassis = this.getIntention(selectedChassis, this.INTENTION_CHASSIS_PARAM, tokenChassis);
		var intentionPort = this.getIntention(selectedPort, this.INTENTION_CHASSIS_ID , tokenId);
		
        if (selectedChassis && selectedPort) 
		{
            var search  = context.get("search");
            // this is going to be applied in 'null' stringreplace cases but 
            // inpecting the stringreplace args and trying to infer it's logic is too scary.
            search.abandonJob();
            search.addIntention(intentionChassis);
			search.addIntention(intentionPort);
            context.set("search", search);
        }
        
        if (selectedChassis) 
		{
            context.set('form.'+tokenChassis, selectedChassis);
        }
		
        if (selectedPort ) 
		{
            context.set('form.'+tokenId, selectedPort);
        }
		
		this.pushContextToChildren(context);	
	},
	
	getResultsCompleteHandler: function($super, xhr, textStatus) 
	{	
		$super(xhr, textStatus);
		$('#ports', this.container).bind('change', this.onChange.bind(this));
	},
	
	getToken:function(token)
	{
		return this._params[token];
	},
	
	getIntention: function(replacementValue, intention,token) 
	{
        var theIntention = $.extend(true, {}, this._params[intention]);
        if (replacementValue != null && theIntention != null)
		{
		    argObject = theIntention["arg"];			
			tObject = argObject[token];			
			tObject["value"] = replacementValue;
        }		
        return theIntention;
    },
})