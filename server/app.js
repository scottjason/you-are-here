var express = require('express');
var fs = require('fs');
var session = require('express-session');
var passport = require('passport');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config');
var https = require('https');
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var app = express();

require('./config/passport/init')(passport);

app.set('port', process.env.PORT || 3000);

var isProduction = (process.env.NODE_ENV === 'production');
isProduction ? app.set('env', 'production') : app.set('env', 'development');

app.disable('x-powered-by');

app.set('views', path.join(config.root, 'server/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use express session support since OAuth2orize requires it
app.use(session({
  secret: 'Super Secret Session Key',
  saveUninitialized: true,
  resave: true
}));
app.use(express.static(path.join(config.root, 'client')));



app.use(passport.initialize());
app.use(passport.session());

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

https.createServer(options, app, function(req, res) {
  console.log('server listening on port 3000')
}).listen(3000);

// set port and start server
// var port = process.env.PORT || 3000;
// var server = app.listen(port, function() {
//   console.log('listening to port:', port);
// });
