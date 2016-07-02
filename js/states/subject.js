var State = require('ampersand-state');

var Numbers = require('../numbers.js');

//------------------------------------------------------------------------------

var SubjectState = State.extend({
  initialize: function() {
    this.updateValue();
  },

  props: {
    name: ['string', true, Numbers.PI],
    value: ['string', true, ''],
    numbers: ['object', true, function() { return new Numbers(); }]
  },

  updateValue: function() {
    this.value = this.numbers.subjectValue()
  },

  pi: function(cb) {
    this.name = Numbers.PI;
    var bound = this.updateValue.bind(this);
    this.numbers.setSubject(Numbers.PI, function() {
      bound();
      cb();
    });
  },

  phi: function(cb) {
    this.name = Numbers.PHI;
    var bound = this.updateValue.bind(this);
    this.numbers.setSubject(Numbers.PHI, function() {
      bound();
      cb();
    });
  },

  e: function(cb) {
    this.name = Numbers.E;
    var bound = this.updateValue.bind(this);
    this.numbers.setSubject(Numbers.E, function() {
      bound();
      cb();
    });
  },

  setDigits: function(d, cb) {
    this.numbers.setDigits(d, (function() {
      this.updateValue();
      cb();
    }).bind(this));
  }
});

//------------------------------------------------------------------------------

module.exports = SubjectState;
