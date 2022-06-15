package com.splunk.erp.sample;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
/**
 * Auto Event Generator.
 * Generates fakes event in reversed time order.
 * The number of events is limited by <code>limit</code>.
 * <br>
 * Event Generated looks like :
 * <code> Timestamp this is event number eventId </code>
 * @author snaik
 *
 */
public class EventGenerator {
	static final String DATEFORMAT = "EEE, d MMM yyyy HH:mm:ss z";

	long eventTimeStampInMS = System.currentTimeMillis();
	long eventId = 0;
	int limit = Integer.MAX_VALUE;
	public EventGenerator(int limit) {
		ERPLogger.logInfo("Auto generating events with limit " + limit);
		this.limit = limit;
	} 


	public  String GetUTCdatetimeAsString(long timeInMS){

		final SimpleDateFormat sdf = new SimpleDateFormat(DATEFORMAT);
		sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
		final String utcTime = sdf.format(new Date(timeInMS));

		return utcTime;
	}

	public  String generateEvent () {

		String event = null;
		if (eventId  < limit ) {
			event = GetUTCdatetimeAsString(eventTimeStampInMS) + " - " + " this is event number " + eventId;

			eventTimeStampInMS = eventTimeStampInMS -1000; //reduce a sec
			eventId ++;
		}

		return event;

	}
}
