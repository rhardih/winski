var canvg = require('canvg-browser');

//------------------------------------------------------------------------------

var canvas = document.createElement('canvas');
var img = document.createElement('img');

var msgEl = document.querySelector('#message');

window.addEventListener("message", function(e){
  canvg(canvas, e.data, {
    renderCallback: function() {
      msgEl.innerHTML = 'Right click image and save as:'

      img.src = canvas.toDataURL('image/png');
    }
  });
}, false);

document.querySelector('#content').appendChild(img);
