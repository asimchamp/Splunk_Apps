package com.splunk.ssh;

public class IPTablesRuleLine 
{
private int lineNum;
private String lineData;
private int lineType;
public static final int RULE_LINE=0;
public static final int COMMIT_LINE=1;
public static final int SPLUNKSSH_INSERT_START_LINE=2;
public static final int SPLUNKSSH_INSERT_END_LINE=3;
public static final int IPTABLES_COMMENT_LINE = 4;

public IPTablesRuleLine(int lineNum, String lineData, int lineType) {
	super();
	this.lineNum = lineNum;
	this.lineData = lineData;
	this.lineType = lineType;
}

public IPTablesRuleLine(int lineNum, String lineData) {
	this.lineNum = lineNum;
	this.lineData = lineData;
	if ("COMMIT".equalsIgnoreCase(lineData))
		this.lineType = COMMIT_LINE;
	else if (lineData.equalsIgnoreCase ("# SPLUNKSSH_INSERT_START_LINE"))
		this.lineType = SPLUNKSSH_INSERT_START_LINE;
	else if (lineData.equalsIgnoreCase ("# SPLUNKSSH_INSERT_END_LINE"))
		this.lineType = SPLUNKSSH_INSERT_END_LINE;
	else if (lineData.startsWith ("#"))
		this.lineType = IPTABLES_COMMENT_LINE;
	else
		this.lineType = RULE_LINE;
}

public int getLineType() {
	return lineType;
}

public void setLineType(int lineType) {
	this.lineType = lineType;
}

public int getLineNum() {
	return lineNum;
}
public void setLineNum(int lineNum) {
	this.lineNum = lineNum;
}
public String getLineData() {
	return lineData;
}
public void setLineData(String lineData) {
	this.lineData = lineData;
}

public String toString () {
	String type="RULE_LINE";
	if (this.lineType == COMMIT_LINE)
		type = "COMMIT_LINE";
	else if (this.lineType == SPLUNKSSH_INSERT_START_LINE)
		type = "SPLUNKSSH_INSERT_START_LINE";
	else if (this.lineType == SPLUNKSSH_INSERT_END_LINE)
		type = "SPLUNKSSH_INSERT_END_LINE";
	else if (this.lineType == IPTABLES_COMMENT_LINE)
		type = "IPTABLES_COMMENT_LINE";	
	
	return "["+lineNum+" : "+type+" : "+lineData+"]\n";
}

}

