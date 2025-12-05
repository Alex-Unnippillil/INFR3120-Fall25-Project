// webapp/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User');

//helper to find ./craete a new user or update existing one based on OAuth profile
async function upsertOAuthUser({ provider, providerId, email, displayName }) {
  const query = {};
  query[provider + 'Id'] = providerId;


  let user = await User.findOne(query);

  // 2. If not found and we have an email , try to find by email
  if (!user && email) {
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (user) {
    if (!user[provider + 'Id']) {
      user[provider + 'Id'] = providerId;
      await user.save();
    }
    return user;
  }

  // Create new user
  user = new User({
    email: email ? email.toLowerCase() : `${provider}-${providerId}@example.com`,
    displayName: displayName || email || `${provider} user`,
    [provider + 'Id']: providerId
  });

  await user.save();
  return user;
}

/* Google */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'https://p8idfcynd5.us-east-1.awsapprunner.com/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0] && profile.emails[0].value;

        const user = await upsertOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email,
          displayName: profile.displayName
        });

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

/* GitHub */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        'https://p8idfcynd5.us-east-1.awsapprunner.com/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email;
        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        }

        const user = await upsertOAuthUser({
          provider: 'github',
          providerId: profile.id,
          email,
          displayName: profile.displayName || profile.username
        });

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

// use req.session.user manually
module.exports = passport;
