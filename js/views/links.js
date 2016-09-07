var View = require('ampersand-view');

var FileSaver = require('file-saver');
var ImageDownloader = require('../image_downloader.js');

//------------------------------------------------------------------------------

var LinksView = View.extend({
  template: require('../templates/links.hbs'),

  autoRender: true,

  events: {
    "click #save-png": "savePng",
    "click #save-svg": "saveSvg"
  },

  bindings: {
    "model.downloadDisabled": {
      type: 'booleanClass',
      name: 'disabled',
      selector: ".download"
    },
    "model.downloadTitlePng": {
      type: 'attribute',
      name: 'title',
      hook: 'download-png'
    },
    "model.downloadTitleSvg": {
      type: 'attribute',
      name: 'title',
      hook: 'download-svg'
    },
    "model.url": {
      type: 'attribute',
      name: 'href',
      hook: 'perma'
    }
  },

  savePng: function(e) {
    e.preventDefault();

    var imageDownloader = new ImageDownloader();

    if (this.model.controls.subject.digits < 5) {
      imageDownloader.run(this.model.stage.width, this.model.stage.height);
    }
  },

  saveSvg: function(e) {
    e.preventDefault();

    var stage = document.querySelector("#stage")
    var oSerializer = new XMLSerializer();
    var data = oSerializer.serializeToString(stage);

    // Safari apparently doesn't understand the correct mimetype and just shows
    // a blank page if used. Chrome, Firefox and IE all doesn't have a problem
    // with plain text and understands filenames, so this is the workaround for
    // the time being.

    //var blob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});

    FileSaver.saveAs(blob, 'winski.svg')
  }
});


module.exports = LinksView;
