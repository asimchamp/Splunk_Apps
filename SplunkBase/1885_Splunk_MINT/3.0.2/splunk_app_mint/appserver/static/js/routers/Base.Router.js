define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/Base',
        'models/classicurl',
        'app/models/Project.Model',
        'app/collections/Projects.Collection',
        'app/views/projects/ProjectMenu.View',
        'util/splunkd_utils',
        'splunk.util',
        'app/models/PartyJsLegal.Model',
        'mint',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        BaseRouter,
        classicUrlModel,
        ProjectModel,
        ProjectsCollection,
        ProjectMenuView,
        splunkd_utils,
        splunk_utils,
        PartyJsModel,
        Mint
    ) {
        var CLASSICURL_PERSISTENCY_INCLUDELIST = /^proj|(filters\..*)$/;

        return BaseRouter.extend({
            initialize: function(title) {
                BaseRouter.prototype.initialize.apply(this);
                this.controllers = this.controllers || {};
                this.model.appLocal.fetch();

                // configuration
                this.enableProjectMenu = false; // requires enableAppBar=true (default)
                this.fetchProjects = true;
                this.fetchUser = true;
                this.enableAppBar = true;

                var app = this.model.application.get("app") || this.getApp(),
                    owner = this.model.application.get("owner"),
                    namespace = {namespace: {app: app}}, // Use app namespace only
                    proxyOptions = {appData: {proxy: app, app: app, owner: owner}};

                //create a new kvstore model for PartyJS
                this.model.partyjs = new PartyJsModel({
                        '_user': 'nobody'
                });
                //set an identifier for PartyJS
                this.model.partyjs.set('id', 'enabled');
                //initialize PartyJS if settings is on
                this.model.partyjs.fetch({
                    success: function () {
                        if(this.model.partyjs.get('value')){
                            Mint.initAndStartSession({apiKey: 'd404b30e'});
                            Mint.setUserIdentifier(app);
                            Mint.addURLPatternToBlackList('/splunkd/__raw');
                        }
                    }.bind(this),
                    error: function() {
                        console.log('error fetching settings');
                        this.model.partyjs.unset('id');
                        this.model.partyjs.set('_key', 'enabled');
                        this.model.partyjs.save({
                            value: false,
                            _key: 'enabled'
                        }).error(function(error){
                            console.log(error.responseText);
                        }).success(function(){
                            console.log("Successfully stored the new settings");
                        });
                    }.bind(this)
                });

                title = title || "Splunk";
                this.title = _(title).t();
                this.setPageTitle(this.title);

                this.model.classicUrl = classicUrlModel;
                this.model.project = void 0;

                this.collection.projects = new ProjectsCollection([], proxyOptions);

                this.deferreds.projects = $.Deferred();

                $(window).resize(_.debounce(function(){
                    this.setBodyMinHeight();
                }.bind(this), 0));

            },
            _page: function(locale, app, page){
                $('.preload').replaceWith(this.pageView.el);

                if (this.enableAppBar) {
                    var appNav = this.pageView.children.appBar.children.appNav,
                        appNavList = this.model.appNav.get('nav');

                    if (this.enableProjectMenu) {
                        // populate model.project based on classic url
                        this.setProjectFromClassicUrl();

                        // create project menu view
                        this.views.projectMenuView = new ProjectMenuView({
                            collection: {
                                projects: this.collection.projects
                            },
                            model: {
                                project: this.model.project,
                                classicUrl : this.model.classicUrl
                            }
                        }).render();

                        // Remove home menu item from nav bar
                        // Note: home view must remain in nav/default.xml to leverage
                        // built-in redirect to home page whenever visiting app link
                        appNav.$('li.nav-item-home').remove();
                        // Prepend project menu dropdown
                        appNav.$el.prepend(this.views.projectMenuView.$el);
                        // Use consistent copy of nav data, i.e. without first home object
                        appNavList = appNavList.slice(1);
                    }

                    // Fix app nav items with submenu by adding correct nav-item- class
                    // (NavItem.render mistakently assumes each item has viewName)
                    // Necessary to set the right item as active including submenu items
                    // TODO: bug against core
                    _.each(appNavList, function(navItem, index) {
                        if (navItem.submenu) {
                            var $navItem = appNav.$('li.shared-appbar-navitem:eq('+ index +')');
                            $navItem.removeClass('nav-item-undefined');
                            _.each(navItem.submenu, function(subMenuItem) {
                                if (subMenuItem.viewName) {
                                   $navItem.addClass('nav-item-' + subMenuItem.viewName);
                                }
                            });
                        }
                    });
                    appNav.setActiveItem();

                    // Update menu item links based on classicUrl state in order to persist
                    // filters in session. Also listen to such classicUrl filters changes
                    this.updateAppNavMenuLinks();
                    this.updateSplunkHeaderLinks();
                    this.listenTo(this.model.classicUrl, 'change', function() {
                        var filterAttrs,
                            changedAttrs,
                            changedFilterAttrs;

                        // Filter classicUrl changed attributes to filters-related ones...so meta!
                        filterAttrs = this.model.classicUrl.filterByWildcards(CLASSICURL_PERSISTENCY_INCLUDELIST);
                        changedAttrs = this.model.classicUrl.changedAttributes();
                        

                        // Do nothing if none of the filter attributes have changed
                        changedFilterAttrs = _.pick(changedAttrs, _.keys(filterAttrs));
                        if (!_.isEmpty(changedFilterAttrs)) {
                            this.updateAppNavMenuLinks();
                        }
                    });
                }

                this.onPageReady(locale, app, page);
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                this.model.classicUrl.fetch(); // synchronous

                if (this.enablePageView) {
                    // fetch all projects
                    this.bootstrapProjects();

                    $.when(this.deferreds.projects, this.deferreds.pageViewRendered).then(function() {
                        // append to view once main page rendered
                        _.defer(function() {
                            this._page(locale, app, page);
                        }.bind(this));
                    }.bind(this));
                }
            },
            setBodyMinHeight: function() {
                this.minHeight = this.pageView.$('header').height() + $(window).height();
                $('body').css('min-height', this.minHeight);
            },
            // derived classes should implement this as well
            // and call the superclass via prototype
            onPageReady: function(){
                // This is used to provide simpler fetch calls
                // TODO: refactor so this is no longer used
                // as a model attribute. Instead, we should
                // set this.model.application as a property on the
                // model object.
                this.appData = {
                    app: this.model.application.get("app"),
                    owner: this.model.application.get("owner")
                    // root: this.model.application.get('root'),
                    // locale: this.model.application.get('locale')
                };
            },
            /*
             * Override parent BaseRouter to ignore splunkd partials
             * and force a model fetch since splunkd partial for appLocal
             * is incomplete & unreliable
             */
            bootstrapAppLocal: function() {
                var app = this.model.application.get('app');
                if (this.deferreds.appLocal.state() !== 'resolved') {
                    if (this.fetchAppLocal && (app !== 'system')) {
                        this.model.appLocal.fetch({
                            url: splunkd_utils.fullpath(this.model.appLocal.url + "/" + encodeURIComponent(app)),
                            data: {
                                app: app,
                                owner: this.model.application.get("owner")
                            },
                            success: function(model, response) {
                                this.deferreds.appLocal.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.appLocal.resolve();
                            }.bind(this)
                        });
                    } else {
                        this.deferreds.appLocal.resolve();
                        this.model.appLocal = undefined;
                    }
                }
            },
            bootstrapProjects: function() {
                if (this.deferreds.projects.state() !== 'resolved') {
                    if (this.fetchProjects) {
                        this.collection.projects.fetch({
                            data: {
                                count: -1,
                            },
                            success: function(collection, response) {
                                this.deferreds.projects.resolve();
                            }.bind(this),
                            error: function(collection, response) {
                                this.deferreds.projects.resolve();
                            }.bind(this)
                        });
                    } else {
                        this.deferreds.projects.resolve();
                        this.collection.projects = undefined;
                    }
                }
            },
            setProjectFromClassicUrl: function() {
                // initialize project model based on query param
                // otherwise, default to first project e.g. 'All Data' if none specified
                var projectNameFromUrl = this.model.classicUrl.get('proj');
                if (projectNameFromUrl) {
                    this.model.project = this.collection.projects.findByName(projectNameFromUrl);
                }

                if (!this.model.project) {
                    // pick first project
                    this.model.project = this.collection.projects.at(0);
                    this.model.classicUrl.save({
                        proj: this.model.project.entry.get('name')
                    }, {
                        replaceState: true
                    });
                }
            },

            updateSplunkHeaderLinks: function(){
                 var version = this.model.serverInfo.getVersion() || undefined;
                 if (version) {
                    if (parseFloat(version) <= 6.4) {
                        var job_link = $("a[data-role='jobs-link']")[0];
                        $(job_link).attr("href", '/en-US/app/splunk_app_mint/job_management');
                    }
                 }
            },
            /**
             * Update links in app bar navigation items to reflect query params from classicUrl attributes
             */
            updateAppNavMenuLinks: function() {
                // Filter classicUrl attributes to filters-related ones...so meta!
                var filterAttrs = this.model.classicUrl.filterByWildcards(CLASSICURL_PERSISTENCY_INCLUDELIST);

                // Append classicUrl to all Nav links except Home, Reports, Search and Pivot
                this.pageView.children.appBar.children.appNav.$('a[href!="#"]').each(function() {
                    if(this.title!=='Home' && this.title!=='Reports' && this.title!=='Search' && this.title!=='Pivot'){
                        var $this = $(this),
                            href = $this.attr('href'),
                            qPos, qStr, pStr, qProps = {};

                        if (!href) { return true; }

                        qPos = href.indexOf('?');
                        if (qPos != -1) {
                            qStr = href.substr(qPos);
                            pStr = href.substr(0, qPos);
                            qProps = splunk_utils.queryStringToProp(qStr);
                        } else {
                            pStr = href;
                        }
                        $.extend(qProps, filterAttrs);

                        qStr = splunk_utils.propToQueryString(qProps);
                        $this.attr('href', pStr + '?' + qStr);
                    }
                });
            },
            isAdminUser: function () {
                var roles = this.model.user.entry.content.get('roles') || [];
                return (_.intersection(roles,["admin", "mint_admin"]).length > 0);
            },
            getApp: function() {
                if(! this.model.application.has('app')) {

                    var segments =  window.location.pathname.split("/"),
                        locale = segments[1],
                        app = segments[3],
                        page = segments[4];

                    // Monkey patch it should be fixed to use Splunk.utils to undedify the custom root.
                    if (Splunk.util.getConfigValue('MRSPARKLE_ROOT_PATH', '/') !== "" ) {
                        locale = segments[2];
                        app = segments[4];
                        page = segments[5];
                    }

                    this.model.application.set({
                        locale: locale,
                        app: app,
                        page: page.split('?')[0]
                    });

                }
                return this.model.application.get("app");
            }
        });
    }
);
