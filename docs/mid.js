'use strict';

// set up the base html
const app = document.getElementById('root')

const header_container = document.createElement('div')
header_container.setAttribute('class', 'header_container')

const logo = document.createElement('img')
logo.src = 'docs/pub_logo.jpg'
logo.setAttribute('id', 'logo')

const title = document.createElement('div')
title.setAttribute('class', 'title')

const title_content = document.createElement('h1')
title_content.setAttribute('class', 'title_cnt')
title_content.innerHTML = "Brew Hunter"

title.appendChild(title_content)

const nav_container = document.createElement('div')
nav_container.setAttribute('class', 'nav_container')

const container = document.createElement('div')
container.setAttribute('class', 'container')

const obutton = document.createElement('button')
obutton.setAttribute('onclick', 'loadBeers()')
obutton.innerHTML = 'Display State Breweries';
obutton.setAttribute('id', 'obj_button')

const p_input = document.createElement('p')
p_input.innerHTML = 'State: '
p_input.setAttribute('id', 'op_in')

const s_input = document.createElement('select')
s_input.setAttribute('size', '1')
s_input.setAttribute('id', 'state')
s_input.innerHTML = `<option>Alabama</option><option>Alaska</option><option>Arizona</option>
<option>Arkansas</option><option>California</option><option>Colorado</option><option>Connecticut</option>
<option>Delaware</option><option>Florida</option><option>Georgia</option><option>Hawaii</option>
<option>Idaho</option><option>Illinois</option><option>Indiana</option><option>Iowa</option>
<option>Kansas</option><option>Kentucky</option><option>Louisiana</option><option>Maine</option>
<option>Maryland</option><option>Massachusetts</option><option>Michigan</option><option>Minnesota</option>
<option>Mississippi</option><option>Missouri</option><option>Montana</option><option>Nebraska</option>
<option>Nevada</option><option>New Hampshire</option><option>New Jersey</option><option>New Mexico</option>
<option>New York</option><option>North Carolina</option><option>North Dakota</option><option>Ohio</option>
<option>Oklahoma</option><option>Oregon</option><option>Pennsylvania</option><option>Rhode Island</option>
<option>South Carolina</option><option>South Dakota</option><option>Tennessee</option><option>Texas</option>
<option>Utah</option><option>Vermont</option><option>Virginia</option><option>Washington</option>
<option>West Virginia</option><option>Wisconsin</option><option>Wyoming</option>`

// const s_input = document.createElement('input')
// s_input.setAttribute('type', 'text')
// s_input.setAttribute('id', 'state')

const map_cont = document.createElement('div')
map_cont.setAttribute('class', 'map_container')

const maps = document.createElement('div')
maps.setAttribute('id', 'map')

const dir_instructions = document.createElement('div');
dir_instructions.setAttribute('id', 'instructions');


header_container.appendChild(logo)
header_container.appendChild(title)
app.appendChild(header_container)
p_input.appendChild(s_input)
p_input.appendChild(obutton)
map_cont.appendChild(maps)
nav_container.appendChild(map_cont)
nav_container.appendChild(dir_instructions)
app.appendChild(p_input)
app.appendChild(nav_container)
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
          p_type.innerHTML = `Brewery Type: ${pub.brewery_type}`

          const p_address = document.createElement('p');
          p_address.innerHTML = `Address:</br>${pub.street}</br>${pub.city}`

          var t_phone = pub.phone
          var phone = "(" + t_phone.substring(0, 3) + ")" + t_phone.substring(3, 6) + "-" + t_phone.substring(6, 11)

          const number = document.createElement('p');
          number.innerHTML = `Number: ${phone}`

          const web_url = document.createElement('p');
          web_url.innerHTML = `Email: ${pub.website_url}`

          const dir_button = document.createElement('button')

          var longi = pub.longitude
          var latit = pub.latitude

          dir_button.setAttribute('onclick', `getRoute([${longi},${latit}])`)
          dir_button.innerHTML = 'Get Route';
          dir_button.setAttribute('id', 'direction_button')

          container.appendChild(card);

          card.appendChild(name);
          card.appendChild(p_type);
          card.appendChild(p_address);
          if (phone.length > 4) {
            card.appendChild(number);
          }
          if (pub.website_url.length != 0) {
            card.appendChild(web_url);
          }
          if (pub.longitude != null && pub.latitude != null) {
            card.appendChild(dir_button);
          }
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
  center: [-93.233832398, 44.971829446], // starting position
  zoom: 12
});

// initialize the map canvas to interact with later
var canvas = t_map.getCanvasContainer();

// an arbitrary start will always be the same
// only the end or destination will change
var start = [-93.233832398, 44.971829446];

// create a function to make a directions request
function getRoute(end) {

  var start = [-93.233832398, 44.971829446];
  var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;


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

    // if route already exists on the map, reset it
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
    //turn instructions
      var instructions = document.getElementById('instructions');
      if (instructions != null ) {
        var steps = data.legs[0].steps;

        var tripInstructions = [];
        for (var i = 0; i < steps.length; i++) {
          tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
          instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min 🚗 </span>' + tripInstructions;
        }
      }
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
