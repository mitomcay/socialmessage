var express = require('express');
var router = express.Router();
var userController = require('../../controllers/api/usercontroller');
const passport = require('passport');

/* GET login page. */
router.get('/', userController.showLoginPage);
router.post('/', userController.handleLogin);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route để xử lý callback từ Google
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Đăng nhập thành công
    res.redirect('/');
  }
);

module.exports = router;
