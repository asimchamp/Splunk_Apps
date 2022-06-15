define([
    'jquery',
    'underscore',
    'backbone',
    'app/models/Base.Model',
    'splunk.util',
    'util/splunkd_utils'
], function(
    $,
    _,
    Backbone,
    BaseModel,
    splunkUtils,
    splunkd_utils
) {
    return BaseModel.extend({
        url: 'mint/projects',

        initialize: function(attributes, options) {
            BaseModel.prototype.initialize.apply(this, arguments);

            // populate content name from entry name
            // required to pass validation for existing project
            if (!this.isNew()) {
                this.entry.content.set('name', this.entry.get('name'));
            }

            this.entry.content.validation = {
                'name': {
                    required: true,
                    minLength: 1,
                    msg: _("The project name is required").t()
                },
                'packages': {
                    required: true,
                    minLength: 1,
                    msg: _("At least one app must be selected").t()
                }
            };
            this._populatePackagesFromString();

            // listeners to sync packages attribute with associated packages collection
            this.listenTo(this.associated.packages, 'reset', this._populatePackagesFromCollection);
            this.listenTo(this.associated.packages, 'add', this._populatePackagesFromCollection);
            this.listenTo(this.associated.packages, 'remove', this._populatePackagesFromCollection);
            this.listenTo(this.entry.content, 'change:packages', this._populatePackagesFromString);
        },
        /* will be called upon initialize, fetch and save */
        initializeAssociated: function() {
            BaseModel.prototype.initializeAssociated.apply(this, arguments);

            // associated packages
            this.packages = this.packages || new Backbone.Collection();
            this.associated.packages = this.packages;
        },
        _populatePackagesFromString: function(model, value, options) {
            if (options && options.internalUpdate) { return; }
            var packagesList = (this.entry.content.get('packages') || "").split(',');
            // split() on an empty string returns an array containing one empty string,
            // rather than an empty array. Hence the following extra check.
            packagesList = _.filter(packagesList, function(str) { return str !== ""; });
            this.packages.reset(_(packagesList).map(function(n) {
                return {name: $.trim(n)};
            }), {internalUpdate: true});
        },
        _populatePackagesFromCollection: function(model, collection, options) {
            if (!options) {
                collection = model;
                options = collection;
            }
            if (options && options.internalUpdate) { return; }
            var packagesStr = this.packages.pluck('name').join(',');
            this.entry.content.set({packages: packagesStr}, {
                internalUpdate: true
            });
        },
        genSearchString: function(field) {
            var packages = (this.entry.content.get('packages') || "").split(','),
                search = '';

            search = _.chain(packages)
                .filter(function(s) { return s !== ""; })
                .map(function(p) { return field + ' = \"' + p + '\"'; })
                .join(' OR ')
                .value();

            return '( ' + search + ' )';
        },
        hasSelectedPackages: function() {
            var packagesStr = this.entry.content.get('packages');
            return packagesStr && ($.trim(packagesStr) !== "*");
        }
    });
});
