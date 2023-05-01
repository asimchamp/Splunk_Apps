
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Untitled Document</title><style></style></head><body>
<h1 id="note-">NOTE:</h1>
<p>All of this information came from <a href="https://github.com/alexandersimoes/d3plus/wiki/Visualizations">here</a> - so if a  link is broken you can just go there and it will take you to the page.</p>
<p>The main focus of this page is to give you a hint at what is possible with d3plus.</p>
<p>The biggest take away is just noticing that certain data options map to certain methods of a d3plus viz.</p>
<pre><code>Legend: .nameOfMethod() - &quot;name in data options&quot; : (accepted values)

.id() - &quot;levels&quot; : ( String | Array | Object )
.time() - &quot;time_field&quot; : ( false | String | Function | Object )
.x() - &quot;x_data&quot; : ( false | String | Function | Object )
.y() - &quot;y_data&quot; : ( false | String | Function | Object )
.size() - &quot;size&quot; : ( false | String | Number | Function | Object )
.color() - &quot;color_field&quot; : ( String | Function | Object )
.tooltip() - &quot;tooltip_data&quot; : ( Array | Object )
.ui() - &quot;ui&quot; : ( false | Array | Object )
.aggs() - &quot;aggs&quot; : ( Object )
</code></pre><p>where <code>.nameOfMethod</code> is the name in the javascript and the <code>&quot;name in data options&quot;</code> is the key in the key-value pairs in the data-options of the dashboard&#39;s html panel. </p>
<h1 id="data-options">data options</h1>
<hr>
<h3 id="-id-levels-string-array-object-">.id() - &quot;levels&quot; : ( <em>String</em> | <em>Array</em> | <em>Object</em> )</h3>
<p>Defines the accessor key to be used as each data point&#39;s unique identifier. This is the key that <strong>d3plus</strong> will use when cross-referencing the data with all sources of data, such as <a href="#attrs">.attrs( )</a> and <a href="#coords">.coords( )</a>. When passing an <em>Array</em> to this method, <strong>d3plus</strong> will use each item in the <em>Array</em> as a different level of nesting for the data. For example, if you were using data on cities, you could pass the following array of keys (given these keys are present in your data somewhere):</p>
<pre><code class="lang-js">.id( [ <span class="hljs-string">"state"</span> , <span class="hljs-string">"county"</span> , <span class="hljs-string">"city"</span> ] )
</code></pre>
<p>In this case, if the current visualization supports nesting, the shapes in the visualization would be nested first by State, then by County, and finally by City. Each <em>String</em> in the <em>Array</em> has to match a key in one of the defined data methods, usually the main <a href="#data">.data( )</a>.</p>
<p>As with some of the other methods, an <em>Object</em> can be passed to this method. Here are the keys accessible by the user:</p>
<table>
<thead>
<tr>
<th>Key</th>
<th>Description</th>
<th>Accepted Value(s)</th>
<th>Default Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>grouping</td>
<td>Whether or not the visualization should group shapes based on the supplied nesting.</td>
<td><em>Boolean</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>mute</td>
<td>Hides specific data points from the viewer. Full documentation can be found <a href="Data-Filtering#mute">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>solo</td>
<td>Shows only specific data points to the viewer. Full documentation can be found <a href="Data-Filtering#solo">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>value</td>
<td>Defines the accessor key to be used as each data point&#39;s unique identifier. When passing only a <em>String</em> or <em>Array</em> to this method, this is the variable that actually gets set.</td>
<td><em>String</em>, <em>Array</em></td>
<td><code>&quot;id&quot;</code></td>
</tr>
</tbody>
</table>
<hr>
<h3 id="-time-time_field-false-string-function-object-">.time() - &quot;time_field&quot; : ( <code>false</code> | <em>String</em> | <em>Function</em> | <em>Object</em> )</h3>
<p>Defines the value to be used for slicing the data into different time periods. All values will be parsed into <em>Javascript Date Objects</em>, unless they are already in that format. We suggest using time formats specified in the first table on <a href="http://dygraphs.com/date-formats.html">this page</a>. You can also pass a <em>Function</em> as a method of determining the time value for a node. <strong>d3plus</strong> will pass your function the data point in question, and the function should return the value requested.</p>
<p>This method also supports passing an <em>Object</em>. Here are the supported keys:</p>
<table>
<thead>
<tr>
<th>Key</th>
<th>Description</th>
<th>Accepted Value(s)</th>
<th>Default Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>fixed</td>
<td>When set to <code>false</code>, the axes will remain static as you change the time visible (using mute/solo or a [[Timeline]]). &lt;br&gt;&lt;br&gt; This makes it easier to see trends over time. If you would like the axes to change as time changes, set this to <code>true</code>.</td>
<td><code>false</code>, <code>true</code></td>
<td><code>false</code></td>
</tr>
<tr>
<td>format</td>
<td>A <a href="https://github.com/mbostock/d3/wiki/Time-Formatting">D3 time format</a> function that will override the default behavior of <strong>d3plus</strong>.</td>
<td><code>false</code>, <em>Array</em>, <em>String</em>,  <code>[d3.time.format](https://github.com/mbostock/d3/wiki/Time-Formatting)</code></td>
<td><code>false</code></td>
</tr>
<tr>
<td>mute</td>
<td>Hides specific data points from the viewer. Full documentation can be found <a href="Data-Filtering#mute">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>solo</td>
<td>Shows only specific data points to the viewer. Useful for only displaying specific time periods of data. Full documentation can be found <a href="Data-Filtering#solo">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>value</td>
<td>When passing only a <em>String</em> or <em>Function</em> to the method, this is the variable that actually gets set.&lt;br&gt;&lt;br&gt;You can also pass a single keyed <em>Object</em>, keyed by the appropriate nesting level&#39;s <a href="#id">.id( )</a>. This will tell <strong>d3plus</strong> to look in that specific nesting level&#39;s attribute list for the value.</td>
<td><em>String</em>, <em>Function</em>, <em>Object</em>, <code>false</code></td>
<td><code>false</code></td>
</tr>
</tbody>
</table>
<hr>
<h3 id="-x-x_data-false-string-function-object-">.x() - &quot;x_data&quot; : ( <code>false</code> | <em>String</em> | <em>Function</em> | <em>Object</em> )</h3>
<p>Defines the value in your data to be associated with the axis in visualizations that use an X/Y plot. You can also pass a <em>Function</em> as a way of determining the axis value. <strong>d3plus</strong> will pass your function the data point in question, and the function should return the value requested.</p>
<p>This method also supports passing a keyed <em>Object</em>. Here are the supported keys:</p>
<table>
<thead>
<tr>
<th>Key</th>
<th>Description</th>
<th>Accepted Value(s)</th>
<th>Default Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>axis</td>
<td>Toggles on/off the grid line for the zeroline. Additional object parameters for styling are: &quot;color&quot;, &quot;font&quot;, and &quot;rendering&quot;.</td>
<td><em>Boolean</em>, <em>Object</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>domain</td>
<td>Defines the domain to be used when drawing the axis. If passed <code>false</code>, <strong>d3plus</strong> will calculate the domain based on the data available (which it does by default).</td>
<td><em>Array</em>, <code>false</code></td>
<td><code>false</code></td>
</tr>
<tr>
<td>grid</td>
<td>Toggles on/off the grid lines for this specific axis. Additional object parameters for styling are: &quot;color&quot; and &quot;rendering&quot;.</td>
<td><em>Boolean</em>, <em>Object</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>label</td>
<td>Overrides the default axis label text. Additional object parameters for styling are: &quot;color&quot;, &quot;decoration&quot;, &quot;family&quot;, &quot;padding&quot;, &quot;size&quot;, &quot;transform&quot;, and &quot;weight&quot;.</td>
<td><em>Boolean</em>, <em>String</em>, <em>Object</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>lines</td>
<td>Will plot the values passed as static lines on the axis. If the value is a single keyed <em>Object</em>, <strong>d3plus</strong> will use the key as a label for the line and the value as the position. &lt;br&gt;&lt;br&gt; In addition to passing values, various parameters can be set by using a specific keyed object. Here are the available keys: &quot;dasharray&quot;, &quot;color&quot;, &quot;font&quot;, &quot;rendering&quot;, &quot;width&quot;.</td>
<td><em>Number</em>, <em>Object</em>, or <em>Array</em> of values</td>
<td><code>false</code></td>
</tr>
<tr>
<td>mouse</td>
<td>Styles for the lines that eminant out of a data node and point to the values on each axis, for visualizations that support it. Here are the accepted keys: &quot;dasharray&quot;, &quot;rendering&quot;, and &quot;width&quot;. &lt;br&gt;&lt;br&gt;Can also be toggled using a <em>Boolean</em> value.</td>
<td><em>Boolean</em>, <em>Object</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>mute</td>
<td>Hides specific data points from the viewer. Full documentation can be found <a href="Data-Filtering#mute">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>false</code></td>
</tr>
<tr>
<td>padding</td>
<td>Defines the padding between grouped data for the specific axis. For example, this number is used in Bar Charts to define the space between each group of bars. If the number is less than <code>1</code>, it is used as a percentage of the available space. If it is larger than <code>1</code>, it is used as a set pixel value (unless there is not enough space, then it reverts to the default).</td>
<td><em>Number</em></td>
<td><code>0.1</code></td>
</tr>
<tr>
<td>range</td>
<td>Sets a static range of values to be used for the axis.</td>
<td><code>false</code>, <em>Array</em></td>
<td><code>false</code></td>
</tr>
<tr>
<td>scale</td>
<td>Defines the scale to use when plotting points on the axis. &lt;br&gt;&lt;br&gt; A <code>&quot;discrete&quot;</code> scale will assume each value is unique, and will create a tick for each instance of that value (for example, when using [[Time Parameters]]). &lt;br&gt;&lt;br&gt; A <code>&quot;share&quot;</code> scale will plot values as percentages out of all of the available values.</td>
<td><code>&quot;linear&quot;</code>, <code>&quot;log&quot;</code>, <code>&quot;discrete&quot;</code>, <code>&quot;share&quot;</code></td>
<td><code>&quot;linear&quot;</code></td>
</tr>
<tr>
<td>solo</td>
<td>Shows only specific data points to the viewer. Full documentation can be found <a href="Data-Filtering#solo">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>false</code></td>
</tr>
<tr>
<td>stacked</td>
<td>Determines whether or not axis values should be stacked on top of each other.</td>
<td><em>Boolean</em></td>
<td><code>false</code></td>
</tr>
<tr>
<td>ticks</td>
<td>Style properties for the axis ticks. Accepted keys are: &quot;color&quot;, &quot;font&quot;, &quot;rendering&quot;, &quot;size&quot;, and &quot;width&quot;.</td>
<td><em>Object</em></td>
<td>Default style.</td>
</tr>
<tr>
<td>value</td>
<td>When passing only a <em>String</em> or <em>Function</em> to the method, this is the variable that actually gets set. &lt;br&gt;&lt;br&gt; You can also pass a single keyed <em>Object</em>, keyed by the appropriate nesting level&#39;s <a href="#id">.id( )</a>. This will tell <strong>d3plus</strong> to look in that specific nesting level&#39;s attribute list for the value.</td>
<td><em>String</em>, <em>Function</em>, <em>Object</em>, <code>false</code></td>
<td><code>false</code></td>
</tr>
<tr>
<td>zerofill</td>
<td>If scale is <code>&quot;discrete&quot;</code>, this determines whether or not <strong>d3plus</strong> should fill gaps in the axis with <code>0</code> values.</td>
<td><em>Boolean</em></td>
<td><code>false</code></td>
</tr>
</tbody>
</table>
<hr>
<h3 id="-y-y_data-false-string-function-object-">.y() - &quot;y_data&quot; : ( <code>false</code> | <em>String</em> | <em>Function</em> | <em>Object</em> )</h3>
<p>Same as <code>x_data</code> above.</p>
<h3 id="-size-size-false-string-number-function-object-">.size() - &quot;size&quot; : ( <code>false</code> | <em>String</em> | <em>Number</em> | <em>Function</em> | <em>Object</em> )</h3>
<p>Defines the value to use when sizing data nodes. If passed a <em>String</em>, it should match a key in the data point to a <em>Number</em>. If passed a <em>Number</em>, it will be used to size all data nodes. You can also pass a function as a way of determining the size of a node. <strong>d3plus</strong> will pass your function the data point in question, and the function should return the value requested.</p>
<p>This method also supports passing a keyed object. Here are the supported keys:</p>
<table>
<thead>
<tr>
<th>Key</th>
<th>Description</th>
<th>Accepted Value(s)</th>
<th>Default Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>mute</td>
<td>Hides specific data points from the viewer. Full documentation can be found <a href="Data-Filtering#mute">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>scale</td>
<td>Determines the scaling of nodes.&lt;br&gt;&lt;br&gt;By passing an <em>Object</em>, the &quot;min&quot; and &quot;max&quot; pixel values of the size scale can also be accessed.</td>
<td><em>Function</em>, <em>Object</em></td>
<td><code>d3.scale.sqrt()</code></td>
</tr>
<tr>
<td>solo</td>
<td>Shows only specific data points to the viewer. Full documentation can be found <a href="Data-Filtering#solo">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>threshold</td>
<td>Whether or not visualizations (if applicable) should automatically group data into an &quot;other&quot; object.</td>
<td><em>Boolean</em>, <em>Function</em>, <em>Number</em></td>
<td><code>false</code></td>
</tr>
<tr>
<td>value</td>
<td>Defines the key to use when sizing data nodes. When passing only a <em>String</em> or <em>Function</em> to the method, this is the variable that actually gets set.&lt;br&gt;&lt;br&gt;You can also pass a single keyed <em>Object</em>, keyed by the appropriate nesting level&#39;s <a href="#id">.id( )</a>. This will tell <strong>d3plus</strong> to look in that specific nesting level&#39;s attribute list for the value.</td>
<td><em>String</em>, <em>Number</em>, <em>Function</em>, <em>Object</em>, <code>false</code></td>
<td><code>false</code></td>
</tr>
</tbody>
</table>
<hr>
<h3 id="-color-color_field-string-function-object-">.color() - &quot;color_field&quot; : ( <em>String</em> | <em>Function</em> | <em>Object</em> )</h3>
<p>Defines the value in your data associated with the color of each node. If the value is a hexadecimal color <em>String</em> (eg. <code>&quot;#cc0000&quot;</code>), <strong>d3plus</strong> will simply use that as the node&#39;s color. If it returns a non-color <em>sting</em>, a random color based on that string will be used. Finally, if the key returns a <em>Number</em>, <strong>d3plus</strong> will map the values to a heat map. You can also pass a function as a way of determining the color of a node. <strong>d3plus</strong> will pass your function the data point in question, and the function should return the value requested.</p>
<p>This method also supports passing a keyed object. Here are the supported keys:</p>
<table>
<thead>
<tr>
<th>Key</th>
<th>Description</th>
<th>Accepted Value(s)</th>
<th>Default Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>focus</td>
<td>A color to use for the <a href="#focus">.focus( )</a>.</td>
<td><em>color</em></td>
<td><code>&quot;#444444&quot;</code></td>
</tr>
<tr>
<td>heatmap</td>
<td>An <em>Array</em> of colors to use when color values are all positive <em>numbers</em>. Can be any number of colors.</td>
<td><em>Array</em> of colors</td>
<td><code>[&quot;#282F6B&quot;, &quot;#419391&quot;, &quot;#AFD5E8&quot;, &quot;#EACE3F&quot;, &quot;#B35C1E&quot;, &quot;#B22200&quot;]</code></td>
</tr>
<tr>
<td>missing</td>
<td>A color to use for when a shape has no data associated with it.</td>
<td><em>color</em></td>
<td><code>&quot;#eeeeee&quot;</code></td>
</tr>
<tr>
<td>mute</td>
<td>Hides specific data points from the viewer. Full documentation can be found <a href="Data-Filtering#mute">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>primary</td>
<td>A color to use for primary connections in the <a href="#edges">.edges( )</a>.</td>
<td><em>color</em></td>
<td><code>&quot;#d74b03&quot;</code></td>
</tr>
<tr>
<td>range</td>
<td>An <em>Array</em> of colors to use when the [[Color Parameters]] range from negative to positive. Must be an array of 3 colors.</td>
<td><em>Array</em> of colors</td>
<td><code>[&quot;#B22200&quot;, &quot;#FFEE8D&quot;, &quot;#759143&quot;]</code></td>
</tr>
<tr>
<td>scale</td>
<td>The color scale used when assigning random colors to objects. Supports the d3plus default color scale, the default d3 color scales, your own scale, or an array of values to use to create a scale.</td>
<td><em>Array</em>, <em>Function</em>, <code>&quot;d3plus&quot;</code>, <code>&quot;category10&quot;</code>, <code>&quot;category20&quot;</code>, <code>&quot;category20b&quot;</code>, <code>&quot;category20c&quot;</code></td>
<td><code>&quot;d3plus&quot;</code></td>
</tr>
<tr>
<td>secondary</td>
<td>A color to use for secondary connections in the <a href="#edges">.edges( )</a>.</td>
<td><em>color</em></td>
<td><code>&quot;#e5b3bb&quot;</code></td>
</tr>
<tr>
<td>solo</td>
<td>Shows only specific data points to the viewer. Full documentation can be found <a href="Data-Filtering#solo">here</a>.</td>
<td><strong>value</strong>, <em>Function</em>, <em>Array</em></td>
<td><code>[]</code></td>
</tr>
<tr>
<td>value</td>
<td>Defines the key in your data associated with the color of each node. When passing only a <em>String</em> or <em>Function</em> to the method, this is the variable that actually gets set. &lt;br&gt;&lt;br&gt; You can also pass a single keyed <em>Object</em>, keyed by the appropriate nesting level&#39;s <a href="#id">.id( )</a>. This will tell <strong>d3plus</strong> to look in that specific nesting level&#39;s attribute list for the value.</td>
<td><em>String</em>, <em>Function</em>, <em>Object</em>, <code>false</code></td>
<td><strong>visualization</strong>:<code>false</code> &lt;br&gt; <strong>form</strong>:<code>&quot;color&quot;</code></td>
</tr>
</tbody>
</table>
<hr>
<h3 id="-tooltip-tooltip_data-array-object-">.tooltip() - &quot;tooltip_data&quot; : ( <em>Array</em> | <em>Object</em> )</h3>
<p>Defines a list of values to be displayed in the tooltip created for each node. Also has the the ability to accept an <em>Object</em> that contains &quot;short&quot; and &quot;long&quot; keys, to define separate <em>Arrays</em> for both on hover (&quot;short&quot;) and on click (&quot;long&quot;) tooltips.</p>
<p>This method also supports passing a keyed object with advanced parameters. Here are the supported keys:</p>
<table>
<thead>
<tr>
<th>Key</th>
<th>Description</th>
<th>Accepted Value(s)</th>
<th>Default Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>anchor</td>
<td>The anchor point on the node for the floating tooltip.</td>
<td>Should be defined as two words, the first representing vertically &quot;top&quot;, &quot;middle&quot;, or &quot;bottom&quot; and the second representing horizontal &quot;left&quot;, &quot;center&quot;, or &quot;right&quot;.</td>
<td><code>&quot;top center&quot;</code></td>
</tr>
<tr>
<td>background</td>
<td>The background color for the tooltip.</td>
<td><em>color</em></td>
<td><code>&quot;#ffffff&quot;</code></td>
</tr>
<tr>
<td>children</td>
<td>Whether or not visualization tooltips should include a list of the top 3 nested data objects inside of a shape.</td>
<td><em>Boolean</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>connections</td>
<td>Whether or not visualization tooltips should include a list of the primary connected nodes, if an <a href="#edges">.edges( )</a> is defined.</td>
<td><em>Boolean</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>curtain</td>
<td>Styles for the full page &quot;curtain&quot; that is displayed behind a large tooltip and behind focused elements in zoomable visualizations. Accepted keys are: &quot;color&quot; and &quot;opacity&quot;.</td>
<td><em>Object</em></td>
<td>Default styles</td>
</tr>
<tr>
<td>extent</td>
<td>Whether or not Box Plot tooltips should display the values of the whiskers.</td>
<td><em>Boolean</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>font</td>
<td>[[Font Styles]] for the tooltips. Currently supports passing a keyed <em>Object</em> with the following keys: &quot;color&quot;, &quot;family&quot;, &quot;size&quot;, &quot;transform&quot;, and &quot;weight&quot;.</td>
<td><em>Object</em></td>
<td>Default style</td>
</tr>
<tr>
<td>html</td>
<td>Defines HTML content to be displayed in a large tooltip underneath the specified tooltip keys. If passed a <em>Function</em>, <strong>d3plus</strong> will call the <em>Function</em>, passing the current data point to the function, and will expect a <em>String</em> in return. &lt;br&gt;&lt;br&gt; If passed an <em>Object</em> with &quot;url&quot; and &quot;callback&quot; keys, <strong>d3plus</strong> will make a <a href="https://github.com/mbostock/d3/Requests#d3_json">d3.json</a> request using the &quot;url&quot; provided, and call the &quot;callback&quot; <em>Function</em> once data is returned. The &quot;callback&quot; <em>Function</em> should then return a valid HTML <em>String</em>.</td>
<td><em>String</em>, <em>Function</em>, <em>Object</em>, <code>false</code></td>
<td><code>false</code></td>
</tr>
<tr>
<td>iqr</td>
<td>Whether or not Box Plot tooltips should display the values of the interquartile range.</td>
<td><em>Boolean</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>large</td>
<td><em>Number</em> width for large tooltips created inside a visualization.</td>
<td><em>Number</em></td>
<td><code>250</code></td>
</tr>
<tr>
<td>share</td>
<td>Whether or not visualization tooltips, when applicable, should show the current shape&#39;s share percentage (as in [[Tree Maps</td>
<td>Tree Map]]).</td>
<td><em>Boolean</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>size</td>
<td>Whether or not visualization tooltips should, when defined, display the current [[size</td>
<td>Size Parameters]] value.</td>
<td><em>Boolean</em></td>
<td><code>true</code></td>
</tr>
<tr>
<td>small</td>
<td><em>Number</em> width for small tooltips created inside a visualization.</td>
<td><em>Number</em></td>
<td><code>200</code></td>
</tr>
<tr>
<td>sub</td>
<td>A key in the data to use as the sub-title for all tooltips.</td>
<td><code>false</code>, <em>String</em></td>
<td><code>false</code></td>
</tr>
<tr>
<td>value</td>
<td>When passing only an <em>Array</em> or an <em>Object</em> with either &quot;short&quot; and &quot;long&quot; keys or nesting levels, this is the value that gets set.</td>
<td><em>Array</em>, <em>Object</em>, <code>false</code></td>
<td><code>false</code></td>
</tr>
</tbody>
</table>
<hr>
<h3 id="-ui-ui-false-array-object-">.ui() - &quot;ui&quot; : ( <code>false</code> | <em>Array</em> | <em>Object</em> )</h3>
<p>Creates UI elements, using <a href="Forms">d3plus forms</a>, that help the modify behavior of the visualization. The <em>Array</em> of objects passed should contain methods and values, which correspond to how the UI element should behave. For example, if you wanted to create a toggle that switches the &quot;size&quot; method from &quot;export&quot; to &quot;import&quot;, you would pass the following:</p>
<pre><code class="lang-js">.ui([{<span class="hljs-string">"method"</span>: <span class="hljs-string">"size"</span>, <span class="hljs-string">"value"</span>: [ <span class="hljs-string">"export"</span> , <span class="hljs-string">"import"</span> ]}])
</code></pre>
<p>The UI can be removed by passing <code>false</code>. This method also supports passing a keyed object. Here are the supported keys:</p>
<table>
<thead>
<tr>
<th>Key</th>
<th>Description</th>
<th>Accepted Value(s)</th>
<th>Default Value</th>
</tr>
</thead>
<tbody>
<tr>
<td>align</td>
<td>Sets the horizontal alignment of the UI elements.</td>
<td><code>&quot;left&quot;</code>, <code>&quot;center&quot;</code>, <code>&quot;right&quot;</code></td>
<td><code>&quot;center&quot;</code></td>
</tr>
<tr>
<td>border</td>
<td>Pixel border for all UI elements.</td>
<td><em>Number</em></td>
<td><code>1</code></td>
</tr>
<tr>
<td>color</td>
<td>Object that sets the &quot;primary&quot; and &quot;secondary&quot; UI colors. &lt;br&gt;&lt;br&gt; When only setting a &quot;primary&quot; color, the &quot;secondary&quot; is automatically calculated based on the &quot;primary&quot;.</td>
<td><em>Object</em></td>
<td>Default style</td>
</tr>
<tr>
<td>display</td>
<td>The display behavior of the UI elements.</td>
<td><code>&quot;block&quot;</code>, <code>&quot;inline-block&quot;</code></td>
<td><code>&quot;inline-block&quot;</code></td>
</tr>
<tr>
<td>font</td>
<td>[[Font Styles]] for the UI elements. Currently supports passing a keyed <em>Object</em> with the following keys: &quot;align&quot;, &quot;color&quot;, &quot;decoration&quot;, &quot;family&quot;, &quot;size&quot;, &quot;transform&quot;, and &quot;weight&quot;.</td>
<td><em>Object</em></td>
<td>Default style</td>
</tr>
<tr>
<td>margin</td>
<td>Pixel margin for all UI elements.</td>
<td><em>Number</em></td>
<td><code>5</code></td>
</tr>
<tr>
<td>padding</td>
<td>Pixel padding for all UI elements.</td>
<td><em>Number</em></td>
<td><code>5</code></td>
</tr>
<tr>
<td>position</td>
<td>The position of the container for all UI elements.</td>
<td><code>&quot;top&quot;</code> , <code>&quot;right&quot;</code> , <code>&quot;bottom&quot;</code> , <code>&quot;left&quot;</code></td>
<td><code>&quot;bottom&quot;</code></td>
</tr>
<tr>
<td>value</td>
<td>When passing only an <em>Array</em> to the method, this is the variable that actually gets set.</td>
<td><em>Array</em>, <code>false</code></td>
<td><code>false</code></td>
</tr>
</tbody>
</table>
<hr>
### .aggs() - aggs : ( Object)

Defines how specific values should be aggregated when the **d3plus** aggregates your data. The *Object* passed should contain key/value pairs that match the keys in your data with the aggreagation value requested. For example, if you wanted all values of the key "wage" to use D3's "mean" comparator, then you would pass the following:

```js
.aggs({"wage": "mean"})
```

The *String* value passed with each key needs to be one of D3's predefined [array comparators](https://github.com/mbostock/d3/wiki/Arrays#d3_min), such as "mean", "median", "min", or "max". By default, all keys use [d3.sum()](https://github.com/mbostock/d3/Arrays#d3_sum). Additionally, you can also pass a *Function* as an aggregation method for a key. D3plus will pass the *Function* the array of data objects needing aggregation, and the *Function* should return the final aggregated value.
</body></html>
