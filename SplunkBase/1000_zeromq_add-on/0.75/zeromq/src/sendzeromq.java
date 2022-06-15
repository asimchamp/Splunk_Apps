// Author: Nimish Doshi
// This searches Splunk using the Splunk Java SDK and send events to a
// zeromq queue

import java.io.*;
import java.util.StringTokenizer;

import org.zeromq.ZMQ;

import com.splunk.Service;
import com.splunk.ServiceInfo;
import com.splunk.Job;
import com.splunk.Args;

public class sendzeromq {


    public void sendzeromq() { }

    // Connection settings for Splunk server
    private static String user="";
    private static String password="";
    private static String host="";
    private static String port="";
    private static String search="";
    private static Service service=null;

    private static void sendtoQ(Args queryArgs, Args outputargs,
				ZMQ.Socket sock) {


			try {

			    String query=search;
			    Job job = service.getJobs().create(query, queryArgs);
			    while (!job.isDone()) {
				Thread.sleep(100);
				job.refresh();
			    }

			    Args outputArgs = new Args();
			    outputArgs.put("output_mode", "csv");
			    InputStream stream = job.getResults(outputArgs);
			    InputStreamReader reader = new InputStreamReader(stream);
			    int size = 1024;
			    String str=null;
			    char[] buffer = new char[size];
			    int count = reader.read(buffer);
			    while (count>0) {
				String s =new String(buffer);
				str=str+s;
				    //System.out.print(buffer);
				count = reader.read(buffer);
			    }
			    StringTokenizer st = new StringTokenizer(str, "\n");
			    while(st.hasMoreTokens()) {
				String temp= st.nextToken();
				//System.out.println(temp);
				sock.send(temp.getBytes(), 0);
				byte data2[] = sock.recv(0);	
			    }
			    reader.close();

			} catch(Exception e) {
			    System.err.println("Possible Exception searching Splunk");
			    e.printStackTrace();
			}
    }

	    
       

    
    public static void main(String[] args) {

	if (args.length != 2) {
	    System.err.println("Usage: java sendzeromq <search string> <zeromq url>");
	    System.exit(1);
	}

    
	sendzeromq feeds = new sendzeromq();

	search=args[0];

	String connectTo = args[1];

        ZMQ.Context ctx = ZMQ.context (1);
        ZMQ.Socket sock = ctx.socket (ZMQ.REQ);

        //  Add your socket options here.
        //  For example ZMQ_RATE, ZMQ_RECOVERY_IVL and ZMQ_MCAST_LOOP for PGM.
        sock.connect (connectTo);
	

	try {
	
	    user = System.getenv("SPLUNK_USER");
	    password = System.getenv("SPLUNK_PASSWORD");
	    host = System.getenv("SPLUNK_HOST");
	    port = System.getenv("SPLUNK_PORT");
	    int port_num=Integer.parseInt(port);
	    service = new Service(host, port_num);
	    service.login(user, password);
		    
	} 
	catch (Exception e) {
	    System.err.println("Cannot connect to Splunk. Check ENV variables");
	    System.exit(2);
	}

	Args queryArgs = new Args();
	//queryArgs.put("earliest_time", "-24h");

	Args outputArgs = new Args();
	outputArgs.put("output_mode", "raw");


	try { 

	    sendtoQ(queryArgs, outputArgs, sock);
	}
	catch (Exception e) {
	    System.err.println("Error sending to ZeroMQ");
	    e.printStackTrace();

	}

	
    }


}
