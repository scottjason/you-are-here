var uberStrategy = require('passport-uber');

module.exports = function(passport) {
  passport.use(new uberStrategy({
      clientID: "sw-6_VLi2U9mlcZiFw_PWmWNvzy-GAnV",
      clientSecret: "GDVJEr4BVcriJVt-XVxHXDhtN_z8emSgbXBL7i04",
      callbackURL: 'https://localhost:3000/auth/callback'
    },
    function(accessToken, refreshToken, user, cb) {
      process.nextTick(function() {

        console.log(10);
        console.log(user)
        console.log(user.first_name, user.last_name, 'logged in to your app');
        console.log('access token:', accessToken);
        console.log('refresh token:', refreshToken);
        console.log('user', user);
        /*
          Write your own database logic here. User.findOne() and, if none, create and save.
         */

        // Save the accessToken for user-specific (and authorized) requests
        user.accessToken = accessToken;

        return cb(null, user);
      })
    }));
}
