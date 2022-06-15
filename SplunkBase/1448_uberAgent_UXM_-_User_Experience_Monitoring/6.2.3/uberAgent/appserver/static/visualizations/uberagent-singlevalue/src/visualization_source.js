/*
 * Visualization source
 */
define(
[
   'jquery',
   'underscore',
   'api/SplunkVisualizationBase',
   'api/SplunkVisualizationUtils'
],
function
(
   $,
   _,
   SplunkVisualizationBase,
   SplunkVisualizationUtils
)
{
  
   // Extend from SplunkVisualizationBase
   return SplunkVisualizationBase.extend(
   {
      //
      // Override to define initial data parameters that the framework should use to fetch data for the visualization.
      // The code in this method can assume that the visualization root DOM (Document Object Model) element is available as "this.el".
      //
      initialize: function()
      {
         SplunkVisualizationBase.prototype.initialize.apply(this, arguments);

         // For convenience
         this.$el = $(this.el);
      },

      //
      // This function is required for data to be returned from the search. It specifies the data output format for search results.
      // You can also use this function to specify the maximum number of results.
      //
      getInitialDataParams: function()
      {
         // We choose the RAW_OUTPUT_MODE output mode.
         // Returns a field name array and a row array. Each row array index contains an array representing all field values for one result.
         // Example:
         /*
            {
                fields: [
                    { name: 'x' },
                    { name: 'y' },
                    { name: 'z' }
                ],
                results: [
                    { x: 'a', y: 4, z: 70 },
                    { x: 'b', y: 5, z: 80 },
                    { x: 'c', y: 6, z: 90 }
                ]
            }
         */
         return (
         {
            outputMode: SplunkVisualizationBase.RAW_OUTPUT_MODE,
            count: 1
         });
      },

      //
      // Gets a raw data object from splunkd and returns an object formatted for rendering.
      // This object passes to updateView as its data argument.
      //
      formatData: function(data, config)
      {
         // Check for an empty data object
         if(data.results.length < 1)
         {
            return false;
         }

         return data;
      },

      //
      // Get the value of a specific field
      //
      getFieldValue: function(data, field)
      {
         if (data['results'] && data['results'][0] && data['results'][0].hasOwnProperty(field))
         {
            return data['results'][0][field];
         }
         else 
         {
            return null;
         }
      },

      //
      // Build the HTML for one field identified by its index
      //
      buildFieldHtml: function(data, config, i)
      {
         let field       = config[this.getPropertyNamespaceInfo().propertyNamespace + i + '-' + 'field'];
         if (!field)
         {
            return;
         }

         let afterLabelStyle;
         let hiddenStyle = " style='display: none;'";

         let title       = config[this.getPropertyNamespaceInfo().propertyNamespace + i + '-' + 'title'] || '';
         let beforeLabel = config[this.getPropertyNamespaceInfo().propertyNamespace + i + '-' + 'beforeLabel'] || '';
         let afterLabel  = config[this.getPropertyNamespaceInfo().propertyNamespace + i + '-' + 'afterLabel'] || '';
         let underLabel  = config[this.getPropertyNamespaceInfo().propertyNamespace + i + '-' + 'underLabel'] || '';

         // underLabel may contain a search field enclosed in double hashes (e.g.: ##fieldname##)
         let underLabelResult;
         let underLabelField;
         let matchResult = underLabel.match (/##(.+)##/);
         if (matchResult)
         {
            underLabelField = matchResult[1];
         }
         else
         {
            underLabelResult = underLabel;
         }
            
         // Get the result field data
         let fieldResult = this.getFieldValue(data, field);
         if (fieldResult == null)
         {
            fieldResult = gettext("n/a");
            afterLabelStyle = hiddenStyle;
         }
         
         if (underLabelField)
         {
            // Get the result field data
            let underLabelFieldResult = this.getFieldValue(data, underLabelField);
            if (underLabelFieldResult == null)
            {
               underLabelFieldResult = gettext("n/a");
            }
            
            // Replace the field variable with the field value (the search result)
            let underLabelFieldRegex = new RegExp ("##" + underLabelField + "##");
            underLabelResult = underLabel.replace (underLabelFieldRegex, underLabelFieldResult);
         }

         // Build the HTML output
         let output = '<div class="uberagent-control uberagent-singlevalue">';
         output += '<div class="uberagent-singlevalue-Header">' + SplunkVisualizationUtils.escapeHtml(gettext(title)) + '</div>';
         output += '<div class="uberagent-singlevalue-Body">';
         output += '<span class="uberagent-singlevalue-Before">' + SplunkVisualizationUtils.escapeHtml(beforeLabel) + '</span>';
         output += '<span class="uberagent-singlevalue-Value">' + SplunkVisualizationUtils.escapeHtml(fieldResult) + '</span>';
         output += '<span class="uberagent-singlevalue-After"' + SplunkVisualizationUtils.escapeHtml(afterLabelStyle) + '>' + SplunkVisualizationUtils.escapeHtml(afterLabel) + '</span>';
         output += '</div>';
         output += '<div class="uberagent-singlevalue-Footer">' + SplunkVisualizationUtils.escapeHtml(underLabelResult) + '</div>';
         output += '</div>';

         return output;
      },

      //
      // Override to implement the initial view setup logic.
      // This method is called immediately before the first call to updateView.
      //
      setupView: function()
      {
        // Observe CSS changes to our parent's div on which Splunk sets overflow to hidden
        let observer = new MutationObserver(function(mutations)
        {
           mutations.forEach(function(mutationRecord)
           {
              // Get the new value
              let newValue = mutationRecord.target.attributes.getNamedItem(mutationRecord.attributeName).value;
  
              // Extract the overflow setting
              let matchResult = newValue.match (/overflow\s*:\s*(\w+)/);
              if (matchResult)
              {
                 if (matchResult[1] != "visible")
                 {
                    // Overflow is not what is should be -> adjust
                    $(mutationRecord.target).css("overflow", "visible");
  
                 }
              }
           });    
        });

        let ourTopmostDiv = this.$el.parents("div#uberAgent\\.uberagent-singlevalue.viz-controller");
        if (ourTopmostDiv.length)
        {
           observer.observe(ourTopmostDiv.parent().get(0), { attributes : true, attributeFilter : ['style'] });
         }
      },

      //
      // This function is called whenever search results are updated or the visualization format changes.
      //
      // Parameters:
      // - data:     the data object returned from formatData or from the search
      // - config:   the configuration property object
      //
      updateView: function(data, config)
      {
         // Return if no data
         if (!data)
         {
            return;
         }

         // Get the properties configured in the dashboard source code for all single value instances we're to create
         let i = 1;
         let output = "";
         let fieldHtml;
         do
         {
            fieldHtml = this.buildFieldHtml(data, config, i);
            if (fieldHtml)
            {
               output += fieldHtml;
            }

            i++;

         } while (fieldHtml);

         // Add the HTML to the DOM
         this.$el.html(output);

         // Make sure elements overflowing into a second row are visible
         this.adjustOverflow();
      },

      //
      // Adjust CSS settings on the relevant parent div so that elements overflowing into another row are visible
      //
      // One of our parent divs has "overflow: hidden" (if the row is not wide enough to contain all our elements, they overflow in the next row, but the row's height does not change, so they're hidden).
      // Make sure that parent div's height adjusts to the content automatically.
      // 1. Find our own topmost div (note: periods in CSS IDs need to be escaped with two backslashes).
      // 2. Remove "overflow: hidden" on its direct parent by setting it to the default ("visible").
      // Important: this only works in "updateView" because the overflow setting is changed very late in the page rendering process. It does not work reliably in: reflow, setupView
      //
      adjustOverflow: function()
      {
         let ourTopmostDiv = this.$el.parents("div#uberAgent\\.uberagent-singlevalue.viz-controller");
         if (ourTopmostDiv.length)
         {
            let topmostParent = ourTopmostDiv.parent();
            if (topmostParent)
            {
               if (topmostParent.css("overflow") != "visible")
               {
                  topmostParent.css("overflow", "visible");

                  // Also change that parent's elements CSS position from "relative" to "static" (the default) to move the resize handle (a little dot) to the right y position near the bottom of the row.
                  topmostParent.css("position", "static");
               }
            }
         }
      },

   });
});