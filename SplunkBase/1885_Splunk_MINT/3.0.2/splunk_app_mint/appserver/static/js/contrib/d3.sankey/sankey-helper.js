		data = //SPLUNK SEARCH RESULTS IN JSON FORM
		
		this.source_field = "sourceField";
		this.target_field = "targetField";
		this.value_field = "valueField";
		this.safeExtractField = function(row, field) {
			if (row.hasOwnProperty(field)) {
				return row[field];
			}
			else {
				console.log("[SOLNSankey] could not extract field='" + field + "' from row='" + JSON.stringify(row) + "'");
				return null;
			}
		}
		
		//Massage the data into the required format
		//Sankey data format:
		/*
		{
			nodes: [{"name":<DATA_NAME>,{"name":<DATA_NAME_2>,...}],
			links: [{"source": <DATA_NODE_IDX>, "target": <DATA_NODE_INDEX>, "value": <DATA_FLOW_NODE_S_T>}]
		}
		*/
		
		var sankey_data = {
			"nodes" : [],
			"links" : []
		};
		//Establish Nodes and Links
		var node_translation = {},
			node_id = 0,
			source, target, value, row,
			cur_source_id, cur_target_id;
		for (var ii = 0; ii < data.length; ii++) {
			row = data[ii];
			
			source = this.safeExtractField(row, this.source_field);
			if (source === null || source === undefined || source === "") {
				console.log("[SOLNSankey] no non empty source field value, skipping row=" + String(ii));
				continue;
			}
			else if (node_translation.hasOwnProperty(source)) {
				cur_source_id = node_translation[source];
			}
			else {
				node_translation[source] = node_id;
				cur_source_id = node_id;
				sankey_data.nodes.push({"name": source});
				node_id++;
			}
			
			target = this.safeExtractField(row, this.target_field);
			if (target === null || target === undefined || target === "") {
				console.log("[SOLNSankey] no non empty target field value, skipping row=" + String(ii));
				continue;
			}
			else if (node_translation.hasOwnProperty(target)) {
				cur_target_id = node_translation[target];
			}
			else {
				node_translation[target] = node_id;
				cur_target_id = node_id;
				sankey_data.nodes.push({"name": target});
				node_id++;
			}
			
			//Establish Link
			var tmp = {
				"source" : cur_source_id,
				"target" : cur_target_id,
				//FIXME: need to check if nulls cause rendering to break
				"value" : this.safeExtractField(row, this.value_field)
			};
			sankey_data.links.push(tmp);
		}
		
		//Render the Sankey Plot
		var margin = {top: 1, right: 1, bottom: 6, left: 1},
			width = 960 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;
		
		var formatNumber = d3.format(",.0f"),
			format = function(d) { return formatNumber(d); },
			color = d3.scale.category20();
		
		//TODO: May want to try rebinding data for a transitioned update, but for now we just destroy everything
		d3.select("#"+this.moduleId).select(".solnsankey-main-stage").selectAll("g").remove();
		
		var svg = d3.select("#"+this.moduleId).select(".solnsankey-main-stage")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		
		var sankey = d3.sankey()
			.nodeWidth(15)
			.nodePadding(10)
			.size([width, height]);
		
		
		var path = sankey.link();
		
		sankey
			.nodes(sankey_data.nodes)
			.links(sankey_data.links)
			.layout(32);
	
		var link = svg.append("g").selectAll(".link")
			.data(sankey_data.links)
		.enter().append("path")
			.attr("class", "solnsankey-link")
			.attr("d", path)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.sort(function(a, b) { return b.dy - a.dy; });
		
		link.append("title")
			.text(function(d) { return d.source.name + " -> " + d.target.name + "\n" + format(d.value); });
		
		function dragmove(d) {
			d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
			sankey.relayout();
			link.attr("d", path);
		}
		
		var node = svg.append("g").selectAll(".node")
			.data(sankey_data.nodes)
		.enter().append("g")
			.attr("class", "solnsankey-node")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(d3.behavior.drag()
			.origin(function(d) { return d; })
			.on("dragstart", function() { this.parentNode.appendChild(this); })
			.on("drag", dragmove));
	
		node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", sankey.nodeWidth())
			.style("fill", function(d) {
				//Silly code change made to pass linter 
				var ret_val = d.color = color(d.name.replace(/ .*/, "")); 
				return ret_val;
			})
			.style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
		.append("title")
			.text(function(d) { return d.name + "\n" + format(d.value); });
	
		node.append("text")
			.attr("x", -6)
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "end")
			.attr("transform", null)
			.text(function(d) { return d.name; })
		.filter(function(d) { return d.x < width / 2; })
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");
