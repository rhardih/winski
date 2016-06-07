(function() {
function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

//------------------------------------------------------------------------------

var Numbers = function() {
  this.subject = Numbers.PI;
  this.digits = 3;

  var currentMax = {};
  currentMax[Numbers.PI] = 3;
  currentMax[Numbers.PHI] = 3;
  currentMax[Numbers.E] = 3;

  var request = new XMLHttpRequest();

  var fetchDigits = function(url, success, error) {
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        success(request.responseText);
      } else {
        console.log("onload:error");
        error()
      }
    };

    request.onerror = function() {
      console.log("onerror:error");
      error();
    };

    request.send();
  }

  this.setDigits = function(n, done) {
    var url;
    var that = this;

    if (n < 3 || n > 6) return;
    if (n > currentMax[this.subject]) {
      url = [
        "data/",
        this.subject,
        "1",
        Array(n + 1).join("0"),
        ".csv"
      ].join("");

      fetchDigits(url, function(value) {
        that[that.subject] = value;
        done();
      }, function() {});

      currentMax[this.subject] = n;
    } else {
      done();
    }

    this.digits = n;
  }

  this.subjectValue = function() {
    return this[this.subject].substring(0, Math.pow(10, this.digits));
  }

  this.setSubject = function(s, done) {
    this.subject = s;
    this.setDigits(this.digits, done);
  }
}

Numbers.PI = "pi";
Numbers.PHI = "phi";
Numbers.E = "e";

Numbers.prototype[Numbers.PI] = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";

Numbers.prototype[Numbers.PHI] = "1618033988749894848204586834365638117720309179805762862135448622705260462818902449707207204189391137484754088075386891752126633862223536931793180060766726354433389086595939582905638322661319928290267880675208766892501711696207032221043216269548626296313614438149758701220340805887954454749246185695364864449241044320771344947049565846788509874339442212544877066478091588460749988712400765217057517978834166256249407589069704000281210427621771117778053153171410117046665991466979873176135600670874807101317952368942752194843530567830022878569978297783478458782289110976250030269615617002504643382437764861028383126833037242926752631165339247316711121158818638513316203840052221657912866752946549068113171599343235973494985090409476213222981017261070596116456299098162905552085247903524060201727997471753427775927786256194320827505131218156285512224809394712341451702237358057727861600868838295230459264787801788992199027077690389532196819861514378031499741106926088674296226757560523172777520353613936";

Numbers.prototype[Numbers.E] = "2718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427427466391932003059921817413596629043572900334295260595630738132328627943490763233829880753195251019011573834187930702154089149934884167509244761460668082264800168477411853742345442437107539077744992069551702761838606261331384583000752044933826560297606737113200709328709127443747047230696977209310141692836819025515108657463772111252389784425056953696770785449969967946864454905987931636889230098793127736178215424999229576351482208269895193668033182528869398496465105820939239829488793320362509443117301238197068416140397019837679320683282376464804295311802328782509819455815301756717361332069811250996181881593041690351598888519345807273866738589422879228499892086805825749279610484198444363463244968487560233624827041978623209002160990235304369941849146314093431738143640546253152096183690888707016768396424378140592714563549061303107208510383750510115747704171898610687396965521267154688957035035";

var colors = [ "#DA416C", "#F15637", "#E35736", "#E8BA3B", "#F3C92D", "#A0AA39",
  "#5DA33F", "#1D91DA", "#3C5481", "#91477B"];
var minWidth = 768;
var minRadius = 0.5;

var radius;
var gridSpacing = 25;
var padding;
var alreadyWarned = false;

var widthColsToRadius = function(width, cols) {
  // width: 2 * (gridSpacing + radius) + (cols - 1) * (2 * radius + gridSpacing)
	// w = 2 * (g + r) + (c - 1) * (2 * r + g)
  // w = c * g + 2 * c * r + g
  // (w - (c * g) - g) / (2 * c) = r
  return (width - (cols * gridSpacing) - gridSpacing) / (2 * cols);
}

var radiusDensityToWidth = function(radius, cols) {
  return cols * gridSpacing + 2 * cols * radius + gridSpacing;
}

var widthRadiusToCols = function(width, radius) {
  // w = c *(g + 2 * r) + g
  // (w - g) / (g + 2 * r) = c
  return (width - gridSpacing) / (gridSpacing + 2 * radius);
}

