Splunk.Module.TimeRangePickerWithCustomIntent = $.klass(Splunk.Module.TimeRangePicker, 
{
    INTENTION_NAME: 'intentionTimeSpan',
	INTENTION_TOKEN: 'intentionTimeSpanToken',
	
    initialize: function($super, container)
	{
        $super(container);
		this.resultsContainer = this.container;	
    },

    getModifiedContext: function() 
	{
        var range = null;
        if (this._selectedRange) 
		{
            range = this._selectedRange;
        } 
		else 
		{
            this.logger.error("Assertion Failed - we have no selected range.  If this occurs with the calendar-pickers its a possible race condition.");
            range = new Splunk.TimeRange();
        }
		
		var tokenTimeSpan = this._params[this.INTENTION_TOKEN]; 		
		var span = this.getTimeSpanForTimeRange(range);
		var intentionTimeSpan = this.getIntention(span, this.INTENTION_NAME, tokenTimeSpan);
		
        var context = this.getContext();
        var search  = context.get("search");
        search.abandonJob();
        search.setTimeRange(range);
		search.addIntention(intentionTimeSpan);
        // TODO - I've decided for now that we cant let context.get() return references, because it 
        //        breaks encapsulation. 
        //        however in theory we could say that context is only responsible for 
        //        encapsulating simple literals and objects have a more wild-west feel...   
        context.set("search", search);
        return context;
    },
	
	getTimeSpanForTimeRange: function(range)
	{
	    if(range == null)
	        return '1m';
			
		relEarliestTime = range.getRelativeEarliestTime();
		relLatestTime = range.getRelativeLatestTime();
		
		if(relLatestTime == 'rt')
			return '20s';
		
		if(relLatestTime == 'now')
		{
		    if(relEarliestTime == '-15m')
			{
			    return '20s';
			}
			
			if(relEarliestTime == '-60m')
			{
			    return '20s';
			}
			
			if(relEarliestTime == '-4h@m')
			{
			    return '40s';
			}
			
			if(relEarliestTime == '-24h@h')
			{
			    return '5m';
			}
			
			if(relEarliestTime == '-7d@h')
			{
			    return '11m';
			}
			
			if(relEarliestTime == '-30d@d')
			{
			    return '45m';
			}
		}
		
        return '1m'	;	
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
    }
});
