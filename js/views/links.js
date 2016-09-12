var View = require('ampersand-view');
var FileSaver = require('file-saver');
var NProgress = require('nprogress');

//------------------------------------------------------------------------------

var LinksView = View.extend({
  template: require('../templates/links.hbs'),

  autoRender: true,
  serializer: new XMLSerializer(),
  iframe: undefined,

  initialize: function() {
    window.addEventListener('message', function(e) {
      if (e.data === 'png-done') {
        NProgress.done();
      }
    });
  },

  events: {
    "click #save-png": "savePng",
    "click #save-svg": "saveSvg"
  },

  bindings: {
    "model.downloadDisabledPng": {
      type: 'booleanClass',
      name: 'disabled',
      hook: 'download-png'
    },
    "model.downloadTitlePng": {
      type: 'attribute',
      name: 'title',
      hook: 'download-png'
    },
    "model.url": {
      type: 'attribute',
      name: 'href',
      hook: 'perma'
    }
  },

  savePng: function(e) {
    e.preventDefault();

    var stage, serialized, iframe, w;

    if (!this.model.downloadDisabledPng) {
      NProgress.start();

      stage = document.querySelector("#stage")
      serialized = this.serializer.serializeToString(stage);

      // For some reason Safari won't open a new tab with the image if the code
      // is running inside an iframe, so this is a special case workaround.
      //
      // The reason for not using a web worker for this, is because both canvg
      // and filesaver relies on DOM to do their magic.
      //
      // My oh my, what a slippery slope we have here.
      var isSafari = navigator.userAgent.indexOf('Safari') != -1 &&
        navigator.userAgent.indexOf('Chrome') == -1;

      var downloadHost, msgTarget;
      var that = this;

      if (isSafari) {
        w = window.open('download.html');

        w.addEventListener('load', function() {
          w.postMessage(serialized, document.location.origin);
        });
      } else {
        if (!that.iframe) {
          that.iframe = document.createElement('iframe');
          that.iframe.src = 'download.html';

          that.iframe.addEventListener('load', function() {
            that.iframe.contentWindow.postMessage(serialized, document.location.origin);
          });

          document.querySelector('#iframe-wrap').appendChild(that.iframe);
        } else {
          that.iframe.contentWindow.postMessage(serialized, document.location.origin);
        }
      }
    }
  },

  saveSvg: function(e) {
    e.preventDefault();

    var stage = document.querySelector("#stage")
    var data = this.serializer.serializeToString(stage);

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
