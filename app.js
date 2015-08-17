var express         = require('express');
var path            = require('path');
var session         = require('cookie-session');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser')
var compression     = require('compression');
var mustachex       = require('mustachex');
var morgan          = require('morgan');
var responseTime    = require('response-time');
var controller      = require('./routes/index');
var config          = require(__dirname + '/etc/config.json');

var app = express();

// view engine setup
app.engine('html', mustachex.express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('layout', false);

app.use(morgan('combined', {
    skip: function (req, res) { return config.server.disable_log }
}))


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.set("trust proxy", true);

app.use(session({ secret: config.cookies.secret, cookie: { maxAge: 60000 }}))
app.use(cookieParser( config.cookies.secret ));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression({
    threshold: 512
}));

app.use(responseTime());
app.use('/', controller);

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

function logErrors(err, req, res, next) {
    if(!config.server.disable_log){
        console.error(err.stack);
    }
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: err.message });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    if(!config.server.disable_log){
        console.log(err);
    }    
    var info = { message: "Error", stack: "", layout: false };
    if (err instanceof Error) {
        info.message = err.message;
        if(config.server.devmode){
            info.stack = err.stack && err.stack.split('\n').join('<br/>');
        }
    }    
    res.render('error', info);
}

app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
    res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
    res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

module.exports = app;