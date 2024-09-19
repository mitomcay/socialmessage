// middlewares/authMiddleware.js

module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        // Người dùng đã đăng nhập, tiếp tục với request
        return next();
    } else {
        // Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
        res.redirect('/login');
    }
};
