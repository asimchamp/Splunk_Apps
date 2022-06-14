#!/bin/bash
# DeepSight.sh PoC script to download deepsight DataFeeds.
# Author: antonio_forzieri@symantec.com
# Dev date: 06 Mar. 2014 
# Change date: 20 Oct 2014
#
# Return Codes
# - 10 Dependecy failure
# - 11 Curl connection error
# - 12 Authentication Failure
# - 13 Illegal DATAFEED_TYPE and DATAFEED_ID combination
# - 20 Illegal Options
# - 21 Illegal log2file/interactive combination
# - 22 Illegal Datafeed type/format/behaviour specified
# - 23 Illegal Datafeed specified
# - 24 No Datafeed credentials Specified
# - 25 Illegal proxy configuration
# - 26 Illegal curl_verbose/log2file combination
# - 27 Error creating directories
# - 28 Illegal format for latest file (not numeric)
# - 29 Illegal range format
# - 30 Illegal range/last n file combination

# Version History
# 0.1 - 05 Mar. 2014 - First Prototype
# 0.2 - 06 Mar. 2014 - Interactive release
# 0.3 - 07 Mar. 2014 - Interactive and non interactive
# 0.4 - 10 Mar. 2014 - Added command line switches
# 0.5 - 16 Mar. 2014 - Bug fixes
# 0.6 - 17 Mar. 2014 - Added commandline switches for username and password
# 0.7 - 19 Mar. 2014 - Proxy and authenticated proxy support added, removed xmllint dependency
# 0.8 - 24 Mar. 2014 - Special chars support for passwords
# 0.9 - 15 May. 2014 - Using SessionId instead of multiple logins 
#					   adopted a different xml format 
#					   added debug for curl
#					   no Accept header in curl requests
#					   selected options printed in logfile
#					   created functions for every SOAP invocation
#					   added options to specify working dir and output dir from the commandline
# 1.0 - 20 Oct. 2014 - Support for Advanced Datafeeds
#					   Removed one DATAFEED_PROXY as SCAP and NOSCAP feed are available using the same URL
#					   Functions rewritten in order to accepts parameters
#                      Added support for concurrent script executions
#					   Added support to download historical data for IP and URL Reputation/Advanced Reputation Datafeeds
#					   Latest N option now validated using a dedicated function
#                      Fixed a bug which was preventing using output/working folder with spaces
#					   Fixed a bug which was preventing using lofgfiles contained spaces in the name
#					   Added option to specify User-Agent to be used during HTTPS connection
#					   Forced TLS1 adoption instead of SSLv3
#					   Added Resetdir Option
#					   Datafeed size is now expressed in Byte/Kb/Mb

# Constant declaration
DATAFEED_ID_SCAP=(3 5 13 17)
DATAFEED_ID_NOSCAP=(3 5 12 13 18 19 20 21 22 23 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60)

#Default Values
INTERACTIVE=0 	# 1 script run in interactive mode
				# 0 script run in the background

DATAFEED_TYPE=0 # 0 Datafeeds and Reputation Datafeed
				# 1 SCAP Datafeed

#DATAFEED_ID=18	# Datafeed to download if no command line option is passed


# Variable declaration
VERSION="1.0"
USERNAME='USERNAME'
PASSWORD='PASSWORD'

# Additions for Splunk App
unset LD_LIBRARY_PATH
source $SPLUNK_HOME/etc/apps/TA-DeepSight/bin/credentials


LOG2FILE=0 		# 0 do not log to file
				# 1 log to file
CURL_VERBOSE="" #
#SSL_OPT="-1"	# curl SSL/TLS options
SSL_OPT="-3"	# Setting SSL OPT to 3 for the Splunk App
USER_AGENT="Symantec Deepsight Datafeed Bash Client/$VERSION" #curl user-agent

LOG_FILE=""		# logfile
PROXY=""		# Proxy configuration

# Do not add trailing slash
WORKING_DIR="/tmp"
OUTPUT_DIR="$(pwd)/Deepsight"
DATAFEED_PROXY="https://datafeeds.symantec.com/Feeds"

PREFIX=$RANDOM

#XML requests used for WebServices 
GetCustomerDataFeedList=$(cat<<EOF
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Header>
    <AuthHeader xmlns="http://symantec.com/">
      <UserName>__USERNAME__</UserName>
      <Password>__PASSWORD__</Password>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GetCustomerDataFeedList xmlns="http://symantec.com/" />
  </soap:Body>
</soap:Envelope>
EOF
)

