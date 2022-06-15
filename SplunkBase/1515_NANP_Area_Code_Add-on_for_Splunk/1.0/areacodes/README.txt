Author: Vi Ly (Splunk, Inc.)
Feedback: vi@splunk.com

NANP Area Code Add-on for Splunk
================================

=== Documentation ===

This Splunk Add-on provides a simple area code to location lookup.  It covers phone numbers in the United States, Canada and the Caribbean under the North American Numbering Plan (NANP).  The lookup enables enrichment of phone numbers with city, state or longitude/latitude.  Use it in combination with the Google Maps or amMap Apps to add geo-visualization.

== Setup ==

1. Adjust the sourcetype in local/props.conf to fit the dataset containing phone numbers.  Alternatively, add the lookup and field extraction to the dataset in any existing props.conf entries.

  [phonedata]
  LOOKUP-ac = GeoAreaCodeLookup areacode OUTPUTNEW latitude as _lat, longitude as _lng, region, city, country
  REPORT-ac = getareacode

2. Adjust the regex in local/transforms.conf to extract the 6-digit area code correctly.  The 6-digit area code is the first 6 digits of the phone number.  The default field extraction assumes phone numbers are formatted as 123-456-7890.

  [getareacode]
  REGEX = phone_no="?(\d{3}[-|.]\d{3})
  FORMAT = areacode::$1

3. Confirm the field extraction and automatic lookup are working properly.  Run a search on the dataset with phone numbers and ensure the following fields are associated:

  - phone_no
  - areacode
  - city
  - region
  - country

== Example Usage ==

After the configuration is applied, the dataset with phone numbers can be treated like any dataset.

  > sourcetype="phonedata" | top city
  > sourcetype="phonedata" | stats count by region
  > sourcetype="phonedata" | timechart count by city

To use the area code lookup with geo-visualizations provided by Google Maps for Splunk, use the App's geonormalize command:

  > sourcetype="phonedata" | geonormalize

To use the area code lookup with geo-visualizations provided by the Splunk for amMap Flash Maps App:

  > ... | stats count by areacode
      | eval count_label=Event
      | eval iterator=areacode
      | eval iterator_label=Event
      | eval zoom="zoom=\"234%\" zoom_x=\"53.03%\" zoom_y=\"-57.61%\""
      | eval movie_color=#FF0000
      | eval output_file="home_threat_data.xml"
      | eval app=amMap
      | lookup AreaCodeLookup areacode OUTPUT latitude as client_lat, longitude as client_lon, city as client_city, region as client_region, country as client_country
      | fillnull client_country value="United States"
      | fillnull client_city value="San Francisco"
      | fillnull client_region value="CA"
      | mapit

== More Background ==

For additional context on the lookup and how it was created, please see this Splunk blog post:

  Hey Baby, Where's Your Number? http://blogs.splunk.com/2011/01/14/hey-baby-wheres-your-number



