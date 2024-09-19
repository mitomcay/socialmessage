// models/activityLog.js
const mongoose = require('mongoose');

// Định nghĩa schema cho ActivityLog
const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu tới model User
    required: true,
  },
  action: {
    type: String,
    enum: ['post', 'like', 'comment', 'joinGroup', 'friendRequest', 'message', 'other'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu tới đối tượng liên quan như Post, Comment, Group, v.v.
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Tạo model từ schema và xuất nó
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = ActivityLog;
