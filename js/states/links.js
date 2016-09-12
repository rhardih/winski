var State = require('ampersand-state');
var Numbers = require('../numbers.js');

//------------------------------------------------------------------------------

var LinksState = State.extend({
  props: {
    subject: 'state',
    shared: 'state',
    stage: 'state',
    controls: 'state'
  },

  derived: {
    downloadDisabledPng: {
      deps: [
        'shared.rows',
        'shared.columns',
        'stage.displayMode'
      ],
      fn: function() {
        var tmp = this.shared.rows * this.shared.columns;

        if (this.stage.displayMode == 0) {
          tmp *= 1.3;
        } else if (this.stage.displayMode == 1) {
          tmp *= 1.6;
        }

        // This number is a lower bound approximation to ensure the serialized
        // form of the inline svg isn't too big for canvg to save.
        return tmp > 22000;
      }
    },
    downloadTitlePng: {
      deps: ['downloadDisabledTitle'],
      fn: function() {
        if (this.downloadDisabledSvg) {
          return "Image too big, download not possible"
        } else {
          return "Download as PNG";
        }
      }
    },
    url: {
      deps: [
        'shared.rows',
        'shared.columns',
        'subject.digits',
        'subject.name',
        'shared.radius',
        'shared.spacing',
        'shared.offset',
        'stage.displayMode'
      ],
      fn: function() {
        var tmp = {
          ro: this.shared.rows,
          co: this.shared.columns,
          di: this.subject.digits,
          ra: this.shared.radius,
          sp: this.shared.spacing,
          of: this.shared.offset,
          dm: this.stage.displayMode
        }

        switch (this.subject.name) {
          case Numbers.PHI:
            tmp.su = 0;
            break;
          case Numbers.E:
            tmp.su = 2;
            break;
          default:
            tmp.su = 1;
        }

        var params = Object.keys(tmp).map(function(key){
          return encodeURIComponent(key) + '=' + encodeURIComponent(tmp[key]);
        }).join('&');

        return '?' + params;
      }
    }
  }
})

module.exports = LinksState;
