App for McAfee Web Gateway

   Version: 4.0.9

   Date: 3 June 2022

    1. About
    2. Where to install this App
    3. Quick Start
    4. Get Data In
    5. Overview of Sourcetypes and Log Formats
    6. Configure a custom log format (mcafee:webgateway:custom) on MWG
    7. Install this App
    8. Upgrade from 3.07
    9. Configuration examples

          * Local file monitor
          * Local UDP/TCP input
          * Syslog UDP/TCP
          * Syslog TCP+TLS
          * UF
          * Log pushing from MWG to a log server
          * Log pulling from MWG
          * Log pulling from WGCS
          * Disable rsyslog/journald rate-limiting
          * Syslog-NG configuration

   10. Detailed description of the mcafee:webgateway:custom Log Format
   11. Next Steps
   12. Troubleshooting
   13. Summary of changes
   14. Contributors, Attributions
   15. Copyright
   16. Disclamer
   17. Contact, Support and Feedback

  About

   This Splunk App for McAfee Web Gateway allows rapid insights and operational visibility into McAfee Web Gateway (MWG) and McAfee Web Gateway Cloud Service (WGCS) deployments. It provides field
   extraction and CIM field mapping using all available types of access logs (default and custom McAfee Web Gateway log, McAfee Web Gateway Cloud Service), facilitates fast incident response and
   troubleshooting.

   List of abbreviations used in this document:

   Abbreviation             Meaning
   MWG          McAfee Web Gateway
   WGCS         McAfee Web Gateway Cloud Service
   UF           Splunk Universal Forwarder

   Product Compatibility:

   Product      Version(s)
   Splunk  6.6+, 7.x, 8.x
   MWG     7.6+, 8.x, 9.x, 10.x
   WGCS    API v 5 (current)

   Currently there are 85 different charts and tables grouped in 22 views

   Applications
       Applications by Hits
       Applications by Volume
       Top Blocked Applications by Hits
       Top Applications by Volume
       Top Applications by Hits
       Top Application Statistics
   Audit
       Failed Logins
       Activity by Action
       Activity by Source_Type
       Activity by User
       User Activity by Appliance
   Authentication
       Top IP by Failed Auth
       Top User-Agents by Failed Auth
       Top Destination Hosts by Failed Auth
       Top User-Agents + IPs by Failed Auth
       Top User-Agents + DestHost by Failed Auth
       Top IPs + DestHost by Failed Auth
       Top IPs + User-Agent + DestHost by Failed Auth
       Multiple Logins from diff IPs
       Multiple Usernames coming from a single IP
       Authentication Method Statistics
   Connections
       Long running transactions
   DNS
       Timechart DNS resolution time
       Timechart DNS resolution time distribution (including Cached)
       Timechart DNS resolution time distribution (excluding Cached)
       DNS distribution (1ms - 200ms)
       DNS distribution (all)
   Errors
       Error Analysis
   HTTP
       Timechart HTTP Method
       HTTP Method Statistics
       HTTP Request Headers Statistics
       HTTP Response Headers Statistics
   Easy Search
       Status Code Overview
       Web Usage by URL Category
       Web Usage by URL Category Area Graph
       Top User-Agents
       Users + IPs
       IP Addresses by Hits Graph
       Top Hosts by Hits
       Top Blocked Domains by Hits
       Top Rules by Hits
       Events
   Malware
       Malware
       Top Users by blocked Malware
   Media Types
       Media Types
       Top Media Types by Volume
       Top Media Types by Hits
       EXE Uploads/Downloads
       Macro Uploads/Downloads
       EXE and Macro Uploads/Downloads with Magic Bytes Mismatch
       Encrypted Files
   Network
       Top unreachable Servers
   Performance
       Connect to Server Latency
       Total Transaction Duration distribution
       Client-Side Latency
       DNS resolution Latency distribution
       Time in Externals Distribution
   Protocols
       Protocols by Hits
       Protocols by Hits (Percent)
       Protocols by Volume
       Protocols by Volume (Percent)
   Potential Risks
       Top SRC with high Ratio of High Risk Requests
       Unusual Ports
       Requests to IP Addresses
       CONNECT Requests to IP Addresses
       Very long URLs
       Very large request and response Headers
       Non-resolvable Domains, potential DGA (Domain Generation Algorithm)
   Rules
       Top Rules
       Block Rules Overview
       Top Block Rules
       Rule Complexity/Performance
       Slowest Rule Execution
       Time in Rule Engine Distribution
       Time in Rule Engine over Time
   Security Posture
       Content Scan is possible Ratio
   SSL
       SSL Versions by Hits (Server)
       SSL Versions by Hits (Client)
       SSL Ciphers by Hits (Server)
       SSL Ciphers by Hits (Client)
       SSL KeyExchangeBits by Hits (Server)
       SSL KeyExchangeBits by Hits (Client)
       SSL Ciphers (Server)
       SSL Versions (Server)
       Client Certificate Requested
       SSL-related blocks
       Expired Certificate
       Certificate Issuers
   Summary
       Requests / Block Ratio
       Traffic Overview
   Traffic
       Top Inbound Traffic by Source
       Top Inbound Traffic by Destination
       Top Outbound Traffic by Source
       Top Outbound Traffic by Destination
   Uploads
       Uploads
   URL Filter
       URL Categories
       Blocked by URL Filter or by Web Reputation
       Top URL Categories by Volume
       Top URL Categories by Hits
       Geolocation Stats
       High Risk Destinations
       Not categorized Domains - Chart
       Top not categorized Domains - Table
   User-Agents
       User-Agent Statistics

  Where to install this App

   +---------------------------------------------------------------------------------------------------------+
   |                  Instance                  | App for McAfee Web Gateway | Add-on for McAfee Web Gateway |
   |--------------------------------------------+----------------------------+-------------------------------|
   | Standalone (all-in-one) Splunk             | +                          | -                             |
   |--------------------------------------------+----------------------------+-------------------------------|
   | Search Head                                | +                          | -                             |
   |--------------------------------------------+----------------------------+-------------------------------|
   | Indexer                                    | -                          | +                             |
   |--------------------------------------------+----------------------------+-------------------------------|
   | Syslog/Log Server with Universal Forwarder | -                          | +                             |
   +---------------------------------------------------------------------------------------------------------+

  Quick Start

    Install Splunk directly on MWG and configure it to monitor local log folder:

    1. Configure a custom log format (mcafee:webgateway:custom) on MWG
    2. Install Splunk on the same MWG
    3. Install Splunk App for McAfee Web Gateway on Splunk
    4. CLI: Allow Splunk to read splunk.log: setfacl -m u:splunk:rx /opt/mwg/log/user-defined-logs
    5. Configure a local file monitor

   Step-by-step walkthrough: https://youtu.be/96oRco3MTu0

    Configure MWG to send logs via TCP to Splunk

    1. Configure a custom log format (mcafee:webgateway:custom) on MWG
    2. Configure MWG to send events via UDP/TCP
    3. Install Splunk App for McAfee Web Gateway on Splunk
    4. Configure Splunk network input to accept logs from MWG

   Step-by-step walkthrough: https://youtu.be/vYy6ddpGkNw

  Get Data In

   MWG can write logs to hard disk or/and send them via Syslog. Splunk can read log files locally, get them via network input (Syslog or raw UDP/TCP steam) or get them from a UF that is installed
   on a log server or on MWG itself. All these methods combined produce many possible ways to get MWG logs into Splunk:

   Method / Link to configuration example                                      Description                                             Real time
   Local file monitor                     Splunk is installed directly on MWG and monitors the log file folder                  Yes, up to 30 sec delay
   Local UDP/TCP input                    Splunk is installed directly on the MWG and gets log files sent using Syslog          yes
   Syslog UDP/TCP                         MWG sends logs via UDP/TCP to syslog collector or directly to Splunk                  yes
   Syslog TCP+TLS                         MWG sends logs via TCP, encrypted with TLS, to syslog collector or directly to Splunk yes
   UF                                     Install UF on MWG to monitor log file folder                                          yes, up to 30 sec delay
   Log pushing from MWG to a log server   Use pushing (FTP/FTPS/SCP/SFTP/HTTP/HTTPS) from MWG to a log server                   no
   Log pulling from MWG                   Pulling logs from MWG via API, scp or rsync                                           no
   Log pulling from WGCS                  Pulling logs via WGCS API                                                             no

   Further consideration:

     * Local input (monitor local log files) is a simplest method used for testing or in small environments.
     * Syslog UDP is usually not recommended because of the potential packet loss.
     * If possible, install the syslog collector/server in the same VLAN/Network as MWG. Avoid unreliable links (WiFi/WAN), Firewall (especially with DPI/IDS) between MWG and the syslog collector.
     * For large environments Splunk doesn't recommend sending syslog directly to Splunk indexers, and suggests using an intermediate syslog server instead.
     * McAfee doesn't support installing UF directly on MWG, but it can be a better option in some situations.
     * For large environment use one of Splunk's validated architecture designs.
     * For more details like syslog collector location, UDP vs TCP etc. read https://splunk-connect-for-syslog.readthedocs.io/en/v1.82.1/architecture.html
     * HOWTO: Configure a McAfee Web Gateway (MWG) syslog to send TLS-secured data to Splunk https://youtu.be/-nSkYdDQA00
     * HOWTO: Splunk App for McAfee Web Gateway (MWG) - send logs to Splunk - step by step configuration: https://youtu.be/vYy6ddpGkNw

  Overview of Sourcetypes and Log Formats

   There are several possible log formats that can be used. Compare your logs with example below to find out the current format.

                                                       Average
                                         # of   # of  log line
 Log Format          Sourcetype          MWG    CIM    length                                                                                                                                                                                                                          Comment/Example
                                        fields fields  (HTTPS
                                                       Scanner
                                                      enabled)
