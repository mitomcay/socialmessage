// models/media.js
const mongoose = require('mongoose');

// Định nghĩa schema cho Media
const MediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'file'], // Các loại tệp đa phương tiện
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu tới model User
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Tạo model từ schema và xuất nó
const Media = mongoose.model('Media', MediaSchema);

module.exports = Media;
