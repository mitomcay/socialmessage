var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var mongoose = require('mongoose');
var app = express();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login'); 
var logoutRouter = require('./routes/logout');
var registerRouter = require('./routes/register'); 
var profileRouter = require('./routes/profile'); 
var friendRouter = require('./routes/friend'); 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '90435878234789230', // Thay thế bằng một khóa bí mật của bạn
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Đặt thành true nếu bạn đang sử dụng HTTPS
}));

app.use('/', indexRouter); // Đặt indexRouter ở đây để xử lý khi người dùng đã đăng nhập
app.use('/user', usersRouter);
app.use('/friend', friendRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/register', registerRouter);
app.use('/profile', profileRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect('mongodb://localhost:27017/social_network').then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

module.exports = app;
