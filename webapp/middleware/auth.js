// Middleware to protect routes that require authentication
function ensureLoggedIn(req, res, next) {
// Check if there is a session and a user is logged in
  if (!req.session || !req.session.user) {
// If no user is logged in, redirect to the login page

    return res.redirect('/login');
  }
// If a user is logged in, call next() to continue to the requested route
  next();
}
// Export the middleware so it can be used in other route files
module.exports = { ensureLoggedIn }; 