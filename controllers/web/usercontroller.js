const bcrypt = require('bcrypt');
const User = require('../../models/user/users');
const message = require('../../models/message/message');

function IsEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show Login Page
exports.showLoginPage = async (req, res) => {
    try {
        if (req.session.userId) {
            return res.redirect('/'); // Redirect if already logged in
        }
        return res.status(200).render('login', { error: 'Please log in to access' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).render('error', { message: error.message });
    }
};

// Show Register Page
exports.showRegisterPage = async (req, res) => {
    return res.status(200).render('register', { title: 'Register', error: req.query.error || null });
};

// Track login attempts to prevent brute force
const loginAttempts = {};

exports.handleLogin = async (req, res) => {
    const { username, password } = req.body;
    const currentTime = Date.now();
    
    // Set limits for login attempts
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

    // Check login attempts
    if (loginAttempts[username]) {
        const attempts = loginAttempts[username];
        if (attempts.count >= MAX_ATTEMPTS && (currentTime - attempts.firstAttempt < LOCK_TIME)) {
            return res.status(429).render('login', { error: 'Too many login attempts. Please try again later.' });
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
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                delete loginAttempts[username];

                req.session.userId = user._id;
                req.session.user = { username: user.username, password: user.password };
                req.session.message = 'Access granted!';
                await req.session.save(); // Ensure the session is saved before redirecting
                return res.redirect('/'); 
            } else {
                // Update failed login attempts
                if (!loginAttempts[username]) {
                    loginAttempts[username] = { count: 0, firstAttempt: currentTime };
                }
                loginAttempts[username].count++;
                return res.render('login', { error: 'Incorrect password' });
            }
        } else {
            return res.render('login', { error: 'User not found' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

// Handle Registration
exports.handleRegister = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    try {
        // Password length check
        if (password.length <= 8 || confirmPassword.length <= 8) {
            return res.render('register', { error: 'Your password is too short. It must be at least 8 characters long.' });
        }

        // Password format check (at least one lowercase, one uppercase, one number, one special character)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
        if (!passwordRegex.test(password)) {
            return res.render('register', { error: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.' });
        }

        // Confirm password match check
        if (password !== confirmPassword) {
            return res.render('register', { error: 'Your passwords do not match.' });
        }

        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.render('register', { error: 'Username or Email already exists.' });
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user with phone being optional
        const newUser = new User({
            username,
            email,
            phone: phone || '',  // Ensure phone is optional
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();

        // Set session data for the user
        req.session.userId = newUser._id;
        req.session.user = { username: newUser.username };

        // Redirect to a success page or show a success message
        res.render('index', { message: 'Registration successful, welcome!' });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).render('error', { message: 'Error during registration' });
    }
};

// Handle Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).render('error', { message: 'Error during logout' });
        }
        return res.redirect('/login'); // Redirect after logout
    });
};

// Find User by Name (API example)
exports.finduser = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findOne({ username: name });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Success', username: user.username });
    } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ message: 'Error during request' });
    }
};