var render = function(cols, lines, numbers) {
  var svg = d3.select("svg");
  var subject = numbers.subjectValue();
  var limit = subject.length;
  var width = svg.attr("width");
	var heigth;
	var strokeWidth;
	var circlesData = [];
	var linesData = [];
	var thisDigit;
	var digitSW, digitW, digitNW, digitN;
	var nextDigit = 3;
	var thisX, nextX, thisY, nextY;
	var thisColor;
	var xIndex;
  var xCoord = function(i) {
    return padding + (i % cols) * (gridSpacing + 2 * radius);
  }
  var yCoord = function(i) {
    return padding + Math.floor(i / cols) * (gridSpacing + 2 * radius);
  }

  radius = widthColsToRadius(width, cols);
  strokeWidth = radius / 2.5;
  padding = radius + gridSpacing;

  height = (2 * padding) + (limit / cols) * (2 * radius) + ((limit / cols) - 1) * gridSpacing;
  svg.attr("height", height);

  for (var i = 0; i < limit; i++) {
    thisDigit = nextDigit;
    nextDigit = parseInt(subject.charAt(i + 1), 10);
    thisColor = colors[thisDigit];
    thisX = xCoord(i);
    thisY = yCoord(i);
    nextX = xCoord(i + 1);
    nextY = yCoord(i + 1);
    xIndex = i % cols;

    var datum = {
      outerColor: thisColor,
      innerColor: colors[nextDigit],
      x: thisX,
      y: thisY,
      r: radius
    };

    circlesData.push(datum)

    if (lines && i > cols) { // second row and onwards
      digitN = parseInt(subject.charAt(i - cols), 10);
      nX = xCoord(i - cols);
      nY = yCoord(i - cols);

      if (thisDigit === digitN) {
        linesData.push({
          x1: thisX, x2: nX,
          y1: thisY, y2: nY,
          color: thisColor,
          "stroke-width": datum.r
        })
      }

      if (xIndex > 0) {
        digitW = parseInt(subject.charAt(i - 1), 10);
        digitNW = parseInt(subject.charAt(i - cols - 1), 10);

        if (i < (limit - cols - 1)) {
          digitSW = parseInt(subject.charAt(i + cols - 1), 10);

          if (thisDigit === digitSW) {
            swX = xCoord(i + cols - 1);
            swY = yCoord(i + cols - 1);

            linesData.push({
              x1: thisX, x2: swX,
              y1: thisY, y2: swY,
              color: thisColor,
              "stroke-width": datum.r
            })
          }
        }

        if (thisDigit === digitW) {
          wX = xCoord(i - 1);
          wY = yCoord(i - 1);

          linesData.push({
            x1: thisX, x2: wX,
            y1: thisY, y2: wY,
            color: thisColor,
            "stroke-width": datum.r
          })
        }

        if (thisDigit === digitNW) {
          nwX = xCoord(i - cols - 1);
          nwY = yCoord(i - cols - 1);

          linesData.push({
            x1: thisX, x2: nwX,
            y1: thisY, y2: nwY,
            color: thisColor,
            "stroke-width": datum.r
          })
        }
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
  var circleAttr = {
    r: function(d) { return d.r },
    "stroke-width": function(d) { return d.r / 1.4 },
    "stroke": function(d) { return d.outerColor; },
    "clip-path": "url(#cstroke)"
  }

  // Enter
  var groups = circlesSelection.enter().append('g'); 
  var circle = groups.append('circle').attr(circleAttr).
    style("fill", function(d) { return d.innerColor; });

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
};

var initSvg = function(svg) {
  svg.append('defs').append('clipPath').attr({id: 'cstroke'}).
    append('circle');
  svg.append('g').classed('lines', true);
  svg.append('g').classed('circles', true);
}

ready(function() {
  var _densitySlider = d3.select("#density-slider");
  var _colsSlider = d3.select("#columns-slider");
  var minDensity = 1, maxDensity = 29, densityValue = 20;
  var minCols = 1, maxCols = 29, colsValue = 20;
  var numbers = new Numbers();

  var _phi = d3.select("#phi-link");
  var _pi = d3.select("#pi-link");
  var _e = d3.select("#e-link");

  var svg = d3.select("svg");
  initSvg(svg);

  var lines = false;

  _phi.on("click", function() {
    d3.event.preventDefault();

    _phi.classed("active", true);
    _pi.classed("active", false);
    _e.classed("active", false);

    numbers.setSubject(Numbers.PHI, function() {
      render(densityValue, lines, numbers);
    });
  });

  _pi.on("click", function() {
    d3.event.preventDefault();

    _phi.classed("active", false);
    _pi.classed("active", true);
    _e.classed("active", false);

    numbers.setSubject(Numbers.PI, function() {
      render(densityValue, lines, numbers);
    });
  });

  _e.on("click", function() {
    d3.event.preventDefault();

    _phi.classed("active", false);
    _pi.classed("active", false);
    _e.classed("active", true);

    numbers.setSubject(Numbers.E, function() {
      render(densityValue, lines, numbers);
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
    densityValue = +this.value;

    render(densityValue, lines, numbers);

    minCols = Math.max(Math.floor(widthRadiusToCols(minWidth, radius)), 1);
    maxCols = Math.floor(widthRadiusToCols(window.innerWidth, radius));
    updateColsSlider(minCols, maxCols, densityValue);
  };

  var columnsValueChanged = function() {
    densityValue = +this.value;

    var w = radiusDensityToWidth(radius,  densityValue);

    svg.attr("width", w);

    render(densityValue, lines, numbers);

    maxDensity = widthRadiusToCols(w, minRadius);
    updateDensitySlider(minDensity, maxDensity, densityValue);
  };

  //----------------------------------------------------------------------------

  // *sets radius
  render(densityValue, lines, numbers);

  maxCols = Math.floor(widthRadiusToCols(window.innerWidth, radius));
  minCols = densityValue;

  maxDensity = widthRadiusToCols(minWidth, minRadius);

  updateDensitySlider(minDensity, maxDensity, densityValue);
  updateColsSlider(minCols, maxCols, minCols);

  _densitySlider.on("change", densityValueChanged);
  _densitySlider.on("input", densityValueChanged);

  _colsSlider.on("change", columnsValueChanged);
  _colsSlider.on("input", columnsValueChanged);

  //----------------------------------------------------------------------------

  svg.on("click", function() {
    lines = !lines;
    render(densityValue, lines, numbers);
  });

  var digits = d3.selectAll('#digits-radio input');
  var onDigitsChange = function() {
    var value = +this.value;

    numbers.setDigits(+this.value, function() {
      render(densityValue, lines, numbers);
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
})();

