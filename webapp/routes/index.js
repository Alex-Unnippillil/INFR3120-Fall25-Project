var express = require('express');
var router = express.Router();
<<<<<<< HEAD

//auth guard // when not logged in redirect to /login page
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Home' });
});

/* GET /home (same as /). */
router.get('/home', function (req, res) {
  res.render('index', { title: 'Home' });
});

/* GET schedule page (protected). */
router.get('/schedule', requireLogin, function (req, res) {
  res.render('schedule', { title: 'Schedule' });
});

/* GET help page. */
router.get('/help', function (req, res) {
  res.render('help', { title: 'Info' });
=======
const { ensureLoggedIn } = require('../middleware/auth');

// GET home page.
router.get('/', function(req, res) {
  res.render('index', { 
    title: 'Home',
    user: req.session.user
  });
});

// GET /home (same as /).
router.get('/home', function(req, res) {
  res.render('index', { 
    title: 'Home',
    user: req.session.user
  });
});

// GET schedule page (protected)
router.get('/schedule', ensureLoggedIn, function(req, res) {
  res.render('schedule', { 
    title: 'Schedule',
    user: req.session.user
  });
});

// GET help page.
router.get('/help', function(req, res) {
  res.render('help', { 
    title: 'Info',
    user: req.session.user
  });
>>>>>>> 367ebbf (Pass user session into views and protect schedule)
});

module.exports = router;