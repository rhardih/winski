var View = require('ampersand-view');

//------------------------------------------------------------------------------

var LinksView = View.extend({
  template: require('../templates/links.hbs'),

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
    }
  },
});


module.exports = LinksView;
