var config = require('../config');

var yelp = require("yelp").createClient({
  consumer_key: config.yelp.consumerKey,
  consumer_secret: config.yelp.consumerSecret,
  token: config.yelp.token,
  token_secret: config.yelp.tokenSecret
});


exports.render = function(req, res, next) {
  res.render('index');
};

exports.redirect = function(req, res, next) {
  res.redirect('/');
};

exports.searchYelp = function(req, res, next) {
  console.log('search yelp', req.body)
  yelp.search({
    term: req.body.term,
    location: req.body.city
  }, function(err, results) {
    console.log(err || results);
    res.status(200).json(results);
  });
};
