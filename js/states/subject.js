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

//------------------------------------------------------------------------------

module.exports = SubjectState;
