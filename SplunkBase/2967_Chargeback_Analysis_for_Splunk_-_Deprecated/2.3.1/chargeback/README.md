The Chargeback App is intended to calculate maintenance and yearly run rates for Splunk.    

If you are running Splunk in a medium to large environment, you are probably sharing Splunk with other groups.  In many places, this results in one group running Splunk as a service for any number of internal customers.  The challenge then becomes sharing the maintenance and run costs of the infrastructure.  As a Splunk administrator, I would have to run several long-running searches to try and figure out the costs.  This App should put all of that to rest.


Changes to Splunk:
You will need to create a new summary index "index_utilization_summary":

        [index_utilization_summary]
        coldPath = $SPLUNK_DB/index_utilization_summary/colddb
        homePath = $SPLUNK_DB/index_utilization_summary/db
        maxTotalDataSizeMB = 512000
        thawedPath = $SPLUNK_DB/index_utilization_summary/thaweddb

This index will contain the daily sum of data consumption by index.  This index is used to:
        Help you quickly visualize your index utilization 
        Run predictive analysis over long periods of time 
        Determine where there have been utilization violations by Index

To back fill this summary index, run the following command from the bin directory on one of your search heads:

        ./splunk cmd python fill_summary_index.py -app chargeback -name "Index Utilization by Index" -et -30d@d -lt now -owner admin


Installation:
This App only needs to be installed on the License Server or Search Head, there is no need to install it on the indexers. The requirement to install the summary index is documented above.

Some Installation Lessons Learned:
If you need to install the App on a Search Head that is not a License Server, you will have to add the License Server as a distributed search peer to the Search Head.  This is the only way to be able to run licenser REST API command from a non-license master node.  

If you are running in an environment that has this App installed on multiple Search Heads, be sure to disable the saved search for summary indexing from all but one Search Head.  

Configuration:
For first time configurations, build your customers.csv file with the following search command. This will overwrite the lookup file if one already exists!  This search command will insert some default values, which you must change.  It will also attempt to set micro_lic_GB by looking at the largest volume of index usage and then rounding up.

        | rest /services/data/indexes 
        | dedup title 
        | search NOT title=_* NOT title=*summary* 
        | rename title AS idx 
        | fillnull value=0 storage_size_override_hot_warm storage_size_override_cold 
        | fillnull value=100 percent_ownership 
        | fillnull value=UNDEF group 
        | fillnull value=email@yourdomain.com owner_email 
        | join idx
            [ search index=index_utilization_summary startdaysago=30
            | stats max(total_volume) AS micro_lic_GB by idx
            | eval micro_lic_GB=ceil(micro_lic_GB)] 
        | table group, idx, micro_lic_GB, percent_ownership, storage_size_override_hot_warm, storage_size_override_cold, owner_email
        | outputlookup customers.csv

After you run the command above, 
        1) Fill in the appropriate group.
        2) Adjust the micro_lic_GB as needed.
        3) To account for an index that is owned by multiple groups, add new lines for each group.  Be sure to have the same micro_lic_GB values for al of them, or it will not be calculated properly. Then adjust the group and percent_ownership for each line.
        4) Determine if you need to override the automated storage calculations. 
        5) Define the email address(es) to be notified when the Micro License is violated.  A comma separated list will work.

To update the customers.csv lookup file, use the "Lookup File Editor App for Splunk Enterprise" App to make this extremely easy. It is not required; you can edit the file manually if you like.

        https://splunkbase.splunk.com/app/1724/

The App also uses the Sankey Diagram Custom Visualization, which requires that you install this App:

        https://splunkbase.splunk.com/app/3112/

Below are the definitions of each field name in customers.csv for your reference.

Column Headers - DO NOT ALTER THE NAME OF THE COLUMN HEADERS:

        group, idx, micro_lic_GB, percent_ownership, storage_size_override_hot_warm, storage_size_override_cold, and owner_email

        group - These are the different departments that you are providing Splunk as a service to. They are your customers.

        idx - These are the indexes that you have configured and will account for the cost associated with. Match the names exactly and include all of them that are not internal or summary indexes. Internal indexes begin with an underscore and summary indexes should have "summary" in their name.

        micro_lic_GB - This is the maximum daily data volume in GBs that your customer is going to use per index. It can be thought of as a "Micro License", but has no impact on internal Splunk licensing. This is used to calculate the total cost to the customer. This number is always the same, even if more than one group shares an index (use the total). This is also used as a threshold for alerting against groups that use more than their allocated share of the license.

        percent_ownership - When more than one group shares an index, this is the percentage of ownership assigned to each group. The total percent_ownership across all groups must equal 100.

        storage_size_override_hot_warm</strong> - Manual override for hot/warm total storage size.  Use this if you only reference time when configuring indexes in indexes.conf.

        storage_size_override_cold</strong> - Manual override for cold total storage size.  Use this if you only reference time when configuring indexes in indexes.conf.

        owner_email - A comma separated list of email addresses to be notified when the Micro License is violated.

