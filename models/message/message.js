const mongoose = require('mongoose');

const  messageschema  = mongoose.Schema({
    content:{
        type: String,
        default: null,
    },
    senderId:{
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
    },
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat',
    },
    repliedmessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message',
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    },
});

const message = mongoose.model('message', messageschema );

module.exports = message;