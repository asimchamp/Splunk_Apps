package com.splunk.erp.sample;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.URL;
import java.net.URLClassLoader;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;

import com.splunk.erp.sample.ERPLogger.LEVEL;
import com.splunk.io.ChunkedOutputStream;

public class ERPSample {

	final static String HOSTNAME ;
	final static String NEWLINE = System.getProperty("line.separator");

	static {
		String tempHostName = "localhost";
		try {
			tempHostName = InetAddress.getLocalHost().getHostName();
		} catch (UnknownHostException e) {
			ERPLogger.logInfo("Could not get HostName, defaulting to IP address");
			try {
				tempHostName = InetAddress.getLocalHost().getHostAddress();
			} catch (UnknownHostException e1) {
				ERPLogger.logInfo("Could not get HostName, defaulting localhost");
			}
		}
		HOSTNAME = tempHostName;
	}

	int bufferLimit = 32*1024;

	private final int limit ;
	private JsonNode argsInJson;
	private final String index ; 
	private final String vixDataPath ; //holder for reading files from 

	//headers for chunked output format
	private Map<String, Object> streamHeader = new HashMap<String,Object>(); 
	


	/**
	 * CTor
	 * Parses argument passed in via <code>System.in</code>
	 * <br> Inits <code>index event limit and data path </code>.
	 * <br> Builds out an header based on these extracted fields and other standard fields 
	 * @throws Exception
	 */
	public ERPSample () throws Exception{
		this.parseArgs();
		index = getIndex();
		limit = getEventCount();
		vixDataPath = getDataPath();
		this.buildHeader();
	}

	/**
	 * Build the Header
	 */
	private void buildHeader () {
		this.streamHeader.put("stream_type", "raw");
		this.streamHeader.put("field.index", this.index);
		this.streamHeader.put("field.host", HOSTNAME);
	}

	/**
	 * Update the header iff the new value is different from the existing one
	 * @param field
	 * @param newValue
	 * @return
	 */
	private boolean updateHeader (String field, String newValue) {

		boolean isUpdated = false;
		if (newValue == null || newValue.length()  == 0) { //empty or null string
			//no op
		}else {
			String prevValue = (String)this.streamHeader.get(field);
			if (prevValue == null || prevValue.equals(newValue) == false) {
				isUpdated = true;
				this.streamHeader.put(field, newValue);
			}
		}

		return isUpdated;
	}

	/**
	 * A new header is required when the data channel changes.
	 * <br> A data channel is defined uniquely by <code>field.source, field.sourcetype, field.host</code>
	 * @param source
	 * @param sourceType
	 * @param host
	 * @return
	 */
	private boolean isNewHeaderReqd (String source, String sourceType, String host) {

		boolean isNewHeaderReqd = false;

		isNewHeaderReqd |= updateHeader("field.source", source);
		isNewHeaderReqd |= updateHeader("field.sourcetype", sourceType);
		isNewHeaderReqd |= updateHeader("field.host", host);

		return isNewHeaderReqd;

	}

	/**
	 * Actual method to write out the events into the <code>System.out</code>
	 * This will write using the <code> Chunked Output Format </code>
	 * <br> A header is written out,only if the channel is different
	 * @param sb
	 * @param cos
	 * @param source
	 * @param sourceType
	 * @param host
	 * @throws IOException
	 */
	public  void stream (StringBuilder sb, ChunkedOutputStream cos, String source, String sourceType, String host) throws IOException {

		//calculate the body size 
		if (isNewHeaderReqd(source, sourceType, host)) {
			//Header
			cos.write(this.streamHeader, sb.toString());
		}else {
			cos.write((Map<String,Object>) null, sb.toString());
		}
	}


	
	/**
	 * Events are auto generated using <code> EventGenerator </code>
	 *   
	 * 
	 * @throws IOException
	 * @see {@link EventGenerator}
	 */
	public void generateAutoEvents () throws IOException {
		ChunkedOutputStream cos = new ChunkedOutputStream(System.out);
		
		final String fieldSource = "/path/to/somefile";

		EventGenerator ev = new EventGenerator(limit);

		StringBuilder eventsCollectorBuffer = new StringBuilder(bufferLimit);

		String event = null;
		while ( (event = ev.generateEvent())  != null) {

			eventsCollectorBuffer.append(event);
			eventsCollectorBuffer.append(NEWLINE);

			if (eventsCollectorBuffer.length() > bufferLimit) {
				this.stream(eventsCollectorBuffer,  cos, fieldSource, "sample_erp_java", HOSTNAME);
				eventsCollectorBuffer = new StringBuilder(bufferLimit); //reset the buffer
			}

		}

		if (eventsCollectorBuffer != null && eventsCollectorBuffer.length() > 0) {
			this.stream(eventsCollectorBuffer, cos, fieldSource, "sample_erp_java", HOSTNAME);
		}
	}
	/**
	 * Events are generated from the files specified in <code>vix.data.path</code>
	 * @throws IOException
	 */
	public void readEventsFromDataPath ( ) throws IOException {
		ChunkedOutputStream cos = new ChunkedOutputStream(System.out);

		FileBasedEventGenerator ev = new FileBasedEventGenerator(this.vixDataPath);
		
		//read the next source
		while (ev.initNextSource()) {

			String event = null;
			StringBuilder eventsCollectorBuffer = new StringBuilder(bufferLimit);
			//read line in each source
			while ( (event = ev.readCurrentSourceRecord() )!= null )  {

				eventsCollectorBuffer.append(event ); //TODO use System new line
				eventsCollectorBuffer.append(NEWLINE);

				if (eventsCollectorBuffer.length() > bufferLimit) {
					//field source is picked up by splunk as file extension, so null
					this.stream(eventsCollectorBuffer, cos, ev.getCurrentFile(), null, HOSTNAME);
					eventsCollectorBuffer = new StringBuilder(bufferLimit); //reset the buffer

				}

			}
			//dont forget the last chunk
			if (eventsCollectorBuffer != null && eventsCollectorBuffer.length() > 0) {
				this.stream(eventsCollectorBuffer,cos, ev.getCurrentFile(),  null, HOSTNAME);
			}

		}

	}