GetSequenceNumber=$(cat<<EOF
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Header>
    <AuthHeader xmlns="http://symantec.com/">
      <SessionId>__SESSIONID__</SessionId>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GetFeedFileList xmlns="http://symantec.com/">
      <dataFeedTypeId>__DATAFEEDTYPEID__</dataFeedTypeId>
    </GetFeedFileList>
  </soap:Body>
</soap:Envelope>
EOF
)

GetFeedFile=$(cat<<EOF
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Header>
    <AuthHeader xmlns="http://symantec.com/">
      <SessionId>__SESSIONID__</SessionId>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GetFeedFile xmlns="http://symantec.com/">
      <dataFeedTypeId>__DATAFEEDTYPEID__</dataFeedTypeId>
      <sequenceNumber>__DATAFEEDSEQUENCENUMBER__</sequenceNumber>
    </GetFeedFile>
  </soap:Body>
</soap:Envelope>
EOF
)

#function to escape special chars in sed
function _escape_sed() {
  local string="${1}"
  local strlen=${#string}
  local escaped=""

  for (( pos=0 ; pos<strlen ; pos++ )); do
     c=${string:$pos:1}
     case "$c" in
          "&" ) o='\&' ;;
	  	  "/" ) o='\/' ;;
	      "\\") o='\\' ;;
            * ) o=${c}   ;;
     esac
     escaped+="${o}"
  done
  echo "${escaped}"
}

function _usage() {
	echo ""
	echo "usage: $0" 
	echo "          [-i] # Interactive"
	echo "          [-f <xml|csv|cef>] # Datafeed format"
	echo "          [-d <malcode|common|security_risk|vulnerability|ip_reputation|url_reputation|adv_ip_reputation|adv_url_reputation>]"
	echo "          [-b <attack|bot|cnc|fraud|malware|phishing|spam>] # advanced datafeeds behaviour"
	echo "          [-s] # SCAP DataFeed version"
	echo "          [-l logfile]"
	echo "          [-u username]"
	echo "          [-p password]"
	echo "          [-x <PROTOCOL://HOST:PORT>] # use proxy on given port"
	echo "          [-U <proxy_username:proxy_password>]"
	echo "          [-v] # enable curl verbose logging"
	echo "          [-A <agent string>] # user agent string to be used by curl"
	echo "          [-o output directory]"
	echo "          [-w working directory]"
	echo "          [-L latest n files] # download latest N available datafeed files"
	echo "          [-r <start-end>] # download only this range of datafeed files"
	echo "          [-h this help message]"
	echo ""
	echo "examples:"
	echo "   $0 -u 'username' -p 'password' -f xml -d ip_reputation"
	echo "   $0 -u 'username' -p 'password' -l logfile.txt -f csv -d url_reputation"
	echo "   $0 -u 'username' -p 'password' -l logfile.txt -b cnc -f csv -d adv_url_reputation"
	echo "   $0 -u 'username' -p 'password' -l logfile.txt -b cnc -f csv -d adv_ip_reputation -L 10"
	echo "   $0 -u 'username' -p 'password' -l logfile.txt -b cnc -f csv -d adv_ip_reputation -r 1-20"
	echo "   $0 -i -u 'username' -p 'password'"
	echo ""
}

function _tokilomega () {
	local size=$1;
	if [[ $size -lt 1024 ]]; then 
		echo "$size B"
	else 
		if [[ $size -lt $((1024*1024)) ]]; then
				echo "$(echo "scale=2; $size/(1024)"|bc) Kb"
		else
				echo "$(echo "scale=2; $size/(1024*1024)"|bc) Mb"		
		fi
	fi
}

function _echo () {
	case $INTERACTIVE$LOG2FILE in 
    	10) echo "$@" ;;
		11) echo "$@" | tee -a "$LOG_FILE" ;;
		01) echo "$@" >> "$LOG_FILE" ;;
		00) ;;
		*) echo -e "\n# Error: Invalid INTERACTIVE/LOG2FILE combination selected [$INTERACTIVE/$LOG2FILE]\n"
	   		exit 22
	   		;;
	esac
}

