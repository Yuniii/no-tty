var express = require('express'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	exec = require('child_process').exec;
var app = express();
var port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/run', function (req, res) {
	var className = 'Main',
		path = __dirname + '/code/',
		file = path + className + '.java';

	if ( ! fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
	if (fs.existsSync(file)) {
		fs.unlinkSync(file);
	}

	fs.writeFileSync(file, req.body.code);
	exec('javac ' + file, function (er, o, e) {
		exec('java -classpath ' + path + ' ' + className, function (err, stdout, stderr) {
			res.send(stdout);
		});
	});
});

app.use('/', express.static(__dirname + '/'));

console.log(port);
app.listen(port);
