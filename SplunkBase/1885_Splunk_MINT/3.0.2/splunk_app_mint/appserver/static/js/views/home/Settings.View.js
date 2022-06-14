define(
    [
        'underscore',
        'jquery',
        'backbone',
        'module',
        'views/shared/Modal',
        'app/contrib/text!app/templates/home/settings.template.html',
        'util/splunkd_utils',
        'splunkjs/mvc',
        'splunkjs/mvc/checkboxview',
        'app/models/PartyJsLegal.Model',
        'mint'
    ],

    function(
        _,
        $,
        Backbone,
        module,
        Modal,
        settingsTemplate,
        splunkDUtils,
        mvc,
        CheckboxView,
        PartyJsModel,
        Mint
    )
    {   
        //This view extends the Modal view for creating a dialog box on click Settings icon
        //It has a checkbox corresponding to PartyJS settings (enabled/disabled) for the MINT App
        return Modal.extend({
            template: settingsTemplate,
            moduleId: module.id,
            initialize: function (options) {
                // force backdrop not to close modal on click
                Modal.prototype.initialize.apply(this, arguments);
                this.$button = $();

                //Legal checkbox
                this.children.checkboxview = new CheckboxView({
                    id: "legal-checkbox"
                });

                var that = this.children;
                //create a new kvstore model for PartyJS
                this.model.partyjs = new PartyJsModel({
                        '_user': 'nobody'
                });

                //set an identifier for PartyJS
                this.model.partyjs.set('id', 'enabled');

                //fetchSettings of PartyJS   
                this.fetchSettings = function(){
                    this.model.partyjs.fetch({
                        success: function () {
                            this.children.checkboxview.val(this.model.partyjs.get('value'));
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
                };

            },

            startListening: function() {
            },

            events: {
                'click a.modal-btn-primary:not(.disabled)': 'onSubmit',
                'click #legal-checkbox': 'onCheck'
            },

            //on clicking Submit button of dialog box
            onSubmit: function(e) {
                e.preventDefault();
                var dfd;

                // hide modal when complete 
                $.when(dfd).done(function(){
                    this.render();
                    _.delay(this.hide.bind(this), 250);
                }.bind(this));
            },

            //on change of checkbox on the dialog box. Save settings to kvstore.
            onCheck: function(e) { 
                this.model.partyjs.save({ 
                    value: !this.model.partyjs.get('value'),
                    _key: 'enabled'
                }).error(function(error) { 
                        if (error.status == 409) {
                            console.log('already exists');
                        }else {
                            console.log(error.responseText);
                        }
                }).success(function() {
                    //if enabled, base router will enable partyJS
                    //if not enabled, close the existing session
                    if(!this.model.partyjs.get('value')){
                        Mint.closeSession();
                    }
                }.bind(this));
            },

            render: function () {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Settings").t());

                // activate underlying dialog before rendering
                this.$(Modal.BODY_SELECTOR)
                    .addClass('mint-settings')
                    .append(this.compiledTemplate());
                // add save and cancel buttons
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$button = $(Modal.BUTTON_SAVE);
                this.$(Modal.FOOTER_SELECTOR).append(this.$button);
                //console.log("Renderring...");
                this.fetchSettings();
                this.$(Modal.BODY_SELECTOR).append(this.children.checkboxview.render().el);
                return this;
            }
        });
    }
);