var View = require('ampersand-view');

var Numbers = require('../numbers.js');

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
    }
  },

  selectSubject: function(e) {
    e.preventDefault();

    switch (this, e.target.hash) {
      case '#phi':
        this.model.subject.phi();
        break;
      case '#pi':
        this.model.subject.pi();
				break;
			case '#e':
        this.model.subject.e();
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
    this.model.digits = +e.target.value;
  }
});


module.exports = ControlsView;
