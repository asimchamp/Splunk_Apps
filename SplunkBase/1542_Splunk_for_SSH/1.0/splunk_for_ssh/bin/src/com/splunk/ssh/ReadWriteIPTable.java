package com.splunk.ssh;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;


public class ReadWriteIPTable {

		public static void main(String[] args) {

			Results [] results = SplunkForSSH.getIpResults();
			Boolean splunkSSHNotFound = true;

			File file = new File(
					"PATH TO YOUR IPTABLE FILE");
			File resultFile = new File(
					"PATH TO YOUR NEW IPTABLE FILE");

			BufferedReader reader = null;  

			ArrayList<IPTablesRuleLine> arrayList = new ArrayList<IPTablesRuleLine>();

			try {
				reader = new BufferedReader(new FileReader(file));
				String text = null;

				int lineNum = 0;
				// Read through the entire IPTables input file
				while ((text = reader.readLine()) != null) {
					IPTablesRuleLine tmpLine = new IPTablesRuleLine(lineNum++, text);
					if (tmpLine.getLineType() == IPTablesRuleLine.SPLUNKSSH_INSERT_START_LINE)
						splunkSSHNotFound = false;

					arrayList.add(tmpLine);
				}
				reader.close();

				// Write the modified file out

				FileWriter writer = new FileWriter(resultFile, true);
				for (IPTablesRuleLine line : arrayList) {
					if (splunkSSHNotFound
							&& (line.getLineType() == IPTablesRuleLine.COMMIT_LINE)) {
						writer.write("# SPLUNKSSH_INSERT_START_LINE\n");
						for (Results rs: results ){
			            	writer.write("-A INPUT -m state --state NEW -m tcp -p tcp -s" + " " + rs + " " + "--dport -j ACCEPT" 
		    	                    + System.getProperty("line.separator"));
		        		}
						writer.write("# SPLUNKSSH_INSERT_END_LINE\n");
					}
					if (line.getLineType() == IPTablesRuleLine.SPLUNKSSH_INSERT_END_LINE)
						for (Results rs: results ){
			            	writer.write("-A INPUT -m state --state NEW -m tcp -p tcp -s" + " " + rs + " " + "--dport -j ACCEPT" 
		    	                    + System.getProperty("line.separator"));
		        		}

					writer.write(line.getLineData() + "\n");
				}
				writer.flush();
				writer.close();
			} catch (IOException err) {
				err.printStackTrace();
			}

		}

	}

