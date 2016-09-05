var State = require('ampersand-state');

//------------------------------------------------------------------------------

var ControlsState = State.extend({
  props: {
    subject: 'state',
    rows: 'state',
    columns: 'state',
    spacing: 'state',
    radius: 'state',
    offset: 'state'
  },

  derived: {
    "digit1k": {
      deps: ["subject.digits"],
      fn: function() {
        return this.subject.digits === 3;
      }
    },
    "digit10k": {
      deps: ["subject.digits"],
      fn: function() {
        return this.subject.digits === 4;
      }
    },
    "digit100k": {
      deps: ["subject.digits"],
      fn: function() {
        return this.subject.digits === 5;
      }
    },
    "digit1m": {
      deps: ["subject.digits"],
      fn: function() {
        return this.subject.digits === 6;
      }
    }
  }
});

module.exports = ControlsState;
