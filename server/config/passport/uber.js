var config = require('../');
var uberStrategy = require('passport-uber');

module.exports = function(passport) {
  passport.use(new uberStrategy({
      clientID: config.uber.clientId,
      clientSecret: config.uber.clientSecret,
      callbackURL: config.uber.callbackUrl
    },
    function(accessToken, refreshToken, user, cb) {}));
}