while getopts "ihl:f:d:su:p:x:U:vo:w:L:b:r:A:R" OPTION
do
  case $OPTION in
  	A) USER_AGENT="$OPTARG"
	   ;;
  	f) case $OPTARG in
  			"xml") ALLOWED_FORMAT=(3 5 12 13 17 18 19 26 29 32 35 38 41 44 47 50 53 56 59)
				   DF_F=$OPTARG ;;
  			"csv") ALLOWED_FORMAT=(21 22 25 28 31 34 37 40 43 46 49 52 55 58)
				   DF_F=$OPTARG ;;
  			"cef") ALLOWED_FORMAT=(20 23 27 30 33 36 39 42 45 48 51 54 57 60)
				   DF_F=$OPTARG ;;
				*) echo -e "\n# Invalid Datafeed type specified! [ $OPTARG ]\n" 
				   exit 22
				   ;;
		esac
	   ;;

	d) case $OPTARG in
	   		"malcode") ALLOWED_FEED=(3) 
					   DF=$OPTARG
					   ;;
	   		"common") ALLOWED_FEED=(5)
					  DF=$OPTARG 
					  ;;
	   		"security_risk") ALLOWED_FEED=(13)
					         DF=$OPTARG 
					         ;;
	  		"vulnerability") ALLOWED_FEED=(12 17)
							 DF=$OPTARG 
							 ;;
	   		"ip_reputation") ALLOWED_FEED=(18 20 21)
							 DF=$OPTARG 
							 ;;
	   		"url_reputation") ALLOWED_FEED=(19 22 23)
							  DF=$OPTARG 
							 ;;
		    "adv_ip_reputation") ALLOWED_FEED=(25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45)
							     DF=$OPTARG 
							     ;;
		    "adv_url_reputation") ALLOWED_FEED=(46 47 48 49 50 51 52 53 54 55 56 57 58 59 60)
							     DF=$OPTARG 
							     ;;
						   *) echo -e "\n# $OPTARG: Invalid Datafeed type specified! [ $OPTARG ]\n"
							  exit 22
							  ;;
	   esac
	   ;;
	b) case $OPTARG in 
		"attack") ALLOWED_BEHAVIOUR=(25 26 27 46 47 48) 
					   DF_B=$OPTARG
					   ;; 
		"cnc") ALLOWED_BEHAVIOUR=(31 32 33 49 50 51) 
					   DF_B=$OPTARG
					   ;;
		"fraud") ALLOWED_BEHAVIOUR=(34 35 36 52 53 54) 
					   DF_B=$OPTARG
					   ;;
		"malware") ALLOWED_BEHAVIOUR=(37 38 39 55 56 57) 
					   DF_B=$OPTARG
					   ;;
		"phishing") ALLOWED_BEHAVIOUR=(40 41 42 58 59 60) 
					   DF_B=$OPTARG
					   ;;
		"bot") ALLOWED_BEHAVIOUR=(28 29 30) 
					   DF_B=$OPTARG
					   ;;
		"spam") ALLOWED_BEHAVIOUR=(43 44 45) 
					   DF_B=$OPTARG
					   ;;
			 *) echo -e "\n# $OPTARG: Invalid Advanced Reputation Datafeed behaviour specified! [ $OPTARG ]\n"
							  exit 22
							  ;;
		esac
	   ;;
	s) DATAFEED_TYPE=1 
	   ;;
    i) INTERACTIVE=1
       ;;
    l) LOG2FILE=1
	   LOG_FILE=$OPTARG
	   ;;
	L) LATEST_FILES=1
       LATEST_N=$OPTARG
	   ;;
    h) _usage
	   exit 0
	   ;;
    r) RANGE=$OPTARG
	   ;;
    u) #we have to encode special chars in html entities or the authentication will fail
	   USERNAME=$(_escape_sed $OPTARG|sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&#39;/g')
	   ;;
	p) #we have to encode special chars in html entities or the authentication will fail
	   PASSWORD=$(_escape_sed $OPTARG|sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&#39;/g')
	   ;;
	R) RESETDIR=1
	   ;;
	x) PROXY=$OPTARG
	   ;;
    U) PROXY_CRED=$OPTARG
       ;;
    v) CURL_VERBOSE="-v"
	   ;;
	w) WORKING_DIR=$OPTARG
	   ;;
	o) OUTPUT_DIR=$OPTARG
	   ;;
    *) _usage
       exit 20 
	   ;;
  esac
done

function _read () {
    if [[ $INTERACTIVE -eq 1 ]]; then
        read "$@"
    fi
}

#Need a pure URL encode function to encode proxy password in case it contains special chars
function _rawurlencode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""

  for (( pos=0 ; pos<strlen ; pos++ )); do
     c=${string:$pos:1}
     case "$c" in
        [-_.~a-zA-Z0-9] ) o="${c}" ;;
                      * ) printf -v o '%%%02x' "'$c" ;;
     esac
     encoded+="${o}"
  done
  echo "${encoded}"
}

function _validate_logging_option() {
	if [[ ! -z "$CURL_VERBOSE" && $LOG2FILE -eq 0 ]]; then 
		echo -e "\n# Error: -v requires -l option."
		exit 26
	fi
}


