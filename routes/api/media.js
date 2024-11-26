var express = require('express');
var router = express.Router();
var mediaController = require('../../controllers/api/mediacontroller');
var authMiddleware = require('../../middlewares/api/authMiddleware');

// Route để upload file
router.post(
    '/upload',
    authMiddleware, // Middleware xác thực
    mediaController.uploadMiddleware, // Middleware xử lý upload file
    mediaController.createMedia // Xử lý logic tạo Media
);

module.exports = router;
