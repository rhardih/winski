var View = require('ampersand-view');

var Numbers = require('../numbers.js');

//------------------------------------------------------------------------------

var SliderView = View.extend({
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
    'model.value': {
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

  events: {
    "click #phi-link": "selectSubject",
    "click #pi-link": "selectSubject",
    "click #e-link": "selectSubject"
  },

  bindings: {
    "model.subjectName": {
      type: "switchClass",
      name: "active",
      cases: {
        "phi": "#phi-link",
        "pi": "#pi-link",
        "e": "#e-link"
      }
    },
  },

  subviews: {
    densitySlider: {
      selector: '#density-slider',
      prepareView: function(el) {
        return new SliderView({ el: el, model: this.model.density });
      }
    },
    columnsSlider: {
      selector: '#columns-slider',
      prepareView: function(el) {
        return new SliderView({ el: el, model: this.model.columns });
      }
    }
  },

  selectSubject: function(e) {
    e.preventDefault();

    switch (this, e.target.hash) {
      case '#phi':
				this.model.subjectName = Numbers.PHI;
        break;
      case '#pi':
				this.model.subjectName = Numbers.PI;
				break;
			case '#e':
				this.model.subjectName = Numbers.E;
				break;
      default:
        console.log('selectSubject: error');
    }
  }
});


module.exports = ControlsView;
