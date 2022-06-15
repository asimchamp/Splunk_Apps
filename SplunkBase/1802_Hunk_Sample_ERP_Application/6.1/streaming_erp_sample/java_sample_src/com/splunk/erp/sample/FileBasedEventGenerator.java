package com.splunk.erp.sample;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.zip.GZIPInputStream;

import org.apache.commons.lang.text.StrSubstitutor;
/**
 * File Based Event Generator: It will read files/file specified and read them one by one
 * and read lines in them one by one
 * @author snaik
 *
 */
public class FileBasedEventGenerator {

	File rootPath = null;

	private List<File> pathsToRead = new ArrayList<File>();; 

	private Iterator<File> itr = null;
	private File currentFile = null;
	BufferedReader reader  = null;
	boolean isNewInfo = false;

	public FileBasedEventGenerator (String path) {
		Map<String,String> envVars = System.getenv();
		path = StrSubstitutor.replace(path, envVars);
		if (path.contains(StrSubstitutor.DEFAULT_ESCAPE + "")) {
			//Still has it
			for (Entry<String, String> env: envVars.entrySet()) {
				String repKey = "\\$" + env.getKey() + "\\" + File.separator;
				path = path.replaceAll("\\$" + env.getKey() + "\\" + File.separator , env.getValue()  + File.separator);
			}
		}
		
		ERPLogger.logInfo("File Based Event Generator : " + path);
		rootPath = new File(path);
		checkPath(rootPath);
		//if all readable
		itr = pathsToRead.iterator();
		ERPLogger.logInfo("Count of files to read : " + pathsToRead.size());

	}
	
	
	/**
	 * Recursively , make sure all the files are readable, skip hidden files
	 * Add it to the {@link FileBasedEventGenerator#pathsToRead}
	 * @param path
	 */
	protected void checkPath (File path) {

		if (false == path.exists() ) {
			ERPLogger.logError( "File not present : " + path);
			throw new IllegalArgumentException("File " +  path + " does not exists " );
		}
		if (false == path.canRead()) {
			ERPLogger.logError( "File could not be read : " + path);
			throw new IllegalArgumentException("File " +  path + " can not read " );
		}
		if (path.isHidden() ) {
			ERPLogger.logDebug("Skipping Hidden file :" + path);
			return;
		}

		if (path.isFile()) {
			pathsToRead.add(path);
		}

		if (path.isDirectory()) {
			//check all the files are readable
			File [] files = path.listFiles();
			for (File f: files ) {
				this.checkPath(f);
			}
		}
	}

	public String getCurrentFile () {
		return  currentFile != null  ? currentFile.toString(): "";
	}


	private void closeReader() throws IOException{
		if (reader != null) {
			reader.close();
			reader = null;
		}
	}

	/**
	 * Get the next file in line and when done return null
	 * @return true if there is a new file, else false
	 * @throws IOException
	 */
	protected boolean initNextSource () throws IOException {

		this.closeReader();
		if (itr.hasNext()) {
			currentFile = itr.next();
			ERPLogger.logDebug("Reading file : " + currentFile.toString());
			String currentFileName = currentFile.getName();
			if (currentFileName.endsWith(".gz") || currentFileName.endsWith(".gzip") ) {
				GZIPInputStream gzStream  = new GZIPInputStream(new FileInputStream(currentFile)) ;
				this.reader = new BufferedReader(new InputStreamReader(gzStream));
				
			}else {
				//normal text file
				this.reader = new BufferedReader(new FileReader(currentFile));
			}
			return true;
		}else {
			return false;
		}


		
	}

	/**
	 * Read the one by one line from the current file
	 * 
	 * @return line or null when done
	 * @throws IOException
	 */
	protected String readCurrentSourceRecord () throws IOException{

		String line = null;

		if (reader != null ) {
			line = reader.readLine();
		}

		return line;
	}
	
	public static void main(String[] args) {
		System.out.println(System.getenv("SPLUNK_HOME"));
		System.out.println (System.getenv());
		new FileBasedEventGenerator("$SPLUNK_HOME/var/log");
	}

}
