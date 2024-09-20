var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var authMiddleware = require('../middlewares/authMiddleware');
var User = require('../models/user/users');

// GET index page
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find();
        const loggedInUserId = req.session.userId;
        console.log(loggedInUserId);
        res.render('user', { 
            title: 'User List',
            users: users,
            loggedInUserId: loggedInUserId
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// POST route (xử lý khi thêm mới người dùng)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            email, 
            phone,
            password: hashedPassword
        });
        
        await newUser.save();
        const users = await User.find();
        res.render('user', { 
            title: 'Manager Server', 
            users: users
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Route để xóa người dùng
router.post('/delete-user/:id', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/user');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Route để cập nhật role người dùng
router.post('/update-user/:id', authMiddleware, async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role: role });
        res.redirect('/user');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
