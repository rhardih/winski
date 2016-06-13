var View = require('ampersand-view');

//------------------------------------------------------------------------------

var StageView = View.extend({
  template: '<svg id="stage"></svg>',

  autoRender: true,

  bindings: {
    "model.width": {
      type: "attribute",
      name: "width"
    }
  },

  events: {
    'click': function() {
      this.model.cycleDisplayMode();
    }
  },

  svg: null,
  colors:  [
    "#ED2079", "#ED3E36", "#F76321", "#FFB73B", "#F5EC2B",
    "#8DC53A", "#37B347", "#00ABEE", "#283891", "#92278B"
  ],

  render: function() {
    if (!this.rendered) {
      View.prototype.render.apply(this, arguments);

      this.svg = d3.select(this.el);

      this.svg.append('defs').append('clipPath').attr({id: 'cstroke'}).
        append('circle');
      this.svg.append('g').classed('lines', true);
      this.svg.append('g').classed('circles', true);
    }

    var that = this;

    var cols = this.model.densityValue;
    var displayMode = this.model.displayMode;
    var subject = this.model.subjectValue;

    var svg = this.svg;
    var limit = subject.length;
    var width = svg.attr("width");
    var heigth;
    var strokeWidth;
    var circlesData = [];
    var linesData = [];
    var thisDigit;
    var digitSW, digitW, digitNW, digitN;
    var iSW, iW, iNW, iN;
    var nextDigit = 3;
    var thisX, nextX, thisY, nextY;
    var thisColor;
    var firstCol, lastCol, firstRow, lastRow;
    var datum;
    var i, xIndex;
    var radius = this.model.dRadius;
    var padding = radius + this.model.spacing;
    var xCoord = function(i) {
      return padding + (i % cols) * (that.model.spacing + 2 * radius);
    }
    var yCoord = function(i) {
      return padding + Math.floor(i / cols) * (that.model.spacing + 2 * radius);
    }
    var markEqualNeigbour = function(i) {
      if (typeof circlesData[i] !== 'undefined') {
        circlesData[i].hasEqualNeighbour = true;
      }
    };
    strokeWidth = radius / 2.5;

    height = (2 * padding) + (limit / cols) * (2 * radius) + ((limit / cols) - 1) * this.model.spacing;
    svg.attr("height", height);

    for (i = 0; i < limit; i++) {
      thisDigit = nextDigit;
      nextDigit = parseInt(subject.charAt(i + 1), 10);
      thisColor = this.colors[thisDigit];
      thisX = xCoord(i);
      thisY = yCoord(i);
      nextX = xCoord(i + 1);
      nextY = yCoord(i + 1);
      xIndex = i % cols;
      firstCol = xIndex === 0;
      lastCol = xIndex === cols - 1;
      firstRow = i <= cols;
      lastRow = i >= (limit - cols - 1);

      datum = {
        outerColor: thisColor,
        innerColor: this.colors[nextDigit],
        x: thisX,
        y: thisY,
        r: radius,
        hasEqualNeighbour: false
      };

      if (displayMode > 0) {
        if (!firstCol && !lastRow) {
          iSW = i + cols - 1;
          digitSW = parseInt(subject.charAt(iSW), 10);

          if (thisDigit === digitSW) {
            markEqualNeigbour(iSW);
            datum.hasEqualNeighbour = true;
            swX = xCoord(iSW);
            swY = yCoord(iSW);

            linesData.push({
              x1: thisX, x2: swX,
              y1: thisY, y2: swY,
              color: thisColor,
              "stroke-width": datum.r
            })
          }
        }

        if (!firstRow) { // second row and onwards
          iN = i - cols;
          digitN = parseInt(subject.charAt(iN), 10);
          nX = xCoord(iN);
          nY = yCoord(iN);

          if (thisDigit === digitN) {
            markEqualNeigbour(iN);
            datum.hasEqualNeighbour = true;

            linesData.push({
              x1: thisX, x2: nX,
              y1: thisY, y2: nY,
              color: thisColor,
              "stroke-width": datum.r
            })
          }

          if (!firstCol) {
            iW = i - 1;
            iNW = i - cols - 1;
            digitW = parseInt(subject.charAt(iW), 10);
            digitNW = parseInt(subject.charAt(iNW), 10);

            if (thisDigit === digitW) {
              markEqualNeigbour(iW);
              datum.hasEqualNeighbour = true;
              wX = xCoord(iW);
              wY = yCoord(iW);

              linesData.push({
                x1: thisX, x2: wX,
                y1: thisY, y2: wY,
                color: thisColor,
                "stroke-width": datum.r
              })
            }

            if (thisDigit === digitNW) {
              markEqualNeigbour(iNW);
              datum.hasEqualNeighbour = true;

              nwX = xCoord(iNW);
              nwY = yCoord(iNW);

              linesData.push({
                x1: thisX, x2: nwX,
                y1: thisY, y2: nwY,
                color: thisColor,
                "stroke-width": datum.r
              })
            }
          }
        }

        if (!lastCol) {
          // Special case because we can't "mark" neighbours ahead of them being
          // inserted into circlesData, which is the case of digitSW === thisDigit

          digitNE = parseInt(subject.charAt(i - cols + 1), 10);

          if (thisDigit === digitNE) {
            if (typeof circlesData[i - cols + 1] !== 'undefined') {
              circlesData[i - cols + 1].hasEqualNeighbour = true;
            }
            datum.hasEqualNeighbour = true;
          }
        }
      }

      circlesData.push(datum)
    }


    // Remove neighbourless circles in third display mode
    if (displayMode === 2) {
      for (i = circlesData.length - 1; i >= 0; i -= 1) {
        if (!circlesData[i].hasEqualNeighbour) {
          circlesData.splice(i, 1);
        }
      }
    }

    // CIRCLES

    var circlesGroup = svg.select('g.circles');
    var circlesSelection = circlesGroup.selectAll('g').data(circlesData);
    var clipStrokeCircle = svg.select('#cstroke circle');
    clipStrokeCircle.attr({ r: radius });

    var groupAttr = {
      transform: function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      }
    }

    var colorValve = function(open, colorCode) {
      if (displayMode === 2) {
        if (open) {
          return colorCode;
        } else {
          return '#000';
        }
      } else {
        return colorCode;
      }
    };

    var circleAttr = {
      r: function(d) { return d.r },
      "stroke-width": function(d) { return d.r / 1.4 },
      "stroke": function(d) {
        return d.outerColor;
        //return colorValve(d.hasEqualNeighbour, d.outerColor);
      },
      "clip-path": "url(#cstroke)",
      "fill": function(d) {
        return d.innerColor;
        //return colorValve(d.hasEqualNeighbour, d.innerColor);
      }

    }

    // Enter
    var groups = circlesSelection.enter().append('g');
    var circle = groups.append('circle');

    // Enter + Update
    circlesSelection.attr(groupAttr).select('circle').attr(circleAttr);

    circlesSelection.exit().remove();

    // LINES

    var linesGroup = svg.select('g.lines');
    var linesSelection = linesGroup.selectAll('line').data(linesData);

    var linesAttr = {
      x1: function(d) { return d.x1; },
      y1: function(d) { return d.y1; },
      x2: function(d) { return d.x2; },
      y2: function(d) { return d.y2; },
      "stroke-width": function(d) { return d["stroke-width"]; },
      "stroke": function(d) { return d.color; }
    };

    // Enter
    linesSelection.enter().append('line');

    // Enter + Update
    linesSelection.attr(linesAttr);

    linesSelection.exit().remove();
  }
});

module.exports = StageView;
