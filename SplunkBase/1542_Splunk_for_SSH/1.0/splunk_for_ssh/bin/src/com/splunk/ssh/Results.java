package com.splunk.ssh;

public class Results {
	private String host;
	private String IP;
	
	
	public String getIP() {
		return IP;
	}
	public void setIP(String iP) {
		IP = iP;
	}
	private String _tc;
	
	public String getHost() {
		return host;
	}
	public void setHost(String host) {
		this.host = host;
	}
	public String get_tc() {
		return _tc;
	}
	public void set_tc(String _tc) {
		this._tc = _tc;
	}
	
    public String toString ()
    {
    //return ("[host:"+getHost()+","+"IP:"+getIP()+"]");
    return (getIP());
    }

}