function _validate_directory_option() {
	if [[ ! -d "$WORKING_DIR" ]]; then 
		mkdir "$WORKING_DIR"
		if [[ $? -ne 0 ]]; then
			echo -e "\n# Error: working directory cannot be created."
			exit 27
		fi
	else 
		if [[ $RESETDIR -eq 1 ]]; then
			  rm -rf $WORKING_DIR/*.{out,xml}
		fi
	fi
	
	if [[ ! -d "$OUTPUT_DIR" ]]; then 
		mkdir "$OUTPUT_DIR"
		if [[ $? -ne 0 ]]; then
			echo -e "\n# Error: output directory cannot be created."
			exit 27
		fi
	else 
		if [[ $RESETDIR -eq 1 ]]; then
			  rm -rf "$OUTPUT_DIR"
			  mkdir "$OUTPUT_DIR"
				if [[ $? -ne 0 ]]; then
					echo -e "\n# Error: output directory cannot be created."
					exit 27
				fi	  
		fi
	fi
}

function _validate_proxy_option() {
if [[ ! -z "$PROXY" || ! -z "$PROXY_CRED" ]]; then
	if [[ $(echo -n $PROXY | grep -E '^(http|https):\/\/(.*):[0-9]{1,5}$') = "" ]]; then 
		echo -e "\n# Error: Illegal HTTP/HTTPS proxy configuration or no proxy specified."
		exit 25
	else
		if [[ ! -z "$PROXY_CRED" ]]; then
			if [[ $(echo -n $PROXY_CRED | grep -E '^(.*):(.*)$') = "" ]]; then
				echo "\n# Error: Illegal proxy credential format" 
				exit 26
			else
				PROXY_USERNAME=$(echo -n $PROXY_CRED|cut -d \: -f 1)
				PROXY_PASSWORD=$(echo -n $PROXY_CRED|cut -d \: -f 2)
				#Using insecure SSL as the proxy certificate maybe self signed
				PROXY="-k -x \"$PROXY\" -U $PROXY_USERNAME:$(_rawurlencode $PROXY_PASSWORD)"
			fi
		else
			#Using insecure SSL as the proxy certificate maybe self signed
			PROXY="-k -x \"$PROXY\""
		fi
	fi
fi
}

function _validate_df_options() {

	if [[ $USERNAME = "USERNAME" || $PASSWORD = "PASSWORD" ]]; then
				echo -e "\n# Error: No credential specified. Use -u and -p options."
				_usage
				exit 24
	fi

	if [[ $INTERACTIVE -eq 1 ]]; then
		if [[ ! -z "$ALLOWED_FORMAT" || ! -z "$ALLOWED_FEED" || ! -z "$ALLOWED_BEHAVIOUR" ]]; then
			echo -e "\n# Error: -d|-f|-b options cannot be specified in interative mode [-i]\n"
			exit 22
		fi

	else

		if [[ -z "$ALLOWED_FORMAT" || -z "$ALLOWED_FEED" ]]; then
				echo -e "\n# Error: You should specify -d and -f options\n"
				_usage
				exit 22
		else 
			if [[ ( "$DF" = "adv_ip_reputation" || "$DF" = "adv_url_reputation" ) && -z "$ALLOWED_BEHAVIOUR" ]]; then 
				echo -e "\n# Error: You should specify -b options when $DF is selected\n"
				_usage
				exit 22
			fi
			if [[ ( ! ( "$DF" = "adv_ip_reputation" || "$DF" = "adv_url_reputation") ) &&  ! -z "$ALLOWED_BEHAVIOUR" ]]; then 
				echo -e "\n# Error: -b options can be specified only if adv_<ip|url>_reputation datafeed is selected! [ $DF ]\n"
				_usage
				exit 22
			fi
		fi
		
		if [[ "$DF" = "adv_ip_reputation" || "$DF" = "adv_url_reputation" ]] ; then
			DATAFEED_ID_TEMP_1=$(echo ${ALLOWED_FORMAT[@]} ${ALLOWED_FEED[@]}|tr ' ' '\n'|sort|uniq -d)
			DATAFEED_ID_TEMP=$(echo ${DATAFEED_ID_TEMP_1[@]} ${ALLOWED_BEHAVIOUR[@]}|tr ' ' '\n'|sort|uniq -d)
		else 
			DATAFEED_ID_TEMP=$(echo ${ALLOWED_FORMAT[@]} ${ALLOWED_FEED[@]}|tr ' ' '\n'|sort|uniq -d)
		fi

		case $DATAFEED_TYPE in
			0) DATAFEED_ID=$(echo ${DATAFEED_ID_TEMP[@]} ${DATAFEED_ID_NOSCAP[@]}|tr ' ' '\n'|sort|uniq -d) 
		   	if [[ -z "$DATAFEED_ID" ]]; then
		   			if [[ "$DF" = "adv_ip_reputation" || "$DF" = "adv_url_reputation" ]]; then 
		   				echo -e "\n# Error: Datafeed $DF is not availanle in $DF_F format for $DF_B behaviour!\n"
		   			else 
		   				echo -e "\n# Error: Datafeed $DF is not availanle in $DF_F format!\n"
		   			fi
		   			exit 23
		   		fi
		   		;;
			1) DATAFEED_ID=$(echo ${DATAFEED_ID_TEMP[@]} ${DATAFEED_ID_SCAP[@]}|tr ' ' '\n'|sort|uniq -d) 
				if [[ -z "$DATAFEED_ID" ]]; then
		   			if [[ "$DF" = "adv_ip_reputation" || "$DF" = "adv_url_reputation" ]]; then 
		   				echo -en "\n# Error: Datafeed $DF is not available in $DF_F format for $DF_B behaviour"
		   			else 
		   				echo -en "\n# Error: Datafeed $DF is not availanle in $DF_F format"
		   			fi
		   			if [[ $DATAFEED_TYPE -eq 1 ]]; then
		   				echo -e " for SCAP Datafeed!\n"
		   			else 
		   				echo ""
		   			fi
		   			exit 23
		   		fi
		   		;;
			*) echo -e "\n# Error: Invalid DATAFEED_TYPE selected!\n" 
			   exit 23
			   ;;
		esac
	fi
}

function _validate_range_option() {
	if [[ $LATEST_FILES -eq 1 && ! -z "$RANGE" ]]; then
		echo -e "\n# Error: -L and -r options cannot be specified together!\n"
		exit 30
	else
		if [[ ! -z "$RANGE"  ]]; then
			if [[ "$RANGE" =~ ^([0-9]+)-([0-9]+)$ ]]; then 
					D_START=${BASH_REMATCH[1]}
					D_END=${BASH_REMATCH[2]}
			else 
				echo -e "\n# Error:  Invalid range specified! [ $RANGE ]\n"
				exit 29
			fi
		fi
	fi
}

function _validate_latestn_option() {
	if [[ $LATEST_FILES -eq 1 && ! -z "$RANGE" ]]; then
		echo -e "\n# Error: -L and -r options cannot be specified together!\n"
		exit 30
	else
		if [[ ! -z "$LATEST_N"  ]]; then
			if [[ "$LATEST_N" =~ ^([0-9]+)$ ]]; then 
					D_LATEST_N=${BASH_REMATCH[1]}
			else 
				echo -e "\n# Error:  Invalid latest_n specified! [ $LATEST_N ]\n"
				exit 28
			fi
		fi
	fi
}

function _datafeed_login() {
	local username=$1;
	local password=$2;

#Getting all Datafeed available for the selected account
if [[ ! -z "$CURL_VERBOSE" ]]; then
	_echo "######################################################"
	_echo "#            BEGIN curl verbose output               #"
	_echo "######################################################" 
	curl $CURL_VERBOSE $PROXY -s $SSL_OPT -A "$USER_AGENT" -H "Accept:" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://symantec.com/GetCustomerDataFeedList\"" -d "$(echo "$GetCustomerDataFeedList" |sed "s/__USERNAME__/$username/g" |sed "s/__PASSWORD__/$password/g")" ${DATAFEED_PROXY}/Datafeed.asmx > "$WORKING_DIR/${PREFIX}_DataFeedList.out" 2>> "$LOG_FILE"
	_echo "######################################################"
	_echo "#             END curl verbose output                #"
	_echo "######################################################"
else
	curl $PROXY -s $SSL_OPT -A "$USER_AGENT" -H "Accept:" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://symantec.com/GetCustomerDataFeedList\"" -d "$(echo "$GetCustomerDataFeedList" |sed "s/__USERNAME__/$username/g" |sed "s/__PASSWORD__/$password/g")" ${DATAFEED_PROXY}/Datafeed.asmx > "$WORKING_DIR/${PREFIX}_DataFeedList.out"
fi

if [[ $? -ne 0 ]]; then
	_echo "# curl cannot connect to Deepsight Datafeeds Webservices URL."
	_echo "# Exiting."
	exit 11
fi

#If no sessionID is returned , authentication has failed
if [[ $(cat "$WORKING_DIR/${PREFIX}_DataFeedList.out" |tr '>' '\n'|grep '</SessionId'|sed 's/<\/SessionId//g') = "" ]]; then 
	_echo "# Authentication Failed!"
	_echo "# Exiting."
	exit 12
else 
	SESSIONID=$(cat "$WORKING_DIR/${PREFIX}_DataFeedList.out"|sed 's/.*<SessionId>\(.*\)<\/SessionId>.*/\1/')
fi

}

