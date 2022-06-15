 var map;
    var mapOptions = {
        zoom: 1,
        center: [0, 0]
    };

    map = new L.Map('map', mapOptions);

    L.tileLayer('http://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png').addTo(map);

    //for earthquake2
    var CARTOCSS = 'Map { -torque-frame-count:128; -torque-animation-duration:10; -torque-time-attribute:"time"; -torque-aggregation-function:"count(cartodb_id)"; -torque-resolution:2; -torque-data-aggregation:linear; } #earthquake2{ comp-op: lighter; marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 0; marker-line-opacity: 1; marker-type: ellipse; marker-width: 3; marker-fill: #FF9900; } #earthquake2[frame-offset=1] { marker-width:5; marker-fill-opacity:0.45; } #earthquake2[frame-offset=2] { marker-width:7; marker-fill-opacity:0.225; }';

    //for torquetest
    // var CARTOCSS = 'Map { -torque-frame-count:512; -torque-animation-duration:1; -torque-time-attribute:"cartodb_id"; -torque-aggregation-function:"count(cartodb_id)"; -torque-resolution:2; -torque-data-aggregation:linear; } #untitled_table_5{ comp-op: lighter; marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1.5; marker-line-opacity: 1; marker-type: ellipse; marker-width: 6; marker-fill: #FF9900; } #untitled_table_5[frame-offset=1] { marker-width:8; marker-fill-opacity:0.45; } #untitled_table_5[frame-offset=2] { marker-width:10; marker-fill-opacity:0.225; }';

    // $('button').on('click',function(){
        var torqueLayer = new L.TorqueLayer({
        // user       : 'chriswhong',
        // table      : 'earthquake2',
        cartocss: CARTOCSS,
        provider: 'splunk'
       
      });

      torqueLayer
      .addTo(map);
 

      torqueLayer.play()
    // });
