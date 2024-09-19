const mongoose = require('mongoose');

const userfollowsschema = mongoose.Schema({
    CreatedAt:{
        type: Date,
        default: Date.now,
    },
    Sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    Accept:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

// Tạo model từ schema
const userfollows = mongoose.model('userfollows', userfollowsschemaema);

module.exports = userfollows;