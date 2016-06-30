var State = require('ampersand-state');
var View = require('ampersand-view');

var Numbers = require('./numbers.js');
var StageView = require('./views/stage.js');
var ControlsView = require('./views/controls.js');

//------------------------------------------------------------------------------

// Initial values

var RADIUS = 7;
var ROWS = 50;
var COLUMNS = 20;
var SPACING = 25;

//------------------------------------------------------------------------------

var ready = function(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

var AttachToAll = function(obj, fun, prop) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key)) {
      obj[key][prop] = fun;
    }
  }

  return obj;
}

//------------------------------------------------------------------------------

var SliderState = State.extend({
  props: {
    min: ['number', true, 1],
    max: ['number', true, 1],
    value: ['number', true, 1],
  },

  derived: {
    boundedValue: {
      deps: ['min', 'max', 'value'],
      fn: function() {
        return Math.min(this.max, Math.max(this.min, this.value));
      }
    }
  }
});

var RowsState = SliderState.extend({
  props: {
    shared: 'state',

    value: ['number', true, ROWS],
    subject: 'state',
  },

  derived: {
    max: {
      deps: ['subject.value', 'shared.columns'],
      fn: function() {
        return Math.ceil(this.subject.value.length / this.shared.columns);
      }
    }
  }
});

var ColumnsState = SliderState.extend({
  props: {
    shared: 'state',

    value: ['number', true, COLUMNS],
  },

  derived: {
    max: {
      deps: ['shared.spacing', 'shared.radius'],
      fn: function() {
        return Math.floor(
          (window.innerWidth + this.shared.spacing) /
          ((2 * this.shared.radius) + this.shared.spacing)
        );
      }
    }
  }
});

var RadiusState = SliderState.extend({
  props: {
    shared: 'state',

    min: ['number', true, 1],
    value: ['number', true, RADIUS]
  },

  derived: {
    max: {
      deps: ['shared.width', 'shared.spacing'],
      fn: function() {
        return (window.innerWidth - 2 * this.shared.spacing) / 2;
      }
    }
  }
});

var SpacingState = SliderState.extend({
  props: {
    shared: 'state',

    min: ['number', true, 0],
    value: ['number', true, SPACING],
  },

  derived: {
    max: {
      deps: ['shared.radius', 'shared.columns'],
      fn: function() {
        var tmp;

        if (this.shared.columns === 1) {
          return 0;
        } else {
          tmp = window.innerWidth -
            (2 * this.shared.radius * this.shared.columns);
          tmp /= this.shared.columns - 1;

          return Math.floor(Math.max(tmp, this.min));
        }
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
    rows: 'state',
    columns: 'state',
    spacing: 'state',
    radius: 'state'
  }
});

var StageState = State.extend({
  props: {
    shared: 'state',

    displayMode: ['number', true, 0],
    subject: 'state',
  },

  derived: {
    limit :{
      deps: ['subject.value', 'shared.rows', 'shared.columns'],
      fn: function() {
        var tmp = this.shared.rows * this.shared.columns;
        return Math.min(this.subject.value.length, tmp);
      }
    },
    width: {
      deps: ['shared.columns', 'shared.radius', 'shared.spacing'],
      fn: function() {
        return this.shared.columns * 2 * this.shared.radius +
          this.shared.spacing * (this.shared.columns - 1);
      }
    },
    height: {
      deps: ['shared.columns', 'shared.radius', 'shared.spacing'],
      fn: function() {
        return this.shared.rows * 2 * this.shared.radius +
          this.shared.spacing * (this.shared.rows - 1);
      }
    }
  },

  cycleDisplayMode: function() {
    this.displayMode = (this.displayMode + 1) % 3;
  }
});

var SharedState = State.extend({
  props: AttachToAll({
    rows: { type: 'number', required: true, default: ROWS },
    columns: { type: 'number', required: true, default: COLUMNS },
    radius: { type: 'number', required: true, default: RADIUS },
    spacing: { type: 'number', required: true, default: SPACING },
  }, function(v) {
    if (v < 0 || isNaN(v)) {
      return "Must be a positive number";
    }

    return false;
  }, "test"),
});

//------------------------------------------------------------------------------

ready(function() {
  var numbers = new Numbers();

  var svgEl = document.querySelector('svg');
  var controlsEl = document.querySelector('#dropdown-controls');

  //----------------------------------------------------------------------------

  var sharedState = new SharedState();
  var subjectState = new SubjectState({
    name: Numbers.PI,
    value: numbers.subjectValue()
  });

  var rowsState = new RowsState({ shared: sharedState, subject: subjectState });
  var columnsState = new ColumnsState({ shared: sharedState });
  var radiusState = new RadiusState({ shared: sharedState });
  var spacingState = new SpacingState({ shared: sharedState });

  var controlsState = new ControlsState({
    subject: subjectState,
    rows: rowsState,
    columns: columnsState,
    spacing: spacingState,
    radius: radiusState
  });

  var stageState = new StageState({
    shared: sharedState,
    subject: subjectState,
    controls: controlsState
  });

  var controlsView = new ControlsView({
    model: controlsState,
    el: controlsEl,
  });

  var stageView = new StageView({
    model: stageState,
    el: svgEl
  });

  rowsState.on('change:boundedValue', function() {
    sharedState.rows = this.boundedValue;
  });

  columnsState.on('change:boundedValue', function() {
    sharedState.columns = this.boundedValue;
  });

  radiusState.on('change:boundedValue', function() {
    sharedState.radius = this.boundedValue;
  });

  spacingState.on('change:boundedValue', function() {
    sharedState.spacing = this.boundedValue;
  });

  sharedState.on('change:columns', function() {
    columnsState.value = this.columns;
  });

  sharedState.on('change:spacing', function() {
    spacingState.value = this.spacing;
  });

  sharedState.on('change:radius', function() {
    radiusState.value = this.radius;
  });

  sharedState.on('change', function() {
    stageView.render();
  });

  controlsState.on('change:digits', function() {
    stageState.subject.setDigits(this.digits, function() {
      rowsState.value = rowsState.max;
    });
  });

  stageState.on('change:displayMode change:limit', function() {
    stageView.render();
  })

  stageState.subject.on('change:value', function() {
    stageView.render();
  });
});
