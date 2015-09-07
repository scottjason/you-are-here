var Uber = require('node-uber');
var config = require('../config');
var express = require('express');
var router = express.Router();
var indexCtrl = require('../controllers/index');
var request = require('request');

var uberClient = new Uber({
  client_id: "sw-6_VLi2U9mlcZiFw_PWmWNvzy-GAnV",
  client_secret: "HJULx3gClM36zIeKEWpSCMl_EwGaPWwbMFPQ25Kg",
  server_token: "_98dQg10COpUn8XCCqVHDOE9E1Fyl41Q-WzU8ZaT",
  name: 'search-pick-go',
  redirect_uri: "http://localhost:3000/auth/callback"
});

module.exports = function(app, passport) {
  router.get('/', indexCtrl.render);
  router.get('/login',
    passport.authenticate('uber', {
      scope: ['profile', 'delivery', 'request_receipt', 'delivery_sandbox', 'request']
    })
  )

  router.get('/auth/callback', function(req, res, next) {
    uberClient.authorization({
        authorization_code: req.query.code
      },
      function(err, access_token, refresh_token) {
        if (err) console.error(err);
        else {
          request.get('https://api.uber.com/v1/me', {
              'auth': {
                'bearer': access_token
              }
            },
            function(error, response, body) {
              var user = JSON.parse(body);
              var opts = {};
              req.session.accessToken = access_token;
              req.session.refreshToken = refresh_token;
              req.session.firstName = user.firstName;
              opts.isAuthorized = true;
              opts.accessToken = access_token;
              opts.refreshToken = refresh_token;
              opts.firstName = user.first_name;
              res.render('index', opts);
            });
        }
      });
  });
  router.get('/search-yelp/:term/:city/:state', indexCtrl.searchYelp);
  router.get('/estimate/:startLat/:startLon/:endLat/:endLon', indexCtrl.getEstimate);
  router.post('/product-id', indexCtrl.getProductId);
  router.get('/*', indexCtrl.redirect);
  app.use(router);
};
