var config = require('../config');
var querystring = require('querystring');
var passport = require('passport');
var request = require('request');

var uberDev = 'https://sandbox-api.uber.com/v1';
var uberProd = 'https://api.uber.com/v1';

var yelp = require("yelp").createClient({
  consumer_key: config.yelp.consumerKey,
  consumer_secret: config.yelp.consumerSecret,
  token: config.yelp.token,
  token_secret: config.yelp.tokenSecret
});

exports.render = function(req, res, next) {
  var opts = {};
  if (!req.session.isAuthorized) {
    opts.isAuthorized = false;
    opts.firstName = false;
    opts.lastName = false;
    opts.email = false;
    opts.productId = false;
  } else {
    opts.isAuthorized = true;
    opts.firstName = req.session.firstName;
    opts.lastName = req.session.lastName;
    opts.email = req.session.email;
    opts.productId = req.session.productId;
  }
  res.render('index', opts);
};

exports.isAuthorized = function(req, res, next) {
  if (!req.session.isAuthorized) {
    req.session.destroy(function(err) {
      if (err) console.log('error destroying session', err);
      res.redirect('/');
    });
  } else {
    var currentTime = new Date().getTime();
    var expiresAt = req.session.expiresAt;
    var isExpired = (currentTime >= expiresAt);
    if (isExpired) {
      req.session.destroy(function(err) {
        if (err) console.log('error destroying session', err);
        res.redirect('/');
      });
    } else {
      next(null);
    }
  }
};

exports.logout = function(req, res, next) {
  req.session.destroy(function(err) {
    if (!err) {
      console.log('Session Destroyed', req.session);
    } else {
      console.log('Error Destroying Session', err.message);
    }
    res.status(200).end()
  });
};

exports.getEstimate = function(req, res, next) {
  var url = 'https://api.uber.com/v1/estimates/price?start_latitude=' + req.body.start.lat + '&start_longitude=' + req.body.start.lon + '&end_latitude=' + req.body.end.lat + '&end_longitude=' + req.body.end.lon;
  request(url, {
    'auth': {
      'bearer': req.session.accessToken
    },
  }, function(error, response, body) {
    res.status(200).send(body);
  });
};

exports.getProductId = function(session, cb) {
  var url = uberProd + '/products?latitude=' + session.startLat + '&longitude=' + session.startLon;
  request(url, {
      'auth': {
        'bearer': session.accessToken
      }
    },
    function(err, response, body) {
      if (err) return cb(err);
      if (response.statusCode === 200) {
        var results = JSON.parse(body);
        console.log('results product', results);
        cb(null, results)
      } else {
        cb(new Error('unknown error occurred while retreiving uber product id'));
      }
    });
};

exports.searchYelp = function(req, res, next) {
  yelp.search({
    term: req.params.term,
    location: req.params.city
  }, function(err, results) {
    res.status(200).json(results);
  });
};
