var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', user: req.session?.user || null });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', user: req.session?.user || null });
});




module.exports = router;
