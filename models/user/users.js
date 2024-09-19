const mongoose = require('mongoose');

// Định nghĩa schema cho User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    usernameUpdatedAt:{
        type: Date,
        default: Date.now,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    emailUpdatedAt:{
        type: Date,
        default: Date.now,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    salt:{
        type: String,
        require: true,
    },
    PasswordUpdatedAt:{
        type: Date,
        default: Date.now,
    },
    LastActiveAt:{
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    Isdeleted:{
        type: Boolean,
        require: true,
        default: false,
    },
    DeletedAt:{
        type: Date,
        default: Date.now,
    },
    IsDeactivated:{
        type: Boolean,
        require: true,
        default: false,
    },
    DeactivatedAt:{
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'moderator'], // Các giá trị có thể có của role
        default: 'user', // Giá trị mặc định
    },
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;
