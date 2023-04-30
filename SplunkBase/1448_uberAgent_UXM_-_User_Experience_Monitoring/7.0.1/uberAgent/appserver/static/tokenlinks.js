/*
   Set tokens using data attributes in HTML elements.
   
   Data attributes on HTML anchors allow you to set or unset tokens for the dashboard. Available data attributes are:

      data-set-token in combination with data-value to set a token to a particular value:
      <a href="#" data-set-token="mytoken" data-value="the new token value">Click me</a>
      
      data-unset-token to unset a token:
      <a href="#" data-unset-token="mytoken">Click me</a>
      
      data-token-json to set or unset multiple tokens by supplying a JSON object (null values are used to unset tokens):
      <a href="#" data-token-json='{ "token1": "new value", "token2": "other value", "token3": null }'>Click me</a>

   The anchors must be grouped in a container, typically div, with the class "tokenlink-container".
      
   To define default token values set the CSS class "tokenlink-default" on one of the anchors.
   
   Both the container and the anchors need unique IDs.
   
   Example:
   
      <div class="tokenlink-container" id="Tokenlink_Panel11">
         Group by: 
         <!-- Set tokens when the link is clicked (requires tokenlinks.js) -->
         <a href="#" id="Target" class="btn-pill tokenlink-default" data-token-json='{"Panel11GroupBy": "Process_NetworkTargetPerformance.NetTargetRemoteNameAddressPort", "Panel11GroupByDisplay": "Target"}'>
            Target
         </a>
         <a href="#" id="Host" class="btn-pill" data-token-json='{"Panel11GroupBy": "host", "Panel11GroupByDisplay": "Host"}'>
            Host
         </a>
         <a href="#" id="Process" class="btn-pill" data-token-json='{"Panel11GroupBy": "Process_NetworkTargetPerformance.ProcName", "Panel11GroupByDisplay": "Process"}'>
            Process
         </a>
         <a href="#" id="User" class="btn-pill" data-token-json='{"Panel11GroupBy": "Process_NetworkTargetPerformance.ProcUser", "Panel11GroupByDisplay": "User"}'>
            User
         </a>
      </div>

*/

require(['jquery', 'underscore', 'splunkjs/mvc', 'splunkjs/mvc/simplexml/ready!'], function($, _, mvc)
{
   //
   // Tokenlink click event handler: group, URL
   //
   $('.tokenlink-container > a').click(function(event)
   {
      event.preventDefault();
      
      // Get the clicked anchor's ID
      var anchor = $(event.currentTarget);
      var anchorId = anchor.attr('id');
      
      // Get the container's ID
      var tokenlinkContainer = $(event.currentTarget).parent();
      var tokenlinkContainerId = tokenlinkContainer.attr('id');
      
      // Add the token to the URL (should happen automatically, but does not as of Splunk 6.2.1)
      UpdateQueryStringParam(tokenlinkContainerId, anchorId);

      // Mark (only) the clicked anchor as active
      tokenlinkContainer.find('a.active').removeClass('active');
      anchor.addClass('active');
      
      // Set the token(s) defined on the clicked anchor
      parseTokenlink(event.currentTarget);
   });

   
   //
   // Tokenlink click event handler: single, noURL
   // Use the "on('click'" variant to set the event handler. That works even if the element is displayed only later.
   //
   $('.dashboard-body').on('click', '.tokenlink-container-single-nourl > [data-set-token],[data-unset-token],[data-token-json]', function(event)
   {
      event.preventDefault();
      
      // Set the token(s) defined on the clicked anchor
      parseTokenlink(event.currentTarget);
   });
   
   
   //
   // On page load, restore a previous state from URL GET parameters or set a default
   //
   // Loop through all tokenlink container divs on the page
   $('.tokenlink-container').each(function()
   {
      var tokenlinkContainer = $(this);
   
      // Check if the URL contains a previous state
      var tokenlinkContainerId = tokenlinkContainer.attr('id');
      var urlParamValue = getUrlParameter(tokenlinkContainerId);
      if (typeof urlParamValue == "undefined")
      {
         // "Click" the item marked as default
         tokenlinkContainer.find("a.tokenlink-default").click();
      }
      else
      {
         // "Click" the item from the URL
         tokenlinkContainer.find("#" + urlParamValue).click();
      }
   });
   
   //
   // Set the tokens defined for an anchor
   //
   function parseTokenlink(anchor)
   {
      var target = $(anchor);
      var setTokenName = target.data('set-token');
      if (setTokenName)
      {
         SetToken(mvc, setTokenName, target.data('value'), true);
      }
      var unsetTokenName = target.data('unset-token');
      if (unsetTokenName)
      {
         SetToken(mvc, unsetTokenName, undefined, true);
      }
      var tokenJson = target.data('token-json');
      if (tokenJson)
      {
         try
         {
            if (_.isObject(tokenJson))
            {
               _(tokenJson).each(function(value, key)
               {
                  if (value == null)
                  {
                     // Unset the token
                     SetToken(mvc, key, undefined, true);
                  }
                  else
                  {
                     SetToken(mvc, key, value, true);
                  }
               });
            }
         }
         catch (e)
         {
            console.warn('Cannot parse token JSON: ', e);
         }
      }
   }
});