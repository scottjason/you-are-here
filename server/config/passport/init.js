/**
 * Passport Init
 */

'use strict';

module.exports = function(passport) {
  passport.serializeUser(function(user, callback) {
  	console.log('serializeUser');
    callback(null, user);
  });
  passport.deserializeUser(function(user, callback) {
  	console.log('deserializeUser');

  	  callback(null, user);
  });
  require('./uber')(passport);
};
