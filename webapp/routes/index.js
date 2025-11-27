var express = require('express');
var router = express.Router();

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
});

module.exports = router;