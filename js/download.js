var canvg = require('canvg-browser');

//------------------------------------------------------------------------------

var svg = sessionStorage.getItem('winski-svg');
var canvas = document.createElement('canvas');
var img = document.createElement('img');

canvg(canvas, svg)

img.src = canvas.toDataURL('image/png');

document.querySelector('#content').appendChild(img);
