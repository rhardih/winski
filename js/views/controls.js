var View = require('ampersand-view');
var NProgress = require('nprogress');

//------------------------------------------------------------------------------

NProgress.configure({
  minimum: 0.4,
  trickleRate: 0.1,
  trickleSpeed: 800
});

//------------------------------------------------------------------------------

var InputView = View.extend({
  template: function() { return this.el.outerHTML },

  events: {
    'input': 'valueChanged',
    'change': 'valueChanged'
  },

  bindings: {
    'model.min': {
      type: 'attribute',
      name: 'min'
    },
    'model.max': {
      type: 'attribute',
      name: 'max'
    },
    'model.boundedValue': {
      type: 'value',
    },
  },

  valueChanged: function() {
    this.model.value = +this.el.value;
  }
});

var ControlsView = View.extend({
  template: require('../templates/controls.hbs'),

  autoRender: true,
  alreadyWarned: false,

  initialize: function() {
    this.model.subject.on('loading', function() {
      NProgress.start();
    });

    this.model.subject.on('done', function() {
      NProgress.done();
    });
  },

  events: {
    "click #phi-link": "selectSubject",
    "click #pi-link": "selectSubject",
    "click #e-link": "selectSubject",

    'click #digits-radio input': 'onDigitsClick',
    'change #digits-radio input': 'onDigitsChange'
  },

  bindings: {
    "model.subject.name": {
      type: "switchClass",
      name: "active",
      cases: {
        "phi": "#phi-link",
        "pi": "#pi-link",
        "e": "#e-link"
      }
    },
    "model.digit1k":
      {
      type: 'booleanAttribute',
      selector: '#digit-1k',
      name: 'checked',
    },
    "model.digit10k":
      {
      type: 'booleanAttribute',
      selector: '#digit-10k',
      name: 'checked',
    },
    "model.digit100k":
      {
      type: 'booleanAttribute',
      selector: '#digit-100k',
      name: 'checked',
    },
    "model.digit1m":
      {
      type: 'booleanAttribute',
      selector: '#digit-1m',
      name: 'checked'
    }
  },

  subviews: {
    rowsLabelInput: {
      selector: "#rows-label-input input",
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.rows });
      }
    },
    columnsLabelInput: {
      selector: "#columns-label-input input",
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.columns });
      }
    },
    radiusLabelInput: {
      selector: "#radius-label-input input",
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.radius });
      }
    },
    spacingLabelInput: {
      selector: "#spacing-label-input input",
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.spacing });
      }
    },
    offsetLabelInput: {
      selector: "#offset-label-input input",
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.offset });
      }
    },

    columnsSlider: {
      selector: '#columns-slider',
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.columns });
      }
    },
    rowsSlider: {
      selector: '#rows-slider',
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.rows });
      }
    },
    spacingSlider: {
      selector: '#spacing-slider',
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.spacing });
      }
    },
    radiusSlider: {
      selector: '#radius-slider',
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.radius });
      }
    },
    offsetSlider: {
      selector: '#offset-slider',
      prepareView: function(el) {
        return new InputView({ el: el, model: this.model.offset });
      }
    }
  },

  selectSubject: function(e) {
    e.preventDefault();

    switch (e.target.hash) {
      case '#phi':
        this.model.subject.setPhi();
        break;
      case '#pi':
        this.model.subject.setPi();
				break;
			case '#e':
        this.model.subject.setE();
				break;
      default:
        console.log('selectSubject: error');
    }
  },

  onDigitsClick: function(e) {
    var value = +e.target.value;
    var warning = 'Displaying 100k digits or more, can be very resource ' +
      'intensive, even on a powerfull computer. Are you sure you would like ' +
      'to proceed?';

    if (value > 4 && !this.alreadyWarned) {
      if (confirm(warning)) {
        this.alreadyWarned = true;
      } else {
        e.preventDefault();
        return false;
      }
    }
  },

  onDigitsChange: function(e) {
    this.model.subject.digits = +e.target.value;
  }
});


module.exports = ControlsView;
