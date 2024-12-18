const mongoose = require('mongoose');
const message = require('../models/message/message');

const getMessages = async (chatId) => {
    try {
        const messages = await message.find({ chat: chatId }).sort({ createdAt: -1 });
        return messages;
    } catch (error) {
        console.error('Error in getMessages:', error);
        throw error;
    }
};

module.exports = {
    getMessages
};
