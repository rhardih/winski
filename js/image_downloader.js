var ImageDownloader = function() {
  // Dummy download link used to trigger a direct download of the image.
  this.link = document.createElement('a');

  this.downloadSupported = typeof this.link.download != "undefined";

  this.serializer = new XMLSerializer();
}

ImageDownloader.prototype.pngUri = function(url, w, h, cb) {
  var image = new Image();

  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    canvas.getContext('2d').drawImage(this, 0, 0, w, h);

    cb(canvas.toDataURL('image/png'));
  };

  image.src = url;
}

ImageDownloader.prototype.run = function(width, height) {
  var that = this;

  var serialized = this.serializer.serializeToString(
    document.querySelector('#stage')
  )
  var serializedb64 = 'data:image/svg+xml;base64,' + window.btoa(serialized);

  if (this.downloadSupported) {
    this.pngUri(serializedb64, width, height,
      function(uri) {
        that.link.href = uri;
        that.link.download = 'winski.png';
        that.link.dispatchEvent(new MouseEvent("click"));
      }
    );
  } else {
    // If download attribute isn't supported, open a new page where it's
    // possible to right click and save as.'

    sessionStorage.setItem('winski-svg', serialized);
    open('download.html');
  }
}

//------------------------------------------------------------------------------

module.exports = ImageDownloader;