function _datafeed_get_feedfile_list() {
	local sessionid=$1;
	local datafeed_id=$2;
	if [[ ! -z "$CURL_VERBOSE" ]]; then
		_echo "######################################################"
		_echo "#            BEGIN curl verbose output               #"
		_echo "######################################################" 
		curl $CURL_VERBOSE $PROXY -s $SSL_OPT -A "$USER_AGENT" -H "Accept:" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://symantec.com/GetFeedFileList\"" -d "$(echo "$GetSequenceNumber" |sed "s/__SESSIONID__/$sessionid/g" |sed "s/__DATAFEEDTYPEID__/$datafeed_id/g")" ${DATAFEED_PROXY}/Datafeed.asmx > "$WORKING_DIR/${PREFIX}_SequenceNumber.out" 2>> "$LOG_FILE"
		_echo "######################################################"
		_echo "#             END curl verbose output                #"
		_echo "######################################################"
	else
		curl $PROXY -s $SSL_OPT -A "$USER_AGENT" -H "Accept:" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://symantec.com/GetFeedFileList\"" -d "$(echo "$GetSequenceNumber" |sed "s/__SESSIONID__/$sessionid/g" |sed "s/__DATAFEEDTYPEID__/$datafeed_id/g")" ${DATAFEED_PROXY}/Datafeed.asmx > "$WORKING_DIR/${PREFIX}_SequenceNumber.out"	
	fi

	if [[ $? -ne 0 ]]; then
		_echo "# curl cannot connect to Deepsight Datafeeds Webservices URL."
		_echo "# Exiting."
		exit 11
	fi
}

