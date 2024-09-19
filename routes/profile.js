var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/authMiddleware');
var User = require('../models/users');

/* GET home page. */
router.get('/', authMiddleware, function(req, res, next) {
    if (req.session && req.session.user) {
        res.render('profile', { title: 'Profile Page', user: req.session.user});
    }
    else{
        res.render('login', {title: 'login'})
    } 
});

module.exports = router;
