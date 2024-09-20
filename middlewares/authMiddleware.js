// middlewares/authMiddleware.js

module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        // Người dùng đã đăng nhập, tiếp tục với request
        return res.status(200).json({message: 'access complete 2', user: req.session.user});
    } else {
        // Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
        return res.redirect('/login');
    }
};
