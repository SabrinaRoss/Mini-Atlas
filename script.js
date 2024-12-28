window.onload = initMap;

var currentCountry;
var currentRegion;

var lonLat;
var YOUR_API_KEY = ''; //put your own API key into the empty string, please and thank you


function initMap() {
    const map = new ol.Map({
        view: new ol.View({
            center: [0, 0],
            zoom: 2,
            maxZoom: 10,
            minZoom: 2,
            //rotation: .5
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'js-map'
		});

    map.on('click', function(e) {
        var clickedCoordinate = e.coordinate;
        var lonLat = ol.proj.transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326');
		
		//lonLat[0] -= 360;
        console.log(lonLat[0]);
        console.log(lonLat[1]);
		console.log(lonLat);
		findCountry(lonLat[0], lonLat[1]);
		
		setMarker(lonLat, map);
    });
}
function findCountry(lon, lat) {
	console.log(YOUR_API_KEY)
var api_key = String(YOUR_API_KEY);
  var coords = lat + ',' + lon;  // lat,lng
	
  var api_url = 'https://api.opencagedata.com/geocode/v1/json'

  var request_url = api_url
    + '?'
    + 'key=' + api_key
    + '&q=' + encodeURIComponent(coords)
    + '&pretty=1'
    + '&no_annotations=1';



  var request = new XMLHttpRequest();
  request.open('GET', request_url, true);

  request.onload = function() {

      var data = JSON.parse(request.responseText);
      if (request.status === 200){  // Success!
          var country = 'no country avaliable';
		  var region = 'no region avaliable';
          if (data.results[0].components.country != null){
             country = data.results[0].components.country;
          }
          console.log('country: ' + country);
      } else {
          console.log("unable to geocode! Response code: " + request.status);
          console.log('error msg: ' + data.status.message);
      }
	  
	  if (data.results[0].components.state != null) {
		region = data.results[0].components.state;
	  } else if (data.results[0].components.province != null) {
		region = data.results[0].components.province;
	  }
	  $("#countryText").text('Country: ' + country);
	  $("#regionText").text('Region: ' + region);
	  currentCountry = country;
	  currentRegion = region;
  };

  request.onerror = function() {

      console.log("unable to connect to server");
  };
  request.send();  
}

function buttonGetInfo() {
	wikiExtract(currentCountry, currentRegion)
}

async function fetchText() {
	let url = 'https://ipinfo.io/json?token=mytoken';
	let response = await fetch(url);
	let data = await response.json();
	console.log(data);
}

//Key: 035d9abf519e4f16bf89cb249c80f2f7 



function getJSON() {
	let baseURL = "";
	
	// get information entered to web-page here
	
	// using baseURL + information entered, create full URL
	let fullURL = baseURL + "";
	
	// Make sure the fullURL works: copy and paste it in a browser:
	//console.log(fullURL);
	
	$.get(fullURL, function(data) {
		// The following line outputs the JSON response to the console:
		// console.log(data);
		
		// The following line outputs the JSON response to the webpage:
		$("#rawJSON").html(JSON.stringify(data));
		
		// The following line gives the JSON response to the analyze
		// function. From there, you can pull information from the JSON
		// response and display things on your webpage.
		analyze(data);
	});
}




function wikiExtract(country, region) {
    var encodedCountry = encodeURIComponent(country);
	var encodedRegion = encodeURIComponent(region);
	
	if (country === 'no country avaliable') {
		$('#wikiInfo').text('Cannot Find Country');
	} else {

		var apiUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&titles=' + encodedCountry + '&callback=?';

		$.getJSON(apiUrl, function(data) {
			var pages = data.query.pages;
			var pageId = Object.keys(pages)[0]; 
			var extract = pages[pageId].extract; 

			$('#wikiInfo').html(extract);
		});
	} 
	if (region === 'no region avaliable') {
		$('#wikiInfoRegion').text('Cannot Find Region');
	} else {
		var apiUrlRegion = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&titles=' + encodedRegion + '&callback=?';
		$.getJSON(apiUrlRegion, function(data) {
		var pages = data.query.pages;
		var pageId = Object.keys(pages)[0]; 
		var extract = pages[pageId].extract; 
		
		$('#wikiInfoRegion').html(extract);

		});
	}
}

function show_content(id) {
			var Answer = document.getElementById(id);
			Answer.style.display = 'grid';
}

function setMarker(lonLat, map) {
	map.getLayers().forEach(function(layer) {
		if (layer.get('name') === 'markerLayer') {
			map.removeLayer(layer);
		}
	});
const marker = new ol.layer.Vector({
	source: new ol.source.Vector({
		features: [ 
			new ol.Feature({
				geometry: new ol.geom.Point(
					ol.proj.fromLonLat(lonLat)
				)
			})
		],
	}),
	style: new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 1],
			crossOrigin: 'anonymous',
			src: 'https://raw.githubusercontent.com/maptiler/openlayers-samples/main/default-marker/marker-icon.png',
		})
	}),
	name: 'markerLayer'
});
	map.addLayer(marker);
}

