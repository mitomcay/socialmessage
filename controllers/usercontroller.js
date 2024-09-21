const bcrypt = require('bcrypt');
const User = require('../models/user/users');

function IsEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


exports.showLoginPage = (req, res) => {
    try {
        return res.status(400).json({ message: 'Please log in to access' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(400).json({ message: error.message });
    }
};

exports.showRegisterPage = (req, res) => {
    res.status(200).json({ title: 'Register', error: req.query.error || null });
};

const loginAttempts = {};

exports.handleLogin = async (req, res) => {
    const { username, password } = req.body;
    const currentTime = Date.now();
    
    // Thiết lập giới hạn
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 phút

    // Kiểm tra số lần thử đăng nhập
    if (loginAttempts[username]) {
        const attempts = loginAttempts[username];
        if (attempts.count >= MAX_ATTEMPTS && (currentTime - attempts.firstAttempt < LOCK_TIME)) {
            return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
        }
    }

    try {
        let user;
        if (IsEmail(username)) {
            user = await User.findOne({ email: username });
        } else {
            user = await User.findOne({ username });
        }

        if (user) {
            if (user.role === 'admin') {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    // Đặt lại số lần thử đăng nhập thành công
                    delete loginAttempts[username];

                    req.session.userId = user._id;
                    req.session.user = { username: user.username, password: user.password };
                    return res.status(200).json({ message: 'Login success', user: req.session.user, userId: req.session.userId });
                } else {
                    // Cập nhật số lần thử đăng nhập không thành công
                    if (!loginAttempts[username]) {
                        loginAttempts[username] = { count: 0, firstAttempt: currentTime };
                    }
                    loginAttempts[username].count++;
                    return res.status(401).json({ message: 'Incorrect password' });
                }
            } else {
                return res.status(401).json({ message: 'User is not an admin' });
            }
        } else {
            return res.status(401).json({ message: "User not found" });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: error.message });
    }
};

exports.handleRegister = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, phone, password: hashedPassword });

        await newUser.save();

        if (!req.session) req.session = {};
        req.session.user = { username: newUser.username };

        return res.status(201).json({ message: 'Registration successful', user: req.session.user });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Error during registration' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Error during logout' });
        }
        return res.status(200).json({ message: 'Logout successful' });
    });
};
