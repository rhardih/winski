var State = require('ampersand-state');
var View = require('ampersand-view');

var Numbers = require('./numbers.js');
var StageView = require('./views/stage.js');
var ControlsView = require('./views/controls.js');

//------------------------------------------------------------------------------

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

//------------------------------------------------------------------------------

var SliderState = State.extend({
  props: {
    min: ['number', true, 1],
    max: ['number', true, 1],
    value: ['number', true, 1],
  }
});

var RowsState = SliderState.extend({
  props: {
    subject: 'state',
    columns: 'state'
  },

  derived: {
    max: {
      deps: ['subject.value', 'columns.value'],
      fn: function() {
        return Math.ceil(this.subject.value.length / this.columns.value);
      }
    }
  }
});

var SubjectState = State.extend({
  props: {
    name: ['string', true, ''],
    value: ['string', true, ''],
    numbers: ['object', true, function() { return new Numbers(); }]
  },

  updateValue: function() {
    this.value = this.numbers.subjectValue()
  },

  pi: function() {
    this.name = Numbers.PI;
    this.numbers.setSubject(Numbers.PI, this.updateValue.bind(this));
  },

  phi: function() {
    this.name = Numbers.PHI;
    this.numbers.setSubject(Numbers.PHI, this.updateValue.bind(this));
  },

  e: function() {
    this.name = Numbers.E;
    this.numbers.setSubject(Numbers.E, this.updateValue.bind(this));
  },

  setDigits: function(d, cb) {
    this.numbers.setDigits(d, (function() {
      this.updateValue();
      cb();
    }).bind(this));
  }
});

var ControlsState = State.extend({
  props: {
    digits: ['number', true, 3],
    subject: 'state',
    columns: 'state'
  },
  children: {
    density: SliderState,
    rows: RowsState
  }
});

var StageState = State.extend({
  props: {
    width: ['number', true, 768],
    displayMode: ['number', true, 0],
    densityValue: ['number', true, 20],
    spacing: ['number', true, 25],
    subject: 'state'
  },

  children: {
    controls: ControlsState
  },

  minWidth: 768,
  minRadius: 0.5,

  derived: {
    dRadius: {
      deps: ['width', 'densityValue', 'spacing'],
      fn: function() {
        // width: 2 * (spacing + radius) + (cols - 1) * (2 * radius +
        // spacing)
        // w = 2 * (g + r) + (c - 1) * (2 * r + g)
        // w = c * g + 2 * c * r + g
        // (w - (c * g) - g) / (2 * c) = r
        var tmp = (this.width - (this.densityValue * this.spacing) -
                  this.spacing) / (2 * this.densityValue);
        return tmp;
      }
    },
    limit :{
      deps: ['subject.value', 'controls.rows.value', 'controls.columns.value'],
      fn: function() {
        var tmp = this.controls.rows.value * this.controls.columns.value;
        return Math.min(this.subject.value.length, tmp);
      }
    }
  },

  widthRadiusToCols: function(width, radius) {
    // w = c *(g + 2 * r) + g
    // (w - g) / (g + 2 * r) = c
    return (width - this.spacing) / (this.spacing + 2 * radius);
  },

  radiusDensityToWidth: function(radius, density) {
    return density * this.spacing + 2 * density * radius + this.spacing;
  },

  cycleDisplayMode: function() {
    this.displayMode = (this.displayMode + 1) % 3;
  }
});

//------------------------------------------------------------------------------

ready(function() {
  var numbers = new Numbers();

  var svgEl = document.querySelector('svg');
  var controlsEl = document.querySelector('#dropdown-controls');

  //----------------------------------------------------------------------------

  var subjectState = new SubjectState({
    name: Numbers.PI,
    value: numbers.subjectValue()
  });

  var columnsState = new SliderState({ min: 1, max: 29, value: 20 });

  var stageState = new StageState({
    controls: {
      density: { min: 1, max: 29, value: 20 },
      columns: columnsState,
      rows: {
        min: 1,
        value: 50,
        subject: subjectState,
        columns: columnsState
      },
      subject: subjectState
    },
    subject: subjectState
  });

  var stageView = new StageView({
    model: stageState,
    el: svgEl
  });

  stageState.controls.density.on('change:value', function() {
    stageState.densityValue = +this.value;

    var minCols = Math.max(Math.floor(stageState.widthRadiusToCols(stageState.minWidth, stageState.dRadius)), 1);
    var maxCols = Math.floor(stageState.widthRadiusToCols(window.innerWidth, stageState.dRadius));

    columnsState.set({
      min: minCols, max: maxCols, value: stageState.densityValue
    });

    stageState.subject.trigger('change:value');
  });

  columnsState.on('change:value', function() {
    var v = +this.value;

    stageState.set({
      densityValue: v,
      width: stageState.radiusDensityToWidth(stageState.dRadius, v)
    });

    var maxDensity = Math.floor(stageState.widthRadiusToCols(stageState.width,
                                                             stageState.minRadius));

    stageState.controls.density.set({
      min: 1, max: maxDensity, value: v
    });
  });

  stageState.controls.on('change:digits', function() {
    stageState.subject.setDigits(this.digits, function() {
      stageState.controls.rows.value = stageState.controls.rows.max;
    });
  });

  stageState.controls.on('change:rows', function() {
    stageView.render();
  });

  stageState.on('change:displayMode change:limit', function() {
    stageView.render();
  })

  stageState.subject.on('change:value', function() {
    stageView.render();
  });

  var controlsView = new ControlsView({
    model: stageState.controls,
    el: controlsEl,
  });

  //----------------------------------------------------------------------------

  columnsState.min = stageState.densityValue;
  columnsState.max =
    Math.floor(stageState.widthRadiusToCols(window.innerWidth,
                                            stageState.dRadius));
});