More about the App:
There is a single dashboard for this App with several tabs.  The form filters at the top will effect all of the tabs.  Below, each tab will be explained.


Customer Costs:
This dashboard breaks out the total charges for license maintenance and storage costs.  It then combines them, so that you can send you customers an itemized bill.  

I think that it is worth taking a look deeper at the calculations used to drive all of the numbers.  Below is the search used to drive almost all of the dashboard panels.  I have inserted comments to explain what is going on.  However, you will not be able to run this search if you copy and paste it in Splunk unless you remove the comments, which are not compatible with SPL:

      
      ### Rest call provides information about your configured indexes
      ### Rename the index field so that you can join the data in customers.csv
      ### "max=0" allows for multiple groups to share the same index, and assume a percentage of ownership
      ### The dedup accounts for the csv being read multiple times in a Search head Cluster environment
      ### To zoom in a particular group, select it from the dropdown menu 

      | rest /services/data/indexes splunk_server=*
      | rename title as idx 
      | join type=outer max=0 idx [| inputlookup customers.csv]
      | dedup group idx percent_ownership 
      | search group=$group|s$

      ### We are setting the variables from the form and calculating "Years Retention"

      | eval license_rate          = $license_rate$
      | eval hot_warm_storage_rate = $hot_warm_storage_rate$
      | eval cold_storage_rate     = $cold_storage_rate$
      | eval rep_factor            = $rep_factor$
      | eval "Years Retention"     = round(frozenTimePeriodInSecs/31536000,2)

      ### We must pad all numbers that start with a decimal point with a zero, or Splunk will think it is a string.
      | rex field=max_lic_GB mode=sed "s/^(\.)/0./g"

      ### The search results return many fields that are in MBs, we want to convert them to GBs and rename the fields   
      | foreach *MB [ eval &lt;&lt;MATCHSTR&gt;&gt;GB = '&lt;&lt;FIELD&gt;&gt;' / 1024 ]
      
      ### Next are determining what the hot_warm_conf value is, or more specifically the "hot/warm bucket configuration".  
      ### We are then determining what the cold_conf value is, or more specifically the "cold bucket configuration".
      ### This is not a simple matching of field names, since setting certain values to 0 makes them unlimited.  
      ### Read the indexes.conf documentation on Splunk's website for detailed information about each parameter.
      ### Below is an excerpt from that documentation, highlighting the configuration parameters used in this calculation:
         
        # homePath.maxDataSizeMB = <nonnegative integer>
        # * Specifies the maximum size of homePath (which contains hot and warm
        #   buckets).
        # * If this size is exceeded, Splunk will move buckets with the oldest value
        #   of latest time (for a given bucket) into the cold DB until homePath is
        #   below the maximum size.
        # * If this attribute is missing or set to 0, Splunk will not constrain the
        #   size of homePath.
        # * If we freeze buckets due to enforcement of this policy parameter, and
        #   coldToFrozenScript and/or coldToFrozenDir archiving parameters are also
        #   set on the index, these parameters *will* take into effect
        # * Defaults to 0.
        # * Highest legal value is 4294967295
        # 
        # coldPath.maxDataSizeMB = <nonnegative integer>
        # * Specifies the maximum size of coldPath (which contains cold buckets).
        # * If this size is exceeded, Splunk will freeze buckets with the oldest value
        #   of latest time (for a given bucket) until coldPath is below the maximum
        #   size.
        # * If this attribute is missing or set to 0, Splunk will not constrain size
        #   of coldPath
        # * If we freeze buckets due to enforcement of this policy parameter, and
        #   coldToFrozenScript and/or coldToFrozenDir archiving parameters are also
        #   set on the index, these parameters *will* take into effect
        # * Defaults to 0.
        # * Highest legal value is 4294967295
        #
        # maxDataSize = <positive integer>|auto|auto_high_volume
        # * The maximum size in MB for a hot DB to reach before a roll to warm is triggered.
        # * Specifying "auto" or "auto_high_volume" will cause Splunk to autotune this parameter (recommended).
        # * You should use "auto_high_volume" for high-volume indexes (such as the main
        #   index); otherwise, use "auto".  A "high volume index" would typically be
        #   considered one that gets over 10GB of data per day.
        # * Defaults to "auto", which sets the size to 750MB.
        # * "auto_high_volume" sets the size to 10GB on 64-bit, and 1GB on 32-bit systems.
        # * Although the maximum value you can set this is 1048576 MB, which corresponds to 1 TB, a reasonable 
        #   number ranges anywhere from 100 to 50000.  Before proceeding with any higher value, please seek
        #   approval of Splunk Support.
        # * If you specify an invalid number or string, maxDataSize will be auto tuned.
        # * NOTE: The maximum size of your warm buckets may slightly exceed 'maxDataSize', due to post-processing and 
        #   timing issues with the rolling policy.


      ### Below are the calculations, override automated calculation if there is a value for it in customers.csv
      | eval hot_warm_calc_gb      = if('homePath.maxDataSizeGB' == 0, maxTotalDataSizeGB, 'homePath.maxDataSizeGB')
      | eval hot_warm_calc_gb      = if('storage_size_override_hot_warm' == 0, hot_warm_calc_gb, 'storage_size_override_hot_warm')
      | eval hot_warm_storage_cost = hot_warm_calc_gb * hot_warm_storage_rate * rep_factor * percent_ownership / 100
      
      | eval cold_calc_gb          = maxTotalDataSizeGB - 'homePath.maxDataSizeGB'
      | eval cold_calc_gb          = if('coldPath.maxDataSizeGB' == 0 AND 'homePath.maxDataSizeGB' = 0, 0, cold_calc_gb)
      | eval cold_calc_gb          = if('storage_size_override_cold' == 0, hot_warm_calc_gb, 'storage_size_override_cold')
      | eval cold_storage_cost     = cold_calc_gb * cold_storage_rate * rep_factor * percent_ownership / 100
 
      ### Combine the two calculated fields so that we can audit it later
      | eval total_storage_conf_gb = hot_warm_calc_gb + cold_calc_gb
      
      ### Determine DAILY storage and license costs
      | eval stor_cost = (hot_warm_storage_cost + cold_storage_cost) * percent_ownership / 100 * 365
      | eval lic_cost  = micro_lic_GB * license_rate * percent_ownership / 100 * 365

      ### Setting the new field name for convenience and gathering their total
      | eval homePathmaxDataSizeGB = 'homePath.maxDataSizeGB'
      | eval coldPathmaxDataSizeGB = 'coldPath.maxDataSizeGB'
      | eval totalPathmaxDataSizeGB = homePathmaxDataSizeGB + coldPathmaxDataSizeGB
      
      ### Calculate totals and some more calculations for analysis
      | addcoltotals lic_cost stor_cost hot_warm_storage_cost cold_storage_cost         
      | eval total_cost = lic_cost+stor_cost              

      ### Here, we are rounding our numbers so that they look pretty and are more understandable at a glance.  Note:
      ### You want to round numbers at the end of any calculation, or the numbers will not be accurate.
      | foreach *_cost *_rate *GB cold_calc_gb percent_ownership [ eval &lt;&lt;FIELD&gt;&gt; = round( '&lt;&lt;FIELD&gt;&gt;' , 2 ) ]
      
      ### The table and sort are necessary so that we can use the fields for post processing
      | table idx, splunk_server, eai:acl.app, micro_lic_GB, license_rate, lic_cost, currentDBSizeGB, homePath_expanded, coldPath_expanded, maxTotalDataSizeGB, totalEventCount, disabled, years_retention, hot_warm_calc_gb, hot_warm_storage_rate, hot_warm_storage_cost, cold_calc_gb, cold_storage_rate, cold_storage_cost, stor_cost, percent_ownership, total_cost, total_storage_conf_gb, group, homePathmaxDataSizeGB, coldPathmaxDataSizeGB, totalPathmaxDataSizeGB, rep_factor, owner_email 

      | sort  idx, splunk_server, eai:acl.app, micro_lic_GB, license_rate, lic_cost, currentDBSizeGB, homePath_expanded, coldPath_expanded, maxTotalDataSizeGB, totalEventCount, disabled, years_retention, hot_warm_calc_gb, hot_warm_storage_rate, hot_warm_storage_cost, cold_calc_gb, cold_storage_rate, cold_storage_cost, stor_cost, percent_ownership, total_cost, total_storage_conf_gb, group, homePathmaxDataSizeGB, coldPathmaxDataSizeGB, totalPathmaxDataSizeGB, rep_factor, owner_email
 
      ### Saving renaming for the end makes a large search like this more manageable
      | rename idx AS Index, splunk_server AS "Splunk Server", micro_lic_GB AS "Micro License GB", license_rate AS "License Rate", lic_cost AS "License Cost", stor_cost AS "Storage Cost", total_cost AS "Total Cost", currentDBSizeGB AS "Current GB Used", maxTotalDataSizeGB AS "Max Index Size GB", eai:acl.app AS "App ACL", totalEventCount AS "Event Count", disabled AS Disabled, percent_ownership AS "Percent Ownership", hot_warm_calc_gb AS "Hot/Warm Calc GB", cold_calc_gb AS "Cold Calc GB", hot_warm_storage_rate AS "Hot/Warm Storage Rate", cold_storage_rate AS "Cold Rate", hot_warm_storage_cost AS "Hot/Warm Storage Cost", cold_storage_cost AS "Cold Storage Cost", total_storage_conf_gb AS "Total Storage Conf GB",homePathmaxDataSizeGB AS "Max Hot/Warm Size GB", coldPathmaxDataSizeGB AS "Max Cold Size GB", totalPathmaxDataSizeGB AS "Max Hot/Warm/Cold Total", rep_factor AS "Replication Factor" | table Index, "Micro License GB", "License Rate", "Percent Ownership", "License Cost"               



