var View = require('ampersand-view');

//------------------------------------------------------------------------------

var LinksView = View.extend({
  template: require('../templates/links.hbs'),

  autoRender: true,

  bindings: {
    "model.downloadDisabled": {
      type: 'booleanClass',
      name: 'disabled',
      hook: "download"
    },
    "model.downloadTitle": {
      type: 'attribute',
      name: 'title',
      hook: 'download'
    },
    "model.url": {
      type: 'attribute',
      name: 'href',
      hook: 'perma'
    }
  },
});


module.exports = LinksView;
