var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { title } = require('process');

var session = require('express-session'); // session middleware
var mongoose = require('mongoose'); // mongoose for MongoDB

var app = express();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.warn('MONGODB_URI is not set yet warning');
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('Successfully connected to MongoDB');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware
const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-me';

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day; set secure: true in production with HTTPS
    }
  })
);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// Make `user` available in all EJS views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// Routers
app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward TO THEerror handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    user: res.locals.user
  });
});

module.exports = app;
