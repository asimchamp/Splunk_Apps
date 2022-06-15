define([
    "jquery",
    "underscore",
    "splunkjs/mvc/mvc",
    "./chart_utils",
    "js_charting/util/time_utils",
    "splunkjs/mvc/messages",
    "splunkjs/mvc/simplesplunkview",
    "highcharts"
], function(
    $,
    _,
    mvc,
    chart_utils,
    time_utils,
    Messages,
    SimpleSplunkView,
    Highcharts
){

  var minutesOrHours = new RegExp(/\-\d+[mh]@[mh]|-1d@d|^@d$|\-\d+m$/);

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  var OPTIONS_INCLUDELIST = [
    'percentageResult',
    'durationResult',
    'multiSeries'
  ];

  /* Custom Chart View for Splunksense dashboard */
  var MintChartView = SimpleSplunkView.extend({
      className: "boilerplate",
      outputMode: "json_rows",
      options: {
          data: "preview",
          //This will be your main search manager that is hooked into your rendering
          managerid: undefined,
          //Custom stuff should be defined here for clarity
          x_field: undefined,
          errorPage: undefined,
          title: undefined,
          rowType: "int"
      },
      initialize: function (options) {
          SimpleSplunkView.prototype.initialize.apply(this, arguments);

          options = options || {};

          this.options.chartOptions = $.extend(true, {}, chart_utils.defaultChartOptions, options.chartOptions);
          // fill in view argument without changing dynamic this value when formatters are called
          this.options.chartOptions.tooltip.pointFormatter = _.partial(this.options.chartOptions.tooltip.pointFormatter, this);
          this.options.chartOptions.tooltip.keyFormatter = _.partial(this.options.chartOptions.tooltip.keyFormatter, this);
          this.options.chartOptions.tooltip.formatter = _.partial(this.options.chartOptions.tooltip.formatter, this);
          this.options.chartOptions.xAxis.labels.formatter = _.partial(this.options.chartOptions.xAxis.labels.formatter, this);
          this.options.chartOptions.yAxis.labels.formatter = _.partial(this.options.chartOptions.yAxis.labels.formatter, this);

          this.dateFormat = '%d %b %Y';

          _.each(OPTIONS_INCLUDELIST, function (key) {
              if (options[key]) {
                  this.options[key] = options[key];
              } else {
                  this.options[key] = null;
              }
          }, this);

          if (options.output_mode) {
              this.output_mode = options.output_mode;
          }

          if (options.formatData) {
              this.formatData = _.bind(options.formatData, this);
          }

      },
      changeTimeFormat: function () {
          if (this.originalCategories) {
              var pointSpan = time_utils.getPointSpan(this.originalCategories);

              if(pointSpan < 86400) {
                  this.dateFormat = '%d %b %H:%M';
              } else if (pointSpan >= 2592000) {
                  this.dateFormat = '%b %Y';
              } else {
                  this.dateFormat = '%d %b %Y';
              }
          }
      },
      formatResults: function(resultsModel) {
          if (!resultsModel) {
              return {fields: [],
                  rows: [[]],
                  parse_error: true
              };
          }

          // First try the legacy one, and if it isn't there, use the real one.
          var outputMode = this.output_mode || this.outputMode;
          var data_type = this.data_types[outputMode];
          var data = resultsModel.data();

          this.originalCategories = this.extractCategories(data);
          //override to return fields as well, thus our data looks like: {fields: [fieldname1, fieldname2, ...], rows: [row1_array, row2_array, ...]}
          //
          return this.formatData({
              rows: data[data_type],
              fields: data.fields,
              parse_error: false
          });
      },
      extractCategories: function (data) {
          
          //console.log(data)
          var categories;
          if (data.rows) {
              categories = _.map(data.rows, function (row) {
                  return row[0];
              });
          } else if (data.results) {
              categories = _.pluck(data.results, "_time");
          }

          return _.uniq(categories);
      },
      formatCellType: function (value) {
          var type = this.options.rowType;
          if (_.isNull(value) || _.isUndefined(value)) {
              return null;
          }
          if (type === "string") {
              return value;
          } else if (type === "int") {
              return parseInt(value);
          } else if (type === "float" ||
                     type === "date"
                    ) {
                        return parseFloat(value);
                    }
      },
      _formatMultiSeriesData: function (data) {
          var series = {},
          times = [];

          // Extracting every series that we will get
          var keys = _.pluck(data.fields, "name");

          _.each(data.rows, function(row) {
              times.push(new Date(row._time).getTime());

              _.chain(keys)
              .difference(_.keys(row))
              .each(function (key) {
                  row[key] = null;
              });

              _.chain(row)
              .omit(['_span', '_spandays', '_time'])
              .each(function (val, key) {
                  val = this.formatCellType(val);
                  if (!series[key]) {
                      series[key] = [];
                  }
                  series[key].push(val);
              }, this);

          }, this);

          return _.map(series, function (row, key) {
              return {
                  name: key,
                  data: _.zip(times, row)
              };
          });
      },
      _formatDurationSeriesData: function (data) {
          var durations = _.map(data.rows, function (row) {
              return {
                  x: new Date(row[0]).getTime(),
                  y: this.formatCellType(row[1]),
                  label: row[2]
              };
          }, this);

          return {
              name: this.options.title,
              data: durations
          };
      },
      _formatNormalData: function(data) {
          var originalCategories = [];
          var series = _.map(data.rows, function(row) {
              return [new Date(row[0]).getTime(), this.formatCellType(row[1])];
          }, this);

          return [{
              name: this.options.title,
              data: series
          }];
      },
      formatData: function (data) {
          if (this.options.multiSeries) {
              return this._formatMultiSeriesData(data);
          } else if (this.options.durationResult) {
              return this._formatDurationSeriesData(data);
          } else {
              return this._formatNormalData(data);
          }
      },
      createView: function() {
          this.options.chartOptions.chart.renderTo = this.$el[0];

          if (this.options.percentageResult) {
              this.options.chartOptions.yAxis.max = 100;
          } else {
              delete this.options.chartOptions.yAxis.max;
          }

          this.chart = new Highcharts.Chart(this.options.chartOptions);

          return this.chart;
      },
      updateView: function(viz, data) {
          this.changeTimeFormat();
          while(viz.series.length > 0)
              viz.series[0].remove(true);

          if (!_.isArray(data)) {
              data = [data];
          }

          _.each(data, function (series) {
              viz.addSeries(series);
          });
      }

  });

  return MintChartView;
});

