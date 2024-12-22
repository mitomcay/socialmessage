const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người nhận thông báo
  type: { type: String, enum: ['message', 'friendRequest', 'like'] }, // Loại thông báo
  content: { type: String }, // Nội dung thông báo
  isRead: { type: Boolean, default: false }, // Trạng thái đã đọc
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
