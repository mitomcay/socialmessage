const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Đảm bảo thư mục 'uploads' tồn tại
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Đặt tên file duy nhất
  }
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// Tạo middleware upload
const upload = multer({ storage, fileFilter });

// Xuất middleware upload để sử dụng trong routes
module.exports = upload;
