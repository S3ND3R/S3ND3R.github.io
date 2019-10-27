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
p_input.innerHTML = 'State: '

app.appendChild(logo)
p_input.appendChild(s_input)
p_input.appendChild(obutton)
app.appendChild(p_input);
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
