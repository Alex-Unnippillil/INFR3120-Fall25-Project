var express = require('express');
var router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth'); // ADD THIS

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Home' });
});

/* GET /home (same as /). */
router.get('/home', function(req, res) {
  res.render('index', { title: 'Home' });
});

/* GET schedule page (protected) */
router.get('/schedule', ensureLoggedIn, function(req, res) {
  res.render('schedule', { title: 'Schedule' });
});

/* GET help page. */
router.get('/help', function(req, res) {
  res.render('help', { title: 'Info' });
});

module.exports = router;