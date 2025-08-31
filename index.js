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
  zoom: 0,
  // layers: allEvents,
  maxZoom: 24,
  autoPan: false,
  zoomControl: false,
  tap: false
});

// Default Base Map
// Esri_WorldImagery.addTo(map);
Esri_WorldStreetMap.addTo(map);

// Esri_WorldStreetMap.setOpacity(0.6);

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

      // Pop-ups
    var popupContent = generatePopupContent(layer.feature)

  function openPopupAndCenterMap(layer) {
  
    // Open the popup after the map has panned
    setTimeout(function () {
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

    var homeZoom = map.fitBounds(layer.target.getBounds().pad(0.2));

    var baseMaps = {
      "ESRI World Street Map": Esri_WorldStreetMap,
      "ESRI World Imagery": Esri_WorldImagery,
      "OpenStreetMap HOT": OpenStreetMap_HOT
    };
    
    var groupedOverlays = {
      "Events": {
        "All Events": allEvents,
        "Virtual Option": eventsVirtual  
      }
    }

    var options = {
      groupCheckboxes: false
    };

    L.control.groupedLayers(baseMaps, groupedOverlays, options).addTo(map);

    // L.control.zoom({
    //   position: 'topright'
    // }).addTo(map);

    `<div class="splashscreen"> NEW TEXT</div>`

    L.Control.textbox = L.Control.extend({
      onAdd: function(map) {
        
      var text = L.DomUtil.create('div');
      text.id = "splashscreen";
      text.innerHTML = "<strong<text-align: center>Use the sidebar at left to view virtual events. <br/> Use the Layer Toggles at the top right to try different base maps.</text-align></strong>"
      return text;
      },
  
      onRemove: function(map) {
        // Nothing to do here
      }
    });
    L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
    L.control.textbox({ position: 'bottomright'}).addTo(map);


        // custom zoom bar control that includes a Zoom Home function
        L.Control.zoomHome = L.Control.extend({
          options: {
              position: 'topright',
              zoomInText: '+',
              zoomInTitle: 'Zoom in',
              zoomOutText: '-',
              zoomOutTitle: 'Zoom out',
              zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
              zoomHomeTitle: 'Zoom home'
          },
        
          onAdd: function (map) {
              var controlName = 'gin-control-zoom',
                  container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                  options = this.options;
        
              this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
              controlName + '-in', container, this._zoomIn);
              this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
              controlName + '-home', container, this._zoomHome);
              this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
              controlName + '-out', container, this._zoomOut);
        
              this._updateDisabled();
              map.on('zoomend zoomlevelschange', this._updateDisabled, this);
        
              return container;
          },
        
          onRemove: function (map) {
              map.off('zoomend zoomlevelschange', this._updateDisabled, this);
          },
        
          _zoomIn: function (e) {
              this._map.zoomIn(e.shiftKey ? 3 : 1);
          },
        
          _zoomOut: function (e) {
              this._map.zoomOut(e.shiftKey ? 3 : 1);
          },
        
          _zoomHome: function (e) {
              map.fitBounds(layer.target.getBounds().pad(0.2));
          },
        
          _createButton: function (html, title, className, container, fn) {
              var link = L.DomUtil.create('a', className, container);
              link.innerHTML = html;
              link.href = '#';
              link.title = title;
        
              L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                  .on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', fn, this)
                  .on(link, 'click', this._refocusOnMap, this);
        
              return link;
          },
        
          _updateDisabled: function () {
              var map = this._map,
                  className = 'leaflet-disabled';
        
              L.DomUtil.removeClass(this._zoomInButton, className);
              L.DomUtil.removeClass(this._zoomOutButton, className);
        
              if (map._zoom === map.getMinZoom()) {
                  L.DomUtil.addClass(this._zoomOutButton, className);
              }
              if (map._zoom === map.getMaxZoom()) {
                  L.DomUtil.addClass(this._zoomInButton, className);
              }
          }
        });

        var zoomHome = new L.Control.zoomHome({
        });
        zoomHome.addTo(map);


})
  .addTo(map);

  var sidebar = L.control.sidebar('sidebar').addTo(map);