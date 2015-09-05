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
  redirect_uri: "https://localhost:3000/auth/callback"
});


module.exports = function(app, passport) {
  router.get('/', indexCtrl.render);
  router.get('/authorize',
    passport.authenticate('uber', {
      scope: ['profile']
    })
  )

  router.get('/auth/callback', function(req, res, next) {
    uberClient.authorization({
        authorization_code: req.query.code
      },
      function(err, access_token, refresh_token) {
        if (err) console.error(err);
        else {
          console.log("access_token", access_token);
          console.log("refresh_token", refresh_token);
        }
      });
    // res.redirect('/success ');
  });

  // router.get('/auth/callback', function(req, res, next) {
  //   console.log(req);

  // });

  router.get('/success', function(req, res, next) {
    console.log('success');
    console.log(req);
  })

  router.get('/authorized', function(req, res, next) {
    console.log('authorized', req);
  });
  router.get('/unauthorized', function(req, res, next) {
    console.log('unauthorized');
  });
  router.post('/search-yelp', indexCtrl.searchYelp);
  router.get('/*', indexCtrl.redirect);
  app.use(router);
};