	/**
	 * Based <code>vixDataPath</code> select the execution path 
	 * <code>{@link ERPSample#readEventsFromDataPath()}</code> OR 
	 * <code>{@link ERPSample#generateAutoEvents()}</code>
	 * @throws IOException
	 */
	public void getEvents ()  throws IOException{

		if (this.vixDataPath != null && this.vixDataPath.length() > 0 ) {
			this.readEventsFromDataPath();
		}else {
			this.generateAutoEvents();
		}
	}

	/**
	 * Parse json args which are sent as single line json via <code>System.in</code> 
	 * @throws IOException
	 */
	public void parseArgs () throws IOException{

		String argsLine = null;

		BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
		argsLine = reader.readLine();
		reader.close();

		ObjectMapper objectMapper = new ObjectMapper();
		argsInJson = objectMapper.readTree(argsLine);
	}
	
	/**
	 * Get Limit while generating events from the input json
	 * @return
	 */
	private int getEventCount () {
		int eventCount = 0;
		if (argsInJson != null) {
			//index is present in conf.indexes[0].

			JsonNode confJsonNode = argsInJson.get("conf");
			JsonNode indexesJsonNode = confJsonNode.get("indexes");
			if (indexesJsonNode.isArray()) {
				JsonNode firstIndexJsonNode =indexesJsonNode.get(0);
				JsonNode eventCountJsonNode = firstIndexJsonNode.get("event.count");
				if (eventCountJsonNode != null) {
					return eventCountJsonNode.getValueAsInt();
				}
			}
		}

		return eventCount;

	}
	/**
	 * Extract the data path while generating events from the input json
	 * @return
	 */
	private String getDataPath () {
		String dataPath = null;
		if (argsInJson != null) {
			//index is present in conf.indexes[0].

			JsonNode confJsonNode = argsInJson.get("conf");
			JsonNode indexesJsonNode = confJsonNode.get("indexes");
			if (indexesJsonNode.isArray()) {
				JsonNode firstIndexJsonNode =indexesJsonNode.get(0);
				JsonNode dataPathJsonNode = firstIndexJsonNode.get("data.path");
				if (dataPathJsonNode != null) {
					return dataPathJsonNode.getValueAsText();
				}
			}
		}

		return dataPath;

	}

	/**
	 * Extract the index while generating events from the input json
	 * This goes in the header response
	 * @return
	 */
	private String getIndex ()  {
		if (argsInJson != null) {
			//index is present in conf.indexes[0].

			JsonNode confJsonNode = argsInJson.get("conf");
			JsonNode indexesJsonNode = confJsonNode.get("indexes");
			if (indexesJsonNode.isArray()) {
				JsonNode firstIndexJsonNode = indexesJsonNode.get(0);
				JsonNode indexNameJsonNode = firstIndexJsonNode.get("name");
				if (indexNameJsonNode != null) {
					return indexNameJsonNode.getValueAsText();
				}
			}
		}

		return null;
	}


	/**
	 * Start point
	 * 1. Logs the classpath
	 * 2. Gets events
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception{
		
		//print classpath here 
		ClassLoader cl = ClassLoader.getSystemClassLoader();
		 
        URL[] urls = ((URLClassLoader)cl).getURLs();
 
        for(URL url: urls){
        	ERPLogger.log(LEVEL.DEBUG, "classpath entry " + url.toString());
        }
      
		
		//raw - event generator
		// raw - events from file
		new ERPSample().getEvents();

	}
}