Default                                               ~700      Default log format with a fixed structure, provides only minimal subset of fields. Use it only if no MWG modification is possible.
Access Log    mcafee:webgateway:default 14     17     Bytes
                                                                [26/Feb/2021:14:40:23 +0100] "" 192.168.2.n 200 "GET https://example.com/test&adk=1473563476 HTTP/2.0" "Web Ads" "Minimal Risk" "image/gif" 286 538 "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0" "" "0" "Google"
Legacy Log                                                      Customized log format with a fixed structure, provides more fields than the default log, including some timings and transferred bytes. Wasteful information like User-Agent string is shortened. Consider it obsolete.
for the       MWGaccess3                26     27     ~650
Splunk App                                            Bytes     [26/Feb/2021:14:40:23 +0100]status="200/0" srcip="192.168.2.n" user="" profile="-" dstip="-" dhost="example.com" urlp="443" proto="HTTPS/https" mtd="GET" urlc="Web Ads" rep="0" mt="image/gif" mlwr="-" app="Google" bytes="538/539/289/286" ua="FF86.0-10.0" lat="0/0/59/434" rule="Last Rule" url="https://example.com/test&adk=1473563476"
v.3.0.7
Custom Log                                            ~600-1800 New custom modular log format (described in details below), logs fields can be added/removed as needed, provides full CIM coverage and deep insights for analytics and rapid troubleshooting. Despite the significantly larger amount of provided information, the size of the log has changed insignificantly. This new format provides up to 3x higher information density than the default log format.
(recommended) mcafee:webgateway:custom  50-100 50-100 Bytes
                                                                2021-02-26 14:40:23 +0100 204 allowed 192.168.2.n https GET example.com 443 775/58 88/1 up="/test" ua="FF86-10.0" a="Google" c="wa" dip=142.250.185.nn kex=112/112 cntx sccc=1302/1302 sslp=1.3/1.3 sslicn="GTS CA 1O1,GlobalSign" sslcn="example.com" crtdays=-66 ctmt0 rul="L" rn=13/44 srcp=63298 conrt=0 b=744/239 psrcip=192.168.2.n psrcp=20010 piv=2.0/2.0 r=0 t=0/0/86/87/56/56/3/4/28
                                                                WGCS log format provides a subset of required fields
