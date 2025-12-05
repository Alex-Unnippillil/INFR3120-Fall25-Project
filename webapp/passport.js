// webapp/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User');
//helper to find ./craete a new user or update existing one based on OAuth profile
async function upsertOAuthUser({ provider, providerId, email, displayName }) {
  const query = {};
  query[provider + 'Id'] = providerId;

  // Try provider ID
  let user = await User.findOne(query);

  //If not found and we have an email , try to find by email
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

/* Google Strategy */

const googleClientID = process.env.GOOGLE_CLIENT_ID; // get from environment variables
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET; // get from environment variables
const googleCallbackURL =   
  process.env.GOOGLE_CALLBACK_URL || // get from environment variables
  'http://localhost:3000/auth/google/callback'; // default callback URL

if (googleClientID && googleClientSecret) {//check if credentials are set
  passport.use(
    new GoogleStrategy( /// use Google OAuth strategy
      {
        clientID: googleClientID, // Google client ID
        clientSecret: googleClientSecret, // Google client secret
        callbackURL: googleCallbackURL // Google callback URL
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
} else { //log warning if not configured
  console.warn(
    'Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET' //log warning if not configured
  );
}

/* gitHub Strategy  */

const githubClientID = process.env.GITHUB_CLIENT_ID; // get from environment variables
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET; // get from environment variables
const githubCallbackURL =
  process.env.GITHUB_CALLBACK_URL ||
  'http://localhost:3000/auth/github/callback';

if (githubClientID && githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientID, // GitHub client ID
        clientSecret: githubClientSecret, // GitHub client secret
        callbackURL: githubCallbackURL, // GitHub callback URL
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
} else {
  console.warn(
    'GitHub OAuth is not properly configured: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET'
  );
}
module.exports = passport;
