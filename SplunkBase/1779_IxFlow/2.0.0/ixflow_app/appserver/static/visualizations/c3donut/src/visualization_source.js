define([
            'jquery',
            'underscore',
            'vizapi/SplunkVisualizationBase',
            'vizapi/SplunkVisualizationUtils',
            'd3',
            'c3',
            'guid'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3,
            c3,
            Guid
        ) {

    return SplunkVisualizationBase.extend({

        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);

            // Add a css selector class
            this.$el.attr('id',Guid.create().value);
        },

        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },



        updateView: function(data, config) {
                    // Guard for empty data

                    var width=config["display.visualizations.custom.Ixia.c3donut.width"]
                    var expand= (config["display.visualizations.custom.Ixia.c3donut.expand"]==1) ? true: false;
                    var legend_show=(config["display.visualizations.custom.Ixia.c3donut.legend_show"]==1) ? true: false;
                    var legend_position=config["display.visualizations.custom.Ixia.c3donut.legend_position"]
                    //expand=config["display.visualizations.custom.Ixia.c3donut.expand"]
                    var label_show= (config["display.visualizations.custom.Ixia.c3donut.label_show"]==1) ? true : false ;
                    var label_value=config["display.visualizations.custom.Ixia.c3donut.label_value"]
                    var label_format=config["display.visualizations.custom.Ixia.c3donut.label_format"]
                    var label_threshold=parseFloat(config["display.visualizations.custom.Ixia.c3donut.label_threshold"])
                    var label_format_func;
                    if (label_value=="value"){
                      label_format_func=function (value, ratio, id) {
                        return d3.format(label_format)(value);
                      }
                    }
                    else{
                      label_format_func=function (value, ratio, id) {
                        return d3.format(label_format)(ratio);
                      }
                    }

                    var tooltip_value=config["display.visualizations.custom.Ixia.c3donut.tooltip_value"]
                    var tooltip_format=config["display.visualizations.custom.Ixia.c3donut.tooltip_format"]
                    if (tooltip_value=="default"){
                      tooltip_format_func=function (value, ratio, id) {
                          return value + ' (' + d3.format(tooltip_format)(ratio) + ')';
                      }
                    }
                    else if (tooltip_value=="value"){
                      tooltip_format_func=function (value, ratio, id) {
                        return d3.format(tooltip_format)(value);
                      }
                    }
                    else{
                      tooltip_format_func=function (value, ratio, id) {
                        return d3.format(tooltip_format)(ratio);
                      }
                    }
                    var d=[];
                    for (i in data.rows){
                     row=data.rows[i];
                     if (row["0"]!= undefined) {
                      el=[row["0"],parseInt(row["1"].replace(/,/g, ""))];
                      d.push(el)
                     }
                    }
                    console.log(d)

                    // Clear the div
                    this.$el.empty();
                    var path=this.$el;
                    var chart = c3.generate({
                      data: {
                          columns: d,
                          type : 'donut',
                          onclick: function (d, i) { console.log("onclick", d, i); },
                          onmouseover: function (d, i) { console.log("onmouseover", d, i); },
                          onmouseout: function (d, i) { console.log("onmouseout", d, i); }
                      },
                      donut: {
                          title: data.fields[1]["name"],
                          expand:expand,
                          width:width,
                          label:{
                            show:label_show,
                            format:  label_format_func,
                            threshold: label_threshold
                            }
                      },
                      tooltip:{
                        format:{
                          value:tooltip_format_func
                        }
                      },
                      legend:{
                        show:legend_show,
                        position: legend_position
                      }
                    });
                    this.$el.append(chart.element);
                }
    });
});
