L.mapbox.accessToken = 'pk.eyJ1Ijoia2tzMzIiLCJhIjoiY2lsdXc5a2xwMDA2ZXcxbTZoMm5jZTIwcyJ9.CDYFvqPWF2TzCrJGMjl9sQ';
var map = L.mapbox.map('map', 'mapbox.light', {attributionControl: false,
    legendControl: {
        // Any of the valid control positions:
        // https://www.mapbox.com/mapbox.js/api/v2.4.0/l-control/#control-positions
        position: 'bottomright'
    }}).setView([15., 65.], 4);

var popup = new L.Popup({ autoPan: false });

// Fasicularis
var fascicularis_scale = 1;

var fasciularis_circlemarkers =
  L.mapbox.featureLayer(
    fascicularis,
      {
        pointToLayer : function(feature) {
          return L.circleMarker(
            feature.geometry.coordinates,
              {
                radius : feature.properties.scale * fascicularis_scale,
                fillColor : feature.properties.colour,
                color : feature.properties.colour,
                fillOpacity : 0.9
              })
                .bindPopup("<strong><i>" + feature.properties.species +
                           "</i></strong><br/>Specimen #: " +
                           feature.properties.specimen);
        }
      });


// Mulatta
var mulatta_scale = 1;
var mulatta_circlemarkers =
  L.mapbox.featureLayer(
    mulatta,
      {
        pointToLayer : function(feature) {
          return L.circleMarker(
            feature.geometry.coordinates,
              {
                radius : feature.properties.scale * mulatta_scale,
                fillColor : feature.properties.colour,
                color : feature.properties.colour,
                fillOpacity : 0.9
              })
                .bindPopup("<strong><i>" + feature.properties.species +
                           "</i></strong><br/>Specimen #: " +
                           feature.properties.specimen);
        }
      });

// nemestrina
var nemestrina_scale = 1;
var nemestrina_circlemarkers =
 L.mapbox.featureLayer(
   nemestrina, {
     pointToLayer: function(feature) {
       return L.circleMarker(
           feature.geometry.coordinates, {
             radius: feature.properties.scale * nemestrina_scale,
             fillColor: feature.properties.colour,
             color: feature.properties.colour,
             fillOpacity: 0.9
           })
         .bindPopup("<strong><i>" + feature.properties.species +
           "</i></strong><br/>Specimen #: " +
           feature.properties.specimen);
     }
   });
var fasicularis_layer = L.layerGroup([fasciularis_circlemarkers]).addTo(map);

var mulatta_layer = L.layerGroup([mulatta_circlemarkers]);

var nemestrina_layer = L.layerGroup([nemestrina_circlemarkers]);

var overlayMaps = { "<i>M. fasicularis</i> (longtailed macaque)": fasicularis_layer, "<i>M. mulatta</i>": mulatta_layer,
                    "<i>M. nemestrina</i>": nemestrina_layer};

L.control.layers(overlayMaps).addTo(map);

// Get Color gradient
function getGradientColor(start_color, end_color, percent) {
  // strip the leading # if it's there
  start_color = start_color.replace(/^\s*#|\s*$/g, '');
  end_color = end_color.replace(/^\s*#|\s*$/g, '');

  // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
  if(start_color.length == 3){
    start_color = start_color.replace(/(.)/g, '$1$1');
  }
  if(end_color.length == 3){
    end_color = end_color.replace(/(.)/g, '$1$1');
  }

  // get colors
  var start_red = parseInt(start_color.substr(0, 2), 16),
      start_green = parseInt(start_color.substr(2, 2), 16),
      start_blue = parseInt(start_color.substr(4, 2), 16);

  var end_red = parseInt(end_color.substr(0, 2), 16),
      end_green = parseInt(end_color.substr(2, 2), 16),
      end_blue = parseInt(end_color.substr(4, 2), 16);

  // calculate new color
  var diff_red = end_red - start_red;
  var diff_green = end_green - start_green;
  var diff_blue = end_blue - start_blue;

  diff_red = ( (diff_red * percent) + start_red ).toString(16).split('.')[0];
  diff_green = ( (diff_green * percent) + start_green ).toString(16).split('.')[0];
  diff_blue = ( (diff_blue * percent) + start_blue ).toString(16).split('.')[0];

  // ensure 2 dichimps by color
  if( diff_red.length == 1 )
    diff_red = '0' + diff_red

  if( diff_green.length == 1 )
    diff_green = '0' + diff_green

  if( diff_blue.length == 1 )
    diff_blue = '0' + diff_blue

  return '#' + diff_red + diff_green + diff_blue;
}

// Compute percentage
function computePercent(val, min, max) {
  return ((val - min) / (max - min));
}

// get color depending on population.hsv2 value
function getColor(d) {
  return d > 80 ? '#FF0000' :
    d > 70 ? getGradientColor('#E85C02', '#FF3600', computePercent(d, 70, 80)) :
    d > 50 ? getGradientColor('#FF950A','#E85C02', computePercent(d, 50, 70)) :
    d > 30 ? getGradientColor('#E8B721', '#FF950A', computePercent(d, 30, 50)) :
    d > 10 ? getGradientColor('#FFF238', '#E8B721', computePercent(d, 10, 30)) :
    d > 1  ? getGradientColor('#FFFB13', '#FFF238', computePercent(d, 1, 10)) :
    '#FFFFFF';
}

function onEachFeature(feature, layer) {
  layer.on({
    click: zoomToFeature
  });
}

var closeTooltip;


function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

map.legendControl.addLegend(getLegendHTML());

//map.legendControl.position('bottomleft');

function getLegendHTML() {
  var grades = [1, 10, 20, 30, 40, 50, 60, 70, 80],
  labels = [],
  from, to;
  var colours = ['red', '#009900','black' ];
  var genera = ['<i>M. fascicularis</i>', '<i>M. mulatta</i>', '<i>M. nemestrina</i>'];

  var generaLegend = [];

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<li><span class="swatch" style="background:' + getColor(from + 1) + '"></span> ' +
      from + (to ? '&ndash;' + to : '+') + '</li>');
  }

  for (var i = 0; i < genera.length; i++) {
    generaLegend.push(
      '<li><span class="swatch" style="background:' + colours[i] + '"></span> ' +
      genera[i] + '</li>');
  }


  return '<div id="genera-legend"><span><strong>Species</strong></span><ul>' + generaLegend.join('') + '</ul></div>';
}

var credits = L.control.attribution();
credits.addAttribution('<a href="https://github.com/nicolegrunstra/Geomap">CC-BY-NC-SA 4.0</a>').addTo(map);
