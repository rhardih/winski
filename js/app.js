var State = require('ampersand-state');
var View = require('ampersand-view');

var Numbers = require('./numbers.js');
var StageView = require('./views/stage.js');

//------------------------------------------------------------------------------

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

//------------------------------------------------------------------------------

ready(function() {
  var _densitySlider = d3.select("#density-slider");
  var _colsSlider = d3.select("#columns-slider");
  var minDensity = 1, maxDensity = 29;
  var minCols = 1, maxCols = 29, colsValue = 20;
  var numbers = new Numbers();

  var _phi = d3.select("#phi-link");
  var _pi = d3.select("#pi-link");
  var _e = d3.select("#e-link");

  var svg = d3.select("svg");

  //----------------------------------------------------------------------------

  var StageState = State.extend({
    props: {
      width: ['number', true, 768],
      displayMode: ['number', true, 0],
      subjectValue: ['string', true, numbers.subjectValue()],
      densityValue: ['number', true, 20],
      spacing: ['number', true, 25]
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

  var stageState = new StageState();

  var stageView = new StageView({
    model: stageState,
    el: svg[0][0]
  });

  stageState.on('change', function() {
    stageView.render();
  })

  //----------------------------------------------------------------------------

  _phi.on("click", function() {
    d3.event.preventDefault();

    _phi.classed("active", true);
    _pi.classed("active", false);
    _e.classed("active", false);

    numbers.setSubject(Numbers.PHI, function() {
      stageState.subjectValue = numbers.subjectValue();
    });
  });

  _pi.on("click", function() {
    d3.event.preventDefault();

    _phi.classed("active", false);
    _pi.classed("active", true);
    _e.classed("active", false);

    numbers.setSubject(Numbers.PI, function() {
      stageState.subjectValue = numbers.subjectValue();
    });
  });

  _e.on("click", function() {
    d3.event.preventDefault();

    _phi.classed("active", false);
    _pi.classed("active", false);
    _e.classed("active", true);

    numbers.setSubject(Numbers.E, function() {
      stageState.subjectValue = numbers.subjectValue();
    });
  });

  var updateDensitySlider = function(min, max, value) {
    _densitySlider.attr({ min: min, max: max, value: value });
    _densitySlider[0][0].value = value;
  }

  var updateColsSlider = function(min, max, value) {
    _colsSlider.attr({ min: min, max: max, value: value });
    _colsSlider[0][0].value = value;
  }

  var densityValueChanged =  function() {
    stageState.densityValue = +this.value;

    minCols = Math.max(Math.floor(stageState.widthRadiusToCols(stageState.minWidth, stageState.dRadius)), 1);
    maxCols = Math.floor(stageState.widthRadiusToCols(window.innerWidth, stageState.dRadius));
    updateColsSlider(minCols, maxCols, stageState.densityValue);
  };

  var columnsValueChanged = function() {
    var v = +this.value;

    stageState.set({
      densityValue: v,
      width: stageState.radiusDensityToWidth(stageState.dRadius,  v)
    });

    maxDensity = stageState.widthRadiusToCols(stageState.width, stageState.minRadius);
    updateDensitySlider(minDensity, maxDensity, v);
  };

  //----------------------------------------------------------------------------

  stageState.trigger('change'); // render

  maxCols = Math.floor(stageState.widthRadiusToCols(window.innerWidth, stageState.dRadius));
  minCols = stageState.densityValue;

  maxDensity = stageState.widthRadiusToCols(stageState.minWidth, stageState.minRadius);

  updateDensitySlider(minDensity, maxDensity, stageState.densityValue);
  updateColsSlider(minCols, maxCols, minCols);

  _densitySlider.on("change", densityValueChanged);
  _densitySlider.on("input", densityValueChanged);

  _colsSlider.on("change", columnsValueChanged);
  _colsSlider.on("input", columnsValueChanged);

  //----------------------------------------------------------------------------

  var digits = d3.selectAll('#digits-radio input');
  var alreadyWarned = false;

  var onDigitsChange = function() {
    var value = +this.value;

    numbers.setDigits(+this.value, function() {
      stageState.subjectValue = numbers.subjectValue();
    });
  };

  digits.on('click', function() {
    var value = +this.value;
    var warning = 'Displaying 100k digits or more, can be very resource ' +
      'intensive, even on a powerfull computer. Are you sure you would like ' +
      'to proceed?';

    if (value > 4 && !alreadyWarned) {
      if (confirm(warning)) {
        alreadyWarned = true;
      } else {
        d3.event.preventDefault();
        return false;
      }
    }
  });

  digits.on('change', onDigitsChange);
});
