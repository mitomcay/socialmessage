// config/passport-config.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Xử lý thông tin user lấy được từ Google và lưu vào database nếu cần
    // Ví dụ: User.findOrCreate({ googleId: profile.id }, (err, user) => done(err, user));
    done(null, profile);
  }
));

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
