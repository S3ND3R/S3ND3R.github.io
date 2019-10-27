'use strict';

// set up the base html
const app = document.getElementById('root')

const logo = document.createElement('img')
logo.src = 'pub.jpg'

const container = document.createElement('div')
container.setAttribute('class', 'container')

const obutton = document.createElement('button')
obutton.setAttribute('onclick', 'loadBeers()')
obutton.innerHTML = 'Display State Breweries';

const p_input = document.createElement('p')
p_input.innerHTML = 'State: '

const s_input = document.createElement('input')
s_input.setAttribute('type', 'text')
s_input.setAttribute('id', 'state')

const map_cont = document.createElement('div')
map_cont.setAttribute('class', 'map_container')

const map = document.createElement('div')
map.setAttribute('id', 'map')

app.appendChild(logo)
p_input.appendChild(s_input)
p_input.appendChild(obutton)
map_cont.appendChild(map)
app.appendChild(p_input)
app.appendChild(map_cont)
app.appendChild(container)

//  load brewery list function

function loadBeers () {
  container.innerHTML = "";
  var data;
  var state = document.querySelector("#state").value;
  console.log(state)

    fetch(`https://api.openbrewerydb.org/breweries?by_state=${state}&sort=type,-name`)
      .then(response => {
        return response.json();
      })
      .then( data => {
        data.forEach(pub => {
          //create div
          const card = document.createElement('div');
          card.setAttribute('class', 'card');

          //create h1 with title
          const name = document.createElement('h1');
          name.innerHTML = pub.name;

          //create a p with text content
          const p_type = document.createElement('p');
          pub.brewery_type = pub.brewery_type.substring(0, 300);
          p_type.innerHTML = `${pub.brewery_type}...`

          const p_address = document.createElement('p');
          p_address.innerHTML = `${pub.street}</br>${pub.city}`

          const web_url = document.createElement('p');
          web_url.innerHTML = `${pub.website_url}`

          container.appendChild(card);

          card.appendChild(name);
          card.appendChild(p_type);
          card.appendChild(p_address);
          card.appendChild(web_url);
    })

      })
      .catch(err => {
        console.log("ERROR FOUND");
      });
}

mapboxgl.accessToken = 'pk.eyJ1Ijoid2ViZXI3NjciLCJhIjoiY2syNnQ4dWs1MHVqaTNudGN2bmpxNDJvMSJ9.ft3RJkF4j900qNWjWsKdJg';
var t_map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v10',
  center: [-122.306283180899, 37.7834497667258], // starting position
  zoom: 9
});
//set the bounds of the map
var bounds = [[-122.806283180899, 37.8834497667258], [-122.206283180899, 37.6834497667258]];
t_map.setMaxBounds(bounds);

// initialize the map canvas to interact with later
var canvas = t_map.getCanvasContainer();

// an arbitrary start will always be the same
// only the end or destination will change
var start = [-122.306283180899, 37.7834497667258];

// this is where the code for the next step will go
// create a function to make a directions request
function getRoute(end) {
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  var start = [-122.306283180899, 37.7834497667258];
  var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

  // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  var req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('GET', url, true);
  req.onload = function() {
    var data = req.response.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
    // if the route already exists on the map, reset it using setData
    if (t_map.getSource('route')) {
      t_map.getSource('route').setData(geojson);
    } else { // otherwise, make a new request
      t_map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojson
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    // add turn instructions here at the end
  };
  req.send();
}

t_map.on('load', function() {
  // make an initial directions request that
  // starts and ends at the same location
  getRoute(start);

  // Add starting point to the map
  t_map.addLayer({
    id: 'point',
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: start
          }
        }
        ]
      }
    },
    paint: {
      'circle-radius': 5,
      'circle-color': '#3887be'
    }
  });
  // this is where the code from the next step will go
});
