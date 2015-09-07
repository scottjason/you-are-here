var fs = require('fs');
var path = require('path');
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config');

var app = express();

require('./config/passport/uber')(passport);

app.set('port', process.env.PORT || 3000);

var isProduction = (process.env.NODE_ENV === 'production');
isProduction ? app.set('env', 'production') : app.set('env', 'development');

app.disable('x-powered-by');

app.set('views', path.join(config.root, 'server/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));

var sessionOpts = {
  secret: config.session.key,
  saveUninitialized: true,
  resave: true
};

app.use(session(sessionOpts));
app.use(express.static(path.join(config.root, 'client')));
app.use(passport.initialize());
app.use(passport.session());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

require('./routes/index')(app, passport)

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var server = app.listen(app.get('port'), function() {
  console.log('listening to port:', app.get('port'));
});
