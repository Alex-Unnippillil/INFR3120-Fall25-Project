var express = require('express');
var router = express.Router();
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
});

module.exports = router;