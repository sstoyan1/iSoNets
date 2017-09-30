var map, featureList, natureSearch = [], attackSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(markerClusters.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

function import_reactions() {
	var input = document.createElement('input');
	input.type = 'file';
	input.click();
	input.onclick = function () {
    this.value = null;
	};
	input.onchange = function () { 
		$.getJSON("data/"+this.value, function (data) {
  		reactions.addData(data);
		});
  };
};

$("#load-btn").click(function() {
  import_reactions();
  return false;
});

$("#import-btn").click(function() {
	import_reactions();
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#clear-btn").click(function() {
	reactions.clearLayers();
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through nature layer and add only features which are in the map bounds */
  nature.eachLayer(function (layer) {
    if (map.hasLayer(natureLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/mapicons/sight-2.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Loop through attacks layer and add only features which are in the map bounds */
  attacks.eachLayer(function (layer) {
    if (map.hasLayer(attackLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/mapicons/shooting2.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 15,
}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  minZoom: 16,
  maxZoom: 19,
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  attribution: "Aerial Imagery courtesy USGS"
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "red",
  fillOpacity: 0.7,
  radius: 5
};

/* Reactions Layer */
var reactions = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/publication.png",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -11]
      }),
      riseOnHover: false
    });
  }
});

//map.addLayer(reactions);

function showReactions(title) {
	reactions.clearLayers();
	$.getJSON("data/reactions.geojson", function (data) {
  	reactions.addData(data);
		map.addLayer(reactions);
	});
};
	
showReactions("Barcelona 2017");

/* */
/**/

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Nature */
/* Empty layer placeholder to add to layer control for listening when to add/remove nature to markerClusters layer */
var natureLayer = L.geoJson(null);
var nature = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/mapicons/sight-2.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + 
      "<tr><th width='30%'>Description</th><td colspan='3'>" + feature.properties.DESC + 
      "</td></tr>" + "<tr><th>Address</th><td colspan='3'>" + feature.properties.ADDRESS + 
      "</td></tr>" + "<tr><th>All of these words</th><td colspan='3'>" + feature.properties.ALLWORDS + 
      "</td></tr>" + "<tr><th>This exact phrase</th><td colspan='3'>" + feature.properties.PHRASE + 
      "</td></tr>" + "<tr><th>Any of these words</th><td colspan='3'>" + feature.properties.ANYWORDS + 
      "</td></tr>" + "<tr><th>None of these words</th><td colspan='3'>" + feature.properties.NONEWORDS + 
      "</td></tr>" + "<tr><th>These hashtags</th><td colspan='3'>" + feature.properties.HASHTAGS + 
      "</td></tr>" + "<tr><th>Written in</th><td colspan='3'>" + feature.properties.LANG + 
      "</td></tr>" + "<tr><th>Near this place</th><td  colspan='3'>" + feature.properties.PLACES + 
      "</td></tr>" + "<tr><th>From this date</th><td>" + feature.properties.FROM + 
      "</td>" + "<th>to</th><td>" + feature.properties.TO + 
      "</td></tr>" + "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/mapicons/sight-2.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      natureSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADDRESS1,
        source: "Nature",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/nature.geojson", function (data) {
  nature.addData(data);
  map.addLayer(natureLayer);
});

/* Attacks */
/* Empty layer placeholder to add to layer control for listening when to add/remove attacks to markerClusters layer */
var attackLayer = L.geoJson(null);
var attacks = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/mapicons/shooting2.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + 
      "<tr><th width='30%'>Description</th><td colspan='3'>" + feature.properties.DESC + 
      "</td></tr>" + "<tr><th>Address</th><td colspan='3'>" + feature.properties.ADDRESS + 
      "</td></tr>" + "<tr><th>All of these words</th><td colspan='3'>" + feature.properties.ALLWORDS + 
      "</td></tr>" + "<tr><th>This exact phrase</th><td colspan='3'>" + feature.properties.PHRASE + 
      "</td></tr>" + "<tr><th>Any of these words</th><td colspan='3'>" + feature.properties.ANYWORDS + 
      "</td></tr>" + "<tr><th>None of these words</th><td colspan='3'>" + feature.properties.NONEWORDS + 
      "</td></tr>" + "<tr><th>These hashtags</th><td colspan='3'>" + feature.properties.HASHTAGS + 
      "</td></tr>" + "<tr><th>Written in</th><td colspan='3'>" + feature.properties.LANG + 
      "</td></tr>" + "<tr><th>Near this place</th><td  colspan='3'>" + feature.properties.PLACES + 
      "</td></tr>" + "<tr><th>From this date</th><td>" + feature.properties.FROM + 
      "</td>" + "<th>to</th><td>" + feature.properties.TO + 
      "</td></tr>" + "</table>";
       layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/mapicons/shooting2.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      attackSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADDRESS,
        source: "Attacks",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/attacks.geojson", function (data) {
  attacks.addData(data);
  map.addLayer(attackLayer);
});

map = L.map("map", {
  zoom: 6,
  center: [50.9271951,6.9312539],
  layers: [cartoLight, markerClusters, reactions, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === natureLayer) {
    markerClusters.addLayer(nature);
    syncSidebar();
  }
  if (e.layer === attackLayer) {
    markerClusters.addLayer(attacks);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === natureLayer) {
    markerClusters.removeLayer(nature);
    syncSidebar();
  }
  if (e.layer === attackLayer) {
    markerClusters.removeLayer(attacks);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'><a href='http://slavina.eu'>Slavina Stoyanova</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight,
  "Aerial Imagery": usgsImagery
};


var groupedOverlays = {
  "Data Layers:": {
    "<img src='assets/img/mapicons/sight-2.png' width='24' height='28'>&nbsp;Nature POI": natureLayer,
    "<img src='assets/img/mapicons/shooting2.png' width='24' height='28'>&nbsp;Attacks POI": attackLayer,
		"<img src='assets/img/mapicons/shootingrange.png' width='24' height='28'>&nbsp;Reactions": reactions
 }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to markerClusters bounds */
  map.fitBounds(markerClusters.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var natureBH = new Bloodhound({
    name: "Nature",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: natureSearch,
    limit: 10
  });

  var attacksBH = new Bloodhound({
    name: "Attacks",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: attackSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  naturesBH.initialize();
  attacksBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Nature",
    displayKey: "name",
    source: natureBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/sight-2.png' width='24' height='28'>&nbsp;Nature</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Attacks",
    displayKey: "name",
    source: attacksBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/mapicons/shooting2.png' width='24' height='28'>&nbsp;Attacks</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Nature") {
      if (!map.hasLayer(natureLayer)) {
        map.addLayer(natureLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Attacks") {
      if (!map.hasLayer(attackLayer)) {
        map.addLayer(attackLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
