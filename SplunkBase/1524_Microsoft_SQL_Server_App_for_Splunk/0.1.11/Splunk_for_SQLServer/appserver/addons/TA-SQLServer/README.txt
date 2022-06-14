Configuring SQL Server Auditing for Microsoft SQL Server 2008R2 / 2012
======================================================================

The TA-SQLServer (actually the Splunk_TA_windows) transmits the audit information from an SQL Server
via the Windows Event Log to Splunk.  The Splunk_for_SQLServer includes props and transforms necessary
to decode the audit log generated.

To configure the SQL Server Audit Logging, perform the following walkthrough on the SQL Server:

Step 1: Find the Service Credentials for your SQL Service

    * Start the Services Control Panel
    * Find the SQL Server service for the instance you wish to monitor.
    * Right-click and select Properties.
    * Click on the Lon On tab.
    * Note down the username being used to run the service.  This is the service account.
    
Step 2: Grant the SQL Service instance permission to write to the Security Log

    * Start the secpol.msc control panel.
    * Browse to Security Settings -> Local Policies -> User Rights Assignment
    * Find the "Generate Security Audits" policy.
    * Right-click and select Properties.
    * Click on Add User or Group...
    * Enter the service account from step 1.
    * If needed, click on Locations and select the local server instead of the domain.
    * Click on Check Names (the user will be underlined), then click on OK.
    * Click on OK to close the policy window.
    * Close the secpol.msc control panel.
    * Run the following command as Administrator:
    
        auditpol /set /subcategory:"application generated" /success:enabled /failure:enable
        
    * Start the Registry Editor (regedit)
    * Browse to HKEY_LOCAL_MACHINE\System\CurrentControlSet\services\eventlog\Security
    * Right-click on the Security node and select Permissions...
    * Click on Add...
    * Enter the service account from step 1.
    * If needed, click on Locations and select the local server instead of the domain.
    * Click on Check Names (the user will be underlined), then click on OK.
    * Highlight the just-added name and check Allow Full Control.
    * Click on OK.
    * Close the registry editor.
    * Use the Services control panel to restart the SQL Server, or reboot the server.
    
Step 3: Prepare Your Security Log for increased activity

    * Open the Event Viewer.
    * Browse to Windows Logs -> Security.
    * Right-click on Security and select Properties.
    * Select Overwrite events as needed (oldest events first).
    * Set a suitable size on the Maximum Log Size (for example, 2Gb).
    * Click on OK.
    * Close the Event Viewer.
    
Step 4: Create an Audit Destination Object

    * Open Microsoft SQL Management Studio and connect to the instance you wish to monitor
    * In the Object Explorer, select your server and expand Security
    * Right-click on Audits and select "New Audit..."
    * In the Audit Name field, enter a suitable name (for example "WinEventLog-Security")
    * In the Audit Destination field, select Security Log.
    * Click on OK.
    * Expand the Audits folder.
    * Right-click on your audit destination object and select "Enable Audit"
    * Note the successful completion and then click on Close.
    
If you do not have successful completion, stop here.  Something went wrong.  It is best to
engage an SQL Server expert to diagnose the problem.
    
Step 5: Create an Audit Specification

In this audit specification, we will record logons.

    * Open the Microsoft SQL Management Studio and connect to the instance you wish to monitor
    * In the Object Explorer, select your server and expand Security
    * Right-click on Server Audit Specifications and select "New Server Audit Specification..."
    * Give your audit specification a suitable name (for example, ServerLogonAudit)
    * In the Audit field, select the audit destination you created in Step 4.
    * In Row 1, select Audit Action Type=FAILED_LOGIN_GROUP.
    * In Row 2, select Audit Action Type=SUCCESSFUL_LOGIN_GROUP.
    * Click on OK to save the Server Audit Specification.
    * Expand the Server Audit Specifications folder.
    * Right-click on your server audit specification object and select "Enable Server Audit Specification".
    * Note the successful completion and then click on Close.
    
You should now see WinEventLog:Security events in Splunk with EventCode=33205.

If performing this function on a CLUSTER, then you must do Steps 2-3 on every cluster member.

