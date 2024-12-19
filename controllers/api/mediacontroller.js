const Media = require('../../models/media/media');
const multer = require('multer');
const path = require('path');
const { getBaseURL } = require('../../lib/BaseURL');

// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Thư mục lưu file
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Tên file
    },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

exports.uploadMiddleware = upload.single('media'); // Middleware để xử lý upload file

exports.createMedia = async (req, res) => {
    try {
        const { MediaType } = req.body;
        const owner = req.session.UserId;

        // Kiểm tra nếu không có file
        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }
        // Chuyển đổi đường dẫn file từ \\ thành /
        const normalizedPath = '/' + req.file.path.replace(/\\/g, '/');
        // Tạo media mới
        const media = new Media({
            filename: req.file.filename,
            filepath: normalizedPath,
            owner,
            MediaType,
        });
        console.log(media)
        await media.save();
        res.status(201).json({ success: true, data: media });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.mediaDetails = async (req, res) => {
    try {
        const baseUrl = await getBaseURL(req);
        const { mediaId } = req.params;
        const media = await Media.findById(mediaId);
        if (media) {
            return res.status(200).json({
                _id: media._id,
                MediaType: media.MediaType,
                filepath: baseUrl + media.filepath
            });
        }
        return res.status(404).json({ message: 'media not found' });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
