var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var app = express();
const session = require('express-session');
const cors = require('cors');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login'); 
var logoutRouter = require('./routes/logout');
var registerRouter = require('./routes/register'); 
var profileRouter = require('./routes/userprofile'); 
var friendRouter = require('./routes/userfriend'); 
var chatRouter = require('./routes/chat'); 
var messageRouter = require('./routes/message'); 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({
  origin: 'http://yourfrontend.com', // Hoặc mảng các domain frontend
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '90435878234789230', // Thay thế bằng một khóa bí mật của bạn
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng cookie bảo mật trong môi trường production (HTTPS)
    httpOnly: true, // Bảo vệ cookie khỏi các tấn công XSS
    maxAge: 60000 // Thời gian sống của session cookie (ví dụ: 60 giây)
  }
}));

app.use('/', indexRouter); // Đặt indexRouter ở đây để xử lý khi người dùng đã đăng nhập
app.use('/manager', usersRouter);
app.use('/friend', friendRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/register', registerRouter);
app.use('/profile', profileRouter);
app.use('/chat', chatRouter);
app.use('/message', messageRouter);

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
