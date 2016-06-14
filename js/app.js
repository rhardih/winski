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

var ControlsState = State.extend({
  props: {
    subjectName: ['string', true, Numbers.PI],
    digits: ['number', true, 3]
  },
  children: {
    density: SliderState,
    columns: SliderState
  }
});

var StageState = State.extend({
  props: {
    width: ['number', true, 768],
    displayMode: ['number', true, 0],
    subjectValue: ['string', true, ''],
    densityValue: ['number', true, 20],
    spacing: ['number', true, 25]
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

  var svg = d3.select("svg");
  var controlsEl = document.querySelector('#dropdown-controls');

  //----------------------------------------------------------------------------

  var stageState = new StageState({
    subjectValue: numbers.subjectValue(),
    controls: {
      density: { min: 1, max: 29, value: 20 },
      columns: { min: 1, max: 29, value: 20 }
    }
  });

  var stageView = new StageView({
    model: stageState,
    el: svg[0][0]
  });

  stageState.controls.on('change:subjectName', function(e) {
    numbers.setSubject(this.subjectName, function() {
      stageState.subjectValue = numbers.subjectValue();
    });
  })

  stageState.controls.density.on('change:value', function() {
    stageState.densityValue = +this.value;

    var minCols = Math.max(Math.floor(stageState.widthRadiusToCols(stageState.minWidth, stageState.dRadius)), 1);
    var maxCols = Math.floor(stageState.widthRadiusToCols(window.innerWidth, stageState.dRadius));

    stageState.controls.columns.set({
      min: minCols, max: maxCols, value: stageState.densityValue
    });

    stageState.trigger('change:subjectValue');
  });

  stageState.controls.columns.on('change:value', function() {
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
    numbers.setDigits(this.digits, function() {
      stageState.subjectValue = numbers.subjectValue();
    });
  });

  stageState.on('change:subjectValue change:displayMode', function() {
    stageView.render();
  })

  var controlsView = new ControlsView({
    model: stageState.controls,
    el: controlsEl,
  });

  //----------------------------------------------------------------------------

  stageState.controls.columns.min = stageState.densityValue;
  stageState.controls.columns.max =
    Math.floor(stageState.widthRadiusToCols(window.innerWidth,
                                            stageState.dRadius));
});
