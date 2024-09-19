// models/group.js
const mongoose = require('mongoose');

// Định nghĩa schema cho Group
const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu tới model User
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu tới model User
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Tạo model từ schema và xuất nó
const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
