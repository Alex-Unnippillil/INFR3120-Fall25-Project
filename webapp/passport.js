// webapp/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User');

//helper to find ./craete a new user or update existing one based on OAuth profile
async function upsertOAuthUser({ provider, providerId, email, displayName }) {
  const field = provider + 'Id';
  const query = { [field]: providerId };

  // Try provider ID
  let user = await User.findOne(query);

  //If not found and we have an email , try to find by email
  if (!user && email) {
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (user) {
    // Link provider id if not linked alreadu
    if (!user[field]) {
      user[field] = providerId;
      await user.save();
    }
    return user;
  }

  // create a new user
  user = new User({
    email: email ? email.toLowerCase() : `${provider}-${providerId}@example.com`,
    displayName: displayName || email || `${provider} user`,
    [field]: providerId
  });

  await user.save();
  return user;
}

/*  Google Strategy  */

// Use real env vars in prod; fallback strings avoid crashes for when.env missing
const googleClientID =
  process.env.GOOGLE_CLIENT_ID || 'missing-google-client-id';
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET || 'missing-google-client-secret';
const googleCallbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:3000/auth/google/callback';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    'Google OAuth env vars not fully set. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are required for real Google login.'
  );
}

//  register strategy as google
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
  process.env.GITHUB_CLIENT_ID || 'missing-github-client-id';
const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET || 'missing-github-client-secret';
const githubCallbackURL =
  process.env.GITHUB_CALLBACK_URL ||
  'http://localhost:3000/auth/github/callback';

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.warn(
    'GitHub OAuth env vars not fully set. GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are required for GitHub login.'
  );
}

//  register strategy as github
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

module.exports = passport;
