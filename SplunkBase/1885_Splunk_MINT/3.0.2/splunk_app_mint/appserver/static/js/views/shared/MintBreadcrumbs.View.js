define([
    "jquery",
    "underscore",
    "backbone",
    "views/Base",
    "app/contrib/text!app/templates/shared/breadcrumbs.template.html"
], function(
    $,
    _,
    Backbone,
    BaseView,
    BreadcrumbsTemplate
){
  return BaseView.extend({

    template: BreadcrumbsTemplate,

    /**
      * @param {Object} options {
      *     model: {
      *         classicUrl: <models/shared/classicUrl>,
      *     },
      *     title: <String>,
      *     breadcrumbs: <Array> e.g. ['domain', 'path']
      *     defaultValues: <Object> e.g. {domain: '*'}
      * }
      */
    initialize: function () {
        BaseView.prototype.initialize.apply(this, arguments);

        // BaseView constructor already assigns options argument to this.options
        this.title = this.options.title;
        this.breadcrumbs = this.options.breadcrumbs;
        this.defaultValues = this.options.defaultValues || {};

        if (this.options.labelFormatter) {
          this.labelFormatter = _.partial(this.options.labelFormatter, this);
        }

        this.listenTo(this.model.classicUrl, 'change', this.onChangeClassicUrl);
    },

    events: {
      "click li:first-child": "_onTitleClick",
      "click li:not(:first-child)": "_onBreadcrumbClick"
    },

    onChangeClassicUrl: function(model) {
      var changedAttributes = this.model.classicUrl.changedAttributes(),
          changedBreadcrumbs;

      changedBreadcrumbs = _.pick(changedAttributes, this.breadcrumbs);
      if (changedBreadcrumbs) {
        this.render();
      }
    },

    _onTitleClick: function (e) { 
      e.preventDefault();
      this._unsetTokens(this.breadcrumbs);
    },

    _onBreadcrumbClick: function (e) {
      e.preventDefault();
      var id = this.$(e.currentTarget).data('id');
      this._unsetTokens(_.rest(this.breadcrumbs), id);
    },

    _unsetTokens: function (tokens) {
      var defaultValues = this.defaultValues,
          classicUrl = this.model.classicUrl,
          attrs = {};

      _.each(tokens, function (key) {
        if (_.has(defaultValues, key)) {
          attrs[key] = defaultValues[key];
        } else {
          classicUrl.unset(key);
        }
      });

      if (attrs) {
        classicUrl.save(attrs);        
      }
    },

    serializeData: function () {
      var data = _.chain(this.breadcrumbs)
        .map(function(key) {
          return this.labelFormatter(this.model.classicUrl.get(key));
        }, this)
        .compact()
        .without('*')
        .uniq()
        .value();

      data.unshift(this.title);

      return data;
    },

    labelFormatter: function (value) {
      return value;
    },

    render: function () {
        this.$el.html(this.compiledTemplate({data: this.serializeData()}));

        return this;
    }
  });

});