function _datafeed_get_feedfile() {
	local sessionid=$1;
	local datafeed_id=$2;
	local sequence_number=$3;
	if [[ ! -z "$CURL_VERBOSE" ]]; then
		_echo "######################################################"
		_echo "#            BEGIN curl verbose output               #"
		_echo "######################################################" 
		curl $CURL_VERBOSE $PROXY -s $SSL_OPT -A "$USER_AGENT" -H "Accept:" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://symantec.com/GetFeedFile\"" -d "$(echo "$GetFeedFile" |sed "s/__SESSIONID__/$sessionid/g" |sed "s/__DATAFEEDTYPEID__/$datafeed_id/g"|sed "s/__DATAFEEDSEQUENCENUMBER__/$sequence_number/g")" ${DATAFEED_PROXY}/Datafeed.asmx > "$WORKING_DIR/${PREFIX}_$sequence_number.xml" 2>> "$LOG_FILE"
		_echo "######################################################"
		_echo "#             END curl verbose output                #"
		_echo "######################################################" 
	else
		curl $PROXY -s $SSL_OPT -A "$USER_AGENT" -H "Accept:" -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction: \"http://symantec.com/GetFeedFile\"" -d "$(echo "$GetFeedFile" |sed "s/__SESSIONID__/$sessionid/g" |sed "s/__DATAFEEDTYPEID__/$datafeed_id/g"|sed "s/__DATAFEEDSEQUENCENUMBER__/$sequence_number/g")" ${DATAFEED_PROXY}/Datafeed.asmx > "$WORKING_DIR/${PREFIX}_$sequence_number.xml"
	fi
	
	if [[ $? -ne 0 ]]; then
		_echo "# curl cannot connect to Deepsight Datafeeds Webservices URL."
		_echo "# Exiting."
		exit 11
	fi
	
	FILE_SN=$(cat "$WORKING_DIR/${PREFIX}_$sequence_number.xml" | tr -d '\n' | sed 's/.*<SequenceNumber>\(.*\)<\/SequenceNumber>.*/\1/')
	FILE_TYPE=$(cat "$WORKING_DIR/${PREFIX}_$sequence_number.xml" | tr -d '\n' | sed 's/.*<FileType>\(.*\)<\/FileType>.*/\1/')
	FILE_SIZE=$(cat "$WORKING_DIR/${PREFIX}_$sequence_number.xml" | tr -d '\n' | sed 's/.*<Size>\(.*\)<\/Size>.*/\1/')
	FILE_LM=$(cat "$WORKING_DIR/${PREFIX}_$sequence_number.xml" | tr -d '\n' | sed 's/.*<LastModified>\(.*\)<\/LastModified>.*/\1/')
	FILE_H=$(cat "$WORKING_DIR/${PREFIX}_$sequence_number.xml" | tr -d '\n' | sed 's/.*<Hash>\(.*\)<\/Hash>.*/\1/')

}