Index Utilization and Prediction:
This dashboard is intended to allow you to visualize actual index utilization.  If you click on a particular index, you will see a predicted utilization of that index, which should help you with index and capacity planning.

This dashboard also includes an "Index Utilization Audit".  This will let you know who is indexing more data than they have been allocated.  There is a "Splunk "Micro" License Violation!" alert configured, which is triggered when this condition is met.


Configuration Audit:
To ensure that you are providing accurate numbers to your customers, this dashboard audits both your configuration for this App as well as your indexes.  Review each dashboard panel on the top row to ensure that you are not over subscribed to an index in any particular manor.  Also look at your license configuration to ensure that you have the appropriate licenses installed.  While expired licenses will not harm you in any way, you might want to clean them up so they do not mislead you.

        Indexes Accounted For (idx) 
        This panel answers two simple questions:
        - Are you charging for all of the indexes that you have configured?  
        - Are you charging for indexes that are not configured?

        Total Ownership Percentage by Index (percent_ownership)
        When you are sharing ownership of an index, the total ownership must equal 100%.

        "Micro License" Consistency (micro_lic_GB)
        When you are sharing ownership of an index, the value for micro_lic_GB must be the total Micro License volume for each entry.

        "Micro License" Total (micro_lic_GB)
        Checks to see that your total sum of micro_lic_GB is the same as what you are licensed for.

