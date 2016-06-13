var hbs = require('handlebars');
var fs = require('fs');

var templatesDir = __dirname + '/js/templates';

var filenames = fs.readdirSync(templatesDir);

filenames.forEach(function (filename) {
  var matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) { return; }
  var name = matches[1];
  var template = fs.readFileSync(templatesDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

var index = fs.readFileSync(__dirname + '/index.hbs', 'utf8');
var indexTemplate = hbs.compile(index);

console.log(indexTemplate({}));
