var canvg = require('canvg-browser');
var FileSaver = require('file-saver');

// Safari polyfill
var ctb = require('./vendor/canvas-toBlob.js');

//------------------------------------------------------------------------------

var canvas = document.createElement('canvas');

window.addEventListener("message", function(e){
  var origin = event.origin || event.originalEvent.origin;

  canvg(canvas, e.data, {
    renderCallback: function() {
      canvas.toBlob(function(blob) {
        e.source.postMessage("png-done", origin);
        FileSaver.saveAs(blob, 'winski.png');
      });
    }
  });
}, false);
