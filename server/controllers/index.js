var config = require('../config');
var querystring = require('querystring');
var passport = require('passport');
var request = require('request');
var http = require('http');

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
    opts.accessToken = false;
    opts.refreshToken = false;
    opts.firstName = false;
    opts.uberXId = false;
  } else {
    opts.isAuthorized = true;
    opts.accessToken = req.session.accessToken;
    opts.refreshToken = req.session.refreshToken;
    opts.firstName = req.session.firstName;
    opts.uberXId = req.session.uberXId;
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

exports.getProductId = function(session, cb) {

  var url = uberDev + '/products?latitude=' + session.startLat + '&longitude=' + session.startLon;
  request(url, {
      'auth': {
        'bearer': session.accessToken
      }
    },
    function(err, response, body) {
      if (err) return cb(err);
      if (response.statusCode === 200) {
        var results = JSON.parse(body);
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

exports.requestRide = function(req, res, next) {
  request.post({
    url: 'https://sandbox-api.uber.com/v1/requests',
    'auth': {
      'bearer': req.session.accessToken,
      "Content-Type": "application/json"
    },
    json: {
      product_id: req.session.uberXId,
      start_latitude: req.session.startLat,
      start_longitude: req.session.startLon,
      end_latitude: req.params.endLat,
      end_longitude: req.params.endLon
    }
  }, function(err, httpResponse, body) {
    req.session.requestId = body.request_id;
    res.send(body);
  });
};

exports.cancelRide = function(req, res, next) {

};

exports.getEstimate = function(req, res, next) {
  var startLat = req.params.startLat;
  var startLon = req.params.startLon;
  var endLat = req.params.endLat;
  var endLon = req.params.endLon;
  console.log('startLat', startLat);
};
