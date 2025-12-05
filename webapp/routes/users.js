// webapp/routes/users.js
var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var path = require('path');
var fs = require('fs');
var multer = require('multer');

var User = require('../models/User');
var passport = require('../passport');
const { ensureLoggedIn } = require('../middleware/auth');

// Helper stores user info in the session
function makeSessionUser(user) {
  return {
    _id: user._id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    hasPassword: !!user.passwordHash
  };
}

/* Multer used for profile pictures  */

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = req.session.user ? req.session.user._id.toString() : 'avatar';
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) { // file type filter
    if (!file.mimetype.startsWith('image/')) { // only images
      return cb(new Error('Only image files are allowed.')); // reject non-images
    }
    cb(null, true);
  }
});

/*  Local auth  */

// GET /login
router.get('/login', function (req, res) {
  res.render('login', { title: 'Login', error: null });
});

// GET /register
router.get('/register', function (req, res) {
  res.render('register', { title: 'Register', error: null });
});

// POST /register
router.post('/register', async function (req, res) {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.render('register', {
        title: 'Register',
        error: 'Error!!! Account with that email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: email.split('@')[0]
    });

    req.session.user = makeSessionUser(user);
    return res.redirect('/schedule');
  } catch (err) {
    console.error(err);
    return res.render('register', {
      title: 'Register',
      error: 'Sorry, Could not create the account.'
    });
  }
});

// POST /login
router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.render('login', {
        title: 'Login',
        error:
          'Invalid email/password or this account uses AUTH login.'
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid email/password.'
      });
    }

    req.session.user = makeSessionUser(user);
    return res.redirect('/schedule');
  } catch (err) {
    console.error(err);
    return res.render('login', {
      title: 'Login',
      error: 'Could not log in.'
    });
  }
});

/*  Logout 404  */

router.post('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

//handle GET /logout 
router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

/*  Google OAuth  */

// Google login
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  function (req, res) {
    // req.user is the Mongo User from passport.js
    req.session.user = makeSessionUser(req.user); // store in session
    res.redirect('/schedule');
  }
);

/*  GitHub OAuth  */

router.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    session: false
  }),
  function (req, res) {
    req.session.user = makeSessionUser(req.user);
    res.redirect('/schedule');
  }
);

/*  Account page- avatar + password change  */

// GET /account
router.get('/account', ensureLoggedIn, async function (req, res) {
  const user = await User.findById(req.session.user._id);
  req.session.user = makeSessionUser(user); // refresh session info
  res.render('account', {
    title: 'Account',
    user: req.session.user,
    error: null,
    success: null
  });
});

// POST /account/profile- profile picture upload
router.post(
  '/account/profile',
  ensureLoggedIn,
  upload.single('avatar'),
  async function (req, res) {
    try {
      if (!req.file) {
        return res.redirect('/account');
      }

      const user = await User.findById(req.session.user._id);
      user.avatarUrl = '/uploads/' + req.file.filename;
      await user.save();

      req.session.user = makeSessionUser(user);

      res.render('account', {
        title: 'Account',
        user: req.session.user,
        error: null,
        success: 'Profile picture updated.'
      });
    } catch (err) {
      console.error(err);
      res.render('account', {
        title: 'Account',
        user: req.session.user,
        error: 'Couldnt update picture.',
        success: null
      });
    }
  }
);

// POST /account/password -change password
router.post('/account/password', ensureLoggedIn, async function (req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.session.user._id);
    if (!user.passwordHash) {
      return res.render('account', {
        title: 'Account',
        user: req.session.user,
        error: 'Account uses Google/GitHub login only.',
        success: null
      });
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.render('account', {
        title: 'Account',
        user: req.session.user,
        error: 'Current password is incorrect!!!',
        success: null
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    req.session.user = makeSessionUser(user);

    res.render('account', {
      title: 'Account',
      user: req.session.user,
      error: null,
      success: 'Password updated.'
    });
  } catch (err) {
    console.error(err);
    res.render('account', {
      title: 'Account',
      user: req.session.user,
      error: 'Could not change password.',
      success: null
    });
  }
});

/*  JSON auth status [used by your frontend] */

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
