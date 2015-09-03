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

exports.searchYelp = function(req, res, next) {
  yelp.search({term: "food", location: req.body.city}, function(err, results) {
    console.log(err || results);
  });
};
