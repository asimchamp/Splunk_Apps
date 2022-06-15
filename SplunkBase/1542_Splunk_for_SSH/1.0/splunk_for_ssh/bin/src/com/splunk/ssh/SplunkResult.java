package com.splunk.ssh;

import com.google.gson.Gson;
import com.splunk.ssh.Messages;
import com.splunk.ssh.Results;

public class SplunkResult {
	private boolean preview;
	private int init_offset;
	private Messages[] messages;
	private Results[] results;

	public boolean isPreview() {
		return preview;
	}

	public void setPreview(boolean preview) {
		this.preview = preview;
	}

	public int getInit_offset() {
		return init_offset;
	}

	public void setInit_offset(int init_offset) {
		this.init_offset = init_offset;
	}

	public Messages[] getMessages() {
		return messages;
	}

	public void setMessages(Messages[] messages) {
		this.messages = messages;
	}

	public Results[] getResults() {
		return results;
	}

	public void setResults(Results[] results) {
		this.results = results;
	}

	public String toString() {
		return this.toJson();
	}

	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}
}
