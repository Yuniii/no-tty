var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    exec = require('child_process').exec,
    mongoose = require('mongoose'),
    uriUtil = require('mongodb-uri');

var app = express();
var port = process.env.PORT || 8080;

var mongodbUri = 'mongodb://admin:jsland@ds043329.mongolab.com:43329/jsland';
var mongooseUri = uriUtil.formatMongoose(mongodbUri);
mongoose.connect(mongooseUri, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/*
var quizSchema = new mongoose.Schema({
    sn: String,
    title: String,
    content: String,
    stdout: String,
    ans: String,
    chapter: String,
    default: String
}, {collection: 'quiz'});

var quiz = mongoose.model('quiz', quizSchema);
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', function (req, res) {

});

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

db.once('open', function (callback) {
    console.log(app.get('port'));
    app.listen(port);
});
