// var Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
// 	minZoom: 0,
// 	maxZoom: 20,
// 	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// 	ext: 'jpg'
// });

// OSM HOT Basemap
var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});

// ESRI Street Map
var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

// ESRI World Imagery
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var markerClusterOptions = {
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
  freezeAtZoom: false,
  removeOutsideVisibleBounds: false
};

// // Set up Layer Groups
// // Categorical
var allEvents = L.layerGroup();
var eventsVirtual = L.layerGroup();

var layerSupport = new L.MarkerClusterGroup.LayerSupport(markerClusterOptions);

// Initialize map
var map = L.map('map', {
  center: [46.1304, -90.3468],
  zoom: 4,
  // layers: allEvents,
  maxZoom: 24,
  autoPan: false,
  zoomControl: true,
  tap: false
});

// Default Base Map
// Stadia_AlidadeSatellite.addTo(map);
Esri_WorldImagery.addTo(map);
// Esri_WorldStreetMap.addTo(map);
// OpenStreetMap_HOT.addTo(map);


var MarkerIcon = L.Icon.extend({
  options: {
    iconSize: [50, 50],
    iconAnchor: [0, 0],
    popupAnchor: [0,0]
  }
})

var GGIcon = new MarkerIcon({iconUrl: 'GG-icon.png'});

var virtualIcon = new MarkerIcon({iconUrl: 'GG-virtual-icon.png'});

var customLayer = L.geoJson(null, {
    pointToLayer: function(feature, latlng){

      var inperson_n_h = feature.properties.inperson_n_h;

      if (inperson_n_h != "In-person"){
        return L.marker(latlng, {icon: virtualIcon});
      }

      return L.marker(latlng, {icon: GGIcon});
    },
  onEachFeature: function(feature, layer) {

    // Categories
    var inperson_n_h = layer.feature.properties.inperson_n_h;
    var link_reg = layer.feature.properties.reg_link;

      // Pop-ups
    var popupContent = generatePopupContent(layer.feature)

  function openPopupAndCenterMap(layer) {
  
    // Open the popup after the map has panned
    setTimeout(function () {
      // if (!isPopupManuallyClosed) {
      layer.openPopup();
      // }
    }, 300); // Adjust the delay as needed (3 seconds in this example)
  }

  layer.bindPopup(popupContent);

  layer.on('mouseover', function (e) {
    openPopupAndCenterMap(layer);
  });

    allEvents.addLayer(layer);

    // Categories separation

    // In-person / Hybrid separation
    if (inperson_n_h != "In-person") {
      eventsVirtual.addLayer(layer);
    }

    layerSupport.addTo(map);
    layerSupport.checkIn(allEvents);
    layerSupport.checkIn(eventsVirtual)

    map.addLayer(allEvents);
  }
});

var runLayer = omnivore.csv('./responses.csv', null, customLayer)
  .on('ready', function(layer) {

    map.fitBounds(layer.target.getBounds().pad(0.2));

    var baseMaps = {
      // "Default (Stadia Alidade Satellite)": Stadia_AlidadeSatellite,
      "ESRI World Imagery": Esri_WorldImagery,
      "ESRI World Street Map": Esri_WorldStreetMap,
      "OpenStreetMap HOT": OpenStreetMap_HOT
    };

    // hybridCircle = "<svg class='shadow' width='10' height='10'> <circle cx='5' cy='5' r='4' stroke-width='0.5' stroke='darkgrey' fill='white'/></svg>";

    var hybridIcon = `<img class = 'legendIcon' src='GG-virtual-icon.png'>`
    
    var groupedOverlays = {
      "Events": {
        "All Events": allEvents,
        "Virtual Option": eventsVirtual  // [hybridIcon + "Virtual Option"]: eventsVirtual
      }
    }

    var options = {
      groupCheckboxes: false
    };

    L.control.groupedLayers(baseMaps, groupedOverlays, options).addTo(map);
    
    //Find the input element for the "All Events" overlay and set its checked property to true
    var inputs = document.getElementsByClassName('leaflet-control-layers-overlays')[0].getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
      var label = inputs[i].parentNode;
      if (label.textContent.trim() === 'Events') {
        inputs[i].checked = true;
        break;
      }
    }

    `<div class="splashscreen"> NEW TEXT</div>`

    // var TestPopup = L.popup({
    //   closeButton: true,
    //   autoClose: true
    //   })
    //   .setLatLng(layer.target.getBounds().getCenter())
    //   .setContent('<p>Some Disclaimer Text.</p>')
    //   .openOn(map);

    L.Control.textbox = L.Control.extend({
      onAdd: function(map) {
        
      var text = L.DomUtil.create('div');
      text.id = "splashscreen";
      text.innerHTML = "<strong>Use the sidebar at left to view virtual events</strong>"
      return text;
      },
  
      onRemove: function(map) {
        // Nothing to do here
      }
    });
    L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
    L.control.textbox({ position: 'bottomright'}).addTo(map);


})
  .addTo(map);

  var sidebar = L.control.sidebar('sidebar').addTo(map);
