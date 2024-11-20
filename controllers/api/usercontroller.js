const bcrypt = require('bcrypt');
const User = require('../../models/user/users');
<<<<<<< HEAD
const { generateAccessToken, generateRefreshToken } = require('../../utils/auth');
=======
const { getBaseURL } = require('../../lib/BaseURL');
>>>>>>> 99881beae2a46b54da04d2015bcd304768cf53dd

function IsEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


exports.showLoginPage = (req, res) => {
    try {
        if (req.session.userId) {
            return res.status(400).json({ message: 'Bạn đã đăng nhập, vui lòng đăng xuất trước khi tiếp tục.' });
        }
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

<<<<<<< HEAD
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 phút

// Đối tượng lưu trữ thông tin về số lần thử đăng nhập

const checkLoginAttempts = (username) => {
    const currentTime = Date.now();
    if (loginAttempts[username]) {
        const attempts = loginAttempts[username];
=======
exports.handleLogin = async (req, res) => {    

    const { email, password } = req.body;       
    const baseUrl = await getBaseURL(req);
    const currentTime = Date.now();
    // Thiết lập giới hạn
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 phút

    // Kiểm tra số lần thử đăng nhập
    if (loginAttempts[email]) {
        const attempts = loginAttempts[email];
>>>>>>> 99881beae2a46b54da04d2015bcd304768cf53dd
        if (attempts.count >= MAX_ATTEMPTS && (currentTime - attempts.firstAttempt < LOCK_TIME)) {
            return { locked: true, remainingTime: LOCK_TIME - (currentTime - attempts.firstAttempt) };
        }
    }
<<<<<<< HEAD
    return { locked: false };
};

const handleFailedLogin = (username) => {
    const currentTime = Date.now();
    if (!loginAttempts[username]) {
        loginAttempts[username] = { count: 0, firstAttempt: currentTime };
    }
    loginAttempts[username].count++;
};

const handleSuccessfulLogin = (username) => {
    // Reset login attempts on successful login
    delete loginAttempts[username];
};

exports.handleLogin = async (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra số lần thử đăng nhập
    const { locked, remainingTime } = checkLoginAttempts(username);
    if (locked) {
        return res.status(429).json({ message: `Too many login attempts. Please try again later. Retry in ${Math.ceil(remainingTime / 1000)} seconds.` });
    }

    try {
        let user;
        if (IsEmail(username)) {
            user = await User.findOne({ email: username });
=======
    
    try {
        let user;
        
        user = await User.findOne({ email: email });

        if (user) {
            if (user.role == 'user') {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    // Đặt lại số lần thử đăng nhập thành công
                    delete loginAttempts[email];

                    req.session.userId = user._id;
                    req.session.user = { username: user.username, password: user.password, avatar: baseUrl + user.avatar, email: user.email };
                    return res.status(200).json({ message: 'Login success with user', user: req.session.user, userId: req.session.userId, role: 'user' });
                } else {
                    // Cập nhật số lần thử đăng nhập không thành công
                    if (!loginAttempts[username]) {
                        loginAttempts[username] = { count: 0, firstAttempt: currentTime };
                    }
                    loginAttempts[username].count++;
                    return res.status(401).json({ message: 'Incorrect password' });
                }
            } else if (user.role === 'admin') {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    // Đặt lại số lần thử đăng nhập thành công
                    delete loginAttempts[username];

                    req.session.userId = user._id;
                    req.session.user = { username: user.username, password: user.password, avatar: baseUrl + user.avatar, email: user.email };
                    return res.status(200).json({ message: 'Login success with admin', user: req.session.user, userId: req.session.userId, role: 'admin' });
                } else {
                    // Cập nhật số lần thử đăng nhập không thành công
                    if (!loginAttempts[username]) {
                        loginAttempts[username] = { count: 0, firstAttempt: currentTime };
                    }
                    loginAttempts[username].count++;
                    return res.status(401).json({ message: 'Incorrect password' });
                }
            } else {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    // Đặt lại số lần thử đăng nhập thành công
                    delete loginAttempts[username];

                    req.session.userId = user._id;
                    req.session.user = { username: user.username, password: user.password, avatar: baseUrl + user.avatar, email: user.email };
                    return res.status(200).json({ message: 'Login success with moderator', user: req.session.user, userId: req.session.userId, role: 'moderator' });
                } else {
                    // Cập nhật số lần thử đăng nhập không thành công
                    if (!loginAttempts[username]) {
                        loginAttempts[username] = { count: 0, firstAttempt: currentTime };
                    }
                    loginAttempts[username].count++;
                    return res.status(401).json({ message: 'Incorrect password' });
                }
            }
>>>>>>> 99881beae2a46b54da04d2015bcd304768cf53dd
        } else {
            user = await User.findOne({ username });
        }

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            handleFailedLogin(username); // Cập nhật lần thử đăng nhập không thành công
            return res.status(401).json({ message: 'Incorrect password' });
        }

        handleSuccessfulLogin(username); // Đặt lại số lần thử đăng nhập sau khi đăng nhập thành công

        req.session.userId = user._id;
        req.session.user = { username: user.username, password: user.password };

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true, // Cần set true khi chạy trên HTTPS
            sameSite: 'Strict',
          });

        const role = user.role || 'user'; // Default to 'user' role
        console.log( `Login success with ${role}`,
            req.session.user,
            req.session.userId,
            role,
            accessToken);
        return res.status(200).json({
            message: `Login success with ${role}`,
            role: role,
            accessToken
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: error.message });
    }
};


exports.handleRegister = async (req, res) => {
    const { username, email, phone, password } = req.body;   
    const baseUrl = await getBaseURL(req);
    console.log(username);
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }
        const isEmail = await IsEmail(email);
        if (!isEmail) {
            return res.status(400).json({ message: 'Email invalid' });
        }
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }
        if( password.length <= 8) {
            return res.status(400).json({ message: 'Your password is short' });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, phone, password: hashedPassword });

        await newUser.save();

        if (!req.session) req.session = {};
        req.session.userId = newUser._id;
        req.session.user = { username: newUser.username, password: newUser.password, avatar: baseUrl + newUser.avatar, email: newUser.email };

        return res.status(201).json({ message: 'Registration successful', user: req.session.user});
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Error during registration' });
    }
};

exports.logout = (req, res) => {
    try{
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: 'Error during logout' });
            }
            return res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Error during registration' });
    }
};

exports.currentUser = async (req, res) => {
    try {
        const userId = req.session.userId;        
        const baseUrl = await getBaseURL(req);
        const user = await User.findById(userId);

        if (user) {
            const userReturn = {
                userId: user._id,
                username: user.username,
                avatar: baseUrl + user.avatar,
                email: user.email,
            };
            return res.status(200).json({ user: userReturn });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
        
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}

exports.finduser = async (req,res) => {
    try {
        const{ name } = req.body;
        const user = User.findOne({name});

        if (!user) {
            return res.status(400).json({ message: 'user not found'});
        }

        return res.status(200).json({ message: 'success', name: user.username});
    } catch (error) {
         console.error('Registration error:', error);
        return res.status(500).json({ message: 'Error during registration' });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.userId; // Directly get email from req.params 
        const baseUrl = await getBaseURL(req);
        // Search for the user by email
        const user = await User.findById(userId);
        if (user) {
            const userReturn = {
                userId: user._id,
                username: user.username,
                avatar: baseUrl + user.avatar,
                email: user.email,
            };
            return res.status(200).json({ user: userReturn });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.log('Get user error:', error.message);
        return res.status(500).json({ message: error.message });
    }
};