#
# MAIN start
#

# Options validation
_validate_df_options
_validate_proxy_option
_validate_logging_option
_validate_directory_option
_validate_latestn_option
_validate_range_option


_echo "######################################################"
_echo "###    DeepSight Datafeed Client for Bash v$VERSION     ###"
_echo "######################################################"
if [[ $(which curl) = "" || $(which unzip) = "" || $(which base64) = "" ]]; then
	_echo "# Dependency check failed!!!"
	_echo "# curl|unzip|base64 were not detected on your system."
	_echo "# install these components to run the script."
	_echo "# Exiting."
	exit 10
fi

if [[ ! -d "$OUTPUT_DIR" ]]; then
	mkdir "$OUTPUT_DIR"
fi

_echo "# Starting WebServices call to DeepSight."

_echo "# Authenticating to Deepsight WebServices"


_datafeed_login $USERNAME $PASSWORD

_echo "# Getting Datafeeds Available for your account."

#Estracting Datafeed ID and Datafeeds Name from the SOAP response
ID=($(cat "$WORKING_DIR/${PREFIX}_DataFeedList.out" | tr '>' '\n'|grep '</Id'|sed 's/<\/Id//g'| tr '\n' ' '))
NAME=($(cat "$WORKING_DIR/${PREFIX}_DataFeedList.out" | tr '>' '\n'|grep '</Name'|sed 's/<\/Name//g'| tr ' ' '_' | tr '\n' ' '))

