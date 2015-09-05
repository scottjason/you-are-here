var config = require('./');
var uberStrategy = require('passport-uber');

exports.init = function(passport) {
  // to support persistent login sessions, passport needs to be able to serialize users into and deserialize users out of the session. this will show up in every request object
  passport.serializeUser(function(user, done) {
    console.log('----------------serialize----------------');
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    console.log('----------------deserialize----------------');
    done(null, user);
  });

  passport.use(new uberStrategy({
		clientID: "sw-6_VLi2U9mlcZiFw_PWmWNvzy-GAnV",
		clientSecret: "GDVJEr4BVcriJVt-XVxHXDhtN_z8emSgbXBL7i04",
		callbackURL: 'http://localhost:3000/auth/callback'
	},
	function (accessToken, refreshToken, user, done) {
		console.log(user.first_name, user.last_name, 'logged in to your app');
		console.log('access token:', accessToken);
		console.log('refresh token:', refreshToken);

		/*
			Write your own database logic here. User.findOne() and, if none, create and save.
		 */

		 // Save the accessToken for user-specific (and authorized) requests
		 user.accessToken = accessToken;

		return done(null, user);
	}
));
}
