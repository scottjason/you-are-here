var config = require('../config');
var passport = require('passport');
var request = require('request');

var yelp = require("yelp").createClient({
  consumer_key: config.yelp.consumerKey,
  consumer_secret: config.yelp.consumerSecret,
  token: config.yelp.token,
  token_secret: config.yelp.tokenSecret
});

exports.render = function(req, res, next) {
  var opts = {};
  opts.isAuthorized = false;
  opts.accessToken = null;
  opts.refreshToken = null;
  opts.firstName = null;
  res.render('index', opts);
};

exports.redirect = function(req, res, next) {
  res.redirect('/');
};

exports.getProductId = function(req, res, next) {

  var url = 'https://api.uber.com/v1/products?latitude=' + req.body.startLat + '&longitude=' + req.body.startLon;
  request(url, {
      'auth': {
        'bearer': req.session.accessToken
      }
    },
    function(err, response, body) {
      if (err) return next(err);
      if (response.statusCode === 200) {
        var results = JSON.parse(body);
        res.status(200).json(results);
      } else {
        res.status(401).end();
      }
    });
};

exports.searchYelp = function(req, res, next) {
  yelp.search({
    term: req.params.term,
    location: req.params.city
  }, function(err, results) {
    console.log(err || results);
    res.status(200).json(results);
  });
};

exports.getEstimate = function(req, res, next) {
  var startLat = req.params.startLat;
  var startLon = req.params.startLon;
  var endLat = req.params.endLat;
  var endLon = req.params.endLon;
  console.log('startLat', startLat);
};
