var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    exec = require('child_process').exec,
    shortID = require('shortid');

var app = express();
var port = 8080;

function checkAuth (req, res, next) {
    if (req.session.userAccount) {
        next();
        return;
    }
    res.redirect('/login');
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: '1234', resave: false, saveUninitialized: false}));

app.get('/app', checkAuth, function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
    if (req.session.userAccount) {
        res.redirect('/app');
        return;
    }
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', function (req, res) {
    if (req.session.userAccount) {
        res.redirect('/app');
        return;
    } 
    if (req.body.account === 'account' && req.body.password === '1234') {
        req.session.userAccount = req.body.account;
        res.redirect('/app');
    } else {
        res.redirect('/login');
    }
});

app.post('/run', function (req, res) {
    var className = 'Main',
        path = __dirname + '/' + shortID.generate() + '/',
        javaFile = path + className + '.java';

    if ( ! fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    if (fs.existsSync(javaFile)) {
        fs.unlinkSync(javaFile);
    }
    fs.writeFileSync(javaFile, req.body.code);

    exec('echo 00000000 | sudo -S docker run -v ' + path + ':/data/mounted derrickh/java7', function (err, stdout, stderr) {
        res.send(stdout);
        fs.unlinkSync(javaFile);
        fs.rmdirSync(path);
    });
});

app.use('/js/', express.static(__dirname + '/js/'));
app.use('/css/', express.static(__dirname + '/css/'));
app.use('/fonts/', express.static(__dirname + '/fonts/'));

console.log('port: ' + port);
app.listen(port);
