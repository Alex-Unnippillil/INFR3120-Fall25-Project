// webapp/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User');

// Helper: find existing user or create/link one for OAuth login
async function upsertOAuthUser({ provider, providerId, email, displayName }) {
  const field = provider + 'Id';
  const query = { [field]: providerId };

  // 1. Try to find by provider id
  let user = await User.findOne(query);

  // 2. If not found and we have an email, try to find by email to link accounts
  if (!user && email) {
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (user) {
    if (!user[field]) {
      user[field] = providerId;
      await user.save();
    }
    return user;
  }

  // 3. Create new user
  user = new User({
    email: email ? email.toLowerCase() : `${provider}-${providerId}@example.com`,
    displayName: displayName || email || `${provider} user`,
    [field]: providerId
  });

  await user.save();
  return user;
}

/*  Google Strategy  */
// Use real env vars if set; otherwise use dummy values for development/testing
  process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id';
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret';
const googleCallbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:3000/auth/google/callback';

console.log('Registered Google strategy');

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackURL
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

/*  GitHub Strategy  */

const githubClientID =
  process.env.GITHUB_CLIENT_ID || 'test-github-client-id';
const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET || 'test-github-client-secret';
const githubCallbackURL =
  process.env.GITHUB_CALLBACK_URL ||
  'http://localhost:3000/auth/github/callback';

console.log('Registered GitHub strategy');

passport.use(
  'github',
  new GitHubStrategy(
    {
      clientID: githubClientID,
      clientSecret: githubClientSecret,
      callbackURL: githubCallbackURL,
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

// Export the configured passport instance
module.exports = passport;