WGCS version  mcafee:webgateway:wgcs_v5 28     28     ~300-400
5                                                     Bytes     "user_id","username","source_ip","http_action","server_to_client_bytes","client_to_server_bytes","requested_host","requested_path","result","virus","request_timestamp_epoch","request_timestamp","uri_scheme","category","media_type","application_type","reputation","last_rule","http_status_code","client_ip","location","block_reason","user_agent_product","user_agent_version","user_agent_comment","process_name","destination_ip","destination_port"
                                                                "-1","142.250.185.nn","142.250.185.nn","GET","206","1040","example.com","/test","OBSERVED","","1626329868","2021-07-15 06:17:48","https","Business, Software/Hardware","application/x-empty","","Minimal Risk","Internal Request handled","200","8.65.16.n","","","Other","","","","78.47.250.n","443"

  Configure a custom log format (mcafee:webgateway:custom) on MWG

    1. Extract the file Splunk_Log_XXXXXX.xml (where XXXXXX is the version) from the MWG folder of the application package.

    2. Import Splunk_Log_XXXXXX.xml file in MWG into the Default Log Handler: Policies > Rule Sets > Log Handler, right click on "Default" and select Add > Rule Set from Library

    3. In the new window that appears, click on the "Import from file" button, then choose the xml file and click OK.

    4. click "Auto-Solve Conflicts..." > select "Solve by referring to existing objects" and click OK to import the RuleSet.

    5. If some of the imported RuleSets/Rules marked red - that means some properties like Header.Request.GetAll (available on MWG 10.x+) are not available in the current MWG version. Just delete
       such rules or upgrade MWG to the latest 10.x+ version. If a TLS RuleSet shown red, it needs to be modified as described below in the Troubleshooting section.

    6. The Log configuration has a modular structure, you can choose to send just a preconfigured minimal set of fields or select any subset from available fields. The log ruleset contains several
       parts (see numbering on the next screenshot):

         1. Required rulesets for CIM conformed logging.
         2. Web Data Model ruleset where a log line from the previously prepared fields are built.
         3. Additional rulesets where other fields are added as needed.
         4. DEBUG ruleset helps to verify that the log lines built correctly.
         5. Write Splunk.log - final log line modifications, performance monitoring of the Splunk ruleset itself and writing the Splunk log to the hard disk.
         6. Send via Syslog.
         7. RuleSet Library - optional templates that can to be copied into appropriate Policy Rule Sets (Opener, Media Type Filter etc.) to be able to get information that is usually not available
            in the logging cycle.

       Here are most important modifications that you can do in additional Rulesets (block of RuleSets #3 on the previous screenshot).

           Ruleset                                                                                 Possible modifications
       Splunk          Domains not to log - some domains can be excluded from logging completely.
       Set Timestamp   choose the right timestamp. The ISO format with a time zone is selected by default. Other options are ToGMT, ISO8601, unix epoch and ToWebReporter formats. If you change the
                       timestamp format on MWG then you have to adjust the TIME_FORMAT setting in local/props.conf on Splunk Indexer.
       Client IP       Connection.IP property is used by default. Deselect it and select Client.IP if you have downstream proxies or loadbalancer between the client and MWG.
       URL Categories  add internal domains to "internal Domains" list to avoid them to being shown as "uncategorized"
       Headers         on MWG older than version 10.x some rules will be marked in red if they are not compatible - delete them or upgrade MWG to the newest 10.x version or later.
       TLS             disable this ruleset if HTTPS Scanner is not enabled
       -               To get the correct Rule statistics you must create one last ruleset with a rule named "Last Rule" which is applied to all cycles (Request, Response, Embedded).
       RuleSet Library Opener, Hashes/Body, Malware, Media Type, Uploads - to get some of the required information, additional rules need to be placed in the corresponding Policy Rule Sets. If you
                       skip this step, some tables and graphs will be empty. Watch a YouTube video on the Splunkbase for step by step instructions.

       Create a "Last Rule Set" with an empty "Last Rule" as a most bottom rule in the Rule Sets Tree:
       Copy Rules to Certification Verification Rule Set to be able to log information about certification parameters:

  Install this App

   Install this App via "Manage Apps" menu. Upgrade from 3.07

    1. Create a backup of MWG config, export MWG Log Rules, backup your current app.
    2. Check if there are any custom changes in the old MWG Log Rules or in the app.
    3. Check which sourcetype is currently used - MWGaccess3 or "default". MWGaccess3 works with new version without any changes, the "default" is named "mcafee:webgateway:default".
    4. Upgrade an App via GUI or CLI.
    5. Follow the installation instructions for version 4.x.x.
    6. It is recommended to switch from default or MWGaccess3 to new mcafee:webgateway:custom log format.

  Configuration examples

     * Local file monitor

         1. MWG UI: Configure a custom log format (mcafee:webgateway:custom)
         2. CLI: Allow Splunk to read splunk.log: setfacl -m u:splunk:rx /opt/mwg/log/user-defined-logs
         3. Splunk UI: Settings > Data inputs > Files & directories > New local File & Directory
         4. Browser to or type in: /opt/mwg/log/user-defined-logs/splunk.log/splunk.log
         5. press Next
         6. Sourcetype: Select > mcafee:webgateway:custom
         7. App Context: McAfee Web Gateway
         8. Host: Constant value
         9. Index: leave on "Default" or create a new index, for example "proxy"
        10. Press Preview and review options
        11. Press Submit

     * Local UDP/TCP input

       Instead of letting Splunk read local splunk.log, events can be sent to a local Splunk instance via a local network interface or even loopback interface, without writing events to the hard
       disk (i.e. "Write Splunk Log" Rule Set can be disabled).

       MWG UI:

         1. Configure a custom log format (mcafee:webgateway:custom) on MWG, enable "Send via Syslog" RuleSet, optionally disable "Write Splunk Log" RuleSet.
         2. Modify rsyslog.conf: Configuration > File Editor > [Hostname] > rsyslog.conf

               * Find the following line *.info;mail.none;authpriv.none;cron.none /var/log/messages and modify it to *.info;daemon.!=info;mail.none;authpriv.none;cron.none -/var/log/messages.
               * Add $template msg_only,"%msg%\n". On old MWG versions following line could be required instead: $template msg_only,"%msg:2:$%\n"
               * Add daemon.info @@hostname-or-IP-address-of-the-local-MWG:6514;msg_only. Modify the port as needed. Alternatively use daemon.info @@127.0.0.1:6514;msg_only
               * Add $MaxMessageSize 100k
               * Add $SystemLogRateLimitInterval 0
               * Add $SystemLogRateLimitBurst 0
               * Add $imjournalRatelimitInterval 0
               * Add $imjournalRatelimitBurst 0
               * More information: https://kc.mcafee.com/corporate/index?page=content&id=KB77988

         3. Verify that the syslog prefix is "mwg" unter Configuration > Appliances > Syslog > Log Prefix

       Splunk UI:

         1. Splunk UI: Settings > Data inputs > TCP > New Local TCP
         2. Port: a port from a previous step, for example 6514
         3. Press Next
         4. Sourcetype: Select > mcafee:webgateway:custom
         5. App Context: McAfee Web Gateway
         6. Host Method: IP or DNS
         7. Index: leave on "Default" or create a new index, for example "proxy"
         8. Press Preview and review options
         9. Press Submit

     * Syslog UDP/TCP

       MWG UI:

         1. Configure a custom log format (mcafee:webgateway:custom) on MWG, enable "Send via Syslog" RuleSet, optionally disable "Write Splunk Log" RuleSet.
         2. Modify rsyslog.conf: Configuration > File Editor > [Hostname] > rsyslog.conf

               * Find the following line *.info;mail.none;authpriv.none;cron.none /var/log/messages and modify it to *.info;daemon.!=info;mail.none;authpriv.none;cron.none -/var/log/messages.
               * Add $template msg_only,"%msg%\n". On old MWG versions following line could be required instead: $template MYFORMAT,"%msg:2:$%\n"
               * Add daemon.info @@hostname-or-IP-address-of-the-remote-splunk:6514;msg_only. Modify the port as needed.
               * Add $MaxMessageSize 100k
               * Add $SystemLogRateLimitInterval 0
               * Add $SystemLogRateLimitBurst 0
               * Add $imjournalRatelimitInterval 0
               * Add $imjournalRatelimitBurst 0
               * More information: https://kc.mcafee.com/corporate/index?page=content&id=KB77988

         3. Verify that the syslog prefix is "mwg" unter Configuration > Appliances > Syslog > Log Prefix

       Splunk UI:

         1. Settings > Data inputs > TCP > New Local TCP
         2. Port: a port from a previous step, for example 6514
         3. Press Next
         4. Sourcetype: Select > mcafee:webgateway:custom
         5. App Context: McAfee Web Gateway
         6. Host Method: IP or DNS (if Splunk can resolve IP address of MWG)
         7. Index: leave on "Default" or create a new index, for example "proxy"
         8. Press Preview and review options
         9. Press Submit

     * Syslog TCP+TLS

       TLS Support was added in MWG 8.x (?)
       Additionally to the previous example, add following lines to rsyslog.conf using MWG UI (modify as needed):

 $DefaultNetstreamDriver gtls
 $DefaultNetstreamDriverCAFile /etc/rsyslog.d/certs/example.com.ca.pem
 $DefaultNetstreamDriverCertFile /etc/rsyslog.d/certs/mwg.example.com.pem
 $DefaultNetstreamDriverKeyFile /etc/rsyslog.d/certs/mwg.example.com.key

 #$ActionSendStreamDriverAuthMode x509/name
 $ActionSendStreamDriverAuthMode anon
 #$ActionSendStreamDriverPermittedPeer splunk.example.com
 $ActionSendStreamDriverMode 1

       For Splunk configuration and more details watch Configure a McAfee Web Gateway (MWG) syslog to send TLS-secured data to Splunk
     * UF

         1. MWG UI: Configure a custom log format (mcafee:webgateway:custom) on MWG, let "Send via Syslog" RuleSet disabled
         2. CLI: Allow Splunk to read splunk.log: setfacl -m u:splunk:rx /opt/mwg/log/user-defined-logs
         3. Install UF on MWG
         4. Install Add-on for McAfee Web Gateway (https://splunkbase.splunk.com/app/5452/)
         5. Create a file /opt/splunkforwarder/etc/apps/TA_McAfee_Web_Gateway/local/inputs.conf with following content (modify as needed):

   [monitor:///opt/mwg/log/user-defined-logs/splunk.log/splunk.log]
   disabled = false
   sourcetype = mcafee:webgateway:custom
   # index = proxy


         6. Create an outputs.conf, limits.conf, etc. configuration as needed.

     * Log pushing from MWG to a log server

         1. MWG UI: Configure a custom log format (mcafee:webgateway:custom) on MWG, let "Send via Syslog" RuleSet disabled
         2. MWG UI: Policy > Settings > Engines > File System Logging > Splunk Log > Settings for Rotation, Pushing and Deletion > Enable specific settings for user defined log:

               * Configure Auto Rotation as needed
               * Configure Auto Deletion as needed
               * Configure Auto Pushing: enable auto pushing, set destination server, enable pushing log files directly after rotation

         3. On a receiving log server: use Splunk file monitor or UF

     * Log pulling from MWG

         1. MWG UI: Configure a custom log format (mcafee:webgateway:custom) on MWG, let "Send via Syslog" RuleSet disabled
         2. Using a script, API or other method pull logs from MWG to Splunk

     * Log pulling from WGCS

       McAfee Web Gateway Cloud Service (WGCS) provides the log with a reduced set of fields, therefore only a subset of views will work properly.

       There are several ways to pull WGCS logs:

          * Use Logging Client: https://success.myshn.net/MVISION_Cloud_for_Unified_Cloud_Edge/Unified_Cloud_Edge_Logging_Client/Download_and_install_the_Logging_Client
          * Configure log pulling using a shell or PowerShell script https://community.mcafee.com/t5/Web-Gateway-Cloud-Service/Sending-WGCS-logs-to-on-premise-Splunk/td-p/622784
          * Use McAfee Content Security Reporter (CSR) to download WGCS logs, configure post-processing to move processed log files to some directory and use Universal Forwarder to monitor this
            directory.

     * Disable rsyslog/journald rate-limiting

       McAfee Web Gateway based on RedHat/CentOS 7 and inherits some settigs that rate-limit syslog. Read https://www.ibm.com/support/pages/how-disable-rsyslog-rate-limiting and
       https://access.redhat.com/solutions/1417483 to modify or disable rate-limiting in /etc/rsyslog.conf (using MWG UI) and /etc/systemd/journal.conf .

       rsyslog.conf (after "$ModLoad imjournal" line):

 $SystemLogRateLimitInterval 0
 $SystemLogRateLimitBurst 0
 $imjournalRatelimitInterval 0
 $imjournalRatelimitBurst 0


       journal.conf:

 RateLimitInterval=0
 RateLimitBurst=0

       Instead of disabling rate-limiting completely, it is better to set it to appropriate values for your setup.
     * Syslog-NG configuration

       Use following configuration for syslog-ng (on receiving side):

 network
 flags(no-parse)

  Detailed description of the mcafee:webgateway:custom Log Format

       Why a new log format? Neither the default nor the previously used MWGaccess3 log formats provide enough information for SIEM to be useful. For example these formats provide very limited
       information about download/upload risky files. Many SIEM correlation rules will not work properly if a transferred file was embedded as a part of a composite object (zip, iso, docx, etc.) or
       has different/faked media-type header or extension.

       The new log format provides following use cases among many others:

          * Even if a transaction was allowed, detect all potentially dangerous objects and log their true media-type, hash and size.
          * Even if a transaction was white-listed and not checked for the Web-Reputation and URL-Categorization - this checks are performed in the Log Cycle after the transaction was completed and
            the log event will contain them.
          * DNS lookup of dest_host if there is more than one IP, reverse DNS lookup of URL.Destination.IP allow to detect fast-flux C&C Servers.

       The new custom log format (mcafee:webgateway:custom) consists of several parts:

          * Timestamp
          * Fixed set of fields: status, action, client_ip, url_protocol, http_method, dest, dest_port, bytes_out/bytes_in, duration/response_time. These fields have no field prefix - Splunk
            extract them based on the log structure.
          * Variable set of fields: they are included in log only if they are enabled AND exist. For example, a URL path will not be included for this URL: https://www.example.com/. These fields
            have either a short field prefix (for example up=) or consist of a single string (i.e. "tunnel") and can exist in any part of the log line, their order is not important. Any of the
            variable fields can be enabled and disabled on the MWG at any time, without need to modify anything on the Splunk side. You can enable conditional logging for these fields, for example
            a query string can be logged only for some subset of categories, certificate information (Issuer, Common Name, Subject Alternative Names etc.) - only for suspicious transactions etc.

       2021-02-26 14:36:46.449 -0600 200 allowed 192.168.2.n https GET safebrowsing.googleapis.com 443 563/4156 38/17 up="/v4/threatListUpdates" ua="FF86-10.0" c="it" dip=142.250.185.n kex=112/112
       cntx sccc=1302/1302 sslp=1.3/1.3 sslicn="GTS CA 1O1,GlobalSign" sslcn="upload.video.google.com" crtdays=-52 mbmismatch ctmt0 rul="L" rn=41/104 srcp=62407 conrt=0 b=524/4418 tunnel
       psrcip=192.168.2.nn psrcp=42550 piv=2.0/2.0 r=0 t=0/0/34/34/18/18/22/11/11

       Instead of logging a URL as-is, MWG splits the URL into usable parts which will be put together on Splunk's end.

       By default, the query string is not logged. You can enable it in the Web Data Model ruleset if needed.

       An excerpt of the 100 most useful fields is provided below. MWG has about 900 properties that can be used for logging.

    Description of logged fields

                           MWG field                               CIM field                                                              Comment
                                                                                       Property                                   Example                         TIME_FORMAT / Comment
                                                                                       DateTime.ToISOString                       2010-03-22 11:45:12)            %Y-%m-%d %H:%M:%S
                                                                                       DateTime.ToISOString with Milliseconds     2010-03-22 11:45:12.123         %Y-%m-%d %H:%M:%S.%3N
                                                                                       DateTime.ToISOString with Milliseconds and 2010-03-22 11:45:12.123 -0600   %Y-%m-%d %H:%M:%S.%3N %z
                                                                                       timezone
       Timestamp                                         -                             DateTime.ToISOString and timezone          2010-03-22 11:45:12 -0600       %Y-%m-%d %H:%M:%S %z
                                                                                       DateTime.ToGMTString                       Mon, 22 March 2010 11:45:36 GMT %a, %d %B %Y %H:%M:%S %Z
                                                                                       DateTime.ToISO8601String                   2016-01-26T11:45:36.695Z        this time format can produce
                                                                                                                                                                  unexpected output, don't use it
                                                                                       DateTime.ToNumber                          Unix epoch time - 1512915182    %s
                                                                                       DateTime.ToWebReporterString               [29/Oct/2010:14:28:15 +0000]    \[%d/%b/%Y:%H:%M:%S %z\]
       Connection.IP / Client.IP                         src                           Client.IP takes the value of X-Forwarded-For header
       Authentication.UserName                           user
       Message.TemplateName, Block.ID,
       Response.StatusCode, Protocol.FailureDescription, action                        The action taken by the proxy: allowed, blocked, error or auth. Various MWG properties are used to calculate
       BytesFromServer, Command.Name,                                                  correct action field.
       Action.Names
       URL                                               url                           Don't enable it, Splunk build URL based on uri components
       URL.Categories                                    category                      MWG will try to categorize URL retroactively even if URL Filter was skipped in the Policy Rule Sets. Add your
                                                                                       internal domains to "internal Domains" list to avoid them be marked as "uncategorized"
       Header.Response.Get(Content-Type)                 http_content_type             The content-type of the requested HTTP resource as reported by the web server (can be wrong, faked or missing)
       MediaType.FromHeader
       Header.Request.Get(User-Agent)                    http_user_agent               A short string (FF68-10.0 for Firefox 68 on Windows 10)
       LastSentLastReceivedServer                        response_time                 FSFRS-LSFRS+LSLRS is used to calculate response_time that includes sending time
       Header.Request.Exists(Referer)                    http_referrer                 The HTTP referrer used in the request. The W3C specification and many implementations misspell this as
                                                                                       http_referer. Use a FIELDALIAS to handle both key names. This field is disabled by default.
       URL.Domain of Header.Request.Exists(Referer)      http_referer_domain           The domain name contained within the HTTP referrer used in the request. Disabled by default.
                                                                                       The HTTP response code indicating the status of the proxy request. MWG doesn't distinguish between status sent
       Response.StatusCode                               status                        by web server and status set by proxy, so this value can be misleading. Use action field to see what the proxy
                                                                                       action was.
       URL.Protocol                                      -                             http/https/ftp etc. Used to re-build url
       Command.Name                                      http_method                   GET/POST/PUT/OPTIONS etc
       URL.Host                                          dest                          The host of the requested resource
       URL.Port                                          dest_port                     The port of the requested resource
       BytesToServer                                     bytes_out                     The number of outbound bytes transferred
       BytesFromServer                                   bytes_in                      The number of inbound bytes transferred
       TimeInTransaction                                 duration                      The time taken by the proxy event, in milliseconds
       URL.Path                                          uri_path                      The path of the resource served by the webserver or proxy
       URL.ParametersString                              uri_query                     Not enabled by default. You can enable it for all requests or selectively
       Application.Name                                  App                           The application detected or hosted by the server/site such as WordPress, Splunk, or Facebook
       Cache.Status eq TCP_HIT                           cached                        Indicates whether the event data is cached or not. Not enabled by default.
       Header.Get(Cookie)                                cookie                        The cookie file recorded in the event. Not enabled by default.
                                                                                       It is important to record the destination IP at the moment of the request. A hostname can be resolved to
       URL.Destination.IP                                dest_ip                       several IPs (think "moving target" CDN) so a DNS resolution a second later can lead to wrong result. Be aware
                                                                                       that MWG can be unable to do DNS resolution by itself and it can be a different IP after all if MWG is behind
                                                                                       upstream proxies.
       URL.Domain                                        url_domain                    The domain name contained within the URL of the requested HTTP resource. It is extracted from hostname based
                                                                                       on Public Suffix List
       Header.Request.GetAll                             -                             Returns a concatenated string of all the original request headers (separated by \r\n) as received from client.
       Header.Response.GetAll                            -                             Returns a concatenated string of all the original response headers (separated by \r\n) as received from
                                                                                       server.
       Header.Request.Get(Via)                           -                             Via header in request
       Header.Response.Get(Via)                          -                             Via header in response
       Header.Response.Get(Location)                     -                             Location header in response
       Client.KeyExchangeBits                            -                             Normalized strength (symmetric) of the weakest link during the key exchange. Helps to detect outdated client
                                                                                       software
       Server.KeyExchangeBits                            -                             Normalized strength (symmetric) of the weakest link during the key exchange. Helps to detect outdated servers
                                                                                       which required special handling
       Server.Handshake.CertificateIsRequested           -                             True, if the web server requests a client certificate (during the initial SSL handshake) [*]
       ClientContext.IsApplied                           -                             A clue if HTTPS Scanner is enabled for this request
       Server.Cipher                                     -                             Description of cipher/algorithms between proxy and server (e.g. ECDHE-RSA-AES256-GCM-SHA384)
       Client.Cipher                                     -                             Description of cipher/algorithms between client and proxy (e.g. ECDHE-RSA-AES256-GCM-SHA384)
       SSL.Server.Protocol                               -                             SSL/TLS protocol used between proxy and server (e.g. TLSv1.2 TLSv1.1 TLSv1.0 SSLv3.0 unknown).
       SSL.Client.Protocol                               -                             SSL/TLS protocol used between client and proxy (e.g. TLSv1.2 TLSv1.1 TLSv1.0 SSLv3.0 unknown)
       SSL.TransparentCNHandling                         -                             true for ssl connections where the CN is not known until the server handshake is done
       Server.CertificateChain.Issuer.CNs                ssl_issuer_common_name        The issuer common names of the certificate chain (bottom-up including the self-signed root CA, empty without
                                                                                       certificate verification) [*]
       SSL.Server.Certificate.CN                         ssl_subject_common_name       The common name of the server certificate [*]
       Server.Certificate.SHA2-256Digest                 ssl_hash                      The hex-encoded sha2-256 digest of the server certificate [*]
       Server.Certificate.AlternativeCNs                 -                             This list stores all alternative subject names stored in the server certificate's extensions section [*]
       Server.Certificate.DaysExpired                    ssl_end_time                  Stores how many days the server certificate is expired. Negative values mean that it is still valid [*]
       DNS.Lookup(URL.Host)                              -                             List of IP addresses of URL.Host if there are more than one.
       DNS.Lookup.Reverse(URL.Destination.IP)            -                             List of hostnames for the destination IP. Very often it does not equal the requested hostname
       Body.NumberOfChildren                             -                             Number of embedded objects for archive or document [*]
       Body.NestedArchiveLevel                           -                             The current archive level, used to calculate the max level of the embedded object [*]
       IsCompositeObject                                 -                             True, if current file is composite (archive or office document) [*]
       Body.IsEncryptedObject                            -                             True, if current object is encrypted
       Antimalware.Proactive.Probability                 -                             Malware probability value
                                                         used for:
       Antimalware.Infected                              file_name                     True, if virus was found, false otherwise
                                                         file_hash
       Antimalware.VirusNames                            signature                     List of names of found viruses
       Application.Reputation                            -                             reputation of the application
       Authentication.Method                             authentication_method         authentication method (NTLM, Kerberos, etc.)
       Authentication.Realm                              -                             authentication realm (i.e. AD directory name)
       Authentication.UserGroups                         -                             User Groups, can be filtered with "Authentication UserGroups to log" list
       Authentication.FailureReason.Message              signature (?)                 Human readable authentication failure reason description
       Authentication.Failed                             action (in Authentication DM) It is true if credentials were provided but the authentication has failed
       Cache.IsCacheable                                 -                             True, if the response is cacheable and web cache is enabled
       Cache.Status                                      -                             TCP_HIT for a web cache hit, TCP_MISS_RELOAD for a miss, TCP_MISS_VERIFY if the data in the cache was
                                                                                       outdated, TCP_MISS_BYPASS for bypass based on I/O load
       Cache.IsFresh                                     -                             True, if the response is validated or not read from web cache
       MagicBytesMismatch                                -                             True, if Mime Type from header doesn't match to detected Mime Type [*]
       EnsuredTypes                                      -                             List of Mime Types detected by signatures (with high probability of detection)
       NotEnsuredTypes                                   -                             List of Mime Types detected by signatures (with low probability of detection)
       IsMediaStream                                     -                             Determine if current transaction is media stream
       StreamDetector.Probability                        -                             Probability value for media stream detection
       StreamDetector.MatchedRule                        -                             Returns name of matched streaming detection rule
       Rules.CurrentRule.Name                            -                             The name of the currently evaluated rule
       Rules.EvaluatedRules                              -                             List of all IDs of rules/rule sets, which have been evaluated
       Rules.FiredRules                                  -                             List of all IDs of rules/rule sets, where the condition was true
       Proxy.IP                                          -                             Stores the Webgateway IP
       Proxy.Port                                        -                             Stores the Webgateway port
       Client.ProcessName                                -                             Stores the process name that initiated the connection, e.g. provided by MCP
       Client.SystemInfo                                 -                             Client System Information (provided by MCP)
       DNS.Lookup.Reverse(client_ip)                     src_ip                        Hostname of the client
       Connection.Protocol                               -                             The protocol that the client uses to communicate with the proxy (HTTP, HTTPS, FTP, IFP, SSL, ICAP, XMPP, TCP
                                                                                       or SOCKS)
       Connection.Port                                   src_port                      Stores the port of the client
       Connection.RunTime                                -                             Connection run time (current time minus start time) in seconds
       BytesFromClient                                   -                             Number of bytes received from the client for this request
       BytesToClient                                     -                             Number of bytes sent to the client for this request
       Tunnel.Enabled                                    -                             True, if a HTTP or HTTPS tunnel was enabled - the server response bypassed the response cycle
       Proxy.Outbound.IP                                 -                             Stores the IP which is used as the Outbound Source IP by Webgateway when connecting to onward server
       Proxy.Outbound.Port                               -                             The port which is used as the source port by Webgateway when connecting to onward server
       ProtocolAndVersion                                -                             protocol and version of the request/response (HTTP/1.1, HTTP/2.0)
       Error.ID                                          -                             ID of error
       Error.Message                                     -                             Name of error
       URL.Reputation                                    severity (?)                  Returns the web reputation value for the current URL. Range is from -127 to 127, where -127 means 'Minimal
                                                                                       Risk' and 127 means 'High Risk'.
                                                                                       Returns the geolocation of the current URL. The geolocation is the code of the country in which the webserver
       URL.Geolocation                                   -                             is located, that hosts the requested resource. The country code is given in ISO 3166 notation. Note: The
                                                                                       setting "Disable local GTI database" must be enabled in the URL Filter settings; otherwise this property is
                                                                                       not filled.
       TimeInRuleEngine                                  -                             Milliseconds currently spent in rule engine. If used in log handler, time consumed by the rule engine from
                                                                                       start to the end of a transaction
       FirstSentFirstReceivedServer
       LastSentLastReceivedServer
       FirstReceivedFirstSentClient                      -                             Time between first byte sent to server and first byte returned from server in milliseconds etc...
       LastReceivedLastSentClient
       LastSentFirstReceivedServer
       HandleConnectToServer                             -                             Time to connect to a server in milliseconds
       ResolveHostNameViaDNS                             -                             Time to resolve a host name via DNS
       TimeInExternals                                   -                             Milliseconds currently spent waiting for external responses, e.g. from AV scanner, domain controller for NTLM
                                                                                       authentication or URL cloud categorization

          * [*] - requires a rule(s) from Splunk Log Template > RuleSet Library be placed in the corresponding Policy Rule Set to make these properties available in the logging cycle.

  Next steps

          * Modify "index_and_sourcetype" macro to include an index (i.e. 'index=proxy AND sourcetype="mcafee:webgateway:custom"') to speed up searches
          * Install Splunk Common Information Model (CIM) App and build accelerated Data Model
          * Rewrite searches to use tstats to benefit from accelerated DM
          * Install Splunk Security Essentials or Splunk Enterprise Security

  Troubleshooting

          * Has the corresponding MWG Logging RuleSet been imported?
          * Are some charts and tables empty? - Check that the required fields and values are collected by the Splunk Rule Set in the Logging Cycle, activate them as needed.
          * Does a "Last Rule" exist on the MWG?
          * Were supplement rules copied in the Policy Rule Sets?
          * Does Splunk get any input?
          * Does a search for sourcetype=mcafee:* OR sourcetype=MWGaccess3 output raw events?
          * Does Splunk recognize the timestamp correctly?
          * If sent via Syslog - was the Syslog header part correctly removed?
          * Are there any errors in $SPLUNK_HOME/var/log/splunk/splunkd.log?
          * Problem: Events are not parsed correctly because there is a space before the timestamp. Solution: modify the log template on MWG to $template msg_only,"%msg:2:$%\n"
          * Problem: Imported Splunk RuleSet has some RuleSets marked red - some properties like Header.Request.GetAll are available only on new MWG versions (10+) and rules containing such
            "unknown" properties will be marked red if imported on older MWG versions. Just delete such rules or upgrade MWG to the newest 10+ version.

            If a TLS Ruleset shown red, modify it as following (delete a second condition "SSL.Server.Certificate.SignatureMethod is not in list null" and replace it with
            "SSL.Server.Certificate.SignatureMethod is not in list Safe Signature Algorithms". Safe Signature Algorithms is a McAfee supplied list that should be already present in recent MWG
            versions:

            If the list "Safe Signature Algorithms" is not present, create it as following:
          * Problem: Rule value is empty therefore Rule Statistics doesn't work on MWG 11.0-11.0.2. Answer: this is a bug in Map.GetStringValue function that was fixed in MWG 11.1, please update
            your MWG or temporarely disable Log Handler > Splunk > Rules > "Rules.CurrentRule.Name (short if exists in Rule Map)" rule.

  Summary of changes

          * 4.0.11 - added a lookup of excutables that can be used for download and exfiltration (https://lolbas-project.github.io/). Fixed a TIME_PREFIX for wgcs_v5
          * 4.0.10 - fixed extraction of authentication_method, authentication_realm, auth_failure_message and auth_failure_id fields (Thank you ML!)
          * 4.0.9 - improved WGCS regexes, now URL, rule name and User-Agent fields that contains quote character(s) are parsed correctly. Improved a TIME_PREFIX to fix parsing errors. New CIM fields added. Added distsearch.conf to enable replication of macros.
          * 4.0.8 - added sc_admin role to default.meta
          * 4.0.7 - support for MWG audit log, a feedback form, a new auth method statistics view
          * 4.0.6 - better README with more examples, global export in default.meta, MWG Log has autorotation/autodeletion enabled in case it was not enabled globally
          * 4.0.5 - added parsing of McAfee Web Gateway Cloud Service (WGCS) Logs
          * 4.0.4 - applied required changes to keep compatibility with Splunk Cloud (use jquery 3.5), improved documentation, minor fixes
          * 4.0.3 - added Security Posture view, minor fixes
          * 4.0.2 - improved Error Analysis view, minor fixes
          * 4.0.1 - new major release, new log format, better documentation, new views: SSL, Errors, Uploads
          * 3.0.7 - commit changes in props.conf and transform.conf by Myron Davis, add contributors section in README, clarifications for installation process in README
          * 3.0.6 - enabled Splunk CIM (Common Information Model) version 4, by Myron Davis, compatibility with Splunk App for Enterprise Security, by Myron Davis, renamed App folder from
            AppForMcAfeeWebGateway to McAfeeWebGateway to match it with the app ID
          * 3.0.5 - The App package now includes a step-by-step installation instruction with screenshots, the log structure was reordered to avoid overwriting of parameters
          * 3.0.4 - new short log format, many redundant fields removed, cleanup, faster search, some panels were merged. This major version isn't compatible with the version 2.xx

  Contributors/Attributions

          * Thanks to Myron Davis for a lot of suggestions, enabling CIM, compatibility for Enterprise Security App
          * Thanks to Simon B.
          * Thanks to the McAfee Community Forum

  Copyright

       This App, documentation and MWG logging ruleset are licensed under Creative Commons BY-ND 3.0

  Disclamer

          * Test anything before using in production.
          * All you do with this App is on your own responsibility.

  Contact, Support and Feedback

          * E-Mail: splunk@compek.net
          * Splunk Answers
