// Create Earth Quake Url 
let quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Create Fault Line Url
let faultURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

renderMap(earthquakeURL, faultURL);

function renderMap(quakeURL, faultURL) {
  d3.json(quakeURL, function(data) {
    console.log(quakeURL)
    let quakeData = data;
    d3.json(faultURL, function(data) {
      let faultData = data;
      createFeatures(quakeData, faultData);
    });
  });
}

function chooseColor(magnitude) {
    return magnitude > 5 ? "red":
      magnitude > 4 ? "orange":
        magnitude > 3 ? "gold":
          magnitude > 2 ? "yellow":
            magnitude > 1 ? "yellowgreen":
              "greenyellow"; // <= 1 default
  }

function markerSize(magnitude) {
    return magnitude * 5;
  }

function createFeatures(quakeData, faultData) {
    function onEachQuakeLayer(feature, layer) {
      return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        fillOpacity: 1,
        color: chooseColor(feature.properties.mag),
        fillColor: chooseColor(feature.properties.mag),
        radius:  markerSize(feature.properties.mag)
      });
    }
    function onEachEarthquake(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
    function onEachFaultLine(feature, layer) {
      L.polyline(feature.geometry.coordinates);
    }
    let earthquakes = L.geoJSON(quakeData, {
      onEachFeature: onEachEarthquake,
      pointToLayer: onEachQuakeLayer
    });
    let faultLines = L.geoJSON(faultData, {
      onEachFeature: onEachFaultLine,
      style: {
        weight: 2,
        color: 'white'
      }
    });
};

function createMap(earthquakes, faultLines) {
    let outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoibWxkZWJha2VyIiwiYSI6ImNrNGMxMThuMDAwdXkzam9tamx5NXV3anEifQ.6tF5ORBZNdl-XHIFMmO8Mw" +
        "A3IKm_S6COZzvBMTqLvukQ");
    let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoibWxkZWJha2VyIiwiYSI6ImNrNGMxMThuMDAwdXkzam9tamx5NXV3anEifQ.6tF5ORBZNdl-XHIFMmO8Mw" +
        "A3IKm_S6COZzvBMTqLvukQ");
    let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoibWxkZWJha2VyIiwiYSI6ImNrNGMxMThuMDAwdXkzam9tamx5NXV3anEifQ.6tF5ORBZNdl-XHIFMmO8Mw" +
        "A3IKm_S6COZzvBMTqLvukQ");
    let baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap,
    };
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": faultLines
    };
    let map = L.map("map", {
      center: [39.8283, -98.5785],
      zoom: 3,
      layers: [outdoors, faultLines],
      scrollWheelZoom: false
    });
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: true
    }).addTo(map);
}

