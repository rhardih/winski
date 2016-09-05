var State = require('ampersand-state');

//------------------------------------------------------------------------------

var LinksState = State.extend({
  props: {
    subject: 'state',
    shared: 'state',
    stage: 'state'
  },

  derived: {
    downloadDisabled: {
      deps: ['subject.digits'],
      fn: function() {
        return this.subject.digits > 4;
      }
    },
    downloadTitle: {
      deps: ['downloadDisabled'],
      fn: function() {
        if (this.downloadDisabled) {
          return "Image too big, download not possible"
        } else {
          return  "Download as PNG"
        }
      }
    },
    url: {
      deps: [
        'shared.rows',
        'shared.columns',
        'subject.digits',
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

        var params = Object.keys(tmp).map(function(key){
          return encodeURIComponent(key) + '=' + encodeURIComponent(tmp[key]);
        }).join('&');

        return '?' + params;
      }
    }
  }
})

module.exports = LinksState;
