package com.splunk.ssh;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import javax.net.ssl.HostnameVerifier;
import com.google.gson.*;
import com.splunk.*;

public class SplunkForSSH {

	private static Results[] ipResults;

	public static Service connectAndLoginToSplunkExample() {
		Map<String, Object> connectionArgs = new HashMap<String, Object>();
		connectionArgs.put("host", "YOUR SERVER");
		connectionArgs.put("username", "USERNAME");
		connectionArgs.put("password", "PASSWORD");
		connectionArgs.put("port", 8089);
		connectionArgs.put("scheme", "https");
		Service splunkService = Service.connect(connectionArgs);
		return splunkService;
	}

	public static Results[] getIpResults() {
		Service splunkService = connectAndLoginToSplunkExample();

		Args queryArgs = new Args();

		Job job2 = splunkService.getJobs().create(
				"search sourcetype=syslog | TOP host| fields host");

		try {
			while (!job2.isDone()) {
				try {
					System.out.println(job2.getDoneProgress() * 100.00);
					Thread.sleep(500);
				} catch (Exception err) {
					err.printStackTrace();
				}
			}

			Args outputArgs = new Args();
			outputArgs.put("output_mode", "json");

			Gson gson = new GsonBuilder().create();
			SplunkResult hostsSplnkResults = gson
					.fromJson(new InputStreamReader(
							job2.getResults(outputArgs), "UTF-8"),
							SplunkResult.class);
			Results[] hostResults = hostsSplnkResults.getResults();

			for (int i = 0; i < hostResults.length; i++) {
				System.out.println(hostResults[i].getHost());
				Job job = splunkService
						.getJobs()
						.create("search host="
								+ hostResults[i].getHost()
								+ "| TOP rhost | fields rhost |rename rhost AS IP");
				while (!job.isDone()) {
					try {
						System.out.println(job.getDoneProgress() * 100.00);
						Thread.sleep(500);
					} catch (Exception err) {
						err.printStackTrace();
					}
				}

				SplunkResult ipSplnkResults = gson.fromJson(
						new InputStreamReader(job.getResults(outputArgs),
								"UTF-8"), SplunkResult.class);
				ipResults = ipSplnkResults.getResults();
				for (int j = 0; j < ipResults.length; j++) {
					System.out.println(ipResults[j].getIP());
				}

			}
		} catch (Exception err) {
			err.printStackTrace();
		}
		return ipResults;
	}

}