#Building associative array to store the results
for i in $(seq 0 $((${#NAME[@]}-1))); do
	feed[${ID[$i]}]=${NAME[$i]}; 
done

#Removing temporary file
rm "$WORKING_DIR/${PREFIX}_DataFeedList.out"

while true; do
	_echo "# The following Datafeeds are available in your account:"
	for key in $(echo "${!feed[@]}"); do
		 _echo -e "\t - $key - ${feed[$key]//_/ }";
	done
	_echo -n "# Select the Datafeed you want to download: "
	_read DATAFEED_ID
	if [[ ${ID[@]} =~ $DATAFEED_ID ]]; then
		if [[ $LOG2FILE -eq 1 ]]; then
			_echo "$DATAFEED_ID"
		fi
		break
	else 
		if [[ $INTERACTIVE -eq 0 ]]; then 
			echo "# Error: Datafeed $DF is not available in your account!"
			exit 14
		fi
	fi
done 


#Getting latest sequence number for the selected datafeed
_echo "# Getting ${feed[$DATAFEED_ID]//_/} Datafeed file list."
while [[ true ]]; do
	
	_datafeed_get_feedfile_list $SESSIONID $DATAFEED_ID

	if [[ ! -z $(cat "$WORKING_DIR/${PREFIX}_SequenceNumber.out"|grep "Session Expired") ]]; then
		_echo -e "\n# Warning: Session Expired. Re-Authentcating"
		_datafeed_login $USERNAME $PASSWORD
	else
		break
	fi
done

#Storing Datafeed files attributes: SequenceNumber, Last Modified and Size
DF_FILE_SN=($(cat "$WORKING_DIR/${PREFIX}_SequenceNumber.out" | tr '>' '\n'|grep '</SequenceNumber'|sed 's/<\/SequenceNumber//g'| sed 's/^ *//g' |tr '\n' ' '))
DF_FILE_SN_MAX=$(echo ${DF_FILE_SN[@]}|tr ' ' '\n'|sort|tail -1)


#Removing temporary file
rm "$WORKING_DIR/${PREFIX}_SequenceNumber.out"

#Creating output directory
if [[ ! -d "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}" ]]; then
	mkdir "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}"
fi

#Checking if we are continuing the download 
if [[ ! -z "$RANGE" ]]; then
	_echo "# Warning: range mode detected. Ignoring SEQ file."
	if [[ $D_END -gt $DF_FILE_SN_MAX ]]; then
		_echo "# Warning: $DF_FILE_SN_MAX is the latest feed sequence number [ $D_END was specified ]"
		DF_FILE_SN_D=($(seq $D_START $DF_FILE_SN_MAX))
	else
		DF_FILE_SN_D=($(seq $D_START $D_END))
	fi
else 
	if [[ ! -e "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}.seq" ]]; then 
		_echo "# This appears to be the first run of $0."
		DF_FILE_SN_D=(${DF_FILE_SN[@]})
	else
		FILE_TO_SKIP=$(echo ${DF_FILE_SN[@]}|tr ' ' '\n'|grep -n $(cat "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}.seq")|cut -d \: -f 1)
	
		if [[ $FILE_TO_SKIP = "" ]]; then
			   FILE_TO_SKIP=0
		fi
	
		DF_FILE_SN_D=($(echo "$(echo ${DF_FILE_SN[@]}| tr ' ' '\n'|tail -$(( ${#DF_FILE_SN[@]} - $FILE_TO_SKIP )))"))	
	fi
fi

# Reputation datafeed do not provide a list of files available to download. We have to generate it one.
if [[ $DF =~ (.*_reputation) && $LATEST_FILES -eq 1 && $DF_FILE_SN_MAX -gt $D_LATEST_N ]]; then 
	DF_FILE_SN_D=($(seq $(($DF_FILE_SN_MAX - $D_LATEST_N + 1)) $DF_FILE_SN_MAX))
	_echo "# ${#DF_FILE_SN_D[@]} file/s to download."
else
	if [[ $DF =~ (.*_reputation) && $LATEST_FILES -eq 1 && $DF_FILE_SN_MAX -le $D_LATEST_N ]]; then 
		_echo "# Argument passed to -L option exceeds max SN. Downloading latest $DF_FILE_SN_MAX files! [ $D_LATEST_N ]"
		DF_FILE_SN_D=($(seq 1 $DF_FILE_SN_MAX))
	else
		if [[ $LATEST_FILES -eq 1 && $D_LATEST_N -le $DF_FILE_SN_MAX ]]; then 
			_echo "# Flag -L specified downloading only latest $D_LATEST_N files/s out of ${#DF_FILE_SN_D[@]} total file/s."
			DF_FILE_SN_D=($(echo "$(echo ${DF_FILE_SN[@]}| tr ' ' '\n'| tail -r -$D_LATEST_N)"))
		else
			_echo "# ${#DF_FILE_SN_D[@]} file/s to download."
		fi
	fi
fi


if [[ ${#DF_FILE_SN_D[@]} -ne 0 ]]; then
	_echo -en "# Downloading file/s to "
	_echo -en "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}"
	_echo -en " folder. Please wait...\n"
else
	_echo "Nothing to do here."
	_echo "Exiting."	
fi

for i in $(echo "${!DF_FILE_SN_D[@]}"); do
	while [[ true ]]; do
		
		#Resetting variable
		FILE_TYPE="";
		FILE_SN="";
		FILE_LM="";
		FILE_SIZE="";
		FILE_H="";

		#Getting the Datafeed file
		_datafeed_get_feedfile $SESSIONID $DATAFEED_ID ${DF_FILE_SN_D[$i]}
		if [[ ! -z $(cat "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.xml"|grep "Session Expired") ]]; then
			_echo $(cat "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.xml")
			_echo -e "\n# Warning: Session Expired. Re-Authenticating"
			_datafeed_login $USERNAME $PASSWORD
		else
			break
		fi
	done	
	_echo -e "\t - File Type: $FILE_TYPE - SequenceNumber: $FILE_SN - Last Modified: $FILE_LM - File Size: $(_tokilomega $FILE_SIZE) - File Hash: $FILE_H"
		
	#Extracting Base64 blob
	cat "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.xml" | tr -d '\n' | sed 's/.*<File>\(.*\)<\/File>.*/\1/' > "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.out"
	
	if [[ -s "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.out" ]]; then 
		#Decoding base64 blob
		base64 --decode -i "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.out" > "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.zip"
	
		#Unzip the compressed archive
		if [[ ! -z "$(which 7za)" ]]; then
				7za e "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.zip" -o"$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}" -y > /dev/null
		else
				unzip -o -qq "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.zip" -d "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}";
				ZIP_EXIT_CODE=$?
			
				if [[ $ZIP_EXIT_CODE -ne 0 ]]; then
					_echo -e "# Warning: unzip was not able to extract the file. Consider installing 7z utility."
					_echo -e "# Warning: moving zip file into $OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}"
					cp "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.zip" "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}"
   		    	fi
		fi

		# Removing temporary files
		rm "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.xml" "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.out" "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.zip"

		#Saving sequence numbers
		echo "${DF_FILE_SN_D[$i]}" > "$OUTPUT_DIR/${feed[$DATAFEED_ID]//_/}.seq"
	
	else
		_echo "# Warning: File sequence number $FILE_SN returned an empty file. Skipping it."
		# Removing temporary files
		rm "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.xml" "$WORKING_DIR/${PREFIX}_${DF_FILE_SN_D[$i]}.out"
	fi
done

_echo -e "# Script execution finished!"

exit 0
