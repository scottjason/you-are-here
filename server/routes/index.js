var Uber = require('node-uber');
var config = require('../config');
var express = require('express');
var router = express.Router();
var async = require('async');
var indexCtrl = require('../controllers/index');
var request = require('request');
var bodyParser = require('body-parser');

var uberDev = 'https://sandbox-api.uber.com/v1';
var uberProd = 'https://api.uber.com/v1';

module.exports = function(app, passport) {

  /*
   * No Authentication Required Endpoints
   **/

  router.get('/', indexCtrl.render);
  router.get('/logout', indexCtrl.logout);
  router.get('/login/:startLat/:startLon', function(req, res, next) {
    req.session.startLat = req.params.startLat;
    req.session.startLon = req.params.startLon;
    passport.authenticate('uber', {
      scope: ['profile', 'history']
    })(req, res, next);
  });
  router.get('/auth/callback', function(req, res, next) {
    var uberClient = new Uber({
      client_id: config.uber.clientId,
      client_secret: config.uber.clientSecret,
      server_token: config.uber.serverToken,
      name: config.uber.name,
      redirect_uri: config.uber.callbackUrl
    });

    process.nextTick(function() {

      uberClient.authorization({
          authorization_code: req.query.code
        },
        function(err, access_token, refresh_token) {
          if (err) {
            console.error(err);
          } else {
            request.get(uberProd + '/me', {
                'auth': {
                  'bearer': access_token
                }
              },
              function(error, response, body) {
                var user = JSON.parse(body);
                var opts = {};
                opts.productIds = [];
                req.session.cookie.expires = new Date().getTime() + 1.74e+6;
                req.session.cookie.maxAge = 1.74e+6;
                opts.clientId = req.session.clientId = config.uber.clientId;
                opts.accessToken = req.session.accessToken = access_token;
                opts.refreshToken = req.session.refreshToken = refresh_token;
                opts.firstName = req.session.firstName = user.first_name || null;
                opts.lastName = req.session.lastName = user.last_name || null;
                opts.email = req.session.email = user.email || null;
                opts.isAuthorized = req.session.isAuthorized = true;
                opts.expiresAt = req.session.expiresAt = new Date().getTime() + 1.74e+6;
                indexCtrl.getProductId(req.session, function(err, results) {
                  if (err) return next(err);
                  opts.productId = req.session.productId = results.products[0].product_id;
                  res.render('index', opts);
                });
              });
          };
        });
    });
  });

  /*
   * Authentication Required Endpoints
   **/

  router.post('/estimate', indexCtrl.isAuthorized, indexCtrl.getEstimate);
  router.get('/search-yelp/:term/:city', indexCtrl.isAuthorized, indexCtrl.searchYelp);
  router.get('/search', indexCtrl.isAuthorized, indexCtrl.render);
  router.get('/results', indexCtrl.isAuthorized, indexCtrl.render);
  router.get('/*', indexCtrl.isAuthorized, indexCtrl.render);

  app.use(router);
};
