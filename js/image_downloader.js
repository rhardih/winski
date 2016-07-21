var ImageDownloader = function() {
  this.serializer = new XMLSerializer();
}

ImageDownloader.prototype.run = function(width, height) {
  var that = this;

  var serialized = this.serializer.serializeToString(
    document.querySelector('#stage')
  )
  var serializedb64 = 'data:image/svg+xml;base64,' + window.btoa(serialized);

  var w = open('download.html');

  w.addEventListener('load', function() {
    w.postMessage(serialized, document.location.origin);
  });
}

//------------------------------------------------------------------------------

module.exports = ImageDownloader;
