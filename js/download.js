var canvg = require('canvg-browser');
var FileSaver = require('file-saver');

// Safari polyfill
var ctb = require('./vendor/canvas-toBlob.js');

//------------------------------------------------------------------------------

var canvas = document.createElement('canvas');

window.addEventListener("message", function(e){
  canvg(canvas, e.data, {
    renderCallback: function() {
      canvas.toBlob(function(blob) {
        FileSaver.saveAs(blob, 'winski.png');
      });
    }
  });
}, false);
