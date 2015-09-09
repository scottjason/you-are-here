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

exports.logout = function(req, res, next) {
  req.session.destroy(function(err) {
    if (!err) {
      console.log('Session Destroyed', req.session);
    } else {
      console.log('Error Destroying Session', err.message);
    }
    res.status(200).end()
  });
}

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
    res.send(body);
  });
};

exports.getRideStatus = function(req, res, next) {
  console.log('getRideStatus', req.session);
  var url = "https://sandbox-api.uber.com/v1/requests/" + req.params.requestId;
  request(url, {
      'auth': {
        'bearer': req.session.accessToken
      }
    },
    function(err, response, body) {
      console.log('err', err);
      console.log('body', body);
      if (err) return next(err);
      if (response.statusCode === 200) {
        res.status(200).send(body);
      } else {
        res.status(401).send(new Error('unknown error occurred while retreiving uber ride status'));
      }
    });
};
exports.updateRideStatus = function(req, res, next) {
  console.log('updateRideStatus', req.session);

  request.put({
      url: "https://sandbox-api.uber.com/v1/sandbox/requests/" + req.params.requestId,
      'auth': {
        'bearer': req.session.accessToken,
        "Content-Type": "application/json"
      },
      json: {
        "status": "accepted"
      }
    },
    function(err, response, body) {
      console.log(body)
      if (err) return next(err);
      if (response.statusCode === 200) {
        res.status(200).send(body);
      } else {
        res.status(401).send(new Error('unknown error occurred while updating uber ride status'));
      }
    });
};

exports.cancelRide = function(req, res, next) {
  request.del({
      url: "https://sandbox-api.uber.com/v1/requests/" + req.params.requestId,
      'auth': {
        'bearer': req.session.accessToken
      }
    },
    function(err, response, body) {
      if (err) return next(err);
      if (response.statusCode === 204) {
        res.status(200).end();
      } else {
        res.status(401).send(new Error('unknown error occurred while updating uber ride status'));
      }
    });
};
