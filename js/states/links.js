var State = require('ampersand-state');

//------------------------------------------------------------------------------

var LinksState = State.extend({
  props: {
    subject: 'state',
    shared: 'state',
    stage: 'state',
    controls: 'state'
  },

  derived: {
    downloadDisabled: {
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

        // This number is a heuristic for when the the size of the svg in a
        // serialized form would become a blob that's too big to save.'
        return tmp > 22000;
      }
    },
    downloadDisabledTitle: {
      deps: ['downloadDisabled'],
      fn: function() {
        if (this.downloadDisabled) {
          return "Image too big, download not possible"
        } else {
          return undefined;
        }
      }
    },
    downloadTitlePng: {
      deps: ['downloadDisabledTitle'],
      fn: function() {
        return this.downloadDisabledTitle || "Download as PNG";
      }
    },
    downloadTitleSvg: {
      deps: ['downloadDisabledTitle'],
      fn: function() {
        return this.downloadDisabledTitle || "Download as SVG";
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
