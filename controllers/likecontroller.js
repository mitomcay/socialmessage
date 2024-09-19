// models/like.js
const mongoose = require('mongoose');

// Định nghĩa schema cho Like
const LikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu tới model User
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Tham chiếu tới model Post
    required: false,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', // Tham chiếu tới model Comment
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Tạo model từ schema và xuất nó
const Like = mongoose.model('Like', LikeSchema);

module.exports = Like;
