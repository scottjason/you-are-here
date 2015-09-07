var Uber = require('node-uber');
var config = require('../config');
var express = require('express');
var router = express.Router();
var indexCtrl = require('../controllers/index');
var request = require('request');
var bodyParser = require('body-parser');

var uberDev = 'https://sandbox-api.uber.com/v1';
var uberProd = 'https://api.uber.com/v1';

module.exports = function(app, passport) {
  router.get('/', indexCtrl.render);
  router.get('/login/:startLat/:startLon', function(req, res, next) {
    req.session.startLat = req.params.startLat;
    req.session.startLon = req.params.startLon;
    passport.authenticate('uber', {
      scope: ['profile', 'delivery', 'request_receipt', 'delivery_sandbox', 'request']
    })(req, res, next);
  });
  router.get('/auth/callback', function(req, res, next) {
    var uberClient = new Uber({
      client_id: config.uber.clientId,
      client_secret: config.uber.clientSecret,
      server_token: config.uber.serverToken,
      name: 'search-pick-go',
      redirect_uri: config.uber.callbackUrl
    });
    process.nextTick(function() {

      uberClient.authorization({
          authorization_code: req.query.code
        },
        function(err, access_token, refresh_token) {
          if (err) console.error(err);
          else {
            request.get(uberDev + '/me', {
                'auth': {
                  'bearer': access_token
                }
              },
              function(error, response, body) {
                var user = JSON.parse(body);
                var opts = {};
                opts.accessToken = req.session.accessToken = access_token;
                opts.refreshToken = req.session.refreshToken = refresh_token;
                opts.firstName = req.session.firstName = user.first_name;
                indexCtrl.getProductId(req.session, function(err, response) {
                  if (!err) {
                    opts.isAuthorized = req.session.isAuthorized = true;
                    opts.uberXId = req.session.uberXId = response.products[0].product_id;
                    opts.expiresAt = req.session.expiresAt = new Date().getTime() + 1.74e+6;
                    console.log('req.session on sucess', req.session);
                    res.render('index', opts);
                  } else {
                    console.log('error requesting productId', err.message || err);
                  }
                });
              });
          }
        });
    });

  });

  /*
   * Authentication Required Endpoints
   **/

  router.get('/request-ride/:endLat/:endLon', indexCtrl.isAuthorized, indexCtrl.requestRide);
  router.get('/cancel-ride/:requestId', indexCtrl.isAuthorized, indexCtrl.cancelRide);
  router.get('/get-ride-status', indexCtrl.isAuthorized, indexCtrl.getRideStatus);
  router.get('/update-ride-status/:endLat/:endLon', indexCtrl.isAuthorized, indexCtrl.updateRideStatus);
  router.get('/search-yelp/:term/:city', indexCtrl.isAuthorized, indexCtrl.searchYelp);
  router.get('/estimate/:startLat/:startLon/:endLat/:endLon', indexCtrl.getEstimate);
  router.get('/search', indexCtrl.isAuthorized, indexCtrl.render);
  router.get('/results', indexCtrl.isAuthorized, indexCtrl.render);
  router.get('/*', indexCtrl.isAuthorized, indexCtrl.render);
  router.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(router);
};