License Configuration Details:
This dashboard shows you the exact numbers used in calculating the total license cost.  It will also display RED fields when there is a configuration error.

Storage Configuration Details:
The same as the license dashboard, but created with a focus on storage.  The color-coding for fields is as follows:

        Orange - Used in both "hot/warm" and "cold" storage calculations
        Red - Used for "hot/warm" storage calculations
        Blue - Used for "cold" storage calculations

Please provide feedback and/or enhancement requests to jim@splunk.com.  I will respond within three business days or sooner to address any issues that are reported.  


Custom Buttons:
The custom buttons at the top of the dashboard are intended to simplify the configuration.  If the "Edit Config" button does not work for you, check the following:

        Ensure that you have the "Lookup Edit" App installed.

        Check the URL that is used if you manually browse to edit the file.  You can then update the XML to contain that path.  In some cases, different permissions will change that URL.  Also be sure to add "amp;" after each & in the XML.


Calculating the Rates in the form:
After configuring the customers.csv lookup file, you will need to determine the proper rates to charge for your Splunk services.  These rates should be calculated for the daily costs to be applied.  We start with the daily costs, so that we can extrapolate Monthly, Quarterly, and Yearly costs.

        License Maintenance Rate:
        Take your yearly maintenance costs and divide them by 365.

        Hot/Warm Storage Rate:
        Take your yearly Hot/Warm Storage costs in GB and divide them by 365.

        Cold Storage Rate:
        Take your yearly Cold Storage costs in GB and divide them by 365.


Calculating for Splunk Cloud costs:
If you are using standard storage rules for all of your indexes, the calculation becomes easier.  In this case, take your yearly subscription costs, apply them to the maintenance costs and then use zero for the storage rates.

Final note:
If you are seeing fixed costs year over year, edit the dashboard to use those values as defaults.


Contributing Authors:
James Donn
Kristofer Hutchinson
Burch Simon


