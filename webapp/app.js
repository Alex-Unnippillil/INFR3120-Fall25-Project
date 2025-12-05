// webapp/app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//  loads ./passport.js and configures strategies
var passport = require('./passport');

var app = express();

// MongoDB connection
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plansimple';
mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/bootstrap',
  express.static(path.join(__dirname, 'node_modules', 'bootstrap'))
);
app.use(
  '/jquery',
  express.static(path.join(__dirname, 'node_modules', 'jquery'))
);
app.use(
  '/@fortawesome',
  express.static(path.join(__dirname, 'node_modules', '@fortawesome'))
);

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false
  })
);

// Initialize passport 
app.use(passport.initialize());

// Make user available in all views 
app.use(function (req, res, next) {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    user: res.locals.user
  });
});

module.exports = app;
