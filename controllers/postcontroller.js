// models/post.js
const mongoose = require('mongoose');

// Định nghĩa schema cho Post
const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String, // URL hoặc đường dẫn đến ảnh
    required: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu tới model User
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu tới User
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', // Tham chiếu tới Comment
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Middleware để tự động cập nhật `updatedAt` trước khi lưu
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Tạo model từ schema và xuất nó
const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
