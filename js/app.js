var State = require('ampersand-state');
var View = require('ampersand-view');

var SubjectState = require('./states/subject.js');
var LinksState = require('./states/links.js');
var ControlsState = require('./states/controls.js');
var StageView = require('./views/stage.js');
var ControlsView = require('./views/controls.js');
var LinksView = require('./views/links.js');

//------------------------------------------------------------------------------

// Initial values

var paramsStr = location.search.substr(1);
var params = {}, tmp;

if (paramsStr.length > 0) {
  paramsStr.split("&").forEach(function(e) {
    tmp = e.split("=");
    params[decodeURIComponent(tmp[0])] =
      parseInt(decodeURIComponent(tmp[1]), 10);
  });
}

var ROWS = 'ro' in params ? params.ro : 50;
var COLUMNS = 'co' in params ? params.co : 20;
var RADIUS = 'ra' in params ? params.ra : 7;
var SPACING = 'sp' in params ? params.sp : 25;
var OFFSET = 'of' in params ? params.of : 0;
var DISPLAYMODE = 'dm' in params ? params.dm : 0;
var DIGITS = 'di' in params ? params.di : 3;
var SUBJECT = 'su' in params ? params.su : 1;

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
        return Math.ceil((this.subject.value.length - 1) / this.shared.columns);
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

var OffsetState = SliderState.extend({
  props: {
    shared: 'state',
    subject: 'state',

    min: ['number', true, 0],
    value: ['number', true, OFFSET],
  },

  derived: {
    max: {
      deps: ['subject.value', 'shared.rows', 'shared.columns'],
      fn: function() {
        var tmp = Math.floor(this.subject.value.length / this.shared.columns) -
          this.shared.rows
        return Math.max(tmp, 0);
      }
    }
  }
});

var StageState = State.extend({
  props: {
    shared: 'state',
    subject: 'state',

    displayMode: ['number', true, DISPLAYMODE],
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
      deps: ['shared.rows', 'shared.radius', 'shared.spacing'],
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
    offset: { type: 'number', required: true, default: OFFSET },
  }, function(v) {
    if (v < 0 || isNaN(v)) {
      return "Must be a positive number";
    }

    return false;
  }, "test"),
});

//------------------------------------------------------------------------------

var sharedState = new SharedState();
var subjectState = new SubjectState();

switch (SUBJECT) {
  case 0:
    subjectState.setPhi();
    break;
  case 2:
    subjectState.setE();
    break;
  default:
    subjectState.setPi();
}

var load = function() {
  var svgEl = document.querySelector('svg');
  var controlsEl = document.querySelector('#dropdown-controls');
  var linksEl = document.querySelector('#dropdown-links');

  //----------------------------------------------------------------------------

  var rowsState = new RowsState({ shared: sharedState, subject: subjectState });
  var columnsState = new ColumnsState({ shared: sharedState });
  var radiusState = new RadiusState({ shared: sharedState });
  var spacingState = new SpacingState({ shared: sharedState });
  var offsetState = new OffsetState({ shared: sharedState, subject: subjectState });

  var controlsState = new ControlsState({
    subject: subjectState,
    rows: rowsState,
    columns: columnsState,
    spacing: spacingState,
    radius: radiusState,
    offset: offsetState
  });

  var stageState = new StageState({
    shared: sharedState,
    subject: subjectState,
    controls: controlsState
  });

  var linksState = new LinksState({
    subject: subjectState,
    shared: sharedState,
    stage: stageState,
    controls: controlsState
  });

  var controlsView = new ControlsView({
    model: controlsState,
    el: controlsEl,
  });

  var linksView = new LinksView({
    model: linksState,
    el: linksEl
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

  offsetState.on('change:boundedValue', function() {
    sharedState.offset = this.boundedValue;
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

  sharedState.on('change:offset', function() {
    offsetState.value = this.offset;
  });

  sharedState.on('change', function() {
    stageView.render();
  });


  stageState.on('change:displayMode change:limit', function() {
    stageView.render();
  })


  subjectState.on('change:value', function() {
    stageView.render();
  });
}

if (DIGITS > 3) {
  subjectState.once('done', function() {
    ready(load);
  });
  subjectState.digits = DIGITS;
} else {
  ready(load);
}
