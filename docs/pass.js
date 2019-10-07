'use strict';

function updateSlider() {
  var curMinVal = document.querySelector(".min_word").value;
  document.querySelector("#min_word_val").innerHTML = curMinVal;
} // END updateSlider


window.onload = updateSlider;
