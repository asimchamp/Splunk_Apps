

define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    var PostProcessManager = require('splunkjs/mvc/postprocessmanager');
    var SearchManager = require('splunkjs/mvc/searchmanager');
    var picker = require('torque/jqColorPicker');

    var TORQUE_FRAME_COUNT = 128;

    var torqueLayer;

    var dragging = false;

    var DemoView = SimpleSplunkView.extend({
        className: "demoview",

        options: {
            basemap: "light_all"
        },

        initialize: function() {
            var that = this;
            this.configure();
            this._viz = null;
            this._data = null;
            this.bindToComponentSetting('managerid', this._onManagerChange, this);
            
            // If we don't have a manager by this point, then we're going to
            // kick the manager change machinery so that it does whatever is
            // necessary when no manager is present.
            if (!this.manager) {
                this._onManagerChange(mvc.Components, null);
            }

            $('.colorPicker').colorPicker();

            //re-render css on changes to options
            $('#markerFill, #markerSize, #markerTrails, #markerOpacity, #borderSize, #borderFill, #borderOpacity').blur(function() {
              
                that.updateCSS(that.renderCSS());
            });

            $('#markerType').change(function() {
                that.updateCSS(that.renderCSS());
            })

            this.initCSSinputs();
            

        },
        
        initCSSinputs: function() {
            //gets saved cartoCSS from localStorage, set all the UI inputs
            var o = JSON.parse(localStorage.getItem('cartocssOptions'));
           
            if(o) {
                //update all the things
                $('#markerType').val(o.markerType);
                $('#markerFill').css('background-color',o.markerFill);
                $('#markerSize').val(o.markerSize);
                $('#markerOpacity').val(o.markerOpacity);
                $('#borderFill').css('background-color',o.borderFill);
                $('#borderSize').val(o.borderSize);
                $('#borderOpacity').val(o.borderOpacity);
                $('#markerTrails').val(o.numTrails);  
            }

    
        },

        displayMessage: function(info) {
            return this;
        },

        createView: function () {
            console.log('createView()');
            var that=this;

            //initialize map and base layers
            this.map = new L.Map(this.id, {
                fullscreenControl: true,
                scrollWheelZoom: false,
                center: [25, 0],
                zoom: 1
            });

            var positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            });

            var darkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }).addTo(this.map);


            //wire up the buttons for basemap toggling
            $("#dark, #light").change(function(e) {
                if(e.target.id=='light') {
                    that.map.removeLayer(darkMatter);
                    that.map.addLayer(positron);
                };

                if(e.target.id=='dark') {
                    that.map.removeLayer(positron);
                    that.map.addLayer(darkMatter);
                };
            });
            // var baseLayers = {
            //     'Light Basemap': positron,
            //     'Dark Basemap': darkMatter 
            // };

            // var layerControl = L.control.layers(baseLayers, {})
            // layerControl.addTo(this.map);
    
            //for debugging bins
            //this.rectsLayer = L.layerGroup().addTo(this.map);

            //var that = this;
            // this.map.on('zoomend',function() {
            //     that.rectsLayer.clearLayers();
            // })

            return this;    
        },

        updateView: function (viz, data) {
            console.log("updateView()");
            var that = this;

            console.log(data);

            if (data[0][2] == null || data[0][4] == null || data[0][1] == null || data[0][3] == null ) {
                $('.searchMessage').html('<span class="error">This Search did not yield valid geo bounds.  Make sure <i>latitude</i> and <i>longitude</i> are present in the results</span>')
                $('.dashboard-zerocase').fadeIn();

            } else if (data[0][0]==null) {
                console.log('Invalid Search, did not find _time range')
                $('.dashboard-zerocase').formatDateToString();
            } else {



                // fitbounds on the map BEFORE creating the torquelayer so torque doesn't ask for tiles from the initial view
                this.map.fitBounds([
                    [data[0][2], data[0][4]],
                    [data[0][1], data[0][3]]
                ]);


                //show the map (hide the placeholder)
                $('.dashboard-zerocase').fadeOut();
                $('.searchMessage').html('<span class="success">Valid Search, Rendering Torque Animation</span>')


                var cartoCSS = this.renderCSS();
                console.log('Initial cartoCSS: ', cartoCSS)

                //init new torque layer
                if(this.torqueLayer) {this.map.removeLayer(this.torqueLayer)};
                this.torqueLayer = new L.TorqueLayer({
                    cartocss: cartoCSS,
                    provider: 'splunk'
                });
                this.torqueLayer.setZIndex(5);
                this.torqueLayer.addTo(this.map);

                this.torqueLayer.on('change:time', function(changes) {
                    
                    var t = changes.time;
                    

                    $('.torque-container-time>p').text(formatDateToString(t));
                  
                });

                function formatDateToString(date){
                   // 01, 02, 03, ... 29, 30, 31
                   var dd = (date.getDate() < 10 ? '0' : '') + date.getDate();
                   // 01, 02, 03, ... 10, 11, 12
                   var MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
                   // 1970, 1971, ... 2015, 2016, ...
                   var yyyy = date.getFullYear();

                   // create the format you want
                   return (MM + "/" + dd + "/" + yyyy);
                }

                //torque slider things
                updateSlider = function (event) {
                    var width = parseInt(event.step * 100 / parseInt(TORQUE_FRAME_COUNT));
                    $(".torque-timeline-progress").width(width + "%");
                };

                this.torqueLayer.on('change:time', updateSlider);

                //play/pause button
                $('#torque_control').click(function () {
                    if (that.torqueLayer.isRunning()) {
                        that.torqueLayer.pause();
                        $("#torque_control span").removeClass("torque-pause");
                        $("#torque_control span").addClass("torque-play");
                    } else {
                        that.torqueLayer.play();
                        $("#torque_control span").removeClass("torque-play");
                        $("#torque_control span").addClass("torque-pause");
                    }
                });

                
                //given pageX for an event, redraw the slider and set the animation to the corresponding step 
                var setTorqueStepFromOffset = function (pageX) {

                    //slider offset = pageX of click event - left position of slider
                    var offset = pageX - $('.torque-timeline-inner').offset().left;

                    //draws the "completed" side of the progress bar
                    $(".torque-timeline-progress").width(offset);
                    
                    //get the step number based on the offset
                    that.torqueLayer.setStep(parseInt(TORQUE_FRAME_COUNT * offset / $('.torque-timeline-inner').width())
                    );
                };

                //when the user clicks in the slider, update animation and slider, prepare for dragging
                $('.torque-timeline-inner').mousedown(function (e) {
                    if (e.target != $(this)) {  
                        that.torqueLayer.pause();

                        e.pageX += $(".torque-timeline-progress span").width();

                        setTorqueStepFromOffset(e.pageX);
                        dragging = true;
                    }
                });

                //if user releases the mouse over the slider button, continue playing
                $('.torque-timeline-progress span').mouseup(function (e) {
                    that.torqueLayer.play();
                    dragging = false;
                });
               
                //listen to mousemove on the body for dragging
                //update animation and slider accordingly
                $('body').mousemove(function (e) {
                    if (dragging) {
                        setTorqueStepFromOffset(e.pageX);
                    }
                //on mouseup, end dragging and continue playing the animation
                }).mouseup(function (e) {
                    if (dragging) {
                        dragging=false;

                        that.torqueLayer.play();
                    }
                 });
                
                //get the user's query
                var searchQuery = this.manager.attributes.data.eventSearch;

                // prepare a string for the timespan
                var span = parseInt(data[0][0]) + 's';

         

                //pass SearchManager class, user's query, and timespan to the torque provider
                this.torqueLayer.provider.setManager(SearchManager,searchQuery,span);
                //kick things off!
                that.torqueLayer.provider._setReady();

                //show the slider TODO only show it when the data appears on the screen?
                $('#torque_container').show();
            }
        },

        renderCSS: function() {
            console.log('renderCSS()');

            //#markerFill, #markerSize, #markerTrails, #markerOpacity, #borderSize, #BorderFill, #borderOpacity

            //read options from DOM
            var options = {
                markerType: $('#markerType').val(),
                markerFill: $('#markerFill').css('background-color'),
                markerSize: $('#markerSize').val(),
                markerOpacity: $('#markerOpacity').val(),
                borderFill: $('#borderFill').css('background-color'),
                borderSize: $('#borderSize').val(),
                borderOpacity: $('#borderOpacity').val(),
                numTrails: $('#markerTrails').val()
            }

            localStorage.setItem('cartocssOptions',JSON.stringify(options));
            
        

                //TODO make this dynamic
            var cartoCSSpre = 'Map { -torque-frame-count:' + TORQUE_FRAME_COUNT+ '; -torque-animation-duration:10; -torque-time-attribute:"time"; -torque-aggregation-function:"count(cartodb_id)"; -torque-resolution:2; -torque-data-aggregation:linear; } ';

            var cartocssTemplate = _.template('#torquedata{ comp-op: lighter; marker-fill-opacity: <%- markerOpacity %>; marker-line-color: <%- borderFill %>; marker-line-width: <%- borderSize %>; marker-line-opacity: <%- borderOpacity %>; marker-type: <%- markerType %>; marker-width: <%- markerSize %>; marker-fill: <%- markerFill %>; } ');



            //calculate trails

            var trailsTemplate = _.template('#torquedata[frame-offset=<%- offset %>] { marker-width:<%- width %>; marker-fill-opacity:<%- opacity %>; } ')


            var n = options.numTrails;

            var opacityDelta = parseFloat(options.markerOpacity) / n;

            var sizeDelta = 2; //increase radius by 2 for each frame

            var trailscss = '';
            for(var i=0; i<n; i++) {
                var o = i+1
                var trailsOptions = {
                    offset: o,
                    width: parseFloat(options.markerSize) + (sizeDelta * o),
                    opacity: parseFloat(options.markerOpacity) - (opacityDelta * o)
                }
                trailscss += trailsTemplate(trailsOptions);
            }

  

            var cartocss = cartoCSSpre + cartocssTemplate(options) + trailscss;


            return cartocss;
        },

        updateCSS: function(cartocss) {
            console.log("Applying new CartoCSS", cartocss)
            this.torqueLayer.setCartoCSS(cartocss);
        }

    });

    return DemoView;
});
