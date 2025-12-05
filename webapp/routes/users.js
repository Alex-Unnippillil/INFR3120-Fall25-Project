var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/User');

// helper: shared logout handler
function handleLogout(req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    return res.redirect('/login');
  });
}

// GET /login
router.get('/login', function (req, res) {
  res.render('login', { title: 'Login', error: null, user: req.session.user });
});

// GET /register
router.get('/register', function (req, res) {
  res.render('register', { title: 'Register', error: null, user: req.session.user });
});

// POST /register a new user in MongoDB
router.post('/register', async function (req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Email & password are required.',
        user: null
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'The email provided is already registered. Try to login instead.',
        user: null
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ email: normalizedEmail, passwordHash });

    // Save minimal info (no password) in session
    req.session.user = { id: user._id, email: user.email };

    // Go to the protected schedule page
    return res.redirect('/schedule');
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).render('register', {
      title: 'Register',
      error: 'Error. Please try again.',
      user: null
    });
  }
});

// POST /login - authenticate user credentials and create session
router.post('/login', async function (req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Email & password required.',
        user: null
      });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Invalid email or password.',
        user: null
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Invalid email or password.',
        user: null
      });
    }

    // Store user login state in session
    req.session.user = { id: user._id, email: user.email };

    return res.redirect('/schedule');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('login', {
      title: 'Login',
      error: 'Something went wrong. Please try again.',
      user: null
    });
  }
});

// GET /logout - allow logout via link
router.get('/logout', handleLogout);

// POST /logout - allow logout via navbar form
router.post('/logout', handleLogout);

// JSON endpoint - check login status for frontend JS
router.get('/auth/status', function (req, res) {
  if (req.session && req.session.user) {
    return res.json({
      loggedIn: true,
      email: req.session.user.email
    });
  }
  res.json({ loggedIn: false });
});

module.exports = router